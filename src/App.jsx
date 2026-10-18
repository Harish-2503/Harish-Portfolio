import { useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { LOADER_HOLD, markIntroSeen, shouldPlayIntro } from './lib/intro'
import Loader from './components/loader/Loader'
import SkipLink from './components/layout/SkipLink'
import SmoothScroll from './components/layout/SmoothScroll'
import ScrollProgress from './components/layout/ScrollProgress'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/hero/Hero'
import StoryScroll from './components/story/StoryScroll'
import StackExplorer from './components/skills/StackExplorer'
import ProjectGallery from './components/projects/ProjectGallery'
import Timeline from './components/timeline/Timeline'
import ImpactStrip from './components/recognition/ImpactStrip'
import Contact from './components/contact/Contact'
import ProjectPage from './components/projects/ProjectPage'
import { projects } from './data/projects'
import { profile } from './data/profile'
import { useCaseRoute } from './lib/route'

const SITE_TITLE = document.title

export default function App() {
  const [play] = useState(shouldPlayIntro)
  const [loading, setLoading] = useState(play)
  const caseId = useCaseRoute()
  const project = projects.find((p) => p.id === caseId)
  const wasCase = useRef(false)

  // Opening a case study starts at its top; coming back lands on the section named in the URL.
  useEffect(() => {
    if (project) {
      wasCase.current = true
      document.title = `${project.title} | ${profile.name}`
      window.scrollTo(0, 0)
      return
    }
    document.title = SITE_TITLE
    if (!wasCase.current) return
    wasCase.current = false
    const target = document.getElementById(window.location.hash.slice(1))
    const frame = requestAnimationFrame(() => (target ?? document.getElementById('work'))?.scrollIntoView())
    return () => cancelAnimationFrame(frame)
  }, [project])

  // On a case-study page the home sections are not mounted, so section links (#about, #contact...) are
  // handled here: capture the click before the smooth-scroll library sees it, and just change the hash.
  useEffect(() => {
    if (!project) return
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]')
      const id = a?.getAttribute('href').slice(1)
      if (!id || id.startsWith('case-') || id === 'top') return
      e.preventDefault()
      e.stopPropagation()
      window.location.hash = id
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [project])
  return (
    <MotionConfig reducedMotion="user">
      {loading && (
        <Loader
          onDone={() => {
            markIntroSeen()
            setLoading(false)
          }}
        />
      )}
      <SkipLink />
      <SmoothScroll />
      <ScrollProgress />
      <Navbar key={project ? 'case' : 'home'} />
      <main id="main">
        {project ? (
          <ProjectPage key={project.id} project={project} />
        ) : (
          <>
            <Hero startDelay={play ? LOADER_HOLD : 0.1} />
            <StoryScroll />
            <StackExplorer />
            <ProjectGallery />
            <Timeline />
            <ImpactStrip />
            <Contact />
          </>
        )}
      </main>
      <Footer />
    </MotionConfig>
  )
}
