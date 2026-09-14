// Founding Homeowner numbers: one per user, handed out in order, never reused.
//
// Stored in the `founders` storage mount - a JSON file per key under .data/
// on the local dev server (see nitro.devStorage in nuxt.config.ts).
// Production needs a persistent store with an atomic counter (e.g. Upstash
// Redis INCR) mounted as `founders` before launch: serverless instances have
// no shared disk, and the lock below only covers a single server process.

export interface FounderRecord {
  number: number
  assignedAt: string
}

let queue: Promise<unknown> = Promise.resolve()

// Serialise assignments so two requests can't read the same counter value.
function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.catch(() => undefined)
  return run
}

// Storage keys use ':' as a path separator; keep ids to safe characters.
const userKey = (userId: string) => `user:${userId.replace(/[^A-Za-z0-9_-]/g, '_')}`

export function getOrAssignFounderNumber(userId: string): Promise<FounderRecord> {
  return exclusive(async () => {
    const store = useStorage('founders')
    const key = userKey(userId)

    const existing = await store.getItem<FounderRecord>(key)
    if (existing?.number) return existing

    const next = (Number(await store.getItem('counter')) || 0) + 1
    const record: FounderRecord = { number: next, assignedAt: new Date().toISOString() }
    await store.setItem('counter', next)
    await store.setItem(key, record)
    return record
  })
}
