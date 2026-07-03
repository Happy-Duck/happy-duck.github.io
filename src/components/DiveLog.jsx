// ── Dive Log — field journal of discovered species ────────────────────
// Floating book button (bottom-right) + journal panel + discovery toasts.
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPECIES, BONUS_SPECIES } from '../constants/species'
import { getDiscovered } from '../lib/diveLog'

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function Entry({ species, found, bonus = false }) {
  return (
    <li className={`divelog-entry${found ? ' divelog-entry--found' : ''}${bonus ? ' divelog-entry--bonus' : ''}`}>
      <div className="divelog-entry-head">
        <span className="divelog-name">{found ? species.name : '???'}</span>
        <span className="divelog-depth">{found ? species.depth : '·····'}</span>
      </div>
      <span className="divelog-note">
        {found ? species.note : `Undiscovered — ${species.zone}`}
      </span>
    </li>
  )
}

export function DiveLog() {
  const [open, setOpen] = useState(false)
  const [discovered, setDiscovered] = useState(() => ({ ...getDiscovered() }))
  const [toast, setToast] = useState(null) // { id, name }

  // Refresh on discoveries + show toast
  useEffect(() => {
    const onDiscovery = (e) => {
      setDiscovered({ ...getDiscovered() })
      const sp = SPECIES.find(s => s.id === e.detail.id)
        || (BONUS_SPECIES.id === e.detail.id ? BONUS_SPECIES : null)
      if (sp) setToast({ id: sp.id, name: sp.name })
    }
    window.addEventListener('ocean:discovery', onDiscovery)
    return () => window.removeEventListener('ocean:discovery', onDiscovery)
  }, [])

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // Esc closes the panel
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const count = SPECIES.filter(s => discovered[s.id]).length
  const whaleSeen = Boolean(discovered[BONUS_SPECIES.id])
  const complete = count === SPECIES.length

  return (
    <>
      <button
        className="divelog-btn"
        data-no-ping
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={`Dive log: ${count} of ${SPECIES.length} species discovered`}
        aria-expanded={open}
      >
        <BookIcon />
        <span className="divelog-count">{count}/{SPECIES.length}</span>
        <span className="divelog-tip">dive log — species you've spotted</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="divelog-panel"
            data-no-ping
            role="dialog"
            aria-label="Dive log"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="divelog-head">
              <span className="divelog-title">Dive Log</span>
              <button
                className="divelog-close"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close dive log"
              >
                ×
              </button>
            </div>

            <div className="divelog-sub">
              {complete
                ? <span className="divelog-stamp">EXPEDITION COMPLETE</span>
                : <>{count}/{SPECIES.length} species identified{whaleSeen ? ' (+1)' : ''}</>}
            </div>

            <ul className="divelog-list">
              {SPECIES.map(sp => (
                <Entry key={sp.id} species={sp} found={Boolean(discovered[sp.id])} />
              ))}
              {whaleSeen && (
                <Entry species={BONUS_SPECIES} found bonus />
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="divelog-toast"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="divelog-toast-label">new log entry //</span>
            <span className="divelog-toast-name">{toast.name}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
