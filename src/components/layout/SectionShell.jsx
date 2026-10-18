import SectionHeading from './SectionHeading'

export default function SectionShell({ id, title, bg = 'bg-cream', fx = 'rise', children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`${bg} scroll-mt-[72px] py-24 md:py-40`}>
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <SectionHeading id={`${id}-title`} fx={fx}>{title}</SectionHeading>
        <div className="mt-10 md:mt-14">{children}</div>
      </div>
    </section>
  )
}
