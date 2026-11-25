"use client";

import { Fragment, useEffect, useRef } from 'react'
import { activeAt, darkAt, Field, HOLD } from './field'
import { lineBands, maskLines, resetMask, type Band } from './reveal'
import { onScrollFrame, ramp, sceneProgress, smooth, motionOn } from './scroll'

/* each heading: what it is, then (in the quieter ink) what it isn't */
const PRINCIPLES = [
  {
    kicker: 'Make, test, learn',
    head: ['Make it real, early.', 'Not a perfect process.'],
    copy: 'Turn ideas into something people can use, quickly. Test it, learn from what happens, and validate before you invest more.',
  },
  {
    kicker: 'Outcomes over tools',
    head: ['Move the needle.', 'Not just the pixels.'],
    copy: 'We’re measured by the problems we solve and the behaviour we change. Tools are how we get there, never the point.',
  },
  {
    kicker: 'Designers in the driver’s seat',
    head: ['Recommend what’s right.', 'Not just what’s asked.'],
    copy: 'Challenge the brief, weigh the trade-offs, and say what’s right for users and the business. You’re the consultant in the room, not a pair of hands.',
  },
]

export default function Manifesto() {
  const secRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const js = motionOn()
    const sec = secRef.current!
    const statement = sec.querySelector<HTMLElement>('.mf-statement')!
    const wrap = sec.querySelector<HTMLElement>('.mf-principles')!
    const stage = sec.querySelector<HTMLElement>('.mf-stage')!
    const rows = Array.from(sec.querySelectorAll<HTMLElement>('.mf-row'))
    const heads = rows.map((r) => r.querySelector<HTMLElement>('.mf-h')!)
    const idx = rows.map((r) => r.querySelector<HTMLElement>('.mf-idx')!)
    const fill = sec.querySelector<HTMLElement>('.mf-fill')!
    const mark = sec.querySelector<HTMLElement>('.mf-mark')!
    const steps = sec.querySelector<HTMLElement>('.mf-steps')!
    const stepN = steps.querySelector<HTMLElement>('b')!
    const liveCanvas = sec.querySelector<HTMLCanvasElement>('.mf-field-live')!
    const live = new Field(liveCanvas)
    /* the static copies, one per principle, each held at the end of its own beat on its own tone */
    const held = Array.from(sec.querySelectorAll<HTMLCanvasElement>('.mf-row .mf-fig'), (c) => new Field(c, true))

    /* 03's micro-interaction: the visitor's cursor is one more input to the field */
    const onPointer = (e: PointerEvent) => e.pointerType === 'mouse' && pinned && live.pointer(e.clientX, e.clientY, e.type !== 'pointerleave')
    liveCanvas.addEventListener('pointermove', onPointer)
    liveCanvas.addEventListener('pointerleave', onPointer)

    /* pinned: one stage holds while the scroll rearranges the field and swaps the copy in place.
       Phones pin too, stacked: the drawing above, the principle beneath. Without script (or with
       reduced motion) the plain list stays, each principle with its own held drawing. */
    const wide = matchMedia('(min-width: 1px)')
    let pinned = false
    let V = 1, wrapTop = 0, wrapH = 1, stageH = 1
    let rowTop: number[] = [], anchor: number[] = []
    let headBands: Band[][] = []
    /* the statement's words (and the orange X after "tools.") arrive one after another, each rising
       a touch and sharpening out of a blur — the homepage philosophy reveal */
    const words = Array.from(statement.querySelectorAll<HTMLElement>('.mfw, .mfw-i'))
    /* the heading's ink is one gradient over both lines; give every word its own slice of it, so a
       word can blur and move on its own and still carry exactly the colour it had in place */
    function sliceInk() {
      const s = statement.getBoundingClientRect()
      words.forEach((w) => {
        if (!w.classList.contains('mfw')) return
        const r = w.getBoundingClientRect()
        w.style.backgroundSize = `${s.width.toFixed(1)}px ${s.height.toFixed(1)}px`
        w.style.backgroundPosition = `${(s.left - r.left).toFixed(1)}px ${(s.top - r.top).toFixed(1)}px`
      })
    }

    function measure() {
      /* changing layout mode lands on its state at once, rather than fading the copy across */
      if (pinned !== (js && wide.matches)) {
        sec.classList.add('mf-settling')
        requestAnimationFrame(() => requestAnimationFrame(() => sec.classList.remove('mf-settling')))
      }
      pinned = js && wide.matches
      sec.classList.toggle('mf-pinned', pinned)
      held.forEach((f, i) => f.paint(HOLD[i]))
      if (!pinned) {
        exitOut(0)
        stage.style.background = ''
        stage.classList.remove('is-dark')
      }
      V = window.innerHeight
      const sy = window.scrollY, w = wrap.getBoundingClientRect()
      wrapTop = w.top + sy
      wrapH = Math.max(1, w.height)
      stageH = Math.max(1, stage.offsetHeight)
      rowTop = rows.map((r) => r.getBoundingClientRect().top + sy - wrapTop)
      /* the marker rests beside each index, as the nav's dot sits beside "Careers" */
      anchor = idx.map((el) => {
        const q = el.getBoundingClientRect()
        return q.top + q.height / 2 + sy - wrapTop
      })
      if (!js) return
      heads.forEach(resetMask)
      /* measured with the words at rest, so each slice lines up with the whole heading */
      words.forEach((w) => ((w.style.transform = ''), (w.style.filter = ''), (w.style.opacity = '')))
      sliceInk()
      headBands = pinned ? [] : heads.map(lineBands)
    }
    const onWide = () => {
      measure()
      update(window.scrollY)
    }
    wide.addEventListener('change', onWide)

    /* the pinned drawing's own pace: progress eases toward where the scroll has put it (~0.32s), on
       top of the page's shared scroll easing. Reduced motion follows the scroll directly. */
    const calm = matchMedia('(prefers-reduced-motion: reduce)')
    const TAU_T = 0.32
    let tTarget = 0, tShown = 0, enterNow = 0, tRaf = 0, tLast = 0
    /* scroll to story: each principle gets an equal third of the scroll, played across its own part
       of the drawing's story (01: 0-0.36, 02: 0.36-0.66, 03: 0.66-1) */
    const PART = [0, 0.36, 0.66, 1]
    const story = (u: number) => {
      const i = Math.min(2, Math.floor(u * 3))
      return PART[i] + (PART[i + 1] - PART[i]) * (u * 3 - i)
    }
    /* the drawing keeps its own time: the scroll only says which principle is up (each still gets an
       equal third of the track); once one comes up, its part of the story plays through by itself to
       its held frame. Scrolling back, or skipping ahead, first eases the field to the start of that
       principle's part, then plays it. Reduced motion keeps the drawing on the scroll. */
    /* unhurried: seconds for the whole story, shared out by each part's length (about five seconds
       a principle), so a reader who lingers watches it build, and one who scrolls on is not rushed */
    const PACE = 16, MIN_BEAT = 4.5
    /* moves at once (arriving with the copy), then settles slowly into its held frame */
    const ease = (p: number) => 1 - Math.pow(1 - p, 2.4)
    let beat = -1, tDraw = 0, segs: [number, number, number, number?][] = [], segAt = 0, dRaf = 0
    const drawField = () => {
      live.paint(tDraw, enterNow)
      stage.classList.toggle('is-dark', darkAt(tDraw))
    }
    function tick(now: number) {
      dRaf = 0
      const seg = segs[0]
      if (!seg) return
      if (!segAt) segAt = now
      const [a, b, dur, glide] = seg
      const p = Math.min(1, (now - segAt) / 1000 / dur)
      /* a glide picks up from a drawing already in motion, so it starts moving rather than from rest */
      tDraw = a + (b - a) * (glide ? Math.sin((Math.PI / 2) * p) : ease(p))
      if (pinned) drawField()
      if (p >= 1) {
        segs.shift()
        segAt = 0
      }
      if (segs.length) dRaf = requestAnimationFrame(tick)
    }
    /* the hand-over: when the reader moves to another principle before the last one has finished (or
       goes back), the frame on screen is lifted onto a ghost that fades away while the new principle
       starts its own drawing beneath it; nothing is hurried, and the old one stops where it was */
    const ghost = document.createElement('canvas')
    ghost.className = 'mf-ghost'
    ghost.setAttribute('aria-hidden', 'true')
    ghost.style.cssText = 'position:absolute;pointer-events:none;opacity:0'
    liveCanvas.after(ghost)
    const drawBox = liveCanvas.parentElement!
    if (getComputedStyle(drawBox).position === 'static') drawBox.style.position = 'relative'
    function crossfade() {
      ghost.width = liveCanvas.width
      ghost.height = liveCanvas.height
      Object.assign(ghost.style, {
        left: liveCanvas.offsetLeft + 'px', top: liveCanvas.offsetTop + 'px',
        width: liveCanvas.offsetWidth + 'px', height: liveCanvas.offsetHeight + 'px',
        transition: 'none', opacity: '0',
      })
      const g = ghost.getContext('2d')!
      g.clearRect(0, 0, ghost.width, ghost.height)
      g.drawImage(liveCanvas, 0, 0)
      /* in step with the copy leaving: the same .45s on the same curve */
      ghost.getAnimations().forEach((a) => a.cancel())
      ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' })
    }
    function playBeat(i: number) {
      const was = beat
      beat = i
      const from = PART[i], to = HOLD[i]
      segs = []
      const unfinished = was >= 0 && i > was && tDraw < (HOLD[i - 1] ?? 0) - 0.004
      if (unfinished || tDraw > to + 0.002) {
        /* moved on mid-drawing, or went back: cross-fade, and this principle builds from its start */
        crossfade()
        tDraw = from
        drawField()
        segs.push([from, to, Math.max(MIN_BEAT, (to - from) * PACE)])
      } else {
        /* the last one had finished (or it is the first): it carries straight on into this one */
        segs.push([tDraw, to, Math.max(MIN_BEAT, (to - tDraw) * PACE)])
      }
      segAt = 0
      if (!dRaf) dRaf = requestAnimationFrame(tick)
    }

    function paintPinned(u: number) {
      const t = story(u)
      /* the beat in view, by the scroll; the field ripples in from its corner as the stage comes up */
      const want = Math.min(2, Math.floor(u * 3))
      if (calm.matches) {
        tDraw = t
        drawField()
      } else if (enterNow < 0.6) {
        /* not up yet: held at the start, ready to play when it arrives */
        if (beat !== -1 || tDraw !== 0) {
          beat = -1
          segs = []
          tDraw = 0
        }
        drawField()
      } else if (want !== beat) playBeat(want)
      else if (!dRaf) drawField()
      /* the stage holds white throughout */
      /* once the exit is darkening the stage, it owns the background */
      if (!(exitWas > 0.5)) stage.style.background = '#fff'
      const on = calm.matches ? activeAt(t) : want
      rows.forEach((r, i) => r.classList.toggle('on', i === on))
      steps.dataset.on = String(on)
      stepN.textContent = String(on + 1).padStart(2, '0')
      mark.style.transform = `translateY(${(u * stageH).toFixed(2)}px)`
      fill.style.transform = `scaleY(${u.toFixed(5)})`
    }
    /* the hand-off to the gene, over the last screen of scroll: the copy dips out line by line, the
       drawing draws back and fades, and the stage darkens into the gene's chamber, which then opens
       out of it. Reduced motion keeps the fades and drops the movement. */
    /* the hand-off's length, in screens: long on desktop, where the gene is laid over it; short on
       phones, where the gene simply follows on */
    const narrow = matchMedia('(max-width: 760px)')
    const exitLen = () => (narrow.matches ? 0.2 : 1.1)
    const side = stage.querySelector<HTMLElement>('.mf-side')!, draw = stage.querySelector<HTMLElement>('.mf-draw')!
    const rail = stage.querySelector<HTMLElement>('.mf-rail')!
    let exitWas = -1
    function exitOut(e: number) {
      if (Math.abs(e - exitWas) < 0.0005) return
      exitWas = e
      const move = !calm.matches
      const row = rows[rows.length - 1]
      const lines = [steps, ...['.mf-h', '.mf-copy'].map((q) => row.querySelector<HTMLElement>(q)!)]
      lines.forEach((el, j) => {
        const p = smooth(ramp(e, j * 0.07, 0.32 + j * 0.07))
        el.style.opacity = p ? String(1 - p) : ''
        el.style.transform = p && move ? `translateY(${(p * p * 72).toFixed(1)}px)` : ''
      })
      const d = smooth(ramp(e, 0.22, 0.68))
      draw.style.opacity = d ? String(1 - d) : ''
      draw.style.transform = d && move ? `scale(${(1 - 0.16 * d).toFixed(4)})` : ''
      rail.style.opacity = d ? String(1 - d) : ''
      side.style.pointerEvents = e > 0.3 ? 'none' : ''
      const k = smooth(ramp(e, 0.5, 0.95))
      stage.dataset.exit = e > 0 ? '1' : ''
      if (k <= 0 && pinned) stage.style.background = '#fff'
      /* the dark it hands over: the gene's own ground where the two meet edge to edge (phones and
         tablets), the graphite the pinned gene is laid over on desktop */
      const end = +getComputedStyle(sec).getPropertyValue('--mf-exit') || 18
      if (k > 0) stage.style.background = `rgb(${[0, 1, 2].map(() => Math.round(255 + (end - 255) * k)).join(',')})`
    }

    function follow(now: number) {
      const dt = Math.min(0.05, (now - (tLast || now - 16)) / 1000)
      tLast = now
      tShown += (tTarget - tShown) * (1 - Math.exp(-dt / TAU_T))
      if (Math.abs(tTarget - tShown) < 0.0004) tShown = tTarget
      if (pinned) paintPinned(tShown)
      tRaf = tShown !== tTarget && pinned ? requestAnimationFrame(follow) : 0
      if (!tRaf) tLast = 0
    }

    const FW = 3.2 // the front's width, in words
    const SWEEP_MS = 2600
    const sweep = { on: false, raf: 0 }
    function paintWords(q: number) {
      const F = q * (words.length + FW)
      words.forEach((w, i) => {
        const v = smooth((F - i) / FW)
        if (v >= 1) {
          w.style.transform = ''
          w.style.filter = ''
          w.style.opacity = ''
        } else {
          w.style.transform = `translateY(${(0.18 * (1 - v)).toFixed(3)}em)`
          w.style.filter = `blur(${(6 * (1 - v)).toFixed(2)}px)`
          /* from fully invisible (no waiting ghost of the text): each word fades in as it sharpens */
          w.style.opacity = v.toFixed(3)
        }
      })
    }
    function playSweep() {
      sweep.on = true
      let t0 = 0
      const frame = (now: number) => {
        if (!sweep.on) return
        if (!t0) t0 = now
        const t = Math.min(1, (now - t0) / SWEEP_MS)
        paintWords((1 - Math.cos(Math.PI * t)) / 2) // gentle in-out, as on the homepage
        if (t < 1) sweep.raf = requestAnimationFrame(frame)
      }
      sweep.raf = requestAnimationFrame(frame)
    }

    function update(y: number) {
      if (js) {
        /* the statement is written onto the canvas once it has turned white, line by line, finishing as the page lets go of the opening scene */
        const p = sceneProgress(y)
        sec.classList.toggle('mf-through', p < 1)
        /* like the homepage philosophy statement, it plays on its own clock once the canvas has
           turned white (p ≥ 0.66): a soft front sweeps the words in reading order over ~2.6s, each
           fading up from a ghost, rising 0.18em and sharpening out of a 6px blur. Scrolling back up
           past the opening puts it back to its ghost, ready to play again. */
        if (p >= 0.66 && !sweep.on) playSweep()
        else if (p < 0.5 && sweep.on) {
          sweep.on = false
          cancelAnimationFrame(sweep.raf)
          paintWords(0)
        } else if (!sweep.on) paintWords(0)
      }

      if (pinned) {
        /* t runs 0..1 over the scroll the stage stays pinned for; the drawing follows it with its
           own gentle lag, so one wheel notch glides through a stage instead of skipping it */
        /* the last screen of the track is the exit: the principles finish just before it */
        const run = Math.max(1, wrapH - stageH - V * exitLen())
        tTarget = ramp(y - wrapTop, 0, run)
        enterNow = ramp(y - (wrapTop - V), 0, V * 0.85)
        exitOut(ramp(y - wrapTop - run, 0, V * exitLen()))
        if (calm.matches) tShown = tTarget
        else if (!tRaf) tRaf = requestAnimationFrame(follow)
        paintPinned(tShown)
        return
      }

      if (js) {
        /* each heading is drawn in as its principle rises into focus */
        heads.forEach((h, i) => {
          const top = wrapTop + rowTop[i] - y
          const r = ramp(V * 0.86 - top, 0, V * 0.34)
          const L = headBands[i], k = L.length
          maskLines(h, L, L.map((_, j) => {
            const a = k > 1 ? (j * 0.3) / (k - 1) : 0
            return smooth(ramp(r, a, k > 1 ? a + 0.7 : 1))
          }))
        })
      }

      /* the marker: holds beside the active principle while it is read, then travels to the next
         one over the second half of the row, so it follows the reader and never jumps */
      if (!anchor.length) return
      const F = y + V * 0.5 - wrapTop
      let pos = anchor[0], on = 0
      for (let i = 0; i < rows.length && F >= rowTop[i]; i++) {
        if (i === rows.length - 1) {
          pos = anchor[i]
          on = i
          break
        }
        const e = smooth(ramp(ramp(F, rowTop[i], rowTop[i + 1]), 0.5, 1))
        pos = anchor[i] + (anchor[i + 1] - anchor[i]) * e
        on = e < 0.5 ? i : i + 1
      }
      mark.style.transform = `translateY(${pos.toFixed(2)}px)`
      fill.style.transform = `scaleY(${(pos / wrapH).toFixed(5)})`
      rows.forEach((r, i) => r.classList.toggle('on', i === on))
    }

    const off = onScrollFrame({ measure, update })
    return () => {
      off()
      sweep.on = false
      cancelAnimationFrame(sweep.raf)
      cancelAnimationFrame(tRaf)
      cancelAnimationFrame(dRaf)
      ghost.remove()
      wide.removeEventListener('change', onWide)
      liveCanvas.removeEventListener('pointermove', onPointer)
      liveCanvas.removeEventListener('pointerleave', onPointer)
      live.destroy()
      held.forEach((f) => f.destroy())
    }
  }, [])

  return (
    <section id="manifesto" className="mf" ref={secRef} aria-labelledby="mf-title">
      <div className="mf-open">
        {/* each word is its own piece so it can sharpen out of a blur as it arrives (the homepage
            philosophy reveal); each carries its slice of the heading's gradient (set in measure) */}
        <h2 className="mf-statement" id="mf-title" aria-label="Design isn’t about the tools. It’s about the experiences we shape.">
          {'Design isn’t about the tools.'.split(' ').map((w, i) => (
            <Fragment key={'a' + i}>
              <span className="mfw" aria-hidden="true">{w}</span>{' '}
            </Fragment>
          ))}
          <i className="hx-glyph hx-xs mfw-i" aria-hidden="true" />
          <br />
          {'It’s about the experiences we shape'.split(' ').map((w, i, all) => (
            <Fragment key={'b' + i}>
              <span className="mfw" aria-hidden="true">
                {w}
                {i === all.length - 1 && <span className="mf-dot">.</span>}
              </span>
              {i < all.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </h2>
      </div>

      <div className="mf-principles">
        <div className="mf-stage">
          <div className="mf-rail" aria-hidden="true">
            <i className="mf-fill" />
            <i className="mf-mark" />
          </div>
          <div className="mf-draw">
            <canvas className="mf-field-live" aria-hidden="true" />
          </div>
          <div className="mf-side">
            {/* where the reader is in the three: a number and three short bars */}
            <div className="mf-steps mono" data-on="0" aria-hidden="true">
              <span>
                <b>01</b> / 03
              </span>
              <span className="mf-bars">
                <i />
                <i />
                <i />
              </span>
            </div>
            <ol className="mf-list">
              {PRINCIPLES.map(({ kicker, head, copy }, i) => (
                <li className="mf-row" key={kicker}>
                  <span className="mf-idx mono">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mf-h">
                    {head[0]} <span>{head[1]}</span>
                  </h3>
                  <p className="mf-copy">{copy}</p>
                  <canvas className="mf-fig" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
