"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkCredentials, endSession, isAdmin, startSession } from "@/lib/server/auth";
import { listInquiries, updateInquiry } from "@/lib/server/inquiries";
import { incrWindow, peekWindow } from "@/lib/server/kv";
import { notifyFounders } from "@/lib/server/notify";
import { ipKey } from "@/lib/server/request";

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_SEC = 15 * 60;

export async function login(formData: FormData) {
  const key = `hx:rl:login:${ipKey(await headers())}`;
  if ((await peekWindow(key)) >= LOGIN_LIMIT) redirect("/admin?error=locked");

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(username, password)) {
    await incrWindow(key, LOGIN_WINDOW_SEC);
    redirect("/admin?error=invalid");
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}

export async function markSpam(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  await updateInquiry(String(formData.get("id") ?? ""), { status: "spam" });
  revalidatePath("/admin");
}

/** Clears a held inquiry; if the founders were never emailed about it, they are now. */
export async function markNotSpam(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = String(formData.get("id") ?? "");
  const current = (await listInquiries()).find((i) => i.id === id);
  if (!current) return;
  const updated = await updateInquiry(id, { status: "new" });
  if (updated && !updated.notified && (await notifyFounders(updated)).sent) {
    await updateInquiry(id, { notified: true });
  }
  revalidatePath("/admin");
}
