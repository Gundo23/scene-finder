require('dotenv').config()

const axios = require('axios')
const { createClient } = require('@supabase/supabase-js')
const { createObjectCsvWriter } = require('csv-writer')

const keywords = require('./keywords')
const locations = require('./locations')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BRAVE_API_KEY = process.env.BRAVE_API_KEY

// SF14.2: stronger junk blocking, still capped at 50 queries
const MAX_QUERIES = 50
const RESULTS_PER_QUERY = 10
const MIN_CONFIDENCE = 45
const PAGE_TIMEOUT_MS = 12000
const FETCH_DELAY_MS = 500
const QUERY_DELAY_MS = 1200

const positiveSignals = [
  'membership',
  'members only',
  'private members',
  'events',
  'upcoming events',
  'club nights',
  'tickets',
  'dress code',
  'couples',
  'single ladies',
  'lifestyle',
  'swingers',
  'swinging',
  'fetish',
  'bdsm',
  'kink',
  'sauna',
  'party',
  'venue',
  'club',
  'book now',
  'calendar',
  'what’s on',
  "what's on",
  'whats on',
  'opening times',
  'opening hours',
  'join us',
  'guest list',
  'couples night',
  'social night',
]

const negativeSignals = [
  'directory',
  'guide',
  'review',
  'article',
  'blog',
  'forum',
  'profiles',
  'local swingers',
  'dating',
  'escort',
  'escorts',
  'porn',
  'onlyfans',
  'webcam',
  'reddit',
  'tripadvisor',
  'yelp',
  'indeed',
  'jobs',
  'wikipedia',
  'news',
  'wanderlust',
  'swinging heaven',
  'adult party place',
  'classifieds',
  'advertise with us',
  'submit your listing',
]

const badDomains = [
  'wanderlust',
  'swingingheaven',
  'adultpartyplace',
  'reddit',
  'facebook',
  'instagram',
  'tripadvisor',
  'yelp',
  'indeed',
  'wikipedia',
  'x.com',
  'twitter',
  'linkedin',
  'youtube',
  'tiktok',
  'virginactive',
  'davidlloyd',
  'nuffieldhealth',
  'puregym',
  'thegymgroup',
  'anytimefitness',
  'better.org.uk',
  'liverpool.gov.uk',
  'activenottingham',
]

// Hard rejects are discovery/listing/article/profile sources, not venue websites.
const hardRejectDomains = [
  'fetish.com',
  'onlymeets.co.uk',
  'headfirstbristol.co.uk',
  'swingersplay.com',
  'londonbusinessnews.com',
  'swingingheaven.co.uk',
  'adultpartyplace.com',
  'fabswingers.com',
  'fabguys.com',
  'spicyreviews.com',
  'swingershelp.com',
  'swinging.co.uk',
  'joyclub.com',
  'swingersclubreviews.co.uk',
  'clubbookers.com',
  'welcometosheffield.co.uk',
  'thelivewelldirectory.com',
  'lifestyles.liverpool.gov.uk',
  'virginactive.co.uk',
  'davidlloyd.co.uk',
  'nuffieldhealth.com',
  'activenottingham.com',
  'better.org.uk',
]

const junkUrlParts = [
  '/directory',
  '/directories',
  '/blog',
  '/guide',
  '/review',
  '/reviews',
  '/article',
  '/articles',
  '/forum',
  '/forums',
  '/profiles',
  '/profile',
  '/classified',
  '/classifieds',
  '/news',
  '/locations/',
  '/party_places/',
  '/swingers-in-',
  '/best-',
  '/top-',
  '/venue-listings',
  '/places',
  '/personals',
  '/dating',
  '/tag/',
  '/category/',
  '/gym',
  '/gyms',
  '/fitness',
  '/health-club',
  '/health-clubs',
  '/leisure-centre',
  '/leisure-centres',
  '/nightlife',
  '/things-to-do',
  '/whats-on',
]

