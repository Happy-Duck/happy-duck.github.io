// ── Entry page — one job, project, class, or hobby, in full ────────────
// Renders straight from the content registry: what the card says, plus
// the role, highlights, and playable embed where an entry has them. The
// long-form body (src/content/pages/<kind>/<slug>.mdx) slots in below.
import {
  KINDS, STATUS_LABEL,
  entryPath, entryTitle, entryDescription, related,
  projectsForCourse, coursesForProject, courseHasPage, courseStatus, termLabel,
} from '../../content/index.js'
import { bodyLoader } from '../../content/bodies.js'
import { MdxBody } from '../mdx/MdxBody'
import { EntryLinkButton } from '../EntryLinkButton'
import { Link } from '../Link'
import { Porthole } from './Porthole'

function headerFor(kind, entry) {
  if (kind === 'work') {
    return { title: entry.role, sub: `${entry.company} · ${entry.period}` }
  }
  if (kind === 'courses') {
    return {
      title: entry.title,
      sub: `${entry.code} · ${termLabel(entry.term)} · ${STATUS_LABEL[courseStatus(entry)]}`,
    }
  }
  return { title: entry.title, sub: entry.details?.role }
}

// Cross-links that come from explicit ties rather than shared skills:
// a class lists its projects, a project lists the classes it came from
function tiesFor(kind, entry) {
  if (kind === 'courses') {
    return {
      label: 'Projects from this class',
      items: projectsForCourse(entry.slug).map(p => ({
        href: entryPath('projects', p.slug), kind: KINDS.projects.label, title: p.title,
      })),
    }
  }
  if (kind === 'projects') {
    return {
      label: 'Built in',
      items: coursesForProject(entry).filter(courseHasPage).map(c => ({
        href: entryPath('courses', c.slug), kind: KINDS.courses.label, title: entryTitle('courses', c),
      })),
    }
  }
  return { label: '', items: [] }
}

function LinkList({ label, items }) {
  if (items.length === 0) return null
  return (
    <nav className="entry-related" aria-label={label}>
      <h2 className="entry-related-label">{label}</h2>
      <ul className="entry-related-list">
        {items.map(it => (
          <li key={it.href}>
            <Link href={it.href} className="entry-related-link">
              <span className="entry-related-kind">{it.kind}</span>
              <span className="entry-related-title">{it.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function EntryPage({ kind, entry }) {
  const { title, sub } = headerFor(kind, entry)
  const d = entry.details
  const stack = entry.stack || []
  const links = entry.links || []
  const hasLink = Boolean(entry.link) && entry.link !== '#'
  const body = bodyLoader(kind, entry.slug)
  const ties = tiesFor(kind, entry)
  const more = related(kind, entry.slug).map(p => ({
    href: entryPath(p.kind, p.entry.slug), kind: KINDS[p.kind].label, title: entryTitle(p.kind, p.entry),
  }))

  return (
    <article className="entry">
      <header className="entry-head">
        <div className="entry-head-text">
          <p className="entry-kicker">{KINDS[kind].label}</p>
          <h1 className="entry-title" tabIndex={-1}>{title}</h1>
          {sub && <p className="entry-sub">{sub}</p>}
          {stack.length > 0 && (
            <div className="entry-stack">
              {stack.map(t => (
                <span key={t} className="card-pill px-2 py-0.5 rounded-full text-[clamp(0.625rem,0.55rem+0.2vw,0.75rem)] font-mono">
                  {t}
                </span>
              ))}
            </div>
          )}
          {/* The store / repo button, then any extra links from the data */}
          {(hasLink || links.length > 0) && (
            <div className="entry-links">
              <EntryLinkButton href={entry.link} />
              {links.map(l => (
                <EntryLinkButton key={l.href} href={l.href} label={l.label} />
              ))}
            </div>
          )}
        </div>
        <Porthole />
      </header>

      <p className="entry-lede">{entryDescription(kind, entry)}</p>

      {d?.highlights?.length > 0 && (
        <ul className="entry-highlights">
          {d.highlights.map(h => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}

      {d?.embed && (
        <div className="entry-embed">
          <iframe
            src={d.embed.src}
            height={d.embed.height}
            title={d.embed.title}
            loading="lazy"
          />
        </div>
      )}

      {body && <MdxBody loader={body} />}

      <LinkList label={ties.label} items={ties.items} />
      <LinkList label="Related" items={more} />
    </article>
  )
}
