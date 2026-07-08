export function cleanText(text: string | null | undefined) {
  if (!text) return ''

  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')

    .replace(/&#038;/g, '&')
    .replace(/&amp;/gi, '&')

    .replace(/&pound;/gi, '£')
    .replace(/&#163;/g, '£')

    .replace(/&euro;/gi, '€')
    .replace(/&#8364;/g, '€')

    .replace(/&dollar;/gi, '$')
    .replace(/&#36;/g, '$')

    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&apos;/gi, "'")

    .replace(/&quot;/gi, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')

    .replace(/&mdash;/gi, '—')
    .replace(/&#8212;/g, '—')

    .replace(/&ndash;/gi, '-')
    .replace(/&#8211;/g, '-')

    .replace(/&rarr;/gi, '→')
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')

    .replace(/\s+/g, ' ')
    .trim()
}

export type CleanEventNameResult =
  | {
      ok: true
      eventName: string
    }
  | {
      ok: false
      reason: string
    }

function stripBadPrefixes(text: string) {
  return text
    // Quest-style broken scrape prefixes: "y -Bi Tuesdays", "e – Red Light..."
    .replace(/^\s*[ey]\s*[–—-]+\s*/i, '')
    // Ecclesia-style leading dash
    .replace(/^\s*[–—-]+\s*/, '')
    // Decadance-style leading slash
    .replace(/^\s*\/+\s*/, '')
    .trim()
}

function stripBadSuffixes(text: string) {
  return text
    // SHH repeated suffix
    .replace(/\s*[—-]\s*Shhh\.\.\.$/i, '')
    // dangling punctuation from bad scrapes
    .replace(/\s*[–—:-]+\s*$/g, '')
    .trim()
}

function isGenericJunkTitle(text: string) {
  const value = text.trim().toLowerCase()

  return [
    'tickets',
    'events',
    'event',
    'upcoming events',
    "what's on",
    'whats on',
    'what’s on',
    'get in touch',
    'view all events',
    'more info',
    'book now',
    'event partners:',
    'next →',
  ].includes(value)
}

function isDayOnlyTitle(text: string) {
  return [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ].includes(text.trim().toLowerCase())
}

function isGarbageTitle(text: string) {
  // Base64 / encoded junk
  if (/[A-Za-z0-9+/]{80,}={0,2}/.test(text)) return true

  // CSS / HTML / builder junk
  if (
    /(wp-|elementor|container|stylesheet|font-size|margin|padding|rgba|\.tb-|data-|class=|<[^>]+>)/i.test(
      text
    )
  ) {
    return true
  }

  // Known non-event scrape fragments
  if (/^list your event on gay saunas/i.test(text)) return true
  if (/^before you arrive - prices vary by night and visitor type/i.test(text)) return true
  if (/^bocoran &$/i.test(text)) return true
  if (/s suck/i.test(text)) return true
  if (/motd>/i.test(text)) return true

  // Hellfire testimonial fragments
  if (
    /^[a-z]/.test(text) &&
    /recommend|friendly|returning|looking forward|owner of a great club/i.test(text)
  ) {
    return true
  }

  return false
}

function titleCaseDay(text: string) {
  const value = text.trim().toLowerCase()
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function cleanEventName(
  rawEventName: string | null | undefined,
  venueName?: string | null
): CleanEventNameResult {
  if (!rawEventName || !rawEventName.trim()) {
    return {
      ok: false,
      reason: 'empty event name',
    }
  }

  const original = rawEventName

  let eventName = cleanText(rawEventName)
  eventName = stripBadPrefixes(eventName)

  if (!eventName) {
    return {
      ok: false,
      reason: 'event name empty after cleanup',
    }
  }

  if (isGarbageTitle(eventName)) {
    return {
      ok: false,
      reason: 'garbage / non-event scrape fragment',
    }
  }

  if (isGenericJunkTitle(eventName)) {
    return {
      ok: false,
      reason: 'generic navigation / CTA title',
    }
  }

  // Fix generic page heading instead of inserting it raw.
  if (/^what('|’)?s on at /i.test(eventName)) {
    if (venueName && venueName.trim()) {
      eventName = `${cleanText(venueName)} Club Night`
    } else {
      return {
        ok: false,
        reason: 'generic whats-on heading',
      }
    }
  }

  // A day on its own looks terrible on the site.
  if (isDayOnlyTitle(eventName)) {
    if (venueName && venueName.trim()) {
      eventName = `${titleCaseDay(eventName)} at ${cleanText(venueName)}`
    } else {
      return {
        ok: false,
        reason: 'day-only event title',
      }
    }
  }

  eventName = stripBadSuffixes(eventName)
  eventName = cleanText(eventName)

  if (!eventName || eventName.length < 3) {
    return {
      ok: false,
      reason: 'event name too short after cleanup',
    }
  }

  if (eventName.length > 120) {
    return {
      ok: false,
      reason: 'event name too long / likely bad scrape',
    }
  }

  if (eventName !== original) {
    console.log('[event-cleaner] cleaned event name', {
      from: original,
      to: eventName,
    })
  }

  return {
    ok: true,
    eventName,
  }
}