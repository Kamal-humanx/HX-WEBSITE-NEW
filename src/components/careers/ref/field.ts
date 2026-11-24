import { ramp, smooth, smoother } from './scroll'

/* The principles' one drawing: a field of points, the same points throughout, rearranged three
   times as the section scrolls. 01 rough outlines from the hero's fixed corner snap to the grid until
   one holds, and the points inside it fill in. 02 the points drift along field lines onto a single
   outcome, the tools left at the edge they started from. 03 each point becomes a short heading and
   the field lines up behind one route, bent by every input it passes. One timeline, t 0..1, a pure
   function of scroll; the surface tone moves with it (cotton, stone, graphite). Drawn on a canvas:
   a thousand points re-drawn per frame is cheap there and costly as DOM. */

type P = [number, number]

/* the drawing's own space; it is scaled to fit its box, centred across it */
const W = 820, H = 740, GS = 26
const TL: P = [52, 52]
const g2p = (u: number, v: number): P => [TL[0] + u * GS, TL[1] + v * GS]

/* 01: four tries from the same corner, the last one the one that holds */
const VERS: P[][] = [
  [[0, 0], [8, 0], [9, 4], [7, 8], [2, 7], [0, 4]],
  [[0, 0], [13, 0], [15, 5], [13, 11], [3, 11], [0, 7]],
  [[0, 0], [18, 0], [19, 2], [19, 14], [1, 15], [0, 13]],
  [[0, 0], [22, 0], [22, 17], [0, 17]],
].map((v) => v.map(([u, w]) => g2p(u, w)))
const FAR: P[] = ([[9, 4], [15, 5], [19, 14], [22, 17]] as P[]).map(([u, w]) => g2p(u, w))
const TONE = [0.4, 0.55, 0.72, 1]

/* 02: where everything converges */
const F: P = [616, 350]
const DMAX = Math.hypot(W, H) * 0.75
const TOOLS = ['Figma', 'Code', 'AI', 'Research', 'Prototypes', 'Workshops']
const TOOL_ROW = [0, 2, 4, 6, 9, 12]

/* 03: the recommended route and the inputs that bend the field around it */
const ROUTE: P[] = [[70, 646], [310, 646], [530, 154], [784, 110]]
const INPUTS: [string, P][] = [
  ['Users', [144, 166]], ['Brief', [390, 46]], ['Business', [710, 590]], ['Constraints', [80, 390]], ['Data', [570, 716]],
]

const INK = '#121212', COTTON = '#ffffff', X = '#f36712', MUTE = '#8a867f', STONE = '#f3f2f0'

/* the cursor's presence: how far it reaches, how far it moves things, how much its motion drags */
const REACH = 120, PUSH = 11, DRAG = 0.9

const k = (t: number, a: number, b: number) => smooth(ramp(t, a, b))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
function mix(c1: string, c2: string, t: number) {
  const h = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
  const a = h(c1), b = h(c2)
  return 'rgb(' + a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',') + ')'
}

/* the surface tone at t, shared with the section around the drawing */
/* all three principles sit on one light ground: 02's stone, throughout */
/* (it arrives as white, the page above it, and settles into stone as the stage pins) */
/* (the stage now holds white throughout, as the page around it) */
export const toneAt = (_t: number) => COTTON
export const darkAt = (_t: number) => false
/* where each principle hands over to the next */
export const activeAt = (t: number) => (t < 0.36 ? 0 : t < 0.66 ? 1 : 2)
/* the moment each static copy is held at: the end of its own beat */
export const HOLD = [0.33, 0.6, 1]

const bez = (t: number, c: P[] = ROUTE): P => {
  const u = 1 - t
  return [0, 1].map((i) => u * u * u * c[0][i] + 3 * u * u * t * c[1][i] + 3 * u * t * t * c[2][i] + t * t * t * c[3][i]) as P
}
function inPoly([x, y]: P, poly: P[]) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}
/* 02's pull: everything drawn in toward the outcome, with a little turn as it nears */
function conv([x, y]: P, s: number): P {
  if (s <= 0) return [x, y]
  const dx = x - F[0], dy = y - F[1], d = Math.hypot(dx, dy)
  const m = lerp(1, 0.16 + 0.84 * Math.pow(Math.min(1, d / DMAX), 1.35), s)
  const th = s * 1.05 * Math.pow(Math.max(0, 1 - d / DMAX), 2)
  const c = Math.cos(th), sn = Math.sin(th)
  return [F[0] + (dx * c - dy * sn) * m, F[1] + (dx * sn + dy * c) * m]
}
/* a polygon's outline as closely spaced points, up to a fraction of its length, so a bend can
   travel along an edge rather than only moving its corners */
function trace(poly: P[], f: number, step = 10): P[] {
  const out: P[] = [poly[0]]
  let total = 0
  const seg = poly.map((a, i) => {
    const b = poly[(i + 1) % poly.length], l = Math.hypot(b[0] - a[0], b[1] - a[1])
    total += l
    return { a, b, l }
  })
  let left = total * f
  for (const { a, b, l } of seg) {
    const n = Math.max(1, Math.ceil(l / step)), take = Math.min(1, left / l)
    for (let j = 1; j <= n; j++) {
      const u = j / n
      if (u > take) {
        out.push([lerp(a[0], b[0], take), lerp(a[1], b[1], take)])
        return out
      }
      out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)])
    }
    left -= l
    if (left <= 0) break
  }
  return out
}

/* 01: fit to the need. The ground is the grid's own points, solid; the need is a stepped gap cut
   into it. Modules (four points each) arrive, are tried as a quick block, clash here and leave gaps
   there, and are rebuilt from the same modules to sit flush. Grid indices: columns 0..31, rows 0..28. */
const TJ = 19, NI0 = 10, DEPTH = [1, 2, 3, 3, 2, 1]
const inGap = (i: number, j: number) => {
  const c = Math.floor((i - NI0) / 2)
  return c >= 0 && c < 6 && j >= TJ && j < TJ + DEPTH[c] * 2
}
const cellC = (c: number, r: number): P => [(NI0 + c * 2) * GS + GS / 2, (TJ + r * 2) * GS + GS / 2]
type Mod = { a: [number, number]; f: [number, number]; s: P; rot: number; clash: boolean }
const MODS: Mod[] = (() => {
  let seed = 31
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const out: Mod[] = []
  for (let c = 1; c <= 4; c++)
    for (let r = 0; r < 3; r++) {
      const clash = r >= DEPTH[c]
      /* the two that clashed move to the two steps the first version left empty */
      out.push({ a: [c, r], f: clash ? (c === 1 ? [0, 0] : [5, 0]) : [c, r], s: [(6 + rnd() * 20) * GS, (9 + rnd() * 6) * GS], rot: (rnd() - 0.5) * 1.2, clash })
    }
  return out
})()
/* the need's outline, along the edge of the gap */
const NEED: P[] = (() => {
  const h = GS / 2, out: P[] = [[NI0 * GS - h, TJ * GS - h]]
  DEPTH.forEach((d, c) => {
    const x0 = (NI0 + 2 * c) * GS - h, y = (TJ + 2 * d) * GS - h
    out.push([x0, y], [x0 + 2 * GS, y])
  })
  out.push([(NI0 + 12) * GS - h, TJ * GS - h])
  return out
})()
function partial(pts: P[], f: number): P[] {
  if (f >= 1) return pts
  let total = 0
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  let left = total * f
  const out: P[] = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (left >= l) { out.push(b); left -= l; continue }
    out.push([lerp(a[0], b[0], left / l), lerp(a[1], b[1], left / l)])
    break
  }
  return out
}

type Pt = { p: P; inside: boolean; dn: number; rx: number; ry: number; ax: number; ay: number; nearRoute: number; ru: number; tx: number; ty: number }

/* every point's fixed facts, worked out once */
const PTS: Pt[] = (() => {
  const out: Pt[] = []
  const samples = Array.from({ length: 121 }, (_, i) => bez(i / 120))
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  for (let x = 0; x <= W; x += GS)
    for (let y = 0; y <= H - 6; y += GS) {
      const p: P = [x, y]
      let best = 1e9, bi = 0
      samples.forEach((q, i) => {
        const d = (q[0] - x) ** 2 + (q[1] - y) ** 2
        if (d < best) (best = d), (bi = i)
      })
      const a = samples[Math.max(0, bi - 1)], b = samples[Math.min(120, bi + 1)]
      let vx = b[0] - a[0], vy = b[1] - a[1]
      const L = Math.hypot(vx, vy) || 1
      vx /= L
      vy /= L
      /* where along the route this point is nearest, and the route's direction there (03's flow) */
      const ru = bi / 120, tx = vx, ty = vy
      for (const [, q] of INPUTS) {
        const dx = q[0] - x, dy = q[1] - y, d = Math.hypot(dx, dy) || 1
        const w = 0.9 * Math.exp(-(d * d) / (2 * 120 * 120))
        vx += (w * dx) / d
        vy += (w * dy) / d
      }
      const ra = rnd() * Math.PI * 2
      out.push({
        p, inside: inPoly(p, VERS[3]), dn: Math.hypot(x - TL[0], y - TL[1]) / Math.hypot(W, H),
        rx: Math.cos(ra), ry: Math.sin(ra), ax: vx, ay: vy, nearRoute: Math.sqrt(best), ru, tx, ty,
      })
    }
  return out
})()

