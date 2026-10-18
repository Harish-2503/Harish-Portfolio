import { motion, useMotionValue, useTransform } from 'motion/react'
import { layerName, layerOrder, layerVar } from '../../lib/layers'

// Isometric geometry (2:1). Slab 0 is the top (Design); slab 3 is the bottom (Data).
export const A = 200 // half width of a slab
export const H = 100 // half height of the top face
export const T = 30 // slab thickness
export const STEP = 68 // distance between slabs (thickness 30 + gap 38)
export const CX = 220
export const Y0 = 140
export const SHADE = { left: 0.82, right: 0.66 } // face brightness relative to the top face
const TOOL = { design: 'Figma', interface: 'React.js', logic: 'FastAPI', data: 'MySQL' }
const PARALLAX = [8, 4, 0, -4] // px each slab shifts at full pointer deflection

export const shade = (id, k) => `color-mix(in srgb, ${layerVar[id]} ${k * 100}%, black)`
export const pts = (...p) => p.map(([x, y]) => `${x},${y}`).join(' ')

const ease = [0.22, 1, 0.36, 1]
const away = { y: -56, opacity: 0 }
const home = { y: 0, opacity: 1 }

function Slab({ id, i, px, animated, ready, delay, stagger }) {
  const y = Y0 + i * STEP
  const x = useTransform(px, (v) => v * PARALLAX[i])
  const seal = { stroke: 'var(--color-cream)', strokeWidth: 1.5, strokeLinejoin: 'round' }
  return (
    <motion.g
      data-layer={id}
      style={{ x }}
      initial={animated ? away : false}
      animate={animated && !ready ? away : home}
      transition={{ delay: delay + (layerOrder.length - 1 - i) * stagger, duration: 0.6, ease }}
    >
      <polygon points={pts([CX - A, y], [CX, y + H], [CX, y + H + T], [CX - A, y + T])} style={{ fill: shade(id, SHADE.left), ...seal }} />
      <polygon points={pts([CX, y + H], [CX + A, y], [CX + A, y + T], [CX, y + H + T])} style={{ fill: shade(id, SHADE.right), ...seal }} />
      <polygon points={pts([CX, y - H], [CX + A, y], [CX, y + H], [CX - A, y])} style={{ fill: layerVar[id], ...seal }} />
    </motion.g>
  )
}

// Static SVG by default. `animated` + `ready` plays the build-up; `px` (a -1..1 motion value)
// adds a small per-layer parallax. With neither, it is a plain image, so it doubles as the fallback.
export default function LayerStack({ animated = false, ready = true, labeled = false, px, delay = 0.1, stagger = 0.13, className }) {
  const idle = useMotionValue(0)
  const shift = px ?? idle
  const groundY = Y0 + 3 * STEP + T + 22
  const width = labeled ? 600 : 440

  return (
    <svg viewBox={`0 0 ${width} 500`} role="img" aria-labelledby="layerstack-title" className={className}>
      <title id="layerstack-title">Four stacked layers, from top to bottom: Design, Interface, Logic, Data</title>
      <polygon
        points={pts([CX, groundY - H], [CX + A, groundY], [CX, groundY + H], [CX - A, groundY])}
        fill="var(--color-ink)"
        opacity="0.07"
      />
      {[...layerOrder].reverse().map((id) => {
        const i = layerOrder.indexOf(id)
        return <Slab key={id} id={id} i={i} px={shift} animated={animated} ready={ready} delay={delay} stagger={stagger} />
      })}
      {labeled &&
        layerOrder.map((id, i) => {
          const y = Y0 + i * STEP + T / 2
          return (
            <motion.g
              key={id}
              aria-hidden="true"
              initial={animated ? { opacity: 0 } : false}
              animate={{ opacity: animated && !ready ? 0 : 1 }}
              transition={{ delay: delay + 0.75 + (layerOrder.length - 1 - i) * 0.08, duration: 0.5 }}
            >
              <line x1={CX + A + 10} x2={CX + A + 46} y1={y} y2={y} stroke="var(--color-ink)" strokeOpacity="0.35" />
              <text x={CX + A + 58} y={y - 1} className="fill-ink font-sans" fontSize="20" fontWeight="500">
                {layerName[id]}
              </text>
              <text x={CX + A + 58} y={y + 19} className="fill-muted font-sans" fontSize="16">
                {TOOL[id]}
              </text>
            </motion.g>
          )
        })}
    </svg>
  )
}
