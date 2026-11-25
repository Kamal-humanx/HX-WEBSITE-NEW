"use client";

import { useEffect, useRef } from "react";

/**
 * Footer cursor trail (after the reference recording): the footer is an invisible grid; as the
 * cursor enters a new cell, a HumanX "X" appears there — one of the four marks from Figma
 * "X’s for the footer" (5654:9985), at a random quarter-turn — fading and scaling in. Each holds a
 * moment, then fades away, so the trail dissolves behind the cursor. Fast moves fill the cells in
 * between so the trail stays continuous. Off with reduced motion.
 *
 * Touch screens get the same trail under the finger. It listens to touch events rather than
 * pointer events, because on a phone the browser cancels pointer events the moment a drag turns
 * into a scroll — and scrolling is what a finger is usually doing in the footer. The listeners are
 * passive, so they never block or slow the scroll.
 */

/* the four marks, exported from Figma as vectors (225×225 frames; the triangles one is 222×222) */
const MARKS: { vb: string; d: string[] }[] = [
  {
    vb: "0 0 226 226",
    d: [
      "M15.3944 15.3944C33.2537 -2.46481 62.2092 -2.46481 80.0684 15.3944C97.9277 33.2537 97.9277 62.2092 80.0684 80.0684C62.2092 97.9277 33.2537 97.9277 15.3944 80.0684C-2.46481 62.2092 -2.46481 33.2537 15.3944 15.3944ZM144.945 80.069C127.085 62.2098 127.085 33.2542 144.945 15.395C162.804 -2.46424 191.759 -2.46424 209.619 15.395C227.478 33.2542 227.478 62.2098 209.619 80.069C191.759 97.9283 162.804 97.9283 144.945 80.069ZM145.007 144.485C144.962 144.529 144.917 144.573 144.873 144.617C144.831 144.659 144.789 144.7 144.747 144.742C144.783 144.706 144.819 144.671 144.855 144.635L144.861 144.63C144.861 144.63 144.863 144.627 144.863 144.627L144.866 144.625L144.868 144.622C144.869 144.621 144.871 144.619 144.873 144.617L144.909 144.582C144.942 144.55 144.974 144.518 145.007 144.485ZM145.007 144.485C153.132 136.23 158.145 124.904 158.145 112.406C158.145 87.1494 137.67 66.6747 112.413 66.6747C87.1565 66.6747 66.6818 87.1494 66.6818 112.406C66.6818 124.146 71.1052 134.852 78.3761 142.949C60.4191 126.905 32.8389 127.502 15.5989 144.742C-2.2603 162.602 -2.2603 191.557 15.5989 209.416C33.4582 227.276 62.4137 227.276 80.2729 209.416C97.5462 192.143 98.113 164.49 81.9732 146.535C90.0582 153.752 100.724 158.138 112.413 158.138C124.91 158.138 136.236 153.125 144.491 145.001C126.888 162.88 126.974 191.643 144.747 209.416C162.606 227.275 191.562 227.275 209.421 209.416C227.28 191.557 227.28 162.601 209.421 144.742C191.648 126.969 162.886 126.883 145.007 144.485Z",
    ],
  },
  {
    vb: "0 0 226 226",
    d: [
      "M69.3263 0H0.274248V64.4191L47.8286 112.421L2.86943e-06 159.366L0 225.01H69.3263L114.558 179.779L159.503 225.148H225.148V157.321L181.293 113.044L225.148 69.1891L225.148 0.137062L162.229 0.137059L115.19 46.3055L69.3263 0Z",
    ],
  },
  {
    vb: "0 0 226 226",
    d: [
      "M225.3 73.5H186.6V101.7H125.4C122.749 101.7 120.6 99.551 120.6 96.9V35.1H150.9C151.201 35.1 151.501 35.1037 151.8 35.1111V0H225.3V73.5Z",
      "M38.1 73.5H0V0H73.5V35.1012C73.5999 35.1004 73.6999 35.1 73.8 35.1H104.7V96.9C104.7 99.551 102.551 101.7 99.9 101.7H38.1V73.5Z",
      "M73.5 190.199C73.5999 190.2 73.6999 190.2 73.8 190.2H104.7V128.4C104.7 125.749 102.551 123.6 99.9 123.6H38.1V151.5H0V225H73.5V190.199ZM187.2 151.5V123.6H125.4C122.749 123.6 120.6 125.749 120.6 128.4V190.2H151.5C151.6 190.2 151.7 190.2 151.8 190.199V225H225.3V151.5H187.2Z",
    ],
  },
  {
    vb: "0 0 222 222",
    d: ["M110.458 109.937L0.521729 1.82031e-05L220.395 0L110.458 109.937Z", "M110.458 111.553L220.395 221.49L0.521729 221.49L110.458 111.553Z"],
  },
];

