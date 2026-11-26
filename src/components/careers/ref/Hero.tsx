"use client";

import { useEffect, useRef, type MouseEvent } from 'react'
import { measureEdges, revealConstruction } from './construction'
import { goToScene, onScrollFrame, ramp, registerScene, sceneProgress, smooth, smoother, motionOn } from './scroll'
import { Arrow } from './Arrow'

type Edge = 't' | 'r' | 'b' | 'l'
type Box = Record<Edge, number>
const E: Edge[] = ['t', 'r', 'b', 'l']
const box = (): Box => ({ t: 0, r: 0, b: 0, l: 0 })


/* Find your X / See open roles: both sections open with the scroll, so landing on their top edge
   showed them unbuilt (the gene still dark, the openings list empty); go on to where each stands
   fully open instead — the gene by 0.85 of a screen, the list by 0.9 (Gene.tsx / OpenRoles.tsx) */
const toGene = (e: MouseEvent<HTMLAnchorElement>) => goToScene(e, 'gene', 'gn-pin', 0.95)
const toRoles = (e: MouseEvent<HTMLAnchorElement>) => goToScene(e, 'roles', 'or-pin', 0.9)

export default function Hero() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const stopRef = useRef<HTMLButtonElement>(null)
  /* how far the scroll has opened the canvas: right/bottom edges, then the top-left corner */
  const expandRef = useRef({ rb: 0, tl: 0 })
  const applyRef = useRef<(() => void) | null>(null)

  /* live canvas edges: four damped springs, run only while something is moving (ported from V3) */
  useEffect(() => {
    const root = document.documentElement
    const reduce = !motionOn()
    const stage = stageRef.current!
    const probe = stage.querySelector<HTMLElement>('.probe')!
    const brief = stage.querySelector<HTMLElement>('.brief')!
    const l1 = stage.querySelector<HTMLElement>('.hl.in .l1')!
    const ctas = Array.from(stage.querySelectorAll<HTMLAnchorElement>('.ctas a'))

    let rest = box()
    const cur = box(), vel = box(), tgt = box()
    let W = 0, H = 0
    let K = 260, C = 17 /* stiffness / damping: quick and elastic, a little overshoot and a soft bounce */
    let raf = 0, last = 0, reaching = false, px = -1, py = -1
    let disposed = false, ready = false
    const timers: number[] = []
    let rt = 0

    function measure() {
      const s = stage.getBoundingClientRect(), p = probe.getBoundingClientRect()
      W = s.width
      H = s.height
      rest = { t: p.top - s.top, r: s.right - p.right, b: s.bottom - p.bottom, l: p.left - s.left }
    }
    /* the springs' edges, opened further by the scroll: at the top of the page both factors are 0
       and this writes exactly the springs' values; as the page scrolls they carry every edge to 0 */
    function apply() {
      if (!ready) return
      const x = expandRef.current
      E.forEach((e) => {
        const k = e === 'r' || e === 'b' ? x.rb : x.tl
        stage.style.setProperty('--c' + e, (cur[e] * (1 - k)).toFixed(2) + 'px')
      })
    }
    applyRef.current = apply
    function step(ts: number) {
      const dt = Math.min(0.034, (ts - (last || ts)) / 1000 || 0.016)
      let moving = false
      last = ts
      E.forEach((e) => {
        const a = K * (tgt[e] - cur[e]) - C * vel[e]
        vel[e] += a * dt
        cur[e] += vel[e] * dt
        if (Math.abs(tgt[e] - cur[e]) > 0.05 || Math.abs(vel[e]) > 0.05) moving = true
        else {
          cur[e] = tgt[e]
          vel[e] = 0
        }
      })
      apply()
      raf = moving ? requestAnimationFrame(step) : 0
      if (!moving) last = 0
    }
    function kick() {
      if (!raf && !disposed) raf = requestAnimationFrame(step)
    }

    const R = 260
    const ease = (d: number) => {
      const k = Math.max(0, 1 - d / R)
      return k * k * (3 - 2 * k)
    }
    /* follow: the top-left corner holds still; the right and bottom edges track the pointer across
       the whole screen. Each edge rests until the pointer comes within the last part of the canvas
       (LEAD of its rest size), then travels with it, reaching the screen edge as the pointer does. */
    /* it takes up the pointer early (about halfway across) and moves with it in proportion */
    const LEAD = { x: 0.5, y: 0.55 }, END = 16
    const smooth = (t: number) => {
      const k = Math.min(1, Math.max(0, t))
      return k * (1.35 - 0.35 * k) /* nearly linear: tied to the pointer, easing only as it nears the edge */
    }
    function aim() {
      E.forEach((e) => (tgt[e] = rest[e]))
      if (px >= 0) {
        const rx = W - rest.r, by = H - rest.b
        const sx = rx - LEAD.x * (rx - rest.l), sy = by - LEAD.y * (by - rest.t)
        tgt.r = rest.r * (1 - smooth((px - sx) / (W - END - sx)))
        tgt.b = rest.b * (1 - smooth((py - sy) / (H - END - sy)))
      }
      if (reaching) {
        /* take in the whole copy column, so the edge never stops halfway through a sentence;
           never pulls back an edge the pointer has already carried further */
        const s = stage.getBoundingClientRect(), c = brief.getBoundingClientRect()
        tgt.r = Math.min(tgt.r, Math.max(10, s.right - c.right - 40))
        tgt.b = Math.min(tgt.b, Math.max(10, s.bottom - c.bottom - 40))
      }
    }

    function init() {
      if (disposed) return
      measure()
      E.forEach((e) => {
        cur[e] = tgt[e] = rest[e]
        vel[e] = 0
      })
      ready = true
      if (reduce) return apply()
      /* arrival: start as a tight sheet around the first line, then let it open */
      const s = stage.getBoundingClientRect(), b = l1.getBoundingClientRect()
      cur.r = Math.max(rest.r, s.right - b.right - 28)
      cur.b = Math.max(rest.b, s.bottom - b.bottom - 34)
      apply()
      const k0 = K, c0 = C
      K = 34
      C = 11.2 /* slow, critically damped opening */
      timers.push(window.setTimeout(kick, 420))
      timers.push(window.setTimeout(() => ((K = k0), (C = c0)), 2200))
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init)
    else init()

    const onResize = () => {
      clearTimeout(rt)
      rt = window.setTimeout(() => {
        measure()
        aim()
        if (reduce) {
          E.forEach((e) => (cur[e] = tgt[e]))
          apply()
        } else kick()
      }, 80)
    }
    window.addEventListener('resize', onResize)

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const s = stage.getBoundingClientRect()
      px = e.clientX - s.left
      py = e.clientY - s.top
      aim()
      kick()
    }
    const onLeave = () => {
      px = py = -1
      aim()
      kick()
    }
    /* touch: a tap nudges the nearest edges outward and lets them settle back */
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      const s = stage.getBoundingClientRect(), x = e.clientX - s.left, y = e.clientY - s.top
      vel.r -= 900 * (0.35 + ease(Math.abs(x - (W - rest.r))))
      vel.b -= 760 * (0.35 + ease(Math.abs(y - (H - rest.b))))
      kick()
    }
    /* the canvas reaches the call to action (mouse and keyboard alike) */
    const reach = (on: boolean) => {
      reaching = on
      aim()
      kick()
    }
    const ctaHandlers = (reduce ? [] : ctas).map((a) => {
      const h = {
        pointerenter: (e: Event) => (e as PointerEvent).pointerType === 'mouse' && reach(true),
        pointerleave: (e: Event) => (e as PointerEvent).pointerType === 'mouse' && reach(false),
        focus: () => a.matches(':focus-visible') && reach(true),
        blur: () => reach(false),
      }
      Object.entries(h).forEach(([t, fn]) => a.addEventListener(t, fn))
      return h
    })

    if (!reduce) {
      stage.addEventListener('pointermove', onMove, { passive: true })
      stage.addEventListener('pointerleave', onLeave)
      stage.addEventListener('pointerdown', onDown, { passive: true })
    }

    return () => {
      disposed = true
      applyRef.current = null
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      clearTimeout(rt)
      window.removeEventListener('resize', onResize)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
      stage.removeEventListener('pointerdown', onDown)
      ctaHandlers.forEach((h, i) =>
        Object.entries(h).forEach(([t, fn]) => ctas[i].removeEventListener(t, fn)),
      )
    }
  }, [])

  /* the full stop reveals what's underneath: one pulse uncovers the construction of "edges."
     (contours, anchor points, guides to the canvas) and lets it recede. An overlay with its own
     timeline, entirely apart from the canvas edges; one reveal at a time. */
  useEffect(() => {
    if (!motionOn()) return
    const stage = stageRef.current!, btn = stopRef.current!
    let cancel: (() => void) | null = null
    let rt = 0, disposed = false

    /* the hit target sits on the dot's true centre, measured from the set type */
    function place() {
      const { fs, dot } = measureEdges(stage)
      const hit = Math.max(44, fs * 0.3)
      btn.style.width = btn.style.height = hit + 'px'
      btn.style.left = dot.x - hit / 2 + 'px'
      btn.style.top = dot.y - hit / 2 + 'px'
    }
    const onClick = () => {
      if (cancel) return
      stage.classList.add('revealing')
      cancel = revealConstruction(stage, () => {
        cancel = null
        stage.classList.remove('revealing')
      })
    }
    const onResize = () => {
      clearTimeout(rt)
      rt = window.setTimeout(place, 80)
    }

    document.fonts.ready.then(() => !disposed && place())
    window.addEventListener('resize', onResize)
    btn.addEventListener('click', onClick)
    return () => {
      disposed = true
      cancel?.()
      stage.classList.remove('revealing')
      clearTimeout(rt)
      window.removeEventListener('resize', onResize)
      btn.removeEventListener('click', onClick)
    }
  }, [])

  /* the change of canvas: scrolling first opens the canvas past its edges until it is the whole
     screen (right and bottom edges first, from the fixed top-left corner, which lets go last), then
     the canvas turns white and the homepage gives way to the manifesto. Everything is a pure
     function of scroll position, so it reverses exactly; the page itself is never held. */
  useEffect(() => {
    if (!motionOn()) return
    const stage = stageRef.current!, scene = sceneRef.current!
    registerScene(scene, stage)
    const wash = stage.querySelector<HTMLElement>('.wash')!
    const brief = stage.querySelector<HTMLElement>('.brief')!
    /* fade the blended pieces themselves: fading a wrapper would isolate their "difference" */
    const copy = Array.from(stage.querySelectorAll<HTMLElement>('.lede, .btn .ink, .lnk, .meta'))
    const lines = [1, 2, 3].map((i) => Array.from(stage.querySelectorAll<HTMLElement>(`.hl .l${i}`)))

    const fade = (els: HTMLElement[], o: number) =>
      els.forEach((el) => (el.style.filter = o < 1 ? `opacity(${o.toFixed(3)})` : ''))
    const hide = (el: HTMLElement, gone: boolean) => (el.style.visibility = gone ? 'hidden' : '')
    /* each headline line is erased by an edge travelling left to right, in reading order */
    const erase = (els: HTMLElement[], x: number) =>
      els.forEach((el) => {
        el.style.clipPath = x > 0 ? `inset(-.3em -.3em -.3em calc(${x.toFixed(4)} * (100% + .4em) - .2em))` : ''
      })

    return onScrollFrame({
      update(y) {
        const p = sceneProgress(y)
        expandRef.current.rb = smoother(p / 0.46)
        expandRef.current.tl = smoother(ramp(p, 0.28, 0.48))
        applyRef.current?.()

        const c = 1 - smooth(ramp(p, 0.32, 0.46))
        fade(copy, c)
        hide(brief, c <= 0)
        lines.forEach((els, i) => erase(els, smooth(ramp(p, 0.38 + i * 0.04, 0.5 + i * 0.04))))
        /* the full stop and its construction step aside once the headline starts to leave */
        stage.toggleAttribute('data-away', p > 0.34)

        const w = smooth(ramp(p, 0.44, 0.72))
        wash.style.opacity = w > 0 ? w.toFixed(4) : ''
      },
    })
  }, [])

  /* one look for everyone: the graphite frame and white canvas (there is no dark mode); the
     theme-ready class only lets colour changes ease once the page has loaded */
  useEffect(() => {
    const root = document.documentElement
    let t = 0
    const ready = () => (t = window.setTimeout(() => document.querySelector('.hxc')?.classList.add('theme-ready'), 50))
    if (document.readyState === 'complete') ready()
    else window.addEventListener('load', ready)
    return () => {
      window.removeEventListener('load', ready)
      clearTimeout(t)
    }
  }, [])

  return (
    <div className="scene" ref={sceneRef}>
      <div className="stage" id="top" ref={stageRef}>
        <div className="probe" aria-hidden="true" />
        <div className="canvas" aria-hidden="true" />
        {/* the white the canvas turns into on the way to the manifesto; invisible until then */}
        <div className="wash" aria-hidden="true" />

        {/* headline, twice: light on the frame, ink on the canvas (clipped to the same live edges) */}
        <div className="hl out" aria-hidden="true">
          <span className="l l1">Your canvas</span>
          <span className="l l2">Has no</span>
          <span className="l l3">
            Edges<span className="dot">.</span>
            <i className="bl" />
          </span>
        </div>
        <h1 className="hl in">
          <span className="l l1">Your canvas</span>{' '}
          <span className="l l2">Has no</span>{' '}
          <span className="l l3">
            Edges<span className="dot">.</span>
          </span>
        </h1>


        <div className="brief">
          <p className="lede ink">
            {/* set on four lines on wide screens; it wraps freely below */}
            <span className="ln">New tools, shifting roles, the same way of </span>
            <span className="ln">thinking. Shape the question, put it in people’s </span>
            <span className="ln">hands, see what it changes. Design here was </span>
            <span className="ln">never confined to a screen.</span>
          </p>
          <div className="ctas">
            <a className="btn" id="cta" href="#roles" onClick={toRoles}>
              <span className="ink">
                See open roles{' '}
                <span className="arr" aria-hidden="true">
                  <Arrow />
                </span>
              </span>
            </a>
            <a className="lnk ink" href="#gene" onClick={toGene}>
              Find your X<i aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* after the copy in DOM order: above the headline layers, and tabbed to after the calls to action */}
        <button className="stop" ref={stopRef} type="button" aria-label="Reveal how the headline is built" />

      </div>
    </div>
  )
}
