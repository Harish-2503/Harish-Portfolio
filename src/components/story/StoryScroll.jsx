import { Fragment, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import SectionShell from '../layout/SectionShell'
import { profile } from '../../data/profile'
import { ease, viewport } from '../../lib/motion'

// The summary is split at its first sentence: a lead statement, then supporting detail.
const [lead, ...rest] = profile.summary.split(/(?<=\.)\s+/)

const facts = [
  { label: 'Based in', value: profile.location },
  { label: 'Education', value: 'M.Tech, Computer Science and Engineering, 2021 – 2026' },
  { label: 'Experience', value: 'Internships at YounderBots and C-DAC' },
]

function Word({ word, i, n, progress }) {
  const opacity = useTransform(progress, [i / n, (i + 1) / n], [0.15, 1])
  return <motion.span style={{ opacity }} className="inline-block">{word}</motion.span>
}

// About animation: the lead sentence is written in as you scroll. Each word darkens in turn,
// so the pace of reading is set by the scroll, not by a timer.
function ScrollWords({ text }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className="max-w-[40ch] font-display text-3xl font-medium leading-tight md:text-5xl">
      {reduce
        ? text
        : words.map((w, i) => (
            <Fragment key={i}>
              <Word word={w} i={i} n={words.length} progress={scrollYProgress} />
              {i < words.length - 1 && ' '}
            </Fragment>
          ))}
    </p>
  )
}

export default function StoryScroll() {
  const reduce = useReducedMotion()
  return (
    <SectionShell id="about" title="Design and engineering in one workflow" bg="bg-cream" fx="rise">
      <div className="grid gap-12 md:grid-cols-[1.5fr_1fr] md:gap-20">
        <div>
          <ScrollWords text={lead} />
          {rest.length > 0 && (
            <motion.p
              initial={reduce ? false : { clipPath: 'inset(0% 0% 100% 0%)' }}
              whileInView={reduce ? undefined : { clipPath: 'inset(0% 0% 0% 0%)' }}
              viewport={viewport}
              transition={{ duration: 1.1, ease: ease.inOut }}
              className="mt-8 max-w-[58ch] border-l-4 border-highlight pl-5 text-muted md:text-lg"
            >
              {rest.join(' ')}
            </motion.p>
          )}
        </div>
        <dl className="space-y-6 self-start md:pt-3">
          {facts.map((f, i) => (
            <div key={f.label} className="relative pt-3">
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left bg-ink/25"
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={reduce ? undefined : { scaleX: 1 }}
                viewport={viewport}
                transition={{ duration: 0.9, delay: i * 0.15, ease: ease.out }}
              />
              <dt className="text-sm font-medium text-muted">{f.label}</dt>
              <motion.dd
                className="mt-1 text-lg"
                initial={reduce ? false : { opacity: 0, x: 40 }}
                whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                viewport={viewport}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: ease.out }}
              >
                {f.value}
              </motion.dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionShell>
  )
}
