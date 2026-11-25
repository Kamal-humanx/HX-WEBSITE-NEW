import "server-only";
import { cookies } from "next/headers";
import { safeEqual, sha256, sign } from "./tokens";

const COOKIE = "hx_admin";
const MAX_AGE_SEC = 12 * 60 * 60;

function credentials() {
  const username = process.env.ADMIN_USERNAME ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  return { username, password, configured: Boolean(username && password.length >= 8) };
}

export const adminConfigured = () => credentials().configured;

/** The signed payload includes a credential fingerprint, so changing the password ends every session. */
function sessionSignature(expires: string) {
  const { username, password } = credentials();
  return sign("admin-session", `${expires}.${sha256(`${username}:${password}`)}`);
}

export function checkCredentials(username: string, password: string): boolean {
  const c = credentials();
  if (!c.configured) return false;
  // Evaluate both so timing does not reveal which half was wrong.
  const u = safeEqual(username, c.username);
  const p = safeEqual(password, c.password);
  return u && p;
}

export async function startSession() {
  const expires = String(Date.now() + MAX_AGE_SEC * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sessionSignature(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: MAX_AGE_SEC,
  });
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, path: "/admin", maxAge: 0 });
}

export async function isAdmin(): Promise<boolean> {
  if (!credentials().configured) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const dot = value.indexOf(".");
  if (dot < 1) return false;
  const expires = value.slice(0, dot);
  if (!(Number(expires) > Date.now())) return false;
  return safeEqual(value.slice(dot + 1), sessionSignature(expires));
}
