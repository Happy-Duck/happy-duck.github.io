// ── Mission profile — one site, tailored links ─────────────────────────
// A link like  https://happy-duck.github.io/?for=graphics  leads with the
// work that matches: projects tagged `graphics` (projects.js: tags) move
// to the front of the Projects grid, in their usual order; the rest
// follow. Nothing is hidden and nothing else changes.
//
// The choice is read once when the site loads and kept for the visit
// (sessionStorage), so it survives opening and closing pages even though
// those links don't carry the ?for= part.

const KEY = 'ocean.profile'

function read() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('for')
    if (fromUrl) {
      const clean = fromUrl.trim().toLowerCase()
      sessionStorage.setItem(KEY, clean)
      return clean
    }
    return sessionStorage.getItem(KEY) || null
  } catch {
    return null // private mode: no profile, the default order stands
  }
}

export const PROFILE = read()

// Entries whose tags include the profile first; order otherwise unchanged
export function byProfile(entries) {
  if (!PROFILE) return entries
  const hit = entries.filter(e => e.tags?.includes(PROFILE))
  if (hit.length === 0) return entries
  return [...hit, ...entries.filter(e => !e.tags?.includes(PROFILE))]
}
