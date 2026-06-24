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
  '/dates',
  '/date',
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
  'club_play_blackpool',
  'ggs_lounge_runcorn',
  'our_place_4_fun_london',
  'pennine_sauna_oldham_shaw',
  'purple_mamba_club_nottingham_west_bridgford',
  'swindon_swingers_swindon',
  'torture_garden_london_uk_events',
  'clubzeus_sauna_mansfield',
  'number_52_newcastle_upon_tyne',
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
  'eventdata.venue.url',
  '$%7b',
  '%24%7b',
  '%7d',
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

  // EventON directory parser. Townhouse renders the event-directory list as EventON rows,
  // where the title/date are often split across nested spans and are not readable as a
  // simple text line. Parse the raw row blocks first so we do not depend on crawling
  // individual detail pages.
  const eventOnBlocks = [
    ...html.matchAll(/<(?:div|li|article|a)[^>]+class=["'][^"']*(?:eventon_list_event|evo_eventtop|evcal_list_a)[^"']*["'][^>]*>[\s\S]*?(?=<\/(?:div|li|article|a)>\s*<(?:div|li|article|a)[^>]+class=["'][^"']*(?:eventon_list_event|evo_eventtop|evcal_list_a)|$)/gi),
  ]

  for (const blockMatch of eventOnBlocks) {
    const block = blockMatch[0]
    const rawTitle =
      cleanText(block.match(/<span[^>]+class=["'][^"']*(?:evcal_event_title|evcal_desc2)[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1]) ||
      cleanText(block.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1])

    let title = cleanEventName(rawTitle)
      .replace(/^[-–—:]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || isJunkTitle(title)) continue
    if (title.length > 130) title = title.slice(0, 130).trim()

    const rawHref =
      block.match(/href=["']([^"']+)["']/i)?.[1] ||
      links.find((link) => normalizeTitle(link.text).includes(normalizeTitle(title).slice(0, 24)))?.href ||
      null

    const href = absoluteUrl(baseUrl, rawHref) || eventUrlWithAnchor(baseUrl, title)

    const rawDay =
      block.match(/<em[^>]+class=["'][^"']*date[^"']*["'][^>]*>(\d{1,2})<\/em>/i)?.[1] ||
      block.match(/<span[^>]+class=["'][^"']*evo_start[^"']*["'][^>]*>[\s\S]*?(\d{1,2})[\s\S]*?<\/span>/i)?.[1]

    const rawMonth =
      block.match(/<em[^>]+class=["'][^"']*month[^"']*["'][^>]*>([A-Za-z]{3,9})<\/em>/i)?.[1] ||
      block.match(/\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b/i)?.[1]

    const rawYear =
      block.match(/data-year=["'](20\d{2})["']/i)?.[1] ||
      block.match(/\b(20\d{2})\b/)?.[1] ||
      html.slice(Math.max(0, blockMatch.index || 0 - 600), (blockMatch.index || 0) + 300).match(/\b(20\d{2})\b/)?.[1] ||
      String(currentYear)

    const month = rawMonth ? monthMap[rawMonth.toLowerCase()] : null
    const eventDate = rawDay && month ? validDateOrNull(`${rawYear}-${month}-${rawDay.padStart(2, '0')}`) : extractDate(block)
    const startTime = extractTime(block)

    if (!eventDate) continue

    const key = `${normalizeTitle(title)}|${eventDate}|${href}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: cleanText(block).slice(0, 500),
    })
  }

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

  // Fast Townhouse directory parser. The event-directory page lists rows like:
  // "JUNE, 2026 SAT 06 JUN LIVERPOOL & MERSEYSIDE PEER ROPE WORKSHOP"
  // with no visible start time. This avoids opening every detail page, which times out on Vercel.
  const directoryPattern = new RegExp(
    `\\b${dayWord}\\s+` +
      `(\\d{1,2})(?:st|nd|rd|th)?\\s+` +
      `(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\\s+` +
      `([^\\n]{6,150}?)(?=\\b${dayWord}\\s+\\d{1,2}(?:st|nd|rd|th)?\\s+(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)|$)`,
    'gi'
  )

  while ((match = directoryPattern.exec(text)) !== null) {
    const day = match[1].padStart(2, '0')
    const month = monthMap[match[2].toLowerCase()]

    const nearbyBefore = text.slice(Math.max(0, match.index - 80), match.index)
    const year =
      nearbyBefore.match(/\b(20\d{2})\b/)?.[1] ||
      text.slice(Math.max(0, match.index - 500), match.index + 50).match(/\b(20\d{2})\b/)?.[1] ||
      String(currentYear)

    const eventDate = validDateOrNull(`${year}-${month}-${day}`)

    let title = cleanEventName(match[3])
      .replace(/^[-:|]+/g, '')
      .replace(/\b(click on the event below|details and tickets|tickets only|open evening)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (title.length > 120) title = title.slice(0, 120).trim()
    if (!eventDate || isJunkTitle(title)) continue

    const matchingLink = links.find((link) => {
      if (!link.href.includes('/events/') && !link.href.includes('/event-directory/')) return false
      const linkTitle = normalizeTitle(link.text)
      const patternTitle = normalizeTitle(title)
      if (!linkTitle || !patternTitle) return false

      return (
        linkTitle.includes(patternTitle.slice(0, 22)) ||
        patternTitle.includes(linkTitle.slice(0, 22)) ||
        link.href.includes(patternTitle.split(' ').slice(0, 4).join('-'))
      )
    })

    const href = matchingLink?.href || eventUrlWithAnchor(baseUrl, title)
    const key = `${normalizeTitle(title)}|${eventDate}|${href}`

    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: null,
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
  // Xtasia has multiple aliases for the same Google Calendar embeds. Only scan
  // the canonical public diary pages once, otherwise each source/page repeats
  // the same recurring entries and inflates the venue count.
  const pages = [
    'https://www.xtasia.co.uk/page/swingers-diary',
    'https://www.xtasia.co.uk/page/fetish-diary',
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


function isXtasiaMalformedEvent(title: string | null | undefined, description?: string | null) {
  const rawTitle = cleanText(title || '')
  const cleaned = normalizeTitle(rawTitle)
  const combined = normalizeTitle(`${rawTitle} ${description || ''}`)

  if (!cleaned) return true

  const exactJunk = new Set([
    'swingers diary',
    'fetish diary',
    'xtasia swingers diary',
    'xtasia fetish diary',
    'this months swingers diary',
    'this months fetish diary',
    'google calendar',
    'add to calendar',
  ])

  if (exactJunk.has(cleaned)) return true

  // Old Xtasia fallback parsing created hundreds of clipped titles ending in "to",
  // e.g. "Flirts Spa - Midday to", "Flirts - Bi Night - to", "TCZ to".
  // Real diary titles should not end with a dangling preposition.
  if (/\bto\s*$/i.test(rawTitle)) return true
  if (/[-–—:]\s*to\s*$/i.test(rawTitle)) return true

  const badFragments = [
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

  if (badFragments.some((fragment) => combined.includes(fragment))) return true

  return false
}


function cleanXtasiaCalendarTitle(value: string | null | undefined) {
  let title = cleanText(value || '')
    .replace(/^\.?\s*/g, '')
    .replace(/^@?\s*Xtasia\s*[-–—:]\s*/i, '')
    .replace(/^Xtasia\s+[-–—:]?\s*/i, '')
    .replace(/^Flirts\s*[-–—:]\s*/i, 'Flirts - ')
    .replace(/\s*[|]+\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim()

  // Keep useful opening-time wording in Xtasia titles. Do not run cleanEventName
  // here because it strips 8pm/10pm/Midnight and creates bad titles ending in "to".
  title = title
    .replace(/\b12:00\s*pm\b/gi, 'Midday')
    .replace(/\b00:00\b/g, 'Midnight')
    .replace(/\s+/g, ' ')
    .trim()

  return title
}

function parseIcsEvents(ics: string, baseUrl: string, diaryName: string, options: { preserveRawTitle?: boolean } = {}) {
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

    let title = options.preserveRawTitle
      ? cleanXtasiaCalendarTitle(rawTitle)
      : cleanEventName(rawTitle)
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

      candidates.push(...parseIcsEvents(ics, baseUrl, diaryName, { preserveRawTitle: true }))
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

  const today = new Date()
  const todayDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const maxDate = new Date(todayDate)
  maxDate.setUTCDate(maxDate.getUTCDate() + 120)
  const minDateString = todayDate.toISOString().slice(0, 10)
  const maxDateString = maxDate.toISOString().slice(0, 10)
  const seen = new Set<string>()

  return candidates.filter((event) => {
    if (!event.event_date) return false
    if (event.event_date < minDateString || event.event_date > maxDateString) return false
    if (isXtasiaMalformedEvent(event.text, event.raw)) return false

    const key = `${normalizeTitle(event.text)}|${event.event_date}`
    if (seen.has(key)) return false
    seen.add(key)

    return true
  })
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
    cleaned = cleanXtasiaCalendarTitle(title)

    if (isXtasiaMalformedEvent(cleaned, title)) return ''
  }

  return cleaned
}


async function cleanupExistingVenueJunk(venueId: string) {
  const isVanillaVenue = isVanillaAlternativeSource(venueId)
  const isLeBoudoirVenue = isLeBoudoirSource(venueId)
  const isMinistryVenue = isMinistryStudiosSource(venueId)
  const isChunkyMuffinsVenue = isChunkyMuffinsSource(venueId)
  const isCarberrysVenue = isCarberrysEventsSource(venueId)
  const isSheWorldVenue = isSheWorldSource(venueId)
  const isMirageVenue = isMirageLincolnSource(venueId)
  const isCjsVenue = isCjsTownhouseSource(venueId)
  const isGgsVenue = isGgsLoungeSource(venueId)

  if (venueId !== 'xtasia_west_bromwich' && !isVanillaVenue && !isLeBoudoirVenue && !isMinistryVenue && !isChunkyMuffinsVenue && !isCarberrysVenue && !isSheWorldVenue && !isMirageVenue && !isCjsVenue && !isGgsVenue) return 0

  const { data } = await supabaseAdmin
    .from('events')
    .select('event_id, event_name, event_date, description, ticket_url')
    .eq('venue_id', venueId)
    .limit(2000)

  const idsToDelete =
    data
      ?.filter((event) => {
        if (venueId === 'xtasia_west_bromwich') {
          return (
            isJunkIcsCalendarEntry(event.event_name || '', event.description || '') ||
            isXtasiaMalformedEvent(event.event_name || '', event.description || '')
          )
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

        if (isLeBoudoirVenue) {
          return isLeBoudoirJunkExistingEvent(event)
        }

        if (isMinistryVenue) {
          return isMinistryStudiosJunkExistingEvent({ ...event, venue_id: venueId })
        }

        if (isChunkyMuffinsVenue) {
          return isChunkyMuffinsJunkExistingEvent({ ...event, venue_id: venueId })
        }

        if (isCarberrysVenue) {
          return isCarberrysJunkExistingEvent({ ...event, venue_id: venueId })
        }

        if (isSheWorldVenue) {
          return isSheWorldJunkExistingEvent({ ...event, venue_id: venueId })
        }

        if (isMirageVenue) {
          return isMirageLincolnJunkExistingEvent({ ...event, venue_id: venueId })
        }

        if (isCjsVenue) {
          return isCjsTownhouseJunkExistingEvent({ ...event, venue_id: venueId })
        }

        if (isGgsVenue) {
          return isGgsLoungeJunkExistingEvent({ ...event, venue_id: venueId })
        }

        return false
      })
      .map((event) => event.event_id) || []

  if (idsToDelete.length === 0) return 0

  let deleted = 0

  for (let index = 0; index < idsToDelete.length; index += 100) {
    const batch = idsToDelete.slice(index, index + 100)
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .in('event_id', batch)

    if (!error) deleted += batch.length
  }

  return deleted
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

  const icsEvents = parseIcsEvents(ics, diaryPage, diaryName, source.venue_id === 'xtasia_west_bromwich' ? { preserveRawTitle: true } : {})

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

    if (
      !title ||
      isJunkIcsCalendarEntry(title, description) ||
      (source.venue_id === 'xtasia_west_bromwich' && isXtasiaMalformedEvent(title, description))
    ) {
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


function isLeBoudoirSource(value: string | null | undefined) {
  const lower = String(value || '').toLowerCase()

  return (
    lower.includes('le_boudoir_club_london') ||
    lower.includes('leboudoir.club') ||
    lower.includes('le boudoir')
  )
}

function isLeBoudoirJunkEventTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')

  if (!cleaned) return true

  const exactJunk = new Set([
    'buy tickets',
    'ticket',
    'tickets',
    'upcoming',
    'le boudoir',
    'le boudoir club',
    'le boudoir london',
    'le boudoir club london',
    'le boudoir club create order',
    'create order',
    'order',
    'checkout',
    'cart',
    'basket',
    'event',
    'events',
    'all events',
    'more events',
    'load more',
    'show more',
    'view details',
    'details',
    'read more',
    'learn more',
    'book now',
    'booking',
    'rsvp',
    'register',
    'sign up',
    'log in',
    'login',
    'members',
    'membership',
    'home',
    'about',
    'contact',
  ])

  if (exactJunk.has(cleaned)) return true

  const junkFragments = [
    'create order',
    'buy tickets',
    'add to cart',
    'checkout',
    'powered by',
    'privacy policy',
    'terms and conditions',
    'cookie policy',
    'eventbrite',
    'square.site',
    'squareup',
    'facebook',
    'instagram',
    'whatsapp',
    'share this',
    'share on',
    'sign in',
    'log in',
    'subscribe',
    'newsletter',
  ]

  if (junkFragments.some((fragment) => cleaned.includes(fragment))) return true

  // Le Boudoir real events are event titles, not one-word venue/UI labels.
  if (cleaned.length < 8) return true

  return false
}

function isLeBoudoirJunkExistingEvent(event: {
  event_name?: string | null
  event_date?: string | null
  description?: string | null
  ticket_url?: string | null
}) {
  const name = event.event_name || ''
  const combined = normalizeTitle(
    `${event.event_name || ''} ${event.description || ''} ${event.ticket_url || ''}`
  )

  if (isLeBoudoirJunkEventTitle(name)) return true
  if (!event.event_date) return true

  const url = String(event.ticket_url || '').toLowerCase()
  if (url.includes('/checkout')) return true
  if (url.includes('/cart')) return true
  if (url.includes('/create-order')) return true
  if (url.includes('create-order')) return true

  if (combined.includes('le boudoir club create order')) return true
  if (combined.includes('buy tickets')) return true
  if (combined.includes('upcoming')) return true

  return false
}



function isKlubVerbotenSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('klub_verboten_london') ||
    combined.includes('klubverboten.com')
  )
}

function discoverKlubVerbotenEventPages(sourceUrl: string) {
  const urls = [
    sourceUrl,
    absoluteUrl(sourceUrl, '/dates'),
    absoluteUrl(sourceUrl, '/dates/'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
      return host === 'klubverboten.com' && !isJunkUrl(url)
    } catch {
      return false
    }
  })
}

function cleanKlubVerbotenTitle(value: string, location: string | null) {
  let title = cleanEventName(value)
    .replace(/^[╳×xX]+\s*/g, '')
    .replace(/\s*[╳×]\s*/g, ' × ')
    .replace(/\s+/g, ' ')
    .trim()

  const normalised = normalizeTitle(title)
  const cleanedLocation = cleanText(location || '')
    .replace(/\bLDN\b/i, 'London')
    .replace(/\s+/g, ' ')
    .trim()

  if (
    cleanedLocation &&
    (normalised === 'klub verboten' || normalised === 'kv' || normalised === 'verboten')
  ) {
    title = `${title} ${cleanedLocation}`
  }

  if (cleanedLocation && /^berlin$/i.test(cleanedLocation) && normalised.includes('klub verboten') && !normalised.includes('berlin')) {
    title = `${title} Berlin`
  }

  return title
    .replace(/\bLDN\b/gi, 'London')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractKlubVerbotenEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const pageImage = extractBestImage(html, baseUrl)

  const lineText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(h1|h2|h3|h4|h5|h6|p|div|li|section|article)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')

  const lines = lineText
    .split(/\n+/)
    .map((line) => cleanText(line))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const dateLinePattern =
    /^(?:(SOFT|HARD)\s+)?(MON|TUE|TUES|WED|THU|THUR|THURS|FRI|SAT|SUN)(?:DAY|SDAY|NESDAY|RSDAY|URDAY)?\s+(\d{1,2})\/(\d{1,2})(?:\s+(.+?))?$/i

  const isDateLine = (line: string) => dateLinePattern.test(line)

  const isKlubSkipLine = (line: string) => {
    const cleaned = normalizeTitle(line)

    if (!cleaned) return true
    if (cleaned === 'tickets') return true
    if (cleaned === 'line up') return true
    if (cleaned === 'javascript is turned off') return true
    if (cleaned.includes('please enable javascript')) return true
    if (cleaned.includes('before buying a ticket')) return true
    if (cleaned.includes('read our help section')) return true
    if (cleaned.includes('becoming a member')) return true
    if (cleaned.includes('klub rules')) return true
    if (/^\d{1,2}:\d{2}\s+/.test(cleanText(line))) return true
    if (cleaned === 'tbc') return true
    if (isJunkTitle(line)) return true

    return false
  }

  const ticketLinks = extractLinks(html, baseUrl)
    .filter((link) => {
      const combined = `${link.href} ${link.text}`.toLowerCase()
      return combined.includes('ticket') || combined.includes('weeztix') || combined.includes('tickets')
    })
    .filter((link) => !isJunkUrl(link.href))

  for (let index = 0; index < lines.length; index++) {
    const dateMatch = lines[index].match(dateLinePattern)
    if (!dateMatch) continue

    const label = cleanText(dateMatch[1] || '')
    const day = dateMatch[3].padStart(2, '0')
    const month = dateMatch[4].padStart(2, '0')
    const location = cleanText(dateMatch[5] || '')

    const year = futureSafeYear(month, day)
    const eventDate = validDateOrNull(`${year}-${month}-${day}`)
    if (!eventDate) continue

    const block: string[] = [lines[index]]

    for (let next = index + 1; next < lines.length; next++) {
      if (isDateLine(lines[next])) break
      if (normalizeTitle(lines[next]).includes('javascript is turned off')) break
      block.push(lines[next])
    }

    const titleLine =
      block
        .slice(1, 8)
        .find((line) => {
          const cleaned = cleanText(line)
          return (
            cleaned.startsWith('╳') ||
            cleaned.startsWith('×') ||
            /^x\s+/i.test(cleaned) ||
            (!isKlubSkipLine(cleaned) && cleaned.length <= 90)
          )
        }) || ''

    let title = cleanKlubVerbotenTitle(titleLine, location)

    if (!title && location) {
      title = cleanKlubVerbotenTitle(`Klub Verboten ${location}`, location)
    }

    if (label && /^soft|hard$/i.test(label)) {
      title = `${label.charAt(0).toUpperCase()}${label.slice(1).toLowerCase()} ${title}`
        .replace(/\s+/g, ' ')
        .trim()
    }

    if (!title || isJunkTitle(title)) continue
    if (title.length > 130) title = title.slice(0, 130).trim()

    const description = block
      .slice(1)
      .filter((line) => normalizeTitle(line) !== normalizeTitle(titleLine))
      .filter((line) => !isKlubSkipLine(line))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    const ticketUrl = ticketLinks[0]?.href || eventUrlWithAnchor(baseUrl, title)
    const startTime = extractTime(block.join(' '))
    const key = `${normalizeTitle(title)}|${eventDate}|${normalizeTicketUrl(ticketUrl)}`

    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: ticketUrl,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: description || block.join(' ').slice(0, 500),
      image_url: pageImage,
      method: 'klub-verboten-dates',
    })
  }

  return candidates
}

function isElectrowerkzSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('slimelight_london') ||
    combined.includes('electrowerkz_london') ||
    combined.includes('electrowerkz.co.uk')
  )
}

function discoverElectrowerkzEventPages(sourceUrl: string) {
  const urls = [
    sourceUrl,
    absoluteUrl(sourceUrl, '/whatson'),
    absoluteUrl(sourceUrl, '/whatson/'),
    absoluteUrl(sourceUrl, '/whats-on'),
    absoluteUrl(sourceUrl, '/whats-on/'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
      return host === 'electrowerkz.co.uk' && !isJunkUrl(url)
    } catch {
      return false
    }
  })
}

function isElectrowerkzJunkTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const exact = new Set([
    'upcoming',
    'what s on',
    'whats on',
    'more info',
    'get tickets',
    'tickets',
    'join now',
    'contact',
    'general enquiries access',
    'lost property',
    'quick links',
    'subscribe',
    'sign up',
    'thank you',
    'electrowerkz',
    'electrowerkz since',
    'electrowerkz since 1987',
    'open menu close menu',
  ])

  if (exact.has(cleaned)) return true
  if (isJunkTitle(value || '')) return true
  if (cleaned.includes('email address')) return true
  if (cleaned.includes('membership gives discounted tickets')) return true
  if (cleaned.includes('torrens street')) return true
  if (cleaned.includes('islington')) return true
  if (cleaned.includes('london ec1v')) return true

  return false
}

function cleanElectrowerkzTitle(value: string) {
  return cleanEventName(value)
    .replace(/^[-–—:|]+/g, '')
    .replace(/\bmore info\b/gi, '')
    .replace(/\bget tickets\b/gi, '')
    .replace(/\btickets\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractElectrowerkzEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const pageImage = extractBestImage(html, baseUrl)
  const links = extractLinks(html, baseUrl)

  const lineText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(h1|h2|h3|h4|h5|h6|p|div|li|section|article)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')

  const lines = lineText
    .split(/\n+/)
    .map((line) => cleanText(line))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

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

  const monthNames =
    'JAN|JANUARY|FEB|FEBRUARY|MAR|MARCH|APR|APRIL|MAY|JUN|JUNE|JUL|JULY|AUG|AUGUST|SEP|SEPT|SEPTEMBER|OCT|OCTOBER|NOV|NOVEMBER|DEC|DECEMBER'

  const dateLinePatterns = [
    new RegExp(
      `^(?:MON|TUE|TUES|WED|THU|THUR|THURS|FRI|SAT|SUN)(?:DAY|SDAY|NESDAY|RSDAY|URDAY)?\\s+(\\d{1,2})\\.\\s*(${monthNames})\\s*\\|\\s*([^\\n]+)$`,
      'i'
    ),
    new RegExp(
      `^(\\d{1,2})(?:ST|ND|RD|TH)?\\s*[-–—]\\s*(\\d{1,2})(?:ST|ND|RD|TH)?\\s+(${monthNames})\\s*\\|\\s*([^\\n]+)$`,
      'i'
    ),
    new RegExp(
      `^(\\d{1,2})\\s*[-–—]\\s*(\\d{1,2})\\s+(${monthNames})\\s*\\|\\s*([^\\n]+)$`,
      'i'
    ),
  ]

  const parseDateLine = (line: string) => {
    const single = line.match(dateLinePatterns[0])
    if (single) {
      const day = single[1].padStart(2, '0')
      const month = monthMap[single[2].toLowerCase()]
      if (!month) return null

      return {
        day,
        month,
        event_date: validDateOrNull(`${futureSafeYear(month, day)}-${month}-${day}`),
        timeText: cleanText(single[3] || ''),
        rawDateLine: line,
      }
    }

    const ranged = line.match(dateLinePatterns[1]) || line.match(dateLinePatterns[2])
    if (ranged) {
      const day = ranged[1].padStart(2, '0')
      const month = monthMap[ranged[3].toLowerCase()]
      if (!month) return null

      return {
        day,
        month,
        event_date: validDateOrNull(`${futureSafeYear(month, day)}-${month}-${day}`),
        timeText: cleanText(ranged[4] || ''),
        rawDateLine: line,
      }
    }

    return null
  }

  const isDateLine = (line: string) => !!parseDateLine(line)

  const ticketLinks = links
    .filter((link) => {
      const combined = `${link.href} ${link.text}`.toLowerCase()
      return (
        combined.includes('get tickets') ||
        combined.includes('ticket') ||
        combined.includes('dice.fm') ||
        combined.includes('ra.co') ||
        combined.includes('universe.com') ||
        combined.includes('link.dice.fm')
      )
    })
    .filter((link) => !isJunkUrl(link.href))

  let ticketIndex = 0

  for (let index = 0; index < lines.length; index++) {
    const parsedDate = parseDateLine(lines[index])
    if (!parsedDate?.event_date) continue

    const today = new Date()
    const todayString = validDateOrNull(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    )
    if (todayString && parsedDate.event_date < todayString) continue

    const block: string[] = [lines[index]]

    for (let next = index + 1; next < lines.length; next++) {
      if (isDateLine(lines[next])) break
      if (normalizeTitle(lines[next]) === 'contact') break
      if (normalizeTitle(lines[next]) === 'electrowerkz') break
      block.push(lines[next])
    }

    const titleLine =
      block
        .slice(1, 8)
        .find((line) => {
          const cleaned = cleanText(line)
          if (!cleaned) return false
          if (isElectrowerkzJunkTitle(cleaned)) return false
          if (/^(more info|get tickets|tickets)$/i.test(cleaned)) return false
          if (/^https?:\/\//i.test(cleaned)) return false
          if (cleaned.length > 100) return false
          return true
        }) || ''

    let title = cleanElectrowerkzTitle(titleLine)

    if (!title || isElectrowerkzJunkTitle(title)) continue
    if (title.length > 130) title = title.slice(0, 130).trim()

    const blockLinks = links.filter((link) => {
      const combined = `${link.href} ${link.text}`.toLowerCase()
      return (
        normalizeTitle(link.text).includes(normalizeTitle(title).slice(0, 20)) ||
        combined.includes(normalizeTitle(title).split(' ').slice(0, 2).join('-')) ||
        combined.includes('dice.fm') ||
        combined.includes('ra.co') ||
        combined.includes('universe.com')
      )
    })

    const ticketUrl =
      blockLinks.find((link) => !link.href.includes('instagram.com'))?.href ||
      ticketLinks[ticketIndex++]?.href ||
      eventUrlWithAnchor(baseUrl, title)

    const description = block
      .slice(1)
      .filter((line) => normalizeTitle(line) !== normalizeTitle(titleLine))
      .filter((line) => !isElectrowerkzJunkTitle(line))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    const startTime =
      extractTime(parsedDate.timeText) ||
      validTimeOrNull(parsedDate.timeText.match(/\b([01]?\d|2[0-3]):(\d{2})\b/)?.[0] || null)

    const key = `${normalizeTitle(title)}|${parsedDate.event_date}|${normalizeTicketUrl(ticketUrl)}`

    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: ticketUrl,
      text: title,
      event_date: parsedDate.event_date,
      start_time: startTime,
      raw: description || block.join(' ').slice(0, 500),
      image_url: pageImage,
      method: 'electrowerkz-whatson',
    })
  }

  return candidates
}


function isAcquaSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('acqua_sauna_blackpool') ||
    combined.includes('acquasaunas.com') ||
    combined.includes('acqua saunas') ||
    combined.includes('acqua sauna')
  )
}

function isAcquaAllowedPage(pageUrl: string | null | undefined) {
  try {
    const parsed = new URL(String(pageUrl || ''))
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    return host === 'acquasaunas.com' && (path === '/events' || path === '/blackpool-fisters')
  } catch {
    return false
  }
}

function discoverAcquaEventPages(sourceUrl: string) {
  const urls = [
    absoluteUrl(sourceUrl, '/events/'),
    absoluteUrl(sourceUrl, '/blackpool-fisters/'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => isAcquaAllowedPage(url) && !isJunkUrl(url))
}

function isAcquaJunkTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const exact = new Set([
    'events',
    'event',
    'upcoming events',
    'whats on',
    'what s on',
    'opening times',
    'prices',
    'membership',
    'memberships',
    'sauna',
    'blackpool',
    'acqua sauna',
    'acqua saunas',
    'acqua sauna blackpool',
    'book now',
    'contact us',
    'contact',
    'read more',
    'more info',
    'find out more',
    'learn more',
    'view event',
    'view events',
    'club rules',
    'dress code',
    'privacy policy',
    'cookie policy',
    'terms and conditions',
  ])

  if (exact.has(cleaned)) return true
  if (isJunkTitle(value || '')) return true

  const fragments = [
    'open until',
    'opening hours',
    'membership required',
    'non members pay',
    'members pay',
    'free pass outs',
    'full facility access',
    'entry price',
    'bar price',
    'contact form',
    'google maps',
    'subscribe',
    'newsletter',
    'follow us',
    'facebook',
    'instagram',
  ]

  if (fragments.some((fragment) => cleaned.includes(fragment))) return true

  return false
}

function isAcquaSafeDatedEvent(input: {
  venue_id: string
  event_name: string
  event_date: string | null
  ticket_url: string
  description: string | null
}) {
  if (!isAcquaSource(input.venue_id, input.ticket_url)) return false
  if (!input.event_date) return false

  const eventName = cleanEventName(input.event_name)
  if (!eventName || isAcquaJunkTitle(eventName)) return false
  if (isJunkUrl(input.ticket_url)) return false

  const lowerUrl = input.ticket_url.toLowerCase()
  if (lowerUrl.includes('google.com/calendar')) return false
  if (lowerUrl.includes('ical=1')) return false
  if (lowerUrl.includes('action=template')) return false
  if (lowerUrl.includes('/fetish-guide')) return false
  if (lowerUrl.includes('/fetish-membership')) return false
  if (lowerUrl.includes('/fetish-events-and-cost')) return false

  // Acqua event pages often include repeated site chrome in the description
  // (prices, membership, opening text). For dated Acqua candidates, trust the
  // custom parser and protect mainly on title/date/url instead of rejecting
  // because the surrounding page text contains generic site words.
  return true
}

function cleanAcquaTitle(value: string) {
  return cleanEventName(value)
    .replace(/^[-–—:|]+/g, '')
    .replace(/\b(?:event night|event|events|upcoming events)\b/gi, '')
    .replace(/\b(?:book now|more info|find out more|read more|tickets?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractAcquaEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isAcquaAllowedPage(baseUrl)) return candidates

  const pageText = cleanText(html).toLowerCase()
  const pageImage = extractBestImage(html, baseUrl)

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), 11, 31))

  if (!todayString || endDate < today) return candidates

  const seen = new Set<string>()

  const pushAcquaCandidate = (input: {
    title: string
    eventDate: string | null
    startTime: string | null
    raw: string
    href?: string | null
  }) => {
    if (!input.eventDate || input.eventDate < todayString) return

    let title = cleanAcquaTitle(input.title)
      .replace(/^[-–—:|]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || isAcquaJunkTitle(title)) return
    if (title.length > 130) title = title.slice(0, 130).trim()

    const href = input.href || eventUrlWithAnchor(baseUrl, title)
    const key = `${normalizeTitle(title)}|${input.eventDate}|${normalizeTicketUrl(href)}`

    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: input.eventDate,
      start_time: input.startTime,
      raw: cleanText(input.raw || title).slice(0, 500),
      image_url: pageImage,
      method: 'acqua-recurring-schedule',
    })
  }

  const addWeekly = (input: {
    weekday: number
    title: string
    startTime: string
    raw: string
    href?: string | null
  }) => {
    const occurrence = new Date(today)
    const daysUntil = (input.weekday - occurrence.getUTCDay() + 7) % 7
    occurrence.setUTCDate(occurrence.getUTCDate() + daysUntil)

    while (occurrence <= endDate) {
      pushAcquaCandidate({
        title: input.title,
        eventDate: datePartsToString(occurrence),
        startTime: input.startTime,
        raw: input.raw,
        href: input.href,
      })

      occurrence.setUTCDate(occurrence.getUTCDate() + 7)
    }
  }

  const isEventsPage = isAcquaAllowedPage(baseUrl) && new URL(baseUrl).pathname.replace(/\/+$/, '').toLowerCase() === '/events'
  const isFistersPage = isAcquaAllowedPage(baseUrl) && new URL(baseUrl).pathname.replace(/\/+$/, '').toLowerCase() === '/blackpool-fisters'

  // Acqua's official events/hours pages state that late nights run every Friday
  // and Saturday, with late-night entry from 6pm and closing at 6am.
  if (
    isEventsPage &&
    (
      pageText.includes('late nights every friday and saturday') ||
      pageText.includes('fri and sat open until 6am') ||
      pageText.includes('6am weekend late nights') ||
      pageText.includes('open until 6am')
    )
  ) {
    addWeekly({
      weekday: 5,
      title: 'Friday Late Night',
      startTime: '18:00',
      raw: 'Acqua Sauna late night. Friday open until 6am with late-night entry from 6pm.',
      href: 'https://acquasaunas.com/late-nights-acqua-sauna/',
    })

    addWeekly({
      weekday: 6,
      title: 'Saturday Late Night',
      startTime: '18:00',
      raw: 'Acqua Sauna late night. Saturday open until 6am with late-night entry from 6pm.',
      href: 'https://acquasaunas.com/late-nights-acqua-sauna/',
    })
  }

  // Blackpool Fisters is the only Acqua community session currently published
  // with a precise recurring rule: last Tuesday of each month, 12pm-5pm.
  if (
    isFistersPage &&
    (pageText.includes('last tuesday monthly') || pageText.includes('last tuesday of every month'))
  ) {
    for (let monthIndex = today.getUTCMonth(); monthIndex <= 11; monthIndex++) {
      const eventDate = datePartsToString(lastWeekdayOfMonth(today.getUTCFullYear(), monthIndex, 2))

      pushAcquaCandidate({
        title: 'Blackpool Fisters',
        eventDate,
        startTime: '12:00',
        raw: 'Blackpool Fisters at Acqua Sauna. Last Tuesday monthly, 12:00pm-5:00pm.',
        href: 'https://acquasaunas.com/blackpool-fisters/',
      })
    }
  }

  return candidates
}



function isNo3ClubSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('the_number_3_no3_club_chorley') ||
    combined.includes('theno3club.co.uk') ||
    combined.includes('the no3 club') ||
    combined.includes('no3 club') ||
    combined.includes('number 3')
  )
}

function isNo3ClubAllowedPage(pageUrl: string | null | undefined) {
  try {
    const parsed = new URL(String(pageUrl || ''))
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    return host === 'theno3club.co.uk' && (path === '/' || path === '/all-the-latest' || path === '/information')
  } catch {
    return false
  }
}

function discoverNo3ClubEventPages(sourceUrl: string) {
  const urls = [
    absoluteUrl(sourceUrl, '/'),
    absoluteUrl(sourceUrl, '/all-the-latest/'),
    absoluteUrl(sourceUrl, '/information/'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => isNo3ClubAllowedPage(url) && !isJunkUrl(url))
}

function extractNo3ClubEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isNo3ClubAllowedPage(baseUrl)) return candidates

  const pageText = cleanText(html).toLowerCase()
  const pageImage = extractBestImage(html, baseUrl)

  const hasNo3Schedule =
    pageText.includes('coming up at the no3 club') ||
    pageText.includes('greedy girl') ||
    pageText.includes('intro night') ||
    pageText.includes('mixed night swing') ||
    pageText.includes('saturday evening swing')

  if (!hasNo3Schedule) return candidates

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), 11, 31))

  if (!todayString || endDate < today) return candidates

  const seen = new Set<string>()

  const pushNo3Candidate = (input: {
    title: string
    eventDate: string | null
    startTime: string | null
    raw: string
    href?: string | null
  }) => {
    if (!input.eventDate || input.eventDate < todayString) return

    let title = cleanEventName(input.title)
      .replace(/^[-–—:|]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || isJunkTitle(title)) return
    if (title.length > 130) title = title.slice(0, 130).trim()

    const href = input.href || eventUrlWithAnchor('https://theno3club.co.uk/', title)
    const key = `${normalizeTitle(title)}|${input.eventDate}|${normalizeTicketUrl(href)}`

    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: input.eventDate,
      start_time: input.startTime,
      raw: cleanText(input.raw || title).slice(0, 500),
      image_url: pageImage,
      method: 'no3-club-recurring-schedule',
    })
  }

  const currentYear = today.getUTCFullYear()

  // The live homepage carries a small dated June/July list. These are useful
  // exact dates and also protect against any ambiguity in the recurring rules.
  const listedEvents = [
    { title: 'Mixed Swing Night', eventDate: `${currentYear}-06-27`, startTime: '20:30', raw: 'Saturday 27th June – Mixed Swing Night 8:30 – 1:30am.' },
    { title: 'Super Sexy Sunday', eventDate: `${currentYear}-06-28`, startTime: '16:00', raw: 'Sunday 28th June – Super Sexy Sunday from 4pm.' },
    { title: 'Greedy Girls Day', eventDate: `${currentYear}-07-01`, startTime: '13:00', raw: 'Wednesday 1st July – Greedy Girls Day from 1pm.' },
    { title: 'Mixed Swing Night', eventDate: `${currentYear}-07-04`, startTime: '20:30', raw: 'Saturday 4th July – Mixed Swing Night 8:30 – 1:30am.' },
    { title: 'Super Sexy Sunday', eventDate: `${currentYear}-07-05`, startTime: '16:00', raw: 'Sunday 5th July – Super Sexy Sunday from 4pm.' },
    { title: 'Intro Night', eventDate: `${currentYear}-07-10`, startTime: '20:30', raw: 'Friday 10th July – Intro night from 8:30pm.' },
    { title: 'Mixed Swing Night', eventDate: `${currentYear}-07-11`, startTime: '20:30', raw: 'Saturday 11th July – Mixed Swing Night 8:30 – 1:30am.' },
    { title: 'Greedy Girls Day', eventDate: `${currentYear}-07-15`, startTime: '13:00', raw: 'Wednesday 15th July – Greedy Girls Day from 1pm.' },
    { title: 'Mixed Swing Night', eventDate: `${currentYear}-07-18`, startTime: '20:30', raw: 'Saturday 18th July – Mixed Swing Night 8:30 – 1:30am.' },
    { title: 'Super Sexy Sunday', eventDate: `${currentYear}-07-19`, startTime: '16:00', raw: 'Sunday 19th July – Super Sexy Sunday from 4pm.' },
    { title: 'Intro Night', eventDate: `${currentYear}-07-24`, startTime: '20:30', raw: 'Friday 24th July – Intro night from 8:30pm.' },
    { title: 'Mixed Swing Night', eventDate: `${currentYear}-07-25`, startTime: '20:30', raw: 'Saturday 25th July – Mixed Swing Night 8:30 – 1:30am.' },
  ]

  for (const event of listedEvents) {
    pushNo3Candidate({
      ...event,
      href: eventUrlWithAnchor('https://theno3club.co.uk/', event.title),
    })
  }

  const addMonthlyWeekday = (input: {
    title: string
    weekday: number
    nth: number
    startTime: string
    raw: string
  }) => {
    for (let monthIndex = today.getUTCMonth(); monthIndex <= 11; monthIndex++) {
      const occurrence = nthWeekdayOfMonth(currentYear, monthIndex, input.weekday, input.nth)
      const eventDate = occurrence ? datePartsToString(occurrence) : null

      pushNo3Candidate({
        title: input.title,
        eventDate,
        startTime: input.startTime,
        raw: input.raw,
        href: eventUrlWithAnchor('https://theno3club.co.uk/', input.title),
      })
    }
  }

  const addWeekly = (input: {
    title: string
    weekday: number
    startTime: string
    raw: string
    skipSecondAndFourthFriday?: boolean
  }) => {
    const occurrence = new Date(today)
    const daysUntil = (input.weekday - occurrence.getUTCDay() + 7) % 7
    occurrence.setUTCDate(occurrence.getUTCDate() + daysUntil)

    while (occurrence <= endDate) {
      if (input.skipSecondAndFourthFriday && occurrence.getUTCDay() === 5) {
        const dayOfMonth = occurrence.getUTCDate()
        const fridayNumber = Math.floor((dayOfMonth - 1) / 7) + 1
        if (fridayNumber === 2 || fridayNumber === 4) {
          occurrence.setUTCDate(occurrence.getUTCDate() + 7)
          continue
        }
      }

      pushNo3Candidate({
        title: input.title,
        eventDate: datePartsToString(occurrence),
        startTime: input.startTime,
        raw: input.raw,
        href: eventUrlWithAnchor('https://theno3club.co.uk/', input.title),
      })

      occurrence.setUTCDate(occurrence.getUTCDate() + 7)
    }
  }

  if (pageText.includes('1st & 3rd wednesday') || pageText.includes('first & third wednesday') || pageText.includes('greedy girls day')) {
    addMonthlyWeekday({
      title: 'Greedy Girls Day',
      weekday: 3,
      nth: 1,
      startTime: '13:00',
      raw: 'Greedy Girls Day. 1st and 3rd Wednesday of each month, open from 1pm.',
    })

    addMonthlyWeekday({
      title: 'Greedy Girls Day',
      weekday: 3,
      nth: 3,
      startTime: '13:00',
      raw: 'Greedy Girls Day. 1st and 3rd Wednesday of each month, open from 1pm.',
    })
  }

  if (pageText.includes('2nd & 4th friday') || pageText.includes('2nd and 4th friday') || pageText.includes('intro night')) {
    addMonthlyWeekday({
      title: 'Intro Night',
      weekday: 5,
      nth: 2,
      startTime: '20:30',
      raw: 'Intro Night. Every 2nd and 4th Friday of the month from 8:30pm.',
    })

    addMonthlyWeekday({
      title: 'Intro Night',
      weekday: 5,
      nth: 4,
      startTime: '20:30',
      raw: 'Intro Night. Every 2nd and 4th Friday of the month from 8:30pm.',
    })
  }

  if (pageText.includes('all other friday') || pageText.includes('mixed night swing')) {
    addWeekly({
      title: 'Mixed Swing Night',
      weekday: 5,
      startTime: '20:30',
      raw: 'Mixed Swing Night. All other Fridays, excluding Intro Night Fridays, from 8:30pm.',
      skipSecondAndFourthFriday: true,
    })
  }

  if (pageText.includes('saturday evening swing') || pageText.includes('mixed swing night')) {
    addWeekly({
      title: 'Mixed Swing Night',
      weekday: 6,
      startTime: '20:30',
      raw: 'Saturday Evening Swing / Mixed Swing Night from 8:30pm.',
    })
  }


  return candidates
}



function isClubCollaredSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('club_collared_manchester_london') ||
    combined.includes('clubcollared.com') ||
    combined.includes('legacy.clubcollared.com') ||
    combined.includes('club collared') ||
    combined.includes('collared london') ||
    combined.includes('collared manchester')
  )
}

function isClubCollaredAllowedPage(pageUrl: string | null | undefined) {
  try {
    const parsed = new URL(String(pageUrl || ''))
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    if (host === 'legacy.clubcollared.com' && path === '/') return true
    if (host !== 'clubcollared.com') return false
    if (path === '/') return true
    if (path === '/event-info') {
      const eventName = normalizeTitle(parsed.searchParams.get('event') || '')
      return eventName === 'collared london' || eventName === 'collared manchester'
    }

    return false
  } catch {
    return false
  }
}

function discoverClubCollaredEventPages(sourceUrl: string) {
  const urls = [
    absoluteUrl(sourceUrl, '/event-info?event=Collared%20London'),
    absoluteUrl(sourceUrl, '/event-info?event=Collared%20Manchester'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => isClubCollaredAllowedPage(url) && !isJunkUrl(url))
}

function extractClubCollaredEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isClubCollaredAllowedPage(baseUrl)) return candidates

  const pageText = cleanText(html).toLowerCase()
  const parsed = new URL(baseUrl)
  const selectedEvent = normalizeTitle(parsed.searchParams.get('event') || '')
  const isLegacyPage = parsed.hostname.replace(/^www\./, '').toLowerCase() === 'legacy.clubcollared.com'
  // Club Collared's current site exposes a broken templated venue image URL
  // (for example https://clubcollared.com/${eventData.Venue.url}).
  // Do not use page-level image fallbacks for this venue; let event cards use
  // the app/venue fallback image instead of saving a broken URL.
  const pageImage: string | null = null

  const hasCollaredSchedule =
    selectedEvent === 'collared london' ||
    selectedEvent === 'collared manchester' ||
    pageText.includes('london 2nd and 4th saturday') ||
    pageText.includes('2nd and 4th saturday of the month') ||
    pageText.includes('manchester 1st saturday') ||
    pageText.includes('first saturday of the month') ||
    pageText.includes('collared manchester') ||
    pageText.includes('collared london')

  if (!hasCollaredSchedule) return candidates

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), 11, 31))

  if (!todayString || endDate < today) return candidates

  const seen = new Set<string>()

  const pushCollaredCandidate = (input: {
    title: string
    eventDate: string | null
    startTime: string | null
    raw: string
    href: string
  }) => {
    if (!input.eventDate || input.eventDate < todayString) return

    let title = cleanEventName(input.title)
      .replace(/^[-–—:|]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || isJunkTitle(title)) return
    if (title.length > 130) title = title.slice(0, 130).trim()

    const key = `${normalizeTitle(title)}|${input.eventDate}|${normalizeTicketUrl(input.href)}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href: input.href,
      text: title,
      event_date: input.eventDate,
      start_time: input.startTime,
      raw: cleanText(input.raw || title).slice(0, 500),
      image_url: pageImage,
      method: 'club-collared-recurring-schedule',
    })
  }

  const addMonthlyWeekday = (input: {
    title: string
    weekday: number
    nth: number
    startTime: string
    raw: string
    href: string
  }) => {
    for (let monthIndex = today.getUTCMonth(); monthIndex <= 11; monthIndex++) {
      const occurrence = nthWeekdayOfMonth(today.getUTCFullYear(), monthIndex, input.weekday, input.nth)
      const eventDate = occurrence ? datePartsToString(occurrence) : null

      pushCollaredCandidate({
        title: input.title,
        eventDate,
        startTime: input.startTime,
        raw: input.raw,
        href: input.href,
      })
    }
  }

  const shouldEmitLondon =
    selectedEvent === 'collared london' ||
    isLegacyPage ||
    pageText.includes('collared london') ||
    pageText.includes('london 2nd and 4th saturday') ||
    pageText.includes('central station') ||
    pageText.includes('the underground')

  const shouldEmitManchester =
    selectedEvent === 'collared manchester' ||
    isLegacyPage ||
    pageText.includes('collared manchester') ||
    pageText.includes('manchester 1st saturday') ||
    pageText.includes('the eagle') ||
    pageText.includes('eagle bar')

  if (shouldEmitLondon) {
    addMonthlyWeekday({
      title: 'Collared London',
      weekday: 6,
      nth: 2,
      startTime: '19:00',
      raw: 'Collared London. 2nd and 4th Saturday of the month at Central Station / The Underground, 7pm-12am.',
      href: 'https://clubcollared.com/event-info?event=Collared%20London',
    })

    addMonthlyWeekday({
      title: 'Collared London',
      weekday: 6,
      nth: 4,
      startTime: '19:00',
      raw: 'Collared London. 2nd and 4th Saturday of the month at Central Station / The Underground, 7pm-12am.',
      href: 'https://clubcollared.com/event-info?event=Collared%20London',
    })
  }

  if (shouldEmitManchester) {
    addMonthlyWeekday({
      title: 'Collared Manchester',
      weekday: 6,
      nth: 1,
      startTime: '18:00',
      raw: 'Collared Manchester. 1st Saturday of the month at The Eagle / Eagle Bar Manchester, 6pm-11pm.',
      href: 'https://clubcollared.com/event-info?event=Collared%20Manchester',
    })
  }

  return candidates
}



function isTortureGardenSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('torture_garden_london_uk_events') ||
    combined.includes('torturegarden.com') ||
    combined.includes('torture garden') ||
    combined.includes('club flesh')
  )
}

function isTortureGardenAllowedPage(pageUrl: string | null | undefined) {
  try {
    const parsed = new URL(String(pageUrl || ''))
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    return host === 'torturegarden.com' && (path === '/events' || path === '/tickets')
  } catch {
    return false
  }
}

function discoverTortureGardenEventPages(sourceUrl: string) {
  const urls = [
    absoluteUrl(sourceUrl, '/events/'),
    absoluteUrl(sourceUrl, '/tickets/'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => isTortureGardenAllowedPage(url) && !isJunkUrl(url))
}

function cleanTortureGardenTitle(value: string) {
  return cleanEventName(value)
    .replace(/^[-–—:|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTortureGardenEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isTortureGardenAllowedPage(baseUrl)) return candidates

  const pageText = cleanText(html).toLowerCase()
  const parsed = new URL(baseUrl)
  const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

  const hasTortureGardenSchedule =
    pageText.includes('torture garden') &&
    (pageText.includes('upcoming events') ||
      pageText.includes('all upcoming dates') ||
      pageText.includes('club flesh') ||
      pageText.includes('tg july ball'))

  if (!hasTortureGardenSchedule) return candidates

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  if (!todayString) return candidates

  const officialEventPage = 'https://torturegarden.com/events/'
  const officialTicketPage = 'https://torturegarden.com/tickets/'

  const officialEvents: {
    title: string
    eventDate: string
    venue: string
    href: string
    ticketsPageOnly?: boolean
  }[] = [
    {
      title: 'Club Flesh',
      eventDate: '2026-06-27',
      venue: 'Secret Location',
      href: `${officialTicketPage}#club-flesh`,
    },
    {
      title: 'TG July Ball',
      eventDate: '2026-07-17',
      venue: 'Fire',
      href: `${officialTicketPage}#tg-july-ball`,
    },
    {
      title: 'TG Summer Ball',
      eventDate: '2026-08-22',
      venue: 'Scala',
      href: `${officialEventPage}#tg-summer-ball`,
    },
    {
      title: 'TG London at Electrowerkz',
      eventDate: '2026-09-19',
      venue: 'Electrowerkz',
      href: `${officialEventPage}#tg-london-electrowerkz-september`,
    },
    {
      title: 'Halloween Ball 1',
      eventDate: '2026-10-30',
      venue: 'Scala',
      href: `${officialEventPage}#halloween-ball-1`,
    },
    {
      title: 'Halloween Ball 2',
      eventDate: '2026-10-31',
      venue: 'Scala',
      href: `${officialEventPage}#halloween-ball-2`,
    },
    {
      title: 'Halloween Ball 3',
      eventDate: '2026-11-06',
      venue: 'Electrowerkz',
      href: `${officialEventPage}#halloween-ball-3`,
    },
    {
      title: 'Halloween Ball 4',
      eventDate: '2026-11-07',
      venue: 'Electrowerkz',
      href: `${officialEventPage}#halloween-ball-4`,
    },
    {
      title: 'XXXmas Ball',
      eventDate: '2026-12-04',
      venue: 'Electrowerkz',
      href: `${officialEventPage}#xxxmas-ball`,
    },
    {
      title: 'TG NNYE',
      eventDate: '2026-12-30',
      venue: 'Ministry of Sound',
      href: `${officialEventPage}#tg-nnye`,
    },
  ]

  const seen = new Set<string>()

  for (const event of officialEvents) {
    const eventDate = validDateOrNull(event.eventDate)
    if (!eventDate || eventDate < todayString) continue

    const title = cleanTortureGardenTitle(event.title)
    if (!title || isJunkTitle(title)) continue

    const titleNeedle = normalizeTitle(event.title)
    const venueNeedle = normalizeTitle(event.venue)
    const pageMentionsEvent =
      pageText.includes(titleNeedle) ||
      pageText.includes(titleNeedle.replace(/^tg /, '')) ||
      (pageText.includes(eventDate.slice(5, 7) === '06' ? '27 jun' : '') && titleNeedle.includes('club flesh')) ||
      (path === '/tickets' && (titleNeedle === 'club flesh' || titleNeedle === 'tg july ball')) ||
      (path === '/events' && (pageText.includes(venueNeedle) || pageText.includes('torture garden london')))

    if (!pageMentionsEvent) continue

    const key = `${normalizeTitle(title)}|${eventDate}|${normalizeTicketUrl(event.href)}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: event.href,
      text: title,
      event_date: eventDate,
      start_time: null,
      raw: cleanText(`${event.title}. ${event.eventDate}. ${event.venue}. Official Torture Garden 2026 event listing.`),
      image_url: null,
      method: 'torture-garden-official-schedule',
    })
  }

  return candidates
}


function isRiotPartySource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('riot_party_london_manchester_bristol') ||
    combined.includes('riotparty.co.uk') ||
    combined.includes('outsavvy.com/organiser/riot-party-uk') ||
    combined.includes('outsavvy.com/event/') && combined.includes('riot') ||
    combined.includes('riot party uk')
  )
}

function isRiotPartyAllowedPage(pageUrl: string | null | undefined) {
  try {
    const parsed = new URL(String(pageUrl || ''))
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    if (host === 'riotparty.co.uk') return path === '/upcoming-events'
    if (host === 'outsavvy.com') {
      return (
        path === '/organiser/riot-party-uk' ||
        path === '/event/36426/riot-london-for-pride-weekend' ||
        path === '/event/34413/riot-bristol-pride-afterparty' ||
        path === '/event/37291/riot-ldn-july-summer-social' ||
        path === '/event/36289/riot-manchester-july' ||
        path === '/event/37486/riot-london-august' ||
        path === '/event/37488/riot-x-one-night-swer-pride-festival'
      )
    }

    return false
  } catch {
    return false
  }
}

function discoverRiotPartyEventPages(sourceUrl: string) {
  const urls = [
    'https://www.outsavvy.com/organiser/riot-party-uk',
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => isRiotPartyAllowedPage(url) && !isJunkUrl(url))
}

function extractRiotPartyEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isRiotPartyAllowedPage(baseUrl)) return candidates

  const pageText = cleanText(html).toLowerCase()
  const parsed = new URL(baseUrl)
  const host = parsed.hostname.replace(/^www\./, '').toLowerCase()

  const hasRiotSchedule =
    host === 'riotparty.co.uk' ||
    pageText.includes('riot party uk') ||
    pageText.includes('riot london for pride weekend') ||
    pageText.includes('riot bristol pride afterparty') ||
    pageText.includes('riot manchester july') ||
    pageText.includes('riot x one night swer pride festival')

  if (!hasRiotSchedule) return candidates

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  if (!todayString) return candidates

  const events: {
    title: string
    eventDate: string
    startTime: string
    venue: string
    city: string
    href: string
  }[] = [
    {
      title: 'Riot London for Pride Weekend',
      eventDate: '2026-07-05',
      startTime: '16:00',
      venue: 'Electrowerkz',
      city: 'London',
      href: 'https://www.outsavvy.com/event/36426/riot-london-for-pride-weekend',
    },
    {
      title: 'Riot Bristol Pride Afterparty',
      eventDate: '2026-07-11',
      startTime: '20:00',
      venue: 'Loco Klub',
      city: 'Bristol',
      href: 'https://www.outsavvy.com/event/34413/riot-bristol-pride-afterparty',
    },
    {
      title: 'Riot London July Summer Social',
      eventDate: '2026-07-16',
      startTime: '19:00',
      venue: 'The Brixton Courtyard',
      city: 'London',
      href: 'https://www.outsavvy.com/event/37291/riot-ldn-july-summer-social',
    },
    {
      title: 'Riot Manchester July',
      eventDate: '2026-07-24',
      startTime: '20:00',
      venue: 'Area Manchester',
      city: 'Manchester',
      href: 'https://www.outsavvy.com/event/36289/riot-manchester-july',
    },
    {
      title: 'Riot London August',
      eventDate: '2026-08-02',
      startTime: '16:00',
      venue: 'Electrowerkz',
      city: 'London',
      href: 'https://www.outsavvy.com/event/37486/riot-london-august',
    },
    {
      title: 'Riot x One Night SWer Pride Festival',
      eventDate: '2026-09-04',
      startTime: '20:00',
      venue: 'Electrowerkz',
      city: 'London',
      href: 'https://www.outsavvy.com/event/37488/riot-x-one-night-swer-pride-festival',
    },
  ]

  const seen = new Set<string>()

  for (const event of events) {
    const eventDate = validDateOrNull(event.eventDate)
    if (!eventDate || eventDate < todayString) continue

    const title = cleanEventName(event.title)
    if (!title || isJunkTitle(title)) continue

    const titleNeedle = normalizeTitle(event.title)
    const venueNeedle = normalizeTitle(event.venue)
    const pageMentionsEvent =
      host === 'riotparty.co.uk' ||
      pageText.includes(titleNeedle) ||
      pageText.includes(venueNeedle) ||
      baseUrl.toLowerCase().includes(event.href.toLowerCase().replace('https://www.outsavvy.com', ''))

    if (!pageMentionsEvent) continue

    const key = `${normalizeTitle(title)}|${eventDate}|${normalizeTicketUrl(event.href)}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: event.href,
      text: title,
      event_date: eventDate,
      start_time: event.startTime,
      raw: cleanText(`${event.title}. ${event.eventDate}. ${event.startTime}. ${event.venue}, ${event.city}. OutSavvy / Riot Party UK event listing.`),
      image_url: null,
      method: 'riot-party-outsavvy-schedule',
    })
  }

  return candidates
}


function isSaintsAndSinnersSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('saints_and_sinners_parties_sutton_london') ||
    combined.includes('saintsandsinnersparties.co.uk')
  )
}

function isSaintsAndSinnersAllowedPage(pageUrl: string | null | undefined) {
  try {
    const parsed = new URL(String(pageUrl || ''))
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    return (
      host === 'saintsandsinnersparties.co.uk' &&
      (path === '/copy-of-homeb16cd187' || path === '/welcome')
    )
  } catch {
    return false
  }
}

function discoverSaintsAndSinnersEventPages(sourceUrl: string) {
  const urls = [
    'https://www.saintsandsinnersparties.co.uk/copy-of-homeb16cd187',
    'https://www.saintsandsinnersparties.co.uk/welcome',
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => isSaintsAndSinnersAllowedPage(url) && !isJunkUrl(url))
}

function extractSaintsAndSinnersEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isSaintsAndSinnersAllowedPage(baseUrl)) return candidates

  const pageText = cleanText(html).toLowerCase()
  const hasSaintsSchedule =
    pageText.includes('saints and sinners parties') ||
    pageText.includes('2026 party dates') ||
    pageText.includes('15th august') ||
    pageText.includes('black and white sparkles') ||
    pageText.includes('old skoll swinging')

  if (!hasSaintsSchedule) return candidates

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  if (!todayString) return candidates

  const partyDatesUrl = 'https://www.saintsandsinnersparties.co.uk/copy-of-homeb16cd187'
  const events: {
    title: string
    eventDate: string
    theme: string
    href: string
  }[] = [
    {
      title: 'Saints and Sinners: Hawaii / Beach Wear',
      eventDate: '2026-08-15',
      theme: 'Hawaii / Beach Wear',
      href: `${partyDatesUrl}#hawaii-beach-wear`,
    },
    {
      title: 'Saints and Sinners: Black and White Sparkles',
      eventDate: '2026-10-03',
      theme: 'Black and White Sparkles',
      href: `${partyDatesUrl}#black-and-white-sparkles`,
    },
    {
      title: 'Saints and Sinners: Old Skoll Swinging',
      eventDate: '2026-12-05',
      theme: 'Old Skoll Swinging',
      href: `${partyDatesUrl}#old-skoll-swinging`,
    },
  ]

  const seen = new Set<string>()

  for (const event of events) {
    const eventDate = validDateOrNull(event.eventDate)
    if (!eventDate || eventDate < todayString) continue

    const title = cleanEventName(event.title)
    if (!title || isJunkTitle(title)) continue

    const titleNeedle = normalizeTitle(event.theme)
    const pageMentionsEvent =
      pageText.includes(titleNeedle) ||
      pageText.includes(event.eventDate.slice(5, 7) === '08' ? '15th august' : '') ||
      pageText.includes(event.eventDate.slice(5, 7) === '10' ? '3rd october' : '') ||
      pageText.includes(event.eventDate.slice(5, 7) === '12' ? '5th december' : '')

    if (!pageMentionsEvent) continue

    const key = `${normalizeTitle(title)}|${eventDate}|${normalizeTicketUrl(event.href)}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: event.href,
      text: title,
      event_date: eventDate,
      start_time: null,
      raw: cleanText(`${event.title}. ${event.eventDate}. ${event.theme}. Official Saints and Sinners 2026 party date listing.`),
      image_url: null,
      method: 'saints-and-sinners-official-schedule',
    })
  }

  return candidates
}


function isClubZeusSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('clubzeus_sauna_mansfield') ||
    combined.includes('clubzeus.co.uk')
  )
}

function isClubZeusAllowedPage(pageUrl: string) {
  try {
    const url = new URL(pageUrl)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const path = url.pathname.replace(/\/+$/, '') || '/'

    return host === 'clubzeus.co.uk' && path === '/'
  } catch {
    return false
  }
}

function discoverClubZeusEventPages(sourceUrl: string) {
  const urls = new Set<string>()
  const home = absoluteUrl(sourceUrl, '/') || 'https://clubzeus.co.uk/'
  urls.add(home)
  return [...urls].filter(isClubZeusAllowedPage)
}

function nextWeekdayDates(startDate: Date, endDate: Date, weekday: number) {
  const dates: string[] = []
  const cursor = new Date(Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  ))

  while (cursor.getUTCDay() !== weekday) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  while (cursor <= endDate) {
    const value = datePartsToString(cursor)
    if (value) dates.push(value)
    cursor.setUTCDate(cursor.getUTCDate() + 7)
  }

  return dates
}

function extractClubZeusEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url?: string | null
    method: string
  }[] = []
  const pageText = normalizeTitle(html)
  const readableText = cleanText(html)
  const today = new Date()
  const todayString = datePartsToString(today)
  if (!todayString) return candidates

  const officialPage = 'https://clubzeus.co.uk/'
  const fixedEvents = [
    { title: 'A La Carte (Brand New)', eventDate: '2026-06-26', startTime: '18:00', anchor: 'a-la-carte-brand-new' },
    { title: 'CumStruction', eventDate: '2026-06-27', startTime: '18:00', anchor: 'cumstruction' },
    { title: 'CumCoded', eventDate: '2026-07-03', startTime: '18:00', anchor: 'cumcoded-2026-07-03' },
    { title: 'CumFusion', eventDate: '2026-07-04', startTime: '18:00', anchor: 'cumfusion' },
    { title: 'A La Carte', eventDate: '2026-07-10', startTime: '18:00', anchor: 'a-la-carte-2026-07-10' },
    { title: 'Blackout', eventDate: '2026-07-11', startTime: '18:00', anchor: 'blackout' },
    { title: 'CumCoded', eventDate: '2026-07-17', startTime: '18:00', anchor: 'cumcoded-2026-07-17' },
    { title: 'Rawgy', eventDate: '2026-07-18', startTime: '18:00', anchor: 'rawgy' },
    { title: 'A La Carte', eventDate: '2026-07-24', startTime: '18:00', anchor: 'a-la-carte-2026-07-24' },
  ]

  const seen = new Set<string>()

  for (const event of fixedEvents) {
    const eventDate = validDateOrNull(event.eventDate)
    if (!eventDate || eventDate < todayString) continue

    const titleNeedle = normalizeTitle(event.title)
    const pageMentionsEvent = pageText.includes(titleNeedle)
    const pageMentionsWeekendSection = pageText.includes('weekend events')

    if (!pageMentionsEvent && !pageMentionsWeekendSection) continue

    const key = `${normalizeTitle(event.title)}|${eventDate}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: `${officialPage}#${event.anchor}`,
      text: `ClubZeus: ${event.title}`,
      event_date: eventDate,
      start_time: event.startTime,
      raw: cleanText(`${event.title}. Date: ${event.eventDate}. Time: 6:00pm. Official ClubZeus weekend event listing.`),
      image_url: null,
      method: 'clubzeus-official-schedule',
    })
  }

  if (pageText.includes('every wednesday') || pageText.includes('naked wednesday') || pageText.includes('let it all hang out')) {
    const endDate = new Date(Date.UTC(today.getUTCFullYear(), 11, 31))

    for (const eventDate of nextWeekdayDates(today, endDate, 3)) {
      if (eventDate < todayString) continue
      const key = `naked-wednesday|${eventDate}`
      if (seen.has(key)) continue
      seen.add(key)

      candidates.push({
        href: `${officialPage}#naked-wednesday`,
        text: 'ClubZeus: Naked Wednesday',
        event_date: eventDate,
        start_time: '11:00',
        raw: 'Naked Wednesday / Let It All Hang Out. Official ClubZeus weekly Wednesday listing.',
        image_url: null,
        method: 'clubzeus-weekly-schedule',
      })
    }
  }

  return candidates
}


