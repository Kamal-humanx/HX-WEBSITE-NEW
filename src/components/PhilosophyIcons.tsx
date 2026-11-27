/**
 * The philosophy statement's inline icons (Figma 5376:1804 "Philosophy — inline icons"), drawn
 * inline so their parts can move. Each keeps a slow, quiet loop of its own (globals.css, .pr-i .lp),
 * begun the moment its keyword has inked in: one event per cycle, then a long rest — on a period
 * and phase of its own, so they never play together.
 *  - build: the solid cube is placed onto the wireframe one like a block (a dip, an arc, a landing
 *    squash), rests there, and is lifted back the same way
 *  - cross: re-marked by hand — one stroke draws, then the other; later they wipe and redraw
 *  - co-conspirator: the two circle each other — the outline over the top, the solid underneath —
 *    so they trade sides, and orbit back
 *  - connects: the dots go and spring back one by one — the first pops in, the line draws from it
 *    to where the second pops in, and on to the third
 *  - bolt: it gathers itself and darts right, back left and settles in the gap between its words,
 *    squashing and stretching as it goes — two fading ghosts trailing it
 * The boxes let their contents draw past their edges (nothing is cropped mid-move); the X keeps its
 * flat edges with a clip of its own.
 * The loops run on inner parts; the root (.pr-i) belongs to the reveal in PhilosophyReveal.tsx.
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
    className: `pr-i inline-block h-[0.72em] w-auto align-[-0.08em] ${className}`,
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
          {/* the solid cube, which is placed onto the frame */}
          <path className="lp lp-cube" d="M39.74 12.21 L59.75 0 L79.41 12.21 V35.6 L59.75 47.47 L39.74 35.6 Z" fill={O} />
        </svg>
      );
    case "cross":
      return (
        <svg viewBox="0 0 47 47" fill="none" {...common}>
          {/* the two strokes of the X (19.2 wide, as the Figma mark), each drawable on its own; the
              box clips their square ends, which gives the mark its flat edges */}
          <defs>
            <clipPath id="pr-x-clip">
              <rect width="47" height="47" />
            </clipPath>
          </defs>
          <g clipPath="url(#pr-x-clip)">
            <line className="lp lp-x1" x1="0" y1="0" x2="47" y2="47" stroke={O} strokeWidth="19.2" />
            <line className="lp lp-x2" x1="47" y1="0" x2="0" y2="47" stroke={O} strokeWidth="19.2" />
          </g>
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
          {/* in the order the line reaches them: the big dot, the left one, the small one */}
          <circle className="lp lp-dot-0" cx="54.5" cy="41.5" r="14.5" fill={O} />
          <circle className="lp lp-dot-2" cx="42" cy="6" r="6" fill={O} />
          <circle className="lp lp-dot-1" cx="9.5" cy="18.5" r="9.5" fill={O} />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 82 82" fill="none" {...common}>
          <g>
            {/* two ghosts run the same flick a beat behind the bolt, fading — its trail */}
            <path className="lp lp-zap lp-zap-2" d="M46.125 6.83333L13.6667 46.125H37.5833L32.4583 75.1667L68.3333 35.875H44.4167L46.125 6.83333Z" fill={O} />
            <path className="lp lp-zap lp-zap-1" d="M46.125 6.83333L13.6667 46.125H37.5833L32.4583 75.1667L68.3333 35.875H44.4167L46.125 6.83333Z" fill={O} />
            <path className="lp lp-zap" d="M46.125 6.83333L13.6667 46.125H37.5833L32.4583 75.1667L68.3333 35.875H44.4167L46.125 6.83333Z" fill={O} />
          </g>
        </svg>
      );
  }
}
