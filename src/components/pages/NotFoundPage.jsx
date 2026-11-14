// ── Lost at Sea — an address the registry doesn't know ─────────────────
// The in-app twin of public/404.html (which GitHub Pages serves for paths
// that were never prerendered).
import { Link } from '../Link'

export function NotFoundPage() {
  return (
    <div className="page-lost">
      <span className="page-lost-depth">depth: unknown</span>
      <h1 className="page-lost-code" tabIndex={-1}>404</h1>
      <p className="page-lost-text">
        You've drifted into uncharted waters. Whatever was here has been
        lost to the abyss — or never existed at all.
      </p>
      <Link href="/" className="page-lost-link">Resurface</Link>
    </div>
  )
}
