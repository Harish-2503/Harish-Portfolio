import { motion } from 'motion/react'
import { wordFx } from '../../lib/motion'

// Each word of the name uses its own entrance: the first word's letters rise out of a clipped line,
// the next word's letters bounce in. The real name stays in the DOM for screen readers.
const perWord = ['rise', 'pop', 'flip']
const group = { show: { transition: { staggerChildren: 0.05 } } }

export default function NameReveal({ text, ready }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span aria-hidden="true" className="block" variants={group} initial="hide" animate={ready ? 'show' : 'hide'}>
        {text.split(' ').map((word, wi) => {
          const f = wordFx[perWord[wi % perWord.length]]
          return (
            <span key={wi} className="inline-block whitespace-nowrap">
              {[...word].map((ch, i) => (
                <span key={i} className={`inline-block align-top ${f.mask ? '-my-[0.12em] overflow-hidden py-[0.12em]' : ''}`}>
                  <motion.span variants={{ hide: f.hide, show: f.show }} className="inline-block">
                    {ch}
                  </motion.span>
                </span>
              ))}
              {wi < text.split(' ').length - 1 && <span className="inline-block w-[0.26em]" />}
            </span>
          )
        })}
      </motion.span>
    </>
  )
}
