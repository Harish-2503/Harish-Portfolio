import { useEffect } from 'react'
import { motion } from 'motion/react'
import { layerBg, layerOrder } from '../../lib/layers'
import { LOADER_FADE, LOADER_HOLD } from '../../lib/intro'

const ease = [0.22, 1, 0.36, 1]

// Four layer-coloured segments fill in order, then the whole screen fades to the hero.
// Sits on the page background colour so there is no flash before it mounts.
export default function Loader({ onDone }) {
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-cream"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: LOADER_HOLD, duration: LOADER_FADE, ease: 'easeInOut' }}
      onAnimationComplete={onDone}
    >
      <div className="flex flex-col items-center gap-6">
        <motion.span
          className="font-display text-5xl font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          HS
        </motion.span>
        <div className="flex w-44 gap-1">
          {layerOrder.map((id, i) => (
            <motion.span
              key={id}
              className={`h-1.5 flex-1 origin-left rounded-sm ${layerBg[id]}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.12, duration: 0.28, ease }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
