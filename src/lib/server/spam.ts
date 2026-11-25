import "server-only";

/**
 * Content filter for contact-form submissions.
 *   spam    → stored in the admin Spam tab, never emailed.
 *   flagged → stored under Needs review, not emailed until an admin clears it.
 *   clean   → stored and emailed to the founders.
 */

export type Verdict = "clean" | "flagged" | "spam";
export type SpamResult = { verdict: Verdict; score: number; reasons: string[] };

const SPAM_AT = 5;
const FLAG_AT = 2;

const URL_RE = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const SHORTENER_RE = /\b(?:bit\.ly|tinyurl\.com|t\.co|t\.me|goo\.gl|cutt\.ly|is\.gd|rb\.gy|shorturl\.at|wa\.me)\b/i;
const MARKUP_RE = /\[url[=\]]|<a\s+href|\[link[=\]]|<\/?(?:script|iframe)\b/i;

/** Unambiguous junk — one hit is enough. */
const HARD = [
  "viagra", "cialis", "porn", "xxx", "casino", "escort", "adult dating", "sex dating", "payday loan",
  "buy followers", "buy backlinks", "backlinks", "guest post", "link building", "link exchange",
  "make money fast", "earn money online", "replica watches", "weight loss pills", "free gift card",
  "crypto giveaway", "binary options", "sugar daddy",
];

/** Typical cold-pitch phrasing — a real client might use one, so these only add up. */
const SOFT = [
  "seo services", "seo expert", "seo agency", "first page of google", "rank your website", "ranking on google",
  "increase your traffic", "boost your traffic", "website traffic", "website redesign services", "web development services",
  "app development company", "outsourcing", "offshore team", "dedicated developers", "virtual assistant", "data entry",
  "lead generation services", "email list", "unsubscribe", "opt out", "forex", "bitcoin", "crypto investment",
  "investment opportunity", "whatsapp me", "telegram", "dear sir", "dear madam", "to whom it may concern",
  "i came across your website", "i visited your website", "affordable price", "at a low cost", "free audit", "free quote",
];

const isMostlyLatin = (s: string) => {
  const letters = s.match(/\p{L}/gu) ?? [];
  if (!letters.length) return true;
  const latin = letters.filter((c) => /[a-z]/i.test(c)).length;
  return latin / letters.length > 0.7;
};

/** Random-looking single word, e.g. "xKjQwPzTb" or "sdfghjkl". */
function looksRandomWord(word: string): boolean {
  const w = word.replace(/[^a-z]/gi, "");
  if (w.length < 7) return false;
  const vowels = (w.match(/[aeiouy]/gi) ?? []).length;
  if (vowels / w.length < 0.15) return true;
  if (/[^aeiouy]{7,}/i.test(w)) return true;
  // camel noise: several lower→upper switches inside one word
  const switches = (w.match(/[a-z][A-Z]/g) ?? []).length;
  return switches >= 3;
}

function gibberishScore(text: string, kind: "short" | "long"): { score: number; reason?: string } {
  if (!isMostlyLatin(text)) return { score: 0 };
  const stripped = text.replace(URL_RE, " ");
  const words = stripped.split(/\s+/).filter(Boolean);
  if (/(\S)\1{6,}/.test(stripped)) return { score: 3, reason: "repeated characters" };
  if (kind === "short") {
    return words.length > 0 && words.every(looksRandomWord) ? { score: 3, reason: "random-looking text" } : { score: 0 };
  }
  const random = words.filter(looksRandomWord).length;
  if (words.length <= 3 && random === words.length && words.length > 0) return { score: 4, reason: "gibberish message" };
  if (words.length > 3 && random / words.length > 0.4) return { score: 4, reason: "gibberish message" };
  if (words.some((w) => w.length > 45)) return { score: 2, reason: "unbroken long token" };
  return { score: 0 };
}

export function analyzeContent(input: { fullName: string; company: string; email: string; message: string }): SpamResult {
  const reasons: string[] = [];
  let score = 0;
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(reason);
  };

  const message = input.message;
  const all = `${input.fullName}\n${input.company}\n${message}`.toLowerCase();

  const links = message.match(URL_RE) ?? [];
  if (links.length >= 3) add(5, `${links.length} links in message`);
  else if (links.length === 2) add(2, "2 links in message");

  if (URL_RE.test(input.fullName)) add(5, "link in name field");
  URL_RE.lastIndex = 0;
  if (SHORTENER_RE.test(all)) add(3, "link shortener / messaging link");
  if (MARKUP_RE.test(all)) add(5, "HTML or BBCode markup");

  const hard = HARD.filter((k) => all.includes(k));
  if (hard.length) add(5, `spam keyword: ${hard.slice(0, 3).join(", ")}`);

  const soft = SOFT.filter((k) => all.includes(k));
  if (soft.length) add(Math.min(soft.length * 2, 6), `sales-pitch phrasing: ${soft.slice(0, 3).join(", ")}`);

  for (const [label, value] of [["name", input.fullName], ["company", input.company]] as const) {
    const g = gibberishScore(value, "short");
    if (g.score) add(g.score, `${g.reason} in ${label}`);
  }
  const gm = gibberishScore(message, "long");
  if (gm.score) add(gm.score, gm.reason!);

  const msg = message.trim().toLowerCase();
  if (msg === input.fullName.trim().toLowerCase() || msg === input.company.trim().toLowerCase()) add(2, "message repeats another field");

  const verdict: Verdict = score >= SPAM_AT ? "spam" : score >= FLAG_AT ? "flagged" : "clean";
  return { verdict, score, reasons };
}
