// ── Page layer — an expedition file opened over the dive ───────────────
// Every route except / renders here: an opaque, full-viewport layer
// portaled to <body> (sections create stacking contexts that trap fixed
// children), with its own scroll. The dive stays mounted underneath —
// paused, hidden, and inert (App.jsx) — so the document never scrolls and
// closing the page puts the diver back at the exact depth they left.
//
// z-75: above the fabs, floor stamp, and toasts; below the terminal (80),
// which stays usable on top of a page.
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { goBack } from '../../lib/router'
import { useOceanDepth } from '../../hooks/useOceanDepth'
import { KINDS, SITE_TITLE, entryTitle } from '../../content/index.js'
import { EntryPage } from './EntryPage'
import { NotFoundPage } from './NotFoundPage'

export function PageLayer({ route, path }) {
  const scrollRef = useRef(null)
  const { depthMeters } = useOceanDepth()
  const found = route.kind !== 'notfound'

  // Scroll lock, Esc to go back, focus restore — the dive behind is
  // inert, so focus has to be placed and returned by hand
  useEffect(() => {
    const prev = document.activeElement
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key !== 'Escape') return
      // The terminal sits above the page and owns Esc while it is open
      if (document.querySelector('.term-overlay')) return
      goBack()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (prev && prev !== document.body && prev.focus) prev.focus({ preventScroll: true })
    }
  }, [])

  // Each page (first open and page-to-page) takes focus on its heading:
  // screen readers announce where they are, Tab continues into the page,
  // and no focus ring is drawn on a non-interactive target
  useEffect(() => {
    scrollRef.current?.querySelector('h1')?.focus({ preventScroll: true })
  }, [path])

  // Tab title follows the page; the dive's title comes back on close
  useEffect(() => {
    document.title = found
      ? `${entryTitle(route.kind, route.entry)} | Rishi Garhyan`
      : 'Lost at Sea | Rishi Garhyan'
    return () => { document.title = SITE_TITLE }
  }, [found, route.kind, route.entry])

  const onBack = (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    goBack()
  }

  return createPortal(
    <div className="page-layer" data-no-ping>
      {/* Keyed by path: moving between pages remounts the scroller, so
          each page opens at its top */}
      <div className="page-scroll" key={path} ref={scrollRef}>
        <header className="page-bar">
          <a href="/" className="page-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Back to the dive
            {depthMeters > 0 && (
              <span className="page-back-depth">{depthMeters.toLocaleString()} m</span>
            )}
          </a>
          {found && (
            <span className="page-bar-file" aria-hidden="true">
              expedition file // {KINDS[route.kind].segment} / {route.slug}
            </span>
          )}
        </header>

        <main className="page-main">
          {found
            ? <EntryPage kind={route.kind} entry={route.entry} />
            : <NotFoundPage />}
        </main>
      </div>
    </div>,
    document.body,
  )
}
