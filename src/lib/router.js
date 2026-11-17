// ── Router — the History API, four route patterns, no dependency ───────
// The dive (/) never unmounts; every other path opens an expedition-file
// page as a layer over it (see components/pages/PageLayer.jsx). Route
// matching lives with the content in src/content/index.js — this module
// only tracks the pathname and moves between entries.
//
// Navigations run inside a View Transition where supported (and motion is
// allowed), with the React commit flushed synchronously so the old and
// new snapshots are the real before and after.
//
// Opening a page from its card, and closing back to it, is a shared-
// element transition: the card grows into the page's sheet and the sheet
// shrinks back into the card. One view-transition-name (entry-morph) is
// owned by ONE element per snapshot: the card while the dive is showing,
// .page-morph (the sheet's outline, PageLayer.jsx) while a page is. The
// card gets the name by inline style for the length of the transition
// only; the outline has it in pages.css. While it runs, :root carries
// data-morph="open" or "close" and --morph-bg (the page's paper color),
// which is what the growing panel is painted with (pages.css).

import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { matchRoute, entryAnchor } from '../content/index.js'

// Trailing slashes are noise: GitHub Pages serves /projects/pelagos/ but
// both forms are the same page
function normalize(pathname) {
  let p = pathname
  try { p = decodeURI(pathname) } catch { /* malformed escape — match raw */ }
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p || '/'
}

const listeners = new Set()
let current = normalize(window.location.pathname)

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getSnapshot() {
  return current
}

function sync() {
  const next = normalize(window.location.pathname)
  if (next === current) return
  current = next
  listeners.forEach(fn => fn())
}

// The element on the dive that stands for a page: its card (or class
// bubble, or log line), if that is on screen right now
function cardFor(pathname) {
  const route = matchRoute(pathname)
  if (!route.entry) return null
  const name = entryAnchor(route.kind, route.slug)
  const el = [...document.querySelectorAll(`[data-entry-anchor="${name}"]`)]
    .find(n => n.offsetParent !== null)
  if (!el) return null
  const box = el.getBoundingClientRect()
  return box.bottom > 0 && box.top < window.innerHeight ? el : null
}

// apply() moves the app from `current` to `to`
function withTransition(apply, to) {
  const animate =
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!animate) { apply(); return }

  const root = document.documentElement
  const from = current
  const paper = () => {
    const layer = document.querySelector('.page-layer')
    return layer ? getComputedStyle(layer).getPropertyValue('--page-bg').trim() : ''
  }
  const mark = (direction, color) => {
    root.dataset.morph = direction
    root.style.setProperty('--morph-bg', color || 'transparent')
  }
  let card = null
  let closing = null
  // Opening from the dive: the card owns the name in the old snapshot
  if (from === '/' && to !== '/') {
    card = cardFor(to)
    if (card) card.style.viewTransitionName = 'entry-morph'
  }
  // Closing: the page's color has to be read while the page still exists
  if (from !== '/' && to === '/') closing = paper()

  const transition = document.startViewTransition(() => {
    flushSync(apply)
    if (card) {
      card.style.viewTransitionName = ''
      card = null
      mark('open', paper())
    }
    // Closing to the dive: the card owns the name in the new snapshot
    // (after the commit, which is also when the dive is back at its depth)
    if (closing !== null) {
      card = cardFor(from)
      if (card) {
        card.style.viewTransitionName = 'entry-morph'
        mark('close', closing)
      }
    }
  })
  transition.finished.finally(() => {
    if (card) card.style.viewTransitionName = ''
    delete root.dataset.morph
    root.style.removeProperty('--morph-bg')
  })
}

window.addEventListener('popstate', () => withTransition(sync, normalize(window.location.pathname)))

// history.state.idx counts in-app pushes, so goBack() can tell a page the
// visitor navigated to from one they landed on directly
function historyIdx() {
  return window.history.state?.idx ?? 0
}

export function navigate(to, { replace = false } = {}) {
  const url = new URL(to, window.location.origin)
  if (normalize(url.pathname) === current) return
  withTransition(() => {
    const href = url.pathname + url.search + url.hash
    if (replace) window.history.replaceState({ idx: historyIdx() }, '', href)
    else window.history.pushState({ idx: historyIdx() + 1 }, '', href)
    sync()
  }, normalize(url.pathname))
}

// Back to wherever the visitor came from inside the site; on a direct
// landing there is no "back", so go to the fallback instead
export function goBack(fallback = '/') {
  if (historyIdx() > 0) window.history.back()
  else navigate(fallback)
}

export function usePath() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
