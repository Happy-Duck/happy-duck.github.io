import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
// Career data lives in src/content/work.js
import { WORK as ENTRIES, entryAnchor, entryPath } from '../content/index.js'
import { cardLinkProps } from '../lib/cardLink'

// ── Timeline ───────────────────────────────────────────────────────────
// A kelp strand down the section, with a current flowing along it, and
// one marker per job, newest at the top, each level with the middle of
// its card. Markers are centered in their row's 40px rail (index.css,
// .career-*). The strand is drawn through the measured center of every
// marker, so the dots always sit on it.
//
// History: the first kelp strand was a fixed S-curve stretched to the
// section with the dots on a straight axis beside it, so they never
// lined up (the owner: "offcenter for so long and its annoying"). It
// became a straight line with ticks and start years; the owner found the
// years redundant and missed the flowing strand, so it is back, drawn
// through the dots this time.

// One smooth wave from the top of the list to the bottom, crossing the
// rail's center at every marker and swinging to alternate sides between
// them. Each stretch is a cubic approximating half a sine wave; the
// slight change of slope where two stretches of different length meet
// sits under a marker.
function strandPath(points, height, amplitude) {
  const first = points[0]
  const last = points[points.length - 1]
  const stops = [{ x: first.x, y: 0 }, ...points, { x: last.x, y: height }]
  let d = `M${stops[0].x.toFixed(1)} ${stops[0].y.toFixed(1)}`
  let side = -1
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]
    const b = stops[i]
    const len = b.y - a.y
    if (len < 1) continue
    // Short stretches (the ends) swing less, so the curve stays gentle
    const swing = side * Math.min(amplitude, len * 0.07) * 1.27
    const k = len * 0.36
    d += ` C${(a.x + swing).toFixed(1)} ${(a.y + k).toFixed(1)} ` +
      `${(b.x + swing).toFixed(1)} ${(b.y - k).toFixed(1)} ` +
      `${b.x.toFixed(1)} ${b.y.toFixed(1)}`
    side = -side
  }
  return d
}

function KelpStrand({ rowsRef }) {
  const strandRef = useRef(null)
  const currentRef = useRef(null)

  useEffect(() => {
    const rows = rowsRef.current
    if (!rows) return
    // Measured, not computed from CSS: card heights depend on fonts and
    // width, and the rail moves to the left edge on narrow screens
    const draw = () => {
      const box = rows.getBoundingClientRect()
      const points = [...rows.querySelectorAll('.career-node')].map((node) => {
        const r = node.getBoundingClientRect()
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }
      })
      if (points.length === 0) return
      const rail = rows.querySelector('.career-rail').getBoundingClientRect().width
      const d = strandPath(points, box.height, rail * 0.36)
      strandRef.current?.setAttribute('d', d)
      currentRef.current?.setAttribute('d', d)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(rows)
    rows.querySelectorAll('.career-row').forEach((row) => ro.observe(row))
    return () => ro.disconnect()
  }, [rowsRef])

  return (
    <svg className="career-strand" aria-hidden="true">
      <path ref={strandRef} className="kelp-strand" />
      <path ref={currentRef} className="kelp-current" />
    </svg>
  )
}

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
  const rowsRef = useRef(null)
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
      <div className="career-rows" ref={rowsRef}>
        <KelpStrand rowsRef={rowsRef} />
        {ENTRIES.map((entry, i) => {
          const left = i % 2 === 0
          return (
            <div key={entry.slug} className={`career-row career-row--${left ? 'left' : 'right'}`}>
              <div className="career-card-cell">
                <EntryCard entry={entry} fromLeft={left} />
              </div>
              <div className="career-rail" aria-hidden="true">
                <span className="career-node" />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
