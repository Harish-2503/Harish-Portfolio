import Magnetic from './Magnetic'

// A fill sweeps in from the left on hover and keyboard focus. The button leans toward the mouse.
// `icon` is an optional lucide component, shown after the label.
export default function Button({ href, variant = 'primary', external = false, download = false, icon: Icon, magnetic = true, children }) {
  const primary = variant === 'primary'
  const link = (
    <a
      href={href}
      className={`group relative inline-flex min-h-11 items-center justify-center overflow-hidden rounded-lg px-5 py-3 text-sm font-medium transition-colors duration-300 motion-reduce:transition-none ${
        primary ? 'bg-ink text-white' : 'border border-ink/25 text-ink hover:border-ink focus-visible:border-ink'
      }`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(download ? { download: '' } : {})}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0 group-focus-visible:translate-x-0 motion-reduce:transition-none ${
          primary ? 'bg-accent' : 'bg-ink'
        }`}
      />
      <span
        className={`relative inline-flex items-center gap-2 ${
          primary ? '' : 'transition-colors duration-300 group-hover:text-cream group-focus-visible:text-cream motion-reduce:transition-none'
        }`}
      >
        {children}
        {Icon && <Icon aria-hidden="true" size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />}
      </span>
    </a>
  )
  return magnetic ? <Magnetic>{link}</Magnetic> : link
}
