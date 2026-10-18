// Motion conventions shared by every component. Change a value here, not in the component.
//
// Rules
//  - One easing for entrances (ease.out), one for exits and scrubbed reversals (ease.inOut).
//  - Entrances animate transform/opacity/clip-path only; never layout properties.
//  - Reveals play once (viewport.once). Looping motion is limited to the hero scroll cue and the work-card technology ribbon.
//  - Reduced motion: <MotionConfig reducedMotion="user"> removes transform animation globally, and
//    components that rely on an initial hidden state (SplitText, SectionHeading, Magnetic) render their
//    final static state themselves when useReducedMotion() is true.

export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
}

export const dur = { fast: 0.25, base: 0.6, slow: 0.9 }

export const stagger = { text: 0.045, list: 0.08 }

export const spring = {
  snappy: { type: 'spring', stiffness: 260, damping: 26 }, // indicators, selection
  soft: { type: 'spring', stiffness: 120, damping: 20 }, // parallax
  magnet: { stiffness: 180, damping: 16, mass: 0.4 }, // useSpring options for Magnetic
}

export const viewport = { once: true, margin: '0px 0px -12% 0px' }

export const variants = {
  rise: { hide: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } } },
  mask: { hide: { y: '115%' }, show: { y: 0, transition: { duration: dur.slow, ease: ease.out } } },
}

// Entrance styles for single words or letters. Each one moves differently so no two neighbours match.
// `mask` styles slide out of a clipped line; the rest animate in place.
const t = (d, e = ease.out) => ({ duration: d, ease: e })
const bounce = { type: 'spring', stiffness: 200, damping: 14 }
export const wordFx = {
  rise: { mask: true, hide: { y: '115%' }, show: { y: 0, transition: t(0.9) } },
  drop: { mask: true, hide: { y: '-115%' }, show: { y: 0, transition: t(0.8) } },
  blur: { hide: { opacity: 0, filter: 'blur(14px)', y: 12 }, show: { opacity: 1, filter: 'blur(0px)', y: 0, transition: t(1) } },
  scale: { hide: { opacity: 0, scale: 0.3 }, show: { opacity: 1, scale: 1, transition: bounce } },
  left: { hide: { opacity: 0, x: -56 }, show: { opacity: 1, x: 0, transition: t(0.8) } },
  right: { hide: { opacity: 0, x: 56 }, show: { opacity: 1, x: 0, transition: t(0.8) } },
  flip: { hide: { opacity: 0, rotateX: -90, transformPerspective: 500 }, show: { opacity: 1, rotateX: 0, transformPerspective: 500, transition: t(0.9) } },
  skew: { hide: { opacity: 0, skewX: 28, x: -28 }, show: { opacity: 1, skewX: 0, x: 0, transition: t(0.8) } },
  wipe: { hide: { clipPath: 'inset(0% 100% 0% 0%)' }, show: { clipPath: 'inset(0% 0% 0% 0%)', transition: t(0.85, ease.inOut) } },
  pop: { hide: { opacity: 0, y: 32, rotate: -7 }, show: { opacity: 1, y: 0, rotate: 0, transition: bounce } },
}
export const mixedOrder = ['rise', 'blur', 'flip', 'left', 'scale', 'drop', 'skew', 'right', 'wipe', 'pop']
