import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { spring } from '../../lib/motion'

// Pulls its child a little toward the mouse. Mouse only: touch and pen never move it.
export default function Magnetic({ children, strength = 0.28, className = 'inline-flex' }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, spring.magnet)
  const sy = useSpring(y, spring.magnet)
  if (reduce) return <span className={className}>{children}</span>

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const onPointerLeave = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.span className={className} style={{ x: sx, y: sy }} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {children}
    </motion.span>
  )
}