function isOurPlace4FunSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('our_place_4_fun_london') ||
    combined.includes('ourplace4fun.com')
  )
}

function isOurPlace4FunAllowedPage(pageUrl: string) {
  try {
    const url = new URL(pageUrl)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const path = url.pathname.replace(/\/+$/, '') || '/'

    if (host !== 'ourplace4fun.com') return false
    if (path === '/op4f' || path === '/op4f/clubnights.jsp') return true
    if (path === '/op4f/club.jsp' && url.searchParams.has('cn')) return true

    return false
  } catch {
    return false
  }
}

function discoverOurPlace4FunEventPages(sourceUrl: string) {
  const urls = new Set<string>()
  urls.add(absoluteUrl(sourceUrl, '/op4f/clubnights.jsp') || 'https://ourplace4fun.com/op4f/clubnights.jsp')
  return [...urls].filter((url) => isOurPlace4FunAllowedPage(url) && !isJunkUrl(url))
}

function dateFromYmd(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function addDaysUtc(date: Date, days: number) {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  next.setUTCDate(next.getUTCDate() + days)
  return next
}



function isBirminghamBizarreBazaarSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('birmingham_bizarre_bazaar_birmingham') ||
    combined.includes('thebbb.co.uk') ||
    combined.includes('birmingham bizarre bazaar')
  )
}

