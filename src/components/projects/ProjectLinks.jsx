import { ArrowUpRight, CodeXml } from 'lucide-react'
import Button from '../ui/Button'
import { projectActions } from '../../lib/links'

// External links for a project (GitHub, live demo, case study). Only valid URLs produce a button.
export default function ProjectLinks({ project: p }) {
  const actions = projectActions(p)
  // Development only: a visible reminder of what to fill in. Stripped from production builds.
  const hint = import.meta.env.DEV && !actions.some((a) => a.kind === 'github')
  if (!actions.length && !hint) return null
  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((a) => (
        <Button key={a.kind} href={a.href} external variant={a.kind === 'github' ? 'primary' : 'secondary'} icon={a.kind === 'github' ? CodeXml : ArrowUpRight}>
          {a.label}
          <span className="sr-only"> for {p.title} (opens in a new tab)</span>
        </Button>
      ))}
      {hint && <p className="rounded-md border border-dashed border-muted/50 px-3 py-2 text-xs text-muted">Dev: set githubUrl for “{p.id}” in src/data/projects.js</p>}
    </div>
  )
}
