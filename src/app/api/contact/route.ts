import { randomUUID } from "node:crypto";
import { NextResponse, after } from "next/server";
import { validateContact } from "@/lib/contact-rules";
import { saveInquiry, updateInquiry, type Inquiry } from "@/lib/server/inquiries";
import { claimOnce, incrWindow, peekWindow } from "@/lib/server/kv";
import { notifyFounders } from "@/lib/server/notify";
import { clientCountry, clientIp, ipKey } from "@/lib/server/request";
import { analyzeContent } from "@/lib/server/spam";
import { FORM_MAX_AGE_MS, checkFormToken } from "@/lib/server/tokens";

export const dynamic = "force-dynamic";
/** Leaves room for the SMTP handshake, which can take several seconds. */
export const maxDuration = 30;

const MAX_BODY_BYTES = 20_000;
/** Accepted submissions per visitor per hour. */
const SUBMIT_LIMIT = 5;
/** Any POSTs per visitor per hour (stops hammering the endpoint). */
const ATTEMPT_LIMIT = 30;
const HOUR = 3600;

type Payload = Record<string, string>;

async function readBody(req: Request): Promise<{ data: Payload; isJson: boolean }> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const json = JSON.parse(await req.text()) as Record<string, unknown>;
    if (!json || typeof json !== "object" || Array.isArray(json)) throw new Error("bad body");
    return { data: Object.fromEntries(Object.entries(json).map(([k, v]) => [k, typeof v === "string" ? v : ""])), isJson: true };
  }
  const form = await req.formData();
  return { data: Object.fromEntries(Array.from(form.entries()).map(([k, v]) => [k, typeof v === "string" ? v : ""])), isJson: false };
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients are caught by the token + bot check
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function passesTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // bot check not configured
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const fail = (status: number, error: string, extra: object = {}) => NextResponse.json({ ok: false, error, ...extra }, { status });

  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return fail(413, "too_large");
  if (!sameOrigin(req)) return fail(403, "forbidden");

  const ip = clientIp(req.headers);
  const who = ipKey(req.headers);

  // Layer: rate limiting (all attempts)
  if ((await incrWindow(`hx:rl:attempt:${who}`, HOUR)) > ATTEMPT_LIMIT) return fail(429, "rate_limited");

  let parsed: { data: Payload; isJson: boolean };
  try {
    parsed = await readBody(req);
  } catch {
    return fail(400, "bad_request");
  }
  const { data, isJson } = parsed;
  const back = (q: string) => NextResponse.redirect(new URL(`/contact?${q}#contact-title`, req.url), 303);
  const ok = () => (isJson ? NextResponse.json({ ok: true }) : back("sent=1"));
  const reject = (status: number, error: string, extra: object = {}) => (isJson ? fail(status, error, extra) : back("error=1"));

  // Layer: honeypot — bots that fill the hidden field get a fake success and nothing is kept.
  if (data.website) return ok();

  // Layer: time check — signed token issued when the form loaded.
  const token = checkFormToken(data.formToken);
  if (!token.ok) return reject(token.reason === "too_fast" ? 425 : 400, token.reason === "too_fast" ? "too_fast" : "stale_form");

  // Layer: invisible bot check (Cloudflare Turnstile)
  if (!(await passesTurnstile(data.turnstileToken, ip))) return reject(403, "bot_check");

  // Layer: server-side validation
  const errors = validateContact(data);
  if (Object.keys(errors).length) return reject(422, "invalid", { errors });

  // Layer: rate limiting (accepted submissions)
  if ((await peekWindow(`hx:rl:submit:${who}`)) >= SUBMIT_LIMIT) return reject(429, "rate_limited");

  // Each form token works once, so a captured request cannot be replayed.
  if (!(await claimOnce(`hx:tok:${token.nonce}`, FORM_MAX_AGE_MS / 1000))) return reject(400, "stale_form");
  await incrWindow(`hx:rl:submit:${who}`, HOUR);

  const fields = {
    fullName: data.fullName.trim(),
    contact: (data.contact ?? "").trim(),
    email: data.email.trim().toLowerCase(),
    company: data.company.trim(),
    budget: data.budget.trim(),
    message: data.message.trim(),
  };

  // Layer: content filtering
  const spam = analyzeContent(fields);
  const inquiry: Inquiry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: spam.verdict === "clean" ? "new" : spam.verdict,
    ...fields,
    reasons: spam.reasons,
    spamScore: spam.score,
    country: clientCountry(req.headers),
    notified: false,
  };

  let stored = true;
  try {
    await saveInquiry(inquiry);
  } catch (err) {
    stored = false;
    console.error(`[contact] could not store inquiry ${inquiry.id}: ${(err as Error).message}`);
  }

  // Only clean inquiries reach the founders' inboxes; flagged and spam wait in /admin.
  if (inquiry.status === "new") {
    if (stored) {
      // The enquiry is safe in storage, so answer the visitor now and send the email afterwards
      // (the SMTP handshake alone takes several seconds). `after` keeps the function alive on
      // Vercel until the send finishes.
      after(async () => {
        const { sent } = await notifyFounders(inquiry);
        if (sent) await updateInquiry(inquiry.id, { notified: true }).catch(() => undefined);
      });
    } else {
      // Storage failed: the email is now the only copy, so wait for it. If that fails too the
      // enquiry is lost — tell the visitor to retry.
      const { sent } = await notifyFounders(inquiry);
      if (!sent && process.env.EMAIL_DRY_RUN !== "1") return reject(500, "server_error");
    }
  }

  return ok();
}
