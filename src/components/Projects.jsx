import { useRef, useState, useEffect } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
// Project data lives in src/content/projects.js
import { PROJECTS, entryAnchor } from '../content/index.js'
import { EntryLinkButton } from './EntryLinkButton'

// View Transitions: card ↔ modal shared-element morph where supported.
// With VT active the framer mount/exit animations stand down so the two
// systems don't fight over the same elements.
const supportsVT = typeof document !== 'undefined' && 'startViewTransition' in document

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

function ParallaxCard({ children, delay = 0, onOpen, label, vtName, anchor }) {
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

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen()
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
        style={vtName ? { viewTransitionName: vtName } : undefined}
        data-no-ping
        data-entry-anchor={anchor}
        role="button"
        tabIndex={0}
        aria-label={`${label} — open case study`}
        onClick={onOpen}
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

function ProjectCard({ project, delay, onOpen, vtName }) {
  return (
    <ParallaxCard
      delay={delay}
      onOpen={onOpen}
      label={project.title}
      vtName={vtName}
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

        {/* Stack pills */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {project.stack.map(t => (
            <span key={t} className="card-pill px-2 py-0.5 rounded-full text-[clamp(0.625rem,0.55rem+0.2vw,0.75rem)] font-mono">
              {t}
            </span>
          ))}
        </div>
      </div>
    </ParallaxCard>
  )
}

// ── Case-study modal ───────────────────────────────────────────────────

function ProjectModal({ project, onClose, vt }) {
  const closeRef = useRef(null)
  const d = project.details

  useEffect(() => {
    const prev = document.activeElement
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (prev && prev.focus) prev.focus()
    }
  }, [onClose])

  // Portal to <body> — the section's position:relative + z-index creates a
  // stacking context that would trap the fixed backdrop under later sections
  return createPortal(
    <motion.div
      className="pmodal-backdrop"
      data-no-ping
      initial={vt ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="pmodal"
        style={vt ? { viewTransitionName: 'case-study' } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        initial={vt ? false : { opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pmodal-head">
          <h3 className="pmodal-title">{project.title}</h3>
          <button
            ref={closeRef}
            type="button"
            className="pmodal-close"
            onClick={onClose}
            aria-label="Close case study"
          >
            ×
          </button>
        </div>

        {d?.role && <p className="pmodal-role">{d.role}</p>}

        <p className="pmodal-desc">{project.description}</p>

        {d?.highlights?.length > 0 && (
          <ul className="pmodal-highlights">
            {d.highlights.map(h => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}

        {d?.embed && (
          <div className="pmodal-embed">
            <iframe
              src={d.embed.src}
              height={d.embed.height}
              title={d.embed.title}
              loading="lazy"
            />
          </div>
        )}

        <div className="pmodal-foot">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map(t => (
              <span key={t} className="card-pill px-2 py-0.5 rounded-full text-[clamp(0.625rem,0.55rem+0.2vw,0.75rem)] font-mono">
                {t}
              </span>
            ))}
          </div>
          <EntryLinkButton href={project.link} />
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

// ── Section ────────────────────────────────────────────────────────────

export function Projects() {
  const [openIdx, setOpenIdx] = useState(-1)
  // Which card owns the shared view-transition name (the last one opened)
  const [vtIdx, setVtIdx] = useState(-1)

  const vtActive = () =>
    supportsVT && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const openModal = (i) => {
    if (!vtActive()) { setOpenIdx(i); return }
    // The card must carry the name in the OLD snapshot, the modal in the NEW
    flushSync(() => setVtIdx(i))
    document.startViewTransition(() => {
      flushSync(() => setOpenIdx(i))
    })
  }

  const closeModal = () => {
    if (!vtActive()) { setOpenIdx(-1); return }
    document.startViewTransition(() => {
      flushSync(() => setOpenIdx(-1))
    })
  }

  return (
    <section
      className="relative px-6 pb-28 pt-4 w-full max-w-6xl mx-auto"
      style={{ zIndex: 10 }}
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
        {PROJECTS.map((p, i) => (
          <ProjectCard
            key={p.slug}
            project={p}
            delay={i * 0.07}
            onOpen={() => openModal(i)}
            vtName={vtIdx === i && openIdx !== i ? 'case-study' : undefined}
          />
        ))}
      </div>

      {/* Case-study modal — with View Transitions the morph replaces the
          framer mount/exit, so AnimatePresence must not delay unmount */}
      {supportsVT ? (
        openIdx >= 0 && (
          <ProjectModal project={PROJECTS[openIdx]} onClose={closeModal} vt />
        )
      ) : (
        <AnimatePresence>
          {openIdx >= 0 && (
            <ProjectModal project={PROJECTS[openIdx]} onClose={closeModal} />
          )}
        </AnimatePresence>
      )}
    </section>
  )
}
