import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_SOURCES = 80
const MAX_PAGES_PER_SOURCE = 8
const MAX_EVENTS_RETURNED = 150
const FETCH_TIMEOUT_MS = 20000

const EVENT_KEYWORDS = [
  'event',
  'events',
  'ticket',
  'tickets',
  'party',
  'club night',
  'night',
  'social',
  'munch',
  'calendar',
  'whats-on',
  'whatson',
  'workshop',
  'fetish',
  'kink',
  'swing',
  'swingers',
  'play party',
  'theme night',
  'newbie',
  'couples',
  'members night',
]

const STRONG_UNDATED_EVENT_KEYWORDS = [
  'party',
  'night',
  'social',
  'ball',
  'takeover',
  'weekend',
  'swing',
  'swingers',
  'fetish',
  'kink',
  'munch',
  'club night',
  'play party',
  'newbie',
  'couples',
  'bi party',
  'greedy girls',
  'hotwife',
  'hot wife',
  'bachelor',
  'bachelors',
  'ladies night',
  'sauna night',
  'meet',
  'meetup',
  'meet up',
  'workshop',
  'event',
]

const PAGE_HINTS = [
  '/events',
  '/event',
  '/calendar',
  '/whats-on',
  '/whatson',
  '/tickets',
  '/club-nights',
  '/parties',
  '/party',
  '/event-type',
]

const JUNK_URL_PARTS = [
  '/contact',
  '/contact-us',
  '/privacy',
  '/privacy-policy',
  '/cookie',
  '/cookies',
  '/terms',
  '/terms-and-conditions',
  '/faq',
  '/faqs',
  '/about',
  '/about-us',
  '/gallery',
  '/photos',
  '/login',
  '/log-in',
  '/register',
  '/sign-up',
  '/account',
  '/membership',
  '/memberships',
  '/etiquette',
  '/dress-code',
  '/accommodation',
  '/directions',
  '/location',
  '/opening-times',
  '/rules',
  '/links',
  '/testimonials',
  '/blog',
  '/news',
  '/shop',
  '/cart',
  '/checkout',
  '/basket',
  '/fetish-guide',
  '/fetish-membership',
  '/fetish-events-and-cost',
  '/hotels',
  '/hotel',
  '/private-hire',
  '/venue-hire',
  '/price-list',
  '/prices',
  '/bar-price',
  '/entry-price',
  '/weekly-lineup',
  '/regular-weekly-lineup',
  '/photo-gallery',
  '/how-to-get-here',
  '/accessibility',
  '/disabilities',
  '/feedback',
  '/wp-login',
  '?ical=1',
  '/?ical=1',
]

const JUNK_TITLES = [
  'book now',
  'booking',
  'join guestlist',
  'guestlist',
  'get in touch',
  'contact',
  'contact us',
  'view all events',
  'view events',
  'all events',
  'events',
  'home',
  'about',
  'about us',
  'gallery',
  'privacy',
  'privacy policy',
  'cookies',
  'cookie policy',
  'terms',
  'terms and conditions',
  'legal',
  'legal privacy policy terms and conditions',
  'login',
  'log in',
  'register',
  'sign up',
  'menu',
  'read more',
  'find this book',
  'create account',
  'edit',
  'watch',
  'history',
  'faq',
  'faqs',
  'frequently asked questions',
  'membership',
  'memberships',
  'rules',
  'club rules',
  'club rules and your safety',
  'club rules and looking after your safety',
  'etiquette',
  'dress code',
  'accommodation',
  'directions',
  'location',
  'opening times',
  'testimonials',
  'links',
  'book hotel',
  'book hotel room',
  'hotel room',
  'hotels',
  'hotels in the area',
  'quick book',
  'join guest list',
  'find out more',
  'more info',
  'view event',
  'view event 8594',
  'untitled event',
  'fetish guide',
  'google calendar',
  'add to icalendar',
  'add to calendar',
  'icalendar',
  'venue hire',
  'room hire',
  'private hire',
  'host an event',
  'full entry and bar price list',
  'entry and bar price list',
  'price list',
  'regular weekly lineup',
  'weekly lineup',
  'skip to main content',
  'feedback',
  'guide for customers with disabilities',
  'customers with disabilities and extra needs',
  'customers with diaabilities and extra needs',
  'continue to our home page',
  'how to get here',
  'need to know before visiting',
  'introduction to the club',
  'common misconceptions of a swingers club',
  'see what we have got at decadance',
  'let us show you everything photo gallery',
  'i have read the text above am over and wish to enter this site',
  'instagram',
  'facebook',
  'facebook f',
  'facebook-f',
  'twitter',
  'linkedin',
  'linked in',
  'whatsapp',
  'telegram',
  'email',
  'share',
  'share this',
  'share event',
  'share on facebook',
  'share on twitter',
  'share on linked in',
  'share on linkedin',
  'view on facebook',
  'number sauna',
  'days hours ago',
  'outlook live',
  'outlook 365',
  'office 365',
  'crack open the door',
  'give me the detail',
  'the nights',
  'ticket office',
  'v2v books',
  'hosted party to be confirmed',
  'newsletter',
  'subscribe',
  'gallery click the photo',
  'click the photo',
  'view details',
  'details',
  'event diary',
  'party pics',
  'comments',
  'book an event',
  'book event via timetable',
  'see our whats on page',
  'full calendar',
  'view this event',
  'view this event click here',
  'click here',
  'leave a reply',
  'cancel reply',
]

const BAD_EVENT_PATTERNS = [
  'book hotel',
  'hotel room',
  'quick book',
  'accommodation',
  'membership',
  'join now',
  'contact us',
  'privacy policy',
  'cookie policy',
  'terms and conditions',
  'venue hire',
  'room hire',
  'private hire',
  'host an event',
  'fetish guide',
  'fetish membership',
  'fetish events and cost',
  'add to icalendar',
  'add to calendar',
  'google calendar',
  'view full event description here',
  'show events search',
  'skip to main content',
  'feedback',
  'full entry and bar price list',
  'entry and bar price list',
  'price list',
  'regular weekly lineup',
  'weekly lineup',
  'club rules',
  'looking after your safety',
  'guide for customers',
  'customers with disabilities',
  'customers with diaabilities',
  'legal privacy policy',
  'continue to our home page',
  'how to get here',
  'photo gallery',
  'private hire',
  'share on facebook',
  'share on twitter',
  'share on linked in',
  'share on linkedin',
  'view on facebook',
  'facebook',
  'twitter',
  'linkedin',
  'whatsapp',
  'instagram',
  'log in',
  'days hours ago',
  'outlook live',
  'outlook 365',
  'office 365',
  'crack open the door',
  'give me the detail',
  'the nights',
  'ticket office',
  'v2v books',
  'hosted party to be confirmed',
  'newsletter',
  'subscribe',
  'gallery click the photo',
  'click the photo',
  'view details',
  'details',
  'event diary',
  'party pics',
  'comments',
  'book an event',
  'book event via timetable',
  'see our whats on page',
  'full calendar',
  'view this event',
  'view this event click here',
  'click here',
  'leave a reply',
  'cancel reply',
]


const TBC_VENUE_BLACKLIST = [
  'acqua_sauna_blackpool',
  'club_play_blackpool',
  'ggs_lounge_runcorn',
  'our_place_4_fun_london',
  'pennine_sauna_oldham_shaw',
  'purple_mamba_club_nottingham_west_bridgford',
  'swindon_swingers_swindon',
  'torture_garden_london_uk_events',
  'townhouse_wirral_near_liverpool',
]

const TBC_EVENT_NAME_BLACKLIST = [
  'and open until blackpool nights run later at acqua with free pass outs and full facility access',
  'manchester swingers club',
  'monthly blackpool fisters a consent led fetish event with practical notes for experienced players and curious newcomers',
  'when and until member late night entry is from non members pay',
  'couples orgy room',
  'the kink room',
  'wet social',
  'bdsm kink room',
  'bocoran event',
  'club nights',
  'swingers club bury',
  'singles night',
  'lifestyle workshops',
  'fab swindon swingers',
  'swindonswingers',
  'new tg social app',
  'couples ladies non binary gender diverse guests',
]

const BAD_IMAGE_PATTERNS = [
  'favicon',
  'logo',
  'icon',
  'avatar',
  'placeholder',
  'default',
  'blank',
  'spacer',
  'transparent',
  'watermark',
  'header',
  'banner',
  'site-logo',
  'cropped-logo',
  'hamburger',
  'menu',
  'footer_social',
  'facebook.com/tr',
  '1x1.jpg',
]

const TOWNHOUSE_EVENT_SEED_PATHS = [
  '/events/the-wirral-munch-bdsm-social-and-play-event-8/',
  '/events/wirral-swinging-social/',
  '/events/newbies-notsos-swinging-party-19/',
  '/events/newbies-and-notsos-swinging-saturday-with-live-music-3/',
  '/events/ruby-slippers-all-female-party-its-hot/',
  '/events/lust-the-ultimate-gangbang-and-cuck-event-for-swingers-5/',
  '/events/tootsies-foot-fetish-event-7/',
  '/events/school-of-kink-learn-your-bdsm-craft/',
  '/events/stretch-6/',
  '/events/new-years-eve-swinging-party-2/',
]

function cleanText(value: string | null | undefined) {
  if (!value) return ''

  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&laquo;/g, '')
    .replace(/&raquo;/g, '')
    .replace(/&#171;/g, '')
    .replace(/&#187;/g, '')
    .replace(/&#39;/g, "'")
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function absoluteUrl(base: string, href: string | null | undefined) {
  if (!href) return null

  if (
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#') ||
    href.startsWith('javascript:') ||
    href.startsWith('data:')
  ) {
    return null
  }

  try {
    return new URL(href, base).toString()
  } catch {
    return null
  }
}

function sameDomain(a: string, b: string) {
  try {
    return (
      new URL(a).hostname.replace(/^www\./, '') ===
      new URL(b).hostname.replace(/^www\./, '')
    )
  } catch {
    return false
  }
}

function isJunkUrl(url: string) {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.toLowerCase()
    const full = url.toLowerCase()

    if (full.includes('google.com/calendar') && !full.includes('/calendar/ical/')) return true
    if (full.includes('action=template')) return true
    if (full.includes('ical=1') && !full.includes('/calendar/ical/')) return true
    if (full.includes('/wp-json/')) return true
    if (full.includes('/feed/')) return true
    if (full.includes('facebook.com/sharer')) return true
    if (full.includes('twitter.com/share')) return true
    if (full.includes('x.com/share')) return true
    if (full.includes('linkedin.com/share')) return true
    if (full.includes('linkedin.com/sharing')) return true
    if (full.includes('api.whatsapp.com/send')) return true
    if (full.includes('whatsapp://send')) return true
    if (full.includes('mailto:')) return true
    if (full.includes('#respond')) return true
    if (full.includes('/comments/')) return true

    return JUNK_URL_PARTS.some((part) => path.includes(part) || full.includes(part))
  } catch {
    return true
  }
}

function looksLikeEvent(value: string) {
  const lower = value.toLowerCase()
  return EVENT_KEYWORDS.some((keyword) => lower.includes(keyword))
}

function looksLikeUsefulPage(value: string) {
  const lower = value.toLowerCase()
  return PAGE_HINTS.some((hint) => lower.includes(hint)) || looksLikeEvent(lower)
}

function normalizeTitle(value: string) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function validDateOrNull(value: string | null) {
  if (!value) return null
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(value)) return null

  const [year, month, day] = value.split('-').map(Number)
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null

  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return value
}

function validTimeOrNull(value: string | null) {
  if (!value) return null
  if (!/^\d{2}:\d{2}$/.test(value)) return null

  const [hour, minute] = value.split(':').map(Number)
  if (hour < 0 || hour > 23) return null
  if (minute < 0 || minute > 59) return null

  return value
}

function eventUrlWithAnchor(pageUrl: string, eventName: string) {
  const anchor = normalizeTitle(eventName).replace(/\s+/g, '-')
  return `${pageUrl.split('#')[0]}#${encodeURIComponent(anchor)}`
}

function isJunkTitle(title: string) {
  const cleaned = normalizeTitle(title)

  if (!cleaned) return true
  if (cleaned.length < 6) return true
  if (cleaned.includes('<') || cleaned.includes('>')) return true
  if (cleaned.includes('")')) return true
  if (/^\d+$/.test(cleaned)) return true
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)$/i.test(cleaned)) return true

  if (cleaned.startsWith('add to ')) return true
  if (cleaned.startsWith('google calendar')) return true
  if (cleaned.startsWith('icalendar')) return true
  if (cleaned === 'untitled event') return true
  if (cleaned === 'cancel reply') return true
  if (cleaned === 'leave a reply') return true
  if (cleaned === 'reply') return true
  if (cleaned === 'view this event') return true
  if (cleaned === 'view this event click here') return true
  if (cleaned === 'click here') return true
  if (cleaned === 'read more') return true
  if (cleaned === 'whats on') return true
  if (cleaned === 'what s on') return true

  // Social share buttons, hashtags and internal post IDs are never events.
  if (cleaned.startsWith('share on ')) return true
  if (cleaned.startsWith('view on facebook')) return true
  if (cleaned.startsWith('facebook')) return true
  if (cleaned.startsWith('twitter')) return true
  if (cleaned.startsWith('linkedin')) return true
  if (cleaned.startsWith('linked in')) return true
  if (cleaned.startsWith('whatsapp')) return true
  if (cleaned.startsWith('instagram')) return true
  if (cleaned.startsWith('telegram')) return true
  if (cleanText(title).trim().startsWith('#')) return true
  if (/^#?\d{4,}$/.test(cleanText(title).trim())) return true
  if (/^\d+\s+days?\s+\d+\s+hours?\s+ago$/i.test(cleanText(title).trim())) return true

  if (JUNK_TITLES.some((junk) => cleaned === junk || cleaned.includes(junk))) return true
  if (BAD_EVENT_PATTERNS.some((junk) => cleaned.includes(junk))) return true

  return false
}

