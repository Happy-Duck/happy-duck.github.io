import { motion } from 'framer-motion'

// ── Data ───────────────────────────────────────────────────────────────
// Coursework pills drawn from what the rest of the site already claims
// (skills tooltips, CV research project) — owner should extend with the
// real course list.

const COURSEWORK = ['Data Structures', 'Linear Algebra', 'Game Development', 'Computer Vision Research']

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

export function Education() {
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
          Education
        </motion.h2>
        <motion.div variants={headerItem} className="section-rule h-px w-full" />
      </motion.div>

      <motion.div
        className="exp-card max-w-2xl"
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: '-60px' }}
      >
        <span className="exp-period font-mono text-[clamp(0.625rem,0.55rem+0.2vw,0.75rem)] tracking-[0.2em] uppercase">
          Expected May 2027
        </span>
        <h3 className="exp-role font-bold text-base sm:text-lg leading-snug mt-2">
          B.S. Computer Science — 4.0 GPA
        </h3>
        <p className="exp-company font-semibold text-sm mt-0.5 mb-3">
          University of Illinois Urbana-Champaign
        </p>
        <p className="exp-desc text-sm leading-relaxed mb-3">
          Building games with ACM GameBuilders and shipping jam entries between
          semesters. Undergraduate research in real-time computer vision.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {COURSEWORK.map(c => (
            <span key={c} className="card-pill px-2 py-0.5 rounded-full text-[clamp(0.625rem,0.55rem+0.2vw,0.75rem)] font-mono">
              {c}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
