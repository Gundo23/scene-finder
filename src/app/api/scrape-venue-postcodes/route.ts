import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function cleanText(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function findPostcode(text: string) {
  const match = text.match(
    /\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/i
  )

  if (!match) return null

  return match[1].toUpperCase().replace(/\s+/g, ' ')
}

async function scrapePostcode(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SceneFinderBot/1.0',
      },
    })

    if (!response.ok) return null

    const html = await response.text()
    const text = cleanText(html)

    return findPostcode(text)
  } catch {
    return null
  }
}

export async function GET() {
  const { data: venues, error } = await supabaseAdmin
    .from('venues')
    .select('venue_id, name, website, postcode')
    .not('website', 'is', null)
    .is('postcode', null)
    .limit(50)

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
      const postcode = await scrapePostcode(venue.website)

      if (!postcode) {
        noPostcodeFound++

        results.push({
          venue_id: venue.venue_id,
          name: venue.name,
          status: 'no postcode found',
        })

        continue
      }

      const { error: updateError } = await supabaseAdmin
        .from('venues')
        .update({ postcode })
        .eq('venue_id', venue.venue_id)

      if (updateError) {
        failed++

        results.push({
          venue_id: venue.venue_id,
          name: venue.name,
          status: 'update failed',
          postcode,
          error: updateError.message,
        })

        continue
      }

      updated++

      results.push({
        venue_id: venue.venue_id,
        name: venue.name,
        status: 'updated',
        postcode,
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
    no_postcode_found: noPostcodeFound,
    failed,
    results,
  })
}