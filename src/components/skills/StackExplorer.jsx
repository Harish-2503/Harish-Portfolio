import { useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Plus } from 'lucide-react'
import SectionShell from '../layout/SectionShell'
import { layers, alsoUse } from '../../data/skills'
import { layerInk, layerVar } from '../../lib/layers'
import { ease, viewport } from '../../lib/motion'

// Four colour panels side by side, like spines on a shelf. One is open at a time: it widens and shows
// its content while the others narrow to a vertical label. Below the large breakpoint they stack as rows.
// Entrance: the panels rise from the bottom edge one after another, like a curtain lifting.
const shelf = { hide: {}, show: { transition: { staggerChildren: 0.14 } } }
const curtain = {
  hide: { clipPath: 'inset(100% 0% 0% 0%)' },
  show: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.95, ease: ease.out } },
}

// A small drawing for each layer, shown in the corner of the open panel on large screens.
function Motif({ id }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' }
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="h-28 w-28">
      {id === 'design' && (
        <g {...common}>
          <rect x="14" y="14" width="92" height="92" rx="6" strokeDasharray="4 5" />
          <rect x="26" y="26" width="68" height="14" rx="3" />
          <rect x="26" y="50" width="30" height="44" rx="3" />
          <rect x="64" y="50" width="30" height="20" rx="3" />
          <rect x="64" y="78" width="30" height="16" rx="3" />
        </g>
      )}
      {id === 'interface' && (
        <g {...common}>
          <rect x="14" y="14" width="40" height="40" rx="6" />
          <rect x="66" y="14" width="40" height="40" rx="6" />
          <rect x="14" y="66" width="40" height="40" rx="6" />
          <rect x="66" y="66" width="40" height="40" rx="6" strokeDasharray="4 5" />
          <path d="M26 34h16M78 34h16M26 86h16" />
        </g>
      )}
      {id === 'logic' && (
        <g {...common}>
          <path d="M14 40h74m-14-14 14 14-14 14" />
          <path d="M106 80H32m14-14L32 80l14 14" />
        </g>
      )}
      {id === 'data' && (
        <g {...common}>
          <ellipse cx="60" cy="26" rx="38" ry="12" />
          <path d="M22 26v34c0 7 17 12 38 12s38-5 38-12V26" />
          <path d="M22 60v34c0 7 17 12 38 12s38-5 38-12V60" />
        </g>
      )}
    </svg>
  )
}

export default function StackExplorer() {
  const uid = useId()
  const reduce = useReducedMotion()
  const heads = useRef([])
  const [active, setActive] = useState(0)

  const focusHead = (i) => heads.current[(i + layers.length) % layers.length]?.focus()
  const onKeyDown = (e, i) => {
    const next = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: layers.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    focusHead(next)
  }

  return (
    <SectionShell id="stack" title="Everything between the mockup and the database" bg="bg-white" fx="wipe">
      <motion.ul
        variants={shelf}
        initial={reduce ? false : 'hide'}
        whileInView="show"
        viewport={viewport}
        className="flex flex-col gap-3 lg:flex-row"
      >
        {layers.map((l, i) => {
          const open = active === i
          return (
            <motion.li
              key={l.id}
              data-open={open}
              variants={reduce ? undefined : curtain}
              style={{ background: layerVar[l.id], color: layerInk[l.id] }}
              className="group relative overflow-hidden rounded-2xl transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:h-[580px] lg:min-w-0 lg:flex-[1_1_0%] lg:data-[open=true]:flex-[3.8_1_0%]"
            >
              <h3>
                <button
                  ref={(el) => (heads.current[i] = el)}
                  type="button"
                  id={`${uid}-h-${l.id}`}
                  aria-expanded={open}
                  aria-controls={`${uid}-p-${l.id}`}
                  onClick={() => setActive(open ? null : i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left lg:absolute lg:inset-x-0 lg:top-0 lg:h-full lg:items-start lg:px-7 lg:py-7 lg:group-data-[open=true]:h-24"
                >
                  <span className="font-display text-2xl font-semibold md:text-3xl lg:transition-opacity lg:duration-300 lg:group-data-[open=false]:opacity-0">
                    {l.name}
                  </span>
                  <Plus aria-hidden="true" size={24} className="shrink-0 transition-transform duration-500 group-data-[open=true]:rotate-45 motion-reduce:transition-none" />
                </button>
              </h3>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-7 left-7 hidden rotate-180 font-display text-3xl font-semibold transition-opacity duration-300 [writing-mode:vertical-rl] group-data-[open=true]:opacity-0 lg:block"
              >
                {l.name}
              </span>

              <div
                id={`${uid}-p-${l.id}`}
                role="region"
                aria-labelledby={`${uid}-h-${l.id}`}
                inert={!open}
                className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 group-data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none lg:absolute lg:inset-x-0 lg:top-24 lg:block lg:opacity-0 lg:transition-opacity lg:duration-300 lg:group-data-[open=true]:opacity-100 lg:group-data-[open=true]:delay-300"
              >
                <div className="min-h-0 overflow-hidden lg:overflow-visible">
                  <div className="px-6 pb-8 lg:w-[460px] lg:px-7 lg:pb-0">
                    <p className="font-display text-3xl font-semibold leading-[1.05] md:text-4xl">{l.headline}</p>
                    <p className="mt-4 max-w-[42ch] text-base leading-snug md:text-lg">{l.summary}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {l.items.map((item, k) => (
                        <li
                          key={item}
                          style={{ transitionDelay: open ? `${350 + k * 60}ms` : '0ms' }}
                          className="translate-y-3 rounded-full border border-current/40 px-3.5 py-1 text-sm opacity-0 transition duration-500 group-data-[open=true]:translate-y-0 group-data-[open=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 max-w-[44ch] border-t border-current/30 pt-4 text-sm">{l.proof}</p>
                  </div>
                </div>
              </div>

              <div aria-hidden="true" className="pointer-events-none absolute bottom-6 right-6 hidden opacity-0 transition-opacity duration-500 group-data-[open=true]:opacity-70 group-data-[open=true]:delay-500 lg:block">
                <Motif id={l.id} />
              </div>
            </motion.li>
          )
        })}
      </motion.ul>

      <dl className="mt-14 grid gap-8 border-t border-line pt-10 text-muted md:grid-cols-3">
        {Object.entries(alsoUse).map(([k, v]) => (
          <div key={k}>
            <dt className="mb-2 text-sm font-medium text-ink">{k}</dt>
            <dd>{v.join(', ')}</dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  )
}