function cleanEventName(title: string) {
  let cleaned = cleanText(title)
    .replace(/[«»]/g, '')
    .replace(/&laquo;|&raquo;/gi, '')
    .replace(/^\+\s*/g, '')
    .replace(/\s+»$/g, '')
    .replace(/^«\s+/g, '')
    .replace(/\b(mon|tue|wed|thu|fri|sat|sun)(day)?\b/gi, '')
    .replace(/\b\d{1,2}(st|nd|rd|th)?\b/gi, '')
    .replace(
      /\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b/gi,
      ''
    )
    .replace(/\b20\d{2}\b/g, '')
    .replace(/\b\d{1,2}:\d{2}\b/g, '')
    .replace(/\b\d{1,2}(am|pm)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const cutMarkers = [
    ' buy tickets',
    ' book now',
    ' tickets',
    ' read more',
    ' more info',
    ' details',
    ' find out more',
    ' home events calendar',
    ' events calendar',
    ' membership',
    ' etiquette',
    ' dress code',
    ' accommodation',
    ' venue',
    ' google calendar',
    ' icalendar',
    ' add to calendar',
  ]

  for (const marker of cutMarkers) {
    const index = cleaned.toLowerCase().indexOf(marker)
    if (index > 4) cleaned = cleaned.slice(0, index).trim()
  }

  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  const normalisedCleaned = normalizeTitle(cleaned)

  if (
    normalisedCleaned === 'cancel reply' ||
    normalisedCleaned === 'leave a reply' ||
    normalisedCleaned === 'reply' ||
    normalisedCleaned === 'view this event' ||
    normalisedCleaned === 'view this event click here' ||
    normalisedCleaned === 'click here' ||
    normalisedCleaned === 'read more' ||
    normalisedCleaned === 'whats on' ||
    normalisedCleaned === 'what s on'
  ) {
    return ''
  }

  return cleaned || cleanText(title) || 'Untitled Event'
}

function extractDate(value: string) {
  const text = cleanText(value)
  const currentYear = new Date().getFullYear()

  const monthMap: Record<string, string> = {
    jan: '01',
    january: '01',
    feb: '02',
    february: '02',
    mar: '03',
    march: '03',
    apr: '04',
    april: '04',
    may: '05',
    jun: '06',
    june: '06',
    jul: '07',
    july: '07',
    aug: '08',
    august: '08',
    sep: '09',
    sept: '09',
    september: '09',
    oct: '10',
    october: '10',
    nov: '11',
    november: '11',
    dec: '12',
    december: '12',
  }

  let match = text.match(
    /\b(\d{1,2})(st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s*(20\d{2})?\b/i
  )

  if (match) {
    const day = match[1].padStart(2, '0')
    const month = monthMap[match[3].toLowerCase()]
    const year = match[4] || String(currentYear)
    return validDateOrNull(`${year}-${month}-${day}`)
  }

  match = text.match(
    /\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(\d{1,2})(st|nd|rd|th)?\s*(20\d{2})?\b/i
  )

  if (match) {
    const month = monthMap[match[1].toLowerCase()]
    const day = match[2].padStart(2, '0')
    const year = match[4] || String(currentYear)
    return validDateOrNull(`${year}-${month}-${day}`)
  }

  match = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (match) return validDateOrNull(`${match[1]}-${match[2]}-${match[3]}`)

  match = text.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/)
  if (match) {
    return validDateOrNull(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`)
  }

  match = text.match(/\b(\d{1,2})\/(\d{1,2})\b/)
  if (match) {
    return validDateOrNull(`${currentYear}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`)
  }

  return null
}

function extractTime(value: string) {
  const text = cleanText(value)
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)

  if (!match) return null

  let hour = Number(match[1])
  const minute = match[2] || '00'
  const meridian = match[3].toLowerCase()

  if (meridian === 'pm' && hour < 12) hour += 12
  if (meridian === 'am' && hour === 12) hour = 0

  return validTimeOrNull(`${String(hour).padStart(2, '0')}:${minute}`)
}

function validImageUrl(url: string | null) {
  if (!url) return null

  const lower = url.toLowerCase()

  if (!lower.startsWith('http://') && !lower.startsWith('https://')) return null
  if (lower.endsWith('.svg')) return null
  if (lower.endsWith('.gif')) return null
  if (BAD_IMAGE_PATTERNS.some((pattern) => lower.includes(pattern))) return null

  return url
}

function extractMetaImage(html: string, baseUrl: string) {
  const og =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]

  if (og) return validImageUrl(absoluteUrl(baseUrl, og))

  const twitter =
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)?.[1]

  if (twitter) return validImageUrl(absoluteUrl(baseUrl, twitter))

  return null
}

function extractFirstImage(html: string, baseUrl: string) {
  const images = [
    ...html.matchAll(/<img[^>]+(?:data-full|data-large_image|data-src|data-lazy-src|src)=["']([^"']+)["'][^>]*>/gi),
  ]

  for (const match of images) {
    const rawTag = match[0].toLowerCase()
    const image = validImageUrl(absoluteUrl(baseUrl, match[1]))
    if (!image) continue

    if (BAD_IMAGE_PATTERNS.some((pattern) => rawTag.includes(pattern))) continue

    return image
  }

  return null
}

function extractBestImage(html: string, baseUrl: string) {
  return extractMetaImage(html, baseUrl) || extractFirstImage(html, baseUrl)
}

function extractLinks(html: string, baseUrl: string) {
  const links: { href: string; text: string; raw: string }[] = []
  const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi

  let match

  while ((match = regex.exec(html)) !== null) {
    const href = absoluteUrl(baseUrl, match[1])
    const text = cleanText(match[2])
    const raw = match[0]

    if (!href) continue

    links.push({ href, text, raw })
  }

  return links
}

function extractPageTitle(html: string) {
  return (
    cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]) ||
    cleanText(html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]) ||
    cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1])
  )
}

function extractMetaDescription(html: string) {
  return (
    cleanText(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]) ||
    cleanText(html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1])
  )
}

function extractDateFromHtml(html: string) {
  const timeDate =
    html.match(/<time[^>]+datetime=["']([^"']+)["'][^>]*>/i)?.[1] ||
    html.match(/datetime=["']([^"']+)["']/i)?.[1]

  if (timeDate) {
    const date = String(timeDate).slice(0, 10)
    if (/^20\d{2}-\d{2}-\d{2}$/.test(date)) return validDateOrNull(date)
  }

  return extractDate(cleanText(html).slice(0, 6000))
}

function extractCalendarDateFromRaw(raw: string) {
  const datetime =
    raw.match(/datetime=["']([^"']+)["']/i)?.[1] ||
    raw.match(/data-date=["']([^"']+)["']/i)?.[1] ||
    raw.match(/data-start=["']([^"']+)["']/i)?.[1] ||
    raw.match(/data-event-date=["']([^"']+)["']/i)?.[1]

  if (datetime) {
    const date = String(datetime).slice(0, 10)
    if (/^20\d{2}-\d{2}-\d{2}$/.test(date)) return validDateOrNull(date)
  }

  return extractDate(raw)
}

function extractJsonLdEvents(html: string, baseUrl: string) {
  const events: any[] = []
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

  let match

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim())
      const items = Array.isArray(parsed) ? parsed : [parsed]

      for (const item of items) {
        const graph = item['@graph'] || [item]

        for (const node of graph) {
          const type = node['@type']

          if (type === 'Event' || type?.includes?.('Event')) {
            events.push({
              name: cleanText(node.name),
              description: cleanText(node.description),
              date: node.startDate ? String(node.startDate).slice(0, 10) : null,
              start_time: node.startDate ? String(node.startDate).slice(11, 16) : null,
              url: absoluteUrl(baseUrl, node.url) || baseUrl,
              image_url: Array.isArray(node.image)
                ? validImageUrl(absoluteUrl(baseUrl, node.image[0]))
                : validImageUrl(absoluteUrl(baseUrl, node.image)),
            })
          }
        }
      }
    } catch {
      continue
    }
  }

  return events
}

function extractCalendarEventLinks(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    raw: string
  }[] = []

  const links = extractLinks(html, baseUrl)

  for (const link of links) {
    const combined = `${link.href} ${link.text} ${link.raw}`.toLowerCase()

    const looksCalendarEvent =
      combined.includes('tribe_events') ||
      combined.includes('eventon') ||
      combined.includes('mec-event') ||
      combined.includes('eo-event') ||
      combined.includes('calendar') ||
      combined.includes('fc-event') ||
      combined.includes('event-title') ||
      combined.includes('event_item') ||
      combined.includes('/event/') ||
      combined.includes('/events/')

    if (!looksCalendarEvent) continue
    if (isJunkUrl(link.href)) continue

    const title =
      link.text ||
      cleanText(link.raw.match(/title=["']([^"']+)["']/i)?.[1]) ||
      cleanText(link.raw.match(/aria-label=["']([^"']+)["']/i)?.[1])

    if (isJunkTitle(title)) continue

    candidates.push({
      href: link.href,
      text: title,
      event_date: extractCalendarDateFromRaw(link.raw),
      raw: link.raw,
    })
  }

  return candidates
}

function extractTownhouseEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
  }[] = []

  const monthMap: Record<string, string> = {
    jan: '01',
    january: '01',
    feb: '02',
    february: '02',
    mar: '03',
    march: '03',
    apr: '04',
    april: '04',
    may: '05',
    jun: '06',
    june: '06',
    jul: '07',
    july: '07',
    aug: '08',
    august: '08',
    sep: '09',
    sept: '09',
    september: '09',
    oct: '10',
    october: '10',
    nov: '11',
    november: '11',
    dec: '12',
    december: '12',
  }

  const dayWord =
    '(?:mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday)'

  const seen = new Set<string>()
  const currentYear = new Date().getFullYear()
  const links = extractLinks(html, baseUrl)

  // Townhouse uses WordPress event pages like /events/the-wirral-munch...
  // These links are useful even when the visible calendar text is compact.
  for (const link of links) {
    if (!sameDomain(baseUrl, link.href)) continue
    if (!link.href.includes('/events/')) continue
    if (isJunkUrl(link.href)) continue

    const title =
      cleanEventName(link.text) ||
      cleanText(link.raw.match(/title=["']([^"']+)["']/i)?.[1]) ||
      cleanText(link.raw.match(/aria-label=["']([^"']+)["']/i)?.[1])

    if (isJunkTitle(title)) continue

    const eventDate = extractCalendarDateFromRaw(link.raw) || extractDate(`${link.raw} ${link.text}`)
    const startTime = extractTime(link.raw)

    const key = `${normalizeTitle(title)}|${eventDate || 'no-date'}|${link.href}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: link.href,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: link.raw,
    })
  }

  const text = cleanText(html)

  // Handles compact Townhouse calendar text, for example:
  // "FRI19jun8:00 pmHEAVY PETTING - Pet Play Event"
  // and normal text, for example:
  // "TUES 09 jun 7:00 pm The Wirral Munch BDSM Social and Play Event"
  const eventPattern = new RegExp(
    `\\b${dayWord}\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s*` +
      `(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\\s*` +
      `(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)\\s*` +
      `([\\s\\S]{6,140}?)(?=\\b${dayWord}\\s*\\d{1,2}(?:st|nd|rd|th)?\\s*(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)|Search for:|Recent Posts|Recent Comments|Events\\s+\\*|©|$)`,
    'gi'
  )

  let match

  while ((match = eventPattern.exec(text)) !== null) {
    const day = match[1].padStart(2, '0')
    const month = monthMap[match[2].toLowerCase()]
    let hour = Number(match[3])
    const minute = match[4] || '00'
    const meridian = match[5].toLowerCase()

    if (meridian === 'pm' && hour < 12) hour += 12
    if (meridian === 'am' && hour === 12) hour = 0

    const eventDate = validDateOrNull(`${currentYear}-${month}-${day}`)
    const startTime = validTimeOrNull(`${String(hour).padStart(2, '0')}:${minute}`)

    let title = cleanEventName(match[6])
      .replace(/^[-:|]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    title = title
      .replace(/\b(current month|upcoming events|calendar|googlecal|event details tickets here)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (isJunkTitle(title)) continue
    if (title.length > 120) title = title.slice(0, 120).trim()

    const matchingLink = links.find((link) => {
      if (!link.href.includes('/events/')) return false
      const linkTitle = normalizeTitle(link.text)
      const patternTitle = normalizeTitle(title)

      return (
        linkTitle.includes(patternTitle.slice(0, 20)) ||
        patternTitle.includes(linkTitle.slice(0, 20)) ||
        link.href.includes(patternTitle.split(' ').slice(0, 3).join('-'))
      )
    })

    const href = matchingLink?.href || eventUrlWithAnchor(baseUrl, title)
    const key = `${normalizeTitle(title)}|${eventDate || 'no-date'}|${href}`

    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: match[0],
    })
  }

  return candidates
}



function extractQuestEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
  }[] = []

  const monthMap: Record<string, string> = {
    jan: '01',
    january: '01',
    feb: '02',
    february: '02',
    mar: '03',
    march: '03',
    apr: '04',
    april: '04',
    may: '05',
    jun: '06',
    june: '06',
    jul: '07',
    july: '07',
    aug: '08',
    august: '08',
    sep: '09',
    sept: '09',
    september: '09',
    oct: '10',
    october: '10',
    nov: '11',
    november: '11',
    dec: '12',
    december: '12',
  }

  const lineText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|tr)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')

  const lines = lineText
    .split(/\n+/)
    .map((line) => cleanText(line))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((line) => !/^\*+$/.test(line.replace(/\s+/g, '')))

  const pageYear =
    cleanText(html).match(/\b(?:events?|calendar)\s+(20\d{2})\b/i)?.[1] ||
    cleanText(html).match(/\b(20\d{2})\b/)?.[1] ||
    String(new Date().getFullYear())

  const dateLinePattern = new RegExp(
    '^\\s*(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\\s+' +
      '(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s+' +
      '(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\\s*' +
      '(20\\d{2})?\\s*(.*)$',
    'i'
  )

  const genericTitlePattern = /^(?:[-–—:]|\s)*(?:day\/?night|day|night|evening|afternoon|all day|all day\/evening)?\s*(?:event|even|night)?\s*(?:[-–—:]|\s)*$/i

  const skipTitleLine = (line: string) => {
    const lower = normalizeTitle(line)

    if (!lower) return true
    if (genericTitlePattern.test(line)) return true
    if (lower.includes('doors open')) return true
    if (lower.includes('entrance')) return true
    if (lower.includes('members')) return true
    if (lower.includes('non members')) return true
    if (lower.includes('nonmembers')) return true
    if (lower.includes('closed between')) return true
    if (lower.includes('must bring')) return true
    if (lower.includes('no id')) return true
    if (lower.includes('please contact')) return true
    if (lower.includes('fab swingers')) return true
    if (lower.includes('quest member')) return true
    if (lower.includes('id must be')) return true
    if (lower.includes('please note')) return true
    if (lower.includes('june july events')) return true
    if (lower.includes('upcoming events')) return true

    return false
  }

  const cleanQuestTitle = (value: string) => {
    let title = cleanText(value)
      .replace(/^[-–—:]+/g, '')
      .replace(/\b(day\/?night|day|night|evening|afternoon|all day|all day\/evening)\s+event\b/gi, '')
      .replace(/\beven\b/gi, '')
      .replace(/^[-–—:]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    title = cleanEventName(title)
      .replace(/^[-–—:]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    return title
  }

  const seen = new Set<string>()

  for (let index = 0; index < lines.length; index++) {
    const dateMatch = lines[index].match(dateLinePattern)
    if (!dateMatch) continue

    const day = dateMatch[2].padStart(2, '0')
    const month = monthMap[dateMatch[3].toLowerCase()]
    const year = dateMatch[4] || pageYear
    const eventDate = validDateOrNull(`${year}-${month}-${day}`)

    if (!eventDate) continue

    const block: string[] = [lines[index]]

    for (let next = index + 1; next < lines.length; next++) {
      if (lines[next].match(dateLinePattern)) break
      block.push(lines[next])
    }

    let title = cleanQuestTitle(dateMatch[5] || '')

    if (!title || isJunkTitle(title) || skipTitleLine(title)) {
      const titleLine = block.slice(1).find((line) => !skipTitleLine(line) && !isJunkTitle(line))
      title = titleLine ? cleanQuestTitle(titleLine) : ''
    }

    if (!title || isJunkTitle(title)) continue
    if (title.length > 130) title = title.slice(0, 130).trim()

    const raw = block.join(' ')
    const startTime = extractTime(raw)
    const description = block
      .slice(1)
      .filter((line) => normalizeTitle(line) !== normalizeTitle(title))
      .filter((line) => !/^[-–—:]+$/.test(line))
      .slice(0, 8)
      .join(' ')

    const key = `${normalizeTitle(title)}|${eventDate}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: eventUrlWithAnchor(baseUrl, title),
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: description || raw,
    })
  }

  return candidates
}


function discoverXtasiaEventPages(sourceUrl: string) {
  const pages = [
    'https://xtasia.co.uk/page/swingers-diary',
    'https://xtasia.co.uk/page/fetish-diary',
    'https://www.xtasia.co.uk/page/swingers-diary',
    'https://www.xtasia.co.uk/page/fetish-diary',
    'https://xtasia.co.uk/en/page/swingers-diary',
    'https://xtasia.co.uk/en/page/fetish-diary',
    'https://www.xtasia.co.uk/en/page/swingers-diary',
    'https://www.xtasia.co.uk/en/page/fetish-diary',
  ]

  return [...new Set(pages)]
    .map((url) => absoluteUrl(sourceUrl, url))
    .filter(Boolean) as string[]
}

function unfoldIcsLines(ics: string) {
  const lines = ics.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const output: string[] = []

  for (const line of lines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && output.length > 0) {
      output[output.length - 1] += line.slice(1)
    } else {
      output.push(line)
    }
  }

  return output
}

function decodeIcsText(value: string | null | undefined) {
  if (!value) return ''

  return cleanText(
    value
      .replace(/\\n/g, ' ')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\')
  )
}

function parseIcsDate(value: string | null | undefined) {
  if (!value) return null

  const raw = String(value).trim()

  let match = raw.match(/^(20\d{2})(\d{2})(\d{2})/)
  if (match) return validDateOrNull(`${match[1]}-${match[2]}-${match[3]}`)

  match = raw.match(/^(20\d{2})-(\d{2})-(\d{2})/)
  if (match) return validDateOrNull(`${match[1]}-${match[2]}-${match[3]}`)

  return null
}

function parseIcsTime(value: string | null | undefined) {
  if (!value) return null

  const raw = String(value).trim()
  const match = raw.match(/^20\d{6}T(\d{2})(\d{2})/)

  if (!match) return null

  return validTimeOrNull(`${match[1]}:${match[2]}`)
}

function parseIcsDateTimeParts(value: string | null | undefined) {
  if (!value) return null

  const raw = String(value).trim()
  const match =
    raw.match(/^(20\d{2})(\d{2})(\d{2})T?(\d{2})?(\d{2})?/) ||
    raw.match(/^(20\d{2})-(\d{2})-(\d{2})T?(\d{2})?:?(\d{2})?/)

  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4] || '0')
  const minute = Number(match[5] || '0')

  const date = validDateOrNull(
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  )

  if (!date) return null

  return { year, month, day, hour, minute, date }
}

function datePartsToString(date: Date) {
  return validDateOrNull(
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
  )
}

function parseIcsUntil(value: string | null | undefined) {
  const parts = parseIcsDateTimeParts(value)
  if (!parts) return null

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 23, 59, 59))
}

function parseRRule(value: string | null | undefined) {
  const output: Record<string, string> = {}
  if (!value) return output

  for (const part of String(value).split(';')) {
    const [key, val] = part.split('=')
    if (!key || !val) continue
    output[key.toUpperCase()] = val
  }

  return output
}

function getIcsDurationDays(startValue: string | null | undefined, endValue: string | null | undefined) {
  const start = parseIcsDateTimeParts(startValue)
  const end = parseIcsDateTimeParts(endValue)

  if (!start || !end) return 0

  const startDate = new Date(Date.UTC(start.year, start.month - 1, start.day))
  const endDate = new Date(Date.UTC(end.year, end.month - 1, end.day))
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / 86400000)

  return Math.max(0, Math.min(diff, 7))
}

function expandIcsDates(event: Record<string, string>) {
  const start = parseIcsDateTimeParts(event.DTSTART)
  if (!start) return []

  const startDate = new Date(Date.UTC(start.year, start.month - 1, start.day))
  const today = new Date()
  const todayDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const defaultUntil = new Date(todayDate)
  defaultUntil.setUTCDate(defaultUntil.getUTCDate() + 120)

  const rrule = parseRRule(event.RRULE)
  const frequency = rrule.FREQ
  const interval = Math.max(1, Number(rrule.INTERVAL || '1') || 1)
  const countLimit = Math.min(Math.max(Number(rrule.COUNT || '0') || 0, 0), 200)
  const untilDate = parseIcsUntil(rrule.UNTIL) || defaultUntil
  const durationDays = getIcsDurationDays(event.DTSTART, event.DTEND)

  const excluded = new Set<string>()
  for (const key of Object.keys(event)) {
    if (!key.startsWith('EXDATE')) continue
    for (const raw of String(event[key]).split(',')) {
      const parts = parseIcsDateTimeParts(raw)
      if (parts?.date) excluded.add(parts.date)
    }
  }

  const output: { event_date: string; start_time: string | null }[] = []
  const addOccurrence = (date: Date) => {
    for (let offset = 0; offset <= durationDays; offset++) {
      const occurrence = new Date(date)
      occurrence.setUTCDate(occurrence.getUTCDate() + offset)

      const eventDate = datePartsToString(occurrence)
      if (!eventDate) continue
      if (eventDate < todayDate.toISOString().split('T')[0]) continue
      if (excluded.has(eventDate)) continue

      const startTime =
        offset === 0 && typeof start.hour === 'number'
          ? validTimeOrNull(`${String(start.hour).padStart(2, '0')}:${String(start.minute).padStart(2, '0')}`)
          : null

      output.push({ event_date: eventDate, start_time: startTime })
    }
  }

  if (!frequency) {
    addOccurrence(startDate)
    return output
  }

  const byDays = String(rrule.BYDAY || '')
    .split(',')
    .map((day) => day.trim().toUpperCase())
    .filter(Boolean)

  const dayMap: Record<string, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  }

  let generated = 0

  if (frequency === 'DAILY') {
    const current = new Date(startDate)

    while (current <= untilDate && generated < (countLimit || 200)) {
      addOccurrence(current)
      generated++
      current.setUTCDate(current.getUTCDate() + interval)
    }

    return output
  }

  if (frequency === 'WEEKLY') {
    const weekStart = new Date(startDate)
    const daysToUse = byDays.length > 0 ? byDays : [Object.keys(dayMap).find((key) => dayMap[key] === startDate.getUTCDay()) || 'MO']

    while (weekStart <= untilDate && generated < (countLimit || 200)) {
      for (const byDay of daysToUse) {
        const targetDay = dayMap[byDay.replace(/^\d+/, '')]
        if (targetDay === undefined) continue

        const occurrence = new Date(weekStart)
        const diff = targetDay - occurrence.getUTCDay()
        occurrence.setUTCDate(occurrence.getUTCDate() + diff)

        if (occurrence < startDate) continue
        if (occurrence > untilDate) continue

        addOccurrence(occurrence)
        generated++
        if (countLimit && generated >= countLimit) break
      }

      weekStart.setUTCDate(weekStart.getUTCDate() + 7 * interval)
    }

    return output
  }

  if (frequency === 'MONTHLY') {
    const current = new Date(startDate)

    while (current <= untilDate && generated < (countLimit || 120)) {
      addOccurrence(current)
      generated++
      current.setUTCMonth(current.getUTCMonth() + interval)
    }

    return output
  }

  addOccurrence(startDate)
  return output
}

function isJunkIcsCalendarEntry(title: string, description: string) {
  const combined = normalizeTitle(`${title} ${description}`)

  const junk = [
    'this months swingers diary',
    'this months fetish diary',
    'years swingers diary',
    'years fetish diary',
    'xtasia is listed on fabswingers',
    'fabswingers',
    'ffff',
    'closed for private event',
    'flirts spa closed',
    'closed midday',
  ]

  return junk.some((item) => combined.includes(item))
}

function parseIcsEvents(ics: string, baseUrl: string, diaryName: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
  }[] = []

  const lines = unfoldIcsLines(ics)
  const events: Record<string, string>[] = []
  let current: Record<string, string> | null = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {}
      continue
    }

    if (line === 'END:VEVENT') {
      if (current) events.push(current)
      current = null
      continue
    }

    if (!current) continue

    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) continue

    const rawKey = line.slice(0, separatorIndex)
    const value = line.slice(separatorIndex + 1)
    const key = rawKey.split(';')[0].toUpperCase()

    if (current[key]) {
      current[key] = `${current[key]},${value}`
    } else {
      current[key] = value
    }
  }

  const seen = new Set<string>()

  for (const event of events) {
    const rawTitle = decodeIcsText(event.SUMMARY || '')
    const rawDescription = decodeIcsText(event.DESCRIPTION || `${rawTitle} ${diaryName}`)

    let title = cleanEventName(rawTitle)
      .replace(/^@?\s*Xtasia\s*[-–:]\s*/i, '')
      .replace(/^Xtasia\s+/i, '')
      .replace(/^Flirts\s*[-–:]\s*/i, 'Flirts - ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || isJunkTitle(title)) continue
    if (isJunkIcsCalendarEntry(title, rawDescription)) continue

    const occurrences = expandIcsDates(event)

    for (const occurrence of occurrences) {
      if (!occurrence.event_date) continue

      const ticketUrl = event.URL ? decodeIcsText(event.URL) : eventUrlWithAnchor(baseUrl, title)
      const key = `${normalizeTitle(title)}|${occurrence.event_date}|${occurrence.start_time || ''}`

      if (seen.has(key)) continue
      seen.add(key)

      candidates.push({
        href: ticketUrl || eventUrlWithAnchor(baseUrl, title),
        text: title,
        event_date: occurrence.event_date,
        start_time: occurrence.start_time,
        raw: rawDescription || `${title} ${diaryName}`,
      })
    }
  }

  return candidates
}


function extractGoogleCalendarIds(html: string, baseUrl: string) {
  const ids = new Set<string>()

  const iframeMatches = [
    ...html.matchAll(/<iframe[^>]+src=["']([^"']*calendar\.google\.com\/calendar\/embed[^"']+)["'][^>]*>/gi),
    ...html.matchAll(/<iframe[^>]+src=["']([^"']*google\.com\/calendar\/embed[^"']+)["'][^>]*>/gi),
  ]

  for (const match of iframeMatches) {
    const iframeUrl = absoluteUrl(baseUrl, match[1])
    if (!iframeUrl) continue

    try {
      const parsed = new URL(iframeUrl)
      const srcValues = parsed.searchParams.getAll('src')

      for (const src of srcValues) {
        if (src) ids.add(src)
      }
    } catch {
      continue
    }
  }

  const encodedSrcMatches = [...html.matchAll(/src=([^&"'<>]+@[^&"'<>]+)/gi)]

  for (const match of encodedSrcMatches) {
    try {
      ids.add(decodeURIComponent(match[1]))
    } catch {
      ids.add(match[1])
    }
  }

  return [...ids]
}

async function extractXtasiaEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
  }[] = []

  const diaryName = baseUrl.includes('fetish') ? 'Fetish Diary' : 'Swingers Diary'
  const calendarIds = extractGoogleCalendarIds(html, baseUrl)

  for (const calendarId of calendarIds) {
    const encodedId = encodeURIComponent(calendarId)
    const icsUrls = [
      `https://calendar.google.com/calendar/ical/${encodedId}/public/basic.ics`,
      `https://calendar.google.com/calendar/ical/${encodedId}/private/basic.ics`,
    ]

    for (const icsUrl of icsUrls) {
      const ics = await fetchText(icsUrl, 'text/calendar,text/plain,*/*')
      if (!ics || !ics.includes('BEGIN:VCALENDAR')) continue

      candidates.push(...parseIcsEvents(ics, baseUrl, diaryName))
      break
    }
  }

  if (candidates.length === 0) {
    const text = cleanText(html)
    const currentYear = new Date().getFullYear()
    const monthMap: Record<string, string> = {
      jan: '01',
      january: '01',
      feb: '02',
      february: '02',
      mar: '03',
      march: '03',
      apr: '04',
      april: '04',
      may: '05',
      jun: '06',
      june: '06',
      jul: '07',
      july: '07',
      aug: '08',
      august: '08',
      sep: '09',
      sept: '09',
      september: '09',
      oct: '10',
      october: '10',
      nov: '11',
      november: '11',
      dec: '12',
      december: '12',
    }

    const pattern = /\b(?:mon|tue|wed|thu|fri|sat|sun)(?:day)?\s+(\d{1,2})\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(.{6,100}?)(?=\b(?:mon|tue|wed|thu|fri|sat|sun)(?:day)?\s+\d{1,2}\s+(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)|$)/gi

    let match

    while ((match = pattern.exec(text)) !== null) {
      const day = match[1].padStart(2, '0')
      const month = monthMap[match[2].toLowerCase()]
      const eventDate = validDateOrNull(`${currentYear}-${month}-${day}`)
      let title = cleanEventName(match[3]).replace(/^[-–:]+/g, '').trim()

      if (!eventDate || !title || isJunkTitle(title)) continue

      candidates.push({
        href: eventUrlWithAnchor(baseUrl, title),
        text: title,
        event_date: eventDate,
        start_time: extractTime(match[3]),
        raw: `${title} ${diaryName}`,
      })
    }
  }

  return candidates
}


