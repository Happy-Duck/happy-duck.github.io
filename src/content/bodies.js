// ── Page bodies — the long-form write-up for each entry ────────────────
// A job or project gets a body by adding one file:
//
//   src/content/pages/<kind>/<slug>.mdx     e.g. pages/projects/pelagos.mdx
//
// Markdown, plus the components in src/components/mdx. Each file becomes
// its own lazy chunk, fetched only when that page is opened, so the dive's
// bundle never grows with the amount written. An entry without a file
// simply renders its card content.
//
// Kept apart from index.js because import.meta.glob only exists under
// Vite — index.js has to stay importable from Node (scripts/prerender.mjs).

const pages = import.meta.glob('./pages/**/*.mdx')

// Reference pages for building and styling MDX components. Dev server
// only: the branch is dead code in a production build, so nothing ships.
const dev = import.meta.env.DEV ? import.meta.glob('./dev/*.mdx') : {}

// () => import(...) for an entry's body, or null when none is written yet
export function bodyLoader(kind, slug) {
  return pages[`./pages/${kind}/${slug}.mdx`] || null
}

// /dev/<name> → loader for src/content/dev/<name>.mdx (dev server only)
export function devBodyLoader(pathname) {
  const name = pathname.match(/^\/dev\/([\w-]+)$/)?.[1]
  return (name && dev[`./dev/${name}.mdx`]) || null
}
