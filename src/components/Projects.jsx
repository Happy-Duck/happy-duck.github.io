import { useRef } from 'react'
import { motion } from 'framer-motion'
// Project data lives in src/content/projects.js
import { PROJECTS, entryAnchor, entryPath } from '../content/index.js'
import { navigate } from '../lib/router'
import { EntryLinkButton } from './EntryLinkButton'

// Projects marked `grid: false` have a page (and show up under their
// class) but no card here
const CARDS = PROJECTS.filter(p => p.grid !== false)

// ── Animation variants ─────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

const headerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const headerItem = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

// ── Parallax card shell ────────────────────────────────────────────────
// The whole card opens the project's page. It is a div with role="link"
// rather than an <a> because the store button inside it is itself a link.

function ParallaxCard({ children, delay = 0, href, label, anchor }) {
  const innerRef = useRef(null)

  const onMouseMove = (e) => {
    const el   = innerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx   = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2)
    const dy   = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2)
    const maxR = 4.5
    el.style.transform  = `perspective(900px) rotateX(${-dy * maxR}deg) rotateY(${dx * maxR}deg) translateY(-7px)`
    el.style.transition = 'transform 0.07s linear, box-shadow 0.07s linear'
  }

  const onMouseLeave = () => {
    const el = innerRef.current
    if (!el) return
    el.style.transform  = ''
    el.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.55s ease, border-color 0.55s ease'
  }

  const open = (e) => {
    // Ctrl/Cmd/middle click: a new tab, like any link
    if (e.metaKey || e.ctrlKey || e.button === 1) {
      window.open(href, '_blank', 'noopener')
      return
    }
    navigate(href)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div
        ref={innerRef}
        className="project-card project-card--clickable h-full"
        data-no-ping
        data-entry-anchor={anchor}
        role="link"
        tabIndex={0}
        aria-label={`${label} — open the project page`}
        onClick={open}
        onAuxClick={open}
        onKeyDown={onKeyDown}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
    </motion.div>
  )
}

// ── Standard card ──────────────────────────────────────────────────────

function ProjectCard({ project, delay }) {
  return (
    <ParallaxCard
      delay={delay}
      href={entryPath('projects', project.slug)}
      label={project.title}
      anchor={entryAnchor('projects', project.slug)}
    >
      <div className="flex flex-col gap-3 h-full">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title font-semibold leading-snug text-base sm:text-lg">
            {project.title}
          </h3>
          <EntryLinkButton href={project.link} onClick={(e) => e.stopPropagation()} />
        </div>

        {/* Description */}
        <p className="card-body text-sm leading-relaxed">
          {project.description}
        </p>

        {/* Stack pills + the way in */}
        <div className="flex flex-wrap items-end gap-1.5 mt-auto pt-1">
          {project.stack.map(t => (
            <span key={t} className="card-pill px-2 py-0.5 rounded-full text-[clamp(0.625rem,0.55rem+0.2vw,0.75rem)] font-mono">
              {t}
            </span>
          ))}
          <span className="card-open" aria-hidden="true">open file →</span>
        </div>
      </div>
    </ParallaxCard>
  )
}

// ── Section ────────────────────────────────────────────────────────────

export function Projects() {
  return (
    <section
      className="relative px-6 pb-28 pt-4 w-full max-w-6xl mx-auto"
      style={{ zIndex: 10 }}
      data-entry-anchor="projects"
    >
      {/* Section header */}
      <motion.div
        className="mb-10"
        variants={headerStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.h2 variants={headerItem} className="section-heading font-black text-4xl sm:text-5xl tracking-tight leading-none mb-4">
          Projects
        </motion.h2>
        <motion.div variants={headerItem} className="section-rule h-px w-full" />
      </motion.div>

      {/* Project grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {CARDS.map((p, i) => (
          <ProjectCard key={p.slug} project={p} delay={i * 0.07} />
        ))}
      </div>
    </section>
  )
}