const junkTitleTerms = [
  'gym',
  'fitness',
  'health club',
  'leisure centre',
  'spa day',
  'wellbeing',
  'personal training',
  'swimming pool',
  'city council',
  'directory',
  'reviews',
  'review',
  'best swingers clubs',
  'top swingers clubs',
  'nightlife',
  'guide',
  'things to do',
  'venue listings',
  'local swingers',
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cleanUrl(url) {
  try {
    const parsed = new URL(url)
    parsed.hash = ''
    parsed.search = ''
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return url
  }
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

function getHomepageUrl(url) {
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.hostname.replace(/^www\./, '')}`.replace(/\/$/, '')
  } catch {
    return cleanUrl(url)
  }
}

function guessName(title, url) {
  const cleanedTitle = String(title || '')
    .replace(/\|.*$/g, '')
    .replace(/ - .*$/g, '')
    .replace(/Home.*$/gi, '')
    .replace(/Official Site.*$/gi, '')
    .replace(/Events.*$/gi, '')
    .replace(/What's On.*$/gi, '')
    .trim()

  if (cleanedTitle && cleanedTitle.length >= 3) return cleanedTitle

  const domain = getDomain(url)

  if (domain) {
    return domain
      .replace('.co.uk', '')
      .replace('.org.uk', '')
      .replace('.uk', '')
      .replace('.com', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .trim()
  }

  return url
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function isBadDomain(url) {
  const domain = getDomain(url)
  return badDomains.some((bad) => domain.includes(bad))
}

function isHardRejectDomain(url) {
  const domain = getDomain(url)
  return hardRejectDomains.some((bad) => domain === bad || domain.endsWith(`.${bad}`) || domain.includes(bad))
}

function urlLooksLikeJunk(url) {
  const lower = String(url || '').toLowerCase()
  return junkUrlParts.some((badPath) => lower.includes(badPath))
}

function titleLooksLikeJunk(result) {
  const text = `${result.title || ''} ${result.description || ''}`.toLowerCase()
  return junkTitleTerms.some((term) => text.includes(term))
}

function urlLooksOfficial(url) {
  const domain = getDomain(url)

  if (!domain) return false

  const parts = domain.split('.')
  const namePart = parts[0] || ''

  return (
    domain.endsWith('.co.uk') ||
    domain.endsWith('.org.uk') ||
    domain.endsWith('.uk') ||
    namePart.includes('club') ||
    namePart.includes('sauna') ||
    namePart.includes('party') ||
    namePart.includes('lounge') ||
    namePart.includes('play') ||
    namePart.includes('social') ||
    namePart.includes('events')
  )
}

async function fetchHomepageText(url) {
  try {
    const response = await axios.get(url, {
      timeout: PAGE_TIMEOUT_MS,
      maxRedirects: 5,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SceneFinderScout/2.2',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    return stripHtml(response.data).slice(0, 40000)
  } catch {
    return ''
  }
}

function scoreCandidate(result, query, pageText, website) {
  const searchText = `${result.title || ''} ${result.description || ''} ${result.url || ''} ${query}`.toLowerCase()
  const fullText = `${searchText} ${pageText || ''}`.toLowerCase()
  const url = cleanUrl(website || result.url || '')

  let score = 0
  const matchedPositive = []
  const matchedNegative = []

  for (const signal of positiveSignals) {
    if (fullText.includes(signal)) {
      score += 10
      matchedPositive.push(signal)
    }
  }

  for (const signal of negativeSignals) {
    if (fullText.includes(signal)) {
      score -= 15
      matchedNegative.push(signal)
    }
  }

  if (urlLooksOfficial(url)) score += 20
  if (fullText.includes('membership') && fullText.includes('events')) score += 15
  if (fullText.includes('dress code') && fullText.includes('club')) score += 15
  if (fullText.includes('tickets') && fullText.includes('upcoming')) score += 15
  if (fullText.includes('private members') && fullText.includes('couples')) score += 15
  if (fullText.includes('address') && fullText.includes('opening')) score += 8
  if (fullText.includes('contact') && fullText.includes('membership')) score += 8

  if (fullText.includes('fitness') || fullText.includes('personal training') || fullText.includes('swimming pool')) score -= 35
  if (fullText.includes('city council') || fullText.includes('leisure centre')) score -= 35
  if (fullText.includes('directory') && fullText.includes('listing')) score -= 30

  if (!pageText || pageText.length < 300) score -= 15

  score = Math.max(0, Math.min(100, score))

  return {
    score,
    matchedPositive: [...new Set(matchedPositive)].slice(0, 12),
    matchedNegative: [...new Set(matchedNegative)].slice(0, 12),
  }
}

async function braveSearch(query) {
  const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
    headers: {
      Accept: 'application/json',
      'X-Subscription-Token': BRAVE_API_KEY,
    },
    params: {
      q: query,
      count: RESULTS_PER_QUERY,
      country: 'GB',
      search_lang: 'en',
      safesearch: 'off',
    },
  })

  return response.data?.web?.results || []
}

async function getExistingUrlFootprints() {
  const urls = new Set()
  const domains = new Set()

  const { data: venues, error: venueError } = await supabase
    .from('venues')
    .select('website, source_url')

  if (venueError) {
    console.error('Could not load existing venues:', venueError.message)
  }

  for (const venue of venues || []) {
    for (const value of [venue.website, venue.source_url]) {
      if (!value) continue
      const clean = cleanUrl(value)
      urls.add(clean)
      domains.add(getDomain(clean))
    }
  }

  const { data: candidates, error: candidateError } = await supabase
    .from('venue_candidates')
    .select('website')

  if (candidateError) {
    console.error('Could not load existing venue candidates:', candidateError.message)
  }

  for (const candidate of candidates || []) {
    if (!candidate.website) continue
    const clean = cleanUrl(candidate.website)
    urls.add(clean)
    domains.add(getDomain(clean))
  }

  return { urls, domains }
}

async function saveCandidate(candidate) {
  const { error } = await supabase
    .from('venue_candidates')
    .insert([candidate])

  if (error) {
    console.error('Save failed:', error.message)
    return false
  }

  return true
}

async function main() {
  if (!BRAVE_API_KEY) {
    console.error('Missing BRAVE_API_KEY in .env')
    return
  }

  console.log('')
  console.log('Scene Finder Scout V2.2 starting...')
  console.log('')

  const existing = await getExistingUrlFootprints()

  const queries = []

  for (const keyword of keywords) {
    for (const location of locations) {
      queries.push(`${keyword} ${location}`)
    }
  }

  console.log(`Generated ${queries.length} total queries`)
  console.log(`Running first ${MAX_QUERIES} queries`)
  console.log('')

  const saved = []
  const seenUrls = new Set()
  const seenDomains = new Set()

  for (const query of queries.slice(0, MAX_QUERIES)) {
    console.log(`Searching: ${query}`)

    try {
      const results = await braveSearch(query)

      for (const result of results) {
        const rawUrl = cleanUrl(result.url)
        const website = getHomepageUrl(rawUrl)
        const domain = getDomain(website)

        if (!rawUrl || !website || !domain) continue

        if (isHardRejectDomain(rawUrl)) {
          console.log(`  Rejected hard domain: ${rawUrl}`)
          continue
        }

        if (isBadDomain(rawUrl)) {
          console.log(`  Rejected bad domain: ${rawUrl}`)
          continue
        }

        if (urlLooksLikeJunk(rawUrl)) {
          console.log(`  Rejected junk URL: ${rawUrl}`)
          continue
        }

        if (titleLooksLikeJunk(result)) {
          console.log(`  Rejected junk title: ${guessName(result.title, rawUrl)}`)
          continue
        }

        if (seenUrls.has(website) || seenDomains.has(domain)) continue
        if (existing.urls.has(website) || existing.domains.has(domain)) continue

        seenUrls.add(website)
        seenDomains.add(domain)

        const pageText = await fetchHomepageText(website)
        const scoreResult = scoreCandidate(result, query, pageText, website)
        const confidence = scoreResult.score

        if (confidence < MIN_CONFIDENCE) {
          console.log(`  Rejected: ${guessName(result.title, website)} (${confidence})`)
          await sleep(FETCH_DELAY_MS)
          continue
        }

        const candidate = {
          name: guessName(result.title, website),
          website,
          location: query.split(' ').slice(-1)[0],
          confidence_score: confidence,
          discovery_query: query,
          discovery_source: 'brave_scout_v2_2',
          status: 'pending',
        }

        const ok = await saveCandidate(candidate)

        if (ok) {
          saved.push({
            ...candidate,
            source_url: rawUrl,
            positive_signals: scoreResult.matchedPositive.join(', '),
            negative_signals: scoreResult.matchedNegative.join(', '),
          })

          console.log(`  Saved: ${candidate.name} (${confidence})`)
          console.log(`    Site: ${candidate.website}`)
          console.log(`    + ${scoreResult.matchedPositive.join(', ')}`)
          if (scoreResult.matchedNegative.length) {
            console.log(`    - ${scoreResult.matchedNegative.join(', ')}`)
          }
        }

        await sleep(FETCH_DELAY_MS)
      }
    } catch (error) {
      console.error(`  Search failed: ${error.response?.data?.message || error.message}`)
    }

    await sleep(QUERY_DELAY_MS)
  }

  const csvWriter = createObjectCsvWriter({
    path: 'scout-results.csv',
    header: [
      { id: 'name', title: 'name' },
      { id: 'website', title: 'website' },
      { id: 'source_url', title: 'source_url' },
      { id: 'location', title: 'location' },
      { id: 'confidence_score', title: 'confidence_score' },
      { id: 'discovery_query', title: 'discovery_query' },
      { id: 'discovery_source', title: 'discovery_source' },
      { id: 'positive_signals', title: 'positive_signals' },
      { id: 'negative_signals', title: 'negative_signals' },
    ],
  })

  await csvWriter.writeRecords(saved)

  console.log('')
  console.log(`Done. Saved ${saved.length} candidates.`)
  console.log('CSV written to scout-results.csv')
}

main()