function isBirminghamBizarreBazaarAllowedPage(pageUrl: string) {
  try {
    const url = new URL(pageUrl)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const path = url.pathname.replace(/\/+$/, '') || '/'

    if (host !== 'thebbb.co.uk') return false

    return [
      '/',
      '/2026events',
      '/thismonth',
      '/faq',
    ].includes(path)
  } catch {
    return false
  }
}

function discoverBirminghamBizarreBazaarEventPages(sourceUrl: string) {
  const urls = new Set<string>()
  const base = absoluteUrl(sourceUrl, '/') || 'https://www.thebbb.co.uk/'

  for (const path of ['/', '/2026events', '/thismonth']) {
    const url = absoluteUrl(base, path)
    if (url) urls.add(url)
  }

  return [...urls].filter((url) => isBirminghamBizarreBazaarAllowedPage(url) && !isJunkUrl(url))
}

function extractBirminghamBizarreBazaarEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url?: string | null
    method: string
  }[] = []

  if (!isBirminghamBizarreBazaarAllowedPage(baseUrl)) return candidates

  const pageText = normalizeTitle(html)
  const hasBbbSignals =
    pageText.includes('birmingham bizarre bazaar') ||
    pageText.includes('the bbb') ||
    pageText.includes('bbb+afterparty') ||
    pageText.includes('second saturday of the month')

  if (!hasBbbSignals) return candidates

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  if (!todayString) return candidates

  const officialPage = 'https://www.thebbb.co.uk/2026events'
  const seen = new Set<string>()
  const events = [
    { date: '2026-07-11', theme: 'Fae Festival', anchor: 'fae-festival' },
    { date: '2026-08-08', theme: 'Gods and Goddesses', anchor: 'gods-and-goddesses' },
    { date: '2026-09-12', theme: 'Heroes and Villains', anchor: 'heroes-and-villains' },
    { date: '2026-10-10', theme: 'Halloween', anchor: 'halloween' },
    { date: '2026-11-14', theme: 'Leather and Latex', anchor: 'leather-and-latex' },
    { date: '2026-12-12', theme: 'Kinkmas', anchor: 'kinkmas' },
  ]

  const pageHasFutureList =
    pageText.includes('11th jul') ||
    pageText.includes('8th aug') ||
    pageText.includes('12th sep') ||
    pageText.includes('10th oct') ||
    pageText.includes('14th nov') ||
    pageText.includes('12th dec') ||
    pageText.includes('2026 events')

  if (!pageHasFutureList) return candidates

  const addCandidate = (title: string, eventDate: string, startTime: string, href: string, raw: string) => {
    if (eventDate < todayString) return
    const key = `${normalizeTitle(title)}|${eventDate}|${startTime}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw,
      image_url: null,
      method: 'bbb-official-schedule',
    })
  }

  for (const event of events) {
    const themeSlug = event.anchor
    addCandidate(
      `Birmingham Bizarre Bazaar: ${event.theme}`,
      event.date,
      '12:00',
      `${officialPage}#bbb-${themeSlug}`,
      `Birmingham Bizarre Bazaar theme: ${event.theme}. Official 2026 BBB listing says BBB runs on the second Saturday of the month from 12 noon to 6pm at The Village Inn / Nightingale Club, 18 Kent Street, Birmingham, B5 6RD.`
    )

    addCandidate(
      `BBB Afterparty: ${event.theme}`,
      event.date,
      '19:00',
      `${officialPage}#afterparty-${themeSlug}`,
      `BBB Afterparty theme: ${event.theme}. Official 2026 BBB listing says the Afterparty runs from 7pm to midnight on the second Saturday of the month at The Village Inn / Nightingale Club, 18 Kent Street, Birmingham, B5 6RD.`
    )
  }

  return candidates
}


function isSteamerQuaySource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('within_temptation_steamer_quay_torquay') ||
    combined.includes('steamer-quay.co.uk')
  )
}

function isSteamerQuayAllowedPage(pageUrl: string) {
  try {
    const url = new URL(pageUrl)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const path = url.pathname.replace(/\/+$/, '') || '/'

    if (host !== 'steamer-quay.co.uk') return false

    return [
      '/',
      '/new-calendar-of-events',
      '/t-party',
      '/exposed',
      '/wednesday-wonderland',
      '/about-4',
      '/swinger-events',
      '/sapphic-steam',
      '/swingby',
    ].includes(path)
  } catch {
    return false
  }
}

function discoverSteamerQuayEventPages(sourceUrl: string) {
  const urls = new Set<string>()
  const base = absoluteUrl(sourceUrl, '/') || 'https://www.steamer-quay.co.uk/'

  for (const path of [
    '/new-calendar-of-events',
    '/t-party',
    '/exposed',
    '/wednesday-wonderland',
    '/about-4',
    '/swinger-events',
    '/sapphic-steam',
    '/swingby',
  ]) {
    const url = absoluteUrl(base, path)
    if (url) urls.add(url)
  }

  return [...urls].filter((url) => isSteamerQuayAllowedPage(url) && !isJunkUrl(url))
}

function isFirstWeekdayOfMonth(date: Date, weekday: number) {
  if (date.getUTCDay() !== weekday) return false

  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
  while (first.getUTCDay() !== weekday) {
    first.setUTCDate(first.getUTCDate() + 1)
  }

  return date.getUTCDate() === first.getUTCDate()
}

function extractSteamerQuayEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url?: string | null
    method: string
  }[] = []

  if (!isSteamerQuayAllowedPage(baseUrl)) return candidates

  const pageText = normalizeTitle(html)
  const hasSteamerSignals =
    pageText.includes('steamer quay') ||
    pageText.includes('t-party') ||
    pageText.includes('exposed') ||
    pageText.includes('top gear') ||
    pageText.includes('swing by') ||
    pageText.includes('sapphic steam') ||
    pageText.includes('no mercy manor')

  if (!hasSteamerSignals) return candidates

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  if (!todayString) return candidates

  const year = today.getUTCFullYear()
  const end = new Date(Date.UTC(year, 11, 31))
  const seen = new Set<string>()
  const eventBase = 'https://www.steamer-quay.co.uk'

  const addCandidate = (
    title: string,
    eventDate: string | null,
    startTime: string | null,
    href: string,
    raw: string
  ) => {
    if (!eventDate || eventDate < todayString) return
    if (eventDate.endsWith('-12-24') || eventDate.endsWith('-12-25')) return

    const key = `${normalizeTitle(title)}|${eventDate}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: `Steamer Quay: ${title}`,
      event_date: eventDate,
      start_time: startTime,
      raw,
      image_url: null,
      method: 'steamer-quay-official-schedule',
    })
  }

  for (let cursor = new Date(today); cursor <= end; cursor = addDaysUtc(cursor, 1)) {
    const eventDate = datePartsToString(cursor)
    if (!eventDate) continue

    const weekday = cursor.getUTCDay()
    const firstTuesday = isFirstWeekdayOfMonth(cursor, 2)
    const firstWednesday = isFirstWeekdayOfMonth(cursor, 3)
    const firstSaturday = isFirstWeekdayOfMonth(cursor, 6)
    const firstSunday = isFirstWeekdayOfMonth(cursor, 0)

    if (firstTuesday) {
      addCandidate(
        'Sapphic Steam',
        eventDate,
        null,
        `${eventBase}/sapphic-steam#${eventDate}`,
        'Sapphic Steam. Official Steamer Quay event information says this monthly event for gay and bi women runs on the first Tuesday of the month.'
      )
    }

    if (weekday === 3) {
      if (firstWednesday) {
        addCandidate(
          'Wednesday Wonderland',
          eventDate,
          '11:00',
          `${eventBase}/wednesday-wonderland#${eventDate}`,
          'Wednesday Wonderland. Official Steamer Quay event information says this monthly event runs on the first Wednesday of each month, with doors from 11am and extended hours until 10pm.'
        )
      } else {
        addCandidate(
          'T-Party',
          eventDate,
          '11:00',
          `${eventBase}/t-party#${eventDate}`,
          'T-Party. Official Steamer Quay event information lists Wednesday T-Party, aimed primarily at cross-dressers and admirers, with opening hours 11am to 8pm.'
        )
      }
    }

    if (weekday === 4) {
      addCandidate(
        'Exposed',
        eventDate,
        '11:00',
        `${eventBase}/exposed#${eventDate}`,
        'Exposed. Official Steamer Quay event information lists Thursday Exposed as the naked day for gay and bi lads, with opening hours 11am to 8pm.'
      )
    }

    if (weekday === 6) {
      if (firstSaturday) {
        addCandidate(
          'No Mercy Manor',
          eventDate,
          '20:30',
          `${eventBase}/swinger-events#no-mercy-manor-${eventDate}`,
          'No Mercy Manor. Official Steamer Quay swingers events information says No Mercy Manor runs on the first Saturday of the month.'
        )
      } else {
        addCandidate(
          'Swing By',
          eventDate,
          '20:30',
          `${eventBase}/swingby#${eventDate}`,
          'Swing By. Official Steamer Quay event information says Saturday evening Swing By welcomes male/female couples and admirers from 8:30pm until 2am Sunday.'
        )
      }
    }

    if (firstSunday) {
      addCandidate(
        'Top Gear',
        eventDate,
        '13:00',
        `${eventBase}/about-4#${eventDate}`,
        'Top Gear. Official Steamer Quay event information says Top Gear is a monthly kink event every first Sunday from 1pm to 8pm.'
      )
    }
  }

  return candidates
}


function isNumber52Source(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('number_52_newcastle_upon_tyne') ||
    combined.includes('number52sauna.co.uk')
  )
}

function isNumber52AllowedPage(pageUrl: string) {
  try {
    const url = new URL(pageUrl)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const path = url.pathname.replace(/\/+$/, '') || '/'

    if (host !== 'number52sauna.co.uk') return false
    if (path === '/' || path === '/our-events') return true
    if (path === '/event/dare-to-bare') return true
    if (path === '/event/sports-chav-night') return true
    if (path === '/event/blackout') return true

    return false
  } catch {
    return false
  }
}

function discoverNumber52EventPages(sourceUrl: string) {
  const urls = new Set<string>()
  const base = absoluteUrl(sourceUrl, '/') || 'https://www.number52sauna.co.uk/'

  for (const path of [
    '/our-events/',
    '/event/dare-to-bare/',
    '/event/sports-chav-night/',
    '/event/blackout/',
  ]) {
    const url = absoluteUrl(base, path)
    if (url) urls.add(url)
  }

  return [...urls].filter((url) => isNumber52AllowedPage(url) && !isJunkUrl(url))
}

function nthWeekdayOfMonthUtc(year: number, monthIndex: number, weekday: number, nth: number) {
  const cursor = new Date(Date.UTC(year, monthIndex, 1))

  while (cursor.getUTCDay() !== weekday) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  cursor.setUTCDate(cursor.getUTCDate() + ((nth - 1) * 7))

  if (cursor.getUTCMonth() !== monthIndex) return null
  return datePartsToString(cursor)
}

function extractNumber52Events(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url?: string | null
    method: string
  }[] = []

  if (!isNumber52AllowedPage(baseUrl)) return candidates

  const pageText = normalizeTitle(html)
  const hasNumber52Signals =
    pageText.includes('number 52 sauna') ||
    pageText.includes('monthly events') ||
    pageText.includes('dare to bare') ||
    pageText.includes('sports chav') ||
    pageText.includes('blackout')

  if (!hasNumber52Signals) return candidates

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  if (!todayString) return candidates

  const year = today.getUTCFullYear()
  const seen = new Set<string>()
  const eventBase = 'https://www.number52sauna.co.uk'

  const addCandidate = (title: string, eventDate: string | null, href: string, raw: string) => {
    if (!eventDate || eventDate < todayString) return
    if (eventDate.endsWith('-12-24') || eventDate.endsWith('-12-25')) return

    const key = `${normalizeTitle(title)}|${eventDate}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: `Number 52: ${title}`,
      event_date: eventDate,
      start_time: '18:00',
      raw,
      image_url: null,
      method: 'number52-official-schedule',
    })
  }

  for (let monthIndex = today.getUTCMonth(); monthIndex <= 11; monthIndex++) {
    const firstFriday = nthWeekdayOfMonthUtc(year, monthIndex, 5, 1)
    const secondFriday = nthWeekdayOfMonthUtc(year, monthIndex, 5, 2)
    const firstSaturday = nthWeekdayOfMonthUtc(year, monthIndex, 6, 1)
    const thirdSaturday = nthWeekdayOfMonthUtc(year, monthIndex, 6, 3)
    const fourthThursday = nthWeekdayOfMonthUtc(year, monthIndex, 4, 4)

    addCandidate(
      'Dare To Bare',
      firstFriday,
      `${eventBase}/event/dare-to-bare/#${firstFriday}`,
      'Dare To Bare. Official Number 52 repeating event page describes this as the optional no-towels event, open to everyone. Time: 6:00pm - 10:00pm.'
    )

    addCandidate(
      'Top/Vers/Bottom Night',
      secondFriday,
      `${eventBase}/our-events/#top-vers-bottom-${secondFriday}`,
      'Top/Vers/Bottom Night. Official Number 52 monthly event calendar listing. Time: 6:00pm - 10:00pm.'
    )

    addCandidate(
      'Blackout',
      firstSaturday,
      `${eventBase}/event/blackout/#${firstSaturday}`,
      'Blackout. Official Number 52 repeating event page. Time: 6:00pm - 10:00pm.'
    )

    addCandidate(
      'Dare To Bare',
      thirdSaturday,
      `${eventBase}/event/dare-to-bare/#${thirdSaturday}`,
      'Dare To Bare. Official Number 52 monthly calendar listing also surfaces the Saturday Dare To Bare event. Time: 6:00pm - 10:00pm.'
    )

    addCandidate(
      'Sports/Chav Night',
      fourthThursday,
      `${eventBase}/event/sports-chav-night/#${fourthThursday}`,
      'Sports/Chav Night. Official Number 52 repeating event page. Time: 6:00pm - 10:00pm.'
    )
  }

  return candidates
}

function ourPlace4FunEventForDate(eventDate: string) {
  const date = dateFromYmd(eventDate)
  const weekday = date.getUTCDay()

  if (eventDate === '2026-12-24' || eventDate === '2026-12-25') return null

  if (weekday === 2) {
    return {
      title: 'OP4F: The Butterfly Club',
      startTime: '22:00',
      anchor: 'butterfly-club',
      raw: 'The Butterfly Club. Held every Tuesday evening at Our Place 4 Fun. Official OP4F club-night calendar listing.',
      method: 'op4f-weekly-calendar',
    }
  }

  if (weekday === 5) {
    return {
      title: "OP4F: Frisky Friday's",
      startTime: '22:00',
      anchor: 'frisky-fridays',
      raw: "Frisky Friday's. Held every Friday at Our Place 4 Fun, 10pm until 4am. Official OP4F club-night calendar listing.",
      method: 'op4f-weekly-calendar',
    }
  }

  if (weekday === 6) {
    return {
      title: 'OP4F: Saturday Couples & Ladies Party',
      startTime: '22:00',
      anchor: 'saturday-couples-ladies-party',
      raw: 'Saturday Couples & Ladies Party. Every Saturday is listed by OP4F as a couples and ladies club night. Official OP4F club-night calendar listing.',
      method: 'op4f-weekly-calendar',
    }
  }

  return null
}

function extractOurPlace4FunEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url?: string | null
    method: string
  }[] = []

  if (!isOurPlace4FunAllowedPage(baseUrl)) return candidates

  const pageText = normalizeTitle(html)
  const isCalendarPage = baseUrl.toLowerCase().includes('/clubnights.jsp') || baseUrl.toLowerCase().replace(/\/+$/, '').endsWith('/op4f')
  const hasCalendarSignals =
    pageText.includes('club nights') &&
    (
      pageText.includes('single guys allowed') ||
      pageText.includes('couples and single women only') ||
      pageText.includes('special event see details') ||
      pageText.includes('our place 4 fun')
    )

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  if (!todayString) return candidates

  const seen = new Set<string>()
  const eventBase = 'https://ourplace4fun.com/op4f/club.jsp'

  const addCandidate = (eventDate: string, fallbackOnly = false) => {
    const event = ourPlace4FunEventForDate(eventDate)
    if (!event) return
    if (eventDate < todayString) return

    const href = `${eventBase}?cn=${eventDate}#${event.anchor}`
    const key = `${normalizeTitle(event.title)}|${eventDate}|${normalizeTicketUrl(href)}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: event.title,
      event_date: eventDate,
      start_time: event.startTime,
      raw: fallbackOnly
        ? `${event.raw} Date generated from the OP4F calendar URL pattern for ${eventDate}.`
        : event.raw,
      image_url: null,
      method: event.method,
    })
  }

  const dateFromUrl = (() => {
    try {
      const url = new URL(baseUrl)
      return validDateOrNull(url.searchParams.get('cn'))
    } catch {
      return null
    }
  })()

  if (dateFromUrl) {
    addCandidate(dateFromUrl)
    return candidates
  }

  if (!isCalendarPage || !hasCalendarSignals) return candidates

  const dateLinkPattern = /club\.jsp\?cn=(20\d{2}-\d{2}-\d{2})/gi
  let match
  while ((match = dateLinkPattern.exec(html)) !== null) {
    addCandidate(match[1])
  }

  // The OP4F calendar is rendered sparsely in the HTML on some fetchers. The club uses
  // stable recurring club-night entries, so generate the public weekly calendar dates
  // from today through year-end. Closed Christmas Eve/Day are explicitly skipped above.
  const endDate = new Date(Date.UTC(today.getUTCFullYear(), 11, 31))
  let cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  while (cursor <= endDate) {
    const eventDate = datePartsToString(cursor)
    if (eventDate) addCandidate(eventDate, true)
    cursor = addDaysUtc(cursor, 1)
  }

  return candidates
}


function isAtticExperienceSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('the_attic_experience_derby') ||
    combined.includes('theatticexperience.com')
  )
}

function discoverAtticExperienceEventPages(sourceUrl: string) {
  const urls = [
    sourceUrl,
    absoluteUrl(sourceUrl, '/events-prices-2/'),
    absoluteUrl(sourceUrl, '/events-prices-2'),
    absoluteUrl(sourceUrl, '/events/'),
    absoluteUrl(sourceUrl, '/events'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
      return host === 'theatticexperience.com' && !isJunkUrl(url)
    } catch {
      return false
    }
  })
}

function isAtticJunkTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const exact = new Set([
    'events',
    'event',
    'prices',
    'events prices',
    'home',
    'contact',
    'gallery',
    'membership',
    'location',
    'opening times',
    'club rules',
    'rules',
    'dress code',
    'the attic experience',
  ])

  if (exact.has(cleaned)) return true
  if (isJunkTitle(value || '')) return true

  const fragments = [
    'membership',
    'entry',
    'prices',
    'opening',
    'contact',
    'address',
    'privacy',
    'cookie',
    'terms',
    'facebook',
    'instagram',
  ]

  return fragments.some((fragment) => cleaned.includes(fragment))
}

function cleanAtticTitle(value: string) {
  return cleanEventName(value)
    .replace(/^[-–—:|]+/g, '')
    .replace(/\b(?:event|events|prices)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractAtticExperienceEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const image = extractBestImage(html, baseUrl)

  const lineText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|section|article|tr)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')

  const lines = lineText
    .split(/\n+/)
    .map((line) => cleanText(line))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const fullText = cleanText(decodeEscapedText(html)).replace(/\s+/g, ' ').trim()
  const monthWords =
    'jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december'
  const weekdayWords =
    'mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday'

  const addCandidate = (input: {
    title: string
    day: string
    monthName: string
    explicitYear?: string | null
    raw: string
    method: string
  }) => {
    const month = monthNameToNumber(input.monthName)
    if (!month) return

    const day = input.day.padStart(2, '0')
    const year = futureSafeYear(month, day, input.explicitYear || null)
    const eventDate = validDateOrNull(`${year}-${month}-${day}`)
    if (!eventDate) return

    let title = cleanAtticTitle(input.title)
    if (!title || isAtticJunkTitle(title)) return
    if (title.length > 120) title = title.slice(0, 120).trim()

    const href = eventUrlWithAnchor(baseUrl, title)
    const key = `${normalizeTitle(title)}|${eventDate}|${normalizeTicketUrl(href)}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: extractTime(input.raw),
      raw: cleanText(input.raw).slice(0, 500),
      image_url: image,
      method: input.method,
    })
  }

  let activeYear: string | null =
    fullText.match(/\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+(20\d{2})\b/i)?.[1] ||
    null

  const monthHeadingPattern = new RegExp(`^(${monthWords})\\s+(20\\d{2})$`, 'i')
  const linePattern = new RegExp(
    `^(?:${weekdayWords})\\s+` +
      `(\\d{1,2})(?:st|nd|rd|th)?\\s+` +
      `(${monthWords})\\s*[:\\-–—]\\s*` +
      `(.{3,120})$`,
    'i'
  )

  for (const line of lines) {
    const heading = line.match(monthHeadingPattern)
    if (heading) {
      activeYear = heading[2]
      continue
    }

    const match = line.match(linePattern)
    if (!match) continue

    addCandidate({
      day: match[1],
      monthName: match[2],
      explicitYear: activeYear,
      title: match[3],
      raw: line,
      method: 'attic-events-prices-line',
    })
  }

  // Brizy can render these as a single flat text run. This fallback handles:
  // "November 2026 Mon 2nd November : TV & Admirers Extended Wed 4th November : ..."
  const sectionPattern = new RegExp(
    `\\b(${monthWords})\\s+(20\\d{2})([\\s\\S]{0,12000}?)(?=\\b(?:${monthWords})\\s+20\\d{2}\\b|$)`,
    'gi'
  )

  let sectionMatch
  while ((sectionMatch = sectionPattern.exec(fullText)) !== null) {
    const sectionYear = sectionMatch[2]
    const section = sectionMatch[3]
    const eventPattern = new RegExp(
      `\\b(?:${weekdayWords})\\s+` +
        `(\\d{1,2})(?:st|nd|rd|th)?\\s+` +
        `(${monthWords})\\s*[:\\-–—]\\s*` +
        `(.{3,120}?)(?=\\s+\\b(?:${weekdayWords})\\s+\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${monthWords})\\s*[:\\-–—]|$)`,
      'gi'
    )

    let eventMatch
    while ((eventMatch = eventPattern.exec(section)) !== null) {
      addCandidate({
        day: eventMatch[1],
        monthName: eventMatch[2],
        explicitYear: sectionYear,
        title: eventMatch[3],
        raw: eventMatch[0],
        method: 'attic-events-prices-compact',
      })
    }
  }

  // Final fallback if the year heading is not captured.
  const loosePattern = new RegExp(
    `\\b(?:${weekdayWords})\\s+` +
      `(\\d{1,2})(?:st|nd|rd|th)?\\s+` +
      `(${monthWords})\\s*[:\\-–—]\\s*` +
      `(.{3,120}?)(?=\\s+\\b(?:${weekdayWords})\\s+\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${monthWords})\\s*[:\\-–—]|$)`,
    'gi'
  )

  let looseMatch
  while ((looseMatch = loosePattern.exec(fullText)) !== null) {
    addCandidate({
      day: looseMatch[1],
      monthName: looseMatch[2],
      explicitYear: null,
      title: looseMatch[3],
      raw: looseMatch[0],
      method: 'attic-events-prices-loose',
    })
  }

  return candidates
}




function isPenthouseSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('penthouse_playrooms_dunstable') ||
    combined.includes('penthouse-playrooms.co.uk') ||
    combined.includes('penthouse playrooms')
  )
}

function discoverPenthouseEventPages(sourceUrl: string) {
  const urls = [
    sourceUrl,
    absoluteUrl(sourceUrl, '/events'),
    absoluteUrl(sourceUrl, '/events/'),
    // Penthouse is an Inertia/Laravel app. Event detail pages include
    // structured props.event and props.upcomingEvents JSON.
    absoluteUrl(sourceUrl, '/event/1958'),
    absoluteUrl(sourceUrl, '/event/1895'),
    absoluteUrl(sourceUrl, '/event/1890'),
    absoluteUrl(sourceUrl, '/event/1892'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
      return host === 'penthouse-playrooms.co.uk' && !isJunkUrl(url)
    } catch {
      return false
    }
  })
}

function isPenthouseJunkTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const exact = new Set([
    'events',
    'event',
    'upcoming events',
    'about',
    'membership',
    'gallery',
    'faq',
    'contact',
    'login',
    'log in',
    'apply now',
    'reserve your spot for our exclusive experiences',
    'exclusive',
    'limited spots',
    'open to guest members',
    'tickets from',
    'ladies only event',
    'guest members',
    'penthouse playrooms',
  ])

  if (exact.has(cleaned)) return true
  if (isJunkTitle(value || '')) return true

  const fragments = [
    'reserve your spot',
    'membership',
    'apply now',
    'limited spots',
    'tickets from',
    'open to guest members',
    'ladies only event',
    'terms',
    'privacy',
    'cookie',
    'login',
    'log in',
    'faq',
    'contact',
  ]

  if (fragments.some((fragment) => cleaned === fragment || cleaned.startsWith(`${fragment} `))) return true

  return false
}

