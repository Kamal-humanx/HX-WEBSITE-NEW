"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { HUMAN, specimen, XS, YEAR_NAMES, YEARS } from './genome'
import { Helix, type Anchor, type Pick } from './helix'
import { Arrow } from './Arrow'
import { goToScene, onScrollFrame, ramp, smooth, motionOn } from './scroll'

/* The mutant gene, in a darker chamber that opens out of the graphite the principles ended on. The
   specimen stands in the middle with a strand's traits on either side of it; hovering a trait turns
   its locus to face it and previews it there, a click splices it in (and again takes it out), several
   to a strand. The record beside it fills in as the visitor chooses and is completed by the splice:
   once years shipping (which only sets the matched role) is chosen too, the leading link carries
   through in tangerine and the record takes its ID. */

const GROUPS = [
  { key: 'human', num: '01', title: 'Human Edge', traits: HUMAN, n: 'H' },
  { key: 'x', num: '02', title: 'X Strand', traits: XS, n: 'X' },
] as const
const STEPS = ['Human Edge', 'X Strand', 'Years Shipping'] as const
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* a value that resolves out of noise when it changes, as the careers site's labels do */
const NOISE = 'HUMX0123456789'
function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef<string | null>(null)
  useLayoutEffect(() => {
    const el = ref.current!, from = prev.current
    prev.current = text
    if (from == null || from === text || reduced()) {
      el.textContent = text
      return
    }
    let raf = 0
    const t0 = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 550)
      el.textContent = [...text].map((ch, i) => (/[\s·—-]/.test(ch) || i / text.length < p ? ch : NOISE[(Math.random() * NOISE.length) | 0])).join('')
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [text])
  return <span ref={ref} className={className} aria-label={text} />
}

