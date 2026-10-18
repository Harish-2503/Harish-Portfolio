import { useCallback } from 'react'
import { useMotionValue, useReducedMotion, useSpring } from 'motion/react'

// Normalised pointer position (-1..1) relative to the element the handlers are attached to.
// Mouse only: touch and pen never tilt. Returns springed motion values plus event handlers.
export function usePointerTilt() {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const px = useSpring(x, { stiffness: 90, damping: 18, mass: 0.6 })
  const py = useSpring(y, { stiffness: 90, damping: 18, mass: 0.6 })

  const onPointerMove = useCallback(
    (e) => {
      if (e.pointerType !== 'mouse') return
      const r = e.currentTarget.getBoundingClientRect()
      x.set(((e.clientX - r.left) / r.width - 0.5) * 2)
      y.set(((e.clientY - r.top) / r.height - 0.5) * 2)
    },
    [x, y],
  )
  const onPointerLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return { px, py, handlers: reduce ? {} : { onPointerMove, onPointerLeave } }
}
