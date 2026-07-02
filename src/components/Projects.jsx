import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import GithubOriginal from 'devicons-react/lib/icons/GithubOriginal'

// Wrapper to force fill color on icons that don't accept a color prop
function ForcedColorIcon({ Icon, size }) {
  return (
    <span className="forced-icon-color">
      <Icon size={size} />
    </span>
  )
}

// ── Data ───────────────────────────────────────────────────────────────
// details.highlights wording drawn from the card descriptions + README —
// owner should review and punch up with specifics.

const PROJECTS = [
  {
    title:       'Pelagos: A Marine Adventure',
    description: 'A narrative-driven marine exploration game built entirely in Unity. Self-published on Steam and downloaded 30k+ times. Adopted by local schools as an interactive environmental science teaching tool.',
    stack:       ['Unity', 'C#', 'Steam', 'Steamworks SDK'],
    link:        'https://store.steampowered.com/app/2645390/Pelagos_A_Marine_Adventure',
    details: {
      role: 'Solo developer — design, code, and publishing',
      highlights: [
        'Self-published on Steam with 30,000+ downloads',
        'Adopted by local schools as an environmental-science teaching tool',
        'Full production pipeline in Unity/C#, from gameplay to Steamworks integration',
      ],
      embed: { src: 'https://store.steampowered.com/widget/2645390/', height: 190, title: 'Pelagos on Steam' },
    },
  },
  {
    title:       'Party School',
    description: 'Multiplayer sandbox party game with minigame activities built in a five-person team. Built the world map and core gameplay base shared across all minigames; implementing the racing minigame using Unreal\'s Chaos Vehicle system.',
    stack:       ['Unreal Engine 5', 'Blueprints', 'Chaos Vehicles'],
    link:        '#',
    details: {
      role: 'Gameplay engineer on a five-person team',
      highlights: [
        'Built the world map and the core gameplay base shared across all minigames',
        "Implementing the racing minigame on Unreal's Chaos Vehicle system",
      ],
    },
  },
  {
    title:       'Flarp',
    description: "A puzzle Metroidvania built around wind mechanics and momentum-based traversal. Developed with UIUC's ACM GameBuilders club.",
    stack:       ['GameMaker Studio', 'GML'],
    link:        'https://orangepainting.itch.io/flarp',
    details: {
      role: "Developer — UIUC ACM GameBuilders club project",
      highlights: [
        'Puzzle Metroidvania built around wind mechanics and momentum-based traversal',
        'Playable on itch.io',
      ],
      embed: { src: 'https://itch.io/embed/3890349?dark=true', height: 167, title: 'Flarp on itch.io' },
    },
  },
  {
    title:       'SportsBot',
    description: 'Discord bot delivering live scores, player stats, and schedule alerts through a clean slash-command interface backed by REST sports APIs.',
    stack:       ['Python', 'discord.py', 'REST APIs'],
    link:        'https://github.com/Happy-Duck/DiscordSportsBot',
    details: {
      role: 'Solo developer',
      highlights: [
        'Live scores, player stats, and schedule alerts via slash commands',
        'Backed by REST sports APIs with a SQL persistence layer',
      ],
    },
  },
  {
    title:       'Tide Toss',
    description: 'Physics-based "Tosser" game built in 48 hours for the Game Builders Game Jam. Combination of 2D art, 3D physics, and 1D gameplay',
    stack:       ['Unity', 'C#', 'Espresso'],
    link:        'https://happy-ducky.itch.io/tide-toss',
    details: {
      role: '48-hour jam entry — Game Builders Game Jam',
      highlights: [
        'Physics "tosser" mixing 2D art, 3D physics, and 1D gameplay',
        'Concept to shipped build in one weekend',
      ],
      embed: { src: 'https://itch.io/embed/3856158?dark=true', height: 167, title: 'Tide Toss on itch.io' },
    },
  },
  {
    title:       'Computer Vision Research',
    description: 'Benchmark comparison of Faster R-CNN (Detectron2) against YOLOv8 for real-time object detection on the COCO dataset. Analysed accuracy–latency tradeoffs.',
    stack:       ['Python', 'Detectron2', 'YOLOv8', 'COCO'],
    link:        '#',
    details: {
      role: 'Undergraduate researcher',
      highlights: [
        'Benchmarked Faster R-CNN (Detectron2) against YOLOv8 on COCO',
        'Analyzed accuracy–latency tradeoffs for real-time object detection',
      ],
    },
  },
]

// ── Icons ──────────────────────────────────────────────────────────────

function SteamIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </svg>
  )
}

function ItchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.102 2.436-2.41 0 1.308 1.07 2.41 2.4 2.41 1.328 0 2.362-1.102 2.362-2.41 0 1.308 1.137 2.41 2.466 2.41h.024c1.33 0 2.466-1.102 2.466-2.41 0 1.308 1.034 2.41 2.363 2.41 1.33 0 2.4-1.102 2.4-2.41 0 1.308 1.106 2.41 2.435 2.41C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.62-2.082-2.99-3.13-3.612-3.253-.114-5.508-.134-8.87-.133-3.362 0-7.945.053-8.87.133zm6.376 6.477a2.74 2.74 0 0 1-.468.602c-.5.49-1.19.795-1.947.795a2.786 2.786 0 0 1-1.95-.795c-.182-.178-.32-.37-.446-.59-.127.222-.303.412-.486.59a2.788 2.788 0 0 1-1.95.795c-.092 0-.187-.025-.264-.052-.107 1.113-.152 2.176-.168 2.95v.005l-.006 1.167c.02 2.334-.23 7.564 1.03 8.85 1.952.454 5.545.662 9.15.663 3.605 0 7.198-.21 9.15-.664 1.26-1.284 1.01-6.514 1.03-8.848l-.006-1.167v-.004c-.016-.775-.06-1.838-.168-2.95-.077.026-.172.052-.263.052a2.788 2.788 0 0 1-1.95-.795c-.184-.178-.36-.368-.486-.59-.127.22-.265.412-.447.59a2.786 2.786 0 0 1-1.95.794c-.76 0-1.446-.303-1.948-.793a2.74 2.74 0 0 1-.468-.602 2.738 2.738 0 0 1-.463.602 2.787 2.787 0 0 1-1.95.794h-.16a2.787 2.787 0 0 1-1.95-.793 2.738 2.738 0 0 1-.464-.602zm-2.004 2.59v.002c.795.002 1.5 0 2.373.953.687-.072 1.406-.108 2.125-.107.72 0 1.438.035 2.125.107.873-.953 1.578-.95 2.372-.953.376 0 1.876 0 2.92 2.934l1.123 4.028c.832 2.995-.266 3.068-1.636 3.07-2.03-.075-3.156-1.55-3.156-3.025-1.124.184-2.436.276-3.748.277-1.312 0-2.624-.093-3.748-.277 0 1.475-1.125 2.95-3.156 3.026-1.37-.004-2.468-.077-1.636-3.072l1.122-4.027c1.045-2.934 2.545-2.934 2.92-2.934zM12 12.714c-.002.002-2.14 1.964-2.523 2.662l1.4-.056v1.22c0 .056.56.033 1.123.007.562.026 1.124.05 1.124-.008v-1.22l1.4.055C14.138 14.677 12 12.713 12 12.713z" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function linkIcon(url) {
  if (url.includes('steampowered.com')) return { Icon: SteamIcon, label: 'Steam' }
  if (url.includes('itch.io'))          return { Icon: ItchIcon,  label: 'itch.io' }
  if (url.includes('github.com'))       return { Icon: () => <ForcedColorIcon Icon={GithubOriginal} size="24px" />, label: 'GitHub' }
  return { Icon: ExternalLinkIcon, label: 'Link' }
}

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

function ParallaxCard({ children, delay = 0, onOpen, label }) {
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
        data-no-ping
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

function ProjectCard({ project, delay, onOpen }) {
  const { Icon, label } = linkIcon(project.link)
  const hasLink = project.link && project.link !== '#'
  return (
    <ParallaxCard delay={delay} onOpen={onOpen} label={project.title}>
      <div className="flex flex-col gap-3 h-full">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title font-semibold leading-snug text-base sm:text-lg">
            {project.title}
          </h3>
          <div className="flex items-center gap-1">
            {hasLink && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="card-link-btn"
                onClick={(e) => e.stopPropagation()}
              >
                <Icon />
                <span className="card-link-label">{label}</span>
              </a>
            )}
            <span className="card-expand" aria-hidden="true">
              <ExpandIcon />
            </span>
          </div>
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

function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null)
  const { Icon, label } = linkIcon(project.link)
  const hasLink = project.link && project.link !== '#'
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="pmodal"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
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
          {hasLink && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="card-link-btn"
            >
              <Icon />
              <span className="card-link-label">{label}</span>
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

// ── Section ────────────────────────────────────────────────────────────

export function Projects() {
  const [openIdx, setOpenIdx] = useState(-1)

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
          <ProjectCard key={p.title} project={p} delay={i * 0.07} onOpen={() => setOpenIdx(i)} />
        ))}
      </div>

      {/* Case-study modal */}
      <AnimatePresence>
        {openIdx >= 0 && (
          <ProjectModal
            project={PROJECTS[openIdx]}
            onClose={() => setOpenIdx(-1)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
