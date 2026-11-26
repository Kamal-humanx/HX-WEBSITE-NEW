"use client";

import { useEffect } from "react";

/**
 * Keeps the sticky header legible: samples the section underneath the header and sets
 * data-theme="light|dark" (Figma shows the light header on white sections and the dark header
 * over dark sections, e.g. About 5376:12223), plus data-scrolled once the page has moved.
 *
 * The ground under the header is read from each element's background colour and also from its
 * vertical gradient backgrounds (several sections paint their white or dark ground as a gradient,
 * e.g. the careers manifesto and the homepage's dark hand-over), at the header's height in that
 * element. Some stages keep easing after the finger stops, so the header keeps re-checking for a
 * moment after the last scroll, and now and then while the page sits still.
 */

type Stop = { r: number; g: number; b: number; a: number; at: number | null };

/** split on commas that are not inside brackets */
const splitTop = (s: string) => {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

/** a stop position (px, %, vh/svh/dvh/lvh, or a calc() of those) in px along a box of `box` px */
const resolveLength = (v: string, box: number): number | null => {
  const s = v.trim().replace(/^calc\(/, "").replace(/\)$/, "");
  let total = 0;
  let any = false;
  for (const m of s.matchAll(/(^|[+-])\s*(-?[\d.]+)(px|%|svh|dvh|lvh|vh)?/g)) {
    any = true;
    const n = parseFloat(m[2]) * (m[1] === "-" ? -1 : 1);
    total += m[3] === "%" ? (n * box) / 100 : m[3]?.endsWith("vh") ? (n * window.innerHeight) / 100 : n;
  }
  return any ? total : null;
};

const COLOR = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/;
const alphaOf = (a?: string) => (a === undefined ? 1 : a.endsWith("%") ? parseFloat(a) / 100 : +a);
const lumOf = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/** colour of a top-to-bottom linear gradient at `y` px down a box of `box` px (null if not one) */
const gradientAt = (layer: string, y: number, box: number): Stop | null => {
  if (!layer.startsWith("linear-gradient(")) return null;
  const parts = splitTop(layer.slice("linear-gradient(".length, -1));
  if (parts.length && !COLOR.test(parts[0])) {
    if (!/^(to bottom|180deg)$/.test(parts[0])) return null; // only vertical, downward gradients
    parts.shift();
  }
  const stops: Stop[] = [];
  for (const p of parts) {
    const c = p.match(COLOR);
    if (!c) return null;
    const rest = p.replace(c[0], "").trim();
    const col = { r: +c[1], g: +c[2], b: +c[3], a: alphaOf(c[4]) };
    const positions = rest.startsWith("calc(") ? [rest] : rest ? rest.split(/\s+/) : [];
    if (!positions.length) stops.push({ ...col, at: null });
    positions.forEach((pos) => stops.push({ ...col, at: resolveLength(pos, box) }));
  }
  if (!stops.length) return null;
  /* CSS fix-up: first/last default to the ends, gaps share out evenly, positions never go back */
  if (stops[0].at === null) stops[0].at = 0;
  if (stops[stops.length - 1].at === null) stops[stops.length - 1].at = box;
  for (let i = 1; i < stops.length; i++) {
    if (stops[i].at === null) {
      let j = i;
      while (stops[j].at === null) j++;
      const from = stops[i - 1].at as number;
      const to = stops[j].at as number;
      for (let k = i; k < j; k++) stops[k].at = from + ((to - from) * (k - i + 1)) / (j - i + 1);
    }
    stops[i].at = Math.max(stops[i].at as number, stops[i - 1].at as number);
  }
  if (y <= (stops[0].at as number)) return stops[0];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (y <= (b.at as number)) {
      const span = (b.at as number) - (a.at as number);
      const t = span > 0 ? (y - (a.at as number)) / span : 1;
      return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t, a: a.a + (b.a - a.a) * t, at: y };
    }
  }
  return stops[stops.length - 1];
};

