/** Monkey Business publishes bookable occurrences on Wix event-detail pages.
 * Its coming-soon page mentions a holiday return on 1 November, not a party.
 */
export function isMonkeyBusinessEventUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.replace(/^www\./, '') === 'monkeybusiness1.com' &&
      /^\/event-details\/[^/]+\/?$/.test(url.pathname)
  } catch { return false }
}
