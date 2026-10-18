import { motion, useReducedMotion } from 'motion/react'
import { viewport } from '../../lib/motion'

// One bespoke drawing per project. Each plays once when it scrolls into view and draws from the
// project's own content (modules, features), not from a shared template.
const once = (reduce, from, to, transition) =>
  reduce ? {} : { initial: from, whileInView: to, viewport, transition }

// Kaara Saaram: a printed menu. The card drops in, then each line is written and its dotted leader runs out.
const menuRows = [['Menu', 'dishes'], ['Reservations', 'tables'], ['Gallery', 'photos'], ['Offers', 'deals'], ['Admin', 'staff only']]
function MenuVisual() {
  const reduce = useReducedMotion()
  return (
    <motion.div
      {...once(reduce, { y: -90, rotate: -9, opacity: 0 }, { y: 0, rotate: -2, opacity: 1 }, { type: 'spring', stiffness: 90, damping: 13 })}
      style={reduce ? { rotate: -2 } : undefined}
      className="w-full max-w-[400px] rounded-2xl bg-cream p-7 text-ink shadow-[0_30px_60px_-28px_rgba(20,22,31,0.55)]"
    >
      <p className="font-display text-3xl font-semibold">Kaara Saaram</p>
      <p className="mt-1 text-sm text-muted">South Indian and Chettinad</p>
      <ul className="mt-6 space-y-4">
        {menuRows.map(([name, note], i) => (
          <li key={name} className="flex items-baseline gap-3">
            <motion.span {...once(reduce, { opacity: 0, x: -18 }, { opacity: 1, x: 0 }, { delay: 0.5 + i * 0.14, duration: 0.5 })} className="font-display text-xl font-medium">
              {name}
            </motion.span>
            <motion.span
              {...once(reduce, { scaleX: 0 }, { scaleX: 1 }, { delay: 0.6 + i * 0.14, duration: 0.7, ease: [0.22, 1, 0.36, 1] })}
              className="h-0 flex-1 origin-left border-b-2 border-dotted border-ink/40"
            />
            <motion.span {...once(reduce, { opacity: 0 }, { opacity: 1 }, { delay: 0.9 + i * 0.14 })} className="text-sm text-muted">
              {note}
            </motion.span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

// Virtual Trial Room: a camera viewfinder. Corner brackets close in, the garment outline is traced,
// a scan line sweeps, and the fill keeps changing colour like a try-on.
function ViewfinderVisual() {
  const reduce = useReducedMotion()
  const corner = 'absolute size-10 border-cyan'
  const spots = [
    ['left-0 top-0 border-l-2 border-t-2', { x: -14, y: -14 }],
    ['right-0 top-0 border-r-2 border-t-2', { x: 14, y: -14 }],
    ['bottom-0 left-0 border-b-2 border-l-2', { x: -14, y: 14 }],
    ['bottom-0 right-0 border-b-2 border-r-2', { x: 14, y: 14 }],
  ]
  return (
    <div className="relative aspect-square w-full max-w-[380px] text-cyan">
      {spots.map(([cls, off]) => (
        <motion.span key={cls} className={`${corner} ${cls}`} {...once(reduce, { opacity: 0, ...off }, { opacity: 1, x: 0, y: 0 }, { duration: 0.8, ease: [0.22, 1, 0.36, 1] })} />
      ))}
      <p className="absolute left-5 top-4 flex items-center gap-2 text-sm font-medium">
        <span className="size-2 rounded-full bg-cyan" />
        Live try-on
      </p>
      <svg viewBox="0 0 200 200" className="absolute inset-[16%] h-[68%] w-[68%] overflow-visible">
        <motion.path
          d="M70 30 L40 50 L20 90 L50 100 L60 85 L60 170 L140 170 L140 85 L150 100 L180 90 L160 50 L130 30 Q100 55 70 30 Z"
          className="shirt-fill"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="#FF6B4A"
          {...once(reduce, { pathLength: 0, fillOpacity: 0 }, { pathLength: 1, fillOpacity: 0.9 }, { pathLength: { duration: 1.6, delay: 0.3 }, fillOpacity: { duration: 0.8, delay: 1.6 } })}
        />
      </svg>
      <span aria-hidden="true" className="scan-line absolute inset-x-[10%] top-[8%] h-0.5 bg-cyan shadow-[0_0_14px_var(--color-cyan)]" />
    </div>
  )
}

// Aakam Shine: a hub with its four audiences. Spokes draw out, nodes pop in, and small dots travel along them.
const hub = [210, 160]
const nodes = [
  { name: 'Mentors', at: [78, 56] },
  { name: 'Investors', at: [342, 56] },
  { name: 'Events', at: [78, 264] },
  { name: 'Founders', at: [342, 264] },
]
function NetworkVisual() {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 420 320" className="w-full max-w-[460px] overflow-visible">
      {nodes.map((n, i) => {
        const d = `M${hub[0]} ${hub[1]} L${n.at[0]} ${n.at[1]}`
        return (
          <g key={n.name}>
            <motion.path d={d} fill="none" stroke="var(--color-ink)" strokeWidth="2"  {...once(reduce, { pathLength: 0 }, { pathLength: 1 }, { duration: 0.9, delay: 0.5 + i * 0.15 })} />
            {!reduce && (
              <circle r="4.5" fill="var(--color-accent)">
                <animateMotion dur="3.4s" begin={`${1.8 + i * 0.7}s`} repeatCount="indefinite" path={d} />
              </circle>
            )}
            <motion.g style={{ transformBox: 'fill-box', transformOrigin: 'center' }} {...once(reduce, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1 }, { type: 'spring', stiffness: 200, damping: 14, delay: 1 + i * 0.15 })}>
              <rect x={n.at[0] - 56} y={n.at[1] - 20} width="112" height="40" rx="20" fill="var(--color-cream)" stroke="var(--color-ink)" strokeWidth="2" />
              <text x={n.at[0]} y={n.at[1] + 5.5} textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--color-ink)">{n.name}</text>
            </motion.g>
          </g>
        )
      })}
      <motion.g style={{ transformBox: 'fill-box', transformOrigin: 'center' }} {...once(reduce, { scale: 0 }, { scale: 1 }, { type: 'spring', stiffness: 160, damping: 13 })}>
        <circle cx={hub[0]} cy={hub[1]} r="52" fill="var(--color-ink)" />
        <text x={hub[0]} y={hub[1] - 2} textAnchor="middle" fontSize="17" fontWeight="600" fill="var(--color-cream)">Aakam</text>
        <text x={hub[0]} y={hub[1] + 18} textAnchor="middle" fontSize="17" fontWeight="600" fill="var(--color-cream)">Shine</text>
      </motion.g>
    </svg>
  )
}

// Kicks: three screens of the shop (browse, collections, sign in) stacked like a hand of cards.
// They fan out on entry and spread further when hovered.
const fan = [
  { title: 'Discover', rest: { rotate: 0, x: 0 }, fan: { rotate: -11, x: -78 }, spread: { rotate: -16, x: -110 } },
  { title: 'Sign in', rest: { rotate: 0, x: 0 }, fan: { rotate: 11, x: 78 }, spread: { rotate: 16, x: 110 } },
  { title: 'Collections', rest: { rotate: 0, x: 0 }, fan: { rotate: 0, x: 0, y: -6 }, spread: { rotate: 0, x: 0, y: -16 } },
]
const tints = ['var(--color-layer-design)', 'var(--color-layer-interface)', 'var(--color-layer-logic)', 'var(--color-highlight)']
function FanVisual() {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? 'fan' : 'rest'}
      whileInView="fan"
      whileHover="spread"
      viewport={viewport}
      className="relative h-[330px] w-full max-w-[400px]"
    >
      {fan.map((c, i) => (
        <motion.div
          key={c.title}
          variants={{ rest: { ...c.rest, opacity: 0 }, fan: { ...c.fan, opacity: 1 }, spread: { ...c.spread, opacity: 1 } }}
          transition={{ type: 'spring', stiffness: 130, damping: 15, delay: reduce ? 0 : i * 0.08 }}
          className="absolute left-1/2 top-1/2 -ml-[100px] -mt-[135px] h-[270px] w-[200px] rounded-2xl bg-cream p-4 text-ink shadow-[0_24px_40px_-20px_rgba(0,0,0,0.7)]"
        >
          <p className="font-display text-lg font-semibold">{c.title}</p>
          {c.title === 'Discover' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {tints.map((t) => <span key={t} className="aspect-square rounded-lg" style={{ background: t }} />)}
            </div>
          )}
          {c.title === 'Collections' && (
            <div className="mt-3 space-y-2">
              {[88, 64, 76, 52].map((w, k) => <span key={k} className="block h-9 rounded-lg" style={{ width: `${w}%`, background: tints[k] }} />)}
            </div>
          )}
          {c.title === 'Sign in' && (
            <div className="mt-4 space-y-3">
              <span className="block h-9 rounded-lg border-2 border-ink/25" />
              <span className="block h-9 rounded-lg border-2 border-ink/25" />
              <span className="block h-10 rounded-lg bg-ink" />
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}

// A plain fallback so a project added later still renders: its initials.
function InitialsVisual({ title }) {
  return <p className="font-display text-8xl font-semibold tracking-tighter">{title.split(' ').map((w) => w[0]).join('')}</p>
}

// Colours, title animation and drawing for each project, keyed by project id.
const looks = {
  'kaara-saaram': { bg: 'var(--color-layer-design)', ink: 'var(--color-ink)', fx: 'rise', Visual: MenuVisual },
  'virtual-trial-room': { bg: 'var(--color-navy)', ink: 'var(--color-cream)', fx: 'flip', Visual: ViewfinderVisual },
  'aakam-shine': { bg: 'var(--color-layer-logic)', ink: 'var(--color-ink)', fx: 'blur', Visual: NetworkVisual },
  kicks: { bg: 'var(--color-ink)', ink: 'var(--color-cream)', fx: 'skew', Visual: FanVisual },
}
export function getLook(project) {
  return looks[project.id] ?? { bg: 'var(--color-layer-interface)', ink: 'var(--color-cream)', fx: 'rise', Visual: () => <InitialsVisual title={project.title} /> }
}
