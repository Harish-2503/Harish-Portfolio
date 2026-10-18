import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import SectionShell from '../layout/SectionShell'
import SplitText from '../ui/SplitText'
import { recognition } from '../../data/recognition'
import { viewport } from '../../lib/motion'

// Values that start with digits ("15+", "3") count up when they scroll into view; text values are shown as is.
function CountUp({ value, className }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const match = /^(\d+)(.*)$/.exec(value)
  const target = match ? Number(match[1]) : 0
  const [n, setN] = useState(reduce ? target : 0)
  useEffect(() => {
    if (!match || !inView || reduce) return
    const controls = animate(0, target, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => controls.stop()
  }, [inView]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <p ref={ref} className={className} aria-label={value}>
      <span aria-hidden="true">{match ? `${n}${match[2]}` : value}</span>
    </p>
  )
}

// Cards pop in with a small tilt, one after another. The first entry is the headline award.
export default function ImpactStrip() {
  const reduce = useReducedMotion()
  const [feature, ...stats] = recognition
  const pop = (i) => ({
    initial: reduce ? false : { opacity: 0, y: 48, scale: 0.92, rotate: i % 2 ? 2 : -2 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0, scale: 1, rotate: 0 },
    viewport,
    transition: { type: 'spring', stiffness: 130, damping: 16, delay: i * 0.12 },
  })
  return (
    <SectionShell id="recognition" title="Recognition and impact" bg="bg-linen" fx="scale">
      <ul className="grid gap-5 md:grid-cols-2">
        <motion.li {...pop(0)} className="rounded-2xl bg-ink p-8 text-cream md:row-span-2 md:flex md:flex-col md:justify-between md:p-12">
          <span className="w-fit rounded-md bg-highlight px-2.5 py-1 text-xs font-medium text-ink">Award</span>
          <div className="mt-16">
            <SplitText as="p" text={feature.value} fx="pop" stagger={0.12} className="font-display text-5xl font-semibold leading-none md:text-7xl" />
            <p className="mt-5 max-w-[30ch] text-cream/80 md:text-lg">{feature.label}</p>
          </div>
        </motion.li>
        {stats.map((r, i) => (
          <motion.li key={r.id} {...pop(i + 1)} className="rounded-2xl border border-line bg-white p-8">
            <CountUp value={r.value} className="font-display text-6xl font-semibold leading-none text-accent" />
            <p className="mt-4 max-w-[34ch] text-muted">{r.label}</p>
          </motion.li>
        ))}
      </ul>
    </SectionShell>
  )
}
