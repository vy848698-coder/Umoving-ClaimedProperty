import { createError, getQuery, setHeader } from 'h3'

// Local-only design check: renders the certificate from query parameters, e.g.
// /api/certificate/preview?name=Alex%20Taylor&number=251&line1=24%20Oakfield%20Road&line2=Surbiton,%20KT6%206AS
// Not available in production builds.
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const q = getQuery(event)
  const text = (value: unknown, fallback: string) =>
    typeof value === 'string' ? value : fallback

  const image = await renderCertificate(
    {
      name: text(q.name, 'Alex Taylor'),
      founderNumber: Number(q.number) || 251,
      addressLine1: text(q.line1, '24 Oakfield Road'),
      addressLine2: text(q.line2, 'Surbiton, KT6 6AS'),
      claimedAt: text(q.date, new Date().toISOString()),
    },
    q.format === 'png' ? 'png' : 'jpeg',
  )

  setHeader(event, 'Content-Type', q.format === 'png' ? 'image/png' : 'image/jpeg')
  setHeader(event, 'Cache-Control', 'no-store')
  return image
})
