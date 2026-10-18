import { profile } from '../../data/profile'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted md:px-8">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <a href="#top" className="hover:text-accent">Back to top</a>
      </div>
    </footer>
  )
}
