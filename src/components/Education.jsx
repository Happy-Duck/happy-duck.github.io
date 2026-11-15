import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'

// The column (sim + metaball shader) is its own chunk, fetched right
// after boot — it sits far down the dive, so the first paint never waits
// on it. The placeholder holds the same height so the page (and with it
// the scroll → depth mapping) doesn't change length when it arrives.
const CourseColumn = lazy(() =>
  import('./CourseColumn').then(m => ({ default: m.CourseColumn })),
)

// ── Animation variants ─────────────────────────────────────────────────

const headerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const headerItem = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

// ── Section ────────────────────────────────────────────────────────────
// Degree card + the course column. The class list itself lives in
// src/content/courses.js.

export function Education() {
  return (
    <section
      id="education"
      data-waypoint="Education"
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
          Education
        </motion.h2>
        <motion.div variants={headerItem} className="section-rule h-px w-full" />
      </motion.div>

      <motion.div
        className="exp-card mb-8"
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: '-60px' }}
      >
        <span className="exp-period text-sm">
          Expected May 2028
        </span>
        <h3 className="exp-role font-bold text-base sm:text-lg leading-snug mt-2">
          B.S. Computer Science, 3.98 GPA
        </h3>
        <p className="exp-company font-semibold text-sm mt-0.5 mb-3">
          University of Illinois Urbana-Champaign · Minor in Game Studies and Design
        </p>
        <p className="exp-desc text-sm leading-relaxed">
          Dean's List in Fall 2024, Spring 2025, and Fall 2025. Building games
          with ACM GameBuilders and shipping jam entries between semesters,
          with undergraduate research in real-time computer vision. Also
          active in VR Club at UIUC, Illini Fly Fishing, and Illini
          Metagamers.
        </p>
      </motion.div>

      {/* data-entry-anchor: where closing a class page lands if its own
          bubble isn't there to scroll to */}
      <motion.div
        data-entry-anchor="courses"
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: '-60px' }}
      >
        <Suspense fallback={<div className="course-placeholder" aria-hidden="true" />}>
          <CourseColumn />
        </Suspense>
      </motion.div>
    </section>
  )
}
