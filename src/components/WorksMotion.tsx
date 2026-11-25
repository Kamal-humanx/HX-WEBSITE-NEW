"use client";

import { useEffect } from "react";
import { lineBands, maskLines, resetMask, type Band } from "@/components/careers/ref/reveal";

/**
 * Work page motion, in the homepage's language.
 *  On load (timed, like the homepage hero):
 *   1. Title, then intro, drawn in line by line (Careers feathered edge).
 *   2. Filter pills rise in one after another; the project count fades in.
 *   3. The featured card opens (the hero image's clip-open) and its Figma layers arrive on their own:
 *      the plane glides in, the phone rises, the two app cards float up, then its text and badge.
 *  On scroll:
 *   4. The featured layers drift at different depths as the card leaves (parallax).
 *   5. "All Work" draws in; each thumbnail unmasks upward from its bottom edge while the picture
 *      settles from a slight zoom (right column a beat later), then its name and tags rise in —
 *      the same build as the homepage's learning cards. Scrubbed by the scroll.
 * Hidden start states are CSS-only ([data-seq], scripting on + no reduced motion), so nothing flashes
 * before hydration. Reduced motion: everything is shown plainly.
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* timeline, ms from start */
const T = {
  title: 120, line: 1000, lineGap: 260,
  intro: 520, introGap: 180,
  pills: 760, pillGap: 45,
  feat: 640,
};

/* parallax depth of each featured layer, px of travel over one card-height of scroll */
const DEPTH: Record<string, [number, number]> = {
  phone: [0, 46],
  flight: [0, -40],
  care: [0, -70],
};
/* The plane's picture is cut off at its right and bottom edges, so (globals.css) it is drawn 8% larger
   and rests pushed back along its flight path — PLANE_X / PLANE_Y % of its own box down-right — with
   both cut edges outside the card. Scrolling flies it forward and up to PLANE_X_MIN / PLANE_Y_MIN,
   which still keep the right edge past the card (≥ +117px at 1920) and the bottom below it (≥ +13px). */
const PLANE_X = 6;
const PLANE_X_MIN = 0;
const PLANE_Y = 10;
const PLANE_Y_MIN = 2;

