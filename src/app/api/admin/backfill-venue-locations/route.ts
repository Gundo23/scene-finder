import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const UK_REGIONS = new Set([
  'North East',
  'North West',
  'Yorkshire and the Humber',
  'East Midlands',
  'West Midlands',
  'East of England',
  'London',
  'South East',
  'South West',
  'Scotland',
  'Wales',
  'Northern Ireland',
])

function clean(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function compactPostcode(value: unknown) {
  return clean(value).toUpperCase().replace(/\s+/g, '')
}

function canonicalRegion(result: any) {
  const country = clean(result?.country)

  if (country === 'Scotland') return 'Scotland'
  if (country === 'Wales') return 'Wales'
  if (country === 'Northern Ireland') return 'Northern Ireland'

  const region = clean(result?.region)
  return UK_REGIONS.has(region) ? region : ''
}

function authorised(request: Request) {
  const expected = process.env.ADMIN_LOCATION_SECRET || process.env.ADMIN_RESTORE_SECRET
  if (!expected) return false

  const supplied = request.headers.get('x-admin-secret') || ''
  return supplied === expected
}

export async function POST(request: Request) {
  if (!authorised(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const targetVenueId = clean(body?.venue_id)
  const dryRun = body?.dry_run === true

  let query = supabaseAdmin
    .from('venues')
    .select(
      'venue_id, name, city_area, region, postcode, canonical_city, canonical_region, latitude, longitude'
    )
    .order('name', { ascending: true })
    .limit(5000)

  if (targetVenueId) {
    query = query.eq('venue_id', targetVenueId)
  }

  const { data: venues, error: venueError } = await query

  if (venueError) {
    return Response.json({ error: venueError.message }, { status: 500 })
  }

  const rows = venues || []
  const withPostcodes = rows.filter((venue) => compactPostcode(venue.postcode))
  const missingPostcode = rows.filter((venue) => !compactPostcode(venue.postcode))

  const results: any[] = []

  for (const venue of missingPostcode) {
    const update = {
      location_verified: false,
      location_verification_error: 'missing_postcode',
      location_verified_at: new Date().toISOString(),
    }

    if (!dryRun) {
      await supabaseAdmin.from('venues').update(update).eq('venue_id', venue.venue_id)
    }

    results.push({
      venue_id: venue.venue_id,
      name: venue.name,
      postcode: venue.postcode,
      status: 'review',
      reason: 'missing_postcode',
    })
  }

  for (let index = 0; index < withPostcodes.length; index += 100) {
    const batch = withPostcodes.slice(index, index + 100)
    const requestedPostcodes = batch.map((venue) => clean(venue.postcode))

    let response: Response
    try {
      response = await fetch('https://api.postcodes.io/postcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcodes: requestedPostcodes }),
        signal: AbortSignal.timeout(20000),
      })
    } catch (error: any) {
      return Response.json(
        {
          error: `Postcodes.io request failed: ${error?.message || 'unknown error'}`,
          processed: results.length,
          results,
        },
        { status: 502 }
      )
    }

    if (!response.ok) {
      return Response.json(
        {
          error: `Postcodes.io returned HTTP ${response.status}`,
          processed: results.length,
          results,
        },
        { status: 502 }
      )
    }

    const payload: any = await response.json()
    const lookupRows = Array.isArray(payload?.result) ? payload.result : []
    const lookupByPostcode = new Map<string, any>()

    for (const row of lookupRows) {
      lookupByPostcode.set(compactPostcode(row?.query), row?.result || null)
    }

    for (const venue of batch) {
      const lookup = lookupByPostcode.get(compactPostcode(venue.postcode))

      if (!lookup) {
        const update = {
          location_verified: false,
          location_source: 'postcodes.io',
          location_verification_error: 'postcode_not_found',
          location_verified_at: new Date().toISOString(),
        }

        if (!dryRun) {
          await supabaseAdmin.from('venues').update(update).eq('venue_id', venue.venue_id)
        }

        results.push({
          venue_id: venue.venue_id,
          name: venue.name,
          postcode: venue.postcode,
          status: 'review',
          reason: 'postcode_not_found',
        })
        continue
      }

      const verifiedRegion = canonicalRegion(lookup)
      const verifiedPostcode = clean(lookup.postcode) || clean(venue.postcode)
      const adminDistrict = clean(lookup.admin_district)
      const country = clean(lookup.country)
      const canonicalCity = clean(venue.canonical_city || venue.city_area || adminDistrict)

      if (!verifiedRegion) {
        const update = {
          postcode: verifiedPostcode,
          canonical_city: canonicalCity || null,
          admin_district: adminDistrict || null,
          country: country || null,
          latitude: typeof lookup.latitude === 'number' ? lookup.latitude : venue.latitude,
          longitude: typeof lookup.longitude === 'number' ? lookup.longitude : venue.longitude,
          location_verified: false,
          location_source: 'postcodes.io',
          location_verification_error: 'unsupported_or_missing_region',
          location_verified_at: new Date().toISOString(),
        }

        if (!dryRun) {
          await supabaseAdmin.from('venues').update(update).eq('venue_id', venue.venue_id)
        }

        results.push({
          venue_id: venue.venue_id,
          name: venue.name,
          postcode: verifiedPostcode,
          status: 'review',
          reason: 'unsupported_or_missing_region',
          country,
        })
        continue
      }

      const previousRegion = clean(venue.region)
      const update = {
        postcode: verifiedPostcode,
        canonical_city: canonicalCity || null,
        canonical_region: verifiedRegion,
        admin_district: adminDistrict || null,
        country: country || null,
        latitude: typeof lookup.latitude === 'number' ? lookup.latitude : venue.latitude,
        longitude: typeof lookup.longitude === 'number' ? lookup.longitude : venue.longitude,
        // Keep legacy region correct for venue pages and any old code paths.
        region: verifiedRegion,
        location_verified: true,
        location_source: 'postcodes.io',
        location_verification_error: null,
        location_verified_at: new Date().toISOString(),
      }

      if (!dryRun) {
        const { error: updateError } = await supabaseAdmin
          .from('venues')
          .update(update)
          .eq('venue_id', venue.venue_id)

        if (updateError) {
          results.push({
            venue_id: venue.venue_id,
            name: venue.name,
            postcode: verifiedPostcode,
            status: 'error',
            reason: updateError.message,
          })
          continue
        }
      }

      results.push({
        venue_id: venue.venue_id,
        name: venue.name,
        postcode: verifiedPostcode,
        status: 'verified',
        canonical_region: verifiedRegion,
        previous_region: previousRegion || null,
        region_changed:
          Boolean(previousRegion) &&
          previousRegion.toLowerCase() !== verifiedRegion.toLowerCase(),
        admin_district: adminDistrict || null,
        country: country || null,
      })
    }
  }

  const summary = {
    total: rows.length,
    verified: results.filter((item) => item.status === 'verified').length,
    review: results.filter((item) => item.status === 'review').length,
    errors: results.filter((item) => item.status === 'error').length,
    region_changes: results.filter((item) => item.region_changed).length,
    dry_run: dryRun,
  }

  return Response.json({
    message: dryRun
      ? 'Location audit dry run finished'
      : 'Venue locations normalised',
    summary,
    results,
  })
}
