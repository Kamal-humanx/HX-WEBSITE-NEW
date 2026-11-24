import { clamp, smooth } from './scroll'

/* The specimen: a double helix as a made object. Two broad tapes wound round one axis and lit by a
   single key light, told apart by their material rather than by colour: the human strand matte bone,
   the X strand polished graphite that catches a sharp highlight. 24 base pairs are jointed rods that
   stop short of the axis, each ending in a small bead, so the specimen reads as not yet spliced.
   Tangerine is kept for what the visitor does: a committed trait turns its rod tangerine, inlays a
   fine line along its strand and closes a collar of the trait's own profile; once both strands carry
   a trait every human trait is linked to every X trait across the interior, and when the specimen is
   complete the leading link carries the splice through in tangerine. A preview is only ever line.
   Years shipping never touches it. Canvas 2D with its own small projection. */

export type Pick = { side: 0 | 1; i: number }
/* where a trait's control sits, so a leader can run from it to its locus */
export type Anchor = { side: number; i: number; x: number; y: number }
type RGB = [number, number, number]
type XY = { x: number; y: number }
type Q = XY & { z: number }
type Item = { z: number; f: (c: CanvasRenderingContext2D) => void }
type Mat = { base: RGB; amb: number; dif: number; spec: number; shin: number; env: number }

export const N = 24
/* where each trait lands: the human edges every other rung down one strand, the X factors in a run
   lower down the other */
export const locusOf = (side: number, i: number) => (side ? 13 + i : 4 + i * 2)
/* how many traits each strand offers */
const COUNT = [7, 7]

const TAU = Math.PI * 2
/* twist per base pair */
const TW = 0.6
const BG: RGB = [15, 15, 14], WHITE: RGB = [255, 255, 255], BLACK: RGB = [0, 0, 0]
const X: RGB = [243, 103, 18], COTTON: RGB = [250, 250, 248], BONE: RGB = [226, 214, 240]
const norm = (v: number[]) => {
  const l = Math.hypot(...v)
  return v.map((x) => x / l)
}
/* the key light, up and to the left in front; the half-vector for the highlight */
const L = norm([-0.55, -0.35, 0.76])
const HV = norm([L[0], L[1], L[2] + 1])
const MAT: Mat[] = [
  { base: [238, 226, 204], amb: 0.32, dif: 0.72, spec: 0.14, shin: 7, env: 0 }, // human: bone, matte
  { base: [124, 128, 134], amb: 0.2, dif: 0.5, spec: 1.15, shin: 40, env: 0.6 }, // X: graphite, polished
]
/* the views the specimen turns to: a previewed locus to face its control, front left or front right */
const FACE = [2.35, 0.8]

/* the strands are drawn, not modelled: each a fine ribbon in a brand gradient along its length.
   Human edge warm (cotton into blush), X strand cool (lilac into violet), as the X in the logo runs */
const STRAND: [RGB, RGB][] = [
  [[247, 240, 232], [238, 168, 160]],
  [[205, 160, 246], [124, 66, 228]],
]
const strandAt = (k: number, t: number): RGB => mix(STRAND[k][0], STRAND[k][1], clamp(t / (N - 1)))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
const rgb = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
const wrap = (a: number) => a - TAU * Math.round(a / TAU)
const ease = (dt: number, tau: number) => 1 - Math.exp(-dt / tau)
function shade(m: Mat, nx: number, nz: number, inner: boolean): RGB {
  const lam = Math.max(0, nx * L[0] + nz * L[2])
  const sp = m.spec * Math.max(0, nx * HV[0] + nz * HV[2]) ** m.shin
  /* a window caught in the polish */
  const env = m.env * Math.exp(-(((nx + 0.42) / 0.16) ** 2))
  const k = (m.amb + m.dif * lam) * (inner ? 0.5 : 1), g = 255 * (sp + env) * (inner ? 0.25 : 1)
  return [Math.min(255, m.base[0] * k + g), Math.min(255, m.base[1] * k + g), Math.min(255, m.base[2] * k + g)]
}
function segDist(px: number, py: number, a: XY, b: XY) {
  const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy || 1
  const t = clamp(((px - a.x) * dx + (py - a.y) * dy) / l)
  return Math.hypot(px - a.x - dx * t, py - a.y - dy * t)
}
function ball(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: RGB, a = 1) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r)
  g.addColorStop(0, rgb(mix(col, WHITE, 0.6), a))
  g.addColorStop(0.55, rgb(col, a))
  g.addColorStop(1, rgb(mix(col, BLACK, 0.5), a))
  c.fillStyle = g
  c.beginPath()
  c.arc(x, y, r, 0, TAU)
  c.fill()
}

