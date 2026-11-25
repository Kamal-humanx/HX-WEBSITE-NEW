import "server-only";
import { sha256 } from "./tokens";

type HeaderBag = { get(name: string): string | null };

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(h: HeaderBag): string {
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** IPs are only ever stored hashed. */
export function ipKey(h: HeaderBag): string {
  return sha256(`ip:${clientIp(h)}`).slice(0, 32);
}

export function clientCountry(h: HeaderBag): string {
  return (h.get("x-vercel-ip-country") ?? "").slice(0, 2).toUpperCase();
}
