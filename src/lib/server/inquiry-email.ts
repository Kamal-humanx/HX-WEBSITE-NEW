import "server-only";
import { CONTACT } from "@/content/contact";
import { SITE_URL } from "@/lib/site";
import { EMAIL_LOGO_HEIGHT, EMAIL_LOGO_WIDTH } from "./email-logo";
import type { Inquiry } from "./inquiries";

/**
 * "New project enquiry" email sent to the founders.
 * Table layout + inline styles only, so it renders the same in Gmail, Apple Mail and Outlook.
 * Colours are the site tokens (accent #f36712, AA button #c4500a, ink #171717).
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const oneLine = (s: string) => s.replace(/[\r\n\t]+/g, " ").trim();
const label = (s: string) => s.replace(/\*\s*$/, "").trim();

/** The form's own labels, so the email and the admin panel read exactly like the form. */
export function inquiryFields(i: Inquiry): { label: string; value: string }[] {
  const F = CONTACT.form;
  return [
    { label: label(F.fullName.label), value: i.fullName },
    { label: label(F.contact.label), value: i.contact },
    { label: label(F.email.label), value: i.email },
    { label: label(F.company.label), value: i.company },
    { label: label(F.budget.label), value: i.budget },
    { label: label(F.message.label), value: i.message },
  ];
}

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
const LABEL = `font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:1.2px;text-transform:uppercase;color:#6b6b6b`;
const LINK = "color:#171717;text-decoration:underline;text-underline-offset:3px";

/** Where the header logo loads from when it is not attached inline (e.g. the Brevo fallback). */
export const HOSTED_LOGO_URL = `${SITE_URL}/images/brand/logo-email.png`;