/* each trait closes a collar of its own profile around its locus (local space: x along the strand) */
function collar(c: CanvasRenderingContext2D, side: number, i: number, hover: boolean) {
  const ring = (x: number, tilt = 0, a = 1, rx = 3.5, ry = 13) => {
    c.save()
    c.translate(x, 0)
    c.rotate(tilt)
    c.globalAlpha *= a
    c.beginPath()
    c.ellipse(0, 0, rx, ry, 0, 0, TAU)
    c.stroke()
    c.restore()
  }
  const dot = (x: number, y: number, r: number) => {
    c.beginPath()
    c.arc(x, y, r, 0, TAU)
    if (hover) c.stroke()
    else c.fill()
  }
  const line = (...p: number[]) => {
    c.beginPath()
    for (let j = 0; j < p.length; j += 2) j ? c.lineTo(p[j], p[j + 1]) : c.moveTo(p[j], p[j + 1])
    c.stroke()
  }
  const w = (n: number) => (c.lineWidth = hover ? Math.min(n, 1) : n)
  w(1.6)
  switch (side ? 10 + i : i) {
    case 0: ring(0); w(1); ring(0, 0, 0.5, 6.5, 19); dot(0, 0, 1.6); break // attention: a focused ring
    case 1: ring(0); w(1.2); line(0, -13, 0, -26); dot(0, -29, 2.4); break // curiosity: a spur
    case 2: ring(0); w(0.8); ring(6, 0, 1, 2.5, 11); break // taste: a fine second band
    case 3: dot(-12, 0, 2.6); dot(0, 0, 2.6); dot(12, 0, 2.6); break // storytelling: three beads
    case 4: ring(0); w(0.9); ring(0, 0, 0.5, 7, 20); ring(0, 0, 0.25, 10, 26); break // behaviour sense: a ripple
    case 5: ring(0, 0.45); ring(0, -0.45); break // systems thinking: a lattice
    case 6: ring(0, 0.5); break // other: askew
    case 10: line(-6, -14, -10, -14, -10, 14, -6, 14); line(6, -14, 10, -14, 10, 14, 6, 14); break // prototypes: brackets
    case 11: ring(0); w(1.4); line(-6, -22, 0, -30, 6, -22); break // prompts: a caret
    case 12: w(1.3); [-8, 0, 8].forEach((x) => line(x, -12, x, 12)); line(-8, 0, 8, 0); break // builds systems: a frame
    case 13: ring(0); w(1); ring(-8, 0, 0.5); ring(-16, 0, 0.25); break // motion: trailing echoes
    case 14: w(1.3); [-9, -3, 3, 9].forEach((x, j) => line(x, -6 - j * 3, x, 6 + j * 3)); break // data instinct: a tick ladder
    case 15: w(1.2); line(-11, 8, 0, -10, 11, 8, -11, 8); dot(-11, 8, 2.2); dot(0, -10, 2.2); dot(11, 8, 2.2); break // agents: three linked nodes
    case 16: ring(0, -0.5); break // other: askew
  }
}

export class Helix {
  onPreview?: (p: Pick | null) => void
  onPick?: (p: Pick) => void

  W = 0
  H = 0
  compact = false
  private ctx: CanvasRenderingContext2D
  private back = document.createElement('canvas')
  private bctx = this.back.getContext('2d')!
  private io: IntersectionObserver
  private dpr = 1
  private box = { x: 0, y: 0, w: 1, h: 1 }
  private cx = 0
  private cy = 0
  private dy = 1
  private R = 1
  private s = 1
  private ct = 1
  private st = 0
  private raf = 0
  private last = 0
  private visible = false
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  private rot = 0.6
  private spin = 0
  private flick = 0
  private yaw = 0
  /* the close-up: the view leans in toward a locus (zoom about the point fy down the axis) */
  private zoom = 1
  private zoomT = 1
  private fy = 0
  private fyT = 0
  /* every control now sits to the left of the specimen, so both strands turn to face that way */
  controlsLeft = false
  /* the dotted leaders from each control to its locus (off: the lit strand says it on its own) */
  leaders = true
  private yawT = 0
  private moved = false
  private enter = 1
  private picks: [number[], number[]] = [[], []]
  /* when each trait ("side:i") and each link ("h:x") arrived, for their entrances */
  private at = new Map<string, number>()
  private links = new Map<string, number>()
  private preview: Pick | null = null
  private sealed = false
  private sealAt = -1e9
  private anchors: Anchor[] = []
  private cur: XY | null = null
  private near = 0
  private hot: Pick | null = null
  private drag: { x: number; x0: number; t: number; moved: boolean } | null = null

