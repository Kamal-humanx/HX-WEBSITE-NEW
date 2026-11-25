import "server-only";

/**
 * Minimal Supabase client for the server: plain fetch against the project's REST API with the
 * service-role key. That key bypasses Row Level Security, so it must never reach the browser —
 * this module is server-only and the variables are not NEXT_PUBLIC_.
 */

const BASE = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hasSupabase = Boolean(BASE && KEY);

async function call<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const { prefer, headers, ...rest } = init;
  const res = await fetch(`${BASE}/rest/v1/${path}`, {
    ...rest,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 200);
    throw new Error(`Supabase ${init.method ?? "GET"} ${path.split("?")[0]} failed: ${res.status} ${detail}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Call a Postgres function exposed through PostgREST. */
export function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  return call<T>(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) });
}

export function selectRows<T>(table: string, query: string): Promise<T[]> {
  return call<T[]>(`${table}?${query}`);
}

export function insertRow(table: string, row: Record<string, unknown>): Promise<null> {
  return call<null>(table, { method: "POST", body: JSON.stringify(row), prefer: "return=minimal" });
}

/** Update the rows matching `filter` and return them. */
export function updateRows<T>(table: string, filter: string, patch: Record<string, unknown>): Promise<T[]> {
  return call<T[]>(`${table}?${filter}`, { method: "PATCH", body: JSON.stringify(patch), prefer: "return=representation" });
}
