import { motion } from 'framer-motion'

// ── Animation variants ─────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
}

// ── Scroll indicator ───────────────────────────────────────────────────

function ScrollBubble() {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
      {/* Bubble rise track */}
      <div className="relative w-4 h-12 flex items-end justify-center overflow-visible">
        <motion.div
          className="hero-scroll-dot absolute bottom-0 w-2.5 h-2.5 rounded-full"
          animate={{
            y:       [0, -36],
            opacity: [0, 0.9, 0],
            scale:   [0.8, 1.1, 0.7],
          }}
          transition={{
            duration:    2.4,
            times:       [0, 0.25, 1],
            ease:        'easeOut',
            repeat:      Infinity,
            repeatDelay: 0.6,
          }}
        />
        {/* A second bubble offset so it doesn't look mechanical */}
        <motion.div
          className="hero-scroll-dot absolute bottom-0 w-1.5 h-1.5 rounded-full"
          animate={{
            y:       [0, -28],
            opacity: [0, 0.5, 0],
            scale:   [0.7, 1, 0.5],
          }}
          transition={{
            duration:    2.4,
            times:       [0, 0.3, 1],
            ease:        'easeOut',
            repeat:      Infinity,
            repeatDelay: 0.6,
            delay:       1.1,
          }}
        />
      </div>
      <span className="hero-scroll-label text-[clamp(0.5rem,0.45rem+0.12vw,0.625rem)] font-mono tracking-[0.28em] uppercase select-none">
        scroll
      </span>
    </div>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────

export function Hero() {
  return (
    <motion.section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ zIndex: 10 }}
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-3xl w-full flex flex-col items-center gap-5 sm:gap-6">

        {/* Name */}
        <motion.h1
          variants={fadeUp}
          className="site-title font-black tracking-tighter leading-none select-none
                     text-[clamp(2.6rem,10vw,6.5rem)]"
        >
          Rishi Garhyan
        </motion.h1>

        {/* Thin divider */}
        <motion.div
          variants={fadeUp}
          className="hero-divider w-14 h-px"
        />

        {/* Roles */}
        <motion.p
          variants={fadeUp}
          className="hero-subtitle font-bold tracking-[0.18em] uppercase select-none
                     text-[clamp(0.65rem,1.8vw,0.9rem)]"
        >
          CS&nbsp;Student&nbsp;@&nbsp;UIUC&ensp;&middot;&ensp;XR&nbsp;Engineer&ensp;&middot;&ensp;Game&nbsp;Developer
        </motion.p>

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          className="hero-tagline select-none mt-3
                     text-[clamp(0.7rem,1.6vw,0.95rem)]"
        >
          This is your captain speaking, today we are diving down to 6,000 meters
        </motion.p>

      </div>

      {/* Scroll bubble */}
      <ScrollBubble />
    </motion.section>
  )
}