function isIcsSourceUrl(url: string | null | undefined) {
  const lower = String(url || '').toLowerCase()

  return (
    lower.endsWith('.ics') ||
    lower.includes('/calendar/ical/') ||
    lower.includes('basic.ics')
  )
}

function xtasiaPublicPageForIcs(sourceUrl: string) {
  const lower = sourceUrl.toLowerCase()

  if (lower.includes('fjos8ldou4a3euibard9if9kfs')) {
    return 'https://www.xtasia.co.uk/page/fetish-diary'
  }

  if (lower.includes('0phh2fhvukhsm7j271ep7jvvlk')) {
    return 'https://www.xtasia.co.uk/page/swingers-diary'
  }

  return 'https://www.xtasia.co.uk/en'
}

function xtasiaDiaryNameForIcs(sourceUrl: string) {
  const lower = sourceUrl.toLowerCase()

  if (lower.includes('fjos8ldou4a3euibard9if9kfs')) return 'Xtasia Fetish Diary'
  if (lower.includes('0phh2fhvukhsm7j271ep7jvvlk')) return 'Xtasia Swingers Diary'

  return 'Xtasia Diary'
}

function cleanIcsEventTitleForVenue(venueId: string, title: string) {
  let cleaned = cleanEventName(title)

  if (venueId === 'xtasia_west_bromwich') {
    cleaned = cleaned
      .replace(/^@?\s*Xtasia\s*[-–:]\s*/i, '')
      .replace(/^Xtasia\s+/i, '')
      .replace(/^Flirts\s*[-–:]\s*/i, 'Flirts - ')
      .replace(/\s*-\s*to\s*$/i, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  return cleaned
}


async function cleanupExistingVenueJunk(venueId: string) {
  const isVanillaVenue = isVanillaAlternativeSource(venueId)
  if (venueId !== 'xtasia_west_bromwich' && !isVanillaVenue) return 0

  const { data } = await supabaseAdmin
    .from('events')
    .select('event_id, event_name, event_date, description, ticket_url')
    .eq('venue_id', venueId)
    .limit(1000)

  const idsToDelete =
    data
      ?.filter((event) => {
        if (venueId === 'xtasia_west_bromwich') {
          return isJunkIcsCalendarEntry(event.event_name || '', event.description || '')
        }

        if (isVanillaVenue) {
          const combined = normalizeTitle(`${event.event_name || ''} ${event.description || ''} ${event.ticket_url || ''}`)
          if (!event.event_date) return true
          if (combined.includes('review')) return true
          if (combined.includes('testimonial')) return true
          if (combined.includes('honestly i had')) return true
          if (combined.includes('regular attendee')) return true
          if (combined.includes('wonderful welcome')) return true
          if (cleanText(event.event_name || '').length > 120) return true
        }

        return false
      })
      .map((event) => event.event_id) || []

  if (idsToDelete.length === 0) return 0

  const { error } = await supabaseAdmin
    .from('events')
    .delete()
    .in('event_id', idsToDelete)

  return error ? 0 : idsToDelete.length
}

async function scrapeIcsSource(source: {
  venue_id: string
  source_url: string
}) {
  const diaryPage =
    source.venue_id === 'xtasia_west_bromwich'
      ? xtasiaPublicPageForIcs(source.source_url)
      : source.source_url

  const diaryName =
    source.venue_id === 'xtasia_west_bromwich'
      ? xtasiaDiaryNameForIcs(source.source_url)
      : 'Calendar'

  const existingJunkDeleted = await cleanupExistingVenueJunk(source.venue_id)

  const ics = await fetchText(source.source_url, 'text/calendar,text/plain,*/*')

  if (!ics || !ics.includes('BEGIN:VCALENDAR')) {
    return {
      checked_pages: 1,
      candidates_found: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 1,
      timedOutOrEmpty: 1,
      found: [] as any[],
      errors: [] as any[],
      existing_junk_deleted: existingJunkDeleted,
      failed_pages: [
        {
          venue_id: source.venue_id,
          page_url: source.source_url,
          reason: 'ICS fetch returned empty/null or no calendar data',
        },
      ],
    }
  }

  const icsEvents = parseIcsEvents(ics, diaryPage, diaryName)

  let candidatesFound = 0
  let created = 0
  let updated = 0
  let skipped = 0
  let failed = 0

  const found: any[] = []
  const errors: any[] = []
  const runSeen = new Set<string>()

  for (const event of icsEvents) {
    candidatesFound++

    const title = cleanIcsEventTitleForVenue(source.venue_id, event.text)
    const description = event.raw || `${title} ${diaryName}`

    if (!title || isJunkIcsCalendarEntry(title, description)) {
      skipped++
      continue
    }

    const ticketUrl = eventUrlWithAnchor(diaryPage, title)
    const dedupeKey = eventDedupeKey(source.venue_id, title, event.event_date, ticketUrl)

    if (runSeen.has(dedupeKey)) {
      skipped++
      continue
    }

    runSeen.add(dedupeKey)

    const result = await upsertEvent({
      venue_id: source.venue_id,
      event_name: title,
      event_date: event.event_date,
      start_time: event.start_time,
      description,
      ticket_url: ticketUrl,
      image_url: null,
      source_url: source.source_url,
    })

    if (result.action === 'created') created++
    else if (result.action === 'updated') updated++
    else if (result.action === 'skipped') skipped++
    else {
      failed++

      if (errors.length < 20) {
        errors.push({
          venue_id: source.venue_id,
          event_name: title,
          event_date: event.event_date,
          error: result.error?.message || 'Unknown upsert error',
        })
      }
    }

    if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
      found.push({
        venue_id: source.venue_id,
        event_name: title,
        event_date: event.event_date,
        event_url: ticketUrl,
        image_url: null,
        method: 'ics-calendar',
      })
    }
  }

  return {
    checked_pages: 1,
    candidates_found: candidatesFound,
    created,
    updated,
    skipped,
    failed,
    timedOutOrEmpty: 0,
    found,
    errors,
    existing_junk_deleted: existingJunkDeleted,
    failed_pages: [] as any[],
  }
}

function decodeEscapedText(value: string) {
  return value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_match, code) => {
      try {
        return String.fromCharCode(parseInt(code, 16))
      } catch {
        return ' '
      }
    })
    .replace(/\\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\//g, '/')
    .replace(/\\n|\\r|\\t/g, ' ')
}

function isWixLikeSource(value: string | null | undefined) {
  const lower = String(value || '').toLowerCase()

  return (
    lower.includes('wix') ||
    lower.includes('wixstatic') ||
    lower.includes('wix-vibe-site') ||
    lower.includes('wixsite')
  )
}

function discoverWixEventPages(sourceUrl: string) {
  const urls = [
    absoluteUrl(sourceUrl, '/events'),
    absoluteUrl(sourceUrl, '/events/'),
    absoluteUrl(sourceUrl, '/event'),
    absoluteUrl(sourceUrl, '/calendar'),
    absoluteUrl(sourceUrl, '/what-s-on'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => sameDomain(sourceUrl, url) && !isJunkUrl(url))
}

function extractWixCalendarTileEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
  }[] = []

  const monthMap: Record<string, string> = {
    january: '01',
    february: '02',
    march: '03',
    april: '04',
    may: '05',
    june: '06',
    july: '07',
    august: '08',
    september: '09',
    october: '10',
    november: '11',
    december: '12',
  }

  const monthNames =
    'January|February|March|April|May|June|July|August|September|October|November|December'

  const weekdayNames =
    'Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday'

  const cleanedHtmlText = cleanText(html)
  const decodedHtmlText = cleanText(decodeEscapedText(html))
  const combinedText = `${cleanedHtmlText} ${decodedHtmlText}`
    .replace(/\s+/g, ' ')
    .trim()

  const seen = new Set<string>()

  const monthSectionPattern = new RegExp(
    `\\b(${monthNames})\\s+(20\\d{2})([\\s\\S]{0,9000}?)(?=\\b(?:${monthNames})\\s+20\\d{2}\\b|$)`,
    'gi'
  )

  let monthMatch

  while ((monthMatch = monthSectionPattern.exec(combinedText)) !== null) {
    const monthName = monthMatch[1].toLowerCase()
    const year = monthMatch[2]
    const month = monthMap[monthName]
    const section = monthMatch[3]

    if (!month) continue

    const tilePattern = new RegExp(
      `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${weekdayNames})\\s+` +
        `(.{3,110}?\\([^)]*(?:am|pm)[^)]*\\))` +
        `(?=\\s+\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${weekdayNames})\\s+|\\s+${monthNames}\\s+20\\d{2}\\b|$)`,
      'gi'
    )

    let tileMatch

    while ((tileMatch = tilePattern.exec(section)) !== null) {
      const day = tileMatch[1].padStart(2, '0')
      const rawTitleAndTime = cleanText(tileMatch[3])
      const timeText = cleanText(rawTitleAndTime.match(/\(([^)]*)\)/)?.[1] || '')
      let title = cleanEventName(rawTitleAndTime.replace(/\([^)]*\)/g, ''))

      title = title
        .replace(/^[-:|]+/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (isJunkTitle(title)) continue
      if (title.length > 100) title = title.slice(0, 100).trim()

      const eventDate = validDateOrNull(`${year}-${month}-${day}`)
      const startTime = extractTime(timeText)
      const href = eventUrlWithAnchor(baseUrl, title)
      const key = `${normalizeTitle(title)}|${eventDate || 'no-date'}`

      if (seen.has(key)) continue
      seen.add(key)

      candidates.push({
        href,
        text: title,
        event_date: eventDate,
        start_time: startTime,
        raw: `${monthMatch[1]} ${year} ${tileMatch[0]}`,
      })
    }
  }

  return candidates
}


function isVanillaAlternativeSource(value: string | null | undefined) {
  const lower = String(value || '').toLowerCase()

  return (
    lower.includes('va2.co.uk') ||
    lower.includes('vanillaalternative') ||
    lower.includes('vanilla-alternative') ||
    lower.includes('vanilla_alternative')
  )
}

function discoverVanillaAlternativeEventPages(sourceUrl: string) {
  const urls = [
    absoluteUrl(sourceUrl, '/book/timetableactivity.aspx?parkid=1'),
    'https://va2.co.uk/book/timetableactivity.aspx?parkid=1',
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => sameDomain(sourceUrl, url) && !isJunkUrl(url))
}

