/** Field rules shared by the contact form (client) and /api/contact (server). */

import { CONTACT } from "@/content/contact";

export type ContactField = "fullName" | "contact" | "email" | "company" | "budget" | "message";
export type ContactErrorCode = "required" | "invalid" | "too_short" | "too_long";

export const LIMITS = {
  fullName: { min: 2, max: 100 },
  contact: { min: 0, max: 25 },
  email: { min: 6, max: 254 },
  company: { min: 2, max: 200 },
  message: { min: 10, max: 5000 },
} as const;

const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$/i;
const PHONE_RE = /^[+()\d\s.\-]+$/;

export function validateContact(input: Record<string, string | undefined>): Partial<Record<ContactField, ContactErrorCode>> {
  const errors: Partial<Record<ContactField, ContactErrorCode>> = {};
  const v = (k: ContactField) => (input[k] ?? "").trim();

  for (const k of ["fullName", "email", "company", "message"] as const) {
    const value = v(k);
    if (!value) errors[k] = "required";
    else if (value.length < LIMITS[k].min) errors[k] = "too_short";
    else if (value.length > LIMITS[k].max) errors[k] = "too_long";
  }

  if (!errors.fullName && !/\p{L}/u.test(v("fullName"))) errors.fullName = "invalid";
  if (!errors.email && (!EMAIL_RE.test(v("email")) || v("email").includes(".."))) errors.email = "invalid";

  const phone = v("contact");
  if (phone) {
    const digits = phone.replace(/\D/g, "").length;
    if (phone.length > LIMITS.contact.max) errors.contact = "too_long";
    else if (!PHONE_RE.test(phone) || digits < 6 || digits > 15) errors.contact = "invalid";
  }

  const budget = v("budget");
  if (!budget) errors.budget = "required";
  else if (!CONTACT.form.budget.options.includes(budget)) errors.budget = "invalid";

  return errors;
}
