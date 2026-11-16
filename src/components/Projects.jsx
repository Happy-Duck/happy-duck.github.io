import { motion } from 'framer-motion'
// Project data lives in src/content/projects.js
import { PROJECTS, entryAnchor, entryPath } from '../content/index.js'
import { cardLinkProps } from '../lib/cardLink'
import { byProfile } from '../lib/profile'
import { EntryLinkButton } from './EntryLinkButton'

// Projects marked `grid: false` have a page (and show up under their
// class) but no card here. A ?for= link puts matching projects first
// (lib/profile.js).
const CARDS = byProfile(PROJECTS.filter(p => p.grid !== false))

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

// ── Card shell ─────────────────────────────────────────────────────────
// The whole card opens the project's page. It is a div with role="link"
// rather than an <a> because the store button inside it is itself a link.

function CardShell({ children, delay = 0, href, label, anchor, skills }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div
        className="project-card project-card--clickable h-full"
        data-entry-anchor={anchor}
        data-skills={skills}
        {...cardLinkProps(href, `${label}: open the project page`)}
      >
        {children}
      </div>
    </motion.div>
  )
}

// ── Standard card ──────────────────────────────────────────────────────

function ProjectCard({ project, delay }) {
  return (
    <CardShell
      delay={delay}
      href={entryPath('projects', project.slug)}
      label={project.title}
      anchor={entryAnchor('projects', project.slug)}
      skills={project.skills.join(' ')}
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
          {project.blurb || project.description}
        </p>

        {/* Tools: one plain line */}
        <p className="card-stack">{project.stack.join(', ')}</p>
      </div>
    </CardShell>
  )
}

// ── Section ────────────────────────────────────────────────────────────

export function Projects() {
  return (
    <section
      id="projects"
      data-waypoint="Projects"
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
