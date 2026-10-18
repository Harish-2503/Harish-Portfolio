import { useScroll } from 'motion/react'

// 0 -> 1 progress of an element passing through the viewport. Default offset: from the moment its top
// meets the top of the screen until its bottom leaves it, which suits an opening section scrolling away.
export function useScrollScene(target, offset = ['start start', 'end start']) {
  const { scrollYProgress } = useScroll({ target, offset })
  return scrollYProgress
}
