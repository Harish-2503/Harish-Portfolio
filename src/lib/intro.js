// Loader timing (seconds). Total on-screen time = LOADER_HOLD + LOADER_FADE <= 1.2s.
export const LOADER_HOLD = 0.72
export const LOADER_FADE = 0.4
const KEY = 'hs:intro-seen:v1'

// Plays on the first visit only. Add ?intro to the URL to force it while developing.
// Skipped for reduced-motion users.
export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (new URLSearchParams(window.location.search).has('intro')) return true
  try {
    return !window.localStorage.getItem(KEY)
  } catch {
    return true
  }
}

export function markIntroSeen() {
  try {
    window.localStorage.setItem(KEY, '1')
  } catch {
    /* storage unavailable: loader will simply play again */
  }
}
