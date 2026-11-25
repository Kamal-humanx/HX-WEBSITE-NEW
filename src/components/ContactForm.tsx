"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CONTACT } from "@/content/contact";
import { validateContact, type ContactErrorCode, type ContactField } from "@/lib/contact-rules";

type Field = ContactField;
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "success" | "error";

const { form: F, messages: M } = CONTACT;
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  getResponse: (id: string) => string | undefined;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
const turnstile = () => (window as unknown as { turnstile?: Turnstile }).turnstile;

/** Turn the shared rule codes into the visible copy. */
function toMessages(codes: Partial<Record<Field, ContactErrorCode>>): Errors {
  const e: Errors = {};
  for (const [field, code] of Object.entries(codes) as [Field, ContactErrorCode][]) {
    if (field === "budget") e.budget = M.budget;
    else if (code === "required") e[field] = M.required;
    else if (code === "too_short") e[field] = M.tooShort;
    else if (code === "too_long") e[field] = M.tooLong;
    else e[field] = field === "email" ? M.email : field === "contact" ? M.phone : M.required;
  }
  return e;
}

function validate(data: FormData): Errors {
  const values = Object.fromEntries(Array.from(data.entries()).map(([k, v]) => [k, String(v)]));
  return toMessages(validateContact(values));
}

const SERVER_NOTICE: Record<string, string> = {
  too_fast: M.tooFast,
  rate_limited: M.rateLimited,
  bot_check: M.botCheck,
  stale_form: M.staleForm,
};