function decodeHtmlAttribute(value: string | null | undefined) {
  if (!value) return ''

  return cleanText(value)
    .replace(/&amp;amp;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanVanillaAlternativeEventName(value: string, fallback: string) {
  let title = cleanText(value || fallback)
    .replace(/\s+/g, ' ')
    .trim()

  // Timetable cards sometimes append the poster/date line, e.g. "UNTAMED 6TH JUNE".
  title = title
    .replace(/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s*(?:\d{2,4})?\b/gi, '')
    .replace(/\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+\d{1,2}(?:st|nd|rd|th)?\s*(?:\d{2,4})?\b/gi, '')
    .replace(/\b20\d{2}\b/g, '')
    .replace(/\b\d{1,2}\s*\/\s*\d{1,2}\s*\/\s*\d{2,4}\b/g, '')
    .replace(/\bday\s*\/\s*evening\b/gi, 'Day / Evening')
    .replace(/\s+/g, ' ')
    .trim()

  title = cleanEventName(title)
    .replace(/^[-–—:]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!title || isJunkTitle(title)) {
    title = cleanEventName(fallback)
      .replace(/^[-–—:]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  return title
}

function extractVanillaAlternativeEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
  }[] = []

  const seen = new Set<string>()
  const eventPattern = /bookingClickDependencyCheck\(\s*'([^']+)'[\s\S]{0,900}?'([^']*BookActivity\.aspx[^']*slotDate=([^']+?))'\s*\)/gi

  const matches = [...html.matchAll(eventPattern)]

  for (let index = 0; index < matches.length; index++) {
    const match = matches[index]
    const rawFallbackTitle = decodeHtmlAttribute(match[1])
    const rawHref = decodeHtmlAttribute(match[2])
    const rawSlotDate = decodeHtmlAttribute(match[3])
    const blockStart = Math.max(0, match.index || 0)
    const blockEnd = index + 1 < matches.length ? matches[index + 1].index || blockStart + 4000 : blockStart + 4000
    const block = html.slice(blockStart, blockEnd)

    const dateMatch = rawSlotDate.match(/(\d{1,2})\/(\d{1,2})\/(20\d{2})\s+(\d{1,2}):(\d{2})/)
    if (!dateMatch) continue

    const eventDate = validDateOrNull(
      `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`
    )
    const startTime = validTimeOrNull(`${dateMatch[4].padStart(2, '0')}:${dateMatch[5]}`)

    if (!eventDate) continue

    const displayTitleRaw =
      cleanText(
        block.match(/<span[^>]+text-transform\s*:\s*uppercase[^>]*>([\s\S]*?)<\/span>/i)?.[1]
          ?.replace(/<br\s*\/?>/gi, ' ')
      ) || ''

    const title = cleanVanillaAlternativeEventName(displayTitleRaw, rawFallbackTitle)
    if (!title || isJunkTitle(title)) continue

    const ticketUrl = absoluteUrl(baseUrl, rawHref) || eventUrlWithAnchor(baseUrl, title)
    const rawImage =
      block.match(/<img[^>]+class=["'][^"']*eachCellImage[^"']*["'][^>]+src=["']([^"']+)["']/i)?.[1] ||
      block.match(/<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*eachCellImage[^"']*["']/i)?.[1]
    const imageUrl = validImageUrl(absoluteUrl(baseUrl, decodeHtmlAttribute(rawImage)))
    const displayTime = cleanText(block.match(/\b\d{1,2}\s+[A-Za-z]{3}\s+\d{2}\s+@\s+\d{1,2}:\d{2}\s+-\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{2}\s+@\s+\d{1,2}:\d{2}/i)?.[0])
    const description = cleanText(`${title}${displayTime ? ` - ${displayTime}` : ''}`)
    const key = `${normalizeTitle(title)}|${eventDate}|${normalizeTicketUrl(ticketUrl)}`

    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: ticketUrl,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: description || title,
      image_url: imageUrl,
    })
  }

  return candidates
}


async function fetchHtml(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    console.log('SCRAPING:', url)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36 SceneFinderBot/5.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml,text/xml,text/calendar,text/plain,*/*',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      redirect: 'follow',
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.log('FAILED:', response.status, response.statusText, url)
      return null
    }

    const contentType = response.headers.get('content-type') || ''
    const body = await response.text()

    if (!body || body.trim().length === 0) {
      console.log('EMPTY BODY:', url)
      return null
    }

    if (
      !contentType.includes('text/html') &&
      !contentType.includes('application/xhtml') &&
      !contentType.includes('text/plain') &&
      !contentType.includes('application/xml') &&
      !contentType.includes('text/xml') &&
      !contentType.includes('text/calendar')
    ) {
      console.log('UNUSUAL CONTENT TYPE:', contentType, url)
    }

    return body
  } catch (err: any) {
    clearTimeout(timeout)

    console.log(
      'FETCH ERROR:',
      url,
      err?.name || 'UnknownError',
      err?.message || 'Unknown fetch error'
    )

    return null
  }
}

async function fetchText(url: string, accept = 'text/html,application/xhtml+xml,application/xml,text/xml,text/calendar,text/plain,application/json,*/*') {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    console.log('FETCH TEXT:', url)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36 SceneFinderBot/5.0',
        Accept: accept,
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      redirect: 'follow',
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.log('FETCH TEXT FAILED:', response.status, response.statusText, url)
      return null
    }

    const body = await response.text()
    if (!body || body.trim().length === 0) {
      console.log('FETCH TEXT EMPTY:', url)
      return null
    }

    return body
  } catch (err: any) {
    clearTimeout(timeout)
    console.log(
      'FETCH TEXT ERROR:',
      url,
      err?.name || 'UnknownError',
      err?.message || 'Unknown fetch text error'
    )
    return null
  }
}

async function discoverTownhouseEventUrls(sourceUrl: string) {
  const discovered = new Set<string>()

  for (const path of TOWNHOUSE_EVENT_SEED_PATHS) {
    const url = absoluteUrl(sourceUrl, path)
    if (url) discovered.add(url)
  }

  const sitemapUrls = [
    absoluteUrl(sourceUrl, '/wp-sitemap-posts-ajde_events-1.xml'),
    absoluteUrl(sourceUrl, '/wp-sitemap-posts-event-1.xml'),
    absoluteUrl(sourceUrl, '/event-sitemap.xml'),
    absoluteUrl(sourceUrl, '/events-sitemap.xml'),
    absoluteUrl(sourceUrl, '/sitemap.xml'),
  ].filter(Boolean) as string[]

  for (const sitemapUrl of sitemapUrls) {
    const xml = await fetchText(sitemapUrl, 'application/xml,text/xml,text/plain')
    if (!xml) continue

    const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
      .map((match) => cleanText(match[1]))
      .filter((url) => url.includes('townhouseswingers.com/events/'))

    for (const url of urls) discovered.add(url)
  }

  const restUrls = [
    absoluteUrl(sourceUrl, '/wp-json/wp/v2/ajde_events?per_page=100'),
    absoluteUrl(sourceUrl, '/wp-json/wp/v2/event?per_page=100'),
    absoluteUrl(sourceUrl, '/wp-json/wp/v2/search?subtype=ajde_events&per_page=100&search=event'),
    absoluteUrl(sourceUrl, '/wp-json/wp/v2/search?subtype=event&per_page=100&search=event'),
  ].filter(Boolean) as string[]

  for (const restUrl of restUrls) {
    const jsonText = await fetchText(restUrl, 'application/json,text/plain')
    if (!jsonText) continue

    try {
      const parsed = JSON.parse(jsonText)
      const items = Array.isArray(parsed) ? parsed : []

      for (const item of items) {
        const rawUrl =
          item.link ||
          item.url ||
          item.guid?.rendered ||
          item._links?.self?.[0]?.href ||
          null

        const eventUrl = rawUrl ? absoluteUrl(sourceUrl, rawUrl) : null

        if (eventUrl && eventUrl.includes('/events/')) {
          discovered.add(eventUrl)
        }
      }
    } catch {
      continue
    }
  }

  return [...discovered].filter((url) => sameDomain(sourceUrl, url) && !isJunkUrl(url))
}


const CLUB_ALCHEMY_PUBLIC_HOST = 'www.clubalchemy.co.uk'
const CLUB_ALCHEMY_HOSTS = [
  'clubalchemy.co.uk',
  'www.clubalchemy.co.uk',
  'oid2yvxyy4-btej6sd4xq-uk.a.run.app',
]

function normaliseHost(value: string | null | undefined) {
  try {
    return new URL(String(value || '')).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return String(value || '').replace(/^www\./, '').toLowerCase()
  }
}

function isClubAlchemyHost(value: string | null | undefined) {
  const host = normaliseHost(value)
  return CLUB_ALCHEMY_HOSTS.map((item) => item.replace(/^www\./, '')).includes(host)
}

function isClubAlchemySource(value: string | null | undefined) {
  return isClubAlchemyHost(value)
}

function publicClubAlchemyUrl(url: string | null | undefined) {
  if (!url) return null

  try {
    const parsed = new URL(url)
    if (!isClubAlchemyHost(parsed.hostname)) return url

    parsed.protocol = 'https:'
    parsed.hostname = CLUB_ALCHEMY_PUBLIC_HOST
    return parsed.toString()
  } catch {
    return url
  }
}

function sameDomainOrClubAlchemy(sourceUrl: string, pageUrl: string) {
  if (sameDomain(sourceUrl, pageUrl)) return true
  return isClubAlchemySource(sourceUrl) && isClubAlchemyEventPage(pageUrl)
}

function isClubAlchemyEventPage(url: string | null | undefined) {
  if (!url) return false

  try {
    const parsed = new URL(url)
    const path = parsed.pathname.toLowerCase().replace(/\/$/, '')

    return (
      isClubAlchemyHost(parsed.hostname) &&
      path.startsWith('/events/') &&
      path !== '/events'
    )
  } catch {
    return false
  }
}

function extractClubAlchemyCanonicalUrl(html: string, baseUrl: string) {
  const raw =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] ||
    html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i)?.[1]

  const url = absoluteUrl(baseUrl, raw)
  return url && isClubAlchemyEventPage(url) ? url : baseUrl
}

function extractClubAlchemyDateFromUrl(url: string) {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.toLowerCase()

    const match = path.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
    if (!match) return null

    return validDateOrNull(`${match[1]}-${match[2]}-${match[3]}`)
  } catch {
    return null
  }
}

function extractClubAlchemyTimeFromText(value: string | null | undefined) {
  const text = cleanText(decodeEscapedText(String(value || '')))

  const twentyFourHour =
    text.match(/\b([01]?\d|2[0-3])[:.](\d{2})\s*(?:-|–|—|to)\s*([01]?\d|2[0-3])[:.](\d{2})\b/) ||
    text.match(/\b([01]?\d|2[0-3])[:.](\d{2})\b/)

  if (twentyFourHour) {
    return validTimeOrNull(`${String(twentyFourHour[1]).padStart(2, '0')}:${twentyFourHour[2]}`)
  }

  return extractTime(text)
}

function extractScriptUrls(html: string, baseUrl: string) {
  const urls = new Set<string>()

  const scripts = [
    ...html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi),
    ...html.matchAll(/<link[^>]+href=["']([^"']+\.js(?:\?[^"']*)?)["'][^>]*>/gi),
  ]

  for (const match of scripts) {
    const url = absoluteUrl(baseUrl, match[1])
    if (url && !isJunkUrl(url)) urls.add(url)
  }

  return [...urls]
}

function extractClubAlchemyEventUrlsFromText(value: string, baseUrl: string) {
  const urls = new Set<string>()
  const decoded = decodeEscapedText(value)

  const fullUrlPattern =
    /https?:\/\/(?:www\.)?(?:clubalchemy\.co\.uk|oid2yvxyy4-btej6sd4xq-uk\.a\.run\.app)\/events\/[a-z0-9][a-z0-9_-]*(?:20\d{2}-\d{2}-\d{2})?[a-z0-9_-]*/gi

  for (const match of decoded.matchAll(fullUrlPattern)) {
    const url = publicClubAlchemyUrl(match[0])
    if (url && isClubAlchemyEventPage(url) && !isJunkUrl(url)) urls.add(url)
  }

  const pathPattern =
    /(?:["'`:]|href=|url\()\s*(\/events\/[a-z0-9][a-z0-9_-]*(?:20\d{2}-\d{2}-\d{2})?[a-z0-9_-]*)/gi

  for (const match of decoded.matchAll(pathPattern)) {
    const url = publicClubAlchemyUrl(absoluteUrl(baseUrl, match[1]))
    if (url && isClubAlchemyEventPage(url) && !isJunkUrl(url)) urls.add(url)
  }

  return [...urls]
}

function extractClubAlchemyEventCandidatesFromText(value: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
  }[] = []

  const seen = new Set<string>()
  const decoded = decodeEscapedText(value)
  const discoveredUrls = extractClubAlchemyEventUrlsFromText(decoded, baseUrl)

  for (const href of discoveredUrls) {
    const title = cleanClubAlchemyTitle('', href)
    const eventDate = extractClubAlchemyDateFromUrl(href)

    if (!title || isJunkTitle(title)) continue

    const key = `${normalizeTitle(title)}|${eventDate || 'no-date'}|${normalizeTicketUrl(href)}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: null,
      raw: title,
    })
  }

  const objectLikePattern =
    /(?:title|name)["']?\s*[:=]\s*["']([^"']{3,80})["'][\s\S]{0,900}?(?:date|eventDate|startDate|startsAt|start)["']?\s*[:=]\s*["']?([^"',}\]\s]{8,30})/gi

  let match
  while ((match = objectLikePattern.exec(decoded)) !== null) {
    const rawTitle = cleanText(match[1])
    const date = extractDate(match[2]) || extractDate(match[0])
    if (!date) continue

    const nearbyUrls = extractClubAlchemyEventUrlsFromText(match[0], baseUrl)
    const href =
      nearbyUrls[0] ||
      eventUrlWithAnchor(baseUrl, rawTitle)

    const title = cleanClubAlchemyTitle(rawTitle, href)
    if (!title || isJunkTitle(title)) continue

    const key = `${normalizeTitle(title)}|${date}|${normalizeTicketUrl(href)}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: date,
      start_time: extractClubAlchemyTimeFromText(match[0]),
      raw: cleanText(match[0]).slice(0, 500),
    })
  }

  return candidates
}

