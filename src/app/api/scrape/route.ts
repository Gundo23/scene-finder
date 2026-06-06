import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_SOURCES = 80
const MAX_PAGES_PER_SOURCE = 8
const MAX_EVENTS_RETURNED = 150
const FETCH_TIMEOUT_MS = 10000

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

    if (full.includes('google.com/calendar')) return true
    if (full.includes('action=template')) return true
    if (full.includes('ical=1')) return true
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


async function fetchHtml(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    console.log('SCRAPING:', url)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SceneFinderBot/4.0; +https://scene-finder.local)',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.log('FAILED:', response.status, url)
      return null
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      console.log('SKIPPED NON-HTML:', url)
      return null
    }

    return await response.text()
  } catch (err: any) {
    clearTimeout(timeout)
    console.log('FETCH ERROR:', url, err?.name || err?.message || 'Unknown error')
    return null
  }
}


async function fetchText(url: string, accept = 'text/html,application/xhtml+xml,application/xml,text/xml,application/json') {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SceneFinderBot/4.0; +https://scene-finder.local)',
        Accept: accept,
      },
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (!response.ok) return null

    return await response.text()
  } catch {
    clearTimeout(timeout)
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

    const townhouseDiscoveredUrls =
      source.venue_id === 'townhouse_wirral_near_liverpool'
        ? await discoverTownhouseEventUrls(source.source_url)
        : []

    const questDiscoveredUrls =
      source.venue_id === 'quest_leeds_leeds'
        ? [absoluteUrl(source.source_url, '/upcoming-events/')].filter(Boolean) as string[]
        : []

    const wixDiscoveredUrls =
      isWixLikeSource(source.source_url) || source.collection_method === 'User Submission'
        ? discoverWixEventPages(source.source_url)
        : []

    const queue = [source.source_url, ...townhouseDiscoveredUrls, ...questDiscoveredUrls, ...wixDiscoveredUrls]
    const seenPages = new Set<string>()

    const maxPagesForSource =
      source.venue_id === 'townhouse_wirral_near_liverpool'
        ? Math.max(MAX_PAGES_PER_SOURCE, 25)
        : isWixLikeSource(source.source_url)
          ? Math.max(MAX_PAGES_PER_SOURCE, 12)
          : MAX_PAGES_PER_SOURCE

    while (queue.length && seenPages.size < maxPagesForSource) {
      const pageUrl = queue.shift()

      if (!pageUrl || seenPages.has(pageUrl)) continue
      if (!sameDomain(source.source_url, pageUrl)) continue
      if (isJunkUrl(pageUrl)) continue

      seenPages.add(pageUrl)
      checkedPages++

      const html = await fetchHtml(pageUrl)

      if (!html) {
        failed++
        timedOutOrEmpty++
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
        const wixTileEvents =
          isWixLikeSource(`${source.source_url} ${html}`)
            ? extractWixCalendarTileEvents(html, pageUrl)
            : []
        const links = extractLinks(html, pageUrl)

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
          const combined = `${link.href} ${link.text} ${link.raw}`

          if (
            sameDomain(source.source_url, link.href) &&
            looksLikeUsefulPage(combined) &&
            !isJunkUrl(link.href) &&
            !seenPages.has(link.href) &&
            !queue.includes(link.href) &&
            queue.length + seenPages.size < MAX_PAGES_PER_SOURCE
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

          if (sameDomain(source.source_url, link.href)) {
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
    found,
    errors,
  })
}