import { ArrowLeft, ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import SplitText from '../ui/SplitText'
import ProjectLinks from './ProjectLinks'
import { projects } from '../../data/projects'
import { layers } from '../../data/skills'
import { layerBg, layerName } from '../../lib/layers'
import { ease, viewport } from '../../lib/motion'
import { caseHref, openCase } from '../../lib/route'
import { getLook } from './visuals'

// A full page for one project: the drawing at large size, what was built (from the project's bullets),
// the stack, and which layers it touches. Ends with a link to the next project.
export default function ProjectPage({ project: p }) {
  const reduce = useReducedMotion()
  const look = getLook(p)
  const next = projects[(projects.indexOf(p) + 1) % projects.length]
  const nextLook = getLook(next)
  const slide = (i) => ({
    initial: reduce ? false : { opacity: 0, x: -36 },
    whileInView: reduce ? undefined : { opacity: 1, x: 0 },
    viewport,
    transition: { duration: 0.7, delay: i * 0.1, ease: ease.out },
  })

  return (
    <article id="top" aria-labelledby="case-title" className="min-h-svh bg-cream pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <a href="#work" className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink motion-reduce:transition-none">
          <ArrowLeft aria-hidden="true" size={16} className="transition-transform group-hover:-translate-x-1 motion-reduce:transition-none" />
          All work
        </a>

        <header className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 id="case-title" className="font-display text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[0.95]">
              <SplitText text={p.title} fx={look.fx} stagger={0.12} ready delay={0.1} />
            </h1>
            <p className="mt-4 text-xl text-muted">{p.subtitle}</p>
          </div>
          {p.badge && <span className="rounded-md bg-highlight px-3 py-1.5 text-sm font-medium">{p.badge}</span>}
        </header>

        <div aria-hidden="true" style={{ background: look.bg, color: look.ink }} className="mt-12 grid min-h-[420px] place-items-center rounded-3xl p-6 md:min-h-[520px] md:p-14">
          <look.Visual />
        </div>

        <div className="mt-16 grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
          <section aria-labelledby="built-title">
            <h2 id="built-title" className="text-3xl font-semibold">What I built</h2>
            <ul className="mt-8 space-y-6">
              {p.bullets.map((b, i) => (
                <motion.li key={b} {...slide(i)} className="border-l-4 pl-5 text-lg leading-snug" style={{ borderColor: look.bg }}>
                  {b}
                </motion.li>
              ))}
            </ul>
          </section>

          <aside className="space-y-10">
            <section aria-labelledby="stack-title">
              <h2 id="stack-title" className="text-2xl font-semibold">Built with</h2>
              <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                {p.stack.map((s) => <li key={s} className="rounded-full border border-ink/25 px-3.5 py-1">{s}</li>)}
              </ul>
            </section>
            <section aria-labelledby="layers-title">
              <h2 id="layers-title" className="text-2xl font-semibold">Layers it touches</h2>
              <ul className="mt-4 space-y-4">
                {layers.filter((l) => p.layers.includes(l.id)).map((l) => (
                  <li key={l.id} className="flex items-center gap-4">
                    <span aria-hidden="true" className={`h-1.5 w-10 shrink-0 rounded-full ${layerBg[l.id]}`} />
                    <span>
                      <span className="font-medium">{layerName[l.id]}</span>
                      <span className="text-muted">: {l.headline}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <ProjectLinks project={p} />
          </aside>
        </div>

        <a
          href={caseHref(next.id)}
          onClick={(e) => openCase(e, next.id)}
          style={{ background: nextLook.bg, color: nextLook.ink }}
          className="group mt-24 flex items-center justify-between gap-6 rounded-3xl p-8 md:p-12"
        >
          <span>
            <span className="block text-sm opacity-80">Next project</span>
            <span className="mt-2 block font-display text-4xl font-semibold leading-none md:text-6xl">{next.title}</span>
          </span>
          <ArrowRight aria-hidden="true" className="size-8 shrink-0 transition-transform duration-500 group-hover:translate-x-2 md:size-12 motion-reduce:transition-none" />
        </a>
      </div>
    </article>
  )
}
