import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
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
