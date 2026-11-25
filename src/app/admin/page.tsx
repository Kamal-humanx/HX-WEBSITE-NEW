import type { Metadata } from "next";
import Link from "next/link";
import { adminConfigured, isAdmin } from "@/lib/server/auth";
import { listInquiries, storageMode, type Inquiry, type InquiryStatus } from "@/lib/server/inquiries";
import { inquiryFields } from "@/lib/server/notify";
import { login, logout, markNotSpam, markSpam } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

type Tab = "new" | "flagged" | "spam" | "all";
const TABS: { key: Tab; label: string }[] = [
  { key: "new", label: "Enquiries" },
  { key: "flagged", label: "Needs review" },
  { key: "spam", label: "Spam" },
  { key: "all", label: "All" },
];
const STATUS_LABEL: Record<InquiryStatus, string> = { new: "Enquiry", flagged: "Needs review", spam: "Spam" };
const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: "bg-[#e9f6ee] text-[#1f7a3a]",
  flagged: "bg-[#fff4e0] text-[#8a5300]",
  spam: "bg-[#fdecea] text-[#b3261e]",
};

const when = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const inputClass =
  "w-full rounded-lg border border-[#d4d4d4] bg-white px-3.5 py-3 text-base text-ink-form focus:border-ink focus:outline-none";

