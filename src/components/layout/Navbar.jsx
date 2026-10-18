import { useCallback, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Download, Menu } from 'lucide-react'
import { nav, profile } from '../../data/profile'
import { useActiveSection } from '../../hooks/useActiveSection'
import { layerBg, layerOrder } from '../../lib/layers'
import { spring } from '../../lib/motion'
import Button from '../ui/Button'
import MobileMenu from './MobileMenu'

const ids = ['top', ...nav.map((n) => n.id)]

// Four bars in the layer colours: the site's mark. They shuffle sideways on hover.
function LogoMark() {
  return (
    <span aria-hidden="true" className="relative block h-5 w-5">
      {layerOrder.map((id, i) => (
        <span
          key={id}
          style={{ top: i * 6 }}
          className={`absolute left-0 h-[4px] w-5 rounded-[1px] ${layerBg[id]} transition-transform duration-300 motion-reduce:transition-none ${
            i % 2 ? 'group-hover:-translate-x-0.5 group-focus-visible:-translate-x-0.5' : 'group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5'
          }`}
        />
      ))}
    </span>
  )
}

export default function Navbar() {
  const active = useActiveSection(ids)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggle = useRef(null)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))
  const close = useCallback(() => {
    setOpen(false)
    toggle.current?.focus()
  }, [])

  return (
    <>
      <header
        data-scrolled={scrolled}
        className="group/nav fixed inset-x-0 top-0 z-40 border-b border-transparent transition-[background-color,border-color,box-shadow] duration-300 data-[scrolled=true]:border-line data-[scrolled=true]:bg-cream/85 data-[scrolled=true]:shadow-[0_8px_24px_-18px_rgba(20,22,31,0.35)] data-[scrolled=true]:backdrop-blur-md motion-reduce:transition-none"
      >
        <div className="mx-auto flex h-[88px] max-w-[1200px] items-center justify-between px-5 transition-[height] duration-300 group-data-[scrolled=true]/nav:h-16 motion-reduce:transition-none md:px-8">
          <a href="#top" className="group flex items-center gap-2.5 font-display text-xl font-medium" aria-label={`${profile.name}, back to top`}>
            <LogoMark />
            HS
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {nav.map((n) => {
              const on = active === n.id
              return (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  aria-current={on ? 'true' : undefined}
                  className={`relative py-1 text-sm transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-ink/30 after:transition-transform hover:text-ink hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:transition-none ${
                    on ? 'font-medium text-ink' : 'text-muted'
                  }`}
                >
                  {n.label}
                  {on && (
                    <motion.span
                      layoutId="nav-indicator"
                      data-nav-indicator
                      aria-hidden="true"
                      transition={spring.snappy}
                      className="absolute inset-x-0 -bottom-1 z-10 h-0.5 rounded-full bg-accent"
                    />
                  )}
                </a>
              )
            })}
            <Button href={profile.resume} download icon={Download}>
              Résumé
            </Button>
          </nav>
          <button
            ref={toggle}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            className="flex size-11 items-center justify-center rounded-lg border border-line bg-cream/70 md:hidden"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </header>
      <MobileMenu open={open} onClose={close} />
    </>
  )
}
