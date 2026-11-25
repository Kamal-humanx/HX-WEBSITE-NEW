"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Homepage philosophy statement (Figma 5376:1804 "Philosophy — inline icons") with an "ink front"
 * reveal: the whole statement waits as a faint ghost; once it is a third of the way into view a soft
 * front sweeps through it letter by letter (one 2.4s pass, played once). Letters ink in (orange for
 * the keywords), each word rises a touch and sharpens out of a blur as the front passes.
 *
 * Each icon travels with its own keyword: the moment the front reaches a keyword and it starts to
 * turn orange, that keyword's icon takes off and flies into the gap beside it — each from its own
 * direction and with its own character (the cube tumbles down, the X spins in, the two circles
 * squash on landing, the share mark swings up, the bolt strikes) — overshoots, settles, and gives the
 * keyword a small hop as it lands. So the icons arrive line by line with the text, not after it.
 * Afterwards, hovering a keyword makes its icon hop again.
 * Same family as the Careers reveals (soft-edged front). Reduced motion (or no script) = the static text.
 */

type Kind = "build" | "cross" | "co" | "connects" | "bolt";
type Seg =
  | { t: string }
  | { o: string; icon: { kind: Kind; src: string; w: number; h: number; className?: string } }
  | { br: true };

/* Copy and icon sizes exactly as in the static version of this block */
const SEGS: Seg[] = [
  { t: "It's a great time to " },
  { o: "build", icon: { kind: "build", src: "/images/icons/build.svg", w: 80, h: 48 } },
  { t: " new ideas," },
  { br: true },
  { t: " To shape " },
  { o: "new behaviours", icon: { kind: "cross", src: "/images/icons/cross.svg", w: 47, h: 47, className: "h-[0.6em]" } },
  { t: " , To tell a new story" },
  { br: true },
  { t: " You need a new kind of partner, a " },
  { o: "co-conspirator", icon: { kind: "co", src: "/images/icons/co-conspirator.svg", w: 92, h: 92, className: "h-[1em] align-[-0.2em]" } },
  { br: true },
  { t: " Who " },
  { o: "connects", icon: { kind: "connects", src: "/images/icons/connects.svg", w: 69, h: 56 } },
  { t: " the dots and " },
  { o: "makes it", icon: { kind: "bolt", src: "/images/icons/bolt.svg", w: 82, h: 82, className: "h-[1em] align-[-0.18em]" } },
  { t: " happen." },
];

const PLAIN = SEGS.map((s) => ("t" in s ? s.t : "o" in s ? s.o : " ")).join("").replace(/\s+/g, " ").trim();

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

/* ---------- icon fly-ins ----------
   Offsets are in em, so each flight scales with the type size. Every icon starts small, blurred and
   transparent well away from its slot, overshoots it, and settles. */
const FLIGHT_MS = 1450; // unhurried enough to follow each icon in, without dragging
/* An icon takes off when the front is this many letters short of the end of its keyword — early
   enough that it lands just as the keyword finishes turning orange. */
