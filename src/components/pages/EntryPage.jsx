// ── Entry page — one job, project, class, or hobby, in full ────────────
// Everything above the write-up comes straight from the content registry:
// the title, a short list of facts, the opening paragraph, and the
// at-a-glance points. The long-form body
// (src/content/pages/<kind>/<slug>.mdx) follows, then the playable
// embed where a project has one, then links to related pages.
import {
  KINDS, STATUS_LABEL,
  entryPath, entryTitle, entryDescription, related,
  projectsForCourse, coursesForProject, courseHasPage, courseStatus, termLabel,
} from '../../content/index.js'
import { bodyLoader } from '../../content/bodies.js'
import { MdxBody } from '../mdx/MdxBody'
import { Link } from '../Link'
import { Porthole } from './Porthole'

function headerFor(kind, entry) {
  if (kind === 'work')    return { title: entry.role, sub: entry.company }
  if (kind === 'courses') return { title: entry.title, sub: entry.code }
  return { title: entry.title, sub: null }
}

// What an outside link is called, from where it goes
function linkLabel(url) {
  if (url.includes('steampowered.com')) return 'Steam page'
  if (url.includes('itch.io'))          return 'itch.io page'
  if (url.includes('github.com'))       return 'Source on GitHub'
  return 'Website'
}

// The short facts beside the title: [label, content] rows
function factsFor(kind, entry) {
  const rows = []
  if (kind === 'work') {
    rows.push(['When', entry.period])
  }
  if (kind === 'projects') {
    if (entry.details?.role) rows.push(['Role', entry.details.role])
    const classes = coursesForProject(entry)
    if (classes.length > 0) {
      rows.push(['Class', classes.map((c, i) => (
        <span key={c.slug}>
          {i > 0 && ', '}
          {courseHasPage(c)
            ? <Link href={entryPath('courses', c.slug)}>{c.code} {c.title}</Link>
            : `${c.code} ${c.title}`}
        </span>
      ))])
    }
  }
  if (kind === 'courses') {
    rows.push(['Term', `${termLabel(entry.term)} (${STATUS_LABEL[courseStatus(entry)].toLowerCase()})`])
    rows.push(['Hours', `${entry.credits} credit hours`])
  }
  if (entry.stack?.length > 0) rows.push(['Built with', entry.stack.join(', ')])

  const links = [
    ...(entry.link && entry.link !== '#' ? [{ href: entry.link, label: linkLabel(entry.link) }] : []),
    ...(entry.links || []),
  ]
  if (links.length > 0) {
    rows.push(['Links', links.map((l, i) => (
      <span key={l.href}>
        {i > 0 && ', '}
        <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
      </span>
    ))])
  }
  return rows
}

// Links to other pages, as plain rows: the title, and what kind of page
function PageList({ label, items }) {
  if (items.length === 0) return null
  return (
    <nav className="entry-list" aria-label={label}>
      <h2 className="entry-list-label">{label}</h2>
      <ul>
        {items.map(it => (
          <li key={it.href}>
            <Link href={it.href} className="entry-related-link">
              <span className="entry-list-title">{it.title}</span>
              <span className="entry-list-kind">{it.kind}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function EntryPage({ kind, entry }) {
  const { title, sub } = headerFor(kind, entry)
  const facts = factsFor(kind, entry)
  const highlights = entry.details?.highlights || []
  const embed = entry.details?.embed
  const body = bodyLoader(kind, entry.slug)

  // Explicit ties first (a class lists its projects), then pages that
  // share skills or tags
  const ties = kind === 'courses'
    ? projectsForCourse(entry.slug).map(p => ({
        href: entryPath('projects', p.slug), kind: KINDS.projects.label, title: p.title,
      }))
    : []
  const more = related(kind, entry.slug).map(p => ({
    href: entryPath(p.kind, p.entry.slug), kind: KINDS[p.kind].label, title: entryTitle(p.kind, p.entry),
  }))

  return (
    <article className="entry">
      <header className="entry-head">
        <div className="entry-head-text">
          <h1 className="entry-title" tabIndex={-1}>{title}</h1>
          {sub && <p className="entry-sub">{sub}</p>}
          {facts.length > 0 && (
            <dl className="entry-facts">
              {facts.map(([label, content]) => (
                <div key={label} className="entry-fact">
                  <dt>{label}</dt>
                  <dd>{content}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <Porthole />
      </header>

      <div className="entry-open">
        <p className="entry-lede">{entryDescription(kind, entry)}</p>
        {highlights.length > 0 && (
          <aside className="entry-glance" aria-label="At a glance">
            <p className="entry-glance-title">At a glance</p>
            <ul>
              {highlights.map(h => <li key={h}>{h}</li>)}
            </ul>
          </aside>
        )}
      </div>

      {body && <MdxBody loader={body} />}

      {embed && (
        <section className="entry-embed">
          <h2>Play it</h2>
          <iframe src={embed.src} height={embed.height} title={embed.title} loading="lazy" />
        </section>
      )}

      <PageList label="From this class" items={ties} />
      <PageList label="Related pages" items={more} />
    </article>
  )
}
