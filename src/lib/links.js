// Project link helpers. Only well-formed http(s) URLs ever become a link; anything else is ignored.

export function safeUrl(value) {
  if (!value || typeof value !== 'string') return null
  try {
    const u = new URL(value.trim())
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null
  } catch {
    return null
  }
}

// Action buttons a project can show, in display order, skipping unset or invalid URLs.
export function projectActions(project) {
  const defs = [
    ['github', 'GitHub', project.githubUrl],
    ['live', 'Live demo', project.liveUrl],
    ['case', 'Case study', project.caseStudy],
  ]
  return defs.flatMap(([kind, label, url]) => {
    const href = safeUrl(url)
    return href ? [{ kind, label, href }] : []
  })
}

// Absolute URLs pass through; paths resolve against the site base so subpath hosting still works.
export function assetUrl(path) {
  if (!path) return ''
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
