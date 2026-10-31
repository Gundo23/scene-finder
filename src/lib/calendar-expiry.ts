type EventEvidence = { event_id?: unknown; event_date?: unknown; is_published?: unknown }

/** Require a recent snapshot to prove that every formerly upcoming row merely
 * crossed yesterday's date boundary and is still published without alteration. */
export function isNaturalCalendarExpiry(input: {
  today: string
  now: Date
  lastCompletedSuccess: string | null
  latestSourceAttempt: string | null
  snapshot: { created_at?: unknown; events_json?: unknown } | null
  currentEvents: EventEvidence[]
}) {
  const midnight = new Date(`${input.today}T12:00:00Z`)
  if (!Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== input.today) return false
  midnight.setUTCDate(midnight.getUTCDate() - 1)
  const yesterday = midnight.toISOString().slice(0, 10)
  const success = Date.parse(input.lastCompletedSuccess || '')
  const attempt = Date.parse(input.latestSourceAttempt || '')
  const snapshotAt = Date.parse(String(input.snapshot?.created_at || ''))
  const fresh = (at: number) => Number.isFinite(at) && at <= input.now.getTime() &&
    input.now.getTime() - at <= 48 * 60 * 60 * 1000
  if (!fresh(success) || !fresh(snapshotAt) || (Number.isFinite(attempt) && attempt > success) ||
      !Array.isArray(input.snapshot?.events_json)) return false
  const prior = input.snapshot.events_json as EventEvidence[]
  if (prior.some(row => !row || typeof row !== 'object')) return false
  const upcoming = prior.filter(row => row.is_published === true &&
    (typeof row.event_date !== 'string' || row.event_date >= yesterday))
  if (!upcoming.length || upcoming.some(row => row.event_date !== yesterday ||
      typeof row.event_id !== 'string')) return false
  const current = input.currentEvents
  if (current.length !== upcoming.length || current.some(row => row.event_date !== yesterday ||
      row.is_published !== true || typeof row.event_id !== 'string')) return false
  const ids = new Set(upcoming.map(row => row.event_id))
  return ids.size === upcoming.length && new Set(current.map(row => row.event_id)).size === current.length &&
    current.every(row => ids.has(row.event_id))
}