export function renderInquiryEmail(
  inquiry: Inquiry,
  { logoSrc = HOSTED_LOGO_URL }: { logoSrc?: string } = {},
): { subject: string; html: string; text: string } {
  const [fullName, contact, email, company, budget, message] = inquiryFields(inquiry);
  const firstName = oneLine(inquiry.fullName).split(" ")[0] || "them";
  const received = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(inquiry.createdAt));
  const reference = inquiry.id.slice(0, 8).toUpperCase();
  // e.g. "New project enquiry: Priya Sharma, Northwind Bank · $50k – $100k"
  const subject = oneLine(`New project enquiry: ${inquiry.fullName}, ${inquiry.company} · ${inquiry.budget}`).slice(0, 180);
  const replyHref = `mailto:${encodeURIComponent(inquiry.email).replace(/%40/g, "@")}?subject=${encodeURIComponent("Re: your note to HumanX")}`;
  const phoneHref = `tel:${inquiry.contact.replace(/[^\d+]/g, "")}`;
  const preheader = oneLine(`${inquiry.budget} · ${inquiry.message}`).slice(0, 140);

  const row = (l: string, valueHtml: string, last = false) =>
    `<tr>` +
    `<td class="hx-k" width="168" valign="top" style="padding:14px 16px 14px 0;${last ? "" : "border-bottom:1px solid #ececec;"}${LABEL}">${esc(l)}</td>` +
    `<td class="hx-v" valign="top" style="padding:12px 0 14px;${last ? "" : "border-bottom:1px solid #ececec;"}font-family:${SANS};font-size:16px;line-height:24px;color:#171717;word-break:break-word">${valueHtml}</td>` +
    `</tr>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${esc(subject)}</title>
<style>
  @media (max-width:520px){
    .hx-pad{padding-left:22px!important;padding-right:22px!important}
    .hx-name{font-size:26px!important;line-height:32px!important}
    .hx-k,.hx-v{display:block!important;width:100%!important;box-sizing:border-box}
    .hx-k{padding:14px 0 2px!important;border-bottom:0!important}
    .hx-v{padding:0 0 14px!important}
    .hx-btn{display:block!important;text-align:center!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f6f5f3;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f6f5f3">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f5f3">
<tr><td align="center" style="padding:28px 12px 40px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">

    <tr><td class="hx-pad" style="background:#ffffff;border-radius:16px 16px 0 0;border-bottom:1px solid #ececec;padding:22px 36px 20px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="middle"><img src="${esc(logoSrc)}" width="${EMAIL_LOGO_WIDTH}" height="${EMAIL_LOGO_HEIGHT}" alt="HumanX — elevate the experience" style="display:block;border:0;outline:none;width:${EMAIL_LOGO_WIDTH}px;height:${EMAIL_LOGO_HEIGHT}px;font-family:${SANS};font-size:20px;font-weight:600;color:#171717"></td>
        <td align="right" valign="middle" style="font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:1.2px;text-transform:uppercase;color:#b84a08">New project enquiry</td>
      </tr></table>
    </td></tr>

    <tr><td class="hx-pad" style="background:#ffffff;padding:32px 36px 8px">
      <h1 class="hx-name" style="margin:0;font-family:${SANS};font-size:32px;line-height:38px;font-weight:500;letter-spacing:-1px;color:#171717">${esc(inquiry.fullName)}</h1>
      <p style="margin:6px 0 0;font-family:${SANS};font-size:17px;line-height:26px;color:#5a5a5a">${esc(inquiry.company)}</p>
    </td></tr>

    <tr><td class="hx-pad" style="background:#ffffff;padding:24px 36px 4px">
      <p style="margin:0 0 10px;${LABEL}">${esc(message.label)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="border-left:3px solid #f36712;padding:2px 0 2px 18px;font-family:${SANS};font-size:18px;line-height:29px;color:#171717;white-space:pre-wrap;word-break:break-word">${esc(inquiry.message)}</td>
      </tr></table>
    </td></tr>

    <tr><td class="hx-pad" style="background:#ffffff;padding:26px 36px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #ececec">
        ${row(fullName.label, esc(inquiry.fullName))}
        ${row(email.label, `<a href="mailto:${esc(inquiry.email)}" style="${LINK}">${esc(inquiry.email)}</a>`)}
        ${row(contact.label, inquiry.contact ? `<a href="${esc(phoneHref)}" style="${LINK}">${esc(inquiry.contact)}</a>` : `<span style="color:#9b9b9b">Not provided</span>`)}
        ${row(company.label, esc(inquiry.company))}
        ${row(budget.label, `<span style="display:inline-block;border:1px solid #f07412;background:#fff8ed;border-radius:999px;padding:3px 14px;font-family:${MONO};font-size:13px;line-height:20px;color:#b84a08">${esc(inquiry.budget)}</span>`, true)}
      </table>
    </td></tr>

    <tr><td class="hx-pad" style="background:#ffffff;padding:30px 36px 36px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="border-radius:999px;background:#c4500a">
          <a class="hx-btn" href="${esc(replyHref)}" style="display:inline-block;padding:13px 26px;font-family:${SANS};font-size:15px;line-height:20px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:999px">Reply to ${esc(firstName)} &rarr;</a>
        </td>
        <td style="padding-left:20px;font-family:${SANS};font-size:15px;line-height:20px">
          <a href="${SITE_URL}/admin" style="${LINK}">Open in admin</a>
        </td>
      </tr></table>
    </td></tr>

    <tr><td class="hx-pad" style="background:#ffffff;border-top:1px solid #ececec;border-radius:0 0 16px 16px;padding:18px 36px 22px;font-family:${MONO};font-size:12px;line-height:19px;color:#6b6b6b">
      Received ${esc(received)} IST${inquiry.country ? ` &middot; ${esc(inquiry.country)}` : ""} &middot; Ref ${esc(reference)}<br>
      Sent from the Contact page on humanx.io. Replying to this email goes straight to ${esc(firstName)}.
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  const text =
    `NEW PROJECT ENQUIRY\n\n` +
    [fullName, email, contact, company, budget].map((f) => `${f.label}: ${f.value || "Not provided"}`).join("\n") +
    `\n\n${message.label}\n${inquiry.message}\n\n` +
    `Received ${received} IST${inquiry.country ? ` · ${inquiry.country}` : ""} · Ref ${reference}\n` +
    `Reply to this email to answer ${firstName} directly.\nAdmin: ${SITE_URL}/admin`;

  return { subject, html, text };
}

/** Realistic sample used by the admin-only template preview. */
export const SAMPLE_INQUIRY: Inquiry = {
  id: "3f9a1c2e-0000-4000-8000-000000000000",
  createdAt: "2026-11-25T09:42:00.000Z",
  status: "new",
  fullName: "Priya Sharma",
  contact: "+91 98200 12345",
  email: "priya.sharma@northwindbank.com",
  company: "Northwind Bank",
  budget: CONTACT.form.budget.options[1],
  message:
    "We're rebuilding our retail onboarding for 2027 and the current flow loses almost half of new customers at KYC.\n\nWe'd like a partner for research, a redesigned journey and a design system our in-house team can run with. Could we talk next week?",
  reasons: [],
  spamScore: 0,
  country: "IN",
  notified: true,
};
