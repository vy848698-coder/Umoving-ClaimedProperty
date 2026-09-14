import type { Image, SKRSContext2D } from '@napi-rs/canvas'

// Founding Homeowner certificate: the blank artwork (server/assets/certificate/
// template.png, 2430x2590) with the owner's details drawn into the four spaces
// left for them. Positions and sizes were matched against the original design.

export interface CertificateData {
  name: string
  founderNumber: number
  addressLine1: string
  addressLine2?: string
  joinedAt: Date | string
}

const NAVY = '#0A0F33'

// All coordinates are template pixels; every field is centred on `cx`.
const LAYOUT = {
  cx: 1210,
  // Sacramento is lighter than the original signature face, so a hairline
  // stroke in the same colour brings it up to the same weight. maxWidth keeps
  // long names clear of the confetti on the left and the seal on the right.
  name: { baseline: 1012, size: 206, min: 64, maxWidth: 1000, stroke: 2.4 },
  number: { baseline: 1454, size: 134, gradientTop: 1360, from: '#D4A840', to: '#8A5F0A' },
  address: { baselines: [1600, 1652] as const, size: 44, min: 32, maxWidth: 1060 },
  date: { baseline: 1786, size: 37, tracking: 0.24 },
}

const FONTS: Array<[file: string, family: string]> = [
  ['Sacramento-400.ttf', 'Sacramento'],
  ['DMSerifDisplay-400.ttf', 'DM Serif Display'],
  ['Lora-400.ttf', 'Lora'],
  ['Lora-500.ttf', 'Lora Medium'],
]

// The canvas library is a native add-on. Load it on first use rather than at
// server start, so routes that never draw a certificate never load it - the
// dev server reloads its worker on every server-file change.
let canvasLib: Promise<typeof import('@napi-rs/canvas')> | null = null
const loadCanvasLib = () => (canvasLib ??= import('@napi-rs/canvas'))

let templateReady: Promise<Image> | null = null

// Fonts and artwork are loaded once per server instance.
function loadTemplate(): Promise<Image> {
  templateReady ??= (async () => {
    const { GlobalFonts, loadImage } = await loadCanvasLib()
    // server/assets is bundled by Nuxt as `assets:server`; subfolders become
    // ':'-separated key prefixes.
    const assets = useStorage('assets:server')
    for (const [file, family] of FONTS) {
      const data = await assets.getItemRaw(`certificate:${file}`)
      if (!data) throw new Error(`Certificate font missing: server/assets/certificate/${file}`)
      GlobalFonts.register(Buffer.from(data as Uint8Array), family)
    }
    const template = await assets.getItemRaw('certificate:template.png')
    if (!template) throw new Error('Certificate template missing: template.png')
    return loadImage(Buffer.from(template as Uint8Array))
  })().catch((err) => {
    templateReady = null
    throw err
  })
  return templateReady
}

export function formatFounderNumber(n: number): string {
  return `#${String(Math.max(0, Math.trunc(n))).padStart(6, '0')}`
}

// "10 SEPTEMBER 2026", in UK time so a late-evening claim keeps its UK date.
export function formatJoinedDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  const safe = Number.isNaN(date.getTime()) ? new Date() : date
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  })
    .format(safe)
    .toUpperCase()
}

const clean = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

// Largest size (down to `min`) at which every line fits `maxWidth`.
function fitSize(
  ctx: SKRSContext2D,
  lines: string[],
  font: (size: number) => string,
  size: number,
  min: number,
  maxWidth: number,
  width: (m: TextMetrics) => number = (m) => m.width,
): number {
  let s = size
  const fits = () => {
    ctx.font = font(s)
    return lines.every((t) => width(ctx.measureText(t) as TextMetrics) <= maxWidth)
  }
  while (s > min && !fits()) s -= 2
  ctx.font = font(s)
  return s
}

// Letter-spaced text drawn glyph by glyph, centred on cx.
function fillTracked(ctx: SKRSContext2D, text: string, cx: number, y: number, spacing: number) {
  const chars = [...text]
  const widths = chars.map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let x = cx - total / 2
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y)
    x += widths[i]! + spacing
  })
}

// Surname particles that stay lowercase unless they start the name.
const NAME_PARTICLES = new Set(['de', 'da', 'di', 'du', 'del', 'della', 'der', 'den', 'van', 'von', 'la', 'le', 'bin', 'binti'])

// Script capitals are ornate swashes, so capitals typed in a row ("VIVEK",
// "McDONALD") become an unreadable run of loops. Each part of a name - split on
// spaces, hyphens and apostrophes - is set in title case when it is shouted
// (two or more capitals in a row) or all lowercase. Anything else is the
// owner's own spelling and is kept: "McDonald", "DeShawn", initials "J.R.".
function formatNamePart(part: string): string {
  const letters = part.replace(/[^\p{L}]/gu, '')
  if (!letters) return part
  const shouted = /\p{Lu}{2,}/u.test(part)
  const lower = letters === letters.toLowerCase()
  if (!shouted && !lower) return part
  const titled = part.toLowerCase().replace(/\p{L}/u, (ch) => ch.toUpperCase())
  // Mc names keep their inner capital: "MCDONALD" -> "McDonald".
  return titled.replace(/^(\P{L}*Mc)(\p{Ll})/u, (_, prefix: string, ch: string) => prefix + ch.toUpperCase())
}

export function formatCertificateName(raw: string): string {
  return clean(raw)
    .split(' ')
    .map((word, i) => {
      if (i > 0 && NAME_PARTICLES.has(word.toLowerCase()) && !/\p{Lu}.*\p{Ll}/u.test(word)) {
        return word.toLowerCase()
      }
      return word
        .split(/([-'’])/)
        .map((piece, j) => (j % 2 ? piece : formatNamePart(piece)))
        .join('')
    })
    .join(' ')
}

export async function renderCertificate(
  data: CertificateData,
  format: 'jpeg' | 'png' = 'jpeg',
): Promise<Buffer> {
  const template = await loadTemplate()
  const { createCanvas } = await loadCanvasLib()
  const canvas = createCanvas(template.width, template.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(template, 0, 0)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  const L = LAYOUT

  // Name. Sacramento's capital swashes reach past the advance width, so the
  // name is fitted and centred on its real ink bounds.
  const name = formatCertificateName(data.name)
  const ink = (m: TextMetrics) => m.actualBoundingBoxLeft + m.actualBoundingBoxRight
  fitSize(ctx, [name], (s) => `${s}px Sacramento`, L.name.size, L.name.min, L.name.maxWidth, ink)
  const nm = ctx.measureText(name) as TextMetrics
  const nameX = L.cx - ink(nm) / 2 + nm.actualBoundingBoxLeft
  ctx.fillStyle = NAVY
  ctx.strokeStyle = NAVY
  ctx.lineWidth = L.name.stroke
  ctx.lineJoin = 'round'
  ctx.fillText(name, nameX, L.name.baseline)
  ctx.strokeText(name, nameX, L.name.baseline)

  ctx.textAlign = 'center'

  // Founder number, in a vertical gold gradient.
  ctx.font = `${L.number.size}px "DM Serif Display"`
  const gold = ctx.createLinearGradient(0, L.number.gradientTop, 0, L.number.baseline)
  gold.addColorStop(0, L.number.from)
  gold.addColorStop(1, L.number.to)
  ctx.fillStyle = gold
  ctx.fillText(formatFounderNumber(data.founderNumber), L.cx, L.number.baseline)

  // Address: both lines share one size so they read as a block; a single line
  // sits midway between the two baselines.
  const lines = [clean(data.addressLine1), clean(data.addressLine2)].filter(Boolean)
  if (lines.length) {
    fitSize(ctx, lines, (s) => `${s}px Lora`, L.address.size, L.address.min, L.address.maxWidth)
    ctx.fillStyle = NAVY
    const [b1, b2] = L.address.baselines
    const baselines = lines.length === 1 ? [Math.round((b1 + b2) / 2)] : [b1, b2]
    lines.forEach((t, i) => ctx.fillText(t, L.cx, baselines[i]!))
  }

  // Joined date, tracked capitals.
  ctx.textAlign = 'left'
  ctx.font = `${L.date.size}px "Lora Medium"`
  ctx.fillStyle = NAVY
  fillTracked(
    ctx,
    formatJoinedDate(data.joinedAt),
    L.cx,
    L.date.baseline,
    Math.round(L.date.size * L.date.tracking),
  )

  return format === 'png' ? canvas.encode('png') : canvas.encode('jpeg', 86)
}
