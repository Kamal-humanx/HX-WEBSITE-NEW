import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/auth";
import { SAMPLE_INQUIRY, renderInquiryEmail } from "@/lib/server/inquiry-email";

export const dynamic = "force-dynamic";

/** Admin-only preview of the "new inquiry" email, filled with sample data. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin", req.url), 303);
  return new NextResponse(renderInquiryEmail(SAMPLE_INQUIRY, { logoSrc: "/images/brand/logo-email.png" }).html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
