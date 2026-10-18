import { useRef } from 'react'
import { motion, useReducedMotion, useTransform } from 'motion/react'
import { ArrowDownRight, Download, Mail } from 'lucide-react'
import { profile } from '../../data/profile'
import { layerBg, layerName, layerOrder } from '../../lib/layers'
import { dur, ease } from '../../lib/motion'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { usePointerTilt } from '../../hooks/usePointerTilt'
import { useReady } from '../../hooks/useReady'
import { useScrollScene } from '../../hooks/useScrollScene'
import Button from '../ui/Button'
import SplitText from '../ui/SplitText'
import HeroBackdrop from './HeroBackdrop'
import LayerStackSwitch from './LayerStackSwitch'
import NameReveal from './NameReveal'

// Entrance timeline, in seconds after `ready` (one deliberate sequence, never everything at once):
//   0.00  name: "Harish" letters rise out of a mask, "S" bounces in (50ms apart)
//   0.10  stack builds bottom-up: Data, Logic, Interface, Design (130ms apart)
//   0.20  backdrop outlines draw in, 150ms apart
//   0.50  tagline: every word has a different entrance (rise, blur, flip, slide, scale, drop, skew, wipe, pop)
//   0.85  layer labels fade in
//   1.20  role line: its words enter with a different cycle of styles
//   1.40  buttons: one slides from the left, one pops in, one slides from the right
//   2.20  scroll cue appears; it fades out as soon as the page moves
// Exit: as the hero scrolls away the text drifts up and fades, the stack drifts slower and shrinks,
// the backdrop expands. That scroll-linked depth difference is the transition into the next section.
export default function Hero({ startDelay = 0.1 }) {
  const ready = useReady(startDelay * 1000)
  const wide = useMediaQuery('(min-width: 1024px)')
  const reduce = useReducedMotion()
  const root = useRef(null)
  const { px, py, handlers } = usePointerTilt()

  const p = useScrollScene(root)
  const textY = useTransform(p, [0, 1], [0, -70])
  const textOpacity = useTransform(p, [0, 0.75], [1, 0.1])
  const stackY = useTransform(p, [0, 1], [0, -34])
  const stackScale = useTransform(p, [0, 1], [1, 0.93])
  const backdropScale = useTransform(p, [0, 1], [1, 1.12])
  const cueOpacity = useTransform(p, [0, 0.08], [1, 0])
  const textScene = reduce ? undefined : { y: textY, opacity: textOpacity }
  const stackScene = reduce ? undefined : { y: stackY, scale: stackScale }

  const fade = (delay) => ({
    initial: { opacity: 0 },
    animate: { opacity: ready ? 1 : 0 },
    transition: { delay, duration: dur.base },
  })
  const enter = (from, delay) => ({
    initial: { opacity: 0, ...from },
    animate: { opacity: ready ? 1 : 0, x: ready ? 0 : from.x ?? 0, y: ready ? 0 : from.y ?? 0, scale: ready ? 1 : from.scale ?? 1 },
    transition: from.scale ? { delay, type: 'spring', stiffness: 220, damping: 15 } : { delay, duration: dur.base, ease: ease.out },
  })

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh items-center overflow-hidden bg-cream pb-12 pt-[96px] md:pb-24"
      {...handlers}
    >
      <HeroBackdrop px={px} py={py} ready={ready} scale={backdropScale} />
      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-8 px-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-8 md:px-8">
        <motion.div style={textScene}>
          <h1 id="hero-title" className="text-display font-medium">
            <NameReveal text={profile.name} ready={ready} />
          </h1>
          <SplitText
            as="p"
            text={profile.tagline}
            ready={ready}
            delay={0.5}
            stagger={0.07}
            fx="mixed"
            className="mt-8 max-w-[22ch] text-balance font-display text-3xl leading-tight md:text-4xl"
          />
          <SplitText as="p" text={profile.title} ready={ready} delay={1.2} stagger={0.09} fx="mixed" offset={3} className="mt-5 text-muted" />
          <div className="mt-10 flex flex-wrap gap-3">
            <motion.div {...enter({ x: -48 }, 1.4)}>
              <Button href="#work" icon={ArrowDownRight}>
                View work
              </Button>
            </motion.div>
            <motion.div {...enter({ scale: 0.6 }, 1.55)}>
              <Button href={profile.resume} variant="secondary" download icon={Download}>
                Download résumé
              </Button>
            </motion.div>
            <motion.div {...enter({ x: 48 }, 1.7)}>
              <Button href="#contact" variant="secondary" icon={Mail}>
                Contact
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div style={stackScene} className="mx-auto w-full max-w-[300px] sm:max-w-[420px] md:max-w-none">
          <LayerStackSwitch animated ready={ready} labeled={wide} px={px} py={py} />
          {!wide && (
            <motion.ul {...fade(0.95)} aria-hidden="true" className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted">
              {layerOrder.map((id) => (
                <li key={id} className="flex items-center gap-2">
                  <span className={`size-3 rounded-sm ${layerBg[id]}`} />
                  {layerName[id]}
                </li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { opacity: cueOpacity }}
        className="pointer-events-none absolute bottom-6 left-5 hidden md:left-8 md:block"
      >
        <motion.div {...fade(2.2)} className="flex items-center gap-3 text-sm text-muted">
          <span className="block h-10 w-px overflow-hidden">
            <span className="scroll-cue block h-full w-full bg-ink/60" />
          </span>
          Scroll
        </motion.div>
      </motion.div>
    </section>
  )
}