export function HeaderTheme() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-header]");
    if (!header) return;
    let raf = 0;
    let until = 0;

    /* the element's own ground at height y (its gradient or colour), if solid */
    const ownLuminance = (n: Element, y: number): number | null => {
      const s = getComputedStyle(n);
      /* a gradient clipped to text colours the letters, not the ground */
      const clip = s.backgroundClip || s.getPropertyValue("-webkit-background-clip");
      if (clip === "text" || +s.opacity < 0.5 || s.visibility === "hidden") return null;
      if (s.backgroundImage !== "none") {
        const box = n.getBoundingClientRect();
        const sizes = splitTop(s.backgroundSize);
        const layers = splitTop(s.backgroundImage);
        for (let i = 0; i < layers.length; i++) {
          /* only layers that fill the element are ground; sized strips (a link's drawn-in underline,
             "0 1px") are not */
          const size = (sizes[i % sizes.length] ?? "auto").trim();
          if (!/^(auto|auto auto|cover|100% 100%|100%)$/.test(size)) continue;
          const c = gradientAt(layers[i], y - box.top, box.height);
          if (c && c.a > 0.5) return lumOf(c.r, c.g, c.b);
        }
      }
      const m = s.backgroundColor.match(COLOR);
      return m && alphaOf(m[4]) > 0.5 ? lumOf(+m[1], +m[2], +m[3]) : null;
    };

    /* the first solid ground at (x, y), going down through everything painted there in order —
       not just the element on top and its parents: a see-through section can sit over another
       stage (the careers manifesto over its hero), and that stage is what shows */
    const groundLuminance = (x: number, y: number): number | null => {
      /* the page's own white comes last, after the stage colour below */
      const stack = document
        .elementsFromPoint(x, y)
        .filter((el) => !header.contains(el) && el !== document.documentElement && el !== document.body);
      /* layers that take no pointer (e.g. the homepage's dark hand-over block) are left out of that
         list, but they still paint: put the top element's missing containers back, just after
         their own contents */
      for (let a = stack[0]?.parentElement; a && a !== document.body; a = a.parentElement) {
        if (stack.includes(a)) continue;
        const container = a;
        const at = stack.findIndex((el) => !container.contains(el));
        stack.splice(at < 0 ? stack.length : at, 0, container);
      }
      for (const el of stack) {
        const lum = ownLuminance(el, y);
        if (lum !== null) return lum;
      }
      return null;
    };

    const update = () => {
      const y = header.offsetHeight / 2;
      const x = Math.min(window.innerWidth - 4, 40);
      let lum = groundLuminance(x, y);
      /* no solid ground under the header (e.g. the homepage's see-through held screen): use the
         page's current stage colour, if it is darkening */
      if (lum === null) {
        const tone = document.getElementById("main")?.style.getPropertyValue("--tone");
        const m = tone?.match(/rgb\((\d+),(\d+),(\d+)\)/);
        if (m) lum = lumOf(+m[1], +m[2], +m[3]);
      }
      const theme = lum === null ? "light" : lum < 0.45 ? "dark" : "light";
      if (header.dataset.theme !== theme) header.dataset.theme = theme;
      const scrolled = window.scrollY > 8 ? "true" : "false";
      if (header.dataset.scrolled !== scrolled) header.dataset.scrolled = scrolled;
    };

    /* re-check every frame while scrolling and for a second after, as pinned stages settle */
    const loop = () => {
      raf = 0;
      update();
      if (performance.now() < until) raf = requestAnimationFrame(loop);
    };
    const schedule = () => {
      until = performance.now() + 1000;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    /* and now and then while still, for stages that change on a timer rather than on scroll */
    const idle = window.setInterval(() => {
      if (!raf && document.visibilityState === "visible") update();
    }, 700);

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hx:tone", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hx:tone", schedule);
      window.clearInterval(idle);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
