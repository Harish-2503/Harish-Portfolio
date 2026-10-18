import { useEffect, useState } from 'react'

// Case-study pages live at #case-<project id>. Hash routing keeps the site static and subpath-safe.
const PREFIX = 'case-'
const read = () => {
  const h = window.location.hash.slice(1)
  return h.startsWith(PREFIX) ? decodeURIComponent(h.slice(PREFIX.length)) : null
}

export const caseHref = (id) => `#${PREFIX}${id}`

export function useCaseRoute() {
  const [id, setId] = useState(read)
  useEffect(() => {
    const on = () => setId(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return id
}

// Click handler for links to a case study. Stops the smooth-scroll library from trying to treat the
// hash as an on-page anchor, then lets the hash change drive the route.
export function openCase(e, id) {
  e.nativeEvent.stopPropagation()
  e.preventDefault()
  window.location.hash = `${PREFIX}${id}`
}
