import { cleanText } from '@/lib/cleanText'

export function shouldShowPublicVenue(venue: {
  name?: string | null
  category?: string | null
  status?: string | null
}) {
  const name = cleanText(venue.name || '').toLowerCase()
  const category = cleanText(venue.category || '').toLowerCase()
  const status = cleanText(venue.status || '').toLowerCase()
  const blockedStatuses = [
    'tbc',
    'closed',
    'inactive',
    'removed',
    'deleted',
    'permanently closed',
    'permanent closed',
  ]
  if (blockedStatuses.includes(status)) return false
  if (category.includes('lead')) return false
  if (status.includes('lead')) return false
  if (name.startsWith('about ')) return false
  if (name === 'about us') return false
  if (name === 'adult club') return false
  if (name.endsWith(' social lead')) return false
  if (name.includes('/ social lead')) return false
  if (name.includes('swingers club lead')) return false
  if (name.includes('kink munch / social lead')) return false
  return true
}