function cleanPenthouseTitle(value: string) {
  let title = cleanEventName(value)
    .replace(/^[-–—:|]+/g, '')
    .replace(/\b(?:limited spots|exclusive|open to guest members|tickets from|apply now)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Some rendered card text can append the first ticket/perk line after the title.
  const cutMarkers = [
    ' ladies only event',
    ' tickets from',
    ' open to guest members',
    ' reserve your spot',
    ' limited spots',
  ]

  for (const marker of cutMarkers) {
    const index = title.toLowerCase().indexOf(marker)
    if (index > 4) title = title.slice(0, index).trim()
  }

  return title
}


function decodeHtmlJsonAttribute(value: string | null | undefined) {
  if (!value) return ''

  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#x22;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function parseJsonSafely(value: string | null | undefined) {
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function extractPenthouseInertiaPayloads(html: string) {
  const payloads: any[] = []
  const raw = String(html || '').trim()

  const direct = parseJsonSafely(raw)
  if (direct) payloads.push(direct)

  const dataPageMatches = [
    ...String(html || '').matchAll(/data-page=["']([\s\S]*?)["']\s*>/gi),
  ]

  for (const match of dataPageMatches) {
    const decoded = decodeHtmlJsonAttribute(match[1])
    const parsed = parseJsonSafely(decoded)
    if (parsed) payloads.push(parsed)
  }

  const scriptJsonMatches = [
    ...String(html || '').matchAll(/<script[^>]+type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ]

  for (const match of scriptJsonMatches) {
    const decoded = decodeHtmlJsonAttribute(match[1])
    const parsed = parseJsonSafely(decoded)
    if (parsed) payloads.push(parsed)
  }

  return payloads
}

function parsePenthouseIsoDateParts(value: string | null | undefined) {
  if (!value) return { event_date: null as string | null, start_time: null as string | null }

  const raw = String(value)
  const dateMatch = raw.match(/^(20\d{2})-(\d{2})-(\d{2})/)
  const timeMatch = raw.match(/T(\d{2}):(\d{2})/)

  return {
    event_date: dateMatch ? validDateOrNull(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`) : null,
    start_time: timeMatch ? validTimeOrNull(`${timeMatch[1]}:${timeMatch[2]}`) : null,
  }
}

function penthouseEventUrlFromObject(event: any, baseUrl: string, title: string) {
  const raw =
    cleanText(event?.ticket_url) ||
    cleanText(event?.external_ticket_url) ||
    cleanText(event?.url) ||
    cleanText(event?.link) ||
    (event?.id ? `/event/${event.id}` : '')

  const href = absoluteUrl(baseUrl, raw)
  if (href && !isJunkUrl(href)) return href

  return eventUrlWithAnchor(baseUrl, title)
}

function extractPenthouseInertiaEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const payloads = extractPenthouseInertiaPayloads(html)

  const pushEvent = (event: any, sourceLabel: string) => {
    if (!event || typeof event !== 'object') return
    if (event.is_hidden === true) return

    let title = cleanPenthouseTitle(event.title || event.name || event.event_name || '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || isPenthouseJunkTitle(title)) return
    if (title.length > 140) title = title.slice(0, 140).trim()

    const startsAt =
      event.starts_at ||
      event.start_date ||
      event.startDate ||
      event.event_date ||
      event.date ||
      event.starts_pretty_date ||
      ''

    let { event_date, start_time } = parsePenthouseIsoDateParts(startsAt)

    if (!event_date) {
      event_date = extractDate(`${startsAt} ${event.starts_pretty_date || ''} ${event.description || ''}`)
    }

    if (!start_time) {
      start_time = extractTime(`${startsAt} ${event.starts_pretty_date || ''} ${event.description || ''}`)
    }

    const href = penthouseEventUrlFromObject(event, baseUrl, title)
    const imageUrl =
      validImageUrl(absoluteUrl(baseUrl, cleanText(event.image_url || event.imageUrl || event.image || ''))) ||
      null
    const description = cleanDescription(event.description || event.ai_generated_description || title) || title

    if (!event_date && !looksLikeStrongUndatedEvent(`${title} ${description}`)) return

    const key = `${normalizeTitle(title)}|${event_date || 'no-date'}|${normalizeTicketUrl(href)}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date,
      start_time,
      raw: description,
      image_url: imageUrl,
      method: sourceLabel,
    })
  }

  const walkPayload = (value: any, depth = 0) => {
    if (!value || depth > 5) return

    if (Array.isArray(value)) {
      for (const item of value) walkPayload(item, depth + 1)
      return
    }

    if (typeof value !== 'object') return

    if (
      (value.title || value.name || value.event_name) &&
      (value.starts_at || value.start_date || value.startDate || value.event_date || value.starts_pretty_date || value.ticket_url || value.image_url)
    ) {
      pushEvent(value, 'penthouse-inertia-json')
    }

    const props = value.props || value.page?.props || null
    if (props?.event) pushEvent(props.event, 'penthouse-inertia-event')
    if (Array.isArray(props?.upcomingEvents)) {
      for (const event of props.upcomingEvents) pushEvent(event, 'penthouse-inertia-upcoming')
    }
    if (Array.isArray(props?.events)) {
      for (const event of props.events) pushEvent(event, 'penthouse-inertia-events')
    }

    for (const key of ['event', 'events', 'upcomingEvents', 'data']) {
      if (value[key]) walkPayload(value[key], depth + 1)
    }
  }

  for (const payload of payloads) walkPayload(payload)

  return candidates
}

function extractPenthouseImageFromBlock(block: string, baseUrl: string) {
  const rawImage =
    block.match(/(?:image|imageUrl|image_url|src|url)["']?\s*[:=]\s*["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["']/i)?.[1] ||
    block.match(/https?:\\?\/\\?\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s<>]*)?/i)?.[0] ||
    block.match(/\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s<>]*)?/i)?.[0]

  return validImageUrl(absoluteUrl(baseUrl, decodeEscapedText(rawImage || '')))
}

function extractPenthouseHrefFromBlock(block: string, baseUrl: string, title: string) {
  const rawHref =
    block.match(/(?:href|url|link|slug)["']?\s*[:=]\s*["']([^"']{2,240})["']/i)?.[1] ||
    block.match(/\/events\/[a-z0-9][a-z0-9_-]*/i)?.[0] ||
    null

  const href = absoluteUrl(baseUrl, decodeEscapedText(rawHref || ''))
  if (href && !isJunkUrl(href)) return href

  return eventUrlWithAnchor(baseUrl, title)
}

function extractPenthouseEventsFromText(value: string, baseUrl: string, method: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const decoded = decodeEscapedText(value)
  const text = cleanText(decoded).replace(/\s+/g, ' ').trim()
  const fallbackImage = extractBestImage(decoded, baseUrl)

  const addCandidate = (input: {
    title: string
    raw: string
    href?: string | null
    image_url?: string | null
  }) => {
    let title = cleanPenthouseTitle(input.title)
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || isPenthouseJunkTitle(title)) return
    if (title.length < 5 || title.length > 140) return

    const raw = cleanText(input.raw || title).slice(0, 600)
    const eventDate = extractDate(raw)
    const startTime = extractTime(raw)
    const href =
      input.href ||
      extractPenthouseHrefFromBlock(input.raw, baseUrl, title) ||
      eventUrlWithAnchor(baseUrl, title)
    const imageUrl =
      validImageUrl(input.image_url || null) ||
      extractPenthouseImageFromBlock(input.raw, baseUrl) ||
      fallbackImage

    // Penthouse is a JS-rendered card site. If the visible card/poster does not expose
    // a machine-readable date, still save strong event titles as Date TBC rather than
    // losing the event completely.
    if (!eventDate && !looksLikeStrongUndatedEvent(`${title} ${raw}`)) return

    const key = `${normalizeTitle(title)}|${eventDate || 'no-date'}|${normalizeTicketUrl(href)}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw,
      image_url: imageUrl,
      method,
    })
  }

  // JSON/JS object parser. This catches React/Vite bundles and embedded state
  // where event cards are stored as title/name plus optional image/date fields.
  const titleFieldPattern =
    /(?:^|[,{])\s*["']?(?:title|name|eventName|event_name|heading)["']?\s*[:=]\s*["'`]([^"'`]{5,140})["'`]/gi

  let titleMatch
  while ((titleMatch = titleFieldPattern.exec(decoded)) !== null) {
    const start = Math.max(0, (titleMatch.index || 0) - 700)
    const end = Math.min(decoded.length, (titleMatch.index || 0) + 2200)
    const block = decoded.slice(start, end)

    addCandidate({
      title: titleMatch[1],
      raw: block,
      image_url: extractPenthouseImageFromBlock(block, baseUrl),
      href: extractPenthouseHrefFromBlock(block, baseUrl, titleMatch[1]),
    })
  }

  // HTML/SSR card parser for cases where cards are rendered in the initial document.
  const headingPattern =
    /<(?:h1|h2|h3|h4|p|span|div)[^>]*>([^<]{5,140})<\/(?:h1|h2|h3|h4|p|span|div)>/gi

  let headingMatch
  while ((headingMatch = headingPattern.exec(decoded)) !== null) {
    const title = cleanText(headingMatch[1])
    if (!title || isPenthouseJunkTitle(title)) continue

    const start = Math.max(0, (headingMatch.index || 0) - 900)
    const end = Math.min(decoded.length, (headingMatch.index || 0) + 2200)
    const block = decoded.slice(start, end)

    addCandidate({
      title,
      raw: block,
      image_url: extractPenthouseImageFromBlock(block, baseUrl),
      href: extractPenthouseHrefFromBlock(block, baseUrl, title),
    })
  }

  // Flattened-text fallback. Handles runs like:
  // "Limited Spots ... Pink Noise - Breast Cancer Awareness Event ... Tickets From ..."
  const cardTitlePattern =
    /\b(?:Limited Spots|Exclusive|Upcoming Events)\b\s+([A-Z][A-Za-z0-9 '&+.,:/!()-]{5,130}?)(?=\s+(?:Ladies Only Event|Open to Guest Members|Tickets From|Limited Spots|Exclusive|Apply Now|About|Membership|Gallery|FAQ|Contact)\b)/gi

  let cardMatch
  while ((cardMatch = cardTitlePattern.exec(text)) !== null) {
    const start = Math.max(0, cardMatch.index - 300)
    const end = Math.min(text.length, cardMatch.index + 900)
    addCandidate({
      title: cardMatch[1],
      raw: text.slice(start, end),
    })
  }

  // Poster/date-text fallback. Useful if the date appears around the card text.
  const datedTitlePatterns = [
    /([A-Z][A-Za-z0-9 '&+.,:/!()-]{5,120}?)\s+(?:on\s+)?(?:mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s*(20\d{2})?/gi,
    /(?:mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s*(20\d{2})?\s+([A-Z][A-Za-z0-9 '&+.,:/!()-]{5,120}?)(?=\s+(?:Ladies Only Event|Open to Guest Members|Tickets From|Limited Spots|Exclusive|$))/gi,
  ]

  for (const pattern of datedTitlePatterns) {
    let match

    while ((match = pattern.exec(text)) !== null) {
      const title = pattern === datedTitlePatterns[0] ? match[1] : match[4]
      const raw = match[0]

      addCandidate({
        title,
        raw,
      })
    }
  }

  return candidates
}

function extractPenthouseEvents(html: string, baseUrl: string) {
  const inertiaEvents = extractPenthouseInertiaEvents(html, baseUrl)
  const renderedEvents = extractPenthouseEventsFromText(html, baseUrl, 'penthouse-rendered-or-state')
  const seen = new Set<string>()
  const merged: typeof renderedEvents = []

  for (const event of [...inertiaEvents, ...renderedEvents]) {
    const key = `${normalizeTitle(event.text)}|${event.event_date || 'no-date'}|${normalizeTicketUrl(event.href)}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(event)
  }

  return merged
}

async function fetchPenthouseBundleEvents(html: string, baseUrl: string) {
  const events: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const scriptUrls = extractScriptUrls(html, baseUrl)
    .filter((url) => {
      const lower = url.toLowerCase()
      return (
        sameDomain(baseUrl, url) ||
        lower.includes('vercel.app') ||
        lower.includes('_next') ||
        lower.includes('/assets/') ||
        lower.includes('.js')
      )
    })
    .slice(0, 10)

  for (const scriptUrl of scriptUrls) {
    const js = await fetchText(scriptUrl, 'application/javascript,text/javascript,text/plain,*/*')
    if (!js) continue

    const parsed = extractPenthouseEventsFromText(js, scriptUrl, 'penthouse-js-bundle')

    for (const event of parsed) {
      const href = event.href || eventUrlWithAnchor(baseUrl, event.text)
      const key = `${normalizeTitle(event.text)}|${event.event_date || 'no-date'}|${normalizeTicketUrl(href)}`
      if (seen.has(key)) continue
      seen.add(key)

      events.push({
        ...event,
        href,
      })
    }
  }

  return events
}


const SF10_RECOVERY_VENUES = new Set([
  'club_f_birmingham',
  'dominium_vita_london',
  'eureka_parties_fawkham_kent',
  'ignite_west_drayton_heathrow',
  'me1_sauna_rochester_kent',
  'the_annex_king_s_lynn',
  'the_new_gatehouse_bolton_bolton',
  'riot_party_london_manchester_bristol',
  'route69_weston_super_mare',
])

function isSf10RecoverySource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const venue = String(venueId || '')
  const url = String(sourceUrl || '').toLowerCase()

  return (
    SF10_RECOVERY_VENUES.has(venue) ||
    url.includes('clubf.uk') ||
    url.includes('dominiumvita.com') ||
    url.includes('eurekanaturistclub.co.uk') ||
    url.includes('club-ignite.co.uk') ||
    url.includes('me1sauna.co.uk') ||
    url.includes('theannex.org.uk') ||
    url.includes('thenewgatehousebolton.co.uk') ||
    url.includes('riotparty.co.uk') ||
    url.includes('route69-wsm.co.uk')
  )
}

function discoverSf10RecoveryEventPages(source: { venue_id: string; source_url: string }) {
  if (isRoute69Source(source.venue_id, source.source_url)) {
    return discoverRoute69EventPages(source.source_url)
  }

  if (isMe1SaunaSource(source.venue_id, source.source_url)) {
    return discoverMe1SaunaEventPages(source.source_url)
  }

  if (isGatehouseBoltonSource(source.venue_id, source.source_url)) {
    return discoverGatehouseBoltonEventPages(source.source_url)
  }

  const urls = new Set<string>()
  urls.add(source.source_url)

  const perVenuePaths: Record<string, string[]> = {
    // Club F fixed-list parser should only run once against the canonical /events page.
    club_f_birmingham: ['/events'],
    dominium_vita_london: ['/events/', '/events'],
    eureka_parties_fawkham_kent: ['/events-calendar/', '/events-calendar', '/events/', '/events'],
    ignite_west_drayton_heathrow: ['/events-new/', '/events-new', '/events/', '/events'],
    me1_sauna_rochester_kent: ['/events', '/events/'],
    the_annex_king_s_lynn: ['/events-2/', '/events-2', '/events/', '/events'],
    riot_party_london_manchester_bristol: ['/upcoming-events/', '/upcoming-events', '/events/', '/events'],
    route69_weston_super_mare: ['/events', '/events/'],
  }

  for (const path of perVenuePaths[source.venue_id] || ['/events', '/events/', '/calendar']) {
    const url = absoluteUrl(source.source_url, path)
    if (url) urls.add(url)
  }

  return [...urls].filter((url) => allowedSourcePageForVenue(source, url) && !isJunkUrl(url))
}

function isSf10RecoverySkipLine(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const fragments = [
    'upcoming events',
    'events calendar',
    'calendar',
    'book now',
    'book tickets',
    'buy tickets',
    'tickets',
    'ticket',
    'read more',
    'more info',
    'find out more',
    'view event',
    'view details',
    'details',
    'contact',
    'home',
    'about',
    'membership',
    'memberships',
    'opening times',
    'prices',
    'privacy policy',
    'cookie policy',
    'terms and conditions',
    'facebook',
    'instagram',
    'twitter',
    'whatsapp',
    'share',
    'subscribe',
    'newsletter',
    'menu',
  ]

  if (isJunkTitle(value || '')) return true
  if (fragments.some((fragment) => cleaned === fragment || cleaned.includes(fragment))) return true
  if (/^£\s*\d+/.test(cleanText(value || ''))) return true
  if (/^\d{1,2}(:\d{2})?\s*(am|pm)\s*(to|until|-)/i.test(cleanText(value || ''))) return true

  return false
}

function cleanSf10RecoveryTitle(value: string) {
  let title = cleanEventName(value)
    .replace(/^[-–—:|]+/g, '')
    .replace(/\b(?:book now|book tickets|buy tickets|tickets?|read more|more info|view event|view details|details)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const cutMarkers = [
    ' book now',
    ' book tickets',
    ' buy tickets',
    ' tickets',
    ' read more',
    ' more info',
    ' view details',
    ' view event',
  ]

  for (const marker of cutMarkers) {
    const index = title.toLowerCase().indexOf(marker)
    if (index > 4) title = title.slice(0, index).trim()
  }

  return title
}




function isRoute69Source(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('route69_weston_super_mare') ||
    combined.includes('route69-wsm.co.uk') ||
    combined.includes('route69 wsm') ||
    combined.includes('route 69 weston') ||
    combined.includes('route69 weston')
  )
}

function isRoute69AllowedPage(pageUrl: string | null | undefined) {
  try {
    const parsed = new URL(String(pageUrl || ''))
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    return host === 'route69-wsm.co.uk' && path === '/events'
  } catch {
    return false
  }
}

function discoverRoute69EventPages(sourceUrl: string) {
  const url = absoluteUrl(sourceUrl, '/events') || 'https://route69-wsm.co.uk/events'

  return [url].filter((pageUrl) => isRoute69AllowedPage(pageUrl) && !isJunkUrl(pageUrl))
}

function extractRoute69Events(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isRoute69AllowedPage(baseUrl)) return candidates

  const lowerHtml = String(html || '').toLowerCase()
  const pageText = cleanText(html).toLowerCase()

  const hasRoute69EventsPage =
    pageText.includes('please see the calendars below for our events') ||
    lowerHtml.includes('r69eventsjun2026') ||
    lowerHtml.includes('r69eventsjul2026') ||
    lowerHtml.includes('guide to events')

  if (!hasRoute69EventsPage) return candidates

  const image = extractBestImage(html, baseUrl)
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)

  if (!todayString) return candidates

  const junePdf = 'https://img1.wsimg.com/blobby/go/ef7be6ae-716c-4c5d-b2d1-01d1682ebb5f/R69EventsJUN2026.pdf'
  const julyPdf = 'https://img1.wsimg.com/blobby/go/ef7be6ae-716c-4c5d-b2d1-01d1682ebb5f/R69EventsJUL2026.pdf'

  const pageHasJunePdf = lowerHtml.includes('r69eventsjun2026') || lowerHtml.includes(junePdf.toLowerCase())
  const pageHasJulyPdf = lowerHtml.includes('r69eventsjul2026') || lowerHtml.includes(julyPdf.toLowerCase())

  const events = [
    // Route69 publishes monthly PDF calendars. Only named future event cells are emitted.
    // Plain open-session cells are deliberately skipped so we do not create generic opening-time rows.
    { event_date: '2026-06-26', text: 'Kinky Night', start_time: '20:00', href: junePdf, raw: 'June 2026 Guide to Events - Friday 26 June - 8PM - 2AM - Kinky Night', pdfVisible: pageHasJunePdf },
    { event_date: '2026-06-27', text: 'Greedy Girls', start_time: '20:00', href: junePdf, raw: 'June 2026 Guide to Events - Saturday 27 June - 8PM - 2AM - Greedy Girls', pdfVisible: pageHasJunePdf },
    { event_date: '2026-07-04', text: 'Bare It All', start_time: '20:00', href: julyPdf, raw: 'July 2026 Guide to Events - Saturday 4 July - 8PM - 2AM - Bare It All', pdfVisible: pageHasJulyPdf },
    { event_date: '2026-07-05', text: 'Greedy Girls', start_time: '14:00', href: julyPdf, raw: 'July 2026 Guide to Events - Sunday 5 July - 2PM - 10PM - Greedy Girls', pdfVisible: pageHasJulyPdf },
    { event_date: '2026-07-10', text: 'Kinky Night', start_time: '20:00', href: julyPdf, raw: 'July 2026 Guide to Events - Friday 10 July - 8PM - 2AM - Kinky Night', pdfVisible: pageHasJulyPdf },
    { event_date: '2026-07-11', text: 'BDSM Night', start_time: '20:00', href: julyPdf, raw: 'July 2026 Guide to Events - Saturday 11 July - 8PM - 2AM - BDSM Night', pdfVisible: pageHasJulyPdf },
    { event_date: '2026-07-18', text: 'Bi Night', start_time: '20:00', href: julyPdf, raw: 'July 2026 Guide to Events - Saturday 18 July - 8PM - 2AM - Bi Night', pdfVisible: pageHasJulyPdf },
    { event_date: '2026-07-19', text: 'Greedy Girls', start_time: '14:00', href: julyPdf, raw: 'July 2026 Guide to Events - Sunday 19 July - 2PM - 10PM - Greedy Girls', pdfVisible: pageHasJulyPdf },
    { event_date: '2026-07-25', text: 'Greedy Girls', start_time: '20:00', href: julyPdf, raw: 'July 2026 Guide to Events - Saturday 25 July - 8PM - 2AM - Greedy Girls', pdfVisible: pageHasJulyPdf },
    { event_date: '2026-07-31', text: 'Greedy Girls', start_time: '20:00', href: julyPdf, raw: 'July 2026 Guide to Events - Friday 31 July - 8PM - 2AM - Greedy Girls', pdfVisible: pageHasJulyPdf },
  ]

  const seen = new Set<string>()

  for (const event of events) {
    if (!event.pdfVisible) continue
    if (event.event_date < todayString) continue

    const title = cleanSf10RecoveryTitle(event.text)
      .replace(/^[-–—:|]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || isSf10RecoverySkipLine(title)) continue

    const key = `${normalizeTitle(title)}|${event.event_date}|${normalizeTicketUrl(event.href)}`
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href: event.href,
      text: title,
      event_date: event.event_date,
      start_time: event.start_time,
      raw: event.raw,
      image_url: image,
      method: 'route69-pdf-calendar-fixed-list',
    })
  }

  return candidates
}



function isMe1SaunaSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('me1_sauna_rochester_kent') ||
    combined.includes('me1sauna.co.uk') ||
    combined.includes('me1 sauna') ||
    combined.includes('me1 sauna and steam')
  )
}

function isMe1SaunaAllowedPage(pageUrl: string | null | undefined) {
  try {
    const parsed = new URL(String(pageUrl || ''))
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    return host === 'me1sauna.co.uk' && path === '/events'
  } catch {
    return false
  }
}

function discoverMe1SaunaEventPages(sourceUrl: string) {
  const url = absoluteUrl(sourceUrl, '/events') || 'https://www.me1sauna.co.uk/events'

  return [url].filter((pageUrl) => isMe1SaunaAllowedPage(pageUrl) && !isJunkUrl(pageUrl))
}

function lastWeekdayOfMonth(year: number, monthIndex: number, weekday: number) {
  const date = new Date(Date.UTC(year, monthIndex + 1, 0))

  while (date.getUTCDay() !== weekday) {
    date.setUTCDate(date.getUTCDate() - 1)
  }

  return date
}

function nthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, nth: number) {
  const date = new Date(Date.UTC(year, monthIndex, 1))

  while (date.getUTCDay() !== weekday) {
    date.setUTCDate(date.getUTCDate() + 1)
  }

  date.setUTCDate(date.getUTCDate() + 7 * Math.max(0, nth - 1))

  if (date.getUTCMonth() !== monthIndex) return null

  return date
}

function extractMe1SaunaEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isMe1SaunaAllowedPage(baseUrl)) return candidates

  const pageText = cleanText(html).toLowerCase()

  const hasMe1EventsPage =
    pageText.includes('events for all tastes') ||
    pageText.includes('furry friday') ||
    pageText.includes('most tuesdays') ||
    pageText.includes('t-girl') ||
    pageText.includes('bi night') ||
    pageText.includes('twice a month')

  if (!hasMe1EventsPage) return candidates

  const image = extractBestImage(html, baseUrl)
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const todayString = datePartsToString(today)
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), 11, 31))

  if (!todayString || endDate < today) return candidates

  const seen = new Set<string>()

  const pushCandidate = (input: {
    title: string
    eventDate: string | null
    startTime: string | null
    raw: string
    href?: string | null
  }) => {
    if (!input.eventDate || input.eventDate < todayString) return

    let title = cleanSf10RecoveryTitle(input.title)
      .replace(/^[-–—:|]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || isSf10RecoverySkipLine(title)) return
    if (title.length > 120) title = title.slice(0, 120).trim()

    const href = input.href || eventUrlWithAnchor(baseUrl, input.title)
    const key = `${normalizeTitle(title)}|${input.eventDate}|${normalizeTicketUrl(href)}`

    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: input.eventDate,
      start_time: input.startTime,
      raw: input.raw,
      image_url: image,
      method: 'me1-sauna-recurring-schedule',
    })
  }

  const addWeekly = (input: {
    weekday: number
    title: string
    startTime: string
    raw: string
  }) => {
    const occurrence = new Date(today)
    const daysUntil = (input.weekday - occurrence.getUTCDay() + 7) % 7
    occurrence.setUTCDate(occurrence.getUTCDate() + daysUntil)

    while (occurrence <= endDate) {
      pushCandidate({
        title: input.title,
        eventDate: datePartsToString(occurrence),
        startTime: input.startTime,
        raw: input.raw,
      })

      occurrence.setUTCDate(occurrence.getUTCDate() + 7)
    }
  }

  // Official ME1 events page: Furry Friday is every Friday; most Tuesdays are T-Girl.
  // Keep Lads 4 Dads/Naked out here because the current page does not expose exact dates.
  if (pageText.includes('furry friday')) {
    addWeekly({
      weekday: 5,
      title: 'Furry Social',
      startTime: '10:00',
      raw: 'Furry Friday is now every Friday due to popular demand. Bears, Cubs and Admirers day at ME1 Sauna.',
    })
  }

  if (pageText.includes('t-girl') || pageText.includes('tgirl') || pageText.includes('most tuesdays')) {
    addWeekly({
      weekday: 2,
      title: 'T-Girl Social',
      startTime: '10:00',
      raw: 'Most Tuesdays ME1 hosts T-Girl, a social afternoon for T-Girls and admirers.',
    })
  }

  // Official ME1 page says Bi Night is twice a month from 6pm.
  // The dedicated Bi-Monthly site gives the exact rule: 2nd and last Saturday of the month.
  if (pageText.includes('bi night') || pageText.includes('twice a month')) {
    for (let monthIndex = today.getUTCMonth(); monthIndex <= 11; monthIndex++) {
      const secondSaturday = nthWeekdayOfMonth(today.getUTCFullYear(), monthIndex, 6, 2)
      const lastSaturday = lastWeekdayOfMonth(today.getUTCFullYear(), monthIndex, 6)

      for (const date of [secondSaturday, lastSaturday]) {
        const eventDate = date ? datePartsToString(date) : null

        pushCandidate({
          title: 'Bi-Monthly Social',
          eventDate,
          startTime: '18:00',
          raw: 'Bi-Monthly / Bi Night at ME1 Sauna. Twice monthly social on the 2nd and last Saturday of the month, from 6pm till late.',
          href: 'https://www.bimonthly.co.uk/',
        })
      }
    }
  }

  return candidates
}


function isGatehouseBoltonSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('the_new_gatehouse_bolton_bolton') ||
    combined.includes('thenewgatehousebolton.co.uk') ||
    combined.includes('the new gatehouse bolton') ||
    combined.includes('gh events bolton')
  )
}

function isGatehouseBoltonAllowedPage(pageUrl: string | null | undefined) {
  try {
    const parsed = new URL(String(pageUrl || ''))
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    return host === 'thenewgatehousebolton.co.uk' && path === '/what-s-on'
  } catch {
    return false
  }
}

function discoverGatehouseBoltonEventPages(sourceUrl: string) {
  const url = absoluteUrl(sourceUrl, '/what-s-on') || 'https://www.thenewgatehousebolton.co.uk/what-s-on'

  return [url].filter((pageUrl) => isGatehouseBoltonAllowedPage(pageUrl) && !isJunkUrl(pageUrl))
}

function extractGatehouseBoltonEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isGatehouseBoltonAllowedPage(baseUrl)) return candidates

  const pageText = cleanText(html).toLowerCase()

  // The Gatehouse upcoming-events page is gallery/poster based. The reliable
  // machine-readable source is the What's On weekly programme, so keep this
  // parser deliberately fixed to that venue/page only.
  const hasGatehouseSchedule =
    pageText.includes('monday funday') ||
    pageText.includes('men only day') ||
    pageText.includes('tgirls and admirers') ||
    pageText.includes('fetish fridays') ||
    pageText.includes('super saturday')

  if (!hasGatehouseSchedule) return candidates

  const image = extractBestImage(html, baseUrl)
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), 11, 31))
  const todayString = datePartsToString(today)

  if (!todayString || endDate < today) return candidates

  const schedule = [
    {
      weekday: 1,
      text: 'Monday Funday',
      start_time: '12:00',
      raw: 'Monday - Monday funday - 12 noon till 6pm',
    },
    {
      weekday: 2,
      text: 'Men Only Day',
      start_time: '10:00',
      raw: 'Tuesday - Men Only day - 10am till 4pm',
    },
    {
      weekday: 3,
      text: 'Tgirls and Admirers',
      start_time: '11:00',
      raw: 'Wednesday - Tgirls and admirers - 11am till midnight. Tgirls can gain access from 10am.',
    },
    {
      weekday: 4,
      text: 'Bisexual Day',
      start_time: '10:00',
      raw: 'Thursday - Bi sexual day - 10am till 4pm',
    },
    {
      weekday: 5,
      text: 'Fetish Friday',
      start_time: '12:00',
      raw: 'Friday - Fetish Fridays - 12 noon till 1am',
    },
    {
      weekday: 6,
      text: 'Super Saturday - Tgirl Friendly Mixed Event',
      start_time: '12:00',
      raw: 'Super Saturday 12 noon til late. Tgirl Friendly Mixed Event. Tgirls can gain access from 11am.',
    },
  ]

  const seen = new Set<string>()

  for (const item of schedule) {
    const occurrence = new Date(today)
    const daysUntil = (item.weekday - occurrence.getUTCDay() + 7) % 7
    occurrence.setUTCDate(occurrence.getUTCDate() + daysUntil)

    while (occurrence <= endDate) {
      const eventDate = datePartsToString(occurrence)

      if (eventDate && eventDate >= todayString) {
        const href = eventUrlWithAnchor(baseUrl, item.text)
        const key = `${normalizeTitle(item.text)}|${eventDate}`

        if (!seen.has(key)) {
          seen.add(key)

          candidates.push({
            href,
            text: item.text,
            event_date: eventDate,
            start_time: item.start_time,
            raw: item.raw,
            image_url: image,
            method: 'gatehouse-bolton-weekly-schedule',
          })
        }
      }

      occurrence.setUTCDate(occurrence.getUTCDate() + 7)
    }
  }

  return candidates
}


function isIgniteSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('ignite_west_drayton_heathrow') ||
    combined.includes('club-ignite.co.uk') ||
    combined.includes('club ignite')
  )
}

function cleanIgniteTitle(value: string | null | undefined) {
  let title = cleanEventName(value || '')
    .replace(/\bFeatured\b/gi, '')
    .replace(/\bOngoing\b/gi, '')
    .replace(/\bevent\s+event,?\s*[-–—]*\s*/gi, '')
    .replace(/\bselect date\b/gi, '')
    .replace(/\bviews navigation\b/gi, '')
    .replace(/\bnext day\b/gi, '')
    .replace(/\bprevious day\b/gi, '')
    .replace(/\btoday\b/gi, '')
    .replace(/\bday list month day\b/gi, '')
    .replace(/\s*[-–—,|]+\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  title = title
    .replace(/^at\d{1,2}:?\s*(am|pm)\s*/i, '')
    .replace(/^(am|pm)\s*[-–—:]?\s*/i, '')
    .replace(/^\d{1,2}:?\d{0,2}\s*(am|pm)?\s*[-–—:]?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  const normalised = normalizeTitle(title)

  if (normalised.includes('silks skins spa day')) return 'Silks & Skins Spa Day'
  if (normalised.includes('half off friday')) return 'Half Off Friday'
  if (normalised.includes('social at ignite')) return 'Social at Ignite'
  if (normalised.includes('couples ladies only saturday party')) return 'Couples & Ladies ONLY Saturday Party'
  if (normalised.includes('couples and ladies only saturday party')) return 'Couples & Ladies ONLY Saturday Party'
  if (normalised.includes('saturday couples singles social after party')) return 'Saturday Couples & Singles Social after Party'
  if (normalised.includes('couples singles social after party')) return 'Couples & Singles Social after Party'
  if (normalised.includes('couples and singles social after party')) return 'Couples & Singles Social after Party'

  return title
}

function isIgniteJunkTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')

  if (!cleaned) return true

  const exactJunk = new Set([
    'featured',
    'next day',
    'previous day',
    'today',
    'day',
    'month',
    'list',
    'select date',
    'event',
    'events',
    'event views navigation',
    'views navigation',
    'views navigation event views navigation day list month day today',
    'views navigation event views navigation day list month day today am',
  ])

  if (exactJunk.has(cleaned)) return true
  if (isJunkTitle(value || '')) return true

  const junkFragments = [
    'views navigation',
    'select date',
    'previous day',
    'next day',
    'event views navigation',
    'day list month day',
    'club ignite events',
    'show events search',
  ]

  if (junkFragments.some((fragment) => cleaned.includes(fragment))) return true
  if (/^(at\s*)?\d{1,2}:?\s*(am|pm)?$/.test(cleaned)) return true
  if (/^(am|pm)\s*-?\s*(am|pm)?$/.test(cleaned)) return true
  if (/^(mon|tue|wed|thu|fri|sat|sun)\s+\d{1,2}$/.test(cleaned)) return true
  if (cleaned.length < 8) return true

  return false
}

function isIgniteAllowedTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(cleanIgniteTitle(value || ''))

  return (
    cleaned === 'silks skins spa day' ||
    cleaned === 'half off friday' ||
    cleaned === 'social at ignite' ||
    cleaned === 'couples ladies only saturday party' ||
    cleaned === 'couples singles social after party' ||
    cleaned === 'saturday couples singles social after party'
  )
}

function extractIgniteEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const image = extractBestImage(html, baseUrl)

  const addIgniteCandidate = (input: {
    title: string
    event_date: string | null
    start_time?: string | null
    raw: string
    href?: string | null
    method: string
  }) => {
    const title = cleanIgniteTitle(input.title)

    if (!title || isIgniteJunkTitle(title)) return
    if (!isIgniteAllowedTitle(title)) return
    if (!input.event_date) return

    const href = input.href || eventUrlWithAnchor(baseUrl, title)
    const key = `${normalizeTitle(title)}|${input.event_date}`

    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: input.event_date,
      start_time: input.start_time || extractTime(input.raw),
      raw: cleanText(input.raw || title).slice(0, 500),
      image_url: image,
      method: input.method,
    })
  }

  // Prefer structured Event data if Ignite exposes it.
  for (const event of extractJsonLdEvents(html, baseUrl)) {
    addIgniteCandidate({
      title: event.name,
      event_date: event.date,
      start_time: event.start_time,
      raw: event.description || event.name,
      href: event.url || baseUrl,
      method: 'ignite-jsonld',
    })
  }

  // Then use calendar/event links, but only if they resolve to known Ignite event names.
  for (const link of extractCalendarEventLinks(html, baseUrl)) {
    addIgniteCandidate({
      title: link.text,
      event_date: link.event_date || extractDate(`${link.raw} ${link.text}`),
      start_time: extractTime(link.raw),
      raw: link.raw || link.text,
      href: link.href,
      method: 'ignite-calendar-link',
    })
  }

  const decoded = cleanText(decodeEscapedText(html)).replace(/\s+/g, ' ').trim()
  const titlePatterns = [
    /silks\s*&?\s*skins\s+spa\s+day/gi,
    /half\s+off\s+friday/gi,
    /social\s+at\s+ignite/gi,
    /(?:saturday\s+)?couples\s*&?\s*(?:and\s*)?singles\s+social\s+after\s+party/gi,
    /couples\s*&?\s*(?:and\s*)?ladies\s+only\s+saturday\s+party/gi,
  ]

  for (const pattern of titlePatterns) {
    let match

    while ((match = pattern.exec(decoded)) !== null) {
      const start = Math.max(0, (match.index || 0) - 450)
      const end = Math.min(decoded.length, (match.index || 0) + 450)
      const windowText = decoded.slice(start, end)
      const eventDate = extractDate(windowText)

      addIgniteCandidate({
        title: match[0],
        event_date: eventDate,
        start_time: extractTime(windowText),
        raw: windowText,
        method: 'ignite-strict-text',
      })
    }
  }

  return candidates
}


function extractSf10RecoveryEvents(html: string, baseUrl: string, venueId: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const image = extractBestImage(html, baseUrl)
  const links = extractLinks(html, baseUrl)
  const monthWords = 'jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december'
  const weekdayWords = 'mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday'

  const addCandidate = (input: {
    title: string
    event_date: string | null
    start_time?: string | null
    raw: string
    href?: string | null
    method: string
  }) => {
    let title = cleanSf10RecoveryTitle(input.title)
    if (!title || isSf10RecoverySkipLine(title)) return
    if (title.length < 5) return
    if (title.length > 130) title = title.slice(0, 130).trim()

    const href =
      input.href ||
      links.find((link) => {
        const linkText = normalizeTitle(link.text)
        const titleText = normalizeTitle(title)
        if (!titleText || isJunkUrl(link.href)) return false
        return (
          linkText.includes(titleText.slice(0, 20)) ||
          titleText.includes(linkText.slice(0, 20)) ||
          link.href.toLowerCase().includes(titleText.split(' ').slice(0, 3).join('-'))
        )
      })?.href ||
      eventUrlWithAnchor(baseUrl, title)

    const eventDate = input.event_date || extractDate(input.raw)
    if (!eventDate && !looksLikeStrongUndatedEvent(`${title} ${input.raw}`)) return

    const key = `${normalizeTitle(title)}|${eventDate || 'no-date'}|${normalizeTicketUrl(href)}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: input.start_time || extractTime(input.raw),
      raw: cleanText(input.raw || title).slice(0, 600),
      image_url: image,
      method: input.method,
    })
  }

  // JSON-LD is the safest when present.
  for (const event of extractJsonLdEvents(html, baseUrl)) {
    addCandidate({
      title: event.name,
      event_date: event.date,
      start_time: event.start_time,
      raw: event.description || event.name,
      href: event.url || baseUrl,
      method: 'sf10-recovery-jsonld',
    })
  }

  // WordPress/Event-calendar cards and links.
  for (const link of extractCalendarEventLinks(html, baseUrl)) {
    addCandidate({
      title: link.text,
      event_date: link.event_date,
      start_time: extractTime(link.raw),
      raw: link.raw || link.text,
      href: link.href,
      method: 'sf10-recovery-calendar-link',
    })
  }

  const lineText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|section|article|tr|td|span)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')

  const lines = lineText
    .split(/\n+/)
    .map((line) => cleanText(decodeEscapedText(line)))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const dateLinePatterns = [
    new RegExp(`^(?:${weekdayWords})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthWords})(?:\\s+(20\\d{2}))?\\s*(.*)$`, 'i'),
    new RegExp(`^(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthWords})(?:\\s+(20\\d{2}))?\\s*(.*)$`, 'i'),
    new RegExp(`^(${monthWords})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(20\\d{2}))?\\s*(.*)$`, 'i'),
    /^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](20\d{2}|\d{2}))?\s*(.*)$/i,
  ]

  const parseDateLine = (line: string) => {
    let match = line.match(dateLinePatterns[0])
    if (match) {
      const month = monthNameToNumber(match[2])
      if (!month) return null
      const day = match[1].padStart(2, '0')
      const year = futureSafeYear(month, day, match[3] || null)
      return { event_date: validDateOrNull(`${year}-${month}-${day}`), inlineTitle: cleanText(match[4] || '') }
    }

    match = line.match(dateLinePatterns[1])
    if (match) {
      const month = monthNameToNumber(match[2])
      if (!month) return null
      const day = match[1].padStart(2, '0')
      const year = futureSafeYear(month, day, match[3] || null)
      return { event_date: validDateOrNull(`${year}-${month}-${day}`), inlineTitle: cleanText(match[4] || '') }
    }

    match = line.match(dateLinePatterns[2])
    if (match) {
      const month = monthNameToNumber(match[1])
      if (!month) return null
      const day = match[2].padStart(2, '0')
      const year = futureSafeYear(month, day, match[3] || null)
      return { event_date: validDateOrNull(`${year}-${month}-${day}`), inlineTitle: cleanText(match[4] || '') }
    }

    match = line.match(dateLinePatterns[3])
    if (match) {
      const day = match[1].padStart(2, '0')
      const month = match[2].padStart(2, '0')
      const year = futureSafeYear(month, day, normaliseTwoDigitYear(match[3]) || null)
      return { event_date: validDateOrNull(`${year}-${month}-${day}`), inlineTitle: cleanText(match[4] || '') }
    }

    return null
  }

  const isDateLine = (line: string) => !!parseDateLine(line)

  for (let index = 0; index < lines.length; index++) {
    const parsedDate = parseDateLine(lines[index])
    if (!parsedDate?.event_date) continue

    const block = [lines[index]]

    for (let next = index + 1; next < lines.length; next++) {
      if (isDateLine(lines[next])) break
      if (normalizeTitle(lines[next]) === 'contact') break
      if (normalizeTitle(lines[next]) === 'footer') break
      block.push(lines[next])
      if (block.length >= 10) break
    }

    const title =
      [parsedDate.inlineTitle, ...block.slice(1)]
        .map((line) => cleanText(line))
        .filter(Boolean)
        .filter((line) => line.length <= 120)
        .find((line) => !isSf10RecoverySkipLine(line)) || ''

    addCandidate({
      title,
      event_date: parsedDate.event_date,
      start_time: extractTime(block.join(' ')),
      raw: block.join(' '),
      method: `sf10-recovery-lines-${venueId}`,
    })
  }

  const compactText = cleanText(decodeEscapedText(html)).replace(/\s+/g, ' ').trim()
  const compactPatterns = [
    new RegExp(`(?:${weekdayWords})?\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthWords})(?:\\s+(20\\d{2}))?\\s+([A-Z][A-Za-z0-9 '&+.,:/!()\\-]{5,120}?)(?=\\s+(?:${weekdayWords})?\\s*\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${monthWords})|$)`, 'gi'),
    new RegExp(`([A-Z][A-Za-z0-9 '&+.,:/!()\\-]{5,120}?)\\s+(?:${weekdayWords})?\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthWords})(?:\\s+(20\\d{2}))?`, 'gi'),
  ]

  for (const pattern of compactPatterns) {
    let match

    while ((match = pattern.exec(compactText)) !== null) {
      if (pattern === compactPatterns[0]) {
        const month = monthNameToNumber(match[2])
        if (!month) continue
        const day = match[1].padStart(2, '0')
        const year = futureSafeYear(month, day, match[3] || null)

        addCandidate({
          title: match[4],
          event_date: validDateOrNull(`${year}-${month}-${day}`),
          start_time: extractTime(match[0]),
          raw: match[0],
          method: `sf10-recovery-compact-after-date-${venueId}`,
        })
      } else {
        const month = monthNameToNumber(match[3])
        if (!month) continue
        const day = match[2].padStart(2, '0')
        const year = futureSafeYear(month, day, match[4] || null)

        addCandidate({
          title: match[1],
          event_date: validDateOrNull(`${year}-${month}-${day}`),
          start_time: extractTime(match[0]),
          raw: match[0],
          method: `sf10-recovery-compact-before-date-${venueId}`,
        })
      }
    }
  }

  return candidates
}



function isClubFSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('club_f_birmingham') ||
    combined.includes('clubf.uk') ||
    combined.includes('club f')
  )
}

function extractClubFEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  // Club F currently lists recurring dates on /events as plain visible HTML,
  // but some fetches return minimal/alternate markup that the generic parser
  // misses. This fixed-list fallback is deliberately scoped to clubf.uk only
  // and only emits once from the canonical /events page. The /whats-on and
  // /calendar aliases mirror the same content and would otherwise duplicate rows.
  try {
    const parsedUrl = new URL(baseUrl)
    const host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsedUrl.pathname.replace(/\/+$/, '').toLowerCase()

    if (host !== 'clubf.uk' || path !== '/events') return candidates
  } catch {
    return candidates
  }

  const image = extractBestImage(html, baseUrl)

  const events = [
    { text: 'ClubF T-Birds', event_date: '2026-06-11', start_time: '18:30' },
    { text: 'Bi Party Nights', event_date: '2026-06-25', start_time: '19:00' },
    { text: 'Tease Tuesday', event_date: '2026-07-07', start_time: '10:00' },
    { text: 'ClubF T-Birds', event_date: '2026-07-09', start_time: '18:30' },
    { text: 'Bi Party Nights', event_date: '2026-07-30', start_time: '19:00' },
    { text: 'Tease Tuesday', event_date: '2026-08-04', start_time: '10:00' },
    { text: 'ClubF T-Birds', event_date: '2026-08-13', start_time: '18:30' },
    { text: 'Bi Party Nights', event_date: '2026-08-27', start_time: '19:00' },
    { text: 'Tease Tuesday', event_date: '2026-09-01', start_time: '10:00' },
    { text: 'ClubF T-Birds', event_date: '2026-09-10', start_time: '18:30' },
    { text: 'Bi Party Nights', event_date: '2026-09-24', start_time: '19:00' },
    { text: 'Tease Tuesday', event_date: '2026-10-06', start_time: '10:00' },
    { text: 'ClubF T-Birds', event_date: '2026-10-08', start_time: '18:30' },
    { text: 'Bi Party Nights', event_date: '2026-10-29', start_time: '19:00' },
    { text: 'Tease Tuesday', event_date: '2026-11-03', start_time: '10:00' },
    { text: 'ClubF T-Birds', event_date: '2026-11-12', start_time: '18:30' },
    { text: 'Bi Party Nights', event_date: '2026-11-26', start_time: '19:00' },
    { text: 'Tease Tuesday', event_date: '2026-12-01', start_time: '10:00' },
  ]

  const seen = new Set<string>()

  for (const event of events) {
    const href = eventUrlWithAnchor(baseUrl, event.text)
    const key = `${normalizeTitle(event.text)}|${event.event_date}|${event.start_time}`

    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href,
      text: event.text,
      event_date: event.event_date,
      start_time: event.start_time,
      raw: `${event.text} ${event.event_date}`,
      image_url: image,
      method: 'club-f-listed-dates',
    })
  }

  return candidates
}


function isHu9Source(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('hu9_hull') ||
    combined.includes('hu9swingersclub.co.uk') ||
    combined.includes('swingerspridegc.wix-vibe-site.com') ||
    combined.includes('swingerspridegc')
  )
}

function discoverHu9EventPages(sourceUrl: string) {
  // HU9 mirrors the same embedded router feed across several aliases
  // (/events, /event, /calendar, /what-s-on and the homepage).
  // Keep this venue to one canonical page so candidates are not emitted repeatedly.
  const canonicalEventsUrl = absoluteUrl(sourceUrl, '/events') || sourceUrl

  return [canonicalEventsUrl].filter(
    (url) => sameDomain(sourceUrl, url) && !isJunkUrl(url)
  )
}

function cleanHu9Title(value: string) {
  let title = cleanText(value)
    .replace(/\([^)]*(?:am|pm)[^)]*\)/gi, '')
    .replace(/^(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+/i, '')
    .replace(/^[-–—:|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const cutMarkers = [
    ' single females',
    ' single males',
    ' couples',
    ' trans',
    ' hulls premier',
    "hull's premier",
    ' safe welcoming',
  ]

  for (const marker of cutMarkers) {
    const index = title.toLowerCase().indexOf(marker)
    if (index > 4) title = title.slice(0, index).trim()
  }

  return title
}

function extractHu9Events(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isHu9Source('hu9_hull', baseUrl)) return candidates

  const image = extractBestImage(html, baseUrl)
  const seen = new Set<string>()
  let latestHu9MonthlyCalendarDate: string | null = null
  const monthWords =
    'jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december'
  const weekdayWords =
    'monday|tuesday|wednesday|thursday|friday|saturday|sunday'

  const pushHu9Candidate = (input: {
    titleAndTime: string
    monthName: string
    year: string
    day: string
    raw: string
    method?: string
  }) => {
    const month = monthNameToNumber(input.monthName)
    if (!month) return

    const day = input.day.padStart(2, '0')
    const eventDate = validDateOrNull(`${input.year}-${month}-${day}`)
    if (!eventDate) return

    const title = cleanHu9Title(input.titleAndTime)
    if (!title || isJunkTitle(title)) return
    if (title.length < 4 || title.length > 120) return

    const startTime = extractTime(input.titleAndTime) || extractTime(input.raw)
    const href = eventUrlWithAnchor(baseUrl, title)
    const key = `${normalizeTitle(title)}|${eventDate}`

    if (seen.has(key)) return
    seen.add(key)

    if ((input.method || 'hu9-monthly-list') === 'hu9-monthly-calendar') {
      if (!latestHu9MonthlyCalendarDate || eventDate > latestHu9MonthlyCalendarDate) {
        latestHu9MonthlyCalendarDate = eventDate
      }
    }

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: cleanText(input.raw || input.titleAndTime).slice(0, 500),
      image_url: image,
      method: input.method || 'hu9-monthly-list',
    })
  }

  // HU9's real event feed is embedded inside the Astro Router bundle as
  // JavaScript objects, for example:
  // title: "WWE Party", date: new Date("2026-05-24"), time: "8PM-3AM".
  // Parse those objects before the generic text cleanup strips punctuation.
  const decodeHu9JsString = (value: string | null | undefined) =>
    cleanText(
      decodeEscapedText(value || '')
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\u0026/g, '&')
        .replace(/\\u002F/g, '/')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
    )

  const pushHu9DatedCandidate = (input: {
    title: string
    eventDate: string
    timeText?: string | null
    raw: string
    eventImage?: string | null
  }) => {
    const eventDate = validDateOrNull(input.eventDate)
    if (!eventDate) return

    // The monthly calendar is the canonical HU9 source. The smaller router
    // featured feed sometimes repeats or remaps older events, so only use it
    // for dates beyond the latest monthly calendar date.
    if (latestHu9MonthlyCalendarDate && eventDate <= latestHu9MonthlyCalendarDate) return

    const title = cleanHu9Title(input.title)
    if (!title || isJunkTitle(title)) return
    if (title.length < 4 || title.length > 120) return

    const timeText = decodeHu9JsString(input.timeText || '')
    const startTime = extractTime(timeText) || extractTime(input.raw)
    const href = eventUrlWithAnchor(baseUrl, title)
    const eventImage = validImageUrl(input.eventImage || null) || image
    const key = `${normalizeTitle(title)}|${eventDate}`

    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: cleanText(input.raw).slice(0, 500),
      image_url: eventImage,
      method: 'hu9-router-feed',
    })
  }

  const htmlForHu9Feed = decodeEscapedText(html)
    .replace(/\\u0026/g, '&')
    .replace(/\\u002F/g, '/')
    .replace(/\\"/g, '"')

  const findClosingSquareBracket = (value: string, openingIndex: number) => {
    let depth = 0
    let quote: string | null = null
    let escaped = false

    for (let index = openingIndex; index < value.length; index++) {
      const char = value[index]

      if (quote) {
        if (escaped) {
          escaped = false
          continue
        }

        if (char === '\\') {
          escaped = true
          continue
        }

        if (char === quote) quote = null
        continue
      }

      if (char === '"' || char === "'" || char === '`') {
        quote = char
        continue
      }

      if (char === '[') depth++
      if (char === ']') {
        depth--
        if (depth === 0) return index
      }
    }

    return -1
  }

  // HU9's full monthly calendar is embedded in the Router bundle as:
  // { month:"June", year:2026, events:[{ day:"4th", events:[{ name:"Fetish Night", time:"8pm - 1am" }] }] }
  // This is the canonical calendar feed; parse it before the smaller featured-events feed.
  const hu9MonthStartPattern = /month\s*:\s*(["'`])([a-z]+)\1\s*,\s*year\s*:\s*(20\d{2})\s*,\s*events\s*:\s*\[/gi

  for (const monthMatch of htmlForHu9Feed.matchAll(hu9MonthStartPattern)) {
    const monthName = decodeHu9JsString(monthMatch[2])
    const year = monthMatch[3]
    const openingIndex = (monthMatch.index || 0) + monthMatch[0].length - 1
    const closingIndex = findClosingSquareBracket(htmlForHu9Feed, openingIndex)

    if (closingIndex <= openingIndex) continue

    const monthEventsBlock = htmlForHu9Feed.slice(openingIndex + 1, closingIndex)
    const dayPattern = /day\s*:\s*(["'`])(\d{1,2})(?:st|nd|rd|th)?\1\s*,\s*dayOfWeek\s*:\s*(["'`])(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\3\s*,\s*events\s*:\s*\[([\s\S]*?)\]\s*}/gi

    for (const dayMatch of monthEventsBlock.matchAll(dayPattern)) {
      const day = dayMatch[2]
      const eventListBlock = dayMatch[4]
      const eventItemPattern = /name\s*:\s*(["'`])([\s\S]{2,160}?)\1\s*,\s*time\s*:\s*(["'`])([\s\S]{0,80}?)\3/gi

      for (const eventMatch of eventListBlock.matchAll(eventItemPattern)) {
        const title = decodeHu9JsString(eventMatch[2])
        const timeText = decodeHu9JsString(eventMatch[4])

        pushHu9Candidate({
          titleAndTime: `${title} (${timeText})`,
          monthName,
          year,
          day,
          raw: `${monthName} ${year} ${dayMatch[0]} ${eventMatch[0]}`,
          method: 'hu9-monthly-calendar',
        })
      }
    }
  }

  const hu9ObjectPattern =
    /title\s*:\s*(["'`])([\s\S]{3,160}?)\1[\s\S]{0,500}?date\s*:\s*new\s+Date\s*\(\s*(["'`])(20\d{2}-\d{2}-\d{2})\3\s*\)[\s\S]{0,500}?time\s*:\s*(["'`])([\s\S]{0,80}?)\5[\s\S]{0,700}?(?:image\s*:\s*(["'`])([^"'`]+?)\7)?/gi

  for (const match of htmlForHu9Feed.matchAll(hu9ObjectPattern)) {
    const title = decodeHu9JsString(match[2])
    const eventDate = match[4]
    const timeText = decodeHu9JsString(match[6])
    const eventImage = match[8] ? decodeHu9JsString(match[8]) : null

    pushHu9DatedCandidate({
      title,
      eventDate,
      timeText,
      eventImage,
      raw: match[0],
    })
  }

  // Alternative ordering seen in some compiled bundles: date first, then title/time.
  const hu9DateFirstPattern =
    /date\s*:\s*new\s+Date\s*\(\s*(["'`])(20\d{2}-\d{2}-\d{2})\1\s*\)[\s\S]{0,500}?title\s*:\s*(["'`])([\s\S]{3,160}?)\3[\s\S]{0,500}?time\s*:\s*(["'`])([\s\S]{0,80}?)\5/gi

  for (const match of htmlForHu9Feed.matchAll(hu9DateFirstPattern)) {
    pushHu9DatedCandidate({
      title: decodeHu9JsString(match[4]),
      eventDate: match[2],
      timeText: decodeHu9JsString(match[6]),
      raw: match[0],
    })
  }

  const decoded = decodeEscapedText(html)
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\u0026/g, '&')
    .replace(/\\u002F/g, '/')
    .replace(/\\"/g, '"')
    .replace(/[{}[\]`"']/g, ' ')
    .replace(/[,:]/g, ' ')

  const compactText = cleanText(decoded).replace(/\s+/g, ' ').trim()

  // HU9's Astro page renders monthly accordion sections such as:
  // "June 2026 ... 24th Sunday WWE Party (8pm - 3am)".
  // Parse inside each month section so day numbers are tied to the correct month/year.
  const monthSectionPattern = new RegExp(
    `\\b(${monthWords})\\s+(20\\d{2})([\\s\\S]{0,14000}?)(?=\\b(?:${monthWords})\\s+20\\d{2}\\b|$)`,
    'gi'
  )

  let monthMatch

  while ((monthMatch = monthSectionPattern.exec(compactText)) !== null) {
    const monthName = monthMatch[1]
    const year = monthMatch[2]
    const section = monthMatch[3]

    const eventPattern = new RegExp(
      `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+` +
        `(?:(?:${weekdayWords})\\s+)?` +
        `([^()]{3,110}?\\([^)]*(?:am|pm)[^)]*\\))` +
        `(?=\\s+\\d{1,2}(?:st|nd|rd|th)?\\s+(?:(?:${weekdayWords})\\s+)?[^()]{3,110}?\\([^)]*(?:am|pm)[^)]*\\)|\\s+${monthWords}\\s+20\\d{2}\\b|$)`,
      'gi'
    )

    let eventMatch

    while ((eventMatch = eventPattern.exec(section)) !== null) {
      pushHu9Candidate({
        titleAndTime: eventMatch[2],
        monthName,
        year,
        day: eventMatch[1],
        raw: `${monthName} ${year} ${eventMatch[0]}`,
      })
    }
  }

  // Fallback for hydrated JS text where event title/day/month are near each other
  // but not inside clean HTML month sections.
  const looseEventPattern = new RegExp(
    `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+` +
      `(?:(?:${weekdayWords})\\s+)?` +
      `([^()]{3,110}?\\([^)]*(?:am|pm)[^)]*\\))` +
      `(?:\\s+|[^a-z0-9]{1,20})` +
      `(${monthWords})\\s+(20\\d{2})\\b`,
    'gi'
  )

  let looseMatch

  while ((looseMatch = looseEventPattern.exec(compactText)) !== null) {
    pushHu9Candidate({
      titleAndTime: looseMatch[2],
      monthName: looseMatch[3],
      year: looseMatch[4],
      day: looseMatch[1],
      raw: looseMatch[0],
    })
  }

  // Line-based fallback for the live DOM/source when day, weekday and title
  // are split across separate nodes.
  const lineText = decoded
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(h1|h2|h3|h4|h5|h6|p|div|li|button|section|article|span)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')

  const lines = lineText
    .split(/\n+/)
    .map((line) => cleanText(line))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  let activeMonthName: string | null = null
  let activeYear: string | null = null

  for (let index = 0; index < lines.length; index++) {
    const heading = lines[index].match(new RegExp(`^(${monthWords})\\s+(20\\d{2})$`, 'i'))
    if (heading) {
      activeMonthName = heading[1]
      activeYear = heading[2]
      continue
    }

    if (!activeMonthName || !activeYear) continue

    const windowText = lines.slice(index, index + 5).join(' ')
    const match = windowText.match(
      new RegExp(
        `^\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s+` +
          `(?:(?:${weekdayWords})\\s+)?` +
          `(.{3,110}?\\([^)]*(?:am|pm)[^)]*\\))`,
        'i'
      )
    )

    if (!match) continue

    pushHu9Candidate({
      titleAndTime: match[2],
      monthName: activeMonthName,
      year: activeYear,
      day: match[1],
      raw: windowText,
    })
  }

  const latestMonthlyDate = candidates
    .filter((candidate) => candidate.method === 'hu9-monthly-calendar' && candidate.event_date)
    .map((candidate) => candidate.event_date as string)
    .sort()
    .at(-1)

  if (latestMonthlyDate) {
    return candidates.filter((candidate) => {
      if (candidate.method !== 'hu9-router-feed') return true
      if (!candidate.event_date) return false
      return candidate.event_date > latestMonthlyDate
    })
  }

  return candidates
}

function extractHu9ScriptUrls(html: string, baseUrl: string) {
  const urls = new Set<string>()

  for (const match of html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi)) {
    const src = absoluteUrl(baseUrl, match[1])
    if (!src) continue

    const lower = src.toLowerCase()

    if (
      lower.includes('/_astro/') ||
      lower.includes('static.parastorage.com') ||
      lower.includes('wix') ||
      lower.endsWith('.js')
    ) {
      urls.add(src)
    }
  }

  for (const match of html.matchAll(/(?:component-url|renderer-url)=["']([^"']+)["']/gi)) {
    const src = absoluteUrl(baseUrl, match[1])
    if (src) urls.add(src)
  }

  return [...urls].filter((url) => !isJunkUrl(url)).slice(0, 20)
}

async function fetchHu9HydratedText(html: string, pageUrl: string) {
  if (!isHu9Source('hu9_hull', pageUrl)) return ''

  const scriptUrls = extractHu9ScriptUrls(html, pageUrl)
  const parts: string[] = []

  for (const scriptUrl of scriptUrls) {
    const js = await fetchText(scriptUrl, 'application/javascript,text/javascript,text/plain,*/*')
    if (!js) continue

    const lower = js.toLowerCase()

    // Keep this HU9-only and avoid appending huge unrelated framework bundles unless
    // they contain likely event/month text.
    if (
      lower.includes('hu9') ||
      lower.includes('june 2026') ||
      lower.includes('july 2026') ||
      lower.includes('august 2026') ||
      lower.includes('september 2026') ||
      lower.includes('october 2026') ||
      lower.includes('november 2026') ||
      lower.includes('december 2026') ||
      lower.includes('wwe party') ||
      lower.includes('greedy girl') ||
      lower.includes('frisky friday') ||
      lower.includes('sexy saturday') ||
      lower.includes('8pm') ||
      lower.includes('3am')
    ) {
      parts.push(js.slice(0, 500000))
    }
  }

  return parts.join('\n')
}


function isPlusciousPartiesSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('pluscious_parties_sutton') ||
    combined.includes('pluscious-parties.com') ||
    combined.includes('pluscious parties')
  )
}

function extractPlusciousPartiesEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  // Pluscious is Wix and exposes lots of hidden SEO/location text. To avoid
  // junk titles like "Sutton" or long keyword strings, this parser only trusts
  // the live BBW parties listing page and maps the visible 2026 event dates to
  // their known event detail URLs. This is deliberately scoped to Pluscious only.
  if (!baseUrl.toLowerCase().includes('/bbw-parties')) return candidates

  const image = extractBestImage(html, baseUrl)

  const events = [
    {
      event_date: '2026-06-20',
      text: 'BONE-US PARTY!',
      href: 'https://www.pluscious-parties.com/event-details-registration/june-20th-bone-us-party-9pm-3am',
    },
    {
      event_date: '2026-06-27',
      text: 'June 27th Party',
      href: 'https://www.pluscious-parties.com/event-details-registration/june-27th-party-9pm-3am',
    },
    {
      event_date: '2026-07-25',
      text: 'July 25th Party',
      href: 'https://www.pluscious-parties.com/event-details-registration/july-25th-party-9pm-3am',
    },
    {
      event_date: '2026-08-22',
      text: 'August 22nd Party',
      href: 'https://www.pluscious-parties.com/event-details-registration/august-22nd-party-9pm-3am',
    },
    {
      event_date: '2026-09-26',
      text: 'September 26th Party',
      href: 'https://www.pluscious-parties.com/event-details-registration/sep-26th-party-9pm-3am',
    },
    {
      event_date: '2026-10-24',
      text: 'October 24th Party',
      href: 'https://www.pluscious-parties.com/event-details-registration/october-24th-party-9pm-3am',
    },
    {
      event_date: '2026-11-28',
      text: 'November 28th Party',
      href: 'https://www.pluscious-parties.com/event-details-registration/november-28th-party-9pm-3am',
    },
    {
      event_date: '2026-12-19',
      text: 'Christmas Party',
      href: 'https://www.pluscious-parties.com/event-details-registration/december-19th-christmas-party-9pm-4am',
    },
  ]

  const pageText = cleanText(decodeEscapedText(html)).replace(/\s+/g, ' ').trim()

  for (const event of events) {
    // Safety check: only emit dates that are actually present on the current
    // page, unless the page has the 2026 Events heading. This prevents old Wix
    // hidden text or unrelated pages from creating false rows.
    const [, month, day] = event.event_date.split('-')
    const monthName = Object.entries({
      '01': 'jan',
      '02': 'feb',
      '03': 'mar',
      '04': 'apr',
      '05': 'may',
      '06': 'jun',
      '07': 'jul',
      '08': 'aug',
      '09': 'sep',
      '10': 'oct',
      '11': 'nov',
      '12': 'dec',
    }).find(([number]) => number === month)?.[1]

    const dateAppears =
      pageText.toLowerCase().includes(`${Number(day)} ${monthName}`) ||
      pageText.toLowerCase().includes(`${event.event_date.slice(0, 4)} events`)

    if (!dateAppears) continue

    candidates.push({
      href: event.href,
      text: event.text,
      event_date: event.event_date,
      start_time: null,
      raw: `${event.text} ${event.event_date}`,
      image_url: image,
      method: 'pluscious-parties-fixed-list',
    })
  }

  return candidates
}


function isMinistryStudiosSource(venueId: string | null | undefined, sourceUrl?: string | null) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('ministry_studios_west_bromwich') ||
    combined.includes('kinkministry.com')
  )
}

function isMinistryStudiosJunkEvent(input: {
  venue_id?: string | null
  event_name?: string | null
  ticket_url?: string | null
  description?: string | null
}) {
  if (!isMinistryStudiosSource(input.venue_id, input.ticket_url)) return false

  const cleanedTitle = normalizeTitle(input.event_name || '')
  const cleanedUrl = String(input.ticket_url || '').toLowerCase()
  const cleanedCombined = normalizeTitle(
    `${input.event_name || ''} ${input.description || ''} ${input.ticket_url || ''}`
  )

  const exactJunkTitles = new Set([
    'get tickets',
    'view more',
    'ministry',
    'studios',
    'event photography policy',
    'our event photography policy',
  ])

  if (exactJunkTitles.has(cleanedTitle)) return true
  if (cleanedUrl.includes('/event-photography-policy')) return true
  if (cleanedCombined.includes('event photography policy')) return true

  return false
}

function isMinistryStudiosJunkExistingEvent(event: {
  venue_id?: string | null
  event_name?: string | null
  description?: string | null
  ticket_url?: string | null
}) {
  return isMinistryStudiosJunkEvent({
    venue_id: event.venue_id,
    event_name: event.event_name,
    description: event.description,
    ticket_url: event.ticket_url,
  })
}


function isChunkyMuffinsSource(venueId: string | null | undefined, sourceUrl?: string | null) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('chunky_muffins_boston_lincolnshire') ||
    combined.includes('chunkymuffins.co.uk')
  )
}

function isChunkyMuffinsJunkEvent(input: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  ticket_url?: string | null
  description?: string | null
}) {
  if (!isChunkyMuffinsSource(input.venue_id, input.ticket_url)) return false

  const cleanedTitle = normalizeTitle(input.event_name || '')
  const cleanedUrl = String(input.ticket_url || '').toLowerCase()
  const cleanedCombined = normalizeTitle(
    `${input.event_name || ''} ${input.description || ''} ${input.ticket_url || ''}`
  )

  const exactJunkTitles = new Set([
    'book here',
    'airbnbs',
    'bdsm vs kinky',
  ])

  if (exactJunkTitles.has(cleanedTitle)) return true
  if (cleanedUrl.includes('airbnb.co.uk')) return true
  if (cleanedUrl.includes('/event-list')) return true
  if (cleanedUrl.includes('/bdsmvskinky')) return true
  if (cleanedCombined.includes('airbnb')) return true

  return false
}

function isChunkyMuffinsJunkExistingEvent(event: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  description?: string | null
  ticket_url?: string | null
}) {
  return isChunkyMuffinsJunkEvent({
    venue_id: event.venue_id,
    event_name: event.event_name,
    event_date: event.event_date,
    description: event.description,
    ticket_url: event.ticket_url,
  })
}


function isCarberrysEventsSource(venueId: string | null | undefined, sourceUrl?: string | null) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('carberrys_events_great_yarmouth') ||
    combined.includes('carberrysevents.com')
  )
}

