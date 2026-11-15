// ── Media — shrink the pictures dropped into public/media ──────────────
// Run with `npm run media` after adding pictures. It is safe to run any
// number of times; it only touches what is new.
//
// For every .jpg / .jpeg / .png under public/media it:
//   1. writes a .webp beside it, at most 1920 px wide, turned the right
//      way up (phone photos carry their rotation as a note in the file);
//   2. moves the original out to media-originals/ (same folder layout),
//      which is neither committed nor deployed, so nothing is lost and
//      nothing heavy ships;
//   3. rewrites any mention of the old file name in src/content to the
//      new one, so a write-up can name the picture exactly as dropped in.
//
// Then it measures every picture in public/media and records the sizes
// in src/content/media-sizes.json. The page blocks read that file to
// reserve each picture's space before it loads (no jumping text), which
// is why nobody has to type a width or height into a write-up.
//
// Videos are left alone; one over 4 MB is reported, since a long video
// belongs on YouTube (see docs/OWNERS_MANUAL.md).

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// Windows: without this sharp keeps the source file open and the move
// in step 2 fails with EBUSY
sharp.cache(false)

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const mediaDir = join(root, 'public', 'media')
const keepDir = join(root, 'media-originals')
const contentDir = join(root, 'src', 'content')
const sizesFile = join(contentDir, 'media-sizes.json')

const MAX_WIDTH = 1920
const QUALITY = 82
const CONVERT = new Set(['.jpg', '.jpeg', '.png'])
const MEASURE = new Set(['.webp', '.avif', '.gif', '.jpg', '.jpeg', '.png'])
const VIDEO = new Set(['.mp4', '.webm', '.mov'])
const VIDEO_LIMIT = 4 * 1024 * 1024
const IMAGE_LIMIT = 700 * 1024

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const full = join(dir, d.name)
    return d.isDirectory() ? walk(full) : [full]
  })
}

const ext = (file) => extname(file).toLowerCase()
// public/media/projects/pelagos/a.webp → /media/projects/pelagos/a.webp
const webPath = (file) => '/' + relative(join(root, 'public'), file).split('\\').join('/')
const kb = (bytes) => `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('en-US')} kB`

function moveAside(file) {
  const dest = join(keepDir, relative(mediaDir, file))
  mkdirSync(dirname(dest), { recursive: true })
  try {
    renameSync(file, dest)
  } catch {
    // another drive, or a sync client holding the file: copy, then remove
    copyFileSync(file, dest)
    unlinkSync(file)
  }
}

// ── 1 + 2: convert, move the original aside ────────────────────────────

const renamed = []   // [oldWebPath, newWebPath]
const notes = []

for (const file of walk(mediaDir).filter(f => CONVERT.has(ext(f)))) {
  const target = file.slice(0, -ext(file).length) + '.webp'
  if (existsSync(target)) {
    notes.push(`skipped ${webPath(file)}: ${webPath(target)} already exists. Delete one of the two.`)
    continue
  }
  const before = statSync(file).size
  await sharp(file)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(target)
  const after = statSync(target).size
  try {
    moveAside(file)
  } catch (err) {
    notes.push(`could not move ${webPath(file)} to media-originals/ (${err.code || err.message}). Move it by hand so it is not published.`)
  }
  renamed.push([webPath(file), webPath(target)])
  console.log(`  ${webPath(target)}  ${kb(before)} to ${kb(after)}`)
}

// ── 3: point write-ups at the new names ────────────────────────────────

if (renamed.length > 0) {
  for (const file of walk(contentDir).filter(f => ['.mdx', '.js'].includes(ext(f)))) {
    const text = readFileSync(file, 'utf8')
    let next = text
    for (const [from, to] of renamed) next = next.split(from).join(to)
    if (next !== text) {
      writeFileSync(file, next)
      console.log(`  updated names in ${relative(root, file).split('\\').join('/')}`)
    }
  }
}

// ── Sizes for every picture, and a look at what is heavy ───────────────

const sizes = {}
for (const file of walk(mediaDir).sort()) {
  const e = ext(file)
  const bytes = statSync(file).size
  if (VIDEO.has(e) && bytes > VIDEO_LIMIT) {
    notes.push(`${webPath(file)} is ${kb(bytes)}. Clips over 4 MB are better on YouTube.`)
  }
  if (!MEASURE.has(e)) continue
  const meta = await sharp(file).metadata()
  // EXIF orientations 5 to 8 mean the picture is stored on its side
  const turned = (meta.orientation || 1) >= 5
  sizes[webPath(file)] = turned ? [meta.height, meta.width] : [meta.width, meta.height]
  if (bytes > IMAGE_LIMIT) notes.push(`${webPath(file)} is ${kb(bytes)}, heavy for a picture.`)
}

// one picture per line: "path": [width, height]
const json = '{\n' + Object.entries(sizes)
  .map(([k, [w, h]]) => `  ${JSON.stringify(k)}: [${w}, ${h}]`)
  .join(',\n') + '\n}\n'
const had = existsSync(sizesFile) ? readFileSync(sizesFile, 'utf8').split('\r\n').join('\n') : ''
if (json !== had) writeFileSync(sizesFile, json)

const count = Object.keys(sizes).length
console.log(`media: ${renamed.length} converted, ${count} ${count === 1 ? 'picture' : 'pictures'} measured`)
for (const n of notes) console.log(`  note: ${n}`)
