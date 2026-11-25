import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { hasRedis, redis } from "./kv";
import { hasSupabase, insertRow, selectRows, updateRows } from "./supabase";

export type InquiryStatus = "new" | "flagged" | "spam";

export type Inquiry = {
  id: string;
  createdAt: string; // ISO
  status: InquiryStatus;
  /** Form fields, exactly as submitted. */
  fullName: string;
  contact: string;
  email: string;
  company: string;
  budget: string;
  message: string;
  /** Why the content filter held it back (empty for clean inquiries). */
  reasons: string[];
  spamScore: number;
  country: string;
  /** Whether the founders were emailed about it. */
  notified: boolean;
};

const HASH = "hx:inquiries";
const INDEX = "hx:inquiries:index";
const FILE = path.join(process.cwd(), ".data", "inquiries.json");
const LIST_LIMIT = 500;

/**
 * Where enquiries live: Supabase (hx_inquiries table) when configured, else Upstash Redis, else a
 * local JSON file in development. Vercel's filesystem is read-only, so with neither service there
 * is nowhere durable to write.
 */
export const storageMode: "supabase" | "redis" | "file" | "none" = hasSupabase
  ? "supabase"
  : hasRedis
    ? "redis"
    : process.env.VERCEL
      ? "none"
      : "file";

/* ---------- Supabase rows (snake_case columns ↔ the Inquiry shape) ---------- */

const TABLE = "hx_inquiries";

type Row = {
  id: string;
  created_at: string;
  status: InquiryStatus;
  full_name: string;
  contact: string;
  email: string;
  company: string;
  budget: string;
  message: string;
  reasons: string[];
  spam_score: number;
  country: string;
  notified: boolean;
};

const toRow = (i: Inquiry): Row => ({
  id: i.id,
  created_at: i.createdAt,
  status: i.status,
  full_name: i.fullName,
  contact: i.contact,
  email: i.email,
  company: i.company,
  budget: i.budget,
  message: i.message,
  reasons: i.reasons,
  spam_score: i.spamScore,
  country: i.country,
  notified: i.notified,
});

const fromRow = (r: Row): Inquiry => ({
  id: r.id,
  createdAt: new Date(r.created_at).toISOString(),
  status: r.status,
  fullName: r.full_name,
  contact: r.contact,
  email: r.email,
  company: r.company,
  budget: r.budget,
  message: r.message,
  reasons: r.reasons ?? [],
  spamScore: r.spam_score,
  country: r.country,
  notified: r.notified,
});

/** Only the fields the admin panel is allowed to change. */
function toPatch(patch: Partial<Inquiry>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.notified !== undefined) out.notified = patch.notified;
  return out;
}

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/* ---------- file store (local dev) ---------- */

let queue: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function readFile(): Promise<Inquiry[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Inquiry[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeFile(all: Inquiry[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(all, null, 2), { mode: 0o600 });
  await fs.rename(tmp, FILE);
}

/* ---------- public API ---------- */

export async function saveInquiry(inquiry: Inquiry): Promise<void> {
  if (storageMode === "none") throw new Error("No inquiry storage configured (set SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  if (storageMode === "supabase") {
    await insertRow(TABLE, toRow(inquiry));
    return;
  }
  if (storageMode === "redis") {
    await redis("HSET", HASH, inquiry.id, JSON.stringify(inquiry));
    await redis("ZADD", INDEX, Date.parse(inquiry.createdAt), inquiry.id);
    return;
  }
  await locked(async () => writeFile([inquiry, ...(await readFile())]));
}

/** Newest first. */
export async function listInquiries(): Promise<Inquiry[]> {
  if (storageMode === "none") return [];
  if (storageMode === "supabase") {
    return (await selectRows<Row>(TABLE, `select=*&order=created_at.desc&limit=${LIST_LIMIT}`)).map(fromRow);
  }
  if (storageMode === "redis") {
    const ids = await redis<string[]>("ZRANGE", INDEX, 0, LIST_LIMIT - 1, "REV");
    if (!ids.length) return [];
    const rows = await redis<(string | null)[]>("HMGET", HASH, ...ids);
    return rows.filter((r): r is string => Boolean(r)).map((r) => JSON.parse(r) as Inquiry);
  }
  return (await readFile()).slice(0, LIST_LIMIT);
}

export async function updateInquiry(id: string, patch: Partial<Inquiry>): Promise<Inquiry | null> {
  if (storageMode === "none") return null;
  if (storageMode === "supabase") {
    if (!isUuid(id)) return null;
    const rows = await updateRows<Row>(TABLE, `id=eq.${id}`, toPatch(patch));
    return rows[0] ? fromRow(rows[0]) : null;
  }
  if (storageMode === "redis") {
    const raw = await redis<string | null>("HGET", HASH, id);
    if (!raw) return null;
    const next = { ...(JSON.parse(raw) as Inquiry), ...patch, id };
    await redis("HSET", HASH, id, JSON.stringify(next));
    return next;
  }
  return locked(async () => {
    const all = await readFile();
    const i = all.findIndex((x) => x.id === id);
    if (i < 0) return null;
    all[i] = { ...all[i], ...patch, id };
    await writeFile(all);
    return all[i];
  });
}
