import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUDGETS = ["$25k – $50k", "$50k – $100k", "$100k+", "Not sure yet"];
const MAX = { fullName: 200, contact: 50, email: 254, company: 200, message: 5000 };

type Payload = Record<string, string>;

async function readBody(req: Request): Promise<{ data: Payload; isJson: boolean }> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const json = (await req.json()) as Record<string, unknown>;
    return { data: Object.fromEntries(Object.entries(json).map(([k, v]) => [k, String(v ?? "")])), isJson: true };
  }
  const form = await req.formData();
  return { data: Object.fromEntries(Array.from(form.entries()).map(([k, v]) => [k, String(v)])), isJson: false };
}

function validate(d: Payload) {
  const errors: Record<string, string> = {};
  const v = (k: string) => (d[k] ?? "").trim();
  if (!v("fullName")) errors.fullName = "required";
  if (!EMAIL_RE.test(v("email"))) errors.email = "invalid";
  if (!v("company")) errors.company = "required";
  if (!BUDGETS.includes(v("budget"))) errors.budget = "invalid";
  if (!v("message")) errors.message = "required";
  for (const [k, max] of Object.entries(MAX)) if (v(k).length > max) errors[k] = "too_long";
  return errors;
}

export async function POST(req: Request) {
  let parsed: { data: Payload; isJson: boolean };
  try {
    parsed = await readBody(req);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const { data, isJson } = parsed;
  const back = (q: string) => NextResponse.redirect(new URL(`/contact?${q}#contact-title`, req.url), 303);

  // Honeypot: pretend success for bots.
  if (data.website) return isJson ? NextResponse.json({ ok: true }) : back("sent=1");

  const errors = validate(data);
  if (Object.keys(errors).length) {
    return isJson ? NextResponse.json({ ok: false, errors }, { status: 422 }) : back("error=1");
  }

  // TODO(integration): deliver the lead to the email/CRM provider (e.g. Resend, Postmark, HubSpot).
  // Keep secrets in env vars (e.g. CONTACT_PROVIDER_API_KEY) and never log personal data.
  // await sendLead({ fullName, contact, email, company, budget, message });

  return isJson ? NextResponse.json({ ok: true }) : back("sent=1");
}
