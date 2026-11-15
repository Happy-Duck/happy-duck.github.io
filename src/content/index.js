// ── Content registry — lookups, routes, and the relation graph ─────────
// Everything the site says about jobs, projects, classes, hobbies, and
// skills lives in the sibling data files; this module turns them into one
// addressable set of entries. Node-safe on purpose (explicit .js
// extensions, no JSX, no import.meta) — scripts/prerender.mjs imports it
// to write the per-page HTML shells and the sitemap.

import { WORK } from './work.js'
import { PROJECTS } from './projects.js'
import { SKILL_GROUPS } from './skills.js'
import { COURSES, courseHasPage } from './courses.js'
import { HOBBIES, LOG_INTRO } from './hobbies.js'

export { WORK, PROJECTS, SKILL_GROUPS, COURSES, HOBBIES, LOG_INTRO }
export {
  TERMS, CURRENT_TERM, COURSE_CATEGORIES, STATUS_LABEL,
  termLabel, courseStatus, courseHasPage,
} from './courses.js'

export const SITE_URL = 'https://happy-duck.github.io'

// The dive's own tab title — keep in sync with <title> in index.html
export const SITE_TITLE = 'Rishi Garhyan | XR Engineer & Game Developer'

// kind → URL segment, display label, and the list it draws from. Adding a
// kind here is all routing, prerender, and the sitemap need.
//   label   one entry of this kind ("Project"), shown beside links to it
//   crumb   the kind as a place ("Projects"), shown in the page's top bar
export const KINDS = {
  work:     { segment: 'work',     label: 'Job',     crumb: 'Career',     entries: WORK },
  projects: { segment: 'projects', label: 'Project', crumb: 'Projects',   entries: PROJECTS },
  // Only classes with a description have a page (see courses.js)
  courses:  { segment: 'courses',  label: 'Class',   crumb: 'Coursework', entries: COURSES.filter(courseHasPage) },
  hobbies:  { segment: 'hobbies',  label: 'Hobby',   crumb: 'Hobbies',    entries: HOBBIES },
}

// Hrefs carry a trailing slash: GitHub Pages serves each page from
// <path>/index.html and would 301 the slashless form.
export function entryPath(kind, slug) {
  return `/${KINDS[kind].segment}/${slug}/`
}

// The element on the dive that an entry's page belongs to — deep links
// scroll here so closing the page lands at the right depth. Elements carry
// data-entry-anchor="<kind>-<slug>"; each section also carries a bare
// data-entry-anchor="<kind>" as the fallback (entries with no card).
export function entryAnchor(kind, slug) {
  return `${kind}-${slug}`
}

// One accessor per field, because the four kinds name things differently
export function entryTitle(kind, entry) {
  if (kind === 'work')    return `${entry.role} at ${entry.company}`
  if (kind === 'courses') return `${entry.code}: ${entry.title}`
  return entry.title
}

// The shortest name that still identifies the entry (top bar, tight spots)
export function entryShortName(kind, entry) {
  if (kind === 'work')    return entry.company
  if (kind === 'courses') return entry.code
  return entry.title
}

// One sentence, for search results and link previews
export function entrySummary(kind, entry) {
  return kind === 'hobbies' ? entry.log : entry.summary
}

// The opening paragraph on the page
export function entryDescription(kind, entry) {
  return kind === 'hobbies' ? entry.log : entry.description
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

// Projects that came out of a class (projects.js: courses: ['cs-418'])
export function projectsForCourse(slug) {
  return PROJECTS.filter(p => p.courses?.includes(slug))
}

// The classes a project came out of
export function coursesForProject(project) {
  return (project.courses || [])
    .map(slug => COURSES.find(c => c.slug === slug))
    .filter(Boolean)
}
