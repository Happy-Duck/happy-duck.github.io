import { motion } from 'framer-motion'

// ── Data ───────────────────────────────────────────────────────────────

const ENTRIES = [
  {
    company:     'Brunswick BI Design Lab',
    role:        'Software Development Intern, Computer Graphics',
    period:      'May 2026 – Present',
    description: "Primary developer on the UE5.7 simulator behind Future Helm, Brunswick's flagship CES 2027 marine showcase — reviewed by senior management including the C-suite ahead of its January public exhibition. Own the multiprotocol C++ data layer (TCP/UDP/CAN) exchanging vessel state, telemetry, and navigation data with a teammate's display app, and prototyped velocity-scaled collision avoidance and weighted spline path-selection features. Profiled and optimized runtime against a 60 fps target via LOD tuning, GPU instancing, and event-driven messaging. Top-3 finalist for Most Outstanding Undergraduate Intern at the 2026 UIUC Research Park Intern Awards (800+ interns, 120+ companies).",
    stack:       ['Unreal Engine 5', 'C++', 'TCP/UDP', 'CAN bus', 'Perforce'],
  },
  {
    company:     'Immersive Learning Lab',
    role:        'Virtual Reality Software Developer',
    period:      'Oct 2025 – Present',
    description: "Designed and programmed a VR educational application in Unity/C# visualizing the University of Bern's MANiaC mass spectrometer (ESA's Comet Interceptor mission) and built a near-photorealistic replica of the ISSI lobby in Bern, with physics simulations, live data graphing via XCharts, animation systems, and custom interaction scripts driving NavMesh-driven NPCs. Presented at the IMMERSE Annual Symposium (April 2026) via poster and live demo.",
    stack:       ['Unity', 'C#', 'Blender', 'VR', 'XR Toolkit', 'XCharts', 'OpenXR'],
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
