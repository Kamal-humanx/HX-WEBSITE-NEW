/* Careers only. Ported from the interactions reference (humanx-careers-page/src/components/scroll.ts).
   One reading of the page scroll, shared by every scroll-linked piece so they move as one.
   The page always scrolls natively; only the visuals ease toward the scroll position (a ~85ms
   follow), so a notched mouse wheel reads as a glide instead of steps. Nothing here ever sets or
   holds the scroll. With reduced motion there is no easing at all.
   Changes from the reference: the motion gate is the Careers wrapper (`.hxc[data-motion]`) instead
   of `html.js`, the scene can be unregistered, and listeners are removed once nothing subscribes
   (so nothing keeps running after you leave the Careers page). */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
/* progress of v through [a, b], 0..1 */
export const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a))
export const smooth = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t))
export const smoother = (t: number) => ((t = clamp(t)), t * t * t * (t * (t * 6 - 15) + 10))

/** true when the Careers page has opted into motion (no reduced-motion preference) */
export const motionOn = () => !!document.querySelector(".hxc[data-motion]")

type LenisLike = { scrollTo(target: number, o?: { duration?: number }): void }
/**
 * In-page CTAs (See open roles, Find your X, Bring your X to HumanX) → a scroll-built section.
 * Those sections open with the scroll, so landing on their top edge shows them unbuilt (the roles
 * list empty, the gene still black). Go on to where the section stands fully open — `openVh`
 * screens past its top while it is pinned — gliding there, so it opens as the page arrives.
 * stopPropagation keeps the site-wide smooth scroll (Lenis, which catches "#" links on window) from
 * re-aiming the scroll at the section's top edge.
 */
export function goToScene(e: { preventDefault(): void; stopPropagation(): void }, id: string, pinClass: string, openVh: number) {
  const el = document.getElementById(id)
  if (!el) return
  e.preventDefault()
  e.stopPropagation()
  const top = el.getBoundingClientRect().top + window.scrollY
  const target = top + (el.classList.contains(pinClass) ? window.innerHeight * openVh : 0)
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches
  const lenis = (window as unknown as { lenis?: LenisLike }).lenis
  if (lenis && !calm) lenis.scrollTo(target, { duration: 1.6 })
  else window.scrollTo({ top: target, behavior: calm ? "auto" : "smooth" })
  history.replaceState(null, "", `#${id}`)
}

type Sub = { measure?: () => void; update: (y: number) => void }
const subs = new Set<Sub>()
const TAU = 0.085
let target = 0,
  y = 0,
  raf = 0,
  last = 0,
  rt = 0,
  bound = false
let ro: ResizeObserver | null = null

/* the pinned opening scene: where it starts sticking and how far it travels */
let scene: { el: HTMLElement; stage: HTMLElement } | null = null
let sceneStart = 0,
  sceneLength = 1
function measureScene() {
  if (!scene) return
  const V = window.innerHeight,
    sh = scene.stage.offsetHeight
  sceneStart = scene.el.offsetTop + Math.max(0, sh - V)
  sceneLength = Math.max(1, scene.el.offsetHeight - sh)
}
export function registerScene(el: HTMLElement, stage: HTMLElement) {
  scene = { el, stage }
  measureScene()
  return () => {
    if (scene?.el === el) scene = null
  }
}
/* 0 at the untouched first fold, 1 once the canvas has become the white page */
export const sceneProgress = (at: number) => clamp((at - sceneStart) / sceneLength)

function frame(now: number) {
  const dt = Math.min(0.05, (now - (last || now - 16)) / 1000)
  last = now
  y += (target - y) * (1 - Math.exp(-dt / TAU))
  if (Math.abs(target - y) < 0.25) y = target
  subs.forEach((s) => s.update(y))
  raf = y !== target ? requestAnimationFrame(frame) : 0
  if (!raf) last = 0
}
function onScroll() {
  target = window.scrollY
  if (!motionOn()) {
    y = target
    subs.forEach((s) => s.update(y))
  } else if (!raf) raf = requestAnimationFrame(frame)
}
function remeasure() {
  measureScene()
  subs.forEach((s) => s.measure?.())
  subs.forEach((s) => s.update(y))
}
function onResize() {
  clearTimeout(rt)
  rt = window.setTimeout(remeasure, 60)
}
function bind() {
  if (bound) return
  bound = true
  target = y = window.scrollY
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onResize)
  document.fonts?.ready.then(remeasure)
  /* layout can change without a resize (a font arriving re-wraps a heading) */
  ro = new ResizeObserver(onResize)
  ro.observe(document.body)
}
function unbind() {
  if (!bound) return
  bound = false
  window.removeEventListener("scroll", onScroll)
  window.removeEventListener("resize", onResize)
  ro?.disconnect()
  ro = null
  cancelAnimationFrame(raf)
  raf = 0
  last = 0
  clearTimeout(rt)
}

export function onScrollFrame(sub: Sub) {
  bind()
  measureScene()
  sub.measure?.()
  sub.update(y)
  subs.add(sub)
  return () => {
    subs.delete(sub)
    if (!subs.size) unbind()
  }
}