const LEAD_LETTERS = 8;
const FLIGHT_EASE = "cubic-bezier(0.3, 0.7, 0.2, 1)";
const far = (transform: string): Keyframe => ({ opacity: 0, filter: "blur(4px)", transform, offset: 0 });
const FLIGHTS: Record<Kind, Keyframe[]> = {
  /* the cube tumbles down from the upper left and rocks to rest */
  build: [
    far("translate(-1.7em, -2.5em) rotate(-220deg) scale(0.35)"),
    { opacity: 1, filter: "blur(1px)", offset: 0.3 },
    { filter: "blur(0px)", transform: "translate(0.12em, 0.1em) rotate(14deg) scale(1.14)", offset: 0.62 },
    { transform: "translate(-0.03em, -0.05em) rotate(-5deg) scale(0.97)", offset: 0.82 },
    { opacity: 1, filter: "blur(0px)", transform: "none", offset: 1 },
  ],
  /* the X spins in from the right like a thrown blade and snaps square */
  cross: [
    far("translate(2.7em, -1.3em) rotate(540deg) scale(0.3)"),
    { opacity: 1, filter: "blur(1px)", offset: 0.3 },
    { filter: "blur(0px)", transform: "translate(-0.09em, 0.04em) rotate(-20deg) scale(1.16)", offset: 0.62 },
    { transform: "rotate(7deg) scale(0.96)", offset: 0.82 },
    { opacity: 1, filter: "blur(0px)", transform: "none", offset: 1 },
  ],
  /* the two circles slide in low from the left and squash together on arrival */
  co: [
    far("translate(-2.9em, 1.5em) rotate(-90deg) scale(0.3)"),
    { opacity: 1, filter: "blur(1px)", offset: 0.3 },
    { filter: "blur(0px)", transform: "translate(0.1em, 0) scale(1.28, 0.82)", offset: 0.6 },
    { transform: "translate(-0.03em, 0) scale(0.93, 1.08)", offset: 0.8 },
    { opacity: 1, filter: "blur(0px)", transform: "none", offset: 1 },
  ],
  /* the share mark swings up from below, like a pendulum finding its centre */
  connects: [
    far("translate(1.2em, 2.7em) rotate(160deg) scale(0.4)"),
    { opacity: 1, filter: "blur(1px)", offset: 0.3 },
    { filter: "blur(0px)", transform: "translate(-0.05em, -0.15em) rotate(-16deg) scale(1.12)", offset: 0.6 },
    { transform: "translate(0.02em, 0.03em) rotate(8deg) scale(0.98)", offset: 0.8 },
    { opacity: 1, filter: "blur(0px)", transform: "none", offset: 1 },
  ],
  /* the bolt strikes straight down, flashes on impact and springs back */
  bolt: [
    far("translate(0.9em, -3.3em) rotate(24deg) scale(0.5)"),
    { opacity: 1, filter: "blur(1px) brightness(1)", offset: 0.22 },
    { filter: "blur(0px) brightness(1.9)", transform: "translate(0, 0.15em) scale(1.28, 0.78)", offset: 0.46 },
    { filter: "blur(0px) brightness(1.2)", transform: "translate(0, -0.11em) scale(0.9, 1.14)", offset: 0.66 },
    { transform: "scale(1.05, 0.97)", offset: 0.84 },
    { opacity: 1, filter: "blur(0px) brightness(1)", transform: "none", offset: 1 },
  ],
};
/* the keyword answers its icon's landing with a small hop */
const WORD_HOP: Keyframe[] = [{ transform: "none" }, { transform: "translateY(-0.09em)", offset: 0.4 }, { transform: "none" }];

export function PhilosophyReveal({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const root = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* the front's timeline: every letter is one step; each icon takes a short pause of its own */
    type Item = { el: HTMLElement; at: number; accent: boolean; last: number };
    const chars: Item[] = [];
    const words: { el: HTMLElement; mid: number; last: number }[] = [];
    const icons: { el: HTMLElement; at: number; launched: boolean }[] = [];
    const anims: Animation[] = [];
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
          icons.push({ el, at: n, launched: false });
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
      for (const ic of icons) if (!ic.launched && started && F >= ic.at - LEAD_LETTERS) launchIcon(ic);
    };
    let started = false; // false while the statement is still waiting off screen as a ghost

    /* each icon waits out of sight until the front reaches its keyword, then flies in */
    const hideIcons = () => icons.forEach((ic) => (ic.el.style.opacity = "0"));
    const showIcons = () => icons.forEach((ic) => (ic.el.style.opacity = ""));
    const launchIcon = (ic: (typeof icons)[number]) => {
      ic.launched = true;
      const kind = (ic.el.dataset.kind ?? "build") as Kind;
      const flight = ic.el.animate(FLIGHTS[kind], { duration: FLIGHT_MS, easing: FLIGHT_EASE });
      ic.el.style.opacity = "";
      anims.push(flight);
      const words = Array.from(ic.el.closest(".pr-g")?.querySelectorAll<HTMLElement>(".pr-w") ?? []);
      words.forEach((w, j) =>
        anims.push(w.animate(WORD_HOP, { duration: 560, delay: FLIGHT_MS * 0.55 + j * 40, easing: "cubic-bezier(0.3, 0, 0.3, 1)" })),
      );
      if (ic === icons[icons.length - 1]) flight.finished.then(() => root.classList.add("pr-live")).catch(() => undefined);
    };

    /* plays once, on its own clock, when the statement is a third of the way into view */
    let raf = 0;
    const play = () => {
      let t0 = 0;
      const frame = (now: number) => {
        if (!t0) t0 = now;
        const t = (now - t0) / DURATION;
        started = true;
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
      root.classList.add("pr-live");
      return;
    }
    paint(0);
    hideIcons();
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
      anims.forEach((a) => a.cancel());
      showIcons();
      root.classList.remove("pr-armed", "pr-live");
    };
  }, []);

  let k = 0;
  const out: ReactNode[] = [];
  for (const s of SEGS) {
    if ("br" in s) out.push(<br key={k++} className="hidden md:block" />);
    else if ("t" in s) out.push(<Words key={k++} text={s.t} />);
    else {
      const { kind, src, w, h, className: ic = "" } = s.icon;
      out.push(
        <span key={k++} className="pr-g" data-kind={kind}>
          <span className="text-accent-2">
            <Words text={s.o} accent />
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            width={w}
            height={h}
            data-kind={kind}
            className={`pr-i mx-[0.12em] inline-block h-[0.72em] w-auto align-[-0.08em] ${ic}`}
          />
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
