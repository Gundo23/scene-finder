import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalisePostcode(postcode: string) {
  return postcode.toUpperCase().replace(/\s+/g, '').trim()
}

export async function GET() {
  const { data: venues, error } = await supabaseAdmin
    .from('venues')
    .select('venue_id, name, postcode, latitude, longitude')
    .not('postcode', 'is', null)
    .is('latitude', null)
    .is('longitude', null)
    .limit(50)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  let checked = 0
  let updated = 0
  let invalid = 0
  let failed = 0

  const results = []

  for (const venue of venues || []) {
    checked++

    try {
      const postcode = normalisePostcode(venue.postcode)

      const response = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
      )

      const data = await response.json()

      if (!response.ok || data.status !== 200 || !data.result) {
        invalid++

        results.push({
          venue_id: venue.venue_id,
          name: venue.name,
          postcode: venue.postcode,
          status: 'invalid postcode',
        })

        continue
      }

      const latitude = data.result.latitude
      const longitude = data.result.longitude
      const formattedPostcode = data.result.postcode

      const { error: updateError } = await supabaseAdmin
        .from('venues')
        .update({
          postcode: formattedPostcode,
          latitude,
          longitude,
        })
        .eq('venue_id', venue.venue_id)

      if (updateError) {
        failed++

        results.push({
          venue_id: venue.venue_id,
          name: venue.name,
          postcode: venue.postcode,
          status: 'update failed',
          error: updateError.message,
        })

        continue
      }

      updated++

      results.push({
        venue_id: venue.venue_id,
        name: venue.name,
        postcode: formattedPostcode,
        latitude,
        longitude,
        status: 'updated',
      })
    } catch {
      failed++

      results.push({
        venue_id: venue.venue_id,
        name: venue.name,
        postcode: venue.postcode,
        status: 'failed',
      })
    }
  }

  return Response.json({
    checked,
    updated,
    invalid,
    failed,
    results,
  })
}