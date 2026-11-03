function normalHost(value: string) {
  return value.replace(/^www\./, '').toLowerCase()
}

function normalPath(value: string) {
  return value.replace(/\/+$/, '').toLowerCase() || '/'
}

// Heat's replacement first-party site lives below an account-specific Wix
// path. Root-level /events guesses are not pages on that site.
export function isHeatOfficialPage(pageUrl: string): boolean {
  try {
    const url = new URL(pageUrl)
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      url.hostname === 'chris37528.wixsite.com' &&
      (url.pathname === '/heat-sauna' || url.pathname.startsWith('/heat-sauna/'))
  } catch { return false }
}

/**
 * Some directory venue pages link to a site-wide events calendar. That
 * calendar is not scoped to the venue and must never be attributed to it.
 *
 * `null` means this source is not one of the directory pages handled here;
 * callers can continue with their normal host policy. A boolean is a final
 * decision for a recognised directory source.
 */
export function scopedDirectoryVenuePageDecision(sourceUrl: string, pageUrl: string): boolean | null {
  try {
    const source = new URL(sourceUrl)
    const sourceHost = normalHost(source.hostname)
    const sourcePath = normalPath(source.pathname)

    if (source.protocol !== 'https:' || sourceHost !== 'gaysaunaguide.net' ||
        !/^\/venue\/[^/]+$/.test(sourcePath)) return null

    const target = new URL(pageUrl, sourceUrl)
    return target.protocol === 'https:' &&
      normalHost(target.hostname) === sourceHost &&
      normalPath(target.pathname) === sourcePath
  } catch {
    return false
  }
}
