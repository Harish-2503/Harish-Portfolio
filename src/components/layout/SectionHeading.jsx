import { motion, useReducedMotion } from 'motion/react'
import { dur, ease, viewport } from '../../lib/motion'
import SplitText from '../ui/SplitText'

// Every section title: a word reveal (each section picks its own `fx`), then a short rule that draws in underneath.
export default function SectionHeading({ id, children, fx }) {
  const reduce = useReducedMotion()
  return (
    <>
      <h2 id={id} className="max-w-[20ch] text-h2 font-medium">
        <SplitText text={children} fx={fx} />
      </h2>
      {reduce ? (
        <span aria-hidden="true" className="mt-8 block h-px w-24 bg-current opacity-40" />
      ) : (
        <motion.span
          aria-hidden="true"
          className="mt-8 block h-px w-24 origin-left bg-current opacity-40"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={viewport}
          transition={{ duration: dur.slow, delay: 0.3, ease: ease.out }}
        />
      )}
    </>
  )
}
