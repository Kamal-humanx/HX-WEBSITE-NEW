"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { PhilosophyIcon } from "./PhilosophyIcons";

/**
 * Homepage philosophy statement (Figma 5376:1804 "Philosophy — inline icons") with an "ink front"
 * reveal: the whole statement waits as a faint ghost; once it is a third of the way into view a soft
 * front sweeps through it letter by letter (one 2.4s pass, played once). Letters ink in (orange for
 * the keywords), each word rises a touch and sharpens out of a blur as the front passes, and each icon
 * fades in with a small, quiet settle when its keyword completes. Same family as the Careers reveals
 * (soft-edged front). Reduced motion (or no script) = the static text.
 * The icons are inline SVG (PhilosophyIcons.tsx): the moment each has inked in (.pr-live) it begins
 * a slow loop of its own on its inner parts — the root is this reveal's to move.
 */

type Kind = "build" | "cross" | "co" | "connects" | "bolt";
type Seg =
  | { t: string }
  | { o: string; icon: { kind: Kind; src: string; w: number; h: number; className?: string } }
  | { br: true };

/* Copy and icon sizes as in Figma 5376:1804. No space is written after an icon: the gap to the next
   word is the icon's own margin (globals.css, per icon, measured from the frame), since a space on
   top of it set the words too far apart. */
const SEGS: Seg[] = [
  { t: "It's a great time to " },
  { o: "build", icon: { kind: "build", src: "/images/icons/build.svg", w: 80, h: 48 } },
  { t: "new ideas," },
  { br: true },
  { t: " To shape " },
  { o: "new behaviours", icon: { kind: "cross", src: "/images/icons/cross.svg", w: 47, h: 47, className: "h-[0.6em]" } },
  { t: ", To tell a new story" },
  { br: true },
  { t: " You need a new kind of partner, a " },
  { o: "co-conspirator", icon: { kind: "co", src: "/images/icons/co-conspirator.svg", w: 92, h: 92, className: "h-[1em] align-[-0.2em]" } },
  { br: true },
  { t: " Who " },
  { o: "connects", icon: { kind: "connects", src: "/images/icons/connects.svg", w: 69, h: 56 } },
  { t: "the dots and " },
  { o: "makes it", icon: { kind: "bolt", src: "/images/icons/bolt.svg", w: 82, h: 82, className: "h-[1em] align-[-0.18em]" } },
  { t: "happen." },
];

/* the statement as plain text (screen readers): a space between segments, none before a comma */
const PLAIN = SEGS.map((s) => ("t" in s ? s.t : "o" in s ? s.o : " ")).join(" ").replace(/\s+/g, " ").replace(/ ,/g, ",").trim();

/* text → words (inline-block, so they can rise and sharpen) → letters (each inks on its own) */
function Words({ text, accent }: { text: string; accent?: boolean }) {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((p, i) =>
        /^\s+$/.test(p) || p === "" ? (
          p
        ) : (
          <span key={i} className="pr-w" data-accent={accent ? "" : undefined}>
            {Array.from(p).map((ch, j) => (
              <span key={j} className="pr-c">
                {ch}
              </span>
            ))}
          </span>
        ),
      )}
    </>
  );
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));

const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
/* gentle sine in-out: eases into motion and settles slowly, no rush in the middle */
const easeInOut = (t: number) => ((t = clamp(t)), (1 - Math.cos(Math.PI * t)) / 2);
/* one pass through the statement, start to finish */
const DURATION = 4200;

/* ghost → final colours (ink-soft #424142, accent-2 #F07412) */
const GHOST = [66, 65, 66, 0.14];
const INK = [66, 65, 66, 1];
const ORANGE = [240, 116, 18, 1]; // Figma philosophy highlights: #F07412
const mix = (a: number[], b: number[], t: number) =>
  `rgba(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)},${(a[3] + (b[3] - a[3]) * t).toFixed(3)})`;

/* every icon settles the same quiet way: a small rise, 90% → 100%, fading in — no spin, no bounce */
const iconMove = (e: number) => `translateY(${(0.14 * (1 - e)).toFixed(3)}em) scale(${(0.9 + 0.1 * e).toFixed(4)})`;

