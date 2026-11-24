import { GLYPHS, UPM } from './edgesGlyphs'

/* "Reveal what's underneath": the full stop sends out one pulse, and as it passes it uncovers the
   construction of "edges.": the real contours of the letters, a few of their anchor points, and
   three guides that run from those points to the canvas's fixed edges. Then it all recedes and is
   removed, leaving the page exactly as it was. Purely an overlay: it never touches the headline,
   the canvas or their springs. */

const NS = 'http://www.w3.org/2000/svg'
const WORD = ['e', 'd', 'g', 'e', 's', '.']

/* points are [letter index, x, y] in font units, all real on-curve points of the outlines */
type Pt = [number, number, number]
const DOT_CENTRE: Pt = [5, 106.5, 43.5]
const DOT_ANCHORS: Pt[] = [[5, 107, -9], [5, 159, 44], [5, 107, 96], [5, 54, 44]]
const BASE_FOOT: Pt = [5, 107, -9] /* every round letter overshoots to this line, the dot too */
const X_TOP: Pt = [3, 198, 516] /* and every bowl to this one */
const ASCENDER: Pt = [1, 360, 740]
const SPINE: Pt = [4, 128, 241]
const SPINE_HANDLES: Pt[] = [[4, 180, 204], [4, 76, 276]] /* off-curve points either side */
const ANCHORS: Pt[] = [X_TOP, ASCENDER, SPINE, [0, 192, -9], [2, 178, -215]]

/* timeline, ms */
const PULSE = 760
const RECEDE = 1150
const END = 1850

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const out3 = (t: number) => 1 - Math.pow(1 - clamp(t), 3)
const inOut = (t: number) => ((t = clamp(t)), t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

type XY = { x: number; y: number }

/* where "edges." is actually set, in stage coordinates: glyph origins, baseline and size */
export function measureEdges(stage: HTMLElement) {
  const S = stage.getBoundingClientRect()
  const l3 = stage.querySelector<HTMLElement>('.hl.out .l3')!
  const text = l3.firstChild as Text
  const fs = parseFloat(getComputedStyle(l3).fontSize)
  const u = fs / UPM
  const r = document.createRange()
  const ox: number[] = []
  for (let i = 0; i < 5; i++) {
    r.setStart(text, i)
    r.setEnd(text, i + 1)
    const q = r.getBoundingClientRect()
    ox.push(q.left - S.left)
    if (i === 4) ox.push(q.right - S.left) /* the full stop starts where the s ends */
  }
  const base = l3.querySelector('.bl')!.getBoundingClientRect().top - S.top
  const P = ([i, x, y]: Pt): XY => ({ x: ox[i] + x * u, y: base - y * u })
  return { S, fs, u, ox, base, P, dot: P(DOT_CENTRE) }
}

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: Element) {
  const e = document.createElementNS(NS, tag)
  for (const k in attrs) e.setAttribute(k, String(attrs[k]))
  parent.appendChild(e)
  return e
}
const crisp = (v: number) => Math.round(v - 0.5) + 0.5

let seq = 0