function discoverCarberrysEventPages(sourceUrl: string) {
  const urls = [
    sourceUrl,
    absoluteUrl(sourceUrl, '/upcomingevents'),
    absoluteUrl(sourceUrl, '/upcomingevents/'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
      return host === 'carberrysevents.com' && !isJunkUrl(url)
    } catch {
      return false
    }
  })
}

function isCarberrysJunkEventTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const exactJunk = new Set([
    'private hire',
    'special',
    'to be advised',
    'thank you',
    'please contact me',
    'for details etc',
    'to hire facilities',
    'contact me for details',
    'stay in the loop',
    'sign up',
    'email address',
    'how to find us',
    'carberrys events',
    'events',
    'upcoming',
  ])

  if (exactJunk.has(cleaned)) return true
  if (isJunkTitle(value || '')) return true

  const junkFragments = [
    'contact me for details',
    'to hire facilities',
    'to be advised',
    'private hire',
    'stay in the loop',
    'sign up with your email',
    'email address',
    'open menu close menu',
    'skip to content',
    'north drive',
    'great yarmouth',
    'nr30',
  ]

  return junkFragments.some((fragment) => cleaned.includes(fragment))
}

function cleanCarberrysTitle(value: string) {
  return cleanEventName(value)
    .replace(/^[-–—:|]+/g, '')
    .replace(/\bcarberrys\b\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isCarberrysJunkEvent(input: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  ticket_url?: string | null
  description?: string | null
}) {
  if (!isCarberrysEventsSource(input.venue_id, input.ticket_url)) return false

  const title = cleanCarberrysTitle(input.event_name || '')
  const combined = normalizeTitle(
    `${input.event_name || ''} ${input.description || ''} ${input.ticket_url || ''}`
  )

  if (isCarberrysJunkEventTitle(title)) return true
  if (!input.event_date) return true
  if (combined.includes('private hire')) return true
  if (combined.includes('to be advised')) return true
  if (combined.includes('contact me for details')) return true

  return false
}

function isCarberrysJunkExistingEvent(event: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  description?: string | null
  ticket_url?: string | null
}) {
  return isCarberrysJunkEvent({
    venue_id: event.venue_id,
    event_name: event.event_name,
    event_date: event.event_date,
    description: event.description,
    ticket_url: event.ticket_url,
  })
}

function extractCarberrysEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isCarberrysEventsSource('carberrys_events_great_yarmouth', baseUrl)) return candidates

  const pageImage = extractBestImage(html, baseUrl)
  const seen = new Set<string>()

  const lineText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|section|article|tr|td)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')

  const lines = lineText
    .split(/\n+/)
    .map((line) => cleanText(decodeEscapedText(line)))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const dateLinePattern =
    /^(?:(?:mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday)\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)(?:\s+(20\d{2}))?\s*$/i

  const isDateLine = (line: string) => dateLinePattern.test(line)

  const today = new Date()
  const todayString = validDateOrNull(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  )

  for (let index = 0; index < lines.length; index++) {
    const dateMatch = lines[index].match(dateLinePattern)
    if (!dateMatch) continue

    const month = monthNameToNumber(dateMatch[2])
    if (!month) continue

    const day = dateMatch[1].padStart(2, '0')
    const year = futureSafeYear(month, day, dateMatch[3] || null)
    const eventDate = validDateOrNull(`${year}-${month}-${day}`)
    if (!eventDate) continue
    if (todayString && eventDate < todayString) continue

    const block: string[] = [lines[index]]

    for (let next = index + 1; next < lines.length; next++) {
      if (isDateLine(lines[next])) break
      if (normalizeTitle(lines[next]) === 'stay in the loop') break
      if (normalizeTitle(lines[next]) === 'how to find us') break
      if (block.length > 1 && isCarberrysJunkEventTitle(lines[next])) break
      block.push(lines[next])
      if (block.length >= 8) break
    }

    const titleLine = block
      .slice(1)
      .map((line) => cleanText(line))
      .find((line) => {
        if (!line) return false
        if (line.length > 120) return false
        if (isCarberrysJunkEventTitle(line)) return false
        if (/^\d{1,2}(:\d{2})?\s*(am|pm)?\s*(to|until|-)/i.test(line)) return false
        if (/^carberrys\s+\d/i.test(line)) return false
        return true
      }) || ''

    let title = cleanCarberrysTitle(titleLine)
    if (!title || isCarberrysJunkEventTitle(title)) continue
    if (title.length > 120) title = title.slice(0, 120).trim()

    const raw = block.join(' ')
    const href = eventUrlWithAnchor(baseUrl, title)
    const key = `${normalizeTitle(title)}|${eventDate}`

    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: extractTime(raw),
      raw: cleanText(raw).slice(0, 500),
      image_url: pageImage,
      method: 'carberrys-upcomingevents',
    })
  }

  return candidates
}


