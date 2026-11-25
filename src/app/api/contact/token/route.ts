import { NextResponse } from "next/server";
import { issueFormToken } from "@/lib/server/tokens";

export const dynamic = "force-dynamic";

/** Issues the signed timing token the contact form must send back with its submission. */
export function GET() {
  return NextResponse.json({ token: issueFormToken() }, { headers: { "Cache-Control": "no-store" } });
}
