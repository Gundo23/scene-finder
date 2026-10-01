export function isOfficialSweetWednesdayCalendarEvent(input: {
  venueId: string | null | undefined
  title: string | null | undefined
  eventDate: string | null | undefined
  ticketUrl: string | null | undefined
}) {
  if (input.venueId !== 'sweet_wednesday_london' ||
      input.title?.trim().toLowerCase() !== 'sweet wednesday' ||
      !/^20\d{2}-\d{2}-\d{2}$/.test(input.eventDate || '')) return false

  try {
    const url = new URL(input.ticketUrl || '')
    return url.hostname.replace(/^www\./, '').toLowerCase() === 'sweetwednesday.co.uk' &&
      url.pathname.replace(/\/+$/, '').toLowerCase() === '/about' &&
      !url.search
  } catch {
    return false
  }
}