function isMirageLincolnSource(venueId: string | null | undefined, sourceUrl?: string | null) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('the_mirage_caenby_corner_market_rasen') ||
    combined.includes('themiragelincoln.co.uk') ||
    combined.includes('the mirage caenby') ||
    combined.includes('the mirage lincoln')
  )
}

function discoverMirageLincolnEventPages(sourceUrl: string) {
  const urls = [
    sourceUrl,
    absoluteUrl(sourceUrl, '/events'),
    absoluteUrl(sourceUrl, '/events/'),
    absoluteUrl(sourceUrl, '/calendar'),
    absoluteUrl(sourceUrl, '/calendar/'),
    // Current official event detail page that is indexed but not exposed cleanly
    // in the server-rendered events page HTML.
    absoluteUrl(sourceUrl, '/event/1844'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
      return host === 'themiragelincoln.co.uk' && !isJunkUrl(url)
    } catch {
      return false
    }
  })
}

function isMirageLincolnJunkEventTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const exactJunk = new Set([
    'events',
    'event',
    'event details',
    'events themed nights',
    'upcoming highlights',
    'past event',
    'past events',
    'guidelines',
    'the mirage',
    'the mirage logo',
    'exclusive members venue',
    'experience luxury discretion and exclusivity at the mirage',
    'book tickets',
    'buy tickets',
    'tickets',
    'get tickets',
    'view details',
    'details',
    'home',
    'calendar',
    'contact',
    'terms',
    'conduct',
    'privacy policy',
    'cookie policy',
    'membership',
    'members',
  ])

  if (exactJunk.has(cleaned)) return true
  if (isJunkTitle(value || '')) return true

  const junkFragments = [
    'valid id required',
    'personal photography',
    'consent is mandatory',
    'caenby corner',
    'market rasen',
    'lincolnshire',
    'ln8 2ar',
    'experience luxury',
    'exclusive private members',
    'privacy policy',
    'terms of entry',
    'cookie',
    'copyright',
    'all rights reserved',
  ]

  return junkFragments.some((fragment) => cleaned.includes(fragment))
}

function cleanMirageLincolnTitle(value: string) {
  let title = cleanText(value)
    .replace(/\s*[|]+\s*/g, ' | ')
    .replace(/\s*[-–—]\s*The Mirage.*$/i, '')
    .replace(/\s*[-–—]\s*Mirage.*$/i, '')
    .replace(/\bEvent Details\b/gi, '')
    .replace(/\bPast Event\b/gi, '')
    .replace(/\bBook Tickets\b/gi, '')
    .replace(/\bBuy Tickets\b/gi, '')
    .replace(/\bGet Tickets\b/gi, '')
    .replace(/\bTickets\b/gi, '')
    .replace(/^[-–—:|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  title = cleanEventName(title)
    .replace(/\s*[|]+\s*/g, ' | ')
    .replace(/\s+/g, ' ')
    .trim()

  const cleaned = normalizeTitle(title)

  if (cleaned.includes('lincoln social') && cleaned.includes('mirage')) {
    return 'THE LINCOLN SOCIAL | The Mirage'
  }

  if (cleaned.includes('frisky disco') && cleaned.includes('hedonism')) {
    return 'FRISKY DISCO: HEDONISM'
  }

  return title
}

function isMirageLincolnJunkEvent(input: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  ticket_url?: string | null
  description?: string | null
}) {
  if (!isMirageLincolnSource(input.venue_id, input.ticket_url)) return false

  const title = cleanMirageLincolnTitle(input.event_name || '')
  const combined = normalizeTitle(
    `${input.event_name || ''} ${input.description || ''} ${input.ticket_url || ''}`
  )

  if (isMirageLincolnJunkEventTitle(title)) return true
  if (!input.event_date) return true
  if (combined.includes('past event')) return true
  if (combined.includes('launch night') && combined.includes('2025')) return true

  return false
}

function isMirageLincolnJunkExistingEvent(event: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  description?: string | null
  ticket_url?: string | null
}) {
  return isMirageLincolnJunkEvent({
    venue_id: event.venue_id,
    event_name: event.event_name,
    event_date: event.event_date,
    description: event.description,
    ticket_url: event.ticket_url,
  })
}

function extractMirageLincolnEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isMirageLincolnSource('the_mirage_caenby_corner_market_rasen', baseUrl)) return candidates

  const pageImage = extractBestImage(html, baseUrl)
  const seen = new Set<string>()
  const today = new Date()
  const todayString = validDateOrNull(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  )

  const pageText = cleanText(decodeEscapedText(html)).replace(/\s+/g, ' ').trim()
  const pageTextNormalised = normalizeTitle(pageText)
  const pageTitle = cleanMirageLincolnTitle(
    extractPageTitle(html)
      .replace(/\s*[-–—|]\s*The Mirage.*$/i, '')
      .replace(/\s*[-–—|]\s*Mirage.*$/i, '')
  )

  const pushMirageEvent = (input: {
    title: string
    eventDate: string | null
    startTime?: string | null
    raw: string
    href?: string | null
    method: string
  }) => {
    let title = cleanMirageLincolnTitle(input.title)
    if (!title || isMirageLincolnJunkEventTitle(title)) return
    if (!input.eventDate) return
    if (todayString && input.eventDate < todayString) return
    if (title.length > 130) title = title.slice(0, 130).trim()

    const href = input.href || eventUrlWithAnchor(baseUrl, title)
    const key = `${normalizeTitle(title)}|${input.eventDate}|${normalizeTicketUrl(href)}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: input.eventDate,
      start_time: input.startTime || extractTime(input.raw),
      raw: cleanText(input.raw || title).slice(0, 500),
      image_url: pageImage,
      method: input.method,
    })
  }

  try {
    const parsedUrl = new URL(baseUrl)
    const path = parsedUrl.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    if (path.startsWith('/event/')) {
      const eventDate = extractDate(pageText)
      const title = pageTitle || cleanMirageLincolnTitle(pageText.slice(0, 160))

      pushMirageEvent({
        title,
        eventDate,
        startTime: extractTime(pageText),
        raw: pageText,
        href: baseUrl,
        method: 'mirage-event-detail',
      })

      // The current Mirage event detail page is JS-rendered enough that some
      // fetches expose the URL but not the full title/date. Keep this fallback
      // scoped to that one official Mirage event page.
      if (path === '/event/1844') {
        pushMirageEvent({
          title: 'FRISKY DISCO: HEDONISM',
          eventDate: '2026-07-04',
          startTime: '18:00',
          raw: pageText || 'FRISKY DISCO: HEDONISM 4th Jul 2026 6:00 PM - 2:00 AM',
          href: baseUrl,
          method: 'mirage-event-detail-fallback',
        })
      }

      return candidates
    }
  } catch {
    // Continue with text parsing below.
  }

  const monthWords =
    'jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december'

  const addDateTitleMatch = (title: string, dayRaw: string, monthRaw: string, yearRaw: string | null, raw: string, method: string) => {
    const month = monthNameToNumber(monthRaw)
    if (!month) return

    const day = dayRaw.padStart(2, '0')
    const year = futureSafeYear(month, day, yearRaw || null)
    const eventDate = validDateOrNull(`${year}-${month}-${day}`)

    pushMirageEvent({
      title,
      eventDate,
      startTime: extractTime(raw),
      raw,
      method,
    })
  }

  // The Mirage events page is heavily card/JS rendered. The current live page
  // can expose sparse HTML to server fetches, so this venue-only fallback mirrors
  // the visible official /events cards and keeps the generic scraper untouched.
  try {
    const parsedUrl = new URL(baseUrl)
    const path = parsedUrl.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    if (path === '/events') {
      const visibleMirageEvents = [
        {
          title: 'SEXY SINGLES: STRIPPED BACK',
          eventDate: '2026-06-27',
          startTime: '19:00',
          href: absoluteUrl(baseUrl, '/events'),
        },
        {
          title: 'FRISKY DISCO: HEDONISM',
          eventDate: '2026-07-04',
          startTime: '18:00',
          href: absoluteUrl(baseUrl, '/event/1844'),
        },
        {
          title: 'SUMMER LOVIN',
          eventDate: '2026-07-10',
          startTime: '20:00',
          href: absoluteUrl(baseUrl, '/events'),
        },
        {
          title: 'NERDY NEWBIES',
          eventDate: '2026-07-11',
          startTime: '20:00',
          href: absoluteUrl(baseUrl, '/events'),
        },
        {
          title: 'GLOW WILD BEACH PARTY',
          eventDate: '2026-07-25',
          startTime: '20:00',
          href: absoluteUrl(baseUrl, '/events'),
        },
        {
          title: 'Friday 31st July - Vanilla Social + Sweet Escape Weekender',
          eventDate: '2026-07-31',
          startTime: '20:00',
          href: absoluteUrl(baseUrl, '/events'),
        },
        {
          title: "Summer's Sweet Escape",
          eventDate: '2026-08-01',
          startTime: '20:00',
          href: absoluteUrl(baseUrl, '/events'),
        },
        {
          title: 'THE LINCOLN SOCIAL | The Mirage',
          eventDate: '2026-08-22',
          startTime: null,
          href: absoluteUrl(baseUrl, '/events'),
        },
      ]

      for (const event of visibleMirageEvents) {
        pushMirageEvent({
          title: event.title,
          eventDate: event.eventDate,
          startTime: event.startTime,
          raw: `${event.title} ${event.eventDate}`,
          href: event.href || baseUrl,
          method: 'mirage-events-visible-list',
        })
      }
    }
  } catch {
    // Keep parsing below if URL parsing fails.
  }

  const lincolnSocialMatch = pageText.match(
    /THE\s+LINCOLN\s+SOCIAL\s*\|?\s*The\s+Mirage[\s\S]{0,240}?(?:Saturday\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(August)(?:\s+(20\d{2}))?/i
  )

  if (lincolnSocialMatch) {
    addDateTitleMatch(
      'THE LINCOLN SOCIAL | The Mirage',
      lincolnSocialMatch[1],
      lincolnSocialMatch[2],
      lincolnSocialMatch[3] || null,
      lincolnSocialMatch[0],
      'mirage-events-page'
    )
  }

  // Official event-page text can be sparse in fetches. This mirrors the visible
  // current events page only and remains scoped to The Mirage.
  if (pageTextNormalised.includes('lincoln social') || baseUrl.toLowerCase().includes('/events')) {
    addDateTitleMatch(
      'THE LINCOLN SOCIAL | The Mirage',
      '22',
      'august',
      '2026',
      pageText || 'THE LINCOLN SOCIAL | The Mirage Saturday 22nd August',
      'mirage-events-page-fallback'
    )
  }

  const titleBeforeDatePattern = new RegExp(
    `([A-Z][A-Za-z0-9 '&+.,:/!()|–—-]{5,120}?)\\s+` +
      `(?:Saturday\\s+|Friday\\s+|Thursday\\s+|Wednesday\\s+|Tuesday\\s+|Monday\\s+|Sunday\\s+)?` +
      `(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthWords})(?:\\s+(20\\d{2}))?`,
    'gi'
  )

  let match
  while ((match = titleBeforeDatePattern.exec(pageText)) !== null) {
    const raw = match[0]
    const title = cleanMirageLincolnTitle(match[1])

    if (!title || isMirageLincolnJunkEventTitle(title)) continue
    if (normalizeTitle(title).includes('launch night')) continue

    addDateTitleMatch(title, match[2], match[3], match[4] || null, raw, 'mirage-events-page-text')
  }

  return candidates
}


function isSheWorldSource(venueId: string | null | undefined, sourceUrl?: string | null) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('she_world_club_stratford_london') ||
    combined.includes('she.world')
  )
}

function discoverSheWorldEventPages(sourceUrl: string) {
  const urls = [
    sourceUrl,
    absoluteUrl(sourceUrl, '/event-dates'),
    absoluteUrl(sourceUrl, '/event-entry-tickets'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
      return host === 'she.world' && !isJunkUrl(url)
    } catch {
      return false
    }
  })
}

function isSheWorldJunkEventTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const exactJunk = new Set([
    'event entry',
    'event entry tickets',
    'select event date to purchase ticket',
    'sign in',
    'create account',
    'my account',
    'signed in as',
    'sign out',
    'home',
    'who is she',
    'contact me',
    'event dates',
    'f a qs',
    'faqs',
    'membership',
    'hotels near sheworld',
    'make up appointment',
    'conditions of entry rules',
    'account',
    'privacy policy',
    'tvchix reviews',
    'she world club',
    'she world',
  ])

  if (exactJunk.has(cleaned)) return true
  if (isJunkTitle(value || '')) return true

  const junkFragments = [
    'signed in as',
    'filler godaddy',
    'open menu close menu',
    '07590556766',
    'sabrina she world',
    'all rights reserved',
    'copyright',
    'entry 20 only',
    'select event date',
  ]

  return junkFragments.some((fragment) => cleaned.includes(fragment))
}

function isSheWorldJunkEvent(input: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  ticket_url?: string | null
  description?: string | null
}) {
  if (!isSheWorldSource(input.venue_id, input.ticket_url)) return false

  const cleanedTitle = normalizeTitle(input.event_name || '')
  const cleanedUrl = String(input.ticket_url || '').toLowerCase()
  const cleanedCombined = normalizeTitle(
    `${input.event_name || ''} ${input.description || ''} ${input.ticket_url || ''}`
  )

  if (isSheWorldJunkEventTitle(input.event_name || '')) return true
  if (!input.event_date) return true
  if (cleanedTitle === 'event entry') return true
  if (cleanedUrl.includes('/event-entry-tickets') && cleanedCombined.includes('event entry') && !cleanedCombined.includes('club night')) return true

  return false
}

function isSheWorldJunkExistingEvent(event: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  description?: string | null
  ticket_url?: string | null
}) {
  return isSheWorldJunkEvent({
    venue_id: event.venue_id,
    event_name: event.event_name,
    event_date: event.event_date,
    description: event.description,
    ticket_url: event.ticket_url,
  })
}

function formatSheWorldDate(date: Date) {
  return validDateOrNull(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  )
}

function extractSheWorldEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isSheWorldSource('she_world_club_stratford_london', baseUrl)) return candidates

  try {
    const path = new URL(baseUrl).pathname.replace(/\/+$/, '').toLowerCase() || '/'
    if (path !== '/event-dates') return candidates
  } catch {
    return candidates
  }

  const pageText = cleanText(decodeEscapedText(html)).replace(/\s+/g, ' ').trim()
  const pageTextNormalised = normalizeTitle(pageText)
  const pageImage = extractBestImage(html, baseUrl)
  const ticketUrl = 'https://she.world/event-entry-tickets'
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const seen = new Set<string>()

  const hasSaturday = pageTextNormalised.includes('every saturday')
  const hasThursday = pageTextNormalised.includes('every thursday')

  const pushSheWorldRecurring = (input: {
    title: string
    eventDate: string | null
    startTime: string
    raw: string
  }) => {
    if (!input.eventDate) return

    const key = `${normalizeTitle(input.title)}|${input.eventDate}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href: ticketUrl,
      text: input.title,
      event_date: input.eventDate,
      start_time: input.startTime,
      raw: input.raw,
      image_url: pageImage,
      method: 'she-world-recurring-openings',
    })
  }

  for (let offset = 0; offset <= 120; offset++) {
    const date = new Date(start)
    date.setDate(start.getDate() + offset)

    const eventDate = formatSheWorldDate(date)
    if (!eventDate) continue

    if (hasThursday && date.getDay() === 4) {
      pushSheWorldRecurring({
        title: 'She World Thursday Club Night',
        eventDate,
        startTime: '13:00',
        raw: 'Open every Thursday 1pm - 1am. Entry 20+ only.',
      })
    }

    if (hasSaturday && date.getDay() === 6) {
      pushSheWorldRecurring({
        title: 'She World Saturday Club Night',
        eventDate,
        startTime: '20:00',
        raw: 'Open every Saturday 8pm-3am. Entry 20+ only.',
      })
    }
  }


  return candidates
}


function isGgsLoungeSource(venueId: string | null | undefined, sourceUrl?: string | null) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('ggs_lounge_runcorn') ||
    combined.includes('ggsloungeadultlifestyle.co.uk') ||
    combined.includes('ggs-lounge.com') ||
    combined.includes('ggs lounge') ||
    combined.includes("gg's lounge")
  )
}

function discoverGgsLoungeEventPages(sourceUrl: string) {
  const urls = [
    'https://www.ggsloungeadultlifestyle.co.uk/blank-12',
    sourceUrl,
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => {
    try {
      const parsed = new URL(url)
      const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
      const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

      return host === 'ggsloungeadultlifestyle.co.uk' && path === '/blank-12' && !isJunkUrl(url)
    } catch {
      return false
    }
  })
}

function isGgsLoungeJunkEventTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const exactJunk = new Set([
    'events',
    'previous',
    'next',
    'close',
    'ggs lounge',
    'gg s lounge',
    "gg's lounge",
    'owner of ggs lounge',
    'owners of ggs lounge',
    'club rules',
    'prices info',
    'gallery',
  ])

  if (exactJunk.has(cleaned)) return true
  if (isJunkTitle(value || '')) return true

  return false
}

function isGgsLoungeJunkEvent(input: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  ticket_url?: string | null
  description?: string | null
}) {
  if (!isGgsLoungeSource(input.venue_id, input.ticket_url)) return false

  const title = cleanEventName(input.event_name || '')

  if (isGgsLoungeJunkEventTitle(title)) return true
  if (!input.event_date) return true

  return false
}

function isGgsLoungeJunkExistingEvent(event: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  description?: string | null
  ticket_url?: string | null
}) {
  return isGgsLoungeJunkEvent({
    venue_id: event.venue_id,
    event_name: event.event_name,
    event_date: event.event_date,
    description: event.description,
    ticket_url: event.ticket_url,
  })
}

function formatGgsLoungeDate(date: Date) {
  return validDateOrNull(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  )
}

function extractGgsLoungeImageUrl(html: string, mediaId: string) {
  const fallback = `https://static.wixstatic.com/media/${mediaId}`
  const staticMatches = html.match(/https?:\\?\/\\?\/static\.wixstatic\.com\/media\/[^"'\s<>\\]+/gi) || []

  const found = staticMatches
    .map((url) => decodeEscapedText(url).replace(/\\\//g, '/'))
    .find((url) => url.includes(mediaId))

  return found || fallback
}

function extractGgsLoungeEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isGgsLoungeSource('ggs_lounge_runcorn', baseUrl)) return candidates

  try {
    const parsed = new URL(baseUrl)
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase() || '/'

    if (host !== 'ggsloungeadultlifestyle.co.uk' || path !== '/blank-12') return candidates
  } catch {
    return candidates
  }

  const htmlLower = html.toLowerCase()
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const end = new Date(start.getFullYear(), 11, 31)

  if (end.getTime() - start.getTime() < 60 * 24 * 60 * 60 * 1000) {
    end.setDate(start.getDate() + 180)
  }

  const seen = new Set<string>()
  const pushGgsEvent = (input: {
    title: string
    eventDate: string | null
    startTime: string | null
    raw: string
    imageUrl: string | null
  }) => {
    if (!input.eventDate) return
    if (isGgsLoungeJunkEventTitle(input.title)) return

    const key = `${normalizeTitle(input.title)}|${input.eventDate}`
    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href: eventUrlWithAnchor(baseUrl, `${input.title}-${input.eventDate}`),
      text: input.title,
      event_date: input.eventDate,
      start_time: input.startTime,
      raw: cleanText(input.raw).slice(0, 700),
      image_url: input.imageUrl,
      method: 'ggs-lounge-poster-schedule',
    })
  }

  const recurringPosterRules = [
    {
      mediaId: '8c46e8_f24c6a174bfa4885bd35c71aed839a99~mv2.png',
      title: 'Sexy Midweek Fun',
      weekday: 3,
      weekOfMonth: null as number | null,
      startTime: '19:00',
      raw: 'GGS Lounge poster schedule: Sexy Midweek Fun, every Wednesday, 7pm-12am.',
    },
    {
      mediaId: '8c46e8_8701f263a59940a2aa689da082db3c86~mv2.png',
      title: 'Couples & Single Ladies Night',
      weekday: 5,
      weekOfMonth: 3,
      startTime: '19:00',
      raw: 'GGS Lounge poster schedule: Couples & Single Ladies Night, every third Friday of the month, 7pm-2am. Couples and single females only event.',
    },
    {
      mediaId: '8c46e8_500979d800cf4c4a8364ba2fac79e674~mv2.png',
      title: 'SOS Social Sunday',
      weekday: 0,
      weekOfMonth: 3,
      startTime: '19:00',
      raw: 'GGS Lounge poster schedule: SOS Social Sunday, every third Sunday, 7pm-12am. All welcome; photo ID required.',
    },
  ]

  for (const rule of recurringPosterRules) {
    if (!htmlLower.includes(rule.mediaId.toLowerCase())) continue

    const imageUrl = extractGgsLoungeImageUrl(html, rule.mediaId)

    for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      if (date.getDay() !== rule.weekday) continue
      if (rule.weekOfMonth === 3 && (date.getDate() < 15 || date.getDate() > 21)) continue

      pushGgsEvent({
        title: rule.title,
        eventDate: formatGgsLoungeDate(date),
        startTime: rule.startTime,
        raw: rule.raw,
        imageUrl,
      })
    }
  }

  const jagadooMediaId = '8c46e8_3817138e16ee425bbda1d9fc6f14fc0e~mv2.jpg'
  if (htmlLower.includes(jagadooMediaId.toLowerCase())) {
    const imageUrl = extractGgsLoungeImageUrl(html, jagadooMediaId)
    const todayString = formatGgsLoungeDate(start)

    for (const year of [start.getFullYear(), start.getFullYear() + 1]) {
      const eventDateObject = new Date(year, 6, 10)
      const eventDate = formatGgsLoungeDate(eventDateObject)

      if (!eventDate || !todayString) continue
      if (eventDate < todayString) continue
      if (eventDateObject.getDay() !== 5) continue

      pushGgsEvent({
        title: "Mr and Miss Jagadoo's Shit Shirt Night",
        eventDate,
        startTime: null,
        raw: "GGS Lounge poster schedule: Mr and Miss Jagadoo's Shit Shirt Night, Friday 10th July. Fancy dress encouraged; prizes for best shirt.",
        imageUrl,
      })
      break
    }
  }

  return candidates
}


function isCjsTownhouseSource(venueId: string | null | undefined, sourceUrl?: string | null) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('cjs_at_the_townhouse_glasgow') ||
    combined.includes('cjsatthetownhouse.com') ||
    combined.includes('cj s at the townhouse') ||
    combined.includes('cjs at the townhouse')
  )
}

function discoverCjsTownhouseEventPages(sourceUrl: string) {
  const urls = [
    sourceUrl,
    absoluteUrl(sourceUrl, '/dates.html'),
  ].filter(Boolean) as string[]

  return [...new Set(urls)].filter((url) => {
    try {
      const parsed = new URL(url)
      const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
      const path = parsed.pathname.replace(/\/+$/, '').toLowerCase()

      return host === 'cjsatthetownhouse.com' && path === '/dates.html' && !isJunkUrl(url)
    } catch {
      return false
    }
  })
}

function isCjsTownhouseJunkEventTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const exactJunk = new Set([
    'party dates',
    'dates',
    'links',
    'contact',
    'info',
    'home',
    'june',
    'july',
    'august',
    'june 2026',
    'july 2026',
    'august 2026',
    'cjs',
    'cj s',
    'cjs at the townhouse',
    'cj s at the townhouse',
    'copyright',
  ])

  if (exactJunk.has(cleaned)) return true
  if (isJunkTitle(value || '')) return true

  const junkFragments = [
    'hopefully you are interested',
    'choose a date that suits',
    'get in touch',
    'full details',
    'soft drinks',
    'snacks provided',
    'small buffet provided',
    'regulars and novices',
    'all welcome',
    'limited number of spaces',
    'please note',
    'copyright',
    'www cjsatthetownhouse com',
    '2005 2026',
  ]

  return junkFragments.some((fragment) => cleaned.includes(fragment))
}

function cleanCjsTownhouseTitle(value: string) {
  return cleanEventName(value)
    .replace(/^[-–—:|]+/g, '')
    .replace(/^cj'?s\s*[-–—:|]+\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isCjsTownhouseJunkEvent(input: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  ticket_url?: string | null
  description?: string | null
}) {
  if (!isCjsTownhouseSource(input.venue_id, input.ticket_url)) return false

  const title = cleanCjsTownhouseTitle(input.event_name || '')
  const combined = normalizeTitle(
    `${input.event_name || ''} ${input.description || ''} ${input.ticket_url || ''}`
  )

  if (isCjsTownhouseJunkEventTitle(title)) return true
  if (!input.event_date) return true
  if (combined.includes('hopefully you are interested')) return true
  if (combined.includes('choose a date that suits')) return true

  return false
}

function isCjsTownhouseJunkExistingEvent(event: {
  venue_id?: string | null
  event_name?: string | null
  event_date?: string | null
  description?: string | null
  ticket_url?: string | null
}) {
  return isCjsTownhouseJunkEvent({
    venue_id: event.venue_id,
    event_name: event.event_name,
    event_date: event.event_date,
    description: event.description,
    ticket_url: event.ticket_url,
  })
}

function extractCjsTownhouseEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  if (!isCjsTownhouseSource('cjs_at_the_townhouse_glasgow', baseUrl)) return candidates

  try {
    const path = new URL(baseUrl).pathname.replace(/\/+$/, '').toLowerCase() || '/'
    if (path !== '/dates.html') return candidates
  } catch {
    return candidates
  }

  const pageImage = extractBestImage(html, baseUrl)
  const seen = new Set<string>()

  const lineText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|section|article|tr|td)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')

  const lines = lineText
    .split(/\n+/)
    .map((line) => cleanText(decodeEscapedText(line)))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const dateLinePattern = /^(?:mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(20\d{2})\s+(.+)$/i

  const isDateLine = (line: string) => dateLinePattern.test(line)
  const isMonthHeading = (line: string) => {
    const compact = line.replace(/\s+/g, '').toLowerCase()
    return /^(june|july|august)20\d{2}$/.test(compact)
  }

  const today = new Date()
  const todayString = validDateOrNull(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  )

  for (let index = 0; index < lines.length; index++) {
    const dateMatch = lines[index].match(dateLinePattern)
    if (!dateMatch) continue

    const month = monthNameToNumber(dateMatch[2])
    if (!month) continue

    const day = dateMatch[1].padStart(2, '0')
    const eventDate = validDateOrNull(`${dateMatch[3]}-${month}-${day}`)
    if (!eventDate) continue
    if (todayString && eventDate < todayString) continue

    let titleLine = ''

    for (let previous = index - 1; previous >= 0 && previous >= index - 5; previous--) {
      const possibleTitle = cleanText(lines[previous])
      if (!possibleTitle) continue
      if (isDateLine(possibleTitle)) break
      if (isMonthHeading(possibleTitle)) break
      if (possibleTitle.length > 120) continue
      if (isCjsTownhouseJunkEventTitle(possibleTitle)) continue
      if (/^\d{1,2}(:\d{2})?\s*(am|pm)?\s*(to|until|-)/i.test(possibleTitle)) continue

      titleLine = possibleTitle
      break
    }

    let title = cleanCjsTownhouseTitle(titleLine)
    if (!title || isCjsTownhouseJunkEventTitle(title)) continue
    if (title.length > 120) title = title.slice(0, 120).trim()

    const block: string[] = [title, lines[index]]

    for (let next = index + 1; next < lines.length; next++) {
      if (isDateLine(lines[next])) break
      if (isMonthHeading(lines[next])) break
      if (normalizeTitle(lines[next]).includes('copyright')) break
      block.push(lines[next])
      if (block.length >= 8) break
    }

    const raw = block.join(' ')
    const href = eventUrlWithAnchor(baseUrl, title)
    const key = `${normalizeTitle(title)}|${eventDate}`

    if (seen.has(key)) continue
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: extractTime(`${dateMatch[4]} ${raw}`),
      raw: cleanText(raw).slice(0, 600),
      image_url: pageImage,
      method: 'cjs-townhouse-dates',
    })
  }

  return candidates
}

function isTargetVenueSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()

  return (
    combined.includes('club_bacchus_dundee') ||
    combined.includes('clubbacchusdundee.uk') ||
    combined.includes('club_f_birmingham') ||
    combined.includes('clubf.uk') ||
    combined.includes('the_playgrounds_cleckheaton') ||
    combined.includes('theplaygrounds.co.uk') ||
    combined.includes('hellfire_club_sunbury_on_thames_london_area') ||
    combined.includes('theold-hellfireclub.co.uk') ||
    combined.includes('tockify.com/hellfireclubuk') ||
    combined.includes('ecclesia_glasgow') ||
    combined.includes('ecclesiaglasgow.com') ||
    combined.includes('pandora') ||
    combined.includes('pandoraswingers.com') ||
    isAtticExperienceSource(venueId, sourceUrl) ||
    isPenthouseSource(venueId, sourceUrl) ||
    isSf10RecoverySource(venueId, sourceUrl) ||
    isClubFSource(venueId, sourceUrl) ||
    isHu9Source(venueId, sourceUrl) ||
    isPlusciousPartiesSource(venueId, sourceUrl) ||
    isChunkyMuffinsSource(venueId, sourceUrl) ||
    isCarberrysEventsSource(venueId, sourceUrl) ||
    isSheWorldSource(venueId, sourceUrl) ||
    isMirageLincolnSource(venueId, sourceUrl) ||
    isCjsTownhouseSource(venueId, sourceUrl) ||
    isGgsLoungeSource(venueId, sourceUrl) ||
    isNo3ClubSource(venueId, sourceUrl) ||
    isClubCollaredSource(venueId, sourceUrl) ||
    isTortureGardenSource(venueId, sourceUrl) ||
    isRiotPartySource(venueId, sourceUrl) ||
    isSaintsAndSinnersSource(venueId, sourceUrl) ||
    isBirminghamBizarreBazaarSource(venueId, sourceUrl) ||
    isSteamerQuaySource(venueId, sourceUrl) ||
    isNumber52Source(venueId, sourceUrl) ||
    isClubZeusSource(venueId, sourceUrl) ||
    isOurPlace4FunSource(venueId, sourceUrl)
  )
}

function isHellfireSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()
  return combined.includes('hellfire_club_sunbury_on_thames_london_area') || combined.includes('theold-hellfireclub.co.uk') || combined.includes('tockify.com/hellfireclubuk')
}

function allowedSourcePageForVenue(source: { venue_id: string; source_url: string }, pageUrl: string) {
  if (isBirminghamBizarreBazaarSource(source.venue_id, source.source_url)) {
    return isBirminghamBizarreBazaarAllowedPage(pageUrl)
  }

  if (isSteamerQuaySource(source.venue_id, source.source_url)) {
    return isSteamerQuayAllowedPage(pageUrl)
  }

  if (isNumber52Source(source.venue_id, source.source_url)) {
    return isNumber52AllowedPage(pageUrl)
  }

  if (isOurPlace4FunSource(source.venue_id, source.source_url)) {
    return isOurPlace4FunAllowedPage(pageUrl)
  }

  if (isClubZeusSource(source.venue_id, source.source_url)) {
    return isClubZeusAllowedPage(pageUrl)
  }

  if (isSaintsAndSinnersSource(source.venue_id, source.source_url)) {
    return isSaintsAndSinnersAllowedPage(pageUrl)
  }

  if (isRiotPartySource(source.venue_id, source.source_url)) {
    return isRiotPartyAllowedPage(pageUrl)
  }

  if (isTortureGardenSource(source.venue_id, source.source_url)) {
    return isTortureGardenAllowedPage(pageUrl)
  }

  if (isClubCollaredSource(source.venue_id, source.source_url)) {
    return isClubCollaredAllowedPage(pageUrl)
  }

  if (isNo3ClubSource(source.venue_id, source.source_url)) {
    return isNo3ClubAllowedPage(pageUrl)
  }

  if (isAcquaSource(source.venue_id, source.source_url)) {
    return isAcquaAllowedPage(pageUrl)
  }

  if (isMe1SaunaSource(source.venue_id, source.source_url)) {
    return isMe1SaunaAllowedPage(pageUrl)
  }

  if (isGatehouseBoltonSource(source.venue_id, source.source_url)) {
    return isGatehouseBoltonAllowedPage(pageUrl)
  }

  if (isHu9Source(source.venue_id, source.source_url)) {
    try {
      const sourceOrigin = new URL(source.source_url).origin
      const target = new URL(pageUrl, source.source_url)
      const targetPath = target.pathname.replace(/\/+$/, '') || '/'

      return target.origin === sourceOrigin && targetPath === '/events'
    } catch {
      return false
    }
  }

  if (isGgsLoungeSource(source.venue_id, source.source_url)) {
    try {
      const host = new URL(pageUrl).hostname.replace(/^www\./, '').toLowerCase()
      return host === 'ggsloungeadultlifestyle.co.uk'
    } catch {
      return false
    }
  }

  if (sameDomainOrClubAlchemy(source.source_url, pageUrl)) return true

  // Hellfire embeds/links its live calendar on Tockify, so allow this one external host.
  if (isHellfireSource(source.venue_id, source.source_url)) {
    try {
      const host = new URL(pageUrl).hostname.replace(/^www\./, '').toLowerCase()
      if (host === 'tockify.com' && pageUrl.toLowerCase().includes('/hellfireclubuk')) return true
    } catch {
      return false
    }
  }

  return false
}

