/**
 * Google Analytics 4 — helpers shared by the tag (components/Analytics.tsx) and by anything that
 * reports an event. The measurement ID is public by nature (it ships in the page), but it is only
 * set on the production deployment, so local and preview builds send nothing.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

type Gtag = (...args: unknown[]) => void;

/** Report an event. A no-op until the tag has loaded (no ID, consent not given, or an ad blocker). */
export function track(event: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", event, params);
}
