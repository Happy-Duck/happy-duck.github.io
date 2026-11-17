import { motion } from 'framer-motion'
// Career data lives in src/content/work.js
import { WORK as ENTRIES, entryAnchor, entryPath } from '../content/index.js'
import { cardLinkProps } from '../lib/cardLink'

// ── Timeline ───────────────────────────────────────────────────────────
// A straight line down the section with one marker per job, newest at
// the top, each marker level with the middle of its card. Markers sit
// exactly on the line because both are centered in the same 40px rail
// (index.css, .career-*); the old version drew a wavy kelp strand and put
// round dots on a straight axis beside it, so they never lined up. The
// ticks to the cards and the start year beside each marker were removed
// at the owner's request (the card already gives the dates).

// ── Animation variants ─────────────────────────────────────────────────

const headerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const headerItem = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

// ── Entry card ─────────────────────────────────────────────────────────

function EntryCard({ entry, fromLeft = false }) {
  return (
    <motion.div
      className="exp-card exp-card--clickable"
      data-entry-anchor={entryAnchor('work', entry.slug)}
      {...cardLinkProps(entryPath('work', entry.slug), `${entry.role}, ${entry.company}: open the page`)}
      initial={{ opacity: 0, x: fromLeft ? -52 : 52 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <span className="exp-period text-sm">
        {entry.period}
      </span>
      <h3 className="exp-role font-bold text-base sm:text-lg leading-snug mt-2">
        {entry.role}
      </h3>
      <p className="exp-company font-semibold text-sm mt-0.5 mb-3">
        {entry.company}
      </p>
      <p className="exp-desc text-sm leading-relaxed mb-3">
        {entry.blurb || entry.description}
      </p>
      <p className="card-stack">{entry.stack.join(', ')}</p>
    </motion.div>
  )
}

// ── Section ────────────────────────────────────────────────────────────

export function Experience() {
  return (
    <section
      id="career"
      data-waypoint="Career"
      className="relative px-6 pb-28 pt-4 w-full max-w-6xl mx-auto"
      style={{ zIndex: 10 }}
    >
      {/* Section header */}
      <motion.div
        className="mb-12"
        variants={headerStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.h2 variants={headerItem} className="section-heading font-black text-4xl sm:text-5xl tracking-tight leading-none mb-4">
          Career
        </motion.h2>
        <motion.div variants={headerItem} className="section-rule h-px w-full" />
      </motion.div>

      {/* Timeline: one row per job. Wide screens alternate the card left
          and right of the line; narrow ones keep the line on the left.
          One set of cards for both (CSS grid does the rearranging). */}
      <div className="career-rows">
        {ENTRIES.map((entry, i) => {
          const left = i % 2 === 0
          return (
            <div key={entry.slug} className={`career-row career-row--${left ? 'left' : 'right'}`}>
              <div className="career-card-cell">
                <EntryCard entry={entry} fromLeft={left} />
              </div>
              <div className="career-rail" aria-hidden="true">
                <span className="career-line" />
                <span className="career-node" />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
