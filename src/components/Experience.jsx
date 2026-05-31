import { motion } from 'framer-motion'

// ── Data ───────────────────────────────────────────────────────────────

const ENTRIES = [
  {
    company:     'Brunswick BI Design Lab',
    role:        'Computer Graphics Software Development Intern',
    period:      'May 2026 – Present',
    description: 'Developing an interactive boating simulator in Unreal Engine 5.7 for a CES 2027 AI-assisted navigation demo. Building boat AI for ambient NPC traffic, contributing to game design and core backend, and supporting cross-application data flow via Python/Websockets.',
    stack:       ['Unreal Engine 5', 'C++', 'Python', 'Websockets', 'Perforce'],
  },
  {
    company:     'Immersive Learning Lab',
    role:        'Unity VR Developer',
    period:      'Oct 2025 – Present',
    description: "Designed and programmed a VR educational module in Unity/C# visualizing the MANiaC mass spectrometer (ESA's Comet Interceptor mission) and built a near-photorealistic replica of the ISSI lobby in Bern. Presented at the IMMERSE Annual Symposium (April 2026).",
    stack:       ['Unity', 'C#', 'Blender', 'VR', 'XR Toolkit'],
  },
  {
    company:     'Origami Games',
    role:        'Game Development Intern',
    period:      'June – July 2023',
    description: 'Built prototypes for endless runner and maze escape games in Unity/C#; implemented procedural level generation.',
    stack:       ['Unity', 'C#', 'Procedural Gen'],
  },
]

// ── Kelp cable ─────────────────────────────────────────────────────────
// Gentle S-curves: organic, not ruler-straight

const KELP_PATH = 'M20 0 C5 80 35 160 20 260 C5 360 35 440 20 530 C8 570 32 590 20 620'

function KelpCable() {
  return (
    <div
      aria-hidden="true"
      // desktop: centered; mobile: hugs left edge
      className="absolute top-0 bottom-0 left-5 sm:left-1/2 sm:-translate-x-1/2 w-10 pointer-events-none"
    >
      <svg
        width="40"
        height="100%"
        viewBox="0 0 40 620"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base strand */}
        <path
          d={KELP_PATH}
          className="kelp-strand"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Flowing current — dashes drift downward */}
        <path
          d={KELP_PATH}
          className="kelp-current"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength="100"
        />
      </svg>
    </div>
  )
}

// ── Dot ────────────────────────────────────────────────────────────────

function Dot() {
  return <div className="exp-dot" aria-hidden="true" />
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
      className="exp-card"
      initial={{ opacity: 0, x: fromLeft ? -52 : 52 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <span className="exp-period font-mono text-[clamp(0.625rem,0.55rem+0.2vw,0.75rem)] tracking-[0.2em] uppercase">
        {entry.period}
      </span>
      <h3 className="exp-role font-bold text-base sm:text-lg leading-snug mt-2">
        {entry.role}
      </h3>
      <p className="exp-company font-semibold text-sm mt-0.5 mb-3">
        {entry.company}
      </p>
      <p className="exp-desc text-sm leading-relaxed mb-3">
        {entry.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {entry.stack.map(t => (
          <span key={t} className="card-pill px-2 py-0.5 rounded-full text-[clamp(0.625rem,0.55rem+0.2vw,0.75rem)] font-mono">
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// ── Section ────────────────────────────────────────────────────────────

export function Experience() {
  return (
    <section
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

      {/* Timeline */}
      <div className="relative">
        <KelpCable />

        {/* ── Desktop: alternating left / right ── */}
        <div className="hidden sm:block">
          {ENTRIES.map((entry, i) => (
            <div key={entry.company} className={`flex items-start${i < ENTRIES.length - 1 ? ' pb-24' : ''}`}>
              {i % 2 === 0 ? (
                <>
                  <div className="flex-1 pr-4 flex justify-end">
                    <EntryCard entry={entry} fromLeft />
                  </div>
                  <div className="w-10 shrink-0 flex justify-center pt-6">
                    <Dot />
                  </div>
                  <div className="flex-1 pl-4" />
                </>
              ) : (
                <>
                  <div className="flex-1 pr-4" />
                  <div className="w-10 shrink-0 flex justify-center pt-6">
                    <Dot />
                  </div>
                  <div className="flex-1 pl-4">
                    <EntryCard entry={entry} fromLeft={false} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* ── Mobile: line on left, cards stacked right ── */}
        <div className="sm:hidden pl-10">
          {ENTRIES.map((entry, i) => (
            <div
              key={entry.company}
              className={`relative${i < ENTRIES.length - 1 ? ' pb-12' : ''}`}
            >
              <div className="absolute -left-[1.4rem] top-5">
                <Dot />
              </div>
              <EntryCard entry={entry} fromLeft={false} />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