export function PhilosophyReveal({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const root = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* the front's timeline: every letter is one step; each icon takes a short pause of its own */
    type Item = { el: HTMLElement; at: number; accent: boolean; last: number };
    const chars: Item[] = [];
    const words: { el: HTMLElement; mid: number; last: number }[] = [];
    const icons: { el: HTMLElement; at: number; last: number }[] = [];
    let n = 0;
    const walk = (node: Element) => {
      for (const el of Array.from(node.children) as HTMLElement[]) {
        if (el.classList.contains("pr-w")) {
          const start = n;
          const accent = el.dataset.accent !== undefined;
          el.querySelectorAll<HTMLElement>(".pr-c").forEach((c) => chars.push({ el: c, at: n++, accent, last: -1 }));
          words.push({ el, mid: (start + n - 1) / 2, last: -1 });
          n += 1; // the space after a word
        } else if (el.classList.contains("pr-i")) {
          icons.push({ el, at: n, last: -1 });
          n += 4;
        } else walk(el);
      }
    };
    walk(root);
    const W = 22; // width of the soft front, in letters (wide = a soft, unhurried edge)
    const TOTAL = n + W * 1.5; // far enough that the last word and icon fully settle
    root.classList.add("pr-armed");

    const paint = (p: number) => {
      const F = p * TOTAL;
      for (const c of chars) {
        const v = Math.round(clamp((F - c.at) / W) * 100) / 100;
        if (v === c.last) continue;
        c.last = v;
        c.el.style.color = v >= 1 ? "" : mix(GHOST, c.accent ? ORANGE : INK, smooth(v));
      }
      for (const w of words) {
        const v = Math.round(smooth((F - w.mid + W * 0.25) / (W * 1.4)) * 100) / 100;
        if (v === w.last) continue;
        w.last = v;
        if (v >= 1) {
          w.el.style.transform = "";
          w.el.style.filter = "";
        } else {
          w.el.style.transform = `translateY(${(0.18 * (1 - v)).toFixed(3)}em)`;
          w.el.style.filter = v <= 0 ? "blur(5px)" : `blur(${(5 * (1 - v)).toFixed(2)}px)`;
        }
      }
      for (const ic of icons) {
        const raw = clamp((F - ic.at) / (W * 1.5));
        const v = Math.round(raw * 200) / 200;
        if (v === ic.last) continue;
        ic.last = v;
        if (v >= 1) {
          ic.el.style.transform = "";
          ic.el.style.opacity = "";
          ic.el.classList.add("pr-live");
        } else {
          const e = easeOut(v);
          ic.el.style.transform = iconMove(e);
          ic.el.style.opacity = e.toFixed(3);
        }
      }
    };

    /* plays once, on its own clock, when the statement is a third of the way into view */
    let raf = 0;
    const play = () => {
      let t0 = 0;
      const frame = (now: number) => {
        if (!t0) t0 = now;
        const t = (now - t0) / DURATION;
        paint(easeInOut(t));
        if (t < 1) raf = requestAnimationFrame(frame);
        else root.classList.remove("pr-armed");
      };
      raf = requestAnimationFrame(frame);
    };

    /* already scrolled past it (a reload mid-page): just show it finished */
    if (root.getBoundingClientRect().bottom < 0) {
      paint(1);
      root.classList.remove("pr-armed");
      return;
    }
    paint(0);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      root.classList.remove("pr-armed");
      icons.forEach((ic) => ic.el.classList.remove("pr-live"));
    };
  }, []);

  let k = 0;
  const out: ReactNode[] = [];
  for (const s of SEGS) {
    if ("br" in s) out.push(<br key={k++} className="hidden md:block" />);
    else if ("t" in s) out.push(<Words key={k++} text={s.t} />);
    else {
      const { kind, w, h, className: ic = "" } = s.icon;
      out.push(
        <span key={k++} className="pr-g" data-kind={kind}>
          <span className="text-accent-2">
            <Words text={s.o} accent />
          </span>
          <PhilosophyIcon kind={kind} w={w} h={h} className={ic} />
        </span>,
      );
    }
  }

  return (
    <p ref={ref} className={`pr ${className}`}>
      <span className="sr-only">{PLAIN}</span>
      <span aria-hidden="true">{out}</span>
    </p>
  );
}
