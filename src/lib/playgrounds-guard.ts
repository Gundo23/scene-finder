/** Generic Wix navigation and prose fragments observed beside an actual party card. */
export function isPlaygroundsNavigationTitle(venueId: string, title: string) {
  if (venueId !== 'the_playgrounds_cleckheaton') return false
  const normalized = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  return normalized === 'book tickets here' ||
    normalized === 'the playgrounds' ||
    normalized === 'r to a new'
}
