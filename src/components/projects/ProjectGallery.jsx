import { useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import SectionShell from '../layout/SectionShell'
import SplitText from '../ui/SplitText'
import { projects } from '../../data/projects'
import { layerBg, layerName } from '../../lib/layers'
import { assetUrl, projectActions } from '../../lib/links'
import { caseHref, openCase } from '../../lib/route'
import { getLook } from './visuals'

// A screenshot (once added) replaces the drawing and pans from top to bottom on hover.
function Shot({ project: p, fallback }) {
  const [failed, setFailed] = useState(false)
  if (!p.image || failed) return fallback
  return (
    <img
      src={assetUrl(p.image)}
      alt={`${p.title} screenshot`}
      onError={() => setFailed(true)}
      className="aspect-[16/10] w-full rounded-xl object-cover object-top transition-[object-position] duration-[3000ms] ease-in-out group-hover:object-bottom motion-reduce:transition-none"
    />
  )
}

const pill = 'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-colors motion-reduce:transition-none'

// One card of the deck. Every project has its own colours, title animation and drawing (see visuals.jsx).
// Cards pin one after another; the ones underneath shrink slightly as the pile grows.
function DeckCard({ p, i, n, progress }) {
  const reduce = useReducedMotion()
  const look = getLook(p)
  const scale = useTransform(progress, [i / n, 1], [1, 1 - 0.05 * (n - 1 - i)])
  const actions = projectActions(p)
  const hint = import.meta.env.DEV && !actions.some((a) => a.kind === 'github')
  return (
    <li className="deck-card" style={{ top: `${88 + i * 14}px` }}>
      <motion.article
        style={{ background: look.bg, color: look.ink, ...(reduce ? {} : { scale }) }}
        className="grid origin-top overflow-hidden rounded-3xl md:min-h-[540px] md:grid-cols-[1fr_1.05fr]"
      >
        <div className="flex min-w-0 flex-col justify-between gap-8 p-6 md:p-10">
          <div>
            <div className="flex items-center justify-between gap-4">
              <ul className="flex gap-1.5" aria-label="Layers used">
                {p.layers.map((l) => (
                  <li key={l} title={layerName[l]} className={`h-1.5 w-8 rounded-full ${layerBg[l]} ring-1 ring-current/30`}>
                    <span className="sr-only">{layerName[l]}</span>
                  </li>
                ))}
              </ul>
              {p.badge && <span className="rounded-md bg-highlight px-2.5 py-1 text-xs font-medium text-ink">{p.badge}</span>}
            </div>
            <h3 className="mt-8 font-display text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[0.95]">
              <SplitText text={p.title} fx={look.fx} stagger={0.1} />
            </h3>
            <p className="mt-3 text-lg opacity-80">{p.subtitle}</p>
            <p className="mt-6 max-w-[44ch] text-lg leading-snug">{p.summary}</p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm" aria-label="Technologies">
              {p.stack.map((s) => <li key={s} className="rounded-full border border-current/40 px-3 py-1">{s}</li>)}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={caseHref(p.id)} onClick={(e) => openCase(e, p.id)} className={`${pill} group/link bg-cream text-ink hover:bg-highlight`}>
              Read how it was built
              <ArrowUpRight aria-hidden="true" size={16} className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 motion-reduce:transition-none" />
            </a>
            {actions.map((a) => (
              <a key={a.kind} href={a.href} target="_blank" rel="noopener noreferrer" className={`${pill} border border-current/50 hover:bg-current/10`}>
                {a.label}
                <span className="sr-only"> for {p.title} (opens in a new tab)</span>
              </a>
            ))}
            {hint && <p className="w-full text-xs opacity-70">Dev: set githubUrl for “{p.id}” in src/data/projects.js</p>}
          </div>
        </div>
        <div className="group grid min-h-[340px] place-items-center overflow-hidden bg-current/[0.07] p-6 md:p-10">
          <div aria-hidden="true" className="grid w-full place-items-center">
            <Shot project={p} fallback={<look.Visual />} />
          </div>
        </div>
      </motion.article>
    </li>
  )
}

export default function ProjectGallery() {
  const list = useRef(null)
  const { scrollYProgress } = useScroll({ target: list, offset: ['start start', 'end end'] })
  return (
    <SectionShell id="work" title="Selected work" bg="bg-linen" fx="flip">
      <ul ref={list} className="flex flex-col gap-6 md:gap-10">
        {projects.map((p, i) => <DeckCard key={p.id} p={p} i={i} n={projects.length} progress={scrollYProgress} />)}
      </ul>
    </SectionShell>
  )
}
