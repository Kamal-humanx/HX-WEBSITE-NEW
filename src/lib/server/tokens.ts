import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.APP_SECRET ?? "";
  if (s.length < 32) throw new Error("APP_SECRET is missing or shorter than 32 characters");
  return s;
}

export function sign(purpose: string, payload: string): string {
  return createHmac("sha256", secret()).update(`${purpose}:${payload}`).digest("base64url");
}

/** Constant-time string comparison (hashing first hides the length difference). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/* ---------- Contact-form timing token ----------
 * Issued when the form mounts; proves when the visitor loaded the form, so a submission
 * that arrives too quickly (or with no token at all) can be rejected. */

export const FORM_MIN_AGE_MS = 3_000;
export const FORM_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function issueFormToken(): string {
  const body = `${Date.now()}.${randomBytes(12).toString("base64url")}`;
  return `${body}.${sign("form", body)}`;
}

export type FormTokenResult = { ok: true; nonce: string } | { ok: false; reason: "missing" | "invalid" | "too_fast" | "expired" };

export function checkFormToken(token: string | undefined): FormTokenResult {
  if (!token) return { ok: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "invalid" };
  const [ts, nonce, sig] = parts;
  if (!safeEqual(sig, sign("form", `${ts}.${nonce}`))) return { ok: false, reason: "invalid" };
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0) return { ok: false, reason: "invalid" };
  if (age < FORM_MIN_AGE_MS) return { ok: false, reason: "too_fast" };
  if (age > FORM_MAX_AGE_MS) return { ok: false, reason: "expired" };
  return { ok: true, nonce };
}
