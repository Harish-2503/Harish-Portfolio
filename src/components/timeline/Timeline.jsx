import { useRef } from 'react'
import { motion, useInView, useReducedMotion, useScroll } from 'motion/react'
import SectionShell from '../layout/SectionShell'
import { timeline } from '../../data/timeline'
import { ease, viewport } from '../../lib/motion'

function Milestone({ t }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  // Active while the milestone crosses the middle band of the viewport.
  const active = useInView(ref, { margin: '-40% 0px -40% 0px' })
  return (
    <li ref={ref} data-active={active} className="group relative pb-12 pl-8 last:pb-0 md:pl-12">
      <span
        aria-hidden="true"
        className="absolute left-0 top-2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-ink bg-cream transition-all duration-300 group-data-[active=true]:scale-150 group-data-[active=true]:border-accent group-data-[active=true]:bg-accent motion-reduce:transition-none"
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, x: -56, filter: 'blur(8px)' }}
        whileInView={reduce ? undefined : { opacity: 1, x: 0, filter: 'blur(0px)' }}
        viewport={viewport}
        transition={{ duration: 0.8, ease: ease.out }}
        className="grid gap-2 md:grid-cols-[200px_1fr] md:gap-10"
      >
        <p className="text-sm font-medium tabular-nums text-muted transition-colors group-data-[active=true]:text-ink">{t.period}</p>
        <div>
          <p className="text-sm font-medium text-accent">{t.kind}</p>
          <h3 className="mt-1 text-2xl font-semibold">{t.title}</h3>
          <p className="mt-1 text-muted">{t.place}</p>
          {t.points && (
            <ul className="mt-4 max-w-[70ch] list-disc space-y-2 pl-5 marker:text-accent/50">
              {t.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}
        </div>
      </motion.div>
    </li>
  )
}

// Journey animation: a line is drawn down the page as you scroll, and each milestone slides in
// from the left, coming into focus as it reaches the line.
export default function Timeline() {
  const ol = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ol, offset: ['start 0.6', 'end 0.6'] })
  return (
    <SectionShell id="journey" title="Education and experience" bg="bg-cream" fx="left">
      <ol ref={ol} className="relative ml-1.5">
        <span aria-hidden="true" className="absolute left-0 top-0 h-full w-0.5 -translate-x-1/2 bg-line" />
        <motion.span
          aria-hidden="true"
          style={reduce ? undefined : { scaleY: scrollYProgress }}
          className="absolute left-0 top-0 h-full w-0.5 origin-top -translate-x-1/2 bg-accent"
        />
        {timeline.map((t) => <Milestone key={t.id} t={t} />)}
      </ol>
    </SectionShell>
  )
}