export class Field {
  private ctx: CanvasRenderingContext2D
  private s = 0
  private ox = 0
  private oy = 0
  private dpr = 1
  private t = 0
  private enter = 1
  private raf = 0
  private ro: ResizeObserver
  /* the cursor's presence: where it is, where the field feels it (eased), how much, how it moves */
  private inside = false
  private cur: P = [0, 0]
  private ec: P = [0, 0]
  private es = 0
  private vel: P = [0, 0]
  /* each point's own give: where the cursor would put it, where it is, how far it is from it */
  private offX = new Float32Array(PTS.length)
  private offY = new Float32Array(PTS.length)
  private tgtX = new Float32Array(PTS.length)
  private tgtY = new Float32Array(PTS.length)
  private dist = new Float32Array(PTS.length).fill(1e4)

  /* ambient motion: a slow, looping life in each principle's drawing, eased in once the scroll has
     rested and eased out the moment it moves, so it never competes with the progression itself */
  private amb = 0
  private time = 0
  private ambRaf = 0
  private ambLast = 0
  private io?: IntersectionObserver

  constructor(private canvas: HTMLCanvasElement, private opaque = false) {
    this.ctx = canvas.getContext('2d')!
    this.ro = new ResizeObserver(() => this.fit())
    this.ro.observe(canvas)
    this.fit()
    /* the labels are set in the site's mono; draw again once it has arrived */
    document.fonts?.ready.then(() => this.draw())
    /* the live drawing only (the still copies stay still), only on screen, and never with reduced motion */
    if (!opaque && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.io = new IntersectionObserver(([e]) => {
        cancelAnimationFrame(this.ambRaf)
        this.ambRaf = e.isIntersecting ? requestAnimationFrame(this.ambient) : 0
        this.ambLast = 0
      })
      this.io.observe(canvas)
    }
  }
  destroy() {
    this.ro.disconnect()
    this.io?.disconnect()
    cancelAnimationFrame(this.raf)
    cancelAnimationFrame(this.ambRaf)
  }
  private ambient = (now: number) => {
    const dt = Math.min(0.05, (now - (this.ambLast || now - 16)) / 1000)
    this.ambLast = now
    this.time = now / 1000
    /* always alive while on screen: it eases in once, then simply keeps going, scroll or not */
    const goal = 1
    this.amb += (goal - this.amb) * (1 - Math.exp(-dt / (goal ? 0.9 : 0.15)))
    if (this.amb < 0.002 && !goal) this.amb = 0
    if (this.amb > 0 || goal) this.draw()
    this.ambRaf = requestAnimationFrame(this.ambient)
  }
  private fit() {
    const r = this.canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    this.canvas.width = Math.round(r.width * this.dpr)
    this.canvas.height = Math.round(r.height * this.dpr)
    /* a little short of the box, so the labels along the bottom edge are never cut */
    this.s = Math.min(r.width / W, r.height / H) * 0.96
    /* centred across its column, clear of the copy, with the spare width shared on either side */
    this.ox = (r.width - W * this.s) / 2
    this.oy = (r.height - H * this.s) / 2
    this.draw()
  }
  paint(t: number, enter = 1) {
    this.t = t
    this.enter = enter
    /* the box can change without a resize notice reaching us (a pane shown again, the pinned
       layout switching in), and a stale canvas is drawn squashed and cut: measure before drawing */
    const r = this.canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1)
    if (Math.round(r.width * dpr) !== this.canvas.width || Math.round(r.height * dpr) !== this.canvas.height) return this.fit()
    this.draw()
  }

  /* The field has a physical sense of the cursor. Everything near it gives way a little, most
     right beside it and less with distance, with a slight drag in the direction it moves. The
     nearest points answer first and those further out follow a beat later, so the give spreads
     like a soft ripple; when the cursor leaves, everything eases home. No overshoot, no scaling. */
  pointer(clientX: number, clientY: number, on: boolean) {
    const r = this.canvas.getBoundingClientRect()
    this.cur = [(clientX - r.left - this.ox) / this.s, (clientY - r.top - this.oy) / this.s]
    /* arriving: the presence starts where the cursor is, rather than sliding in from elsewhere */
    if (on && this.es < 0.01) this.ec = [...this.cur]
    this.inside = on
    if (!this.raf) this.raf = requestAnimationFrame(this.tick)
  }
  private tick = () => {
    const goal = this.inside ? 1 : 0
    this.es += (goal - this.es) * (goal ? 0.1 : 0.045)
    if (Math.abs(goal - this.es) < 0.002) this.es = goal
    const px = this.ec[0], py = this.ec[1]
    this.ec[0] += (this.cur[0] - px) * 0.2
    this.ec[1] += (this.cur[1] - py) * 0.2
    this.vel[0] = this.vel[0] * 0.8 + (this.ec[0] - px) * 0.2
    this.vel[1] = this.vel[1] * 0.8 + (this.ec[1] - py) * 0.2
    let moving = 0
    for (let i = 0; i < PTS.length; i++) {
      /* near points follow quickly, far ones slowly: the give travels outward */
      const rate = lerp(0.2, 0.06, Math.min(1, this.dist[i] / 260))
      this.offX[i] += (this.tgtX[i] - this.offX[i]) * rate
      this.offY[i] += (this.tgtY[i] - this.offY[i]) * rate
      moving = Math.max(moving, Math.abs(this.offX[i]) + Math.abs(this.offY[i]))
    }
    this.draw()
    this.raf = this.inside || this.es > 0 || moving > 0.03 ? requestAnimationFrame(this.tick) : 0
    if (!this.raf) {
      this.offX.fill(0)
      this.offY.fill(0)
      this.draw()
    }
  }
  /* how far the cursor moves a thing standing at q */
  private give(q: P, out: P = [0, 0]): P {
    out[0] = out[1] = 0
    if (this.es <= 0) return out
    const dx = q[0] - this.ec[0], dy = q[1] - this.ec[1], d2 = dx * dx + dy * dy
    const f = Math.exp(-d2 / (REACH * REACH)) * this.es
    if (f < 0.002) return out
    const d = Math.sqrt(d2) || 1
    /* softened right under the cursor, so nothing flips direction as it passes over */
    const push = PUSH * f * Math.min(1, d / 26)
    const vx = Math.max(-6, Math.min(6, this.vel[0])), vy = Math.max(-6, Math.min(6, this.vel[1]))
    out[0] = (dx / d) * push + vx * DRAG * f
    out[1] = (dy / d) * push + vy * DRAG * f
    return out
  }
  /* a line's points, moved by the same presence (lines are a little stiffer than points) */
  private bent(pts: P[]): P[] {
    if (this.es <= 0) return pts
    const g: P = [0, 0]
    return pts.map((q) => {
      this.give(q, g)
      return [q[0] + g[0] * 0.85, q[1] + g[1] * 0.85]
    })
  }
  private moved(q: P): P {
    const g = this.give(q)
    return [q[0] + g[0], q[1] + g[1]]
  }
  private stroke(pts: P[]) {
    const c = this.ctx
    c.beginPath()
    pts.forEach((q, j) => (j ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])))
    c.stroke()
  }

  private label(s: string, x: number, y: number, color: string, a: number, bg?: string, align: CanvasTextAlign = 'left') {
    if (a <= 0.01) return
    const c = this.ctx
    ;[x, y] = this.moved([x, y])
    c.font = '500 10px "Chivo Mono", monospace'
    c.letterSpacing = '0.7px'
    c.textAlign = align
    const txt = s.toUpperCase()
    if (bg) {
      const w = c.measureText(txt).width + 10
      c.globalAlpha = a
      c.fillStyle = bg
      c.fillRect(align === 'right' ? x - w + 5 : x - 5, y - 11, w, 16)
    }
    c.globalAlpha = a
    c.fillStyle = color
    c.fillText(txt, x, y)
  }

  /* the idea (modules arrive) → made and tried (a quick block lowered into the gap: it clashes and
     leaves gaps) → better (rebuilt from the same modules, flush, the seam closes). The modules land
     exactly on the gap's own grid points, so as 01 hands over they simply become the grid again. */
  private fitToNeed(t: number, alpha: number, s: number) {
    const c = this.ctx
    const at = (q: P) => this.moved(conv(q, s))
    /* every change rides a soft curve (smootherstep: no jolt at either end), and the modules move one
       after another rather than all at once, so the build reads as a continuous motion */
    const K = (a: number, b: number) => smoother(ramp(t, a, b))
    const need = K(0.01, 0.08), seam = K(0.28, 0.32)
    const clashK = K(0.16, 0.185) * (1 - K(0.215, 0.235))
    const rings = K(0.17, 0.195) * (1 - K(0.215, 0.24)), ghost = K(0.235, 0.28)
    const arrive = K(0.015, 0.05)
    /* how much of the finished build's ambient wave to show: only once the seam has closed */
    const wavy = this.amb * smoother(ramp(seam, 0.95, 1))
    c.setLineDash([])
    /* the need: the gap's outline, drawn in; once it's met, a solid seam replaces it */
    if (need > 0) {
      c.globalAlpha = 0.9 * alpha * (1 - seam)
      c.strokeStyle = X
      c.lineWidth = 1.1
      c.setLineDash([3, 4])
      this.stroke(partial(NEED, need).map(at))
      c.setLineDash([])
    }
    /* the first attempt, set aside above once it's been rebuilt */
    if (ghost > 0)
      MODS.forEach((m) => {
        const [x, y] = cellC(m.a[0], m.a[1])
        this.module([x, y - 12 * GS], 0, MUTE, 0.38 * alpha * ghost, at, 1.7, [2, 3])
      })
    /* the modules */
    if (arrive > 0)
      MODS.forEach((m, n) => {
        /* the deepest row lands first, so the block settles from the bottom up */
        const j = (2 - m.a[1]) * 4 + (m.a[0] - 1)
        const a = K(0.015 + j * 0.002, 0.05 + j * 0.002)
        const g = K(0.05 + j * 0.004, 0.1 + j * 0.004)
        const A = cellC(m.a[0], m.a[1]), F = cellC(m.f[0], m.f[1])
        /* floating down into view, then carried to its place along a gentle arc */
        let x = lerp(m.s[0], A[0], g), y = lerp(m.s[1] - 18 * (1 - a), A[1], g) - Math.sin(g * Math.PI) * 14
        let r = 0
        if (m.f[0] !== m.a[0] || m.f[1] !== m.a[1]) {
          r = K(0.215 + n * 0.0015, 0.26 + n * 0.0015)
          x = lerp(x, F[0], r)
          y = lerp(y, F[1], r) - Math.sin(r * Math.PI) * 64
        }
        /* ambient: loose modules drift and sway while they wait; fitted ones take a soft wave that
           passes along the build once it's flush, as if checking the fit */
        const loose = this.amb * (1 - g), T0 = this.time
        x += Math.cos(T0 * 0.55 + j * 1.3) * 2.2 * loose
        y += Math.sin(T0 * 0.8 + j * 1.7) * 3.4 * loose
        const fc = (m.f[0] + 0.5) / 6, wave = (T0 * 0.28) % 1.6 - 0.3
        const bump = wavy * Math.exp(-((fc - wave) ** 2) / 0.012)
        y -= 2 * bump
        const col = m.clash ? mix(INK, X, clashK) : INK
        this.module([x, y], m.rot * (1 - g) + Math.sin(T0 * 0.5 + j) * 0.06 * loose, col, alpha * a, at, 2.3 + 0.3 * r + 0.7 * bump)
      })
    /* what the first version left empty */
    if (rings > 0)
      [0, 5].forEach((cc) => {
        const [x, y] = cellC(cc, 0)
        c.globalAlpha = 0.9 * alpha * rings
        c.strokeStyle = X
        c.lineWidth = 1.2
        for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          const q = at([x + (dx * GS) / 2, y + (dy * GS) / 2])
          c.beginPath()
          c.arc(q[0], q[1], 3.4, 0, Math.PI * 2)
          c.stroke()
        }
      })
    /* met: the seam closes, flush with the ground */
    if (seam > 0) {
      const y = TJ * GS - GS / 2, x0 = NI0 * GS - GS / 2, x1 = (NI0 + 12) * GS - GS / 2
      c.globalAlpha = alpha
      c.strokeStyle = X
      c.lineWidth = 1.6
      this.stroke([at([x0, y]), at([lerp(x0, x1, seam), y])])
      if (seam >= 0.99) {
        const e = at([x1, y])
        c.fillStyle = X
        c.beginPath()
        c.arc(e[0], e[1], 6.5, 0, Math.PI * 2)
        c.fill()
      }
      /* ambient: a small light travels along the closed seam, fading in and out at its ends */
      if (wavy > 0) {
        const u = (this.time * 0.18) % 1, q = at([lerp(x0, x1, u), y])
        const glow = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], 10)
        glow.addColorStop(0, 'rgba(255,214,186,.95)')
        glow.addColorStop(1, 'rgba(243,103,18,0)')
        c.globalAlpha = alpha * wavy * Math.sin(u * Math.PI) * 0.9
        c.fillStyle = glow
        c.beginPath()
        c.arc(q[0], q[1], 10, 0, Math.PI * 2)
        c.fill()
      }
    }
    c.globalAlpha = 1
  }
  /* a module: four points that belong together, joined by a fine square */
  private module([cx, cy]: P, rot: number, col: string, a: number, at: (q: P) => P, r = 2.3, dash?: number[]) {
    if (a <= 0.01) return
    const c = this.ctx, h = GS / 2, co = Math.cos(rot), si = Math.sin(rot)
    const pts = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([dx, dy]) => at([cx + dx * co - dy * si, cy + dx * si + dy * co]))
    c.globalAlpha = 0.32 * a
    c.strokeStyle = col
    c.lineWidth = 1
    if (dash) c.setLineDash(dash)
    this.stroke([...pts, pts[0]])
    c.setLineDash([])
    c.globalAlpha = 0.9 * a
    c.fillStyle = col
    for (const q of pts) {
      c.beginPath()
      c.arc(q[0], q[1], r, 0, Math.PI * 2)
      c.fill()
    }
  }

  private draw() {
    const c = this.ctx, t = this.t
    if (!this.s) return
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (this.opaque) {
      c.fillStyle = toneAt(t)
      c.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    const S = this.s * this.dpr
    c.setTransform(S, 0, 0, S, this.ox * this.dpr, this.oy * this.dpr)
    c.lineCap = 'round'
    c.lineJoin = 'round'
    const dark = darkAt(t), bg = toneAt(t)

    /* the timeline: each principle draws in, then holds still for a stretch before the next */
    const ver = [0, 1, 2, 3].map((i) => k(t, 0.03 + i * 0.05, 0.07 + i * 0.05))
    const fillIn = k(t, 0.2, 0.24)
    const outl = 1 - k(t, 0.34, 0.4)
    const s = k(t, 0.35, 0.5) * (1 - k(t, 0.63, 0.74))
    const lines = k(t, 0.38, 0.5), linesA = 1 - k(t, 0.63, 0.7)
    const tools = k(t, 0.38, 0.46) * (1 - k(t, 0.63, 0.68))
    const focus = k(t, 0.47, 0.52) * (1 - k(t, 0.63, 0.68))
    /* the dots hand over to headings with an overlap, so the field is never empty between them */
    /* 03 keeps the dot grid behind the route */
    const inputs = k(t, 0.7, 0.76), route = k(t, 0.72, 0.84)

    /* 02: field lines toward the outcome */
    if (lines > 0 && linesA > 0) {
      c.strokeStyle = INK
      c.lineWidth = 1
      c.globalAlpha = 0.38 * linesA
      c.setLineDash([])
      for (let i = 0; i < 13; i++) {
        const y0 = 54 + i * 52, N = 46, n = Math.floor(N * lines), pts: P[] = []
        for (let j = 0; j <= n; j++) pts.push(conv([lerp(10, F[0], j / N), lerp(y0, F[1], j / N)], s))
        this.stroke(this.bent(pts))
      }
    }

    /* 02 ambient: where the pulse front is, and how strong (fading as it travels out) */
    const ripP = (this.time / 3.2) % 1, ripR = 10 + ripP * 400
    const ripW = this.amb * focus * Math.sin(Math.min(1, ripP * 5) * Math.PI / 2) * (1 - ripP) ** 0.8

    /* 03 ambient: where the comet is on the route, and whether the route is there to carry it */
    /* a 5s loop: the light travels for 3.8s on an eased curve (it leaves gently and settles into the
       recommendation), then rests before the next run */
    const loopT = (this.time % 5) / 3.8
    const flowHead = smoother(Math.min(1, loopT))
    const flowW = loopT >= 1 ? 0 : this.amb * smoother(ramp(route, 0.95, 1)) * Math.sin(flowHead * Math.PI) ** 0.8

    /* the points: dots, then headings */
    const g: P = [0, 0]
    for (let i = 0; i < PTS.length; i++) {
      const pt = PTS[i]
      const ap = smooth(ramp(this.enter, pt.dn * 0.6, pt.dn * 0.6 + 0.4))
      if (ap <= 0) continue
      const q0 = conv(pt.p, s)
      /* where the cursor would put this point; the tick eases it there */
      this.give(q0, g)
      this.tgtX[i] = g[0]
      this.tgtY[i] = g[1]
      this.dist[i] = Math.hypot(q0[0] - this.ec[0], q0[1] - this.ec[1])
      const q: P = [q0[0] + this.offX[i], q0[1] + this.offY[i]]
      const near = s > 0 ? Math.max(0, 1 - Math.hypot(q0[0] - F[0], q0[1] - F[1]) / 420) : 0
      /* 02 ambient: a pulse leaves the intervention; as it reaches each point the point is pushed
         outward, swells and takes the intervention's orange, then settles back as the pulse moves on */
      let pulse = 0
      if (ripW > 0) {
        const dx = q0[0] - F[0], dy = q0[1] - F[1], d = Math.hypot(dx, dy) || 1
        pulse = ripW * Math.exp(-((d - ripR) ** 2) / (2 * 26 * 26))
        q[0] += (dx / d) * 7 * pulse
        q[1] += (dy / d) * 7 * pulse
      }
      /* 01: the ground firms up; the gap's own points step aside for the modules that will fill it */
      const gi = Math.round(pt.p[0] / GS), gj = Math.round(pt.p[1] / GS)
      const firm = smoother(ramp(t, 0.01, 0.07)) * outl
      const isGround = gj >= TJ && !inGap(gi, gj), isGap = inGap(gi, gj)
      const r01 = isGround ? lerp(1.4, 2.1, firm) : 1.4
      const a01 = isGround ? lerp(0.26, 0.64, firm) : isGap ? 0.26 * (1 - firm) : 0.26
      /* 03 ambient: as the light passes, the dots beside the route swell a little and warm, then settle */
      const fb = flowW > 0 ? flowW * Math.exp(-((pt.ru - flowHead) ** 2) / (2 * 0.06 * 0.06)) * Math.exp(-pt.nearRoute / 70) : 0
      /* the route runs clean: the points right under it step aside once it is drawn */
      const under = pt.nearRoute < 9 ? smoother(ramp(route, 0.3, 0.9)) : 0
      const r = lerp(r01, 1.2 + near * 1.4, s) + 1.3 * pulse + 1.1 * fb, a = (lerp(a01, 0.22 + near * 0.6, s) + 0.35 * pulse + 0.4 * fb) * ap * (1 - under)
      if (a > 0.01) {
        c.globalAlpha = Math.min(1, a)
        c.fillStyle = fb > 0.04 ? mix(INK, X, Math.min(0.8, fb)) : pulse > 0.04 ? mix(INK, X, Math.min(1, pulse * 1.1)) : INK
        c.beginPath()
        c.arc(q[0], q[1], r, 0, Math.PI * 2)
        c.fill()
      }
    }

    /* 01: fit to the need */
    if (outl > 0) this.fitToNeed(t, outl * smooth(ramp(this.enter, 0, 0.7)), s)

    /* 02: the outcome, and the tools left where they started */
    if (tools > 0) TOOLS.forEach((s0, i) => this.label(s0, 18, 54 + TOOL_ROW[i] * 52 - 8, MUTE, 0.85 * tools))
    if (focus > 0) {
      const f = this.moved(F)
      c.strokeStyle = INK
      c.lineWidth = 1
      ;[[46, 0.14], [26, 0.3]].forEach(([r, a]) => {
        c.globalAlpha = a * focus
        c.beginPath()
        c.arc(f[0], f[1], r, 0, Math.PI * 2)
        c.stroke()
      })
      c.globalAlpha = focus
      c.lineWidth = 1.6
      this.stroke(this.bent(Array.from({ length: 13 }, (_, j) => [lerp(F[0], W + 60, j / 12), lerp(F[1], F[1] - 64, j / 12)] as P)))
      c.globalAlpha = 0.5 * focus
      c.lineWidth = 0.8
      this.stroke(this.bent([[F[0] + 6, F[1] - 8], [F[0] + 22, F[1] - 80]]))
      c.globalAlpha = focus
      c.fillStyle = X
      c.beginPath()
      c.arc(f[0], f[1], 7, 0, Math.PI * 2)
      c.fill()
      this.label('Behaviour, changed', F[0] + 26, F[1] - 86, INK, focus, bg)
    }

    /* 03: the inputs, the route, judgement at one end and the recommendation at the other */
    if (inputs > 0)
      for (const [n, q0] of INPUTS) {
        const q = this.moved(q0)
        c.globalAlpha = 0.85 * inputs
        c.fillStyle = INK
        c.strokeStyle = bg
        c.lineWidth = 1
        c.fillRect(q[0] - 5, q[1] - 5, 10, 10)
        c.strokeRect(q[0] - 5, q[1] - 5, 10, 10)
        this.label(n, q0[0] + 14, q0[1] + 4, INK, inputs, bg)
      }
    if (route > 0) {
      c.globalAlpha = 1
      c.strokeStyle = X
      c.lineWidth = 2.2
      const n = Math.floor(80 * route)
      this.stroke(this.bent(Array.from({ length: n + 1 }, (_, i) => bez(i / 80))))
      /* 03 ambient: a small light flows along the recommended route, from judgement to the
         recommendation, with a short tail; it fades at either end so the loop is seamless */
      if (flowW > 0) {
        /* a slim tail along the route that fades in towards the head, the route's own width, so the
           light reads as part of the line rather than a blob riding on it */
        const head = flowHead, tail = Math.max(0, head - 0.1)
        const pts = Array.from({ length: 21 }, (_, j) => this.moved(bez(lerp(tail, head, j / 20))))
        c.lineCap = 'round'
        for (let j = 1; j < pts.length; j++) {
          const f = j / (pts.length - 1)
          c.globalAlpha = flowW * f * f
          c.strokeStyle = mix(X, '#ffc59e', f)
          c.lineWidth = 2.2 + 0.8 * f
          c.beginPath()
          c.moveTo(pts[j - 1][0], pts[j - 1][1])
          c.lineTo(pts[j][0], pts[j][1])
          c.stroke()
        }
        /* the head: a faint warm halo, a crisp white core and a fine orange ring */
        const hp = pts[pts.length - 1]
        const glow = c.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], 14)
        glow.addColorStop(0, 'rgba(255,170,110,.32)')
        glow.addColorStop(1, 'rgba(255,170,110,0)')
        c.globalAlpha = flowW
        c.fillStyle = glow
        c.beginPath()
        c.arc(hp[0], hp[1], 14, 0, Math.PI * 2)
        c.fill()
        c.fillStyle = '#ffffff'
        c.beginPath()
        c.arc(hp[0], hp[1], 3, 0, Math.PI * 2)
        c.fill()
        c.strokeStyle = X
        c.lineWidth = 1.2
        c.stroke()
      }
    }
    const start = k(t, 0.7, 0.74)
    if (start > 0) {
      const o = this.moved(ROUTE[0])
      c.globalAlpha = start
      c.fillStyle = X
      c.beginPath()
      c.arc(o[0], o[1], 7, 0, Math.PI * 2)
      c.fill()
      c.globalAlpha = 0.5 * start
      c.strokeStyle = X
      c.lineWidth = 1
      c.beginPath()
      c.arc(o[0], o[1], 16, 0, Math.PI * 2)
      c.stroke()
      this.label('Your judgement', ROUTE[0][0] + 26, ROUTE[0][1] + 5, INK, k(t, 0.72, 0.76), bg)
    }
    const end = k(t, 0.84, 0.88)
    if (end > 0) {
      const e = this.moved(ROUTE[3])
      c.globalAlpha = end
      c.fillStyle = bg
      c.strokeStyle = X
      c.lineWidth = 1.5
      c.beginPath()
      c.arc(e[0], e[1], 4, 0, Math.PI * 2)
      c.fill()
      c.stroke()
      this.label('Recommended', ROUTE[3][0] - 12, ROUTE[3][1] - 16, INK, end, bg, 'right')
    }
    c.globalAlpha = 1
  }
}
