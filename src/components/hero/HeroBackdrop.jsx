import { motion, useReducedMotion, useTransform } from 'motion/react'
import { ease } from '../../lib/motion'

// Isometric outlines echoing the slab shape (2:1 diamonds). Each ring draws itself in, then sits at its
// own depth: pointer movement shifts the far ring least and the near ring most, so they separate.
const RINGS = [
  { w: 430, depth: 8, delay: 0.2 },
  { w: 330, depth: 16, delay: 0.35 },
  { w: 235, depth: 26, delay: 0.5 },
]
const CX = 500
const CY = 280

function Ring({ w, depth, delay, px, py, ready, reduce }) {
  const x = useTransform(px, (v) => v * -depth)
  const y = useTransform(py, (v) => v * -depth * 0.6)
  const d = `M${CX} ${CY - w / 2}L${CX + w} ${CY}L${CX} ${CY + w / 2}L${CX - w} ${CY}Z`
  return (
    <motion.g style={reduce ? undefined : { x, y }}>
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: ready || reduce ? 1 : 0 }}
        transition={{ duration: 1.6, delay, ease: ease.out }}
      />
    </motion.g>
  )
}

export default function HeroBackdrop({ px, py, ready, scale }) {
  const reduce = useReducedMotion()
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 1000 560"
      style={reduce ? undefined : { scale }}
      className="pointer-events-none absolute right-[-12%] top-1/2 hidden w-[84%] -translate-y-1/2 text-ink/15 md:block"
    >
      {RINGS.map((r) => (
        <Ring key={r.w} {...r} px={px} py={py} ready={ready} reduce={reduce} />
      ))}
    </motion.svg>
  )
}