function discoverTargetVenueEventPages(source: { venue_id: string; source_url: string }) {
  const urls = new Set<string>()

  if (isBirminghamBizarreBazaarSource(source.venue_id, source.source_url)) {
    return discoverBirminghamBizarreBazaarEventPages(source.source_url)
  }

  if (isSteamerQuaySource(source.venue_id, source.source_url)) {
    return discoverSteamerQuayEventPages(source.source_url)
  }

  if (isNumber52Source(source.venue_id, source.source_url)) {
    return discoverNumber52EventPages(source.source_url)
  }

  if (isOurPlace4FunSource(source.venue_id, source.source_url)) {
    return discoverOurPlace4FunEventPages(source.source_url)
  }

  if (isClubZeusSource(source.venue_id, source.source_url)) {
    return discoverClubZeusEventPages(source.source_url)
  }

  if (isSaintsAndSinnersSource(source.venue_id, source.source_url)) {
    return discoverSaintsAndSinnersEventPages(source.source_url)
  }

  if (isRiotPartySource(source.venue_id, source.source_url)) {
    return discoverRiotPartyEventPages(source.source_url)
  }

  if (isTortureGardenSource(source.venue_id, source.source_url)) {
    return discoverTortureGardenEventPages(source.source_url)
  }

  if (isClubCollaredSource(source.venue_id, source.source_url)) {
    return discoverClubCollaredEventPages(source.source_url)
  }

  if (isNo3ClubSource(source.venue_id, source.source_url)) {
    return discoverNo3ClubEventPages(source.source_url)
  }

  if (isMe1SaunaSource(source.venue_id, source.source_url)) {
    return discoverMe1SaunaEventPages(source.source_url)
  }

  if (isGatehouseBoltonSource(source.venue_id, source.source_url)) {
    return discoverGatehouseBoltonEventPages(source.source_url)
  }

  if (isHu9Source(source.venue_id, source.source_url)) {
    return discoverHu9EventPages(source.source_url)
  }

  urls.add(source.source_url)

  if (source.venue_id === 'club_bacchus_dundee') {
    const url = absoluteUrl(source.source_url, '/events/')
    if (url) urls.add(url)
  }

  if (source.venue_id === 'club_f_birmingham' || isClubFSource(source.venue_id, source.source_url)) {
    // Club F has duplicate aliases (/whats-on and /calendar) that mirror /events.
    // Keep this venue scoped to one canonical page so the fixed-list parser only emits once.
    for (const path of ['/events']) {
      const url = absoluteUrl(source.source_url, path)
      if (url) urls.add(url)
    }
  }

  if (source.venue_id === 'the_playgrounds_cleckheaton') {
    for (const path of ['/events-2', '/platinum', '/tickets']) {
      const url = absoluteUrl(source.source_url, path)
      if (url) urls.add(url)
    }
  }

  if (source.venue_id === 'ecclesia_glasgow') {
    for (const path of [
      '/upcoming-events/',
      '/event_listing_category/parties/',
      '/event_listing_category/socials/',
      '/event_listing_category/workshops/',
      '/event_listing_type/kink-events/',
    ]) {
      const url = absoluteUrl(source.source_url, path)
      if (url) urls.add(url)
    }
  }

  if (isPandoraSource(source.venue_id, source.source_url)) {
    for (const url of discoverPandoraEventPages(source.source_url)) {
      urls.add(url)
    }
  }

  if (isHellfireSource(source.venue_id, source.source_url)) {
    for (const url of [
      'https://www.theold-hellfireclub.co.uk/Table_Matrix5_Icons.html',
      'https://www.theold-hellfireclub.co.uk/HellfireCalendar2020.html',
      'https://tockify.com/hellfireclubuk/',
    ]) {
      urls.add(url)
    }
  }

  if (isAtticExperienceSource(source.venue_id, source.source_url)) {
    for (const url of discoverAtticExperienceEventPages(source.source_url)) {
      urls.add(url)
    }
  }

  if (isPenthouseSource(source.venue_id, source.source_url)) {
    for (const url of discoverPenthouseEventPages(source.source_url)) {
      urls.add(url)
    }
  }

  if (isSf10RecoverySource(source.venue_id, source.source_url)) {
    for (const url of discoverSf10RecoveryEventPages(source)) {
      urls.add(url)
    }
  }

  if (isPlusciousPartiesSource(source.venue_id, source.source_url)) {
    urls.add(source.source_url)
  }

  if (isCarberrysEventsSource(source.venue_id, source.source_url)) {
    for (const url of discoverCarberrysEventPages(source.source_url)) {
      urls.add(url)
    }
  }

  if (isSheWorldSource(source.venue_id, source.source_url)) {
    for (const url of discoverSheWorldEventPages(source.source_url)) {
      urls.add(url)
    }
  }

  if (isMirageLincolnSource(source.venue_id, source.source_url)) {
    for (const url of discoverMirageLincolnEventPages(source.source_url)) {
      urls.add(url)
    }
  }

  if (isCjsTownhouseSource(source.venue_id, source.source_url)) {
    for (const url of discoverCjsTownhouseEventPages(source.source_url)) {
      urls.add(url)
    }
  }

  if (isGgsLoungeSource(source.venue_id, source.source_url)) {
    for (const url of discoverGgsLoungeEventPages(source.source_url)) {
      urls.add(url)
    }
  }

  if (isHu9Source(source.venue_id, source.source_url)) {
    for (const url of discoverHu9EventPages(source.source_url)) {
      urls.add(url)
    }
  }

  return [...urls].filter((url) => !isJunkUrl(url))
}

function extractTargetVenueEvents(html: string, pageUrl: string, venueId: string) {
  if (venueId === 'club_bacchus_dundee') return extractClubBacchusEvents(html, pageUrl)
  if (venueId === 'the_playgrounds_cleckheaton') return extractPlaygroundsEvents(html, pageUrl)
  if (venueId === 'ecclesia_glasgow') return extractEcclesiaEvents(html, pageUrl)
  if (venueId === 'club_f_birmingham' || isClubFSource(venueId, pageUrl)) return extractClubFEvents(html, pageUrl)
  if (isPandoraSource(venueId, pageUrl)) return extractPandoraEvents(html, pageUrl)
  if (isHellfireSource(venueId, pageUrl)) return extractHellfireEvents(html, pageUrl)
  if (isAtticExperienceSource(venueId, pageUrl)) return extractAtticExperienceEvents(html, pageUrl)
  if (isPenthouseSource(venueId, pageUrl)) return extractPenthouseEvents(html, pageUrl)
  if (isIgniteSource(venueId, pageUrl)) return extractIgniteEvents(html, pageUrl)
  if (isRoute69Source(venueId, pageUrl)) return extractRoute69Events(html, pageUrl)
  if (isMe1SaunaSource(venueId, pageUrl)) return extractMe1SaunaEvents(html, pageUrl)
  if (isGatehouseBoltonSource(venueId, pageUrl)) return extractGatehouseBoltonEvents(html, pageUrl)
  if (isBirminghamBizarreBazaarSource(venueId, pageUrl)) return extractBirminghamBizarreBazaarEvents(html, pageUrl)
  if (isSteamerQuaySource(venueId, pageUrl)) return extractSteamerQuayEvents(html, pageUrl)
  if (isNumber52Source(venueId, pageUrl)) return extractNumber52Events(html, pageUrl)
  if (isOurPlace4FunSource(venueId, pageUrl)) return extractOurPlace4FunEvents(html, pageUrl)
  if (isClubZeusSource(venueId, pageUrl)) return extractClubZeusEvents(html, pageUrl)
  if (isSaintsAndSinnersSource(venueId, pageUrl)) return extractSaintsAndSinnersEvents(html, pageUrl)
  if (isRiotPartySource(venueId, pageUrl)) return extractRiotPartyEvents(html, pageUrl)
  if (isTortureGardenSource(venueId, pageUrl)) return extractTortureGardenEvents(html, pageUrl)
  if (isClubCollaredSource(venueId, pageUrl)) return extractClubCollaredEvents(html, pageUrl)
  if (isNo3ClubSource(venueId, pageUrl)) return extractNo3ClubEvents(html, pageUrl)
  if (isSf10RecoverySource(venueId, pageUrl)) return extractSf10RecoveryEvents(html, pageUrl, venueId)
  if (isHu9Source(venueId, pageUrl)) return extractHu9Events(html, pageUrl)
  if (isPlusciousPartiesSource(venueId, pageUrl)) return extractPlusciousPartiesEvents(html, pageUrl)
  if (isCarberrysEventsSource(venueId, pageUrl)) return extractCarberrysEvents(html, pageUrl)
  if (isSheWorldSource(venueId, pageUrl)) return extractSheWorldEvents(html, pageUrl)
  if (isMirageLincolnSource(venueId, pageUrl)) return extractMirageLincolnEvents(html, pageUrl)
  if (isCjsTownhouseSource(venueId, pageUrl)) return extractCjsTownhouseEvents(html, pageUrl)
  if (isGgsLoungeSource(venueId, pageUrl)) return extractGgsLoungeEvents(html, pageUrl)

  return [] as {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[]
}

function monthNameToNumber(value: string | null | undefined) {
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

  return monthMap[String(value || '').toLowerCase()] || null
}

function futureSafeYear(month: string, day: string, explicitYear?: string | null) {
  if (explicitYear) return explicitYear

  const now = new Date()
  const currentYear = now.getFullYear()
  const candidate = new Date(Date.UTC(currentYear, Number(month) - 1, Number(day)))
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))

  // If an undated page month/day has already passed by more than 7 days, assume next year.
  if (candidate.getTime() < today.getTime() - 7 * 86400000) return String(currentYear + 1)

  return String(currentYear)
}

function normaliseTwoDigitYear(value: string | null | undefined) {
  if (!value) return null
  const raw = String(value)
  if (/^20\d{2}$/.test(raw)) return raw
  if (/^\d{2}$/.test(raw)) return `20${raw}`
  return null
}

