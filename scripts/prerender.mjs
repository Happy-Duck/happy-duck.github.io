// ── Prerender — one HTML shell per page, plus the sitemap ──────────────
// Runs after `vite build` (see package.json). GitHub Pages only knows
// files: without this, /projects/pelagos/ would be served by 404.html
// with a 404 status, and every shared link would unfurl as the home page.
//
// For each entry in the content registry this writes
// dist/<kind>/<slug>/index.html — the built app shell with that page's
// title, description, canonical URL, Open Graph / Twitter tags, JSON-LD,
// and a <noscript> summary swapped in. The app boots from it exactly as
// it does from /, sees the path, and opens the page.
//
// It also writes dist/sitemap.xml from the same registry, so the sitemap
// can never drift from the pages that exist.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL, KINDS, allEntries, entrySummary, entryDescription } from '../src/content/index.js'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const shell = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

// Swap one tag in the shell. Each pattern must match exactly once — if
// index.html is restructured, fail the build instead of silently shipping
// pages that all carry the home page's metadata.
function swap(html, label, pattern, replacement) {
  const hits = html.match(new RegExp(pattern.source, 'g'))?.length ?? 0
  if (hits !== 1) {
    throw new Error(`prerender: expected exactly one ${label} in dist/index.html, found ${hits}`)
  }
  return html.replace(pattern, () => replacement)
}

function renderPage({ kind, entry, path, title }) {
  const url = SITE_URL + path
  const fullTitle = `${title} | Rishi Garhyan`
  const description = entrySummary(kind, entry)
  const stack = entry.stack || []
  const t = esc(fullTitle)
  const d = esc(description)

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description,
    url,
    author: { '@type': 'Person', name: 'Rishi Garhyan', url: SITE_URL },
    ...(stack.length ? { keywords: stack.join(', ') } : {}),
  }).replace(/</g, '\\u003c')

  let html = shell
  html = swap(html, '<title>', /<title>[^<]*<\/title>/, `<title>${t}</title>`)
  html = swap(html, 'meta description', /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${d}" />`)
  html = swap(html, 'canonical link', /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`)
  html = swap(html, 'og:type', /<meta property="og:type" content="[^"]*" \/>/,
    '<meta property="og:type" content="article" />')
  html = swap(html, 'og:title', /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${t}" />`)
  html = swap(html, 'og:description', /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${d}" />`)
  html = swap(html, 'og:url', /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${url}" />`)
  html = swap(html, 'twitter:title', /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${t}" />`)
  html = swap(html, 'twitter:description', /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${d}" />`)

  // Page-level structured data, alongside the site-wide Person block.
  // The style paints the page's dark background before the app boots —
  // without it a direct landing flashes the sunlit surface color first.
  // App.jsx removes it once React has rendered.
  html = swap(html, '</head>', /<\/head>/, [
    `  <script type="application/ld+json">${jsonLd}</script>`,
    '    <style id="page-prepaint">html, body { background: #020818 !important; }</style>',
    '  </head>',
  ].join('\n'))

  html = swap(html, '<noscript> block', /<noscript>[\s\S]*?<\/noscript>/, [
    '<noscript>',
    `      <p>${esc(KINDS[kind].label)}</p>`,
    `      <h1>${esc(title)}</h1>`,
    `      <p>${esc(entryDescription(kind, entry))}</p>`,
    ...(stack.length ? [`      <p>${esc(stack.join(' · '))}</p>`] : []),
    '      <p><a href="/">Rishi Garhyan — portfolio</a></p>',
    '    </noscript>',
  ].join('\n'))

  return html
}

const pages = allEntries()

for (const page of pages) {
  const dir = join(dist, ...page.path.split('/').filter(Boolean))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), renderPage(page))
}

// ── Sitemap ────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10)
const urlEntry = (loc, priority) => [
  '  <url>',
  `    <loc>${esc(loc)}</loc>`,
  `    <lastmod>${today}</lastmod>`,
  '    <changefreq>monthly</changefreq>',
  `    <priority>${priority}</priority>`,
  '  </url>',
].join('\n')

writeFileSync(join(dist, 'sitemap.xml'), [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urlEntry(`${SITE_URL}/`, '1.0'),
  ...pages.map(p => urlEntry(SITE_URL + p.path, '0.8')),
  '</urlset>',
  '',
].join('\n'))

console.log(`prerender: ${pages.length} pages + sitemap.xml`)
for (const p of pages) console.log(`  ${p.path}`)
