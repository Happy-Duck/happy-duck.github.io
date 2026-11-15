import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

// Dev server only. Vite lists the files in public/ once, at startup, and
// keeps the list current through its file watcher. The watcher ignores
// public/ here (see `server.watch` below), so a picture dropped into
// public/media while the server is running was answered with the app's
// HTML instead of the picture until the next restart. This serves such
// files straight from disk. (No Range support, so a newly added video
// plays but cannot be scrubbed until the server is restarted.)
const MEDIA_TYPES = {
  '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
}
function freshMedia() {
  const publicDir = fileURLToPath(new URL('./public', import.meta.url))
  return {
    name: 'fresh-media',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        let url
        try { url = decodeURIComponent((req.url || '').split('?')[0]) } catch { return next() }
        if (!url.startsWith('/media/') || url.includes('..')) return next()
        const file = join(publicDir, url)
        const type = MEDIA_TYPES[extname(file).toLowerCase()]
        if (!type || !existsSync(file) || !statSync(file).isFile()) return next()
        res.setHeader('Content-Type', type)
        res.setHeader('Cache-Control', 'no-cache')
        createReadStream(file).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    freshMedia(),
    // Page bodies are MDX (src/content/pages). Code blocks are highlighted
    // here at build time by shiki — the browser gets plain colored spans,
    // no highlighter ships in the bundle.
    {
      enforce: 'pre',
      ...mdx({
        // GitHub-flavored Markdown: tables, strikethrough, task lists
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [rehypePrettyCode, { theme: 'github-dark-default', keepBackground: false }],
        ],
      }),
    },
    react(),
  ],
  base: '/',
  server: {
    watch: {
      // OneDrive locks freshly-dropped files mid-sync; watching them
      // crashes the dev server with EBUSY. Static assets don't need HMR.
      ignored: ['**/public/**'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
