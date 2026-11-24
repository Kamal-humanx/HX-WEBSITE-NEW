"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { Arrow } from './Arrow'
import { handover, PAN } from './handover'
import { OPENINGS } from './roles'
import { onScrollFrame, ramp, smooth, motionOn } from './scroll'

/* Open roles, on the white canvas: the archive is pulled open. As the section comes up out of the
   gene's chamber, its
   name travels in across the page and the openings, stacked like the edges of index cards, fan open
   one after another into the full index, the stage held while they do. Each role is listed with
   what the careers site says of it, in its words. A role under the pointer brings up a photograph of
   the work it involves, which trails the pointer with a little weight and gives way to the next
   role's from the direction the pointer travelled. */

const pad2 = (n: number) => String(n).padStart(2, '0')
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export default function OpenRoles() {
  const secRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const sec = secRef.current!
    const stage = sec.querySelector<HTMLElement>('.or-stage')!
    const rows = Array.from(sec.querySelectorAll<HTMLElement>('.or-row'))

    /* the opening: the name travels in as the section rises; then, held, the cards fan open */
    const wide = matchMedia('(min-width: 761px)')
    let pinned = false, joined = false, top = 0, V = 1, lifeTop = 0, footTop = 0, wash = -1
    const off = onScrollFrame({
      measure() {
        pinned = motionOn() && wide.matches && !reduced()
        joined = pinned && handover() && !!document.getElementById('life') /* only while Life follows it */
        sec.classList.toggle('or-pin', pinned)
        sec.classList.toggle('or-join', joined)
        if (!joined) stage.style.removeProperty('--away')
        V = window.innerHeight
        top = sec.getBoundingClientRect().top + window.scrollY
        const life = document.getElementById('life')
        lifeTop = life ? life.getBoundingClientRect().top + window.scrollY : 0
        const foot = document.querySelector('[data-hxc-footer]')
        footTop = foot ? foot.getBoundingClientRect().top + window.scrollY : 0
      },
      update(y) {
        const p = pinned ? ramp(y, top - V * 0.6, top + V * 0.9) : 1
        /* held on after the archive opens, the index drifts away left as the studio's panel crosses */
        if (joined) stage.style.setProperty('--away', smooth(ramp(y, lifeTop, lifeTop + V * PAN)).toFixed(4))
        stage.style.setProperty('--h', smooth(ramp(p, 0, 0.42)).toFixed(4))
        rows.forEach((r, i) => r.style.setProperty('--o', smooth(ramp(p, 0.34 + i * 0.09, 0.6 + i * 0.09)).toFixed(4)))
        /* into the footer, as the gene handed over to this page: while the footer rises, the white
           washes down to the footer's own dark and the index fades, so it arrives on one ground */
        if (footTop) {
          const seen = Math.max(y, window.scrollY) + V - footTop
          const k = smooth(ramp(seen, 0, V * 0.55))
          if (Math.abs(k - wash) > 0.001) {
            wash = k
            const c = Math.round(255 + (14 - 255) * k)
            sec.style.background = k > 0 ? `rgb(${c},${c},${c})` : ''
            stage.style.opacity = k > 0 ? (1 - smooth(ramp(seen, 0, V * 0.38))).toFixed(4) : ''
          }
        }
      },
    })

    /* the photograph: it trails the pointer, leans a little with its speed, and each role's image
       wipes in over the last from the direction the pointer came */
    const list = sec.querySelector<HTMLElement>('.or-list')!
    const peek = sec.querySelector<HTMLElement>('.or-peek')!
    const imgs = Array.from(peek.querySelectorAll<HTMLElement>('.or-shot'))
    const cols = sec.querySelectorAll<HTMLElement>('.or-cols span')[2]
    let on = false, active = -1, z = 1, raf = 0
    let tx = 0, ty = 0, px = 0, py = 0, tilt = 0
    const tick = () => {
      px += (tx - px) * 0.16
      py += (ty - py) * 0.16
      tilt += (Math.max(-5, Math.min(5, (tx - px) * 0.05)) - tilt) * 0.15
      peek.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg)`
      const settled = Math.abs(tx - px) < 0.3 && Math.abs(ty - py) < 0.3 && Math.abs(tilt) < 0.02
      raf = on || !settled ? requestAnimationFrame(tick) : 0
    }
    const show = (i: number) => {
      if (i === active) return
      const el = imgs[i], down = i > active
      el.style.transition = 'none'
      el.style.clipPath = down ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)'
      el.style.transform = 'scale(1.08)'
      el.style.zIndex = String(++z)
      void el.offsetWidth
      el.style.transition = ''
      el.style.clipPath = 'inset(0 0 0 0)'
      el.style.transform = 'scale(1)'
      active = i
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      /* beside the pointer, but never over the level, location or apply columns */
      const lane = cols.getBoundingClientRect().left - peek.offsetWidth - 24
      tx = Math.min(e.clientX + 28, lane)
      ty = e.clientY - peek.offsetHeight * 0.5
      const row = (e.target as HTMLElement).closest<HTMLElement>('.or-row')
      if (!row) return
      if (!on) {
        px = tx
        py = ty
        on = true
        peek.classList.add('is-on')
      }
      show(+row.dataset.i!)
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const leave = () => {
      on = false
      peek.classList.remove('is-on')
    }
    list.addEventListener('pointermove', move)
    list.addEventListener('pointerleave', leave)
    return () => {
      off()
      cancelAnimationFrame(raf)
      list.removeEventListener('pointermove', move)
      list.removeEventListener('pointerleave', leave)
    }
  }, [])

  /* the same handoff as the gene: an apply panel can take it; without one, the role's page */
  const apply = (role: string) => (e: MouseEvent) => {
    const ev = new CustomEvent('hx:apply', { cancelable: true, detail: { role } })
    if (!window.dispatchEvent(ev)) e.preventDefault()
  }

  return (
    <section id="roles" className="or" ref={secRef} aria-labelledby="or-title">
      <div className="or-track">
        <div className="or-stage">
          <header className="or-head">
            <h2 className="or-title" id="or-title">
              Openings
            </h2>
          </header>

          <div className="or-bar">
            <p className="or-count mono">{OPENINGS.length} open roles</p>
          </div>

          <div className="or-cols mono" aria-hidden="true">
            <span>#</span>
            <span>Role</span>
            <span>Level</span>
            <span>Location</span>
            <span />
          </div>
          <ol className="or-list">
            {OPENINGS.map((r, i) => {
              return (
                <li key={r.name}>
                  <a
                    className="or-row"
                    href={r.url}
                    onClick={apply(r.name)}
                    data-i={i}
                    style={{ '--i': i } as CSSProperties}
                  >
                    <span className="or-in">
                      <span className="or-n mono">{pad2(i + 1)}</span>
                      <span className="or-name">
                        {r.name}
                      </span>
                      <span className="or-lv mono">{r.level}</span>
                      <span className="or-lc mono">{r.location}</span>
                      <span className="or-ap">
                        Apply<i aria-hidden="true"><Arrow up /></i>
                      </span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      {/* the photograph that follows the pointer over the list */}
      <div className="or-peek" aria-hidden="true">
        <div className="or-frame">
          {OPENINGS.map((r) => (
            <img className="or-shot" src={r.img} alt="" key={r.name} decoding="async" />
          ))}
        </div>
      </div>
    </section>
  )
}
