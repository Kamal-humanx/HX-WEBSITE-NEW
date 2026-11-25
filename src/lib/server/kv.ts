import "server-only";
import { hasSupabase, rpc } from "./supabase";

/**
 * Tiny key-value layer used for rate limits and one-time tokens.
 * Production: Supabase (the hx_kv table and its hx_* functions) when SUPABASE_URL is set, otherwise
 * Upstash Redis over REST if KV_REST_API_* is set.
 * Fallback: an in-process Map — fine for local dev, but per-instance only on serverless.
 */

const REDIS_URL = (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "").replace(/\/$/, "");
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

export const hasRedis = Boolean(REDIS_URL && REDIS_TOKEN);

export async function redis<T = unknown>(...command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { result?: T; error?: string };
  if (!res.ok || json.error) throw new Error(`Redis ${command[0]} failed: ${json.error ?? res.status}`);
  return json.result as T;
}

type Entry = { count: number; resetAt: number };
const g = globalThis as unknown as { __hxMem?: Map<string, Entry> };
const mem = (g.__hxMem ??= new Map<string, Entry>());

function memGet(key: string, now: number) {
  const e = mem.get(key);
  if (e && e.resetAt <= now) {
    mem.delete(key);
    return undefined;
  }
  return e;
}

function memSweep(now: number) {
  if (mem.size < 5000) return;
  for (const [k, e] of mem) if (e.resetAt <= now) mem.delete(k);
}

/** Increment a counter that expires `windowSec` after its first hit. Returns the new count. */
export async function incrWindow(key: string, windowSec: number): Promise<number> {
  if (hasSupabase) return rpc<number>("hx_incr_window", { p_key: key, p_window_sec: windowSec });
  if (hasRedis) {
    const n = await redis<number>("INCR", key);
    if (n === 1) await redis("EXPIRE", key, windowSec);
    return n;
  }
  const now = Date.now();
  memSweep(now);
  const e = memGet(key, now);
  if (e) return ++e.count;
  mem.set(key, { count: 1, resetAt: now + windowSec * 1000 });
  return 1;
}

/** Read a counter without incrementing it. */
export async function peekWindow(key: string): Promise<number> {
  if (hasSupabase) return rpc<number>("hx_peek_window", { p_key: key });
  if (hasRedis) return Number((await redis<string | null>("GET", key)) ?? 0);
  return memGet(key, Date.now())?.count ?? 0;
}

/** True the first time a key is claimed within `ttlSec`; false on any repeat. */
export async function claimOnce(key: string, ttlSec: number): Promise<boolean> {
  if (hasSupabase) return rpc<boolean>("hx_claim_once", { p_key: key, p_ttl_sec: Math.round(ttlSec) });
  if (hasRedis) return (await redis<string | null>("SET", key, "1", "NX", "EX", ttlSec)) === "OK";
  const now = Date.now();
  if (memGet(key, now)) return false;
  mem.set(key, { count: 1, resetAt: now + ttlSec * 1000 });
  return true;
}
