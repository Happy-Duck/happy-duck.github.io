import { chromium } from 'playwright-core'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', e => errors.push(String(e)))
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await page.waitForSelector('text=Rishi Garhyan')
console.log('SDA supported:', await page.evaluate(() => CSS.supports('animation-timeline: scroll()')))
const dive = (d) => page.evaluate((x) => { const m = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo(0, m * x) }, d)
const op = (sel) => page.evaluate((s) => getComputedStyle(document.querySelector(s)).opacity, sel)
for (const [d, checks] of [
  [0.0,  [['.water-surface', 1], ['.marine-snow-wrap', 0], ['.rov-dark', 0]]],
  [0.30, [['.water-surface', 0], ['.plankton-wrap', 0]]],
  [0.55, [['.marine-snow-wrap', 0.7], ['.rov-dark', 0]]],
  [0.80, [['.rov-dark', 0.9]]],
]) {
  await dive(d)
  await page.waitForTimeout(350)
  for (const [sel, expect] of checks) {
    const v = Number(await op(sel))
    const pass = Math.abs(v - expect) < 0.08
    console.log(`depth ${d} ${sel}: ${v.toFixed(2)} (expect ~${expect}) ${pass ? 'OK' : 'FAIL'}`)
  }
}
console.log('errors:', errors.length === 0 ? 'NONE' : JSON.stringify(errors))
await browser.close()
