import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function cleanHtmlToText(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function absoluteUrl(base: string, href: string | null) {
  if (!href) return null

  try {
    return new URL(href, base).toString()
  } catch {
    return null
  }
}

function normalisePostcode(postcode: string) {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, '')

  if (cleaned.length < 5) return postcode.toUpperCase()

  return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`
}

function looksLikeCssColour(value: string) {
  const cleaned = value.toUpperCase().replace(/\s+/g, '')

  const cssLike = [
    'F4F1FA',
    'F8F9FA',
    'F7E5FF',
    'E1E8ED',
    'B2B2BE',
    'A5A7AB',
    'D1D1DB',
    'I4C5AD',
    'K4N7UT',
    'V9K0LL',
  ]

  if (cssLike.includes(cleaned)) return true

  return false
}

function findPostcodes(text: string) {
  const matches = text.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/gi)

  if (!matches) return []

  return [
    ...new Set(
      matches
        .map((match) => normalisePostcode(match))
        .filter((postcode) => !looksLikeCssColour(postcode))
    ),
  ]
}

function scorePostcodeContext(text: string, postcode: string) {
  const normalised = postcode.replace(/\s+/g, '')
  const index = text.toUpperCase().replace(/\s+/g, '').indexOf(normalised)

  if (index === -1) return 0

  const lowerText = text.toLowerCase()
  const lowerPostcode = postcode.toLowerCase()
  const rawIndex = lowerText.indexOf(lowerPostcode)

  const start = Math.max(0, rawIndex - 250)
  const end = Math.min(text.length, rawIndex + 250)
  const context = lowerText.slice(start, end)

  let score = 1

  const positiveWords = [
    'address',
    'contact',
    'find us',
    'location',
    'directions',
    'visit us',
    'where we are',
    'postcode',
    'post code',
    'map',
    'google maps',
  ]

  for (const word of positiveWords) {
    if (context.includes(word)) score += 3
  }

  const negativeWords = [
    'color',
    'colour',
    'background',
    'border',
    'style',
    'css',
    'font',
    'svg',
    'path',
    'fill',
    'stroke',
  ]

  for (const word of negativeWords) {
    if (context.includes(word)) score -= 5
  }

  return score
}

function bestPostcodeFromText(text: string) {
  const postcodes = findPostcodes(text)

  if (postcodes.length === 0) return null

  const ranked = postcodes
    .map((postcode) => ({
      postcode,
      score: scorePostcodeContext(text, postcode),
    }))
    .sort((a, b) => b.score - a.score)

  if (ranked[0].score <= 0) return null

  return ranked[0].postcode
}

function extractUsefulLinks(baseUrl: string, html: string) {
  const links = new Set<string>()

  const wantedPathParts = [
    'contact',
    'contact-us',
    'find-us',
    'findus',
    'location',
    'locations',
    'directions',
    'visit',
    'about',
  ]

  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi

  let match

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    const label = cleanHtmlToText(match[2]).toLowerCase()
    const combined = `${href} ${label}`.toLowerCase()

    const useful = wantedPathParts.some((part) => combined.includes(part))

    if (!useful) continue

    const url = absoluteUrl(baseUrl, href)

    if (url) links.add(url)
  }

  return [...links].slice(0, 8)
}

function extractGoogleMapsLinks(baseUrl: string, html: string) {
  const urls = new Set<string>()

  const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi

  let match

  while ((match = iframeRegex.exec(html)) !== null) {
    const src = match[1]
    const url = absoluteUrl(baseUrl, src)

    if (url && url.toLowerCase().includes('google')) {
      urls.add(url)
    }
  }

  const hrefRegex = /href=["']([^"']*(google\.com\/maps|maps\.app\.goo\.gl)[^"']*)["']/gi

  while ((match = hrefRegex.exec(html)) !== null) {
    const url = absoluteUrl(baseUrl, match[1])

    if (url) urls.add(url)
  }

  return [...urls].slice(0, 5)
}

async function fetchHtml(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SceneFinderBot/1.0',
      },
    })

    if (!response.ok) return null

    return await response.text()
  } catch {
    return null
  }
}

async function validatePostcodeWithPostcodesIo(postcode: string) {
  try {
    const cleaned = postcode.toUpperCase().replace(/\s+/g, '')

    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`
    )

    const data = await response.json()

    if (!response.ok || data.status !== 200 || !data.result) return null

    return {
      postcode: data.result.postcode as string,
      latitude: data.result.latitude as number,
      longitude: data.result.longitude as number,
    }
  } catch {
    return null
  }
}

