// Usage: npm run check:links            (offline: format checks only)
//        npm run check:links -- --online (also asks GitHub / the live site whether each URL responds)
// Missing links are reported but are not errors. Malformed URLs and missing image files are errors (exit 1).
import { existsSync, readFileSync } from 'node:fs'
import { projects } from '../src/data/projects.js'

const online = process.argv.includes('--online')
const profileSrc = readFileSync(new URL('../src/data/profile.js', import.meta.url), 'utf8')
const owner = profileSrc.match(/github:\s*['"]https:\/\/github\.com\/([^/'"]+)/)?.[1]

let errors = 0
const out = (id, field, status, note = '') => {
  if (status === 'ERROR') errors++
  console.log(`${status.padEnd(8)} ${id.padEnd(20)} ${field.padEnd(10)} ${note}`)
}

const parse = (v) => {
  try {
    const u = new URL(v.trim())
    return u.protocol === 'https:' || u.protocol === 'http:' ? u : null
  } catch {
    return null
  }
}
const ping = async (url, headers = {}) => {
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'portfolio-link-check', ...headers } })
    return { status: r.status, limited: r.status === 403 && r.headers.get('x-ratelimit-remaining') === '0' }
  } catch (e) {
    return { status: `network error (${e.cause?.code ?? e.message})` }
  }
}

for (const p of projects) {
  for (const field of ['githubUrl', 'liveUrl', 'caseStudy']) {
    const v = p[field]
    if (!v) { out(p.id, field, 'missing', field === 'githubUrl' ? 'add the repository URL in src/data/projects.js' : ''); continue }
    const u = parse(v)
    if (!u) { out(p.id, field, 'ERROR', `not a valid http(s) URL: ${v}`); continue }
    const notes = []
    if (u.protocol === 'http:') notes.push('uses http, prefer https')
    if (field === 'githubUrl') {
      const m = u.hostname === 'github.com' && u.pathname.match(/^\/([^/]+)\/([^/]+?)\/?$/)
      if (!m) { out(p.id, field, 'ERROR', `expected https://github.com/<owner>/<repo>: ${v}`); continue }
      if (owner && m[1].toLowerCase() !== owner.toLowerCase()) notes.push(`owner is ${m[1]}, profile owner is ${owner}`)
      if (online) {
        const token = process.env.GITHUB_TOKEN
        const r = await ping(`https://api.github.com/repos/${m[1]}/${m[2]}`, token ? { Authorization: `Bearer ${token}` } : {})
        if (r.limited) { out(p.id, field, 'warn', 'GitHub rate limit reached, could not verify (retry later or set GITHUB_TOKEN)'); continue }
        if (r.status === 404) { out(p.id, field, 'ERROR', 'repository not found (404): check the URL, or it may be private'); continue }
        if (r.status !== 200) { out(p.id, field, 'ERROR', `GitHub API returned ${r.status}`); continue }
        notes.push('repository exists')
      }
    } else if (online) {
      const r = await ping(u.href)
      if (typeof r.status !== 'number' || r.status >= 400) { out(p.id, field, 'ERROR', `responded ${r.status}`); continue }
      notes.push(`responded ${r.status}`)
    }
    out(p.id, field, notes.some((n) => /owner|http,/.test(n)) ? 'warn' : 'ok', notes.join('; ') || v)
  }
  if (p.image) {
    const remote = /^(https?:)?\/\//.test(p.image)
    const exists = remote || existsSync(new URL(`../public/${p.image.replace(/^\//, '')}`, import.meta.url))
    out(p.id, 'image', exists ? 'ok' : 'ERROR', exists ? p.image : `file not found in public/: ${p.image}`)
  } else out(p.id, 'image', 'missing', 'placeholder will be shown')
}
console.log(errors ? `\n${errors} error(s).` : '\nNo errors.')
process.exit(errors ? 1 : 0)
