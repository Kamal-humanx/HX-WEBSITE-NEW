"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Two sections that share one held screen: the first is shown, then — while the page holds for
 * `hold` svh of scrolling — its content leaves (lifting and fading, top block first) and the second
 * section's content arrives in the same place (rising in, block by block). After that the page
 * scrolls on normally with the second section in view. Used for "What We Bring To The Table" →
 * "From Our Co-Conspirators".
 * Without script or with reduced motion the two simply stack in the normal flow.
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));

/* `lead` (svh): an extra stretch of hold before the swap starts — used on the homepage, where this
   stage already sits on screen during the work section's own hold (ToneShift fades it in there). */
export function SwapStage({ first, second, hold = 120, lead = 0 }: { first: ReactNode; second: ReactNode; hold?: number; lead?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wrap = wrapRef.current!, stick = stickRef.current!, A = aRef.current!, B = bRef.current!;
    wrap.classList.add("swap-on");

    /* the blocks that move: A — its title and each capability row; B — title, quote, tabs */
    const aBlocks = () => Array.from(A.querySelectorAll<HTMLElement>("[data-swap-block]"));
    const bBlocks = () => Array.from(B.querySelectorAll<HTMLElement>("[data-swap-block]"));
    let V = 0, h = 0, raf = 0;

    const measure = () => {
      V = window.innerHeight;
      h = stick.offsetHeight;
      stick.style.top = `${Math.min(0, V - h)}px`;
      paint();
    };
    const paint = () => {
      raf = 0;
      const holdPx = (hold / 100) * V, leadPx = (lead / 100) * V;
      const s = -wrap.getBoundingClientRect().top - Math.max(0, h - V) - leadPx;
      const q = ramp(s, 0, holdPx);

      const outs = aBlocks(), n = outs.length;
      outs.forEach((el, i) => {
        const a = (i / Math.max(1, n)) * 0.15;
        const t = smooth(ramp(q, a, a + 0.25));
        el.style.transform = t ? `translateY(${(-70 * t).toFixed(1)}px)` : "";
        el.style.opacity = t ? (1 - t).toFixed(3) : "";
      });
      const ins = bBlocks(), m = ins.length;
      ins.forEach((el, i) => {
        const a = 0.42 + (i / Math.max(1, m)) * 0.18;
        const t = smooth(ramp(q, a, a + 0.3));
        /* no exit: once in, the page simply scrolls on */
        el.style.transform = t < 1 ? `translateY(${(70 * (1 - t)).toFixed(1)}px)` : "";
        el.style.opacity = t < 1 ? t.toFixed(3) : "";
      });
      /* only the visible section takes the pointer */
      /* hidden layer: never takes the pointer; visible layer: follows the stage (which, on the
         homepage, ToneShift keeps pointer-less until the capabilities have faded in — otherwise the
         invisible stage would sit over the last work cards and swallow their hover) */
      A.style.pointerEvents = q > 0.45 ? "none" : "";
      B.style.pointerEvents = q < 0.55 ? "none" : "";
      B.setAttribute("aria-hidden", q < 0.5 ? "true" : "false");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stick);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      wrap.classList.remove("swap-on");
      [...aBlocks(), ...bBlocks()].forEach((el) => {
        el.style.transform = "";
        el.style.opacity = "";
      });
      A.style.pointerEvents = B.style.pointerEvents = "";
      B.removeAttribute("aria-hidden");
    };
  }, [hold, lead]);

  return (
    <div ref={wrapRef} className="swap-stage relative">
      <div ref={stickRef} className="swap-stick">
        <div ref={aRef} className="swap-a">{first}</div>
        <div ref={bRef} className="swap-b">{second}</div>
      </div>
      <div aria-hidden="true" className="swap-hold" style={{ height: `${hold + lead}svh` }} />
    </div>
  );
}
