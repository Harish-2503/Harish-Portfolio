import { Fragment } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { mixedOrder, stagger as STAGGER, viewport, wordFx } from '../../lib/motion'

// Words enter one by one. `fx` is the name of an entry style from wordFx, or 'mixed' to give every
// word a different style (`offset` shifts where the cycle starts). Plays when scrolled into view, or
// when `ready` flips true if given. The text stays in the DOM once for assistive tech.
export default function SplitText({ text, as: Tag = 'span', className, delay = 0, ready, stagger = STAGGER.text, fx = 'rise', offset = 0 }) {
  const reduce = useReducedMotion()
  if (reduce) return <Tag className={className}>{text}</Tag>

  const container = { hide: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }
  const trigger = ready === undefined ? { whileInView: 'show', viewport } : { animate: ready ? 'show' : 'hide' }
  const words = text.split(' ')
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span aria-hidden="true" variants={container} initial="hide" {...trigger}>
        {words.map((w, i) => {
          const f = wordFx[fx === 'mixed' ? mixedOrder[(i + offset) % mixedOrder.length] : fx]
          return (
            <Fragment key={i}>
              <span className={`inline-block align-top ${f.mask ? '-my-[0.1em] overflow-hidden py-[0.1em]' : ''}`}>
                <motion.span variants={{ hide: f.hide, show: f.show }} className="inline-block">
                  {w}
                </motion.span>
              </span>
              {i < words.length - 1 && ' '}
            </Fragment>
          )
        })}
      </motion.span>
    </Tag>
  )
}