function cleanClubAlchemyTitle(value: string, fallbackUrl: string) {
  let title = cleanEventName(value)
    .replace(/\s*\|\s*club alchemy\s*$/i, '')
    .replace(/\s*-\s*club alchemy\s*$/i, '')
    .replace(/^events?\s*[-–:]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  const normalisedTitle = normalizeTitle(title)

  if (!title || normalisedTitle === 'club alchemy' || isJunkTitle(title)) {
    try {
      const slug = new URL(fallbackUrl).pathname.split('/').filter(Boolean).pop() || ''

      const parts = slug
        .replace(/\b20\d{2}-\d{2}-\d{2}\b/g, '')
        .split(/[-_]+/)
        .map((part) => part.trim())
        .filter(Boolean)

      // Manus/Club Alchemy event slugs often end with a random id, e.g. hvYh.
      if (parts.length > 1 && /^[a-z0-9]{4,8}$/i.test(parts[parts.length - 1])) {
        parts.pop()
      }

      title = parts
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    } catch {
      title = ''
    }
  }

  return title
}

async function discoverClubAlchemyEventUrls(sourceUrl: string) {
  const discovered = new Set<string>()
  const bundleUrls = new Set<string>()

  const seedUrls = [
    absoluteUrl(sourceUrl, '/events'),
    absoluteUrl(sourceUrl, '/events/'),
    absoluteUrl(sourceUrl, '/calendar'),
    absoluteUrl(sourceUrl, '/calendar/'),
  ].filter(Boolean) as string[]

  for (const url of seedUrls) discovered.add(url)

  const sitemapUrls = [
    absoluteUrl(sourceUrl, '/sitemap.xml'),
    absoluteUrl(sourceUrl, '/server-sitemap.xml'),
    absoluteUrl(sourceUrl, '/page-sitemap.xml'),
    absoluteUrl(sourceUrl, '/post-sitemap.xml'),
    'https://www.clubalchemy.co.uk/sitemap.xml',
    'https://oid2yvxyy4-btej6sd4xq-uk.a.run.app/sitemap.xml',
  ].filter(Boolean) as string[]

  for (const sitemapUrl of [...new Set(sitemapUrls)]) {
    const xml = await fetchText(sitemapUrl, 'application/xml,text/xml,text/plain')
    if (!xml) continue

    for (const url of extractClubAlchemyEventUrlsFromText(xml, sitemapUrl)) {
      discovered.add(url)
    }

    const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
      .map((match) => cleanText(match[1]))
      .filter((url) => isClubAlchemyEventPage(url))

    for (const url of urls) {
      const publicUrl = publicClubAlchemyUrl(url) || url
      discovered.add(publicUrl)
    }
  }

  for (const seedUrl of seedUrls) {
    const html = await fetchText(seedUrl, 'text/html,application/xhtml+xml,text/plain')
    if (!html) continue

    for (const url of extractClubAlchemyEventUrlsFromText(html, seedUrl)) {
      discovered.add(url)
    }

    for (const scriptUrl of extractScriptUrls(html, seedUrl)) {
      if (isClubAlchemyHost(scriptUrl) || scriptUrl.includes('/assets/')) {
        bundleUrls.add(scriptUrl)
      }
    }
  }

  // Club Alchemy is a React/Vite app. The event links/details can live in the JS bundle,
  // while the raw HTML only shows generic meta tags. Scan the public bundle for event slugs.
  for (const scriptUrl of [...bundleUrls].slice(0, 6)) {
    const js = await fetchText(scriptUrl, 'application/javascript,text/javascript,text/plain,*/*')
    if (!js) continue

    for (const url of extractClubAlchemyEventUrlsFromText(js, scriptUrl)) {
      discovered.add(url)
    }
  }

  return [...discovered]
    .map((url) => publicClubAlchemyUrl(url) || url)
    .filter((url) => !isJunkUrl(url))
}

function extractClubAlchemyEventLinks(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
  }[] = []

  const seen = new Set<string>()
  const links = extractLinks(html, baseUrl)

  for (const link of links) {
    if (!isClubAlchemyEventPage(link.href)) continue
    if (isJunkUrl(link.href)) continue

    const canonicalUrl = publicClubAlchemyUrl(link.href) || link.href

    const rawTitle =
      link.text ||
      cleanText(link.raw.match(/title=["']([^"']+)["']/i)?.[1]) ||
      cleanText(link.raw.match(/aria-label=["']([^"']+)["']/i)?.[1]) ||
      canonicalUrl

    const title = cleanClubAlchemyTitle(rawTitle, canonicalUrl)
    if (!title || isJunkTitle(title)) continue

    const eventDate =
      extractClubAlchemyDateFromUrl(canonicalUrl) ||
      extractCalendarDateFromRaw(link.raw) ||
      extractDate(`${link.raw} ${link.text} ${canonicalUrl}`)

    const startTime = extractTime(`${link.raw} ${link.text}`)
    const key = `${normalizeTitle(title)}|${eventDate || 'no-date'}|${normalizeTicketUrl(canonicalUrl)}`

    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: canonicalUrl,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: link.raw || link.text,
    })
  }

  return candidates
}

function extractClubAlchemySelfEvent(html: string, pageUrl: string) {
  if (!isClubAlchemyEventPage(pageUrl)) return null

  const canonicalRaw = extractClubAlchemyCanonicalUrl(html, pageUrl)
  const eventPageUrl = publicClubAlchemyUrl(canonicalRaw) || canonicalRaw
  const pageTitle = extractPageTitle(html)
  const title = cleanClubAlchemyTitle(pageTitle, eventPageUrl)
  const description =
    extractMetaDescription(html) ||
    cleanDescription(cleanText(html).slice(0, 700)) ||
    title

  const eventDate =
    extractClubAlchemyDateFromUrl(eventPageUrl) ||
    extractClubAlchemyDateFromUrl(pageUrl) ||
    extractDateFromHtml(html) ||
    extractDate(`${pageTitle} ${description} ${eventPageUrl}`)

  if (!title || isJunkTitle(title)) return null

  return {
    href: eventPageUrl,
    text: title,
    event_date: eventDate,
    start_time: extractTime(cleanText(html).slice(0, 3000)),
    raw: description,
  }
}


function clubAlchemyApiUrl(sourceUrl: string) {
  const input = {
    0: { json: null, meta: { values: ['undefined'] } },
    1: {
      json: { query: '', status: 'all', eventType: null },
      meta: { values: { eventType: ['undefined'] } },
    },
    2: { json: null, meta: { values: ['undefined'] } },
  }

  const base = publicClubAlchemyUrl(sourceUrl) || 'https://www.clubalchemy.co.uk/events'

  try {
    const parsed = new URL('/api/trpc/notices.getActive,events.search,events.pastList', base)
    parsed.searchParams.set('batch', '1')
    parsed.searchParams.set('input', JSON.stringify(input))
    return parsed.toString()
  } catch {
    return 'https://www.clubalchemy.co.uk/api/trpc/notices.getActive,events.search,events.pastList?batch=1&input=' + encodeURIComponent(JSON.stringify(input))
  }
}

function parseClubAlchemyApiDateParts(value: string | null | undefined) {
  if (!value) return { event_date: null as string | null, start_time: null as string | null }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { event_date: null as string | null, start_time: null as string | null }

  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date)

    const get = (type: string) => parts.find((part) => part.type === type)?.value || ''
    const year = get('year')
    const month = get('month')
    const day = get('day')
    const hour = get('hour') === '24' ? '00' : get('hour')
    const minute = get('minute')

    return {
      event_date: validDateOrNull(`${year}-${month}-${day}`),
      start_time: validTimeOrNull(`${hour}:${minute}`),
    }
  } catch {
    const isoDate = String(value).slice(0, 10)
    const isoTime = String(value).slice(11, 16)

    return {
      event_date: validDateOrNull(isoDate),
      start_time: validTimeOrNull(isoTime),
    }
  }
}

function clubAlchemyEventPageUrl(event: any) {
  const slug = cleanText(event?.slug)
  if (!slug) return 'https://www.clubalchemy.co.uk/events'
  return `https://www.clubalchemy.co.uk/events/${slug}`
}

function cleanClubAlchemyApiTitle(event: any) {
  const rawTitle = cleanText(event?.title || '')
  const titleFromSlug = cleanClubAlchemyTitle('', clubAlchemyEventPageUrl(event))
  const title = rawTitle && !isJunkTitle(rawTitle) ? rawTitle : titleFromSlug

  return cleanEventName(title.replace(/_/g, ' ')).replace(/\b\w/g, (letter) => letter.toUpperCase())
}

async function fetchClubAlchemyApiEvents(sourceUrl: string) {
  const apiUrl = clubAlchemyApiUrl(sourceUrl)
  const jsonText = await fetchText(apiUrl, 'application/json,text/plain,*/*')

  if (!jsonText) return [] as {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[]

  try {
    const parsed = JSON.parse(jsonText)
    const batchItems = Array.isArray(parsed) ? parsed : [parsed]
    const eventsPayload = batchItems
      .map((item) => item?.result?.data?.json)
      .find((value) => Array.isArray(value))

    if (!Array.isArray(eventsPayload)) return []

    const seen = new Set<string>()
    const candidates: {
      href: string
      text: string
      event_date: string | null
      start_time: string | null
      raw: string
      image_url: string | null
      method: string
    }[] = []

    for (const event of eventsPayload) {
      if (!event || event.isPublished === false) continue

      const title = cleanClubAlchemyApiTitle(event)
      const { event_date, start_time } = parseClubAlchemyApiDateParts(event.startDate)
      const eventPageUrl = clubAlchemyEventPageUrl(event)
      const imageUrl = validImageUrl(event.imageUrl) || validImageUrl(event.eventTypeImageUrl) || null
      const description = cleanText(
        event.description ||
          event.shortDescription ||
          event.guestListInstructions ||
          title
      )
      const ticketOrEventUrl = cleanText(event.ticketUrl) || eventPageUrl
      const key = `${normalizeTitle(title)}|${event_date || 'no-date'}|${event.id || event.slug || ticketOrEventUrl}`

      if (!title || isJunkTitle(title)) continue
      if (seen.has(key)) continue
      seen.add(key)

      candidates.push({
        href: ticketOrEventUrl,
        text: title,
        event_date,
        start_time,
        raw: description,
        image_url: imageUrl,
        method: 'club-alchemy-api',
      })
    }

    return candidates
  } catch (err: any) {
    console.log('CLUB ALCHEMY API PARSE ERROR:', err?.message || 'Unknown parse error')
    return []
  }
}

async function updateVenueImageIfEmpty(venueId: string, imageUrl: string | null) {
  if (!imageUrl) return { updated: false, error: null }

  const { data: venue, error: venueError } = await supabaseAdmin
    .from('venues')
    .select('venue_id, image_url')
    .eq('venue_id', venueId)
    .maybeSingle()

  if (venueError || !venue) return { updated: false, error: venueError }
  if (venue.image_url) return { updated: false, error: null }

  const { error } = await supabaseAdmin
    .from('venues')
    .update({ image_url: imageUrl })
    .eq('venue_id', venueId)

  return { updated: !error, error }
}

function eventDedupeKey(venueId: string, eventName: string, eventDate: string | null, ticketUrl: string) {
  const cleanName = normalizeTitle(cleanEventName(eventName))
  const cleanDate = eventDate || 'no-date'

  try {
    const parsed = new URL(ticketUrl)
    parsed.hash = ''
    parsed.search = ''
    const cleanPath = parsed.pathname.replace(/\/var\/.*$/i, '').replace(/\/$/, '')
    return `${venueId}|${cleanDate}|${cleanName}|${cleanPath}`
  } catch {
    return `${venueId}|${cleanDate}|${cleanName}|${ticketUrl}`
  }
}


function normalizeTicketUrl(url: string) {
  try {
    const parsed = new URL(url)

    parsed.hash = ''
    parsed.search = ''

    const cleanPath = parsed.pathname
      .replace(/\/var\/.*$/i, '')
      .replace(/\/$/, '')

    return `${parsed.origin}${cleanPath}`
  } catch {
    return url
  }
}

function inferEventTags(value: string | null | undefined) {
  const text = normalizeTitle(value || '')
  const tags = new Set<string>()

  if (!text) return []

  if (text.includes('newbie') || text.includes('newcomer') || text.includes('first time')) tags.add('Newbie Friendly')
  if (text.includes('couple')) tags.add('Couples')
  if (text.includes('single')) tags.add('Singles')
  if (text.includes('single men') || text.includes('single guy') || text.includes('single gent')) tags.add('Single Men Welcome')
  if (text.includes('single women') || text.includes('single female') || text.includes('single ladies')) tags.add('Single Women Welcome')
  if (text.includes('bbw') || text.includes('curvy') || text.includes('full figured') || text.includes('full figure')) tags.add('Curvy / BBW')
  if (text.includes('interracial') || text.includes('black magic')) tags.add('Interracial')
  if (text.includes('greedy girl')) tags.add('Greedy Girls')
  if (text.includes('bi') || text.includes('bisexual') || text.includes('biphoria')) tags.add('Bi')
  if (text.includes('hotwife') || text.includes('hot wife')) tags.add('Hotwife')
  if (text.includes('cuckold') || text.includes('cuck')) tags.add('Cuckold')
  if (text.includes('bull')) tags.add('Bull Night')
  if (text.includes('unicorn')) tags.add('Unicorn Friendly')
  if (text.includes('gangbang')) tags.add('Gangbang')
  if (text.includes('fetish')) tags.add('Fetish')
  if (text.includes('kink')) tags.add('Kink')
  if (text.includes('bdsm')) tags.add('BDSM')
  if (text.includes('rope')) tags.add('Rope')
  if (text.includes('shibari')) tags.add('Shibari')
  if (text.includes('dom') || text.includes('sub')) tags.add('Dom/Sub')
  if (text.includes('leather')) tags.add('Leather')
  if (text.includes('latex') || text.includes('rubber')) tags.add('Latex')
  if (text.includes('roleplay') || text.includes('role play')) tags.add('Roleplay')
  if (text.includes('mask') || text.includes('masquerade')) tags.add('Masked')
  if (text.includes('voyeur')) tags.add('Voyeur')
  if (text.includes('exhibition')) tags.add('Exhibitionist')
  if (text.includes('nudist') || text.includes('naturist') || text.includes('naked')) tags.add('Nudist')
  if (text.includes('lgbt') || text.includes('queer')) tags.add('LGBTQ+')
  if (text.includes('trans')) tags.add('Trans Friendly')
  if (text.includes('social')) tags.add('Social')
  if (text.includes('munch')) tags.add('Munch')
  if (text.includes('meet') || text.includes('greet')) tags.add('Meet & Greet')
  if (text.includes('party')) tags.add('Party')
  if (text.includes('club night')) tags.add('Club Night')
  if (text.includes('play party')) tags.add('Play Party')
  if (text.includes('sauna')) tags.add('Sauna')
  if (text.includes('workshop')) tags.add('Workshop')
  if (text.includes('hotel takeover')) tags.add('Hotel Takeover')
  if (text.includes('weekender') || text.includes('weekend')) tags.add('Weekender')
  if (text.includes('festival') || text.includes('fest')) tags.add('Festival')
  if (text.includes('photography')) tags.add('Photography')
  if (text.includes('foot fetish') || text.includes('foot')) tags.add('Foot Fetish')
  if (text.includes('pet play') || text.includes('puppy')) tags.add('Pet Play')

  return [...tags]
}


function cleanDescription(value: string | null | undefined) {
  const cleaned = cleanText(value).trim()

  if (!cleaned) return null

  const badChunks = [
    'home events calendar',
    'events calendar',
    'membership etiquette dress code accommodation',
    'show events search',
    'view as month',
    'add to google calendar',
    'add to icalendar',
  ]

  let output = cleaned

  for (const chunk of badChunks) {
    const index = output.toLowerCase().indexOf(chunk)
    if (index > 20) output = output.slice(0, index).trim()
  }

  if (output.length < 8) return null

  return output.slice(0, 500)
}

function hasBadEventPattern(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return false

  return BAD_EVENT_PATTERNS.some((pattern) => cleaned.includes(pattern))
}

function isBlacklistedTbcEvent(
  venueId: string | null | undefined,
  eventName: string | null | undefined,
  eventDate: string | null
) {
  if (eventDate) return false

  const cleanedVenueId = String(venueId || '').trim()
  const cleanedEventName = normalizeTitle(eventName || '')

  if (TBC_VENUE_BLACKLIST.includes(cleanedVenueId)) return true
  if (TBC_EVENT_NAME_BLACKLIST.includes(cleanedEventName)) return true

  return false
}

function looksLikeStrongUndatedEvent(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return false

  if (isJunkTitle(cleaned)) return false
  if (hasBadEventPattern(cleaned)) return false

  return STRONG_UNDATED_EVENT_KEYWORDS.some((keyword) =>
    cleaned.includes(normalizeTitle(keyword))
  )
}

async function cleanupBadExistingEvents() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('event_id, venue_id, event_name, event_date, ticket_url, description')
    .limit(5000)

  if (error || !data) {
    return { deleted: 0, error }
  }

  const idsToDelete = data
    .filter((event) => {
      const name = cleanEventName(event.event_name || '')
      const ticketUrl = event.ticket_url || ''
      const description = event.description || ''

      if (isBlacklistedTbcEvent(event.venue_id, name, event.event_date)) return true
      if (isJunkTitle(name)) return true
      if (isJunkUrl(ticketUrl)) return true
      if (hasBadEventPattern(`${name} ${description} ${ticketUrl}`)) return true
      if (!event.event_date && !looksLikeStrongUndatedEvent(`${name} ${description}`)) return true

      return false
    })
    .map((event) => event.event_id)

  let deleted = 0

  for (let i = 0; i < idsToDelete.length; i += 100) {
    const batch = idsToDelete.slice(i, i + 100)
    const { error: deleteError } = await supabaseAdmin
      .from('events')
      .delete()
      .in('event_id', batch)

    if (!deleteError) deleted += batch.length
  }

  return { deleted, error: null }
}

function shouldSaveEvent(input: {
  venue_id: string
  event_name: string
  event_date: string | null
  ticket_url: string
  description: string | null
}) {
  const eventName = cleanEventName(input.event_name)

  if (isBlacklistedTbcEvent(input.venue_id, eventName, input.event_date)) return false
  if (isJunkTitle(eventName)) return false
  if (isJunkUrl(input.ticket_url)) return false

  const lowerUrl = input.ticket_url.toLowerCase()
  if (lowerUrl.includes('google.com/calendar')) return false
  if (lowerUrl.includes('ical=1')) return false
  if (lowerUrl.includes('action=template')) return false
  if (lowerUrl.includes('/fetish-guide')) return false
  if (lowerUrl.includes('/fetish-membership')) return false
  if (lowerUrl.includes('/fetish-events-and-cost')) return false

  const combined = `${eventName} ${input.description || ''} ${input.ticket_url}`

  if (hasBadEventPattern(combined)) return false

  // Undated events are allowed, but only when the title/description has a
  // strong event signal. This keeps the Date TBC tab from filling with
  // gallery titles, marketing headings, Outlook links, and general page text.
  if (!input.event_date && !looksLikeStrongUndatedEvent(`${eventName} ${input.description || ''}`)) {
    return false
  }

  if (!looksLikeEvent(combined) && !input.event_date) return false

  return true
}

async function upsertEvent(input: {
  venue_id: string
  event_name: string
  event_date: string | null
  start_time: string | null
  description: string | null
  ticket_url: string
  image_url: string | null
  source_url: string
}) {
  const eventName = cleanEventName(input.event_name)
  const normalised = normalizeTitle(eventName)
  const safeDescription = cleanDescription(input.description)
  const safeImageUrl = validImageUrl(input.image_url)
  const safeTicketUrl = normalizeTicketUrl(input.ticket_url)
  const tags = inferEventTags(`${eventName} ${safeDescription || ''} ${safeTicketUrl}`)

  if (
    !shouldSaveEvent({
      ...input,
      event_name: eventName,
      ticket_url: safeTicketUrl,
    })
  ) {
    return { action: 'skipped', error: null }
  }

  // Important: do not treat a repeated ticket URL as the same event by itself.
  // Some venues, especially Quest, use the same page/anchor for recurring events.
  // A URL match only updates an existing event when the title AND date also match.
  const { data: existingByUrl } = await supabaseAdmin
    .from('events')
    .select('event_id, event_name, event_date')
    .eq('venue_id', input.venue_id)
    .eq('ticket_url', safeTicketUrl)
    .limit(50)

  const matchingByUrl =
    existingByUrl?.filter((event) => {
      const sameTitle = normalizeTitle(event.event_name) === normalised

      if (input.event_date) {
        return sameTitle && event.event_date === input.event_date
      }

      return sameTitle && !event.event_date
    }) || []

  if (matchingByUrl.length > 0) {
    const keeper = matchingByUrl[0]
    const duplicates = matchingByUrl.slice(1)

    if (duplicates.length > 0) {
      await supabaseAdmin
        .from('events')
        .delete()
        .in(
          'event_id',
          duplicates.map((event) => event.event_id)
        )
    }

    const { error } = await supabaseAdmin
      .from('events')
      .update({
        event_name: eventName,
        event_date: input.event_date,
        start_time: input.start_time,
        description: safeDescription,
        image_url: safeImageUrl,
        source_url: input.source_url,
        tags,
        status: 'published',
      })
      .eq('event_id', keeper.event_id)

    return { action: error ? 'error' : 'updated', error }
  }

  if (input.event_date) {
    const { data: existingByTitleDate } = await supabaseAdmin
      .from('events')
      .select('event_id, event_name')
      .eq('venue_id', input.venue_id)
      .eq('event_date', input.event_date)

    const duplicates =
      existingByTitleDate?.filter(
        (event) => normalizeTitle(event.event_name) === normalised
      ) || []

    if (duplicates.length > 0) {
      const keeper = duplicates[0]
      const extras = duplicates.slice(1)

      if (extras.length > 0) {
        await supabaseAdmin
          .from('events')
          .delete()
          .in(
            'event_id',
            extras.map((event) => event.event_id)
          )
      }

      const { error } = await supabaseAdmin
        .from('events')
        .update({
          ticket_url: safeTicketUrl,
          description: safeDescription,
          image_url: safeImageUrl,
          source_url: input.source_url,
          tags,
          status: 'published',
        })
        .eq('event_id', keeper.event_id)

      return { action: error ? 'error' : 'updated', error }
    }
  }

  const { error } = await supabaseAdmin.from('events').insert({
    venue_id: input.venue_id,
    event_name: eventName,
    event_date: input.event_date,
    start_time: input.start_time,
    event_type: 'Club Night',
    description: safeDescription,
    ticket_url: safeTicketUrl,
    image_url: safeImageUrl,
    source_url: input.source_url,
    tags,
    status: 'published',
  })

  return { action: error ? 'error' : 'created', error }
}