async function scrapePostcodeFromUrl(url: string) {
  const html = await fetchHtml(url)

  if (!html) {
    return {
      postcode: null,
      latitude: null,
      longitude: null,
      checked_urls: [url],
      reason: 'page fetch failed',
    }
  }

  const urlsToCheck = new Set<string>()

  urlsToCheck.add(url)

  const standardPaths = [
    '/contact',
    '/contact-us',
    '/find-us',
    '/findus',
    '/location',
    '/locations',
    '/directions',
    '/visit-us',
    '/about',
  ]

  for (const path of standardPaths) {
    const absolute = absoluteUrl(url, path)
    if (absolute) urlsToCheck.add(absolute)
  }

  for (const usefulLink of extractUsefulLinks(url, html)) {
    urlsToCheck.add(usefulLink)
  }

  const checkedUrls: string[] = []
  const candidates: {
    postcode: string
    url: string
    score: number
  }[] = []

  for (const pageUrl of [...urlsToCheck].slice(0, 15)) {
    const pageHtml = pageUrl === url ? html : await fetchHtml(pageUrl)

    checkedUrls.push(pageUrl)

    if (!pageHtml) continue

    const text = cleanHtmlToText(pageHtml)
    const postcodes = findPostcodes(text)

    for (const postcode of postcodes) {
      candidates.push({
        postcode,
        url: pageUrl,
        score: scorePostcodeContext(text, postcode),
      })
    }

    for (const mapsUrl of extractGoogleMapsLinks(pageUrl, pageHtml)) {
      const decoded = decodeURIComponent(mapsUrl)
      const mapsPostcodes = findPostcodes(decoded)

      for (const postcode of mapsPostcodes) {
        candidates.push({
          postcode,
          url: mapsUrl,
          score: 20,
        })
      }
    }
  }

  const uniqueCandidates = [
    ...new Map(
      candidates
        .filter((candidate) => candidate.score > 0)
        .map((candidate) => [candidate.postcode, candidate])
    ).values(),
  ].sort((a, b) => b.score - a.score)

  for (const candidate of uniqueCandidates) {
    const valid = await validatePostcodeWithPostcodesIo(candidate.postcode)

    if (valid) {
      return {
        postcode: valid.postcode,
        latitude: valid.latitude,
        longitude: valid.longitude,
        checked_urls: checkedUrls,
        source_url: candidate.url,
        reason: 'validated',
      }
    }
  }

  return {
    postcode: null,
    latitude: null,
    longitude: null,
    checked_urls: checkedUrls,
    candidates: uniqueCandidates.slice(0, 5),
    reason: uniqueCandidates.length
      ? 'postcode candidates found but none validated'
      : 'no postcode candidates found',
  }
}

export async function GET() {
  const { data: venues, error } = await supabaseAdmin
    .from('venues')
    .select('venue_id, name, website, postcode, latitude, longitude')
    .not('website', 'is', null)
    .or('postcode.is.null,latitude.is.null,longitude.is.null')
    .limit(30)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  let checked = 0
  let updated = 0
  let noPostcodeFound = 0
  let failed = 0

  const results = []

  for (const venue of venues || []) {
    checked++

    try {
      const result = await scrapePostcodeFromUrl(venue.website)

      if (!result.postcode || !result.latitude || !result.longitude) {
        noPostcodeFound++

        results.push({
          venue_id: venue.venue_id,
          name: venue.name,
          status: 'no valid postcode found',
          reason: result.reason,
          candidates: result.candidates,
          checked_urls: result.checked_urls,
        })

        continue
      }

      const { error: updateError } = await supabaseAdmin
        .from('venues')
        .update({
          postcode: result.postcode,
          latitude: result.latitude,
          longitude: result.longitude,
        })
        .eq('venue_id', venue.venue_id)

      if (updateError) {
        failed++

        results.push({
          venue_id: venue.venue_id,
          name: venue.name,
          status: 'update failed',
          postcode: result.postcode,
          error: updateError.message,
        })

        continue
      }

      updated++

      results.push({
        venue_id: venue.venue_id,
        name: venue.name,
        status: 'updated',
        postcode: result.postcode,
        latitude: result.latitude,
        longitude: result.longitude,
        source_url: result.source_url,
      })
    } catch {
      failed++

      results.push({
        venue_id: venue.venue_id,
        name: venue.name,
        status: 'failed',
      })
    }
  }

  return Response.json({
    checked,
    updated,
    no_valid_postcode_found: noPostcodeFound,
    failed,
    results,
  })
}