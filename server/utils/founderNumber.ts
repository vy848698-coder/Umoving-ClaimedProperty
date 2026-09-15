// Founding Homeowner numbers: one per user, handed out in order, never
// reused. Backed by the umu-backend (Postgres, via a DB-native serial
// column - see umu-backend prisma/schema.prisma FounderNumber.number) so
// it's actually persistent in production, unlike the local-filesystem
// devStorage this used to use (fine in dev, but Vercel's serverless
// functions have no shared disk - every request could land on a fresh
// instance, so numbers and join dates were never stable there). Putting it
// on the backend also means the mobile app can read the same number later
// without this being rebuilt a second time.

export interface FounderRecord {
  number: number
  assignedAt: string
  // True only on the request that first creates this user's record - the
  // one moment the "here's your certificate" email should fire, not on
  // every later /certificate page view.
  isNew: boolean
}

export async function getOrAssignFounderNumber(
  backendBase: string,
  auth: string,
): Promise<FounderRecord> {
  const record = await $fetch<{ number: number; assignedAt: string; isNew: boolean }>(
    `${backendBase}/profile/founder-number`,
    { headers: { Authorization: auth } },
  )
  return { number: record.number, assignedAt: record.assignedAt, isNew: record.isNew }
}