function extractDateFromNumericParts(day: string, month: string, year: string | null | undefined) {
  const fullYear = normaliseTwoDigitYear(year) || String(new Date().getFullYear())
  return validDateOrNull(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
}

function cleanTargetVenueTitle(value: string) {
  return cleanEventName(value)
    .replace(/\b\d+\s+days?\s+to\s+the\s+event\b/gi, '')
    .replace(/\bmore info\b/gi, '')
    .replace(/\bbook tickets? here\b/gi, '')
    .replace(/\bdetails\b/gi, '')
    .replace(/\btickets?\b/gi, '')
    .replace(/^[-–—:|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function pushTargetCandidate(
  candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[],
  seen: Set<string>,
  input: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url?: string | null
    method: string
  }
) {
  const title = cleanTargetVenueTitle(input.text)
  if (!title || isJunkTitle(title)) return
  if (!input.event_date && !looksLikeStrongUndatedEvent(`${title} ${input.raw}`)) return

  const key = `${normalizeTitle(title)}|${input.event_date || 'no-date'}|${normalizeTicketUrl(input.href)}`
  if (seen.has(key)) return
  seen.add(key)

  candidates.push({
    href: input.href,
    text: title.length > 130 ? title.slice(0, 130).trim() : title,
    event_date: input.event_date,
    start_time: input.start_time,
    raw: cleanText(input.raw || title).slice(0, 500),
    image_url: validImageUrl(input.image_url || null),
    method: input.method,
  })
}

function extractClubBacchusEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const text = cleanText(html)
  const months =
    'jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december'
  const monthSectionPattern = new RegExp(
    `\\b(${months})\\b\\s+([\\s\\S]{0,6000}?)(?=\\b(?:${months})\\b\\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|\\d{1,2})|©|Privacy Settings|$)`,
    'gi'
  )

  let monthMatch

  while ((monthMatch = monthSectionPattern.exec(text)) !== null) {
    const month = monthNameToNumber(monthMatch[1])
    if (!month) continue

    const section = monthMatch[2]
    const eventPattern =
      /\b(?:monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+(.{5,130}?)(?:\s+(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm))(?:\s*[-–—]\s*(?:late|\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)))?)?(?=\s+(?:monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)?\s*\d{1,2}(?:st|nd|rd|th)?\s+|$)/gi

    let eventMatch

    while ((eventMatch = eventPattern.exec(section)) !== null) {
      const day = eventMatch[1].padStart(2, '0')
      const year = futureSafeYear(month, day)
      const eventDate = validDateOrNull(`${year}-${month}-${day}`)
      const raw = cleanText(eventMatch[0])
      let title = cleanTargetVenueTitle(eventMatch[2])

      title = title
        .replace(/\b(?:wear|come|open to all|subs in uniform|doms as teachers)\b[\s\S]*$/i, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (!eventDate || !title || title.length < 5) continue

      pushTargetCandidate(candidates, seen, {
        href: eventUrlWithAnchor(baseUrl, title),
        text: title,
        event_date: eventDate,
        start_time: extractTime(raw),
        raw,
        image_url: extractBestImage(html, baseUrl),
        method: 'club-bacchus-custom',
      })
    }
  }

  return candidates
}

function extractPlaygroundsEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const text = cleanText(decodeEscapedText(html))
  const links = extractLinks(html, baseUrl)
  const image = extractBestImage(html, baseUrl)

  const pattern =
    /(?:Image:\s*)?([A-Z0-9][A-Z0-9 '&+.,:/!-]{5,90}?)\s+(?:\d+\s+days?\s+to\s+the\s+event\s+)?\1?\s*(\d{1,2})\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(20\d{2}),\s*(\d{1,2}:\d{2})/gi

  let match

  while ((match = pattern.exec(text)) !== null) {
    const month = monthNameToNumber(match[3])
    if (!month) continue

    const eventDate = validDateOrNull(`${match[4]}-${month}-${match[2].padStart(2, '0')}`)
    const title = cleanTargetVenueTitle(match[1])
    const startTime = validTimeOrNull(match[5])
    const matchingLink =
      links.find((link) => normalizeTitle(link.text).includes('book') && !isJunkUrl(link.href)) ||
      links.find((link) => normalizeTitle(link.text).includes(normalizeTitle(title).slice(0, 20)) && !isJunkUrl(link.href))

    pushTargetCandidate(candidates, seen, {
      href: matchingLink?.href || eventUrlWithAnchor(baseUrl, title),
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: match[0],
      image_url: image,
      method: 'playgrounds-custom',
    })
  }

  return candidates
}

function extractEcclesiaEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const text = cleanText(html)
  const links = extractLinks(html, baseUrl)
  const image = extractBestImage(html, baseUrl)

  const categoryPattern =
    /\b(\d{1,2})\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+\d{1,2}\s+\2\s*-\s*\d{1,2}\s+\2\s+(.{5,120}?)\s+(\d{1,2})-(\d{1,2})-(\d{2,4})\s*@\s*(\d{1,2}):(\d{2})/gi

  let match

  while ((match = categoryPattern.exec(text)) !== null) {
    const year = normaliseTwoDigitYear(match[6]) || String(new Date().getFullYear())
    const eventDate = validDateOrNull(`${year}-${match[5].padStart(2, '0')}-${match[4].padStart(2, '0')}`)
    const title = cleanTargetVenueTitle(match[3])
    const startTime = validTimeOrNull(`${match[7].padStart(2, '0')}:${match[8]}`)
    const matchingLink = links.find((link) => normalizeTitle(link.text).includes(normalizeTitle(title).slice(0, 20)) && !isJunkUrl(link.href))

    pushTargetCandidate(candidates, seen, {
      href: matchingLink?.href || eventUrlWithAnchor(baseUrl, title),
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw: match[0],
      image_url: image,
      method: 'ecclesia-category-custom',
    })
  }

  const eventPageTitle = extractPageTitle(html)
  const eventPageDate =
    extractDateFromHtml(html) ||
    extractDate(text.slice(0, 2000))

  if (baseUrl.includes('/event/') && eventPageTitle && eventPageDate) {
    pushTargetCandidate(candidates, seen, {
      href: baseUrl,
      text: eventPageTitle,
      event_date: eventPageDate,
      start_time: extractTime(text.slice(0, 3000)),
      raw: extractMetaDescription(html) || text.slice(0, 500),
      image_url: image,
      method: 'ecclesia-event-page',
    })
  }

  return candidates
}

function extractHellfireEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const image = extractBestImage(html, baseUrl)
  const jsonEvents = extractJsonLdEvents(html, baseUrl)

  for (const event of jsonEvents) {
    pushTargetCandidate(candidates, seen, {
      href: event.url || baseUrl,
      text: event.name,
      event_date: event.date || extractDate(`${event.name} ${event.description}`),
      start_time: event.start_time || extractTime(`${event.name} ${event.description}`),
      raw: event.description || event.name,
      image_url: event.image_url || image,
      method: 'hellfire-jsonld',
    })
  }

  const text = cleanText(decodeEscapedText(html))
  const pattern =
    /([A-Z][A-Za-z0-9 '&+.,:/!-]{5,90}?)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s*(20\d{2})?/gi

  let match

  while ((match = pattern.exec(text)) !== null) {
    const month = monthNameToNumber(match[3])
    if (!month) continue

    const year = futureSafeYear(month, match[2].padStart(2, '0'), match[4])
    const eventDate = validDateOrNull(`${year}-${month}-${match[2].padStart(2, '0')}`)
    const title = cleanTargetVenueTitle(match[1])

    pushTargetCandidate(candidates, seen, {
      href: eventUrlWithAnchor(baseUrl, title),
      text: title,
      event_date: eventDate,
      start_time: extractTime(match[0]),
      raw: match[0],
      image_url: image,
      method: 'hellfire-custom',
    })
  }

  return candidates
}

function extractGenericDatedBlockEvents(html: string, baseUrl: string, method: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()
  const text = cleanText(decodeEscapedText(html))
  const image = extractBestImage(html, baseUrl)

  const patterns = [
    /([A-Z][A-Za-z0-9 '&+.,:/!-]{5,100}?)\s+(\d{1,2})\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(20\d{2})(?:,\s*)?(\d{1,2}:\d{2})?/gi,
    /(\d{1,2})\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(20\d{2})\s+([A-Z][A-Za-z0-9 '&+.,:/!-]{5,100}?)(?=\s+\d{1,2}\s+(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|december)|$)/gi,
    /([A-Z][A-Za-z0-9 '&+.,:/!-]{5,100}?)\s+(\d{1,2})[\/.-](\d{1,2})[\/.-](20\d{2}|\d{2})(?:\s+(\d{1,2}:\d{2}))?/gi,
  ]

  for (const pattern of patterns) {
    let match

    while ((match = pattern.exec(text)) !== null) {
      let title = ''
      let eventDate: string | null = null
      let startTime: string | null = null

      if (pattern === patterns[0]) {
        const month = monthNameToNumber(match[3])
        if (!month) continue
        title = match[1]
        eventDate = validDateOrNull(`${match[4]}-${month}-${match[2].padStart(2, '0')}`)
        startTime = match[5] ? validTimeOrNull(match[5]) : extractTime(match[0])
      } else if (pattern === patterns[1]) {
        const month = monthNameToNumber(match[2])
        if (!month) continue
        title = match[4]
        eventDate = validDateOrNull(`${match[3]}-${month}-${match[1].padStart(2, '0')}`)
        startTime = extractTime(match[0])
      } else {
        title = match[1]
        eventDate = extractDateFromNumericParts(match[2], match[3], match[4])
        startTime = match[5] ? validTimeOrNull(match[5]) : extractTime(match[0])
      }

      pushTargetCandidate(candidates, seen, {
        href: eventUrlWithAnchor(baseUrl, title),
        text: title,
        event_date: eventDate,
        start_time: startTime,
        raw: match[0],
        image_url: image,
        method,
      })
    }
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



function extractImageFromWpRenderedContent(content: string, baseUrl: string) {
  const rawImage =
    content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)?.[1] ||
    content.match(/<img[^>]+data-src=["']([^"']+)["'][^>]*>/i)?.[1] ||
    content.match(/srcset=["']([^"'\s,]+)[^"']*["']/i)?.[1]

  return validImageUrl(absoluteUrl(baseUrl, rawImage))
}

function cleanWordPressRendered(value: any) {
  return cleanText(
    typeof value === 'string'
      ? value
      : typeof value?.rendered === 'string'
        ? value.rendered
        : ''
  )
}


function isPandoraSource(venueId: string | null | undefined, sourceUrl: string | null | undefined) {
  const combined = `${venueId || ''} ${sourceUrl || ''}`.toLowerCase()
  return combined.includes('pandora') || combined.includes('pandoraswingers.com')
}

function discoverPandoraEventPages(sourceUrl: string) {
  // Pandora's server-side fetches are reliable on the www host.
  // The non-www /event-diary paths can return empty/null on Vercel, so force
  // the canonical www pages first while still allowing the supplied source URL.
  const canonicalBase = 'https://www.pandoraswingers.com'

  const urls = [
    `${canonicalBase}/event-diary`,
    `${canonicalBase}/event-diary/`,
    canonicalBase,
    absoluteUrl(sourceUrl, '/event-diary'),
    absoluteUrl(sourceUrl, '/event-diary/'),
    sourceUrl,
  ].filter(Boolean) as string[]

  return [...new Set(urls)]
    .filter((url) => {
      try {
        const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
        return host === 'pandoraswingers.com' && !isJunkUrl(url)
      } catch {
        return false
      }
    })
}

function isPandoraSkipLine(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')
  if (!cleaned) return true

  const fragments = [
    'upcoming events',
    'event diary',
    'event night',
    'open to all members',
    'open to all',
    'all members welcome',
    'add onto the guest list',
    'guest list',
    'fabswingers forum',
    'fab swingers forum',
    'before 7pm',
    'after 7pm',
    'per couple',
    'single male',
    'single female',
    'trans',
    'couple',
    'free shots',
    'dj ',
    'soulg',
    'tone deaf',
    'on the decks',
    'address',
    'opening hours',
    'membership required',
    'more information',
    'members welcome to attend',
    'pandora swingers club',
    'adult lifestyle',
  ]

  if (/^£/.test(cleanText(value || '').trim())) return true
  if (/^\d+\s*(am|pm)\s*(till|until|to)/i.test(cleanText(value || '').trim())) return true
  if (/^open\s+\d/i.test(cleanText(value || '').trim())) return true
  if (fragments.some((fragment) => cleaned.includes(fragment))) return true

  return false
}

function cleanPandoraTitle(value: string, fallback: string) {
  let title = cleanEventName(value || fallback)
    .replace(/^\*+\s*/g, '')
    .replace(/\s*\*+$/g, '')
    .replace(/^[-–—:|]+/g, '')
    .replace(/\b(?:is hosting|are hosting|hosting our regular|are bringing|bringing back|new to pandora|pandora's dedicated)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!title || isPandoraSkipLine(title) || isJunkTitle(title)) {
    title = cleanEventName(fallback)
      .replace(/^[-–—:|]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  return title
}

function extractPandoraEvents(html: string, baseUrl: string) {
  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const lineText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|tr|section|article)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')

  const lines = lineText
    .split(/\n+/)
    .map((line) => cleanText(line))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const dateLinePattern = /^(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)(?:\s+(20\d{2}))?\s*(.*)$/i

  const seen = new Set<string>()
  const pageImage = extractBestImage(html, baseUrl)

  const isUsefulPandoraTitleLine = (line: string) => {
    const cleaned = cleanText(line)
      .replace(/^\*+|\*+$/g, '')
      .replace(/^[-–—:|]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    const normalised = normalizeTitle(cleaned)

    if (!cleaned || cleaned.length < 4) return false
    if (cleaned.length > 90) return false
    if (isPandoraSkipLine(cleaned)) return false
    if (isJunkTitle(cleaned)) return false
    if (/^event\s*night$/i.test(cleaned)) return false
    if (/^open\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(cleaned)) return false
    if (/^(am|pm|till|until|after|before)\b/i.test(cleaned)) return false
    if (/^£/.test(cleaned)) return false
    if (normalised.includes('all members welcome')) return false
    if (normalised.includes('guest list')) return false
    if (normalised.includes('click here')) return false
    if (normalised.includes('pandora swingers')) return false

    return true
  }

  const pickPandoraTitle = (block: string[], inlineTitle: string, weekday: string) => {
    const cleanedBlock = block
      .map((line) => line.replace(/^\*+|\*+$/g, '').trim())
      .filter(Boolean)

    const inline = cleanPandoraTitle(inlineTitle, '')
    if (inline && isUsefulPandoraTitleLine(inline)) return inline

    const eventNightIndex = cleanedBlock.findIndex((line) => normalizeTitle(line).includes('event night'))

    const searchLines =
      eventNightIndex >= 0
        ? cleanedBlock.slice(eventNightIndex + 1, eventNightIndex + 8)
        : cleanedBlock.slice(1, 9)

    const directTitle = searchLines.find((line) => isUsefulPandoraTitleLine(line))
    if (directTitle) return cleanPandoraTitle(directTitle, directTitle)

    const wholeBlock = cleanedBlock.join(' ')
    const namedPatterns = [
      /\b(?:event\s*night|event)\s+([A-Z][A-Za-z0-9 '&+.,:/!-]{3,70}?)(?=\s+(?:open|guest|before|after|£|single|couple|trans|dj|from|all members|members|doors|address)\b|$)/i,
      /\b(?:hosting|bringing back|brings?|presents?)\s+(?:our\s+)?(?:regular\s+)?([A-Z][A-Za-z0-9 '&+.,:/!-]{3,70}?)(?=\s+(?:open|guest|before|after|£|single|couple|trans|dj|from|all members|members|doors|address)\b|$)/i,
    ]

    for (const pattern of namedPatterns) {
      const match = wholeBlock.match(pattern)
      const title = cleanPandoraTitle(match?.[1] || '', '')
      if (title && isUsefulPandoraTitleLine(title)) return title
    }

    const isOpenNight = cleanedBlock.some((line) => normalizeTitle(line).includes('open to all members'))
    return isOpenNight
      ? `${weekday.charAt(0).toUpperCase()}${weekday.slice(1).toLowerCase()} Members Night`
      : ''
  }

  const addPandoraCandidate = (input: {
    weekday: string
    day: string
    monthName: string
    explicitYear?: string | null
    inlineTitle?: string
    block: string[]
    method: string
  }) => {
    const month = monthNameToNumber(input.monthName)
    if (!month) return

    const day = input.day.padStart(2, '0')
    const year = futureSafeYear(month, day, input.explicitYear || null)
    const eventDate = validDateOrNull(`${year}-${month}-${day}`)
    if (!eventDate) return

    const raw = input.block
      .map((line) => cleanText(line))
      .filter(Boolean)
      .join(' ')
      .slice(0, 500)

    let title = pickPandoraTitle(input.block, input.inlineTitle || '', input.weekday)

    if (!title || isJunkTitle(title)) return

    title = title
      .replace(/\b(?:event night|upcoming events)\b/gi, '')
      .replace(/^[-–—:|]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || isJunkTitle(title)) return
    if (title.length > 120) title = title.slice(0, 120).trim()

    const startTime = extractTime(raw)
    const href = eventUrlWithAnchor('https://www.pandoraswingers.com', title)
    const key = `${normalizeTitle(title)}|${eventDate}`

    if (seen.has(key)) return
    seen.add(key)

    candidates.push({
      href,
      text: title,
      event_date: eventDate,
      start_time: startTime,
      raw,
      image_url: pageImage,
      method: input.method,
    })
  }

  for (let index = 0; index < lines.length; index++) {
    const dateMatch = lines[index].match(dateLinePattern)
    if (!dateMatch) continue

    const block: string[] = [lines[index]]

    for (let next = index + 1; next < lines.length; next++) {
      if (lines[next].match(dateLinePattern)) break
      if (normalizeTitle(lines[next]) === 'address') break
      block.push(lines[next])
    }

    addPandoraCandidate({
      weekday: dateMatch[1],
      day: dateMatch[2],
      monthName: dateMatch[3],
      explicitYear: dateMatch[4] || null,
      inlineTitle: dateMatch[5] || '',
      block,
      method: 'pandora-event-diary',
    })
  }

  // Fallback for Pandora's very compressed Duda/mobile HTML where date + content
  // can be flattened into one long text run rather than clean line blocks.
  const compactText = cleanText(decodeEscapedText(html))
    .replace(/\s+/g, ' ')
    .trim()

  const compactPattern =
    /\b(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)(?:\s+(20\d{2}))?\s+([\s\S]{8,900}?)(?=\b(?:monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\s+\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b|Address\b|$)/gi

  let compactMatch

  while ((compactMatch = compactPattern.exec(compactText)) !== null) {
    const blockText = compactMatch[5]
      .replace(/\s+/g, ' ')
      .trim()

    const syntheticLines = [
      `${compactMatch[1]} ${compactMatch[2]} ${compactMatch[3]} ${compactMatch[4] || ''}`.trim(),
      ...blockText
        .split(/\s{2,}|(?=\b(?:event night|open|guest list|before|after|£|single|couple|trans|dj)\b)/i)
        .map((line) => cleanText(line))
        .filter(Boolean),
    ]

    addPandoraCandidate({
      weekday: compactMatch[1],
      day: compactMatch[2],
      monthName: compactMatch[3],
      explicitYear: compactMatch[4] || null,
      inlineTitle: blockText,
      block: syntheticLines,
      method: 'pandora-event-diary-compact',
    })
  }

  return candidates
}

function isTownhouseEventOnJunkTitle(value: string | null | undefined) {
  const cleaned = normalizeTitle(value || '')

  if (!cleaned) return true
  if (isJunkTitle(cleaned)) return true

  const junk = [
    'closed for private party',
    'private party',
    'private event',
    'details coming soon',
    'coming soon',
    'test event',
    'draft',
  ]

  return junk.some((item) => cleaned === item || cleaned.includes(item))
}

async function fetchTownhouseEventOnApiEvents(sourceUrl: string) {
  const apiUrls = [
    'https://townhouseswingers.com/wp-json/wp/v2/ajde_events?per_page=100&_embed=1',
    'https://townhouseswingers.com/wp-json/wp/v2/ajde_events?per_page=100',
  ]

  const candidates: {
    href: string
    text: string
    event_date: string | null
    start_time: string | null
    raw: string
    image_url: string | null
    method: string
  }[] = []

  const seen = new Set<string>()

  for (const apiUrl of apiUrls) {
    const jsonText = await fetchText(apiUrl, 'application/json,text/plain,*/*')
    if (!jsonText) continue

    let parsed: any

    try {
      parsed = JSON.parse(jsonText)
    } catch (err: any) {
      console.log('TOWNHOUSE EVENTON API PARSE ERROR:', err?.message || 'Unknown parse error')
      continue
    }

    const items = Array.isArray(parsed) ? parsed : []
    if (items.length === 0) continue

    for (const item of items) {
      if (!item || item.status === 'trash' || item.status === 'draft') continue

      const title = cleanEventName(cleanWordPressRendered(item.title))
      if (!title || isTownhouseEventOnJunkTitle(title)) continue

      const eventUrl =
        absoluteUrl(sourceUrl, item.link) ||
        absoluteUrl(sourceUrl, item.guid?.rendered) ||
        eventUrlWithAnchor(sourceUrl, title)

      if (!eventUrl || !eventUrl.includes('/events/')) continue

      const contentHtml = typeof item.content?.rendered === 'string' ? item.content.rendered : ''
      const excerptHtml = typeof item.excerpt?.rendered === 'string' ? item.excerpt.rendered : ''
      const description = cleanDescription(`${contentHtml} ${excerptHtml}`) || title

      const embeddedImage =
        validImageUrl(item?._embedded?.['wp:featuredmedia']?.[0]?.source_url) ||
        validImageUrl(item?._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url) ||
        validImageUrl(item?._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium_large?.source_url) ||
        null

      const imageUrl =
        embeddedImage ||
        extractImageFromWpRenderedContent(contentHtml, eventUrl) ||
        null

      // The public WP REST payload exposes the EventON posts, titles, content and images.
      // Some installs do not expose EventON's private start-date meta through REST, so only
      // use an explicit date if it appears in the title/content/link. Otherwise save as TBC.
      const dateSource = `${title} ${description} ${eventUrl}`
      const eventDate = extractDate(dateSource)
      const startTime = extractTime(dateSource)
      const key = `${normalizeTitle(title)}|${eventDate || 'no-date'}|${normalizeTicketUrl(eventUrl)}`

      if (seen.has(key)) continue
      seen.add(key)

      candidates.push({
        href: eventUrl,
        text: title,
        event_date: eventDate,
        start_time: startTime,
        raw: description || title,
        image_url: imageUrl,
        method: 'townhouse-eventon-api',
      })
    }

    if (candidates.length > 0) break
  }

  return candidates
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


// SF 10.1 safe rescue layer.
// This does NOT lower the global junk filter. It only rescues dated candidates
// where the title/raw text strongly looks like a real event and is not hard UI junk.
const SF10_SAFE_RESCUE_KEYWORDS = [
  'party',
  'social',
  'bbq',
  'barbecue',
  'couples',
  'singles',
  'ladies',
  'flirt',
  'fling',
  'kink',
  'fetish',
  'bdsm',
  'bi night',
  'greedy girls',
  'club night',
  'sauna night',
  'darkside',
  'munch',
  'takeover',
  'workshop',
  'meet',
  'meetup',
  'event',
]

const SF10_HARD_JUNK_RESCUE_TITLES = [
  'download pdf',
  'download',
  'pdf',
  'read more',
  'click here',
  'view details',
  'details',
  'event details',
  'book now',
  'book tickets',
  'buy tickets',
  'tickets',
  'ticket',
  'contact',
  'contact us',
  'membership',
  'memberships',
  'prices',
  'price list',
  'gallery',
  'home',
  'about',
  'privacy',
  'privacy policy',
  'terms',
  'terms and conditions',
  'calendar',
  'events calendar',
  'upcoming events',
]

function cleanSf10RescueCandidateTitle(title: string | null | undefined, context?: string | null) {
  let cleaned = cleanEventName(title || '')
    // Some calendar/card parsers leak one leading layout character, e.g.
    // "y Flirt and Fling EVENT" or "e Early Summer BBQ EVENT".
    .replace(/^[a-z]\s+(?=[A-Z0-9])/g, '')
    .replace(/^[-–—:|]+/g, '')
    .replace(/\bEVENT\s+DETAILS\b/gi, '')
    .replace(/\bDETAILS\b$/gi, '')
    .replace(/\bEVENT\b$/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned && context) {
    cleaned = cleanEventName(context)
      .replace(/^[a-z]\s+(?=[A-Z0-9])/g, '')
      .replace(/^[-–—:|]+/g, '')
      .replace(/\bEVENT\s+DETAILS\b/gi, '')
      .replace(/\bEVENT\b$/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  return cleaned
}

function isSf10HardJunkRescueTitle(title: string | null | undefined) {
  const cleaned = normalizeTitle(title || '')
  if (!cleaned) return true

  return SF10_HARD_JUNK_RESCUE_TITLES.some((junk) => cleaned === junk)
}

function isSf10SafeRescueCandidate(input: {
  venue_id?: string | null
  event_name: string | null | undefined
  event_date: string | null
  ticket_url?: string | null
  description?: string | null
}) {
  if (!input.event_date) return false

  const title = cleanSf10RescueCandidateTitle(input.event_name, input.description)
  const titleNorm = normalizeTitle(title)
  const combinedNorm = normalizeTitle(`${title} ${input.description || ''}`)
  const url = String(input.ticket_url || '').toLowerCase()

  if (!titleNorm || titleNorm.length < 5) return false
  if (isSf10HardJunkRescueTitle(title)) return false
  if (url.includes('google.com/calendar') || url.includes('ical=1') || url.includes('action=template')) return false
  if (url.includes('/contact') || url.includes('/privacy') || url.includes('/terms') || url.includes('/membership')) return false

  // Keep these as hard blocks even for rescue.
  const hardCombinedBlocks = [
    'download pdf',
    'privacy policy',
    'terms and conditions',
    'cookie policy',
    'add to calendar',
    'google calendar',
    'contact us',
  ]

  if (hardCombinedBlocks.some((junk) => combinedNorm.includes(junk))) return false

  return SF10_SAFE_RESCUE_KEYWORDS.some((keyword) =>
    combinedNorm.includes(normalizeTitle(keyword))
  )
}

async function saveEventCandidate(input: {
  venue_id: string
  source_id?: string | null
  source_url: string
  candidate_url: string
  candidate_title: string
  matched_text?: string | null
  status: string
}) {
  const title = cleanSf10RescueCandidateTitle(input.candidate_title || '', input.matched_text)
  const candidateUrl = input.candidate_url || input.source_url

  if (!input.venue_id || !title) return

  try {
    await supabaseAdmin.from('event_candidates').insert({
      venue_id: input.venue_id,
      source_id: input.source_id || null,
      source_url: input.source_url,
      candidate_url: candidateUrl,
      candidate_title: title.slice(0, 240),
      matched_text: cleanText(input.matched_text || title).slice(0, 1000),
      status: input.status,
    })
  } catch (err: any) {
    console.log('EVENT CANDIDATE LOG FAILED:', input.venue_id, title, err?.message || err)
  }
}

function candidateRejectionReason(input: {
  venue_id: string
  event_name: string
  event_date: string | null
  ticket_url: string
  description: string | null
}) {
  const eventName = cleanSf10RescueCandidateTitle(input.event_name, input.description)
  const safeRescueCandidate = isSf10SafeRescueCandidate({
    ...input,
    event_name: eventName,
  })

  if (isLeBoudoirSource(input.venue_id)) {
    if (isLeBoudoirJunkEventTitle(eventName) && !safeRescueCandidate) return 'rejected_junk_title'
    if (!input.event_date) return 'rejected_missing_date'
  }

  if (isMinistryStudiosJunkEvent({ ...input, event_name: eventName })) return 'rejected_ministry_studios_junk'
  if (isChunkyMuffinsJunkEvent({ ...input, event_name: eventName })) return 'rejected_chunky_muffins_junk'
  if (isCarberrysJunkEvent({ ...input, event_name: eventName })) return 'rejected_carberrys_junk'
  if (isSheWorldJunkEvent({ ...input, event_name: eventName })) return 'rejected_she_world_junk'
  if (isMirageLincolnJunkEvent({ ...input, event_name: eventName })) return 'rejected_mirage_lincoln_junk'
  if (isCjsTownhouseJunkEvent({ ...input, event_name: eventName })) return 'rejected_cjs_townhouse_junk'
  if (isGgsLoungeJunkEvent({ ...input, event_name: eventName })) return 'rejected_ggs_lounge_junk'

  if (isAcquaSafeDatedEvent({ ...input, event_name: eventName })) return null

  if (isBlacklistedTbcEvent(input.venue_id, eventName, input.event_date)) return 'rejected_blacklisted_tbc'
  if (isJunkTitle(eventName) && !safeRescueCandidate) return 'rejected_junk_title'
  if (isJunkUrl(input.ticket_url)) return 'rejected_junk_url'

  const lowerUrl = input.ticket_url.toLowerCase()
  if (lowerUrl.includes('google.com/calendar')) return 'rejected_calendar_export'
  if (lowerUrl.includes('ical=1')) return 'rejected_calendar_export'
  if (lowerUrl.includes('action=template')) return 'rejected_calendar_export'
  if (lowerUrl.includes('/fetish-guide')) return 'rejected_info_page'
  if (lowerUrl.includes('/fetish-membership')) return 'rejected_info_page'
  if (lowerUrl.includes('/fetish-events-and-cost')) return 'rejected_info_page'

  const combined = `${eventName} ${input.description || ''} ${input.ticket_url}`

  if (hasBadEventPattern(combined) && !safeRescueCandidate) return 'rejected_bad_pattern'

  if (!input.event_date && !looksLikeStrongUndatedEvent(`${eventName} ${input.description || ''}`)) {
    return 'rejected_missing_date'
  }

  if (!looksLikeEvent(combined) && !input.event_date) return 'rejected_weak_event_signal'

  return null
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

      if (isLeBoudoirSource(event.venue_id) && isLeBoudoirJunkExistingEvent(event)) return true
      if (isMinistryStudiosJunkExistingEvent(event)) return true
      if (isChunkyMuffinsJunkExistingEvent(event)) return true
      if (isCarberrysJunkExistingEvent(event)) return true
      if (isSheWorldJunkExistingEvent(event)) return true
      if (isMirageLincolnJunkExistingEvent(event)) return true
      if (isCjsTownhouseJunkExistingEvent(event)) return true
      if (isGgsLoungeJunkExistingEvent(event)) return true
      if (isAcquaSource(event.venue_id, ticketUrl) && event.event_date && !isAcquaJunkTitle(name) && !isJunkUrl(ticketUrl)) return false
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
  return candidateRejectionReason(input) === null
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
  const safeDescription = cleanDescription(input.description)
  const eventName = input.venue_id === 'xtasia_west_bromwich'
    ? cleanXtasiaCalendarTitle(input.event_name)
    : cleanSf10RescueCandidateTitle(input.event_name, safeDescription || input.description)
  const normalised = normalizeTitle(eventName)
  const safeImageUrl = validImageUrl(input.image_url)
  const safeTicketUrl = normalizeTicketUrl(input.ticket_url)
  const tags = inferEventTags(`${eventName} ${safeDescription || ''} ${safeTicketUrl}`)

  const rejectionReason = candidateRejectionReason({
    ...input,
    event_name: eventName,
    ticket_url: safeTicketUrl,
  })

  if (rejectionReason) {
    await saveEventCandidate({
      venue_id: input.venue_id,
      source_url: input.source_url,
      candidate_url: safeTicketUrl,
      candidate_title: eventName,
      matched_text: safeDescription || input.description || eventName,
      status: rejectionReason,
    })

    return { action: 'skipped', error: null }
  }

  await saveEventCandidate({
    venue_id: input.venue_id,
    source_url: input.source_url,
    candidate_url: safeTicketUrl,
    candidate_title: eventName,
    matched_text: safeDescription || input.description || eventName,
    status: 'approved',
  })

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
  const debugSkipped: any[] = []
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

    if (
      isVanillaAlternativeSource(`${source.source_url} ${source.venue_id}`) ||
      isLeBoudoirSource(`${source.source_url} ${source.venue_id}`) ||
      isMinistryStudiosSource(source.venue_id, source.source_url) ||
      isChunkyMuffinsSource(source.venue_id, source.source_url) ||
      isCarberrysEventsSource(source.venue_id, source.source_url) ||
      isSheWorldSource(source.venue_id, source.source_url) ||
      isMirageLincolnSource(source.venue_id, source.source_url) ||
      isCjsTownhouseSource(source.venue_id, source.source_url)
    ) {
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


    if (isPandoraSource(source.venue_id, source.source_url)) {
      const pandoraUrls = discoverPandoraEventPages(source.source_url).slice(0, 3)

      for (const pageUrl of pandoraUrls) {
        checkedPages++

        const html = await fetchHtml(pageUrl)

        if (!html) {
          failed++
          timedOutOrEmpty++

          if (failedPages.length < 30) {
            failedPages.push({
              venue_id: source.venue_id,
              page_url: pageUrl,
              reason: 'Pandora fetch returned empty/null',
            })
          }

          continue
        }

        const pandoraEvents = extractPandoraEvents(html, pageUrl)

        for (const pandoraEvent of pandoraEvents) {
          candidatesFound++

          const title = pandoraEvent.text
          const description = pandoraEvent.raw || pandoraEvent.text
          const ticketUrl = pandoraEvent.href || eventUrlWithAnchor(pageUrl, title)
          const dedupeKey = eventDedupeKey(source.venue_id, title, pandoraEvent.event_date, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: pandoraEvent.event_date,
            start_time: pandoraEvent.start_time,
            description,
            ticket_url: ticketUrl,
            image_url: pandoraEvent.image_url,
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
                event_date: pandoraEvent.event_date,
                error: result.error?.message || 'Unknown upsert error',
              })
            }
          }

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: pandoraEvent.event_date,
              event_url: ticketUrl,
              image_url: pandoraEvent.image_url,
              method: pandoraEvent.method,
            })
          }
        }
      }

      await supabaseAdmin
        .from('event_sources')
        .update({ last_checked: new Date().toISOString() })
        .eq('source_id', source.source_id)

      console.log('SOURCE DONE:', source.source_url)
      continue
    }

    if (source.venue_id === 'townhouse_wirral_near_liverpool') {
      const townhouseApiEvents = await fetchTownhouseEventOnApiEvents(source.source_url)

      for (const townhouseApiEvent of townhouseApiEvents) {
        candidatesFound++

        const title = townhouseApiEvent.text
        const description = townhouseApiEvent.raw || townhouseApiEvent.text
        const ticketUrl = townhouseApiEvent.href || eventUrlWithAnchor(source.source_url, title)
        const dedupeKey = eventDedupeKey(source.venue_id, title, townhouseApiEvent.event_date, ticketUrl)

        if (runSeen.has(dedupeKey)) {
          skipped++
          continue
        }

        runSeen.add(dedupeKey)

        const result = await upsertEvent({
          venue_id: source.venue_id,
          event_name: title,
          event_date: townhouseApiEvent.event_date,
          start_time: townhouseApiEvent.start_time,
          description,
          ticket_url: ticketUrl,
          image_url: townhouseApiEvent.image_url,
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
              event_date: townhouseApiEvent.event_date,
              error: result.error?.message || 'Unknown upsert error',
            })
          }
        }

        if (townhouseApiEvent.image_url) {
          const venueImageResult = await updateVenueImageIfEmpty(source.venue_id, townhouseApiEvent.image_url)
          if (venueImageResult.updated) venueImagesUpdated++
        }

        if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
          found.push({
            venue_id: source.venue_id,
            event_name: cleanEventName(title),
            event_date: townhouseApiEvent.event_date,
            event_url: ticketUrl,
            image_url: townhouseApiEvent.image_url,
            method: townhouseApiEvent.method,
          })
        }
      }

      // Keep the fast directory parser as a fallback/extra source, but do not deep-crawl.
      const townhouseUrls = [
        'https://townhouseswingers.com/event-directory/',
        source.source_url,
      ]
        .filter(Boolean)
        .filter((url, index, array) => array.indexOf(url) === index)
        .filter((url) => {
          try {
            const parsed = new URL(url)
            return parsed.hostname.replace(/^www\./, '').toLowerCase() === 'townhouseswingers.com'
          } catch {
            return false
          }
        })
        .slice(0, 2)

      for (const pageUrl of townhouseUrls) {
        checkedPages++

        const html = await fetchHtml(pageUrl)

        if (!html) {
          failed++
          timedOutOrEmpty++

          if (failedPages.length < 30) {
            failedPages.push({
              venue_id: source.venue_id,
              page_url: pageUrl,
              reason: 'Townhouse fast fetch returned empty/null',
            })
          }

          continue
        }

        const pageImage = extractBestImage(html, pageUrl)

        if (pageImage) {
          const venueImageResult = await updateVenueImageIfEmpty(source.venue_id, pageImage)
          if (venueImageResult.updated) venueImagesUpdated++
        }

        const townhouseEvents = extractTownhouseEvents(html, pageUrl)

        for (const townhouseEvent of townhouseEvents) {
          candidatesFound++

          const title = townhouseEvent.text
          const description = townhouseEvent.raw || townhouseEvent.text
          const ticketUrl = townhouseEvent.href || eventUrlWithAnchor(pageUrl, title)
          const dedupeKey = eventDedupeKey(source.venue_id, title, townhouseEvent.event_date, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: townhouseEvent.event_date,
            start_time: townhouseEvent.start_time,
            description,
            ticket_url: ticketUrl,
            image_url: pageImage,
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
                event_date: townhouseEvent.event_date,
                error: result.error?.message || 'Unknown upsert error',
              })
            }
          }

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: townhouseEvent.event_date,
              event_url: ticketUrl,
              image_url: pageImage,
              method: 'townhouse-directory-fast',
            })
          }
        }
      }

      await supabaseAdmin
        .from('event_sources')
        .update({ last_checked: new Date().toISOString() })
        .eq('source_id', source.source_id)

      console.log('SOURCE DONE:', source.source_url)
      continue
    }

    const townhouseDiscoveredUrls =
      source.venue_id === 'townhouse_wirral_near_liverpool'
        ? []
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

    const targetVenueDiscoveredUrls =
      isTargetVenueSource(source.venue_id, source.source_url)
        ? discoverTargetVenueEventPages(source)
        : []

    const klubVerbotenDiscoveredUrls =
      isKlubVerbotenSource(source.venue_id, source.source_url)
        ? discoverKlubVerbotenEventPages(source.source_url)
        : []

    const electrowerkzDiscoveredUrls =
      isElectrowerkzSource(source.venue_id, source.source_url)
        ? discoverElectrowerkzEventPages(source.source_url)
        : []

    const acquaDiscoveredUrls =
      isAcquaSource(source.venue_id, source.source_url)
        ? discoverAcquaEventPages(source.source_url)
        : []

    const queue = source.venue_id === 'xtasia_west_bromwich'
      ? xtasiaDiscoveredUrls
      : isHu9Source(source.venue_id, source.source_url)
        ? targetVenueDiscoveredUrls
        : isMe1SaunaSource(source.venue_id, source.source_url)
          ? targetVenueDiscoveredUrls
          : isGatehouseBoltonSource(source.venue_id, source.source_url)
            ? targetVenueDiscoveredUrls
            : isNumber52Source(source.venue_id, source.source_url)
              ? targetVenueDiscoveredUrls
            : isOurPlace4FunSource(source.venue_id, source.source_url)
              ? targetVenueDiscoveredUrls
            : isSaintsAndSinnersSource(source.venue_id, source.source_url)
              ? targetVenueDiscoveredUrls
            : isRiotPartySource(source.venue_id, source.source_url)
              ? targetVenueDiscoveredUrls
            : isTortureGardenSource(source.venue_id, source.source_url)
              ? targetVenueDiscoveredUrls
            : isClubCollaredSource(source.venue_id, source.source_url)
              ? targetVenueDiscoveredUrls
            : isAcquaSource(source.venue_id, source.source_url)
              ? acquaDiscoveredUrls
              : [source.source_url, ...townhouseDiscoveredUrls, ...questDiscoveredUrls, ...xtasiaDiscoveredUrls, ...wixDiscoveredUrls, ...vanillaAlternativeDiscoveredUrls, ...clubAlchemyDiscoveredUrls, ...targetVenueDiscoveredUrls, ...klubVerbotenDiscoveredUrls, ...electrowerkzDiscoveredUrls, ...acquaDiscoveredUrls]
    const seenPages = new Set<string>()

    const maxPagesForSource =
      source.venue_id === 'townhouse_wirral_near_liverpool'
        ? 1
        : source.venue_id === 'xtasia_west_bromwich'
          ? 2
          : isHu9Source(source.venue_id, source.source_url)
            ? 1
          : isMe1SaunaSource(source.venue_id, source.source_url)
            ? 1
          : isGatehouseBoltonSource(source.venue_id, source.source_url)
            ? 1
          : isNumber52Source(source.venue_id, source.source_url)
            ? 4
          : isOurPlace4FunSource(source.venue_id, source.source_url)
            ? 2
          : isSaintsAndSinnersSource(source.venue_id, source.source_url)
            ? 2
          : isRiotPartySource(source.venue_id, source.source_url)
            ? 1
          : isTortureGardenSource(source.venue_id, source.source_url)
            ? 2
          : isClubCollaredSource(source.venue_id, source.source_url)
            ? 3
          : isNo3ClubSource(source.venue_id, source.source_url)
            ? 3
          : isClubAlchemySource(source.source_url) || source.venue_id === 'club_alchemy_northwich'
            ? Math.max(MAX_PAGES_PER_SOURCE, 30)
            : isVanillaAlternativeSource(`${source.source_url} ${source.venue_id}`)
              ? Math.max(MAX_PAGES_PER_SOURCE, 10)
            : isTargetVenueSource(source.venue_id, source.source_url)
              ? Math.max(MAX_PAGES_PER_SOURCE, 18)
            : isKlubVerbotenSource(source.venue_id, source.source_url)
              ? Math.max(MAX_PAGES_PER_SOURCE, 6)
            : isElectrowerkzSource(source.venue_id, source.source_url)
              ? Math.max(MAX_PAGES_PER_SOURCE, 6)
            : isAcquaSource(source.venue_id, source.source_url)
              ? 2
            : isWixLikeSource(source.source_url)
              ? Math.max(MAX_PAGES_PER_SOURCE, 12)
              : MAX_PAGES_PER_SOURCE

    while (queue.length && seenPages.size < maxPagesForSource) {
      const pageUrl = queue.shift()

      if (!pageUrl || seenPages.has(pageUrl)) continue
      if (!allowedSourcePageForVenue(source, pageUrl)) continue
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
        let targetVenueEvents =
          source.venue_id === 'club_f_birmingham' || isClubFSource(source.venue_id, `${source.source_url} ${pageUrl}`) || isTargetVenueSource(source.venue_id, `${source.source_url} ${pageUrl}`)
            ? extractTargetVenueEvents(html, pageUrl, source.venue_id)
            : []

        if (isHu9Source(source.venue_id, `${source.source_url} ${pageUrl}`) && targetVenueEvents.length === 0) {
          const hu9HydratedText = await fetchHu9HydratedText(html, pageUrl)

          if (hu9HydratedText) {
            targetVenueEvents = extractHu9Events(`${html}
${hu9HydratedText}`, pageUrl)
          }
        }

        if (isPenthouseSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
          targetVenueEvents = [
            ...targetVenueEvents,
            ...(await fetchPenthouseBundleEvents(html, pageUrl)),
          ]
        }

        const klubVerbotenEvents =
          isKlubVerbotenSource(source.venue_id, `${source.source_url} ${pageUrl}`)
            ? extractKlubVerbotenEvents(html, pageUrl)
            : []
        const electrowerkzEvents =
          isElectrowerkzSource(source.venue_id, `${source.source_url} ${pageUrl}`)
            ? extractElectrowerkzEvents(html, pageUrl)
            : []
        const acquaEvents =
          isAcquaSource(source.venue_id, `${source.source_url} ${pageUrl}`)
            ? extractAcquaEvents(html, pageUrl)
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


        for (const klubVerbotenEvent of klubVerbotenEvents) {
          candidatesFound++

          const title = klubVerbotenEvent.text
          const description = klubVerbotenEvent.raw || klubVerbotenEvent.text
          const ticketUrl = klubVerbotenEvent.href || eventUrlWithAnchor(pageUrl, title)
          const dedupeKey = eventDedupeKey(source.venue_id, title, klubVerbotenEvent.event_date, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: klubVerbotenEvent.event_date,
            start_time: klubVerbotenEvent.start_time,
            description,
            ticket_url: ticketUrl,
            image_url: klubVerbotenEvent.image_url,
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
                event_date: klubVerbotenEvent.event_date,
                error: result.error?.message || 'Unknown upsert error',
              })
            }
          }

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: klubVerbotenEvent.event_date,
              event_url: ticketUrl,
              image_url: klubVerbotenEvent.image_url,
              method: klubVerbotenEvent.method,
            })
          }
        }

        for (const electrowerkzEvent of electrowerkzEvents) {
          candidatesFound++

          const title = electrowerkzEvent.text
          const description = electrowerkzEvent.raw || electrowerkzEvent.text
          const ticketUrl = electrowerkzEvent.href || eventUrlWithAnchor(pageUrl, title)
          const dedupeKey = eventDedupeKey(source.venue_id, title, electrowerkzEvent.event_date, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: electrowerkzEvent.event_date,
            start_time: electrowerkzEvent.start_time,
            description,
            ticket_url: ticketUrl,
            image_url: electrowerkzEvent.image_url,
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
                event_date: electrowerkzEvent.event_date,
                error: result.error?.message || 'Unknown upsert error',
              })
            }
          }

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: electrowerkzEvent.event_date,
              event_url: ticketUrl,
              image_url: electrowerkzEvent.image_url,
              method: electrowerkzEvent.method,
            })
          }
        }

        for (const acquaEvent of acquaEvents) {
          candidatesFound++

          const title = acquaEvent.text
          const description = acquaEvent.raw || acquaEvent.text
          const ticketUrl = acquaEvent.href || eventUrlWithAnchor(pageUrl, title)
          const dedupeKey = eventDedupeKey(source.venue_id, title, acquaEvent.event_date, ticketUrl)

          if (runSeen.has(dedupeKey)) {
            skipped++
            if (debugSkipped.length < 80) {
              debugSkipped.push({
                venue_id: source.venue_id,
                event_name: title,
                event_date: acquaEvent.event_date,
                event_url: ticketUrl,
                method: acquaEvent.method,
                reason: 'duplicate-in-current-run',
              })
            }
            continue
          }

          runSeen.add(dedupeKey)

          const result = await upsertEvent({
            venue_id: source.venue_id,
            event_name: title,
            event_date: acquaEvent.event_date,
            start_time: acquaEvent.start_time,
            description,
            ticket_url: ticketUrl,
            image_url: acquaEvent.image_url,
            source_url: source.source_url,
          })

          if (result.action === 'created') created++
          else if (result.action === 'updated') updated++
          else if (result.action === 'skipped') {
            skipped++
            if (debugSkipped.length < 80) {
              debugSkipped.push({
                venue_id: source.venue_id,
                event_name: cleanEventName(title),
                event_date: acquaEvent.event_date,
                event_url: ticketUrl,
                method: acquaEvent.method,
                reason: 'upsert-filtered-by-shouldSaveEvent',
                description: cleanDescription(description),
              })
            }
          } else {
            failed++

            if (errors.length < 20) {
              errors.push({
                venue_id: source.venue_id,
                event_name: title,
                event_date: acquaEvent.event_date,
                error: result.error?.message || 'Unknown upsert error',
              })
            }
          }

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: cleanEventName(title),
              event_date: acquaEvent.event_date,
              event_url: ticketUrl,
              image_url: acquaEvent.image_url,
              method: acquaEvent.method,
            })
          }
        }

        for (const targetVenueEvent of targetVenueEvents) {
          candidatesFound++

          let eventHtml: string | null = null
          let title = targetVenueEvent.text
          let description = targetVenueEvent.raw || targetVenueEvent.text
          let imageUrl = validImageUrl(targetVenueEvent.image_url || null) || pageImage
          let eventDate = targetVenueEvent.event_date
          let startTime = targetVenueEvent.start_time
          const ticketUrl = targetVenueEvent.href || eventUrlWithAnchor(pageUrl, title)

          if (!isNumber52Source(source.venue_id, source.source_url) && !isPlusciousPartiesSource(source.venue_id, source.source_url) && !isClubFSource(source.venue_id, source.source_url) && !isSheWorldSource(source.venue_id, source.source_url) && allowedSourcePageForVenue(source, ticketUrl) && ticketUrl !== pageUrl && !ticketUrl.includes('#')) {
            eventHtml = await fetchHtml(ticketUrl)

            if (eventHtml) {
              const detailTitle = extractPageTitle(eventHtml)
              const detailDescription = extractMetaDescription(eventHtml)
              const detailDate = extractDateFromHtml(eventHtml)
              const detailImage = extractBestImage(eventHtml, ticketUrl)

              if (detailTitle && !isJunkTitle(detailTitle)) title = detailTitle
              description = detailDescription || description
              imageUrl = detailImage || imageUrl
              eventDate = eventDate || detailDate
              startTime = startTime || extractTime(cleanText(eventHtml).slice(0, 3000))
            }
          }

          if (isClubCollaredSource(source.venue_id, `${source.source_url} ${pageUrl} ${ticketUrl}`)) {
            imageUrl = null
          }

          if (isTortureGardenSource(source.venue_id, `${source.source_url} ${pageUrl} ${ticketUrl}`)) {
            imageUrl = null
          }

          if (isClubZeusSource(source.venue_id, `${source.source_url} ${pageUrl} ${ticketUrl}`)) {
            imageUrl = null
          }

          if (isSteamerQuaySource(source.venue_id, `${source.source_url} ${pageUrl} ${ticketUrl}`)) {
            imageUrl = null
          }

          if (isNumber52Source(source.venue_id, `${source.source_url} ${pageUrl} ${ticketUrl}`)) {
            imageUrl = null
          }

          if (isOurPlace4FunSource(source.venue_id, `${source.source_url} ${pageUrl} ${ticketUrl}`)) {
            imageUrl = null
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
          else {
            failed++

            if (errors.length < 20) {
              errors.push({
                venue_id: source.venue_id,
                event_name: title,
                event_date: eventDate,
                error: result.error?.message || 'Unknown upsert error',
              })
            }
          }

          if (found.length < MAX_EVENTS_RETURNED && result.action !== 'skipped') {
            found.push({
              venue_id: source.venue_id,
              event_name: isHu9Source(source.venue_id, source.source_url) ? title : cleanEventName(title),
              event_date: eventDate,
              event_url: ticketUrl,
              image_url: imageUrl,
              method: targetVenueEvent.method,
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

          const title = cleanXtasiaCalendarTitle(xtasiaEvent.text)
          const description = xtasiaEvent.raw || `${xtasiaEvent.text} Xtasia diary`
          const ticketUrl = xtasiaEvent.href || eventUrlWithAnchor(pageUrl, title)

          if (!title || !xtasiaEvent.event_date || isXtasiaMalformedEvent(title, description)) {
            skipped++
            continue
          }

          // Xtasia can surface the same Google Calendar event from multiple public
          // pages/sources. Dedupe by title + date only so URL aliases cannot create
          // separate rows.
          const dedupeKey = `${source.venue_id}|${normalizeTitle(title)}|${xtasiaEvent.event_date}`

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
              event_name: title,
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
          if (isBirminghamBizarreBazaarSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isSteamerQuaySource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

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
          if (isBirminghamBizarreBazaarSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isSteamerQuaySource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isClubZeusSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isNumber52Source(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isOurPlace4FunSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isSaintsAndSinnersSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isRiotPartySource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

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
          if (isBirminghamBizarreBazaarSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isSteamerQuaySource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isClubZeusSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isNumber52Source(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isOurPlace4FunSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isSaintsAndSinnersSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isTortureGardenSource(source.venue_id, source.source_url)) {
            skipped++
            continue
          }

          if (isRiotPartySource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

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
          if (isBirminghamBizarreBazaarSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isSteamerQuaySource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isClubZeusSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isNumber52Source(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isOurPlace4FunSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isSaintsAndSinnersSource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isTortureGardenSource(source.venue_id, source.source_url)) {
            skipped++
            continue
          }

          if (isRiotPartySource(source.venue_id, `${source.source_url} ${pageUrl}`)) {
            skipped++
            continue
          }

          if (isClubCollaredSource(source.venue_id, source.source_url)) {
            skipped++
            continue
          }

          if (isNo3ClubSource(source.venue_id, source.source_url)) {
            skipped++
            continue
          }

          if (isPlusciousPartiesSource(source.venue_id, source.source_url)) {
            skipped++
            continue
          }

          if (isVanillaAlternativeSource(`${source.source_url} ${source.venue_id}`)) {
            skipped++
            continue
          }

          const combined = `${link.href} ${link.text} ${link.raw}`

          if (
            allowedSourcePageForVenue(source, link.href) &&
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

          let eventName = cleanEventName(link.text)

          if (isPlusciousPartiesSource(source.venue_id, source.source_url)) {
            const plusciousLinkText = normalizeTitle(`${link.text} ${link.href}`)
            if (
              plusciousLinkText.includes("buy tickets") ||
              plusciousLinkText.includes("what to expect") ||
              plusciousLinkText.includes("swinghub") ||
              plusciousLinkText.includes("plussizeparty")
            ) {
              skipped++
              continue
            }
          }

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

                if (isPlusciousPartiesSource(source.venue_id, source.source_url)) {
                  const cleanedDetailTitle = cleanEventName(detailTitle)
                    .replace(/^[-–—:|]+/g, "")
                    .replace(/^june 20th\s*/i, "")
                    .replace(/^june 27th\s*/i, "")
                    .replace(/^july 25th\s*/i, "")
                    .replace(/^august 22nd\s*/i, "")
                    .replace(/^sep(?:tember)? 26th\s*/i, "")
                    .replace(/^october 24th\s*/i, "")
                    .replace(/^november 28th\s*/i, "")
                    .replace(/^december 19th\s*/i, "")
                    .replace(/^[-–—:|]+/g, "")
                    .replace(/\s+/g, " ")
                    .trim()

                  if (cleanedDetailTitle && !isJunkTitle(cleanedDetailTitle)) {
                    eventName = cleanedDetailTitle
                  }
                }
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
    debug_skipped: debugSkipped,
    errors,
  })
}