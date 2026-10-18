import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { nav, profile } from '../../data/profile'
import { dur, ease } from '../../lib/motion'

const ORIGIN = 'at calc(100% - 42px) 44px' // the menu button: the reveal grows out of it

export default function MobileMenu({ open, onClose }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  // Reduced motion: a plain fade, no circular reveal and no sliding links.
  const panel = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { clipPath: `circle(0vmax ${ORIGIN})` },
        animate: { clipPath: `circle(150vmax ${ORIGIN})`, transition: { duration: 0.7, ease: ease.out } },
        exit: { clipPath: `circle(0vmax ${ORIGIN})`, transition: { duration: 0.4, ease: ease.inOut, delay: 0.15 } },
      }
  const list = reduce
    ? { hide: {}, show: {}, exit: {} }
    : { hide: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } }, exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } } }
  const item = reduce
    ? { hide: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.15 } }, exit: { opacity: 0, transition: { duration: 0.1 } } }
    : { hide: { y: '110%' }, show: { y: 0, transition: { duration: dur.slow, ease: ease.out } }, exit: { y: '110%', transition: { duration: dur.fast } } }

  useEffect(() => {
    if (!open) return
    const root = ref.current
    const items = () => [...root.querySelectorAll('a,button')]
    items()[0]?.focus()
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab') return
      const f = items()
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex flex-col bg-navy px-5 pb-10 pt-[22px] text-cream md:hidden"
          {...panel}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto flex size-11 items-center justify-center rounded-lg border border-cream/30 focus-visible:outline-cyan"
          >
            <X size={22} aria-hidden="true" />
          </button>
          <motion.nav aria-label="Mobile" variants={list} initial="hide" animate="show" exit="exit" className="mt-10 flex flex-col gap-1">
            {nav.map((n, i) => (
              <span key={n.id} className="block overflow-hidden">
                <motion.a
                  variants={item}
                  href={`#${n.id}`}
                  onClick={onClose}
                  className="flex items-baseline gap-4 py-2 font-display text-5xl font-medium focus-visible:outline-cyan"
                >
                  <span aria-hidden="true" className="text-xs tabular-nums text-cyan">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {n.label}
                </motion.a>
              </span>
            ))}
          </motion.nav>
          <motion.a
            variants={item}
            initial="hide"
            animate="show"
            exit="exit"
            transition={{ delay: 0.6 }}
            href={profile.resume}
            download
            className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-cream px-5 py-3 text-sm font-medium text-ink focus-visible:outline-cyan"
          >
            Download résumé
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
