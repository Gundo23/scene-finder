export type ScrapeSource = {
  venue_id: string
  last_checked: string | null
}

export type VenueHealth = {
  venue_id: string
  visible_future_count: number
  last_future_event_date: string | null
}

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

/**
 * At a ten-minute cadence there are 144 requests a day. Allowing for one
 * priority request in twelve leaves 132 oldest-first slots; use 120 for
 * headroom. Increase a one-venue batch when the active queue outgrows that.
 */
export function dailyCoverageBatchSize(activeVenues: number, requestedBatchSize: number) {
  return Math.max(requestedBatchSize, activeVenues > 120 ? 2 : 1)
}

/**
 * Eleven slots out of twelve remain oldest-first, so every active venue gets
 * its turn. The twelfth slot can bring urgent calendars forward.
 */
export function selectVenueIds(
  sources: ScrapeSource[], health: VenueHealth[], maxVenues: number,
  now: Date, prioritySlot: boolean, minimumRefreshAgeMs = 0
): string[] {
  const oldestByVenue = new Map<string, number>()
  for (const source of sources) {
    const checked = source.last_checked ? Date.parse(source.last_checked) : NaN
    const timestamp = Number.isFinite(checked) ? checked : -Infinity
    oldestByVenue.set(source.venue_id,
      Math.min(oldestByVenue.get(source.venue_id) ?? Infinity, timestamp))
  }

  const healthByVenue = new Map(health.map((item) => [item.venue_id, item]))
  const isUrgent = (venueId: string) => {
    const item = healthByVenue.get(venueId)
    if (!item) return false
    const age = now.getTime() - oldestByVenue.get(venueId)!
    if (item.visible_future_count === 0) return age >= 4 * HOUR
    if (item.last_future_event_date && item.visible_future_count <= 2) {
      const runway = Date.parse(`${item.last_future_event_date}T23:59:59Z`) - now.getTime()
      return runway >= 0 && runway <= 14 * DAY && age >= 12 * HOUR
    }
    return false
  }

  // Leave recently attempted venues alone on routine slots. A priority slot
  // may still retry an empty or nearly expired calendar earlier. Missing
  // timestamps remain due immediately so new sources are not delayed.
  const oldest = [...oldestByVenue.keys()]
    .filter((venueId) =>
      now.getTime() - oldestByVenue.get(venueId)! >= minimumRefreshAgeMs ||
      (prioritySlot && isUrgent(venueId)))
    .sort((a, b) => oldestByVenue.get(a)! - oldestByVenue.get(b)!)
  if (!prioritySlot) return oldest.slice(0, maxVenues)

  const priority = oldest.filter(isUrgent)

  // Empty venues go first, then venues close to running out. Oldest within
  // each group wins, preventing one repeatedly failing source monopolising it.
  priority.sort((a, b) => {
    const aEmpty = healthByVenue.get(a)!.visible_future_count === 0
    const bEmpty = healthByVenue.get(b)!.visible_future_count === 0
    return Number(bEmpty) - Number(aEmpty) ||
      oldestByVenue.get(a)! - oldestByVenue.get(b)!
  })
  return [...new Set([...priority, ...oldest])].slice(0, maxVenues)
}

export function isPrioritySlot(now: Date) {
  return Math.floor(now.getTime() / (10 * 60 * 1000)) % 12 === 0
}
