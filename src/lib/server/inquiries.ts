import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { hasRedis, redis } from "./kv";

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

/** Vercel's filesystem is read-only, so without Redis there is nowhere durable to write. */
export const storageMode: "redis" | "file" | "none" = hasRedis ? "redis" : process.env.VERCEL ? "none" : "file";

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
  if (storageMode === "none") throw new Error("No inquiry storage configured (set KV_REST_API_URL / KV_REST_API_TOKEN)");
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
