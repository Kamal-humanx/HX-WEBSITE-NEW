/* Line-by-line reveal through a mask: every line of a text block gets its own mask layer, and each
   layer's right edge travels across its line like the canvas edge did. The text itself is never
   rewritten or split; the lines are read from the browser's own layout. */

export type Band = { x: number; y: number; w: number; h: number }

/* Uncut Sans: the content box starts .975em above the baseline and the tallest ascender (f)
   reaches .71em, so each band starts .725em above its baseline (.25em into the box): a line's
   letters never show ahead of its own edge; at most a descender tip of the line above waits for it */
const MEET = 0.25
const FEATHER = 10

export function lineBands(el: HTMLElement): Band[] {
  const fs = parseFloat(getComputedStyle(el).fontSize)
  const box = el.getBoundingClientRect()
  const r = document.createRange()
  r.selectNodeContents(el)
  const lines: { x0: number; x1: number; t: number; b: number }[] = []
  for (const q of Array.from(r.getClientRects())) {
    if (q.width < 1 || q.height < 1) continue
    const cy = (q.top + q.bottom) / 2
    const ln = lines.find((l) => Math.abs((l.t + l.b) / 2 - cy) < fs * 0.3)
    if (ln) {
      ln.x0 = Math.min(ln.x0, q.left)
      ln.x1 = Math.max(ln.x1, q.right)
      ln.t = Math.min(ln.t, q.top)
      ln.b = Math.max(ln.b, q.bottom)
    } else lines.push({ x0: q.left, x1: q.right, t: q.top, b: q.bottom })
  }
  lines.sort((a, b) => a.t - b.t)
  return lines.map((l, i) => {
    const top = i === 0 ? l.t - fs * 0.2 : l.t + MEET * fs
    const bottom = i === lines.length - 1 ? l.b + fs * 0.2 : lines[i + 1].t + MEET * fs
    return { x: l.x0 - box.left - fs * 0.1, y: top - box.top, w: l.x1 - l.x0 + fs * 0.25, h: bottom - top }
  })
}

const PROPS = ['mask-image', 'mask-size', 'mask-position', 'mask-repeat']
const set = (el: HTMLElement, k: string, v: string) => {
  el.style.setProperty(k, v)
  el.style.setProperty('-webkit-' + k, v)
}

/* reveal[i] is 0..1 for line i; fully revealed text carries no mask at all */
export function maskLines(el: HTMLElement, bands: Band[], reveal: number[]) {
  if (!bands.length) return
  if (reveal.every((v) => v >= 1)) {
    if (el.dataset.masked) {
      PROPS.forEach((k) => (el.style.removeProperty(k), el.style.removeProperty('-webkit-' + k)))
      delete el.dataset.masked
    }
    return
  }
  const size = bands
    .map((b, i) => (reveal[i] > 0 ? `${((b.w + FEATHER) * reveal[i]).toFixed(1)}px ${b.h.toFixed(1)}px` : '0px 0px'))
    .join(',')
  if (el.dataset.masked === size) return
  if (!el.dataset.masked) {
    set(el, 'mask-image', bands.map(() => `linear-gradient(90deg,#000 calc(100% - ${FEATHER}px),transparent)`).join(','))
    set(el, 'mask-position', bands.map((b) => `${b.x.toFixed(1)}px ${b.y.toFixed(1)}px`).join(','))
    set(el, 'mask-repeat', 'no-repeat')
  }
  set(el, 'mask-size', size)
  el.dataset.masked = size
}

/* after a re-layout the bands move, so the mask is rebuilt from scratch */
export function resetMask(el: HTMLElement) {
  PROPS.forEach((k) => (el.style.removeProperty(k), el.style.removeProperty('-webkit-' + k)))
  delete el.dataset.masked
}