/* an element's layout position within an ancestor (ignoring transforms, so entrances don't skew it) */
function within(el: HTMLElement, root: HTMLElement) {
  let x = 0, y = 0, n: HTMLElement | null = el
  while (n && n !== root) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

export default function Gene() {
  const secRef = useRef<HTMLElement>(null)
  const helixRef = useRef<Helix | null>(null)
  const [picks, setPicks] = useState<[number[], number[]]>([[], []])
  const [years, setYears] = useState<number | null>(null)
  const [preview, setPreview] = useState<Pick | null>(null)
  /* which strand is being asked, and the trait last spliced in (the close-up leans toward it) */
  const [step, setStep] = useState(0)
  const [focus, setFocus] = useState<Pick | null>(null)
  /* just after a splice the specimen turns round the strand it took, rather than facing the pill */
  const [orbit, setOrbit] = useState(false)
  const orbitT = useRef(0)
  const fitRef = useRef<(() => void) | null>(null)
  /* "Other" on each strand: picking it opens a field (editing) holding a draft; Enter registers the
     draft as the pick (others), and an empty Enter, Escape or leaving the field lets it go */
  const [others, setOthers] = useState<[string, string]>(['', ''])
  const [drafts, setDrafts] = useState<[string, string]>(['', ''])
  const [editing, setEditing] = useState<[boolean, boolean]>([false, false])
  const focusOther = useRef<number | null>(null)
  const pair = <T,>(p: [T, T], side: number, v: T): [T, T] => (side ? [p[0], v] : [v, p[1]])

  const [hs, xs] = picks
  const TRAITS = [HUMAN, XS] as const
  const isOther = (side: number, i: number) => TRAITS[side][i][0] === 'Other'
  /* a trait's name as the record shows it: "Other" becomes what was typed, once there is something */
  const traitName = (side: number, i: number) => (isOther(side, i) && others[side].trim() ? others[side].trim() : TRAITS[side][i][0])
  const both = hs.length > 0 && xs.length > 0
  const complete = both && years != null
  const done = [hs.length > 0, xs.length > 0, years != null]
  /* what a step was answered with, as its step shows it: the first trait, and how many more */
  const answer = (i: number) => {
    if (i === 2) return years != null ? YEARS[years] + ' yrs' : ''
    const list = picks[i]
    return list.length ? traitName(i, list[0]) + (list.length > 1 ? ' +' + (list.length - 1) : '') : ''
  }
  /* the sequence is written from the first pick, and rewritten by every one after it */
  const started = done.some(Boolean)
  const spec = specimen(hs, xs, years)

  const setPick = (side: number, i: number, on: boolean) =>
    setPicks((p) => {
      const cur = p[side]
      if (on === cur.includes(i)) return p
      return pair(p, side, on ? [...cur, i] : cur.filter((v) => v !== i))
    })
  /* a click on a trait: "Other", while it isn't picked, opens its field rather than being picked */
  const toggle = (side: number, i: number) => {
    const picked = picks[side].includes(i)
    if (isOther(side, i) && !picked) {
      setDrafts((d) => pair(d, side, others[side]))
      setEditing((e) => pair(e, side, true))
      focusOther.current = side
      return
    }
    if (!picked) {
      setFocus({ side: side as 0 | 1, i })
      setOrbit(true)
      helixRef.current?.swirl()
      clearTimeout(orbitT.current)
      orbitT.current = window.setTimeout(() => setOrbit(false), 1800)
    }
    setPick(side, i, !picked)
  }
  const toggleRef = useRef(toggle)
  toggleRef.current = toggle
  const commitOther = (side: number, i: number) => {
    const text = drafts[side].trim()
    setEditing((e) => pair(e, side, false))
    if (!text) return setPick(side, i, false)
    setOthers((o) => pair(o, side, text))
    setPick(side, i, true)
  }
  const closeOther = (side: number) => setEditing((e) => pair(e, side, false))
  useEffect(() => {
    if (focusOther.current == null) return
    secRef.current?.querySelector<HTMLInputElement>(`.gn-other-in[data-side="${focusOther.current}"]`)?.focus()
    focusOther.current = null
  }, [editing])

  useEffect(() => {
    const sec = secRef.current!
    const stage = sec.querySelector<HTMLElement>('.gn-stage')!
    const helix = new Helix(sec.querySelector<HTMLCanvasElement>('.gn-canvas')!, stage)
    helix.controlsLeft = true
    helix.leaders = false
    helixRef.current = helix
    helix.onPreview = setPreview
    helix.onPick = ({ side, i }) => toggleRef.current(side, i)

    /* the specimen takes its box from the layout; each trait's control is a leader's anchor */
    const fit = () => {
      const box = within(sec.querySelector<HTMLElement>('.gn-spec')!, stage)
      /* the canvas is exactly the specimen's container, so nothing can ever be drawn outside it (a
         mask over a stage-wide canvas could lag a frame behind a close-up); faded top and bottom */
      const cv = sec.querySelector<HTMLCanvasElement>('.gn-canvas')!
      Object.assign(cv.style, { left: box.x + 'px', top: box.y + 'px', width: box.w + 'px', height: box.h + 'px' })
      helix.layout({ x: 0, y: 0, w: box.w, h: box.h })
      const anchors: Anchor[] = []
      sec.querySelectorAll<HTMLElement>('.gn-opt').forEach((el) => {
        const r = within(el, stage), side = +el.dataset.side!
        anchors.push({ side, i: +el.dataset.i!, x: r.x + r.w + 6 - box.x, y: r.y + r.h / 2 - box.y })
      })
      helix.setAnchors(anchors)
    }
    fitRef.current = fit
    const ro = new ResizeObserver(fit)
    ro.observe(stage)
    ro.observe(sec.querySelector<HTMLElement>('.gn-grid')!)
    /* the container itself: whenever it changes size or place, the specimen and its visible window follow */
    ro.observe(sec.querySelector<HTMLElement>('.gn-spec')!)
    ro.observe(sec.querySelector<HTMLElement>('.gn-panel')!)
    document.fonts?.ready.then(fit)

    /* the opening: the chamber opens out of the graphite as the section comes up, held in place
       while it does; the specimen draws in, top to bottom, as it opens. Smaller screens and reduced
       motion arrive at it open. */
    const wide = matchMedia('(min-width: 1181px)')
    let pinned = false, top = 0, V = 1, open = -1, lastBox = ''
    const off = onScrollFrame({
      measure() {
        pinned = motionOn() && wide.matches && !reduced()
        sec.classList.toggle('gn-pin', pinned)
        V = window.innerHeight
        top = sec.getBoundingClientRect().top + window.scrollY
      },
      update(y) {
        /* a move without a resize (the layout settling round it) re-fits too, so the window never drifts */
        const sp = within(sec.querySelector<HTMLElement>('.gn-spec')!, stage), key = [sp.x, sp.y, sp.w, sp.h].join()
        if (key !== lastBox) {
          lastBox = key
          fitRef.current?.()
        }
        /* already pinned in place over the manifesto's dark: it fades in where it stands, then the
           specimen draws itself in and the controls and record arrive, all with the scroll */
        const p = pinned ? ramp(y, top, top + V * 0.85) : 1
        /* see-through while it lies over the manifesto's exit; the dark it was handed (the same
           #121212) from the instant it pins, so the manifesto leaving behind it never shows */
        /* (read from the real scroll position, not the eased one, so it is never a frame late) */
        sec.style.background = pinned && Math.max(y, window.scrollY) >= top - 1 ? '#121212' : ''
        if (Math.abs(p - open) < 0.0005) return
        open = p
        stage.style.setProperty('--c', '0')
        stage.style.opacity = pinned ? smooth(ramp(p, 0, 0.35)).toFixed(4) : ''
        sec.classList.toggle('gn-open', p > 0.5)
        helix.setEnter(ramp(p, 0.25, 0.95))
      },
    })
    return () => {
      off()
      ro.disconnect()
      helix.destroy()
      helixRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    helixRef.current?.set(hs, xs, orbit ? null : preview, complete)
  }, [hs, xs, preview, complete, orbit])

  /* the close-up: while a strand is being asked, the specimen leans in toward it, and closer still to
     the trait being looked at or just spliced in; once all three are answered it stays close */
  useEffect(() => {
    const h = helixRef.current
    if (!h) return
    /* years, and the finished specimen: held close about its middle so it fills its container */
    if (step >= 2) return h.focusOn(null, complete ? 1.45 : 1.2)
    const onStep = (q: Pick | null) => (q && q.side === step ? q : null)
    const p = orbit ? onStep(focus) : onStep(preview) ?? onStep(focus)
    /* a proper close-up on the strand being chosen; a lighter lean toward the strand being asked */
    h.focusOn(p ?? { side: step as 0 | 1, i: -1 }, p ? 1.6 : 1.15)
  }, [step, preview, focus, orbit, complete])

  /* the leaders run from the controls on show, so re-anchor whenever the question changes */
  useEffect(() => {
    const id = requestAnimationFrame(() => fitRef.current?.())
    return () => cancelAnimationFrame(id)
  }, [step, editing])

  /* the rest of the page can follow the specimen: open roles marks the opening it matched */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('hx:specimen', { detail: complete ? { name: spec.name, id: spec.id, role: spec.role, sequence: spec.sequence } : null }))
  }, [complete, spec.name, spec.id, spec.role, spec.sequence])

  /* the call to action: once the specimen is complete it goes on to the openings, landing where the
     list stands open rather than on its first edge */
  const toRoles = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!complete) return
    goToScene(e, 'roles', 'or-pin', 0.9)
  }

  /* one trait in the cloud: a pill to pick (and pick again to take out); "Other" opens a field */
  const renderTrait = (side: 0 | 1, i: number, label: string) => {
      const at = picks[side].indexOf(i), on = at >= 0
      const pre = preview?.side === side && preview.i === i
      /* "Other", clicked, becomes a field in the same row; what's typed is picked only
         when Enter is pressed. Escape, an empty Enter or leaving the field lets it go,
         and the dot takes a registered "Other" back out */
      if (label === 'Other' && editing[side])
        return (
          <div className={'gn-opt gn-opt-other' + (pre ? ' is-preview' : '')} key={label} data-side={side} data-i={i} style={{ '--k': i } as CSSProperties}>
            <button
              type="button"
              className="gn-other-x"
              aria-label={`Remove Other from ${GROUPS[side].title}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                closeOther(side)
                setPick(side, i, false)
              }}
            >
              <i className="gn-dot" aria-hidden="true" />
            </button>
            <input
              className="gn-other-in"
              data-side={side}
              type="text"
              maxLength={28}
              value={drafts[side]}
              placeholder={side ? 'Type your X factor' : 'Type your human edge'}
              aria-label={(side ? 'Your X factor' : 'Your human edge') + ', press Enter to add it'}
              onChange={(e) => {
                const v = e.target.value
                setDrafts((d) => pair(d, side, v))
              }}
              onFocus={() => setPreview({ side: side as 0 | 1, i })}
              onBlur={() => {
                setPreview(null)
                closeOther(side)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitOther(side, i)
                } else if (e.key === 'Escape') closeOther(side)
              }}
            />
            <span className="gn-tag mono">{drafts[side].trim() ? 'enter ↵' : ''}</span>
          </div>
        )
      return (
        <button
          type="button"
          className={'gn-opt' + (pre ? ' is-preview' : '')}
          style={{ '--k': i } as CSSProperties}
          key={label}
          aria-pressed={on}
          data-side={side}
          data-i={i}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setPreview({ side: side as 0 | 1, i })}
          onPointerLeave={() => setPreview(null)}
          onFocus={() => setPreview({ side: side as 0 | 1, i })}
          onBlur={() => setPreview(null)}
          onClick={() => toggle(side, i)}
        >
          <i className="gn-dot" aria-hidden="true" />
          <span className="gn-lab">{on ? traitName(side, i) : label}</span>
          <span className="gn-tag mono">{on && pre ? 'remove' : on && at === 0 && picks[side].length > 1 ? 'lead' : ''}</span>
        </button>
      )
  }

  const blank = <span className="gn-blank" role="img" aria-label="not yet spliced" />
  return (
    <section id="gene" className="gn" ref={secRef} aria-labelledby="gn-title" data-complete={complete || undefined}>
      <div className="gn-track">
        <div className="gn-stage">
          <canvas className="gn-canvas" aria-hidden="true" />
          {/* the viewer's frame: it opens with the chamber */}
          <div className="gn-frame" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>

          <div className="gn-grid">
            <div className="gn-intro gn-in">
              <h2 className="gn-title" id="gn-title">
                Every builder here carries a mutation.
              </h2>
              <p className="gn-invite">
                <span className="ln">Your human edge, your X strand, your years shipping.</span>
                <span className="ln">Splice in what’s true and we’ll sequence the mutant you are.</span>
              </p>
            </div>

            {/* the three strands, asked one at a time: the steps show there are three and how far along */}
            <div className="gn-q gn-in">
              <ol className="gn-stepper mono" aria-label="Your gene, in three steps">
                {STEPS.map((t, i) => (
                  <li key={t}>
                    <button
                      type="button"
                      className={done[i] ? 'is-done' : ''}
                      aria-current={step === i ? 'step' : undefined}
                      disabled={i > step && !done[i - 1]}
                      onClick={() => setStep(i)}
                      aria-label={done[i] ? `0${i + 1} ${t}: ${answer(i)}. Change` : `0${i + 1} ${t}`}
                    >
                      <b>{'0' + (i + 1)}</b>
                      <span>{t}</span>
                      {/* the answer, registered on its step: click the step to change it */}
                      {done[i] && <em>{answer(i)}</em>}
                    </button>
                  </li>
                ))}
              </ol>
              <div className="gn-ask" key={step} role="group" aria-labelledby="gn-ask-t">
                <h3 className="gn-gt" id="gn-ask-t">
                  <span className="gn-num mono">{'0' + (step + 1)}</span>
                  {STEPS[step]}
                </h3>
                <div className={'gn-cloud gn-cloud-' + step}>
                  {step < 2
                    ? [
                        ...TRAITS[step].map(([label], i) => renderTrait(step as 0 | 1, i, label)),
                        /* on to the next strand: the eighth cell of the grid, tangerine once there's a pick */
                        <button
                          type="button"
                          className="gn-go"
                          key="go"
                          disabled={!done[step]}
                          aria-label={`Next: ${STEPS[step + 1]}`}
                          title={`Next: ${STEPS[step + 1]}`}
                          onClick={() => setStep(step + 1)}
                        >
                          <Arrow />
                        </button>,
                      ]
                    : YEARS.map((y, i) => (
                        <button
                          type="button"
                          className="gn-opt gn-opt-yr"
                          key={y}
                          aria-pressed={years === i}
                          style={{ '--k': i } as CSSProperties}
                          onClick={() => setYears(i)}
                        >
                          <i className="gn-dot" aria-hidden="true" />
                          <span className="gn-lab">{y} yrs</span>
                          <span className="gn-tag mono">{YEAR_NAMES[i]}</span>
                        </button>
                      ))}
                </div>
              </div>
            </div>

            <div className="gn-spec" aria-hidden="true">
              <p className="gn-drag mono gn-in">
                <span>‹</span> Drag to rotate <span>›</span>
              </p>
            </div>

            <i className="gn-rule" aria-hidden="true" />

            {/* the record: it fills in as the visitor chooses, and the splice completes it */}
            <aside className="gn-panel gn-in" aria-label="Your specimen">
              <p className="gn-meta mono">
                <span>
                  Specimen <Scramble text={complete ? spec.id : 'HX-————'} />
                </span>
                <i />
              </p>
              <p className="gn-name" aria-live="polite">
                The {hs.length ? <span className="gn-adj" key={spec.adj}>{spec.adj}</span> : blank}{' '}
                {xs.length ? <span className="gn-noun" key={spec.noun}>{spec.noun}</span> : blank}
              </p>
              <dl className="gn-facts">
                {/* the phenotype: how the specimen shows up, in plain words, from its lead traits */}
                <dt className="mono">Phenotype</dt>
                <dd className="gn-pheno">{spec.phenotype ? <span key={spec.phenotype}>{spec.phenotype}</span> : <span className="gn-pending">—</span>}</dd>
                <dt className="mono">Sequence</dt>
                <dd className="gn-seq mono" key={started ? spec.sequence : 'none'}>
                  {started
                    ? /* read in codons: a small gap between each group of three */
                      [...spec.sequence].map((ch, i) =>
                        ch === ' ' ? (
                          <i className="gn-gap" aria-hidden="true" key={i} />
                        ) : (
                          <b className={ch === 'X' ? 'is-x' : ''} style={{ animationDelay: `${i * 45}ms` }} key={i}>
                            {ch}
                          </b>
                        ),
                      )
                    : <span className="gn-pending">—</span>}
                </dd>
              </dl>

              <div className="gn-act">
                <a className="gn-cta" href="#roles" onClick={toRoles} aria-disabled={!complete} tabIndex={complete ? 0 : -1}>
                  Bring your X to HumanX <span className="arr"><Arrow up /></span>
                </a>
                {!complete && <p className="gn-note mono">Keep picking to complete the record.</p>}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
