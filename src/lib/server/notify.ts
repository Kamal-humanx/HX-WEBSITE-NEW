import "server-only";
import nodemailer from "nodemailer";
import { EMAIL_LOGO_CID, EMAIL_LOGO_PNG_BASE64 } from "./email-logo";
import { renderInquiryEmail } from "./inquiry-email";
import type { Inquiry } from "./inquiries";

export { inquiryFields } from "./inquiry-email";

export type NotifyResult = { sent: boolean; detail: string };

type Message = {
  from: { email: string; name: string };
  to: string[];
  replyTo: { email: string; name: string };
  subject: string;
  html: string;
  text: string;
};

/** Send through the studio's own mailbox (Google Workspace SMTP with an app password). */
async function sendViaSmtp(m: Message): Promise<void> {
  const port = Number(process.env.SMTP_PORT ?? 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
  try {
    await transport.sendMail({
      from: { name: m.from.name, address: m.from.email },
      to: m.to,
      replyTo: { name: m.replyTo.name, address: m.replyTo.email },
      subject: m.subject,
      html: m.html,
      text: m.text,
      // The logo rides along as an inline image, referenced from the HTML as cid:…
      attachments: [
        {
          filename: "humanx-logo.png",
          content: Buffer.from(EMAIL_LOGO_PNG_BASE64, "base64"),
          contentType: "image/png",
          cid: EMAIL_LOGO_CID,
          contentDisposition: "inline",
        },
      ],
    });
  } finally {
    transport.close();
  }
}

/** Send through Brevo's transactional API. */
async function sendViaBrevo(m: Message): Promise<void> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY!, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: m.from,
      to: m.to.map((email) => ({ email })),
      replyTo: m.replyTo,
      subject: m.subject,
      htmlContent: m.html,
      textContent: m.text,
      tags: ["project-enquiry"],
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`brevo ${res.status}`);
}

/**
 * Email the founders about a new inquiry.
 * Uses the studio's own SMTP mailbox when SMTP_USER / SMTP_PASSWORD are set, otherwise Brevo.
 */
export async function notifyFounders(inquiry: Inquiry): Promise<NotifyResult> {
  const smtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  const brevo = Boolean(process.env.BREVO_API_KEY);
  const senderEmail = process.env.MAIL_FROM_EMAIL || (smtp ? process.env.SMTP_USER : process.env.BREVO_SENDER_EMAIL) || "";
  const recipients = (process.env.NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if ((!smtp && !brevo) || !senderEmail || !recipients.length) return { sent: false, detail: "email not configured" };

  const { subject, html, text } = renderInquiryEmail(inquiry, smtp ? { logoSrc: `cid:${EMAIL_LOGO_CID}` } : {});

  const message: Message = {
    from: { email: senderEmail, name: process.env.MAIL_FROM_NAME || process.env.BREVO_SENDER_NAME || "HumanX Enquiries" },
    to: recipients,
    replyTo: { email: inquiry.email, name: inquiry.fullName.replace(/[\r\n\t]+/g, " ").trim().replace(/["<>]/g, "").slice(0, 70) },
    subject,
    html,
    text,
  };
  const via = smtp ? "smtp" : "brevo";

  if (process.env.EMAIL_DRY_RUN === "1") {
    console.info(`[notify] dry run — would email ${recipients.length} recipient(s) via ${via} for inquiry ${inquiry.id}`);
    return { sent: false, detail: "dry run" };
  }

  try {
    await (smtp ? sendViaSmtp(message) : sendViaBrevo(message));
    return { sent: true, detail: `sent via ${via}` };
  } catch (err) {
    const e = err as Error & { code?: string; responseCode?: number };
    console.error(`[notify] ${via} send failed for inquiry ${inquiry.id}: ${e.code ?? e.responseCode ?? e.message}`);
    return { sent: false, detail: `${via} failed` };
  }
}
