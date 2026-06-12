import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import GithubOriginal from 'devicons-react/lib/icons/GithubOriginal'
import LinkedinPlain  from 'devicons-react/lib/icons/LinkedinPlain'

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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
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
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
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
  },
  {
    id:    'linkedin',
    label: 'LinkedIn',
    href:  'https://linkedin.com/in/rishi-garhyan',
    Icon:  () => <LinkedinPlain size="18px" color="currentColor" />,
  },
  {
    id:    'github',
    label: 'GitHub',
    href:  'https://github.com/Happy-Duck',
    Icon:  () => <ForcedColorIcon Icon={GithubOriginal} size="17px" />,
  },
  {
    id:    'resume',
    label: 'Resume',
    href:  '/Rishi Garhyan Resume.pdf',
    Icon:  ResumeIcon,
  },
]

// ── Sidebar node ──────────────────────────────────────────────────────

function SidebarNode({ signal, index }) {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback((e) => {
    if (signal.id !== 'email') return
    e.preventDefault()
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [signal.id])

  const isEmail = signal.id === 'email'

  const Tag = isEmail ? 'button' : 'a'
  const props = isEmail
    ? { type: 'button', onClick: handleClick }
    : { href: signal.href, target: '_blank', rel: 'noopener noreferrer' }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tag
        className={`sidebar-node signal-node--${signal.id}`}
        {...props}
      >
        <div className={`sidebar-orb signal-orb--${signal.id}`}>
          <div className="signal-ring" aria-hidden="true" />
          <signal.Icon />
        </div>

        <span className={`sidebar-tooltip${copied ? ' sidebar-tooltip--visible' : ''}`}>
          {copied ? 'Copied!' : signal.label}
        </span>
      </Tag>
    </motion.div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────

export function ContactSidebar() {
  return (
    <nav className="contact-sidebar" aria-label="Contact links">
      {SIGNALS.map((s, i) => (
        <SidebarNode key={s.id} signal={s} index={i} />
      ))}
    </nav>
  )
}
