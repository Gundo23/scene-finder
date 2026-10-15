/** Historical locations and unconfirmed directory leads have no live calendar obligation. */
export function monitorsEventCalendar(locationKind: string | null | undefined) {
  return !['closed', 'lead'].includes((locationKind || '').trim().toLowerCase())
}