const NS = "http://www.w3.org/2000/svg";
const LIFE = { in: 260, hold: 650, out: 700 }; // ms
const MAX_LIVE = 90;
const PEAK = 0.38; // the marks' strongest opacity (was 0.95 — too loud)

export function FooterTrail() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = layerRef.current!;
    const host = layer.parentElement!;
    const live = new Map<string, SVGSVGElement>();
    let last: [number, number] | null = null;

    /* one cell ≈ 2.9% of the screen width, 40–56px (a touch smaller than the reference) */
    const cellSize = () => Math.max(40, Math.min(56, window.innerWidth * 0.0292));

    const spawn = (cx: number, cy: number, S: number) => {
      const key = `${cx},${cy}`;
      if (live.has(key) || live.size >= MAX_LIVE) return;
      const m = MARKS[(Math.random() * MARKS.length) | 0];
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", m.vb);
      svg.setAttribute("aria-hidden", "true");
      const size = S * 0.86; // a little air between neighbours, like the reference
      const turn = ((Math.random() * 4) | 0) * 90;
      svg.style.cssText = `position:absolute;left:${cx * S + (S - size) / 2}px;top:${cy * S + (S - size) / 2}px;width:${size}px;height:${size}px;fill:#fff;`;
      for (const d of m.d) {
        const p = document.createElementNS(NS, "path");
        p.setAttribute("d", d);
        p.setAttribute("fill-rule", "evenodd");
        svg.appendChild(p);
      }
      layer.appendChild(svg);
      live.set(key, svg);
      const total = LIFE.in + LIFE.hold + LIFE.out;
      const a = svg.animate(
        [
          { opacity: 0, transform: `rotate(${turn}deg) scale(0.55)` },
          /* muted: the marks peak at 38% white, a quiet trace rather than a bright trail */
          { opacity: PEAK, transform: `rotate(${turn}deg) scale(1)`, offset: LIFE.in / total },
          { opacity: PEAK, transform: `rotate(${turn}deg) scale(1)`, offset: (LIFE.in + LIFE.hold) / total },
          { opacity: 0, transform: `rotate(${turn}deg) scale(0.9)` },
        ],
        { duration: total, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
      );
      a.onfinish = () => {
        svg.remove();
        live.delete(key);
      };
    };

    /* leave a mark under a point given in viewport coordinates (mouse or finger) */
    const trace = (clientX: number, clientY: number) => {
      const r = host.getBoundingClientRect();
      if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) {
        last = null;
        return;
      }
      const S = cellSize();
      const cx = Math.floor((clientX - r.left) / S), cy = Math.floor((clientY - r.top) / S);
      if (last && last[0] === cx && last[1] === cy) return;
      /* walk every cell between the last one and this one, so a fast flick leaves no gaps */
      if (last) {
        let [x, y] = last;
        const dx = Math.abs(cx - x), dy = -Math.abs(cy - y), sx = x < cx ? 1 : -1, sy = y < cy ? 1 : -1;
        let err = dx + dy, guard = 0;
        while ((x !== cx || y !== cy) && guard++ < 60) {
          const e2 = 2 * err;
          if (e2 >= dy) {
            err += dy;
            x += sx;
          }
          if (e2 <= dx) {
            err += dx;
            y += sy;
          }
          spawn(x, y, S);
        }
      } else spawn(cx, cy, S);
      last = [cx, cy];
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") trace(e.clientX, e.clientY);
    };
    const onLeave = () => (last = null);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) trace(t.clientX, t.clientY);
    };
    /* a new touch starts a new trail rather than drawing a line from where the last one ended */
    const onTouchStart = (e: TouchEvent) => {
      last = null;
      onTouch(e);
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    /* on the window, not the footer: a scroll that began higher up the page still leaves a trail
       once the finger is over the footer (trace() ignores points outside it) */
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onLeave, { passive: true });
    window.addEventListener("touchcancel", onLeave, { passive: true });
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("touchcancel", onLeave);
      live.forEach((s) => s.remove());
      live.clear();
    };
  }, []);

  return <div ref={layerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden" />;
}
