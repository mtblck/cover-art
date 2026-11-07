#!/usr/bin/env node
/**
 * Cuts a square version of a cover (for an Instagram post) as an SVG: a
 * 1000 × 1000 window of the 1600 × 1000 scene, shown at 1080 × 1080, with the
 * logo pill and npm pill moved back into the square's bottom corners.
 *
 *   node square.mjs cover.svg [more.svg …] [--center X] [--size 1080] [--out DIR]
 *
 * --center  the x of the cover to centre the square on (default the middle,
 *           800, which keeps x 300–1300). Use the focal point's x when it sits
 *           off centre; the window is kept inside the cover.
 * --size    the width and height the SVG declares (default 1080, Instagram's
 *           square post size); render.mjs renders the PNG at this size.
 *
 * Writes <name>-square.svg next to each cover (or into --out). The pills must
 * be the <g id="logo-pill"> and <g id="npm-pill"> groups logo_pill.py prints;
 * a cover without them is cut anyway, with a warning, and its pill may be lost.
 * No dependencies beyond Node 18.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}
const valued = new Set(['--center', '--size', '--out'].map((n) => args.indexOf(n) + 1).filter((i) => i > 0))
const files = args.filter((a, i) => a.endsWith('.svg') && !valued.has(i) && !a.endsWith('-square.svg'))
if (!files.length) {
  console.error('usage: node square.mjs cover.svg [more.svg …] [--center X] [--size 1080] [--out DIR]')
  process.exit(1)
}
const num = (name, fallback) => {
  const v = opt(name)
  if (v == null) return fallback
  const n = Number(v)
  if (!Number.isFinite(n) || (name === '--size' && n <= 0)) {
    console.error(`${name} needs a number, got ${JSON.stringify(v)}`)
    process.exit(1)
  }
  return n
}
const size = num('--size', 1080)
const center = num('--center', null)
const outDir = opt('--out') ? resolve(opt('--out')) : null
if (outDir) mkdirSync(outDir, { recursive: true })

const fmt = (n) => String(Math.round(n * 10) / 10)

// Adds translate(dx 0) in front of whatever transform the group's opening tag has.
function shift(svg, id, dx) {
  const re = new RegExp(`<g\\s+id="${id}"([^>]*)>`)
  const m = svg.match(re)
  if (!m) return [svg, false]
  let attrs = m[1]
  const t = attrs.match(/\stransform="([^"]*)"/)
  const move = `translate(${fmt(dx)} 0)`
  attrs = t ? attrs.replace(t[0], () => ` transform="${move} ${t[1]}"`) : `${attrs} transform="${move}"`
  return [svg.replace(re, () => `<g id="${id}"${attrs}>`), true]
}

let failed = false
for (const file of files) {
  const src = resolve(file)
  let svg = readFileSync(src, 'utf8')
  const root = svg.match(/<svg\b[^>]*>/)
  const vb = root && root[0].match(/viewBox="\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/)
  if (!vb) {
    console.error(`${file}: no viewBox on the root <svg>; skipped`)
    failed = true
    continue
  }
  const [vx, vy, W, H] = vb.slice(1).map(Number)
  if (W <= H) {
    console.error(`${file}: already ${W} × ${H}, not a landscape cover; skipped`)
    failed = true
    continue
  }
  const side = H
  const c = center ?? vx + W / 2
  const ox = Math.min(Math.max(c - side / 2, vx), vx + W - side)

  let tag = root[0].replace(vb[0], `viewBox="${fmt(ox)} ${fmt(vy)} ${side} ${side}"`)
  for (const [attr, val] of [['width', size], ['height', size]]) {
    const a = new RegExp(`\\s${attr}="[^"]*"`)
    tag = a.test(tag) ? tag.replace(a, ` ${attr}="${val}"`) : tag.replace(/^<svg\b/, `<svg ${attr}="${val}"`)
  }
  svg = svg.replace(root[0], () => tag)

  // The logo pill keeps its distance from the left edge, the npm pill from the right.
  let found
  ;[svg, found] = shift(svg, 'logo-pill', ox - vx)
  if (!found) console.error(`${file}: no <g id="logo-pill">; the pill is cut with the scene, so check the square`)
  ;[svg] = shift(svg, 'npm-pill', ox + side - (vx + W))

  const out = join(outDir ?? dirname(src), `${basename(src, '.svg')}-square.svg`)
  writeFileSync(out, svg)
  console.log(out)
}
process.exit(failed ? 1 : 0)
