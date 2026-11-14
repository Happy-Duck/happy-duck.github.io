// ── Entry page — one job or project, in full ───────────────────────────
// Renders straight from the content registry: what the card says, plus
// the role, highlights, and playable embed that used to live in the
// case-study modal. The long-form body (MDX) slots in under the header
// as pages get written.
import { KINDS, entryPath, entryTitle, related } from '../../content/index.js'
import { bodyLoader } from '../../content/bodies.js'
import { MdxBody } from '../mdx/MdxBody'
import { EntryLinkButton } from '../EntryLinkButton'
import { Link } from '../Link'

function headerFor(kind, entry) {
  if (kind === 'work') {
    return { title: entry.role, sub: `${entry.company} · ${entry.period}` }
  }
  return { title: entry.title, sub: entry.details?.role }
}

export function EntryPage({ kind, entry }) {
  const { title, sub } = headerFor(kind, entry)
  const d = entry.details
  const more = related(kind, entry.slug)
  const body = bodyLoader(kind, entry.slug)

  return (
    <article className="entry">
      <header className="entry-head">
        <p className="entry-kicker">{KINDS[kind].label}</p>
        <div className="entry-title-row">
          <h1 className="entry-title" tabIndex={-1}>{title}</h1>
          <EntryLinkButton href={entry.link} />
        </div>
        {sub && <p className="entry-sub">{sub}</p>}
        <div className="entry-stack">
          {entry.stack.map(t => (
            <span key={t} className="card-pill px-2 py-0.5 rounded-full text-[clamp(0.625rem,0.55rem+0.2vw,0.75rem)] font-mono">
              {t}
            </span>
          ))}
        </div>
      </header>

      <p className="entry-lede">{entry.description}</p>

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

      {more.length > 0 && (
        <nav className="entry-related" aria-label="Related work">
          <h2 className="entry-related-label">Related</h2>
          <ul className="entry-related-list">
            {more.map(p => (
              <li key={p.path}>
                <Link href={entryPath(p.kind, p.entry.slug)} className="entry-related-link">
                  <span className="entry-related-kind">{KINDS[p.kind].label}</span>
                  <span className="entry-related-title">{entryTitle(p.kind, p.entry)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  )
}