export function WorksMotion() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const q = <E extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<E>(s);
    const title = q('[data-seq="wk-title"]');
    const intro = q('[data-seq="wk-intro"]');
    const filters = q('[data-seq="wk-filters"]');
    const count = q('[data-seq="wk-count"]');
    const feat = q(".wk-feat");
    const allWork = q('[data-wk="allwork"]');
    if (!title || !intro || !feat) return;

    const seq = [title, intro, filters, count, feat].filter(Boolean) as HTMLElement[];
    const anims: Animation[] = [];
    const layers = Array.from(feat.querySelectorAll<HTMLElement>("[data-layer]"));
    const text = q<HTMLElement>('[data-feat="text"]', feat);
    const badge = q<HTMLElement>('[data-feat="badge"]', feat);
    let raf = 0;
    let alive = true;

    /* ---------- 1–3: the opening sequence ---------- */
    const run = () => {
      if (!alive) return;
      let tb = lineBands(title), ib = lineBands(intro);
      maskLines(title, tb, tb.map(() => 0));
      maskLines(intro, ib, ib.map(() => 0));

      const add = (el: Element | null, kf: Keyframe[], o: KeyframeAnimationOptions) => {
        if (!el) return;
        anims.push(el.animate(kf, { easing: EASE, fill: "backwards", ...o }));
      };
      /* pills, count */
      filters?.querySelectorAll("button").forEach((b, i) =>
        add(b, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 650, delay: T.pills + i * T.pillGap }),
      );
      add(count, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: T.pills + 300 });
      /* featured: open, then its layers */
      add(feat, [
        { clipPath: "inset(7% 3% 7% 3% round 21px)", opacity: 0 },
        { opacity: 1, offset: 0.35 },
        { clipPath: "inset(0% 0% 0% 0% round 21px)", opacity: 1 },
      ], { duration: 1100, delay: T.feat });
      const L: Record<string, [Keyframe, number, number]> = {
        /* arrives from further back (from the right, behind its tail), never showing its cut edge */
        plane: [{ opacity: 0, transform: "translateX(6%)" }, 260, 1400],
        phone: [{ opacity: 0, transform: "translateY(16%)" }, 380, 1200],
        flight: [{ opacity: 0, transform: "translateY(40px) scale(0.94)" }, 640, 1000],
        care: [{ opacity: 0, transform: "translateY(40px) scale(0.94)" }, 760, 1000],
      };
      layers.forEach((el) => {
        const [from, d, dur] = L[el.dataset.layer ?? ""] ?? [{ opacity: 0 }, 400, 900];
        add(el, [from, { opacity: 1, transform: "none" }], { duration: dur, delay: T.feat + d });
      });
      if (text)
        Array.from(text.querySelectorAll(":scope > div > *, :scope > p")).forEach((el, i) =>
          add(el, [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }], { duration: 800, delay: T.feat + 560 + i * 90 }),
        );
      add(badge, [{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }], { duration: 700, delay: T.feat + 900 });

      seq.forEach((el) => el.classList.add("seq-on"));

      const onResize = () => {
        resetMask(title);
        resetMask(intro);
        tb = lineBands(title);
        ib = lineBands(intro);
      };
      window.addEventListener("resize", onResize);
      const done = Math.max(T.title + T.lineGap * (tb.length - 1), T.intro + T.introGap * (ib.length - 1)) + T.line;

      let t0 = 0;
      const frame = (now: number) => {
        if (!alive) return;
        if (!t0) t0 = now;
        const t = now - t0;
        maskLines(title, tb, tb.map((_, j) => smooth(ramp(t, T.title + j * T.lineGap, T.title + j * T.lineGap + T.line))));
        maskLines(intro, ib, ib.map((_, j) => smooth(ramp(t, T.intro + j * T.introGap, T.intro + j * T.introGap + T.line))));
        if (t > done) {
          resetMask(title);
          resetMask(intro);
          window.removeEventListener("resize", onResize);
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      stopIntro = () => window.removeEventListener("resize", onResize);
    };
    let stopIntro = () => {};
    (document.fonts?.ready ?? Promise.resolve()).then(run);

    /* ---------- 4–5: scroll ---------- */
    const items = Array.from(document.querySelectorAll<HTMLElement>(".wk-item")).map((li) => ({
      li,
      media: q<HTMLElement>(".wk-media", li),
      zoom: q<HTMLElement>(".wk-zoom", li),
      cap: Array.from(li.querySelectorAll<HTMLElement>(".wk-cap > *")),
      /* the thumbnail's Figma layers; d = depth (0 background … ~2.6 nearest) */
      layers: Array.from(li.querySelectorAll<HTMLElement>(".wk-l")).map((el) => ({ el, d: +(el.dataset.d ?? 0) })),
      /* pointer drift: target and eased value, -1..1 across the card */
      hx: 0, hy: 0, tx: 0, ty: 0, build: 1, par: 0,
      /* build-in progress: target from the scroll, and the eased value actually shown */
      pT: 0, cur: -1,
    }));

    /* each layer: build-in rise (nearer layers arrive a beat later and from further), scroll parallax
       (nearer layers travel more) and pointer drift — all subtle, in px scaled to the card's width */
    const setLayers = (it: (typeof items)[number]) => {
      const k = (it.media?.offsetWidth ?? 912) / 912;
      it.layers.forEach(({ el, d }) => {
        if (!d) return;
        const u = smooth(ramp(it.build, 0.12 + d * 0.06, 0.62 + d * 0.06));
        const y = (1 - u) * (26 + d * 12) * k + it.par * d * 9 * k + it.hy * d * 4 * k;
        const x = it.hx * d * 6 * k;
        el.style.transform = x || y ? `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)` : "";
        el.style.opacity = u < 1 ? u.toFixed(3) : "";
      });
    };
    let hraf = 0;
    const drift = () => {
      hraf = 0;
      let moving = false;
      items.forEach((it) => {
        const nx = it.hx + (it.tx - it.hx) * 0.08, ny = it.hy + (it.ty - it.hy) * 0.08;
        if (Math.abs(nx - it.hx) + Math.abs(ny - it.hy) > 0.0005) moving = true;
        it.hx = Math.abs(nx) < 0.001 && !it.tx ? 0 : nx;
        it.hy = Math.abs(ny) < 0.001 && !it.ty ? 0 : ny;
        setLayers(it);
      });
      if (moving) hraf = requestAnimationFrame(drift);
    };
    const offPointer = items.map((it) => {
      const m = it.media;
      if (!m) return () => {};
      const move = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const r = m.getBoundingClientRect();
        it.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        it.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        /* border glow follows the cursor */
        m.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
        m.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
        m.style.setProperty("--spot", "1");
        if (!hraf) hraf = requestAnimationFrame(drift);
      };
      const leave = () => {
        it.tx = 0;
        it.ty = 0;
        m.style.setProperty("--spot", "0");
        if (!hraf) hraf = requestAnimationFrame(drift);
      };
      m.addEventListener("pointermove", move);
      m.addEventListener("pointerleave", leave);
      return () => {
        m.removeEventListener("pointermove", move);
        m.removeEventListener("pointerleave", leave);
      };
    });
    let awBands: Band[] = allWork ? lineBands(allWork) : [];
    let sraf = 0;

    const paint = () => {
      sraf = 0;
      const V = window.innerHeight;

      /* 4: featured parallax — 0 at the top of the page, so the resting layout is exactly Figma's */
      const fr = feat.getBoundingClientRect();
      const s = clamp(window.scrollY / Math.max(1, fr.bottom + window.scrollY));
      layers.forEach((el) => {
        const img = el.firstElementChild as HTMLElement | null;
        if (!img) return;
        if (el.dataset.layer === "plane") {
          /* rest state lives in CSS (no flash); scrolling flies it forward and up */
          img.style.translate = s ? `${(PLANE_X - (PLANE_X - PLANE_X_MIN) * s).toFixed(2)}% ${(PLANE_Y - (PLANE_Y - PLANE_Y_MIN) * s).toFixed(2)}%` : "";
          return;
        }
        const [x, y] = DEPTH[el.dataset.layer ?? ""] ?? [0, 0];
        img.style.translate = s ? `${(x * s).toFixed(1)}px ${(y * s).toFixed(1)}px` : "";
      });

      /* 5: "All Work" + the grid */
      if (allWork && awBands.length) {
        const p = ramp(V * 0.98 - allWork.getBoundingClientRect().top, 0, V * 0.35);
        maskLines(allWork, awBands, awBands.map(() => smooth(p)));
      }
      const W = window.innerWidth;
      items.forEach((it) => {
        const { li, media, zoom, cap } = it;
        if (li.hidden) return;
        const r = li.getBoundingClientRect();
        /* -1 (card low on screen) … 1 (card high): layers drift up as the card rises */
        it.par = clamp(((V / 2 - (r.top + r.height / 2)) / V) * 1.4, -1, 1) * -1;
        const col = r.left > W * 0.4 ? 1 : 0;
        /* the build-in now runs over ~85% of a screen of scroll (was 60%), right column a beat later */
        it.pT = ramp(V * 0.98 - r.top - col * V * 0.1, 0, V * 0.85);
        if (it.cur < 0) it.cur = it.pT; // first paint: start where the page already is
        void media; void zoom; void cap;
      });
      if (!eraf) eraf = requestAnimationFrame(ease);
    };
    /* each card eases toward where the scroll says it should be, so the build glides rather than
       tracking every scroll tick */
    const applyCard = (it: (typeof items)[number]) => {
      const { media, zoom, cap } = it;
      const p = it.cur;
      const t = smooth(ramp(p, 0, 0.72));
      if (media) media.style.clipPath = t < 1 ? `inset(${((1 - t) * 100).toFixed(2)}% 0 0 0 round 16px)` : "";
      if (zoom) zoom.style.transform = t < 1 ? `scale(${(1 + 0.06 * (1 - t)).toFixed(4)})` : "";
      it.build = p;
      setLayers(it);
      cap.forEach((el, j) => {
        const a0 = 0.4 + j * 0.1;
        const u = smooth(ramp(p, a0, a0 + 0.5));
        el.style.transform = u < 1 ? `translateY(${(24 * (1 - u)).toFixed(1)}px)` : "";
        el.style.opacity = u < 1 ? u.toFixed(3) : "";
      });
    };
    let eraf = 0;
    const ease = () => {
      eraf = 0;
      let moving = false;
      items.forEach((it) => {
        if (it.li.hidden || it.cur < 0) return;
        const d = it.pT - it.cur;
        it.cur = Math.abs(d) < 0.0008 ? it.pT : it.cur + d * 0.07;
        if (it.cur !== it.pT) moving = true;
        applyCard(it);
      });
      if (moving) eraf = requestAnimationFrame(ease);
    };
    const onScroll = () => {
      if (!sraf) sraf = requestAnimationFrame(paint);
    };
    const onResize = () => {
      if (allWork) {
        resetMask(allWork);
        awBands = lineBands(allWork);
      }
      onScroll();
    };
    (document.fonts?.ready ?? Promise.resolve()).then(onResize);
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sraf);
      cancelAnimationFrame(hraf);
      cancelAnimationFrame(eraf);
      offPointer.forEach((off) => off());
      items.forEach((it) => it.layers.forEach(({ el }) => ((el.style.transform = ""), (el.style.opacity = ""))));
      stopIntro();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      anims.forEach((a) => a.cancel());
      [title, intro, allWork].forEach((el) => el && resetMask(el));
      seq.forEach((el) => {
        el.classList.remove("seq-on");
        el.classList.add("seq-done");
      });
      layers.forEach((el) => ((el.firstElementChild as HTMLElement | null)?.style.removeProperty("translate")));
      items.forEach(({ media, zoom, cap }) => {
        if (media) media.style.clipPath = "";
        if (zoom) zoom.style.transform = "";
        cap.forEach((el) => {
          el.style.transform = "";
          el.style.opacity = "";
        });
      });
    };
  }, []);
  return null;
}
