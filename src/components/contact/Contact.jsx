import { ArrowUpRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import SectionShell from '../layout/SectionShell'
import Button from '../ui/Button'
import { profile } from '../../data/profile'
import { ease, viewport } from '../../lib/motion'

// Contact animation: the address drops in letter by letter with a small bounce, then a line is drawn
// under it. The buttons arrive from alternating sides.
const [user, domain] = profile.email.split(/(?=@)/)

function Letters({ text, start }) {
  const reduce = useReducedMotion()
  return (
    <span className="inline-block whitespace-nowrap">
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block"
          initial={reduce ? false : { y: -60, opacity: 0, rotate: -10 }}
          whileInView={reduce ? undefined : { y: 0, opacity: 1, rotate: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 260, damping: 12, delay: (start + i) * 0.035 }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

export default function Contact() {
  const reduce = useReducedMotion()
  const buttons = [
    <Button key="mail" href={`mailto:${profile.email}`}>Send an email</Button>,
    <Button key="gh" href={profile.github} variant="secondary" external>GitHub<span className="sr-only"> (opens in a new tab)</span></Button>,
    <Button key="in" href={profile.linkedin} variant="secondary" external>LinkedIn<span className="sr-only"> (opens in a new tab)</span></Button>,
    <Button key="cv" href={profile.resume} variant="secondary" download>Download résumé</Button>,
  ]
  return (
    <SectionShell id="contact" title="Let's build something" bg="bg-white" fx="blur">
      <motion.p
        initial={reduce ? false : { opacity: 0 }}
        whileInView={reduce ? undefined : { opacity: 1 }}
        viewport={viewport}
        transition={{ duration: 0.9 }}
        className="max-w-[50ch] text-xl text-muted"
      >
        Email is the fastest way to reach me. You can also find me on GitHub and LinkedIn.
      </motion.p>
      <p className="mt-8 font-display text-3xl font-semibold md:text-6xl">
        <a
          href={`mailto:${profile.email}`}
          aria-label={`Email ${profile.name} at ${profile.email}`}
          className="group relative inline-flex max-w-full flex-wrap items-start gap-x-1 pb-3 transition-colors hover:text-accent"
        >
          <Letters text={user} start={0} />
          <Letters text={domain} start={user.length} />
          <ArrowUpRight aria-hidden="true" className="mt-1 h-[0.7em] w-[0.7em] shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transition-none" />
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1 origin-left bg-highlight"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={reduce ? undefined : { scaleX: 1 }}
            viewport={viewport}
            transition={{ duration: 1, delay: 0.9, ease: ease.inOut }}
          />
        </a>
      </p>
      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        {buttons.map((b, i) => (
          <motion.div
            key={b.key}
            initial={reduce ? false : { opacity: 0, x: i % 2 ? 48 : -48 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.7, delay: 0.5 + i * 0.1, ease: ease.out }}
          >
            {b}
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}
