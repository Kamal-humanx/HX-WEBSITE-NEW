import type { CSSProperties } from "react";

/**
 * The philosophy statement's inline icons (Figma 5376:1804 "Philosophy — inline icons"), drawn
 * inline so their parts can move. Each keeps a slow, quiet loop of its own (globals.css, .pr-i .lp):
 * one brief move, then a long rest — on a period and phase of its own, so they never play together.
 *  - build: the solid cube slides over the wireframe one (the frame, built) and back
 *  - cross: a quarter turn — the X is four-fold symmetric, so the loop closes on itself
 *  - co-conspirator: the two circles trade places, the solid one passing in front, and trade back
 *  - connects: the line draws from the first dot to the last, each dot giving a nod as it's reached,
 *    then leaves the way it came
 *  - bolt: one quick strike upward, settled
 * The loops run on inner groups; the root (.pr-i) belongs to the reveal in PhilosophyReveal.tsx.
 */
export type IconKind = "build" | "cross" | "co" | "connects" | "bolt";
const O = "#F07412";

export function PhilosophyIcon({ kind, w, h, className = "" }: { kind: IconKind; w: number; h: number; className?: string }) {
  const common = {
    width: w,
    height: h,
    "data-kind": kind,
    "aria-hidden": true as const,
    focusable: "false" as const,
    className: `pr-i mx-[0.12em] inline-block h-[0.72em] w-auto align-[-0.08em] ${className}`,
  };
  switch (kind) {
    case "build":
      return (
        <svg viewBox="0 0 80 48" fill="none" {...common}>
          {/* the wireframe cube: visible edges solid, the two hidden edges dashed */}
          <g stroke={O} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M0.41 12.21 L20.42 0 L40.08 12.21 V35.6 L20.42 47.47 V24.07 L0.41 12.21 M20.42 24.07 L40.08 12.21" />
            <path d="M0.75 12.21 V34.92 L20.42 46.79" strokeDasharray="1.42 2.84" />
          </g>
          {/* the solid cube, which slides over the frame */}
          <path className="lp lp-cube" d="M39.74 12.21 L59.75 0 L79.41 12.21 V35.6 L59.75 47.47 L39.74 35.6 Z" fill={O} />
        </svg>
      );
    case "cross":
      return (
        <svg viewBox="0 0 47 47" fill="none" {...common}>
          <path className="lp lp-x" d="M32.4968 0.316111L24.2244 8.58442L24.2244 8.58442C23.8661 8.9425 23.687 9.12153 23.4642 9.12209C23.2414 9.12265 23.0614 8.94451 22.7014 8.58822L14.3381 0.312303C14.1823 0.158183 14.1045 0.0811227 14.0058 0.0405613C13.9072 0 13.7976 0 13.5785 0H1.40876C0.899677 0 0.645137 0 0.486986 0.158151C0.328836 0.316301 0.328836 0.570841 0.328836 1.07992V13.5211C0.328836 13.7418 0.328836 13.8522 0.369963 13.9515C0.411091 14.0507 0.489168 14.1288 0.64532 14.2849L0.645328 14.2849L9.00692 22.6423C9.36715 23.0023 9.54727 23.1824 9.54727 23.4061C9.54727 23.6298 9.36715 23.8099 9.00692 24.1699L0.316492 32.856C0.160334 33.0121 0.0822557 33.0901 0.0411278 33.1894C0 33.2886 0 33.399 0 33.6198V45.9201C0 46.4292 0 46.6837 0.158151 46.8419C0.316301 47 0.570841 47 1.07992 47H13.5753C13.796 47 13.9063 47 14.0055 46.9589C14.1047 46.9179 14.1827 46.8399 14.3387 46.6839L14.3388 46.6839L22.7248 38.302C23.0847 37.9423 23.2647 37.7624 23.4883 37.7624C23.7118 37.7624 23.8918 37.9423 24.2517 38.302L32.6378 46.6839C32.7938 46.8399 32.8718 46.9179 32.971 46.9589C33.0702 47 33.1805 47 33.4012 47H45.9201C46.4292 47 46.6837 47 46.8419 46.8419C47 46.6837 47 46.4292 47 45.9201V33.2911C47 33.0703 47 32.96 46.9589 32.8607C46.9178 32.7614 46.8397 32.6834 46.6835 32.5274L46.6835 32.5273L38.3219 24.1699C37.9617 23.8099 37.7816 23.6298 37.7816 23.4061C37.7816 23.1824 37.9617 23.0023 38.3219 22.6423L46.6835 14.2849C46.8397 14.1288 46.9177 14.0507 46.9589 13.9515C47 13.8522 47 13.7418 47 13.5211V1.07992C47 0.570841 47 0.316301 46.8419 0.158151C46.6837 0 46.4292 0 45.9201 0H33.2603C33.0396 0 32.9293 0 32.8301 0.0410762C32.7309 0.0821524 32.6529 0.160139 32.4968 0.316111Z" fill={O} />
        </svg>
      );
    case "co":
      return (
        <svg viewBox="0 0 91.6071 91.6071" fill="none" {...common}>
          <path className="lp lp-co-a" d="M56.1077 45.8028C56.1077 58.8727 45.5124 69.468 32.4425 69.468C19.3726 69.468 8.7773 58.8727 8.7773 45.8028C8.7773 32.7329 19.3726 22.1376 32.4425 22.1376C45.5124 22.1376 56.1077 32.7329 56.1077 45.8028Z" stroke={O} strokeWidth="2.71429" />
          <path className="lp lp-co-b" d="M59.1634 69.468C72.2334 69.468 82.8286 58.8727 82.8286 45.8028C82.8286 32.7329 72.2334 22.1376 59.1634 22.1376C46.0935 22.1376 35.4983 32.7329 35.4983 45.8028C35.4983 58.8727 46.0935 69.468 59.1634 69.468Z" fill={O} stroke={O} strokeWidth="2.71429" />
        </svg>
      );
    case "connects":
      return (
        <svg viewBox="0 0 69 56" fill="none" {...common}>
          <path className="lp lp-line" d="M54 43.5L10.4825 20.0675C9.71939 19.6566 9.80475 18.5356 10.6213 18.245L38 8.5" stroke={O} strokeWidth="3" strokeLinecap="round" />
          <circle className="lp lp-dot" style={{ "--k": 0 } as CSSProperties} cx="54.5" cy="41.5" r="14.5" fill={O} />
          <circle className="lp lp-dot" style={{ "--k": 0.15 } as CSSProperties} cx="42" cy="6" r="6" fill={O} />
          <circle className="lp lp-dot" style={{ "--k": 0.09 } as CSSProperties} cx="9.5" cy="18.5" r="9.5" fill={O} />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 82 82" fill="none" {...common}>
          <path className="lp lp-bolt" d="M46.125 6.83333L13.6667 46.125H37.5833L32.4583 75.1667L68.3333 35.875H44.4167L46.125 6.83333Z" fill={O} />
        </svg>
      );
  }
}