function Login({ error }: { error?: string }) {
  const configured = adminConfigured();
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-[#f6f5f3] px-4 py-16">
      <form action={login} className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <p className="font-mono text-2xs uppercase tracking-[0.16em] text-accent-ink">HumanX</p>
        <h1 className="mt-2 text-2xl font-medium tracking-[-0.02em] text-ink">Admin sign in</h1>

        {!configured && (
          <p role="alert" className="mt-5 rounded-lg bg-[#fff4e0] p-3 text-sm text-[#8a5300]">
            Admin access is not set up. Add <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD</code> (8+ characters) and{" "}
            <code>APP_SECRET</code> to the environment.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-[#fdecea] p-3 text-sm text-[#b3261e]">
            {error === "locked" ? "Too many attempts. Try again in 15 minutes." : "Incorrect username or password."}
          </p>
        )}

        <label htmlFor="username" className="mt-6 block text-sm font-medium text-ink-form">
          Username
        </label>
        <input id="username" name="username" type="text" autoComplete="username" required className={`mt-1.5 ${inputClass}`} />
        <label htmlFor="password" className="mt-4 block text-sm font-medium text-ink-form">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={`mt-1.5 ${inputClass}`} />

        <button type="submit" className="btn-pill mt-7 w-full justify-center py-3 text-sm">
          Sign in
        </button>
      </form>
    </main>
  );
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const fields = inquiryFields(inquiry);
  return (
    <li className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-medium tracking-[-0.02em] text-ink">{inquiry.fullName}</h2>
          <p className="mt-1 font-mono text-xs text-[#6b6b6b]">
            {when.format(new Date(inquiry.createdAt))} IST
            {inquiry.country ? ` · ${inquiry.country}` : ""}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 font-mono text-2xs font-medium ${STATUS_STYLE[inquiry.status]}`}>{STATUS_LABEL[inquiry.status]}</span>
      </div>

      <dl className="mt-5 grid gap-x-8 gap-y-4 border-t border-[#ececec] pt-5 sm:grid-cols-2">
        {fields.map((f, i) => {
          const isMessage = i === fields.length - 1;
          const isEmail = f.value === inquiry.email && i === 2;
          return (
            <div key={f.label} className={isMessage ? "sm:col-span-2" : undefined}>
              <dt className="font-mono text-2xs uppercase tracking-[0.12em] text-[#6b6b6b]">{f.label}</dt>
              <dd className="mt-1.5 whitespace-pre-wrap break-words text-base leading-[1.5] text-ink-form">
                {isEmail ? (
                  <a href={`mailto:${f.value}`} className="underline underline-offset-4">
                    {f.value}
                  </a>
                ) : (
                  f.value || <span className="text-muted">—</span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#ececec] pt-4">
        <p className="min-w-0 font-mono text-xs text-[#6b6b6b]">
          {inquiry.notified ? "Founders notified by email" : "Founders not emailed"}
          {inquiry.reasons.length > 0 && <> · Held because: {inquiry.reasons.join("; ")}</>}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {inquiry.status !== "spam" && (
            <a
              href={`mailto:${inquiry.email}?subject=${encodeURIComponent("Re: your note to HumanX")}`}
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 font-mono text-xs text-white transition-opacity hover:opacity-85"
            >
              Reply by email
            </a>
          )}
          {inquiry.contact && inquiry.status !== "spam" && (
            <a
              href={`tel:${inquiry.contact.replace(/[^\d+]/g, "")}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[#d4d4d4] px-4 font-mono text-xs text-ink-form transition-colors hover:border-ink"
            >
              Call
            </a>
          )}
          <form action={inquiry.status === "new" ? markSpam : markNotSpam}>
            <input type="hidden" name="id" value={inquiry.id} />
            <button type="submit" className="min-h-11 rounded-full border border-[#d4d4d4] px-4 font-mono text-xs text-ink-form transition-colors hover:border-ink">
              {inquiry.status === "new" ? "Mark as spam" : inquiry.notified ? "Not spam" : "Not spam — notify founders"}
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; error?: string }> }) {
  const params = await searchParams;
  if (!(await isAdmin())) return <Login error={params.error} />;

  let all: Inquiry[] = [];
  let loadError = false;
  try {
    all = await listInquiries();
  } catch {
    loadError = true;
  }
  const tab: Tab = TABS.some((t) => t.key === params.tab) ? (params.tab as Tab) : "new";
  const count = (key: Tab) => (key === "all" ? all.length : all.filter((i) => i.status === key).length);
  const shown = tab === "all" ? all : all.filter((i) => i.status === tab);

  return (
    <main id="main" className="min-h-screen bg-[#f6f5f3] pb-24">
      <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 py-8">
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.16em] text-accent-ink">HumanX admin</p>
            <h1 className="mt-1 text-3xl font-medium tracking-[-0.03em] text-ink">Project enquiries</h1>
          </div>
          <form action={logout}>
            <button type="submit" className="min-h-11 rounded-full border border-[#d4d4d4] bg-white px-5 font-mono text-xs text-ink-form hover:border-ink">
              Sign out
            </button>
          </form>
        </header>

        {storageMode === "none" && (
          <p role="alert" className="mb-6 rounded-xl bg-[#fdecea] p-4 text-sm text-[#b3261e]">
            Enquiry storage is not connected, so nothing can be listed here. Set <code>SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> on the Vercel project and redeploy.
          </p>
        )}
        {loadError && (
          <p role="alert" className="mb-6 rounded-xl bg-[#fdecea] p-4 text-sm text-[#b3261e]">
            Could not load enquiries from storage. Reload to try again.
          </p>
        )}

        <nav aria-label="Enquiry filters" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.key === "new" ? "/admin" : `/admin?tab=${t.key}`}
              aria-current={tab === t.key ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-mono text-xs transition-colors ${
                tab === t.key ? "border-ink bg-ink text-white" : "border-[#d4d4d4] bg-white text-ink-form hover:border-ink"
              }`}
            >
              {t.label}
              <span className={tab === t.key ? "text-white/70" : "text-[#6b6b6b]"}>{count(t.key)}</span>
            </Link>
          ))}
        </nav>

        {shown.length === 0 ? (
          <p className="mt-10 rounded-2xl bg-white p-10 text-center text-base text-[#6b6b6b]">
            {tab === "spam" ? "No spam caught yet." : tab === "flagged" ? "Nothing is waiting for review." : "No enquiries yet."}
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {shown.map((i) => (
              <InquiryCard key={i.id} inquiry={i} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
