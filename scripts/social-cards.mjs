// ── Social cards — the picture a shared link shows, one per page ───────
// Runs as the second half of `npm run media`. For every page in the
// content registry it writes public/social/<kind>-<slug>.jpg (1200x630);
// scripts/prerender.mjs points that page's og:image at it. A page with
// no card falls back to the site-wide /og-image.png.
//
// Two layouts:
//   - default: the site's own surface water (scripts/assets/social-base.png,
//     a screenshot of the hero with its text hidden) with the page title
//     set the way the hero sets the name;
//   - an entry with `cover: '/media/…'` in its data file: that picture,
//     with the title in a band along the bottom.
//
// The text is drawn with this computer's fonts, which is why the cards
// are made by hand and committed instead of being made during the build:
// a build on another machine would draw them differently.
//
// social-base.png and public/og-image.png are 1200x630 screenshots of
// the top of the dive at noon with the buttons hidden. Retake both if
// the hero's look changes.

import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { KINDS, allEntries } from '../src/content/index.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'social')
const base = join(root, 'scripts', 'assets', 'social-base.png')

const W = 1200
const H = 630
const INK = 'rgb(22,48,76)'          // the hero's title color
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Rough width of a string in ems for a heavy sans, good enough to decide
// where lines break (the text is centered, so small errors do not show)
function ems(text) {
  let n = 0
  for (const ch of text) {
    if (' .,:;\'!|iIl'.includes(ch)) n += 0.31
    else if ('mwMW@'.includes(ch)) n += 0.92
    else if (ch >= 'A' && ch <= 'Z') n += 0.7
    else n += 0.59
  }
  return n
}

function wrap(text, size, maxWidth) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && ems(next) * size > maxWidth) { lines.push(line); line = word } else line = next
  }
  if (line) lines.push(line)
  return lines
}

// The largest size at which the title fits on two lines; three at the
// smallest size if it must
function fit(text, sizes, maxWidth) {
  for (const size of sizes) {
    const lines = wrap(text, size, maxWidth)
    if (lines.length <= 2) return { size, lines }
  }
  const size = sizes[sizes.length - 1]
  return { size, lines: wrap(text, size, maxWidth) }
}

function waterCard(title, sub) {
  const { size, lines } = fit(title, [100, 88, 76, 66, 58], 1040)
  const lead = size * 1.06
  const blockH = lines.length * lead + 34 + 34
  const top = 110 + (H - 110 - blockH) / 2      // centered in the water below the waves
  const titleY = (i) => top + size * 0.82 + i * lead
  const ruleY = top + lines.length * lead + 14
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${lines.map((l, i) => `<text x="${W / 2}" y="${titleY(i)}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="${size}" letter-spacing="${-size * 0.04}" fill="${INK}">${esc(l)}</text>`).join('\n    ')}
    <rect x="${W / 2 - 28}" y="${ruleY}" width="56" height="1" fill="${INK}" fill-opacity="0.45" />
    <text x="${W / 2}" y="${ruleY + 44}" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="27" fill="${INK}" fill-opacity="0.88">${esc(sub)}</text>
  </svg>`
}

function coverBand(title, sub) {
  const { size, lines } = fit(title, [54, 46, 40], 1080)
  const bandH = 44 + lines.length * size * 1.12 + 46
  const y0 = H - bandH
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="0" y="${y0}" width="${W}" height="${bandH}" fill="rgb(6,18,36)" fill-opacity="0.9" />
    ${lines.map((l, i) => `<text x="60" y="${y0 + 36 + size * 0.82 + i * size * 1.12}" font-family="${FONT}" font-weight="900" font-size="${size}" letter-spacing="${-size * 0.03}" fill="#f2f8fc">${esc(l)}</text>`).join('\n    ')}
    <text x="60" y="${H - 34}" font-family="${FONT}" font-weight="600" font-size="24" fill="#a8bfd2">${esc(sub)}</text>
  </svg>`
}

mkdirSync(outDir, { recursive: true })
const wanted = new Set()
let written = 0

for (const { kind, entry, title } of allEntries()) {
  const name = `${kind}-${entry.slug}.jpg`
  wanted.add(name)
  const sub = `${KINDS[kind].crumb}  ·  Rishi Garhyan`
  const cover = entry.cover && join(root, 'public', entry.cover)
  let img
  if (cover && existsSync(cover)) {
    img = await sharp(cover)
      .resize(W, H, { fit: 'cover', position: 'attention' })
      .composite([{ input: Buffer.from(coverBand(title, sub)) }])
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer()
  } else {
    if (cover) console.log(`  note: ${entry.cover} (cover of ${name}) does not exist; using the water card`)
    img = await sharp(base)
      .composite([{ input: Buffer.from(waterCard(title, sub)) }])
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer()
  }
  const file = join(outDir, name)
  if (!existsSync(file) || !readFileSync(file).equals(img)) {
    writeFileSync(file, img)
    written++
  }
}

// Cards for pages that no longer exist
let removed = 0
for (const f of readdirSync(outDir)) {
  if (/\.(png|jpg)$/.test(f) && !wanted.has(f)) { unlinkSync(join(outDir, f)); removed++ }
}

console.log(`social cards: ${wanted.size} pages, ${written} written${removed ? `, ${removed} removed` : ''}`)