export async function GET(request: Request) {
  const startedAt = Date.now()
  const { searchParams } = new URL(request.url)
  const targetVenueId = searchParams.get('venue_id')

  let sourcesQuery = supabaseAdmin
    .from('event_sources')
    .select('source_id, venue_id, source_url, active, collection_method')
    .eq('active', true)

  if (targetVenueId) {
    sourcesQuery = sourcesQuery.eq('venue_id', targetVenueId)
  }

  const { data: sources, error } = await sourcesQuery.limit(MAX_SOURCES)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (targetVenueId && (!sources || sources.length === 0)) {
    return Response.json({
      message: 'No active event source found for venue',
      venue_id: targetVenueId,
      checked_sources: 0,
      checked_pages: 0,
      candidates_found: 0,
      events_created: 0,
      events_updated: 0,
      skipped: 0,
      failed: 0,
      found: [],
      errors: [],
    })
  }

  let checkedPages = 0
  let candidatesFound = 0
  let created = 0
  let updated = 0
  let skipped = 0
  let failed = 0
  let timedOutOrEmpty = 0
  let venueImagesUpdated = 0
  let existingJunkDeleted = 0

  const found: any[] = []
  const errors: any[] = []
  const failedPages: any[] = []
  const runSeen = new Set<string>()

  if (!targetVenueId) {
    const cleanupResult = await cleanupBadExistingEvents()
    existingJunkDeleted = cleanupResult.deleted

    if (cleanupResult.error) {
      errors.push({
        stage: 'cleanup-existing-events',
        error: cleanupResult.error.message,
      })
    }
  }

  for (const source of sources || []) {
    console.log('SOURCE START:', source.source_url)

    if (isVanillaAlternativeSource(`${source.source_url} ${source.venue_id}`)) {
      existingJunkDeleted += await cleanupExistingVenueJunk(source.venue_id)
    }

    if (isIcsSourceUrl(source.source_url)) {
      const result = await scrapeIcsSource({
        venue_id: source.venue_id,
        source_url: source.source_url,
      })

      checkedPages += result.checked_pages
      candidatesFound += result.candidates_found
      created += result.created
      updated += result.updated
      skipped += result.skipped
      failed += result.failed
      timedOutOrEmpty += result.timedOutOrEmpty
      existingJunkDeleted += result.existing_junk_deleted || 0

      for (const item of result.found) {
        if (found.length < MAX_EVENTS_RETURNED) found.push(item)
      }

      for (const item of result.errors) {
        if (errors.length < 20) errors.push(item)
      }

      for (const item of result.failed_pages) {
        if (failedPages.length < 30) failedPages.push(item)
      }

      await supabaseAdmin
        .from('event_sources')
        .update({ last_checked: new Date().toISOString() })
        .eq('source_id', source.source_id)

      console.log('SOURCE DONE:', source.source_url)
      continue
    }

    const clubAlchemyApiEvents =
      isClubAlchemySource(source.source_url) || source.venue_id === 'club_alchemy_northwich'
        ? await fetchClubAlchemyApiEvents(source.source_url)
        : []

    for (const clubAlchemyApiEvent of clubAlchemyApiEvents) {
      candidatesFound++

      const title = clubAlchemyApiEvent.text
      const description = clubAlchemyApiEvent.raw || clubAlchemyApiEvent.text
      const ticketUrl = clubAlchemyApiEvent.href || eventUrlWithAnchor(source.source_url, title)
      const dedupeKey = eventDedupeKey(source.venue_id, title, clubAlchemyApiEvent.event_date, ticketUrl)

      if (runSeen.has(dedupeKey)) {
        skipped++
        continue
      }

      runSeen.add(dedupeKey)

      const result = await upsertEvent({
        venue_id: source.venue_id,
        event_name: title,
        event_date: clubAlchemyApiEvent.event_date,
        start_time: clubAlchemyApiEvent.start_time,
        description,
        ticket_url: ticketUrl,
        image_url: clubAlchemyApiEvent.image_url,
        source_url: source.source_url,
      })

      if (result.action === 'created') created++
      else if (result.action === 'updated') updated++
      else if (result.action === 'skipped') skipped++
      else {
        failed++

        if (errors.length < 20) {
          errors.push({
            venue_id: source.venue_id,
            event_name: title,
            event_date: clubAlchemyApiEvent.event_date,
            error: result.error?.message || 'Unknown upsert error',
          })
        }
      }

      if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
        found.push({
          venue_id: source.venue_id,
          event_name: cleanEventName(title),
          event_date: clubAlchemyApiEvent.event_date,
          event_url: ticketUrl,
          image_url: clubAlchemyApiEvent.image_url,
          method: clubAlchemyApiEvent.method,
        })
      }
    }

    const townhouseDiscoveredUrls =
      source.venue_id === 'townhouse_wirral_near_liverpool'
        ? await discoverTownhouseEventUrls(source.source_url)
        : []

    const questDiscoveredUrls =
      source.venue_id === 'quest_leeds_leeds'
        ? [absoluteUrl(source.source_url, '/upcoming-events/')].filter(Boolean) as string[]
        : []

    const xtasiaDiscoveredUrls =
      source.venue_id === 'xtasia_west_bromwich'
        ? discoverXtasiaEventPages(source.source_url)
        : []

    const wixDiscoveredUrls =
      isWixLikeSource(source.source_url) || source.collection_method === 'User Submission'
        ? discoverWixEventPages(source.source_url)
        : []

    const vanillaAlternativeDiscoveredUrls =
      isVanillaAlternativeSource(`${source.source_url} ${source.venue_id}`)
        ? discoverVanillaAlternativeEventPages(source.source_url)
        : []

    const clubAlchemyDiscoveredUrls =
      isClubAlchemySource(source.source_url) || source.venue_id === 'club_alchemy_northwich'
        ? await discoverClubAlchemyEventUrls(source.source_url)
        : []

    const queue = [source.source_url, ...townhouseDiscoveredUrls, ...questDiscoveredUrls, ...xtasiaDiscoveredUrls, ...wixDiscoveredUrls, ...vanillaAlternativeDiscoveredUrls, ...clubAlchemyDiscoveredUrls]
    const seenPages = new Set<string>()

    const maxPagesForSource =
      source.venue_id === 'townhouse_wirral_near_liverpool'
        ? Math.max(MAX_PAGES_PER_SOURCE, 25)
        : source.venue_id === 'xtasia_west_bromwich'
          ? Math.max(MAX_PAGES_PER_SOURCE, 12)
          : isClubAlchemySource(source.source_url) || source.venue_id === 'club_alchemy_northwich'
            ? Math.max(MAX_PAGES_PER_SOURCE, 30)
            : isVanillaAlternativeSource(`${source.source_url} ${source.venue_id}`)
              ? Math.max(MAX_PAGES_PER_SOURCE, 10)
            : isWixLikeSource(source.source_url)
              ? Math.max(MAX_PAGES_PER_SOURCE, 12)
              : MAX_PAGES_PER_SOURCE

    while (queue.length && seenPages.size < maxPagesForSource) {
      const pageUrl = queue.shift()

      if (!pageUrl || seenPages.has(pageUrl)) continue
      if (!sameDomainOrClubAlchemy(source.source_url, pageUrl)) continue
      if (isJunkUrl(pageUrl)) continue

      seenPages.add(pageUrl)
      checkedPages++

      const html = await fetchHtml(pageUrl)

      if (!html) {
        failed++
        timedOutOrEmpty++

        if (failedPages.length < 30) {
          failedPages.push({
            venue_id: source.venue_id,
            page_url: pageUrl,
            reason: 'fetchHtml returned empty/null',
          })
        }

        continue
      }

      try {
        const pageImage = extractBestImage(html, pageUrl)

        if (pageImage) {
          const venueImageResult = await updateVenueImageIfEmpty(
            source.venue_id,
            pageImage
          )

          if (venueImageResult.updated) venueImagesUpdated++
        }

        const pageText = cleanText(html).slice(0, 8000)
        const jsonLdEvents = extractJsonLdEvents(html, pageUrl)
        const calendarLinks = extractCalendarEventLinks(html, pageUrl)
        const townhouseEvents =
          source.venue_id === 'townhouse_wirral_near_liverpool'
            ? extractTownhouseEvents(html, pageUrl)
            : []
        const questEvents =
          source.venue_id === 'quest_leeds_leeds'
            ? extractQuestEvents(html, pageUrl)
            : []
        const xtasiaEvents =
          source.venue_id === 'xtasia_west_bromwich'
            ? await extractXtasiaEvents(html, pageUrl)
            : []
        const wixTileEvents =
          isWixLikeSource(`${source.source_url} ${html}`)
            ? extractWixCalendarTileEvents(html, pageUrl)
            : []
        const vanillaAlternativeEvents =
          isVanillaAlternativeSource(`${source.source_url} ${source.venue_id} ${pageUrl}`)
            ? extractVanillaAlternativeEvents(html, pageUrl)
            : []
        let clubAlchemyBundleEvents: {
          href: string
          text: string
          event_date: string | null
          start_time: string | null
          raw: string
        }[] = []

        if (isClubAlchemySource(source.source_url) || source.venue_id === 'club_alchemy_northwich') {
          const scriptUrls = extractScriptUrls(html, pageUrl)

          for (const scriptUrl of scriptUrls.slice(0, 4)) {
            const js = await fetchText(scriptUrl, 'application/javascript,text/javascript,text/plain,*/*')
            if (js) {
              clubAlchemyBundleEvents.push(
                ...extractClubAlchemyEventCandidatesFromText(js, scriptUrl)
              )
            }
          }
        }

        const clubAlchemyEvents =
          isClubAlchemySource(source.source_url) || source.venue_id === 'club_alchemy_northwich'
            ? [
                ...extractClubAlchemyEventLinks(html, pageUrl),
                ...clubAlchemyBundleEvents,
                ...(extractClubAlchemySelfEvent(html, pageUrl)
                  ? [extractClubAlchemySelfEvent(html, pageUrl)!]
                  : []),
              ]
            : []
        const links = extractLinks(html, pageUrl)

        for (const clubAlchemyEvent of clubAlchemyEvents) {
          candidatesFound++

          let eventHtml: string | null = null
          let title = clubAlchemyEvent.text
          let description = clubAlchemyEvent.raw || clubAlchemyEvent.text
          let imageUrl = pageImage
          let eventDate = clubAlchemyEvent.event_date
          let startTime = clubAlchemyEvent.start_time
          const ticketUrl = clubAlchemyEvent.href || eventUrlWithAnchor(pageUrl, title)

          if (sameDomainOrClubAlchemy(source.source_url, ticketUrl) && isClubAlchemyEventPage(ticketUrl)) {
            eventHtml = ticketUrl === pageUrl ? html : await fetchHtml(ticketUrl)

            if (eventHtml) {
              const selfEvent = extractClubAlchemySelfEvent(eventHtml, ticketUrl)
              title = selfEvent?.text || cleanClubAlchemyTitle(extractPageTitle(eventHtml) || title, ticketUrl) || title
              description =
                selfEvent?.raw ||
                extractMetaDescription(eventHtml) ||
                cleanText(eventHtml).slice(0, 300) ||
                description
              imageUrl = extractBestImage(eventHtml, ticketUrl) || pageImage
              eventDate =
                eventDate ||
                selfEvent?.event_date ||
                extractClubAlchemyDateFromUrl(ticketUrl) ||
                extractDateFromHtml(eventHtml)
              startTime = startTime || selfEvent?.start_time || extractTime(cleanText(eventHtml).slice(0, 3000))
            }
          }

          const dedupeKey = eventDedupeKey(source.venue_id, title, eventDate, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: eventDate,
            start_time: startTime,
            description,
            ticket_url: ticketUrl,
            image_url: imageUrl,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else failed++

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: eventDate,
              event_url: ticketUrl,
              image_url: imageUrl,
              method: 'club-alchemy-custom',
            })
          }
        }

        for (const vanillaEvent of vanillaAlternativeEvents) {
          candidatesFound++

          const title = vanillaEvent.text
          const description = vanillaEvent.raw || vanillaEvent.text
          const ticketUrl = vanillaEvent.href || eventUrlWithAnchor(pageUrl, title)
          const dedupeKey = eventDedupeKey(source.venue_id, title, vanillaEvent.event_date, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: vanillaEvent.event_date,
            start_time: vanillaEvent.start_time,
            description,
            ticket_url: ticketUrl,
            image_url: vanillaEvent.image_url,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else failed++

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: vanillaEvent.event_date,
              event_url: ticketUrl,
              image_url: vanillaEvent.image_url,
              method: 'vanilla-alternative-timetable',
            })
          }
        }

        for (const questEvent of questEvents) {
          candidatesFound++

          const title = questEvent.text
          const description = questEvent.raw || questEvent.text
          const ticketUrl = questEvent.href || eventUrlWithAnchor(pageUrl, title)
          const dedupeKey = eventDedupeKey(source.venue_id, title, questEvent.event_date, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: questEvent.event_date,
            start_time: questEvent.start_time,
            description,
            ticket_url: ticketUrl,
            image_url: pageImage,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else failed++

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: questEvent.event_date,
              event_url: ticketUrl,
              image_url: pageImage,
              method: 'quest-custom',
            })
          }
        }

        for (const xtasiaEvent of xtasiaEvents) {
          candidatesFound++

          const title = xtasiaEvent.text
          const description = xtasiaEvent.raw || `${xtasiaEvent.text} Xtasia diary`
          const ticketUrl = xtasiaEvent.href || eventUrlWithAnchor(pageUrl, title)
          const dedupeKey = eventDedupeKey(source.venue_id, title, xtasiaEvent.event_date, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: xtasiaEvent.event_date,
            start_time: xtasiaEvent.start_time,
            description,
            ticket_url: ticketUrl,
            image_url: pageImage,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else failed++

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: xtasiaEvent.event_date,
              event_url: ticketUrl,
              image_url: pageImage,
              method: 'xtasia-calendar',
            })
          }
        }

        for (const townhouseEvent of townhouseEvents) {
          candidatesFound++

          let eventHtml: string | null = null
          let title = townhouseEvent.text
          let description = townhouseEvent.text
          let imageUrl = pageImage
          let eventDate = townhouseEvent.event_date
          let startTime = townhouseEvent.start_time

          if (sameDomain(source.source_url, townhouseEvent.href) && townhouseEvent.href.includes('/events/')) {
            eventHtml = await fetchHtml(townhouseEvent.href)

            if (eventHtml) {
              title = extractPageTitle(eventHtml) || title
              description = extractMetaDescription(eventHtml) || cleanText(eventHtml).slice(0, 300)
              imageUrl = extractBestImage(eventHtml, townhouseEvent.href) || pageImage
              eventDate = eventDate || extractDateFromHtml(eventHtml)
              startTime = startTime || extractTime(cleanText(eventHtml).slice(0, 3000))
            }
          }

          const ticketUrl = townhouseEvent.href || eventUrlWithAnchor(pageUrl, title)

          const dedupeKey = eventDedupeKey(source.venue_id, title, eventDate, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: eventDate,
            start_time: startTime,
            description,
            ticket_url: ticketUrl,
            image_url: imageUrl,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else failed++

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: eventDate,
              event_url: ticketUrl,
              image_url: imageUrl,
              method: 'townhouse-custom',
            })
          }
        }

        for (const wixEvent of wixTileEvents) {
          candidatesFound++

          const title = wixEvent.text
          const description = `${wixEvent.text}${wixEvent.raw ? ` - ${cleanText(wixEvent.raw).slice(0, 240)}` : ''}`
          const ticketUrl = wixEvent.href || eventUrlWithAnchor(pageUrl, title)
          const dedupeKey = eventDedupeKey(source.venue_id, title, wixEvent.event_date, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: wixEvent.event_date,
            start_time: wixEvent.start_time,
            description,
            ticket_url: ticketUrl,
            image_url: pageImage,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else failed++

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: wixEvent.event_date,
              event_url: ticketUrl,
              image_url: pageImage,
              method: 'wix-calendar-tile',
            })
          }
        }

        for (const event of jsonLdEvents) {
          candidatesFound++

          const dedupeKey = eventDedupeKey(
            source.venue_id,
            event.name,
            event.date || extractDate(`${event.name} ${event.description}`),
            event.url || pageUrl
          )

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: event.name,
            event_date: event.date || extractDate(`${event.name} ${event.description}`),
            start_time: event.start_time || extractTime(`${event.name} ${event.description}`),
            description: event.description || event.name,
            ticket_url: event.url || pageUrl,
            image_url: event.image_url || pageImage,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else failed++

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(event.name),
              event_date: event.date,
              event_url: event.url || pageUrl,
              image_url: event.image_url || pageImage,
              method: 'json-ld',
            })
          }
        }

        for (const calendarEvent of calendarLinks) {
          candidatesFound++

          let eventHtml: string | null = null
          let title = calendarEvent.text
          let description = calendarEvent.text
          let imageUrl = pageImage
          let eventDate = calendarEvent.event_date
          let startTime = extractTime(calendarEvent.raw)

          if (sameDomain(source.source_url, calendarEvent.href)) {
            eventHtml = await fetchHtml(calendarEvent.href)

            if (eventHtml) {
              title = extractPageTitle(eventHtml) || title
              description = extractMetaDescription(eventHtml) || cleanText(eventHtml).slice(0, 300)
              imageUrl = extractBestImage(eventHtml, calendarEvent.href) || pageImage
              eventDate = eventDate || extractDateFromHtml(eventHtml)
              startTime = startTime || extractTime(cleanText(eventHtml).slice(0, 3000))
            }
          }

          const dedupeKey = eventDedupeKey(
            source.venue_id,
            title,
            eventDate,
            calendarEvent.href
          )

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: eventDate,
            start_time: startTime,
            description,
            ticket_url: calendarEvent.href,
            image_url: imageUrl,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else failed++

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: eventDate,
              event_url: calendarEvent.href,
              image_url: imageUrl,
              method: 'calendar-link',
            })
          }
        }

        for (const link of links) {
          if (isVanillaAlternativeSource(`${source.source_url} ${source.venue_id}`)) {
            skipped++
            continue
          }

          const combined = `${link.href} ${link.text} ${link.raw}`

          if (
            sameDomainOrClubAlchemy(source.source_url, link.href) &&
            looksLikeUsefulPage(combined) &&
            !isJunkUrl(link.href) &&
            !seenPages.has(link.href) &&
            !queue.includes(link.href) &&
            queue.length + seenPages.size < maxPagesForSource
          ) {
            queue.push(link.href)
          }

          if (!looksLikeEvent(combined)) {
            skipped++
            continue
          }

          if (isJunkUrl(link.href)) {
            skipped++
            continue
          }

          const eventName = cleanEventName(link.text)

          if (isJunkTitle(eventName)) {
            skipped++
            continue
          }

          let eventHtml: string | null = null
          let imageUrl = pageImage
          let description = link.text
          let eventDate = extractDate(`${link.text} ${link.href}`)
          let startTime = extractTime(`${link.text} ${pageText}`)

          if (sameDomainOrClubAlchemy(source.source_url, link.href)) {
            eventHtml = await fetchHtml(link.href)

            if (eventHtml) {
              const detailTitle = extractPageTitle(eventHtml)
              const detailDescription = extractMetaDescription(eventHtml)
              const detailDate = extractDateFromHtml(eventHtml)

              imageUrl = extractBestImage(eventHtml, link.href) || pageImage
              description = detailDescription || description
              eventDate = eventDate || detailDate
              startTime = startTime || extractTime(cleanText(eventHtml).slice(0, 3000))

              if (detailTitle && !isJunkTitle(detailTitle)) {
                description = detailDescription || description
              }
            }
          }

          candidatesFound++

          const dedupeKey = eventDedupeKey(source.venue_id, eventName, eventDate, link.href)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: eventName,
            event_date: eventDate,
            start_time: startTime,
            description,
            ticket_url: link.href,
            image_url: imageUrl,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') skipped++
          else {
            failed++
            if (errors.length < 20) {
              errors.push({
                venue_id: source.venue_id,
                event_name: eventName,
                event_url: link.href,
                error: result.error?.message,
              })
            }
          }

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: eventName,
              event_date: eventDate,
              event_url: link.href,
              image_url: imageUrl,
              method: 'link-scan',
            })
          }
        }
      } catch (err: any) {
        failed++

        if (errors.length < 20) {
          errors.push({
            venue_id: source.venue_id,
            source_url: pageUrl,
            error: err?.message || 'Unknown scrape error',
          })
        }
      }
    }

    await supabaseAdmin
      .from('event_sources')
      .update({ last_checked: new Date().toISOString() })
      .eq('source_id', source.source_id)

    console.log('SOURCE DONE:', source.source_url)
  }

  return Response.json({
    message: 'Scrape finished',
    runtime_seconds: Math.round((Date.now() - startedAt) / 1000),
    limits: {
      max_sources: MAX_SOURCES,
      max_pages_per_source: MAX_PAGES_PER_SOURCE,
      fetch_timeout_ms: FETCH_TIMEOUT_MS,
    },
    target_venue_id: targetVenueId,
    checked_sources: sources?.length || 0,
    checked_pages: checkedPages,
    candidates_found: candidatesFound,
    events_created: created,
    events_updated: updated,
    venue_images_updated: venueImagesUpdated,
    existing_junk_deleted: existingJunkDeleted,
    skipped,
    failed,
    timedOutOrEmpty,
    failed_pages: failedPages,
    found,
    errors,
  })
}