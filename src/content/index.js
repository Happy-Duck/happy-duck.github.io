// ── Content registry — lookups, routes, and the relation graph ─────────
// Everything the site says about jobs, projects, and skills lives in the
// sibling data files; this module turns them into one addressable set of
// entries. Node-safe on purpose (explicit .js extensions, no JSX, no
// import.meta) — scripts/prerender.mjs imports it to write the per-page
// HTML shells and the sitemap.

import { WORK } from './work.js'
import { PROJECTS } from './projects.js'
import { SKILL_GROUPS } from './skills.js'

export { WORK, PROJECTS, SKILL_GROUPS }

export const SITE_URL = 'https://happy-duck.github.io'

// kind → URL segment, display label, and the list it draws from
export const KINDS = {
  work:     { segment: 'work',     label: 'Career',  entries: WORK },
  projects: { segment: 'projects', label: 'Project', entries: PROJECTS },
}

// Hrefs carry a trailing slash: GitHub Pages serves each page from
// <path>/index.html and would 301 the slashless form.
export function entryPath(kind, slug) {
  return `/${KINDS[kind].segment}/${slug}/`
}

// The card on the dive that an entry's page belongs to — deep links scroll
// here so closing the page lands at the right depth
export function entryAnchor(kind, slug) {
  return `${kind}-${slug}`
}

export function entryTitle(kind, entry) {
  return kind === 'work' ? `${entry.role} — ${entry.company}` : entry.title
}

export function findEntry(kind, slug) {
  return KINDS[kind]?.entries.find(e => e.slug === slug) || null
}

// Every addressable page, in sitemap order
export function allEntries() {
  return Object.entries(KINDS).flatMap(([kind, k]) =>
    k.entries.map(entry => ({
      kind,
      entry,
      path:  entryPath(kind, entry.slug),
      title: entryTitle(kind, entry),
    })),
  )
}

// pathname → { kind: 'home' } | { kind, slug, entry } | { kind: 'notfound' }
export function matchRoute(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return { kind: 'home' }
  if (parts.length === 2) {
    const kind = Object.keys(KINDS).find(k => KINDS[k].segment === parts[0])
    const entry = kind && findEntry(kind, parts[1])
    if (entry) return { kind, slug: entry.slug, entry }
  }
  return { kind: 'notfound' }
}

// ── Relations ──────────────────────────────────────────────────────────

const SKILLS = SKILL_GROUPS.flatMap(g => g.items)

export function findSkill(id) {
  return SKILLS.find(s => s.id === id) || null
}

// Every job and project that lists a skill
export function pagesForSkill(id) {
  return allEntries().filter(p => p.entry.skills?.includes(id))
}

// Other entries sharing at least one skill or tag, most overlap first
export function related(kind, slug, limit = 3) {
  const self = findEntry(kind, slug)
  if (!self) return []
  const overlap = (other) =>
    (other.skills || []).filter(s => self.skills?.includes(s)).length +
    (other.tags   || []).filter(t => self.tags?.includes(t)).length
  return allEntries()
    .filter(p => !(p.kind === kind && p.entry.slug === slug))
    .map(p => ({ ...p, score: overlap(p.entry) }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