  constructor(private canvas: HTMLCanvasElement, private host: HTMLElement) {
    this.ctx = canvas.getContext('2d')!
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      this.kick()
    })
    this.io.observe(canvas)
    host.addEventListener('pointermove', this.onMove)
    host.addEventListener('pointerleave', this.onLeave)
    canvas.addEventListener('pointerdown', this.onDown)
    window.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointercancel', this.onCancel)
  }
  destroy() {
    this.io.disconnect()
    cancelAnimationFrame(this.raf)
    this.host.removeEventListener('pointermove', this.onMove)
    this.host.removeEventListener('pointerleave', this.onLeave)
    this.canvas.removeEventListener('pointerdown', this.onDown)
    window.removeEventListener('pointerup', this.onUp)
    this.canvas.removeEventListener('pointercancel', this.onCancel)
  }

  /* size the canvas to its stage and the specimen to its box within it */
  layout(box: { x: number; y: number; w: number; h: number }) {
    const r = this.canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    for (const c of [this.canvas, this.back]) {
      c.width = Math.round(r.width * this.dpr)
      c.height = Math.round(r.height * this.dpr)
    }
    this.W = r.width
    this.H = r.height
    this.compact = r.width < 761
    this.box = box
    /* the specimen, its tapes and its tilt all stay inside the box, clear of the hint beneath it */
    this.dy = Math.min(28, (box.h * 0.8) / 23)
    this.R = Math.min(box.w * 0.3, this.dy * 4.3)
    this.s = this.R / 100
    this.cx = box.x + box.w / 2
    this.cy = box.y + box.h / 2 - 16
    this.draw()
  }
  setAnchors(a: Anchor[]) {
    this.anchors = a
    if (!this.raf) this.draw()
  }

  set(hs: number[], xs: number[], preview: Pick | null, sealed: boolean) {
    const now = this.reduced ? -1e9 : performance.now()
    const keep = new Set<string>(), pairs = new Set<string>()
    ;[hs, xs].forEach((list, side) =>
      list.forEach((i) => {
        const k = side + ':' + i
        keep.add(k)
        if (!this.at.has(k)) this.at.set(k, now)
      }),
    )
    /* a new link forms a beat after the trait that makes it */
    hs.forEach((h) =>
      xs.forEach((x) => {
        const k = h + ':' + x
        pairs.add(k)
        if (!this.links.has(k)) this.links.set(k, now + 220)
      }),
    )
    for (const k of [...this.at.keys()]) if (!keep.has(k)) this.at.delete(k)
    for (const k of [...this.links.keys()]) if (!pairs.has(k)) this.links.delete(k)
    const lead = this.picks[0][0] !== hs[0] || this.picks[1][0] !== xs[0]
    this.picks = [hs.slice(), xs.slice()]
    if (preview?.side !== this.preview?.side || preview?.i !== this.preview?.i) this.moved = false
    this.preview = preview
    /* completing the specimen (or changing its lead pair once complete) carries the splice through */
    if (sealed && (!this.sealed || lead)) {
      this.sealAt = now + (this.reduced ? 0 : 450)
      this.moved = false
    }
    this.sealed = sealed
    this.kick()
  }
  /* lean in toward a trait's locus (or toward a strand, i < 0), or stand back with null */
  focusOn(p: Pick | null, z: number) {
    this.zoomT = this.reduced ? 1 : z
    if (p) {
      const loc = p.i >= 0 ? locusOf(p.side, p.i) : locusOf(p.side, Math.floor((COUNT[p.side] - 1) / 2))
      this.fyT = (loc - 11.5) * this.dy
    } else this.fyT = 0
    if (this.reduced) (this.zoom = this.zoomT), (this.fy = this.fyT)
    this.kick()
  }
  /* a splice: the specimen turns round the strand it took, a few quick degrees easing back to drift */
  swirl() {
    if (this.reduced) return
    this.moved = false
    this.flick = 2.4
    this.kick()
  }
  setEnter(e: number) {
    if (this.reduced) e = 1
    if (Math.abs(e - this.enter) < 0.001) return
    this.enter = e
    if (!this.raf) this.draw()
  }

  private kick() {
    if (this.raf) return
    if (this.visible) this.raf = requestAnimationFrame(this.tick)
    else this.draw()
  }
  /* the angle that turns a locus to face its control */
  private faceRot(side: number, i: number) {
    const t = FACE[this.controlsLeft ? 0 : side] - locusOf(side, i) * TW - side * Math.PI
    return this.rot + wrap(t - this.rot)
  }
  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - (this.last || now - 16)) / 1000)
    this.last = now
    const pv = this.preview, [hs] = this.picks
    /* a completed specimen settles on its lead only while the splice carries through; after that it drifts again, so it is never still */
    const sealing = this.sealed && now - this.sealAt < 1400
    const target = this.drag?.moved || this.moved || this.flick > 0.3 ? null : pv ? this.faceRot(pv.side, pv.i) : sealing ? this.faceRot(0, hs[0]) : null
    if (this.drag?.moved) this.spin = 0
    else if (target != null) {
      /* a previewed trait turns to face its control; a completed specimen settles on its lead */
      /* facing it, but still breathing: a slow sway either side of the angle */
      const sway = this.reduced ? 0 : 0.14 * Math.sin(now / 900)
      this.rot += (target + sway - this.rot) * ease(dt, 0.45)
      this.spin = 0
      this.flick = 0
    } else {
      this.spin += ((this.reduced ? 0 : 0.2) - this.spin) * ease(dt, 0.3)
      this.rot += (this.spin + this.flick) * dt
      this.flick *= Math.exp(-dt / 0.6)
      if (Math.abs(this.flick) < 0.002) this.flick = 0
    }
    this.yaw += (this.yawT - this.yaw) * ease(dt, 0.35)
    this.zoom += (this.zoomT - this.zoom) * ease(dt, 0.55)
    this.fy += (this.fyT - this.fy) * ease(dt, 0.55)
    const nearT = this.cur ? 1 : 0
    this.near += (nearT - this.near) * ease(dt, 0.15)
    if (Math.abs(nearT - this.near) < 0.004) this.near = nearT
    this.draw()
    const t = performance.now()
    const latest = Math.max(-1e9, ...this.at.values(), ...this.links.values(), this.sealAt)
    const busy =
      Math.abs(this.zoomT - this.zoom) > 1e-3 || Math.abs(this.fyT - this.fy) > 0.1 ||
      !this.reduced || !!this.drag || this.flick !== 0 || Math.abs(this.yawT - this.yaw) > 1e-3 || this.near !== nearT ||
      (target != null && Math.abs(target - this.rot) > 1e-3) || t - latest < 1600
    this.raf = this.visible && busy ? requestAnimationFrame(this.tick) : 0
    if (!this.raf) this.last = 0
  }

  /* the specimen's space: x, z round the axis, y down it; tilted so the top leans right */
  private p3(t: number, k: number, r = this.R, rot = this.rot + this.yaw) {
    const a = t * TW + rot + k * Math.PI
    return { x: r * Math.cos(a), y: (t - 11.5) * this.dy, z: r * Math.sin(a), a }
  }
  private proj(x: number, y: number, z: number): Q {
    const f = 1 + (0.1 * z) / this.R, px = x * f, py = y * f, Z = this.zoom, k = Z - 1
    /* zoomed about the focus point on the axis, which itself is drawn to the centre of the box */
    const ox = px * this.ct - py * this.st, oy = px * this.st + py * this.ct
    const fx0 = -this.fy * this.st, fy0 = this.fy * this.ct
    return { x: this.cx + ox * Z - fx0 * k, y: this.cy + oy * Z - fy0 * k, z: z / this.R }
  }
  /* a rung's half on side k: its outer end at the strand, its inner end short of the axis */
  private half(i: number, k: number) {
    const o = this.p3(i, k), n = this.p3(i, k, this.R * 0.14)
    return { o: this.proj(o.x, o.y, o.z), n: this.proj(n.x, n.y, n.z) }
  }

  /* the canvas is a control too: a rung at a locus can be previewed and spliced (or unspliced) where
     it sits, and a sideways drag turns the specimen */
  private hit(px: number, py: number): Pick | null {
    if (!this.W) return null
    let best: Pick | null = null, bd = 14
    for (const side of [0, 1] as const)
      for (let i = 0; i < COUNT[side]; i++) {
        const h = this.half(locusOf(side, i), side)
        if (h.o.z < -0.2) continue
        const d = segDist(px, py, h.o, h.n)
        if (d < bd) (bd = d), (best = { side, i })
      }
    return best
  }
  private local(e: PointerEvent): XY {
    const r = this.canvas.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  private onMove = (e: PointerEvent) => {
    const p = this.local(e)
    if (this.drag) {
      const dx = e.clientX - this.drag.x
      if (Math.abs(e.clientX - this.drag.x0) > 4) (this.drag.moved = true), (this.moved = true)
      if (this.drag.moved) {
        this.rot += dx * 0.012
        const dt = Math.max(0.008, (e.timeStamp - this.drag.t) / 1000)
        this.flick = clamp((dx * 0.012) / dt, -3.5, 3.5)
      }
      this.drag.x = e.clientX
      this.drag.t = e.timeStamp
    }
    if (e.pointerType === 'mouse') {
      /* the specimen turns a little toward the cursor, and the rods near it give way */
      this.cur = p
      this.yawT = this.compact ? 0 : clamp((p.x - this.cx) / (this.W * 0.5), -1, 1) * 0.2
      const onCanvas = e.target === this.canvas
      const h = this.drag?.moved || !onCanvas ? null : this.hit(p.x, p.y)
      if (onCanvas && (h?.side !== this.hot?.side || h?.i !== this.hot?.i)) {
        this.hot = h
        this.onPreview?.(h)
      } else if (!onCanvas && this.hot) {
        this.hot = null
        this.onPreview?.(null)
      }
      this.canvas.style.cursor = h ? 'pointer' : this.drag?.moved ? 'grabbing' : 'grab'
    }
    this.kick()
  }
  private onDown = (e: PointerEvent) => {
    if (e.button) return
    this.drag = { x: e.clientX, x0: e.clientX, t: e.timeStamp, moved: false }
    this.flick = 0
    /* keep the drag even if the pointer runs off the canvas or over a control */
    try {
      this.canvas.setPointerCapture(e.pointerId)
    } catch {
      /* not capturable (synthetic event): the window listener still ends the drag */
    }
    this.kick()
  }
  private onUp = (e: PointerEvent) => {
    const d = this.drag
    this.drag = null
    if (!d) return
    if (!d.moved && e.target === this.canvas) {
      const p = this.local(e), h = this.hit(p.x, p.y)
      if (h) this.onPick?.(h)
    }
    this.kick()
  }
  private onCancel = () => {
    this.drag = null
  }
  private onLeave = () => {
    this.cur = null
    this.yawT = 0
    if (this.hot) {
      this.hot = null
      this.onPreview?.(null)
    }
    this.kick()
  }

  private draw() {
    const c = this.ctx, b = this.bctx, { W, H, R, s, dy } = this
    if (!W) return
    const now = performance.now()
    const tilt = 0.17 + this.yaw * 0.25
    this.ct = Math.cos(tilt)
    this.st = Math.sin(tilt)
    for (const x of [c, b]) {
      x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      x.clearRect(0, 0, W, H)
    }
    const [hs, xs] = this.picks

    /* a soft bloom of the brand gradient behind the specimen, violet above warming below */
    const bloom = (x: number, y: number, r: number, col: string) => {
      const g = c.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, col)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = g
      c.fillRect(0, 0, W, H)
    }
    bloom(this.cx, this.cy - this.box.h * 0.22, Math.max(R * 3.4, this.box.h * 0.5), 'rgba(139,61,255,.13)')
    bloom(this.cx, this.cy + this.box.h * 0.26, Math.max(R * 3, this.box.h * 0.42), 'rgba(249,166,119,.07)')

    const items: Item[] = []
    const reach = this.enter * (N + 5)
    const hw = dy * 0.56
    /* each spliced locus, and how far its inlay has run along the strand */
    const inlaid = [hs, xs].map((list, side) =>
      list.map((i) => ({ L: locusOf(side, i), g: smooth((now - (this.at.get(side + ':' + i) ?? -1e9)) / 650) })),
    )
    const pv = this.preview, pvOn = pv ? this.picks[pv.side].includes(pv.i) : false
    const pvL = pv && !pvOn ? locusOf(pv.side, pv.i) : -1
    const fogOf = (z: number) => 0.55 * (1 - (z + 1) / 2) ** 1.3

    /* the strands: broad tapes, each segment lit as the surface it is (the outer face toward the
       viewer at the front, the inner face across the back) */
    const STEP = 0.08
    for (let k = 0; k < 2; k++) {
      for (let t0 = 0; t0 < N - 1 - 1e-6; t0 += STEP) {
        const vis = clamp(reach - t0)
        if (vis <= 0) continue
        const t1 = Math.min(N - 1, t0 + STEP + 0.012)
        const A = this.p3(t0, k), B = this.p3(t1, k)
        const am = (A.a + B.a) / 2, nz = Math.sin(am), inner = nz < 0
        const z = nz
        const tm = t0 + STEP / 2
        /* flat colour from the gradient, quieter on the far side and further back */
        const col = mix(strandAt(k, tm), BG, Math.min(0.85, fogOf(z) + (inner ? 0.3 : 0)))
        /* the ribbon as hairlines: two firm edges and two fine inner lines, over a whisper of fill */
        const lines = [-1, -0.34, 0.34, 1].map((o) => [this.proj(A.x, A.y + o * hw, A.z), this.proj(B.x, B.y + o * hw, B.z)])
        const a0 = lines[0][0], b0 = lines[0][1], a1 = lines[3][0], b1 = lines[3][1]
        let inlay = 0
        for (const { L: Lc, g } of inlaid[k]) {
          const d = Math.abs(tm - Lc), spread = 1.5 * g
          if (d < spread) inlay = Math.max(inlay, 1 - d / spread)
        }
        items.push({
          z,
          f: (x) => {
            x.globalAlpha = vis
            x.fillStyle = rgb(col, inner ? 0.08 : 0.16)
            x.beginPath()
            x.moveTo(a0.x, a0.y)
            x.lineTo(b0.x, b0.y)
            x.lineTo(b1.x, b1.y)
            x.lineTo(a1.x, a1.y)
            x.closePath()
            x.fill()
            lines.forEach(([p, q], j) => {
              const edge = j === 0 || j === 3
              x.lineWidth = edge ? 1.1 : 0.6
              x.strokeStyle = rgb(col, edge ? 0.95 : 0.45)
              x.beginPath()
              x.moveTo(p.x, p.y)
              x.lineTo(q.x, q.y)
              x.stroke()
            })
            if (inlay > 0) {
              x.strokeStyle = rgb(mix(X, BG, fogOf(z)), 0.95 * inlay)
              x.lineWidth = 1.6 * s + 0.4
              x.beginPath()
              x.moveTo((a0.x + a1.x) / 2, (a0.y + a1.y) / 2)
              x.lineTo((b0.x + b1.x) / 2, (b0.y + b1.y) / 2)
              x.stroke()
            }
            x.globalAlpha = 1
          },
        })
      }
    }

    /* the base pairs: jointed rods from each strand toward the axis, ending in a bead; the rods near
       the cursor give way a little */
    const give = (p: XY): XY => {
      if (!this.cur || !this.near) return p
      const dx = p.x - this.cur.x, dyy = p.y - this.cur.y, d = Math.hypot(dx, dyy), reachC = 90
      if (d >= reachC || d < 1) return p
      const f = (1 - d / reachC) ** 2 * 6 * this.near
      return { x: p.x + (dx / d) * f, y: p.y + (dyy / d) * f }
    }
    for (let i = 0; i < N; i++) {
      const ri = clamp(reach - 3 - i)
      if (ri <= 0) continue
      for (const k of [0, 1]) {
        const h = this.half(i, k)
        const o = h.o, n0 = give(h.n)
        const n = { x: o.x + (n0.x - o.x) * ri, y: o.y + (n0.y - o.y) * ri }
        const mine = inlaid[k].find((g) => g.L === i)
        const hover = pvL === i && pv?.side === k
        const z = (o.z + h.n.z) / 2
        const gp = mine ? mine.g : 0
        const base = mix(strandAt(k, i), BG, Math.min(0.85, fogOf(o.z) + 0.12))
        const col = gp > 0 ? mix(base, X, gp) : base
        const w = (1.3 + 0.4 * o.z) * s + 0.6 + (gp > 0 ? 0.8 : 0)
        items.push({
          z: z - 0.05,
          f: (x) => {
            x.lineCap = 'round'
            x.globalAlpha = ri
            const rod = (cs: string, lw: number) => {
              x.strokeStyle = cs
              x.lineWidth = lw
              x.beginPath()
              x.moveTo(o.x, o.y)
              x.lineTo(n.x, n.y)
              x.stroke()
            }
            if (hover) rod(rgb(COTTON, 0.35), w + 4)
            rod(rgb(col, 0.9), w)
            const r = (2.2 + 0.5 * h.n.z) * s + 1.1
            if (gp > 0) {
              const glow = x.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5)
              glow.addColorStop(0, `rgba(243,103,18,${0.35 * gp})`)
              glow.addColorStop(1, 'rgba(243,103,18,0)')
              x.fillStyle = glow
              x.beginPath()
              x.arc(n.x, n.y, r * 5, 0, TAU)
              x.fill()
            }
            /* a flat bead with a fine ring, as the site's diagrams mark a point */
            x.fillStyle = rgb(gp > 0 ? col : BG)
            x.strokeStyle = rgb(col)
            x.lineWidth = 1
            x.beginPath()
            x.arc(n.x, n.y, r, 0, TAU)
            x.fill()
            x.stroke()
            if (hover) {
              x.strokeStyle = rgb(COTTON, 0.9)
              x.lineWidth = 1
              x.beginPath()
              x.arc(n.x, n.y, r + 3, 0, TAU)
              x.stroke()
            }
            x.globalAlpha = 1
          },
        })
      }
    }

    /* the collars: committed ones close in (with a short echo of the moment), previews are dashed */
    const mark = (side: number, i: number, hover: boolean) => {
      const Lc = locusOf(side, i), A = this.p3(Lc, side), B = this.p3(Lc + 0.06, side)
      const S = this.proj(A.x, A.y, A.z), S2 = this.proj(B.x, B.y, B.z)
      const ang = Math.atan2(S2.y - S.y, S2.x - S.x), t0 = this.at.get(side + ':' + i) ?? -1e9
      /* a collar only shows once the specimen has drawn in as far as its locus, as the rungs do */
      const built = clamp(reach - 3 - Lc)
      if (built <= 0) return
      const p = hover ? 1 : smooth((now - t0 - 80) / 450)
      const echo = hover ? 1 : (now - t0) / 1200
      const cs = (hw + 5) / 13
      items.push({
        z: S.z + 0.04,
        f: (x) => {
          x.save()
          x.translate(S.x, S.y)
          x.rotate(ang)
          x.scale(cs, cs * (0.4 + 0.6 * p))
          x.globalAlpha = (hover ? 0.85 : p) * (S.z < -0.3 ? 0.5 : 1) * built
          x.strokeStyle = x.fillStyle = hover ? rgb(COTTON) : rgb(X)
          x.setLineDash(hover ? [2.5, 2.5] : [])
          collar(x, side, i, hover)
          x.restore()
          if (echo < 1) {
            x.lineWidth = 1
            for (const [r0, r1, a] of [[14, 60, 0.45], [14, 96, 0.2]]) {
              x.strokeStyle = rgb(X, a * (1 - echo) * built)
              x.beginPath()
              x.arc(S.x, S.y, lerp(r0, r1, smooth(echo)) * s + 4, 0, TAU)
              x.stroke()
            }
          }
        },
      })
    }
    hs.forEach((i) => mark(0, i, false))
    xs.forEach((i) => mark(1, i, false))
    if (pv && !pvOn) mark(pv.side, pv.i, true)

    /* the links: every human trait to every X trait, through the interior. Fine bone rods with
       tangerine ends; once the specimen is complete the leading one carries the splice through */
    for (const [key, t0] of this.links) {
      const grow = smooth((now - t0) / 900)
      if (grow <= 0) continue
      const [h, xx] = key.split(':').map(Number), lead = h === hs[0] && xx === xs[0]
      /* and a link only once both its ends have been drawn in */
      const built = Math.min(clamp(reach - 3 - locusOf(0, h)), clamp(reach - 3 - locusOf(1, xx)))
      if (built <= 0) continue
      const e0 = this.half(locusOf(0, h), 0).n, e1 = this.half(locusOf(1, xx), 1).n
      const mx = (e0.x + e1.x) / 2, my = (e0.y + e1.y) / 2, len = Math.hypot(e1.x - e0.x, e1.y - e0.y) || 1
      const ctl = { x: mx + ((e1.y - e0.y) / len) * len * 0.12, y: my - ((e1.x - e0.x) / len) * len * 0.12 }
      const at = (t: number): XY => {
        const u = 1 - t
        return { x: u * u * e0.x + 2 * u * t * ctl.x + t * t * e1.x, y: u * u * e0.y + 2 * u * t * ctl.y + t * t * e1.y }
      }
      const steps = 48, end = Math.max(1, Math.round(steps * grow))
      const pts = Array.from({ length: end + 1 }, (_, j) => at(j / steps))
      const sp = lead && this.sealed ? clamp((now - this.sealAt) / 1100) : 0
      const w = (lead ? 1.8 : 1) * s + 0.5
      items.push({
        z: lead ? 0.12 : 0.08,
        f: (x) => {
          x.lineCap = 'round'
          for (const [lw, dark] of [[w, 0]]) {
            for (let j = 0; j < end; j++) {
              const t = j / steps, hot = sp > 0 && t <= smooth(sp)
              const col = hot ? X : t < 0.12 ? mix(X, BONE, t / 0.12) : t > 0.88 ? mix(X, BONE, (1 - t) / 0.12) : BONE
              x.strokeStyle = rgb(mix(col, BLACK, dark), (lead ? 1 : 0.75) * built)
              x.lineWidth = lw
              x.beginPath()
              x.moveTo(pts[j].x, pts[j].y)
              x.lineTo(pts[j + 1].x, pts[j + 1].y)
              x.stroke()
            }
          }
          /* the splice: a bright bead carried from the human locus to the X locus */
          if (sp > 0 && sp < 1 && built >= 1) {
            const q = at(smooth(sp)), r = 3 * s + 2
            const g = x.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * 6)
            g.addColorStop(0, 'rgba(255,214,180,.9)')
            g.addColorStop(0.25, 'rgba(243,103,18,.45)')
            g.addColorStop(1, 'rgba(243,103,18,0)')
            x.fillStyle = g
            x.beginPath()
            x.arc(q.x, q.y, r * 6, 0, TAU)
            x.fill()
          }
        },
      })
    }

    /* far side first, softened, so the near side reads in front of it */
    items.sort((p, q) => p.z - q.z)
    let k = 0
    for (; k < items.length && items[k].z < -0.3; k++) items[k].f(b)
    c.save()
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.filter = `blur(${1.3 * this.dpr}px)`
    c.drawImage(this.back, 0, 0)
    c.restore()
    for (; k < items.length; k++) items[k].f(c)

    /* the leaders: a dotted line from each chosen (or previewed) trait's control to its locus */
    if (this.compact || !this.leaders) return
    c.setLineDash([2, 4])
    c.lineWidth = 1
    for (const a of this.anchors) {
      const on = this.picks[a.side].includes(a.i), pre = pv?.side === a.side && pv.i === a.i && !on
      if (!on && !pre) continue
      const T = this.half(locusOf(a.side, a.i), a.side).o
      const dir = a.side && !this.controlsLeft ? -1 : 1, x1 = a.x + dir * 18
      c.globalAlpha = this.enter * (T.z < -0.2 ? 0.4 : 1)
      c.strokeStyle = on ? rgb(X, 0.8) : rgb(COTTON, 0.6)
      c.beginPath()
      c.moveTo(a.x, a.y)
      c.lineTo(x1, a.y)
      c.bezierCurveTo(x1 + dir * Math.abs(T.x - x1) * 0.5, a.y, T.x - dir * 20, T.y, T.x, T.y)
      c.stroke()
    }
    c.setLineDash([])
    c.globalAlpha = 1
  }
}
