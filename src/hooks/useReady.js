import { useEffect, useState } from 'react'

// True once the display font is loaded and `delayMs` has passed.
// Entrance animations start from this, so the name never reveals in a fallback font.
export function useReady(delayMs = 0) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let live = true
    const font = Promise.race([
      document.fonts?.load('600 1em "Bricolage Grotesque Variable"', 'Harish S') ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 800)),
    ]).catch(() => {})
    const wait = new Promise((r) => setTimeout(r, delayMs))
    Promise.all([font, wait]).then(() => live && setReady(true))
    return () => {
      live = false
    }
  }, [delayMs])
  return ready
}
