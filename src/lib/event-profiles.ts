/** One event can belong to its physical venue and a travelling organiser. */
export function eventProfileIds(event: { venue_id: string; organiser_id?: string | null }): string[] {
  return [...new Set([event.venue_id, event.organiser_id].filter((id): id is string => Boolean(id)))]
}
