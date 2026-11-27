"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GA_ID, track } from "@/lib/analytics";

const STORE = "hx-analytics-consent";
type Choice = "granted" | "denied";

/**
 * Visitors in Europe (EU, EEA, UK, Switzerland) must agree before analytics cookies are set. The
 * device's time zone tells us, without a server lookup, whether to ask: every such country keeps
 * a "Europe/…" zone, plus the few Atlantic/Arctic ones below. Erring towards asking is harmless.
 */
function mustAsk(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    return /^(Europe\/|Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe)|Arctic\/Longyearbyen)/.test(tz);
  } catch {
    return true;
  }
}

function stored(): Choice | null {
  try {
    const v = localStorage.getItem(STORE);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Google Analytics 4, loaded only on the public site (never /admin) and only when allowed:
 * straight away outside Europe, after "Accept" inside it. Until then nothing is requested from
 * Google and no cookie is set. GA4's own enhanced measurement counts page views, including the
 * client-side navigations between pages, so there is no manual page_view here.
 *
 * It also reports the three actions worth knowing about, through one delegated listener so the
 * page components stay untouched: opening a case study, applying for a role, and tapping the
 * email address. (A sent contact form is reported by the form itself.)
 */
export function Analytics() {
  const pathname = usePathname();
  const [state, setState] = useState<"pending" | "ask" | Choice>("pending");

  useEffect(() => {
    setState(stored() ?? (mustAsk() ? "ask" : "granted"));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("/works/")) track("select_content", { content_type: "case_study", content_id: href.slice(7) });
      else if (href.startsWith("mailto:")) track("email_click");
    };
    const onApply = (e: Event) => track("apply_click", { role: String((e as CustomEvent<{ role?: string }>).detail?.role ?? "") });
    document.addEventListener("click", onClick, true);
    window.addEventListener("hx:apply", onApply);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hx:apply", onApply);
    };
  }, []);

  if (!GA_ID || pathname.startsWith("/admin")) return null;

  const choose = (choice: Choice) => {
    try {
      localStorage.setItem(STORE, choice);
    } catch {
      /* private mode: the choice simply lasts for this page */
    }
    setState(choice);
  };

  return (
    <>
      {state === "granted" ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      ) : null}
      {state === "ask" ? (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-[90] rounded-[20px] bg-night p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-[380px] sm:p-6"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          <p className="font-mono text-[14px] leading-[1.5] tracking-[-0.016em] text-white/80">
            We use analytics cookies to see how this site is used. Nothing is set unless you accept.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => choose("granted")}
              className="min-h-[44px] flex-1 cursor-pointer rounded-full bg-white px-5 font-mono text-[14px] tracking-[-0.016em] text-night transition-colors hover:bg-white/85"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => choose("denied")}
              className="min-h-[44px] flex-1 cursor-pointer rounded-full border border-white/30 px-5 font-mono text-[14px] tracking-[-0.016em] text-white transition-colors hover:border-white/70"
            >
              Decline
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
