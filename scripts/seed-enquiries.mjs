// Fills the LOCAL admin panel (.data/inquiries.json) with sample enquiries so /admin is not empty.
// Sample people and companies are fictional; no emails are sent. Local dev only — production
// reads from Redis and is never touched by this script.
//   node scripts/seed-enquiries.mjs          add the samples (keeps anything already there)
//   node scripts/seed-enquiries.mjs --reset  replace everything with just the samples
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), ".data", "inquiries.json");
const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();

const samples = [
  {
    hours: 2, status: "new", country: "IN",
    fullName: "Priya Sharma", contact: "+91 98200 12345", email: "priya.sharma@northwindbank.example", company: "Northwind Bank", budget: "$50k – $100k",
    message: "We're rebuilding our retail onboarding for 2027 and the current flow loses almost half of new customers at KYC.\n\nWe'd like a partner for research, a redesigned journey and a design system our in-house team can run with. Could we talk next week?",
  },
  {
    hours: 9, status: "new", country: "SG",
    fullName: "Daniel Tan", contact: "+65 8123 4567", email: "daniel.tan@harbourlogistics.example", company: "Harbour Logistics", budget: "$100k+",
    message: "Our dispatch teams work across four tools that don't talk to each other. We want one operations console designed and built, starting with a discovery sprint in January.",
  },
  {
    hours: 27, status: "new", country: "AE",
    fullName: "Aisha Rahman", contact: "", email: "aisha@lumenhealth.example", company: "Lumen Health", budget: "$25k – $50k",
    message: "We run 12 clinics and need a patient app for booking, reports and follow-ups. We have a rough brief and brand guidelines but no product team. Is this something you take on end to end?",
  },
  {
    hours: 52, status: "new", country: "US",
    fullName: "Marcus Lee", contact: "+1 415 555 0142", email: "marcus@fieldnote.example", company: "Fieldnote", budget: "Not sure yet",
    message: "Early-stage startup, just closed our seed round. We have a working prototype for an AI note-taker for site engineers and need help turning it into something people enjoy using. Open to your view on scope.",
  },
  {
    hours: 20, status: "flagged", country: "GB", reasons: ["sales-pitch phrasing: i came across your website"], spamScore: 2,
    fullName: "Oliver Grant", contact: "+44 20 7946 0321", email: "oliver.grant@brightpath.example", company: "Brightpath Education", budget: "$25k – $50k",
    message: "Hi, I came across your website while looking for studios with learning-product experience. We're planning a parent app for our schools and would like to understand how you work and what a first phase costs.",
  },
  {
    hours: 33, status: "spam", country: "", reasons: ["3 links in message", "spam keyword: buy backlinks, backlinks"], spamScore: 10,
    fullName: "Growth Team", contact: "", email: "sales@rank-boosters.example", company: "Rank Boosters", budget: "Not sure yet",
    message: "Buy backlinks and reach page one fast. Packages: http://rank-boosters.example/a http://rank-boosters.example/b http://rank-boosters.example/c Reply for pricing.",
  },
];

const rows = samples
  .map(({ hours, reasons = [], spamScore = 0, ...s }) => ({
    id: randomUUID(),
    createdAt: hoursAgo(hours),
    ...s,
    reasons,
    spamScore,
    notified: s.status === "new", // sample flag only — nothing was actually emailed
  }))
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

const reset = process.argv.includes("--reset");
let existing = [];
if (!reset && fs.existsSync(FILE)) existing = JSON.parse(fs.readFileSync(FILE, "utf8"));
const all = [...rows, ...existing].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
fs.mkdirSync(path.dirname(FILE), { recursive: true });
fs.writeFileSync(FILE, JSON.stringify(all, null, 2), { mode: 0o600 });
console.log(`${rows.length} sample enquiries written; ${all.length} total in ${path.relative(process.cwd(), FILE)}`);