/** Underlined label/input pair — Figma "Variation A – Open underline" (5376:7788). */
function TextField({
  name,
  label,
  placeholder,
  error,
  type = "text",
  required,
  autoComplete,
  multiline,
}: {
  name: Field;
  label: string;
  placeholder: string;
  error?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  multiline?: boolean;
}) {
  const id = `cf-${name}`;
  const common = {
    id,
    name,
    placeholder,
    required,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
    className: `w-full border-b bg-transparent pb-3 pt-1.5 font-sans text-base font-normal leading-normal text-ink-form placeholder:font-normal placeholder:text-muted focus:outline-none focus-visible:outline-none ${
      error ? "border-[#c4321a]" : "border-[#d4d4d4] focus:border-ink"
    }`,
  };
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-ink-form">
        {label}
      </label>
      {multiline ? <textarea {...common} rows={1} className={`${common.className} resize-y max-sm:min-h-[72px]`} /> : <input {...common} type={type} />}
      {error && (
        <p id={`${id}-err`} className="text-xs text-[#c4321a]">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [notice, setNotice] = useState("");
  const formToken = useRef("");
  const widgetEl = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  /** Signed timing token: proves when this visitor loaded the form. */
  async function loadFormToken() {
    try {
      const res = await fetch("/api/contact/token", { cache: "no-store" });
      formToken.current = ((await res.json()) as { token?: string }).token ?? "";
    } catch {
      formToken.current = "";
    }
  }

  useEffect(() => {
    void loadFormToken();
  }, []);

  // Invisible bot check (Cloudflare Turnstile) — only shows itself if it needs interaction.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    const mount = () => {
      const t = turnstile();
      if (cancelled || !t || !widgetEl.current || widgetId.current) return;
      widgetId.current = t.render(widgetEl.current, { sitekey: TURNSTILE_SITE_KEY, appearance: "interaction-only", action: "contact" });
    };
    if (turnstile()) mount();
    else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = TURNSTILE_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", mount);
    }
    return () => {
      cancelled = true;
      if (widgetId.current) turnstile()?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  /** Wait briefly for the bot check to finish if the visitor submits very quickly. */
  async function turnstileToken(): Promise<string> {
    if (!TURNSTILE_SITE_KEY) return "";
    for (let i = 0; i < 40; i++) {
      const token = widgetId.current ? turnstile()?.getResponse(widgetId.current) : "";
      if (token) return token;
      await new Promise((r) => setTimeout(r, 250));
    }
    return "";
  }

  // No-JS fallback: the API redirects back with ?sent=1 / ?error=1
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("sent") === "1") setStatus("success");
    if (p.get("error") === "1") setStatus("error");
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const errs = validate(data);
    setErrors(errs);
    const first = Object.keys(errs)[0] as Field | undefined;
    if (first) {
      const el = formRef.current?.querySelector<HTMLElement>(first === "budget" ? 'input[name="budget"]' : `#cf-${first}`);
      el?.focus();
      return;
    }
    setStatus("sending");
    setNotice("");
    try {
      if (!formToken.current) await loadFormToken();
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(data), formToken: formToken.current, turnstileToken: await turnstileToken() }),
      });
      if (res.ok) {
        setStatus("success");
        formRef.current?.reset();
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string; errors?: Partial<Record<Field, ContactErrorCode>> };
        if (body.errors) setErrors(toMessages(body.errors));
        setNotice(SERVER_NOTICE[body.error ?? ""] ?? "");
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
    // Tokens are single-use: get fresh ones for the next attempt.
    void loadFormToken();
    if (widgetId.current) turnstile()?.reset(widgetId.current);
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  return (
    <form
      ref={formRef}
      action="/api/contact"
      method="post"
      noValidate
      onSubmit={onSubmit}
      aria-labelledby="contact-title"
      className="flex flex-col gap-[clamp(36px,3.65vw,70px)] rounded-[28px] bg-white py-[clamp(8px,1.9vw,36px)] lg:pl-[36px] lg:pr-[30px]"
    >
      <div className="flex flex-col gap-[clamp(36px,3.65vw,70px)] sm:flex-row sm:gap-7">
        <TextField name="fullName" label={F.fullName.label} placeholder={F.fullName.placeholder} error={errors.fullName} required autoComplete="name" />
        <TextField name="contact" label={F.contact.label} placeholder={F.contact.placeholder} error={errors.contact} type="tel" autoComplete="tel" />
      </div>
      <TextField name="email" label={F.email.label} placeholder={F.email.placeholder} error={errors.email} type="email" required autoComplete="email" />
      <TextField name="company" label={F.company.label} placeholder={F.company.placeholder} error={errors.company} required autoComplete="organization" />

      <fieldset aria-describedby={errors.budget ? "cf-budget-err" : undefined} className="flex flex-col gap-3">
        <legend className="mb-3 text-base font-medium text-ink-form">{F.budget.label}</legend>
        <div className="flex flex-wrap gap-2">
          {F.budget.options.map((opt, i) => (
            <label key={opt} className="relative">
              <input type="radio" name="budget" value={opt} defaultChecked={i === 0} required className="peer sr-only" />
              <span className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-[#d4d4d4] px-4 font-mono text-xs text-ink-form transition-colors hover:border-ink peer-checked:border-accent-2 peer-checked:bg-[#fff8ed] peer-checked:font-medium peer-checked:text-accent-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                {opt}
              </span>
            </label>
          ))}
        </div>
        {errors.budget && (
          <p id="cf-budget-err" className="text-xs text-[#c4321a]">
            {errors.budget}
          </p>
        )}
      </fieldset>

      <TextField name="message" label={F.message.label} placeholder={F.message.placeholder} error={errors.message} required multiline />

      {/* Honeypot (spam trap) */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {TURNSTILE_SITE_KEY && <div ref={widgetEl} className="empty:hidden" />}

      <div className="flex flex-col items-start gap-5">
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-pill min-w-[239px] whitespace-nowrap justify-center gap-4 py-2.5 pl-[18px] pr-4 text-sm disabled:opacity-70"
        >
          {status === "sending" ? M.sending : F.submit}
          <Image src="/images/icons/arrow-white.svg" alt="" width={8} height={8} />
        </button>
        <p className="font-mono text-2xs text-[#6b6b6b]">{F.note}</p>
        <p
          ref={statusRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className={`text-sm focus:outline-none ${status === "error" ? "text-[#c4321a]" : "text-[#1f7a3a]"}`}
        >
          {status === "success" ? M.success : status === "error" ? notice || M.error : ""}
        </p>
      </div>
    </form>
  );
}