export function revealConstruction(stage: HTMLElement, done: () => void) {
  const { S, u, ox, base, P, dot } = measureEdges(stage)
  const probe = stage.querySelector('.probe')!.getBoundingClientRect()
  const edgeL = crisp(probe.left - S.left), edgeT = crisp(probe.top - S.top)
  const dist = (p: XY) => Math.hypot(p.x - dot.x, p.y - dot.y)

  /* the pulse reaches just past the far end of the word */
  const far = Math.max(...([[0, 23, 249], [0, 198, 516], [1, 360, 740], [2, 178, -215]] as Pt[]).map((p) => dist(P(p))))
  const R = far / 0.85 + 6
  /* when the pulse front reaches a point, inverse of out3 */
  const arrive = (p: XY) => PULSE * (1 - Math.cbrt(1 - clamp(dist(p) / R)))

  const id = 'cx' + ++seq
  const lines = el('svg', { class: 'cx cx-lines', 'aria-hidden': 'true' }, stage)
  const marks = el('svg', { class: 'cx cx-marks', 'aria-hidden': 'true' }, stage)

  /* contours, uncovered by a soft disc that follows the pulse; a second copy, seen only through a
     thin band at the front, strengthens each line for the moment the pulse passes over it */
  const defs = el('defs', {}, lines)
  const grad = (gid: string, stops: [number, number][]) => {
    const g = el('radialGradient', { id: gid }, defs)
    stops.forEach(([o, w]) => el('stop', { offset: o, 'stop-color': w ? '#fff' : '#000' }, g))
  }
  grad(id + 'g', [[0, 1], [0.8, 1], [1, 0]])
  grad(id + 'f', [[0, 0], [0.7, 0], [0.9, 1], [1, 0]])
  /* masks only need to cover the word itself */
  const box = { x: ox[0] - 8, y: base - 760 * u, w: ox[5] + 230 * u - ox[0] + 16, h: 1000 * u }
  const disc = (mid: string, gid: string) => {
    const m = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: box.x, y: box.y, width: box.w, height: box.h }, defs)
    return el('circle', { cx: dot.x, cy: dot.y, r: 0, fill: `url(#${gid})` }, m)
  }
  const uncover = disc(id + 'm', id + 'g'), front = disc(id + 'n', id + 'f')
  const glyphs = (cls: string, mask: string) => {
    const g = el('g', { class: cls, mask: `url(#${mask})` }, lines)
    WORD.forEach((c, i) => {
      const t = el('g', { transform: `translate(${ox[i]} ${base}) scale(${u} ${-u})` }, g)
      GLYPHS[c].contours.forEach((d) => el('path', { d, 'vector-effect': 'non-scaling-stroke' }, t))
    })
    return g
  }
  const contours = glyphs('cx-glyphs', id + 'm')
  const bright = glyphs('cx-glyphs cx-front', id + 'n')

  /* guides: from a point on the letters out to the canvas edge that holds still */
  const guide = (from: XY, to: XY, delay: number) => {
    const a = { x: from.x, y: from.y }
    if (to.y === from.y) a.y = to.y = crisp(from.y)
    else a.x = to.x = crisp(from.x)
    const line = el('line', { class: 'cx-guide', x1: a.x, y1: a.y, x2: a.x, y2: a.y }, lines)
    const h = to.y === a.y
    const tick = el('line', {
      class: 'cx-guide', opacity: 0,
      x1: h ? to.x : to.x - 4, x2: h ? to.x : to.x + 4, y1: h ? to.y - 4 : to.y, y2: h ? to.y + 4 : to.y,
    }, lines)
    return { a, to, line, tick, start: delay }
  }
  const baseFoot = P(BASE_FOOT), xTop = P(X_TOP), asc = P(ASCENDER)
  const guides = [
    guide(baseFoot, { x: edgeL, y: baseFoot.y }, 150),
    guide(xTop, { x: edgeL, y: xTop.y }, arrive(xTop) + 40),
    guide(asc, { x: asc.x, y: edgeT }, arrive(asc) + 40),
  ]

  /* one smooth point shown with its handles, so the curve reads as drawn, not just traced */
  const spine = P(SPINE)
  const handles = SPINE_HANDLES.map((h) => {
    const p = P(h)
    return {
      p,
      line: el('line', { class: 'cx-handle', x1: spine.x, y1: spine.y, x2: spine.x, y2: spine.y }, lines),
      knob: el('circle', { class: 'cx-knob', cx: p.x, cy: p.y, r: 2, opacity: 0 }, marks),
    }
  })
  const handleStart = arrive(spine) + 70

  const ring = el('circle', { class: 'cx-ring', cx: dot.x, cy: dot.y, r: 0 }, marks)
  /* the dot's own four anchors come in as it settles back from its hover scale */
  const anchors = [
    ...DOT_ANCHORS.map((p) => ({ p: P(p), at: 150 })),
    ...ANCHORS.map((p) => ({ p: P(p), at: arrive(P(p)) })),
  ].map((a) => ({ ...a, on: null as boolean | null, rect: el('rect', { class: 'cx-pt', opacity: 0 }, marks) }))

  let raf = 0, t0 = 0
  const frame = (now: number) => {
    if (!t0) t0 = now
    const t = now - t0

    /* the pulse */
    const p = out3(t / PULSE)
    const M = (R * p) / 0.9 /* the front sits in the soft edge of the uncovering disc */
    uncover.setAttribute('r', String(M))
    front.setAttribute('r', String(M))
    ring.setAttribute('r', String(R * p))
    ring.setAttribute('opacity', String(t < PULSE ? 0.85 * Math.pow(1 - p, 1.4) : 0))
    bright.setAttribute('opacity', String(Math.sqrt(1 - p)))

    /* recede, in reverse order of importance: guides draw back, contours fade, the points go last */
    const back = (from: number, len: number) => 1 - inOut((t - RECEDE - from) / len)
    contours.setAttribute('opacity', String(back(80, 540)))

    for (const g of guides) {
      const k = out3((t - g.start) / 620) * back(0, 480)
      g.line.setAttribute('x2', String(g.a.x + (g.to.x - g.a.x) * k))
      g.line.setAttribute('y2', String(g.a.y + (g.to.y - g.a.y) * k))
      g.tick.setAttribute('opacity', String(clamp((t - g.start - 520) / 140) * clamp(1 - (t - RECEDE) / 140)))
    }
    for (const h of handles) {
      const k = out3((t - handleStart) / 280) * back(0, 380)
      h.line.setAttribute('x2', String(spine.x + (h.p.x - spine.x) * k))
      h.line.setAttribute('y2', String(spine.y + (h.p.y - spine.y) * k))
      h.knob.setAttribute('opacity', String(clamp((t - handleStart - 220) / 120) * back(0, 300)))
    }
    /* anchors are filled with whatever surface they sit on, canvas or frame, as the canvas moves */
    const cs = stage.style, edge = (k: string) => parseFloat(cs.getPropertyValue(k)) || 0
    const ct = edge('--ct'), cr = S.width - edge('--cr'), cb = S.height - edge('--cb'), cl = edge('--cl')
    for (const a of anchors) {
      const on = a.p.x > cl && a.p.x < cr && a.p.y > ct && a.p.y < cb
      if (on !== a.on) a.rect.style.fill = (a.on = on) ? 'var(--canvas)' : 'var(--frame)'
      /* each point arrives a little large and draws in to its true size, like a selection snapping */
      const k = out3((t - a.at) / 240)
      const s = 4.5 + 4 * (1 - k)
      a.rect.setAttribute('x', String(a.p.x - s / 2))
      a.rect.setAttribute('y', String(a.p.y - s / 2))
      a.rect.setAttribute('width', String(s))
      a.rect.setAttribute('height', String(s))
      a.rect.setAttribute('opacity', String(k * back(250, 450)))
    }

    if (t < END) raf = requestAnimationFrame(frame)
    else finish()
  }
  const remove = () => {
    cancelAnimationFrame(raf)
    lines.remove()
    marks.remove()
  }
  const finish = () => {
    remove()
    done()
  }
  raf = requestAnimationFrame(frame)
  return remove
}
