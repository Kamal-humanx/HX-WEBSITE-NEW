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
   what the careers site says of it, in its words. (No photograph on hover: removed at the client's
   request; the row's own hover — name nudge, tangerine Apply — remains.) */

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

    /* (the photograph that used to trail the pointer over the roles has been removed) */
    return () => {
      off()
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
                    /* straight to the role's Recruit CRM application form, in a new tab */
                    target="_blank"
                    rel="noopener noreferrer"
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

    </section>
  )
}
