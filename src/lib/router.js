// ── Router — the History API, four route patterns, no dependency ───────
// The dive (/) never unmounts; every other path opens an expedition-file
// page as a layer over it (see components/pages/PageLayer.jsx). Route
// matching lives with the content in src/content/index.js — this module
// only tracks the pathname and moves between entries.
//
// Navigations run inside a View Transition where supported (and motion is
// allowed), with the React commit flushed synchronously so the old and
// new snapshots are the real before and after.

import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

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

function withTransition(apply) {
  const animate =
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!animate) { apply(); return }
  document.startViewTransition(() => flushSync(apply))
}

window.addEventListener('popstate', () => withTransition(sync))

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
  })
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
