// ── Page layer — a sheet laid over the dive ────────────────────────────
// Every route except / renders here: a full-viewport layer portaled to
// <body> (sections create stacking contexts that trap fixed children)
// holding one centered sheet with its own scroll. The dive stays mounted
// underneath, inert (App.jsx), so the document never scrolls and
// closing the page puts the diver back at the exact depth they left. On a wide screen the water stays visible, dimmed, either
// side of the sheet; clicking it closes the page, like stepping back from
// a chart table.
//
// z-75: above the fabs, floor stamp, and toasts; below the terminal (80),
// which stays usable on top of a page.
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../../styles/pages.css'
import { goBack } from '../../lib/router'
import { setWaterVisible } from '../../lib/oceanPause'
import { useOceanDepth } from '../../hooks/useOceanDepth'
import { KINDS, SITE_TITLE, entryTitle, entryShortName } from '../../content/index.js'
import { devBodyLoader } from '../../content/bodies.js'
import { MdxBody } from '../mdx/MdxBody'
import { EntryPage } from './EntryPage'
import { NotFoundPage } from './NotFoundPage'

export function PageLayer({ route, path }) {
  const scrollRef = useRef(null)
  const downOutside = useRef(false)
  const { depthMeters } = useOceanDepth()
  const found = route.kind !== 'notfound'
  // Dev-server-only reference pages (src/content/dev) — always null in a
  // production build
  const devBody = found ? null : devBodyLoader(path)

  // Scroll lock, Esc to go back, focus restore — the dive behind is
  // inert, so focus has to be placed and returned by hand
  useEffect(() => {
    const prev = document.activeElement
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key !== 'Escape') return
      // The terminal sits above the page and owns Esc while it is open;
      // so does anything a page opens over itself (an image lightbox)
      if (document.querySelector('.term-overlay, [data-esc-layer]')) return
      goBack()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (prev && prev !== document.body && prev.focus) prev.focus({ preventScroll: true })
    }
  }, [])

  // The dive keeps running only while its water shows beside the sheet,
  // which is whenever the window is wider than the sheet (pages.css:
  // --sheet-w). Narrower than that, the sheet covers it and it pauses.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1121px)')
    const report = () => setWaterVisible(wide.matches)
    report()
    wide.addEventListener('change', report)
    return () => {
      wide.removeEventListener('change', report)
      setWaterVisible(false)
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

  // Clicking the water either side of the sheet closes the page. Both the
  // press and the release have to land out there, so a text selection
  // dragged past the edge doesn't count, and neither does the scrollbar
  // (which sits beyond the scroller's clientWidth). The target must also
  // be inside the scroller in the DOM: anything a page portals to <body>
  // (the image lightbox) is still its child as far as React's events go,
  // so its clicks arrive here too, and they are not clicks on the water.
  const isOutside = (e) =>
    e.currentTarget.contains(e.target) &&
    !e.target.closest('.page-sheet') && e.clientX < e.currentTarget.clientWidth
  const onMouseDown = (e) => { downOutside.current = e.button === 0 && isOutside(e) }
  const onClick = (e) => {
    const close = downOutside.current && isOutside(e)
    downOutside.current = false
    if (close) goBack()
  }

  return createPortal(
    <div className="page-layer" data-no-ping>
      {/* Keyed by path: moving between pages remounts the scroller, so
          each page opens at its top */}
      <div className="page-scroll" key={path} ref={scrollRef} onMouseDown={onMouseDown} onClick={onClick}>
        <div className="page-sheet">
          <header className="page-bar">
            <a href="/" className="page-back" onClick={onBack}>
              <svg className="page-back-chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M7 1 L1 7 L7 13" /></svg>
              Back to the dive
              {depthMeters > 0 && (
                <span className="page-back-depth">{depthMeters.toLocaleString()} m</span>
              )}
            </a>
            {found && (
              <span className="page-crumb">
                {KINDS[route.kind].crumb} / {entryShortName(route.kind, route.entry)}
              </span>
            )}
          </header>

          <main className="page-main">
            {found
              ? <EntryPage kind={route.kind} entry={route.entry} />
              : devBody
                ? <article className="entry"><MdxBody loader={devBody} /></article>
                : <NotFoundPage />}
          </main>
        </div>
      </div>
    </div>,
    document.body,
  )
}
