import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GithubOriginal, LinkedinPlain } from 'devicons-react'

// Wrapper to force fill color on icons that don't accept a color prop
function ForcedColorIcon({ Icon, size }) {
  return (
    <span className="forced-icon-color">
      <Icon size={size} />
    </span>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,6 12,13 22,6" />
    </svg>
  )
}

function ResumeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

// ── Data ───────────────────────────────────────────────────────────────

const EMAIL = 'garhyan2@illinois.edu'

const SIGNALS = [
  {
    id:    'email',
    label: 'Email',
    Icon:  EmailIcon,
    delay: 0,
  },
  {
    id:    'linkedin',
    label: 'LinkedIn',
    href:  'https://linkedin.com/in/rishi-garhyan',
    Icon:  () => <LinkedinPlain size="22px" color="currentColor" />,
    delay: 0.1,
  },
  {
    id:    'github',
    label: 'GitHub',
    href:  'https://github.com/Happy-Duck',
    Icon:  () => <ForcedColorIcon Icon={GithubOriginal} size="21px" />,
    delay: 0.2,
  },
  {
    id:    'resume',
    label: 'Resume',
    href:  '/Rishi Garhyan Resume.pdf',
    Icon:  ResumeIcon,
    delay: 0.3,
  },
]

// ── Animation variants ─────────────────────────────────────────────────

const headerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const headerItem = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

// ── Signal node ────────────────────────────────────────────────────────

function SignalNode({ signal }) {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback((e) => {
    if (signal.id !== 'email') return
    e.preventDefault()
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [signal.id])

  const isEmail  = signal.id === 'email'
  const isResume = signal.id === 'resume'

  const Tag = isEmail ? 'button' : motion.a
  const props = isEmail
    ? { type: 'button', onClick: handleClick }
    : {
        href: signal.href,
        target: '_blank',
        rel: 'noopener noreferrer',
      }

  return (
    <Tag
      className={`signal-node signal-node--${signal.id}`}
      {...(isEmail ? {} : {
        initial: { opacity: 0, y: 36 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: signal.delay },
        viewport: { once: true, margin: '-60px' },
        whileHover: { y: -6 },
      })}
      {...props}
    >
      <div className={`signal-orb signal-orb--${signal.id}`}>
        <div className="signal-ring" aria-hidden="true" />
        <signal.Icon />
      </div>

      <span className="signal-label">{signal.label}</span>

      {/* Copy confirmation for email */}
      <AnimatePresence>
        {copied && (
          <motion.span
            className="signal-copied"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            Copied!
          </motion.span>
        )}
      </AnimatePresence>
    </Tag>
  )
}

// ── Section ────────────────────────────────────────────────────────────

export function Contact() {
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
          Contact
        </motion.h2>
        <motion.div variants={headerItem} className="section-rule h-px w-full" />
      </motion.div>

      {/* Signal nodes */}
      <div className="flex flex-wrap justify-center gap-8 sm:gap-14">
        {SIGNALS.map(s => <SignalNode key={s.id} signal={s} />)}
      </div>
    </section>
  )
}
