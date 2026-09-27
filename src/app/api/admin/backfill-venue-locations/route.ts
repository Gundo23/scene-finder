import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const REGION_ALIASES: Record<string, string> = {
  'north east': 'North East',
  northeast: 'North East',
  'north west': 'North West',
  northwest: 'North West',
  'yorkshire and the humber': 'Yorkshire and the Humber',
  yorkshire: 'Yorkshire and the Humber',
  'east midlands': 'East Midlands',
  'west midlands': 'West Midlands',
  'east of england': 'East of England',
  london: 'London',
  'south east': 'South East',
  southeast: 'South East',
  'south west': 'South West',
  southwest: 'South West',
  scotland: 'Scotland',
  wales: 'Wales',
  'northern ireland': 'Northern Ireland',

  'greater manchester': 'North West',
  lancashire: 'North West',
  merseyside: 'North West',
  cheshire: 'North West',

  'north yorkshire': 'Yorkshire and the Humber',
  'south yorkshire': 'Yorkshire and the Humber',
  'west yorkshire': 'Yorkshire and the Humber',
  'east riding of yorkshire': 'Yorkshire and the Humber',

  derbyshire: 'East Midlands',
  leicestershire: 'East Midlands',
  lincolnshire: 'East Midlands',
  nottinghamshire: 'East Midlands',
  northamptonshire: 'East Midlands',
  nottingham: 'East Midlands',
  leicester: 'East Midlands',

  birmingham: 'West Midlands',
  warwickshire: 'West Midlands',
  worcestershire: 'West Midlands',
  staffordshire: 'West Midlands',
  shropshire: 'West Midlands',

  bedfordshire: 'East of England',
  cambridgeshire: 'East of England',
  essex: 'East of England',
  hertfordshire: 'East of England',
  norfolk: 'East of England',
  suffolk: 'East of England',

  berkshire: 'South East',
  buckinghamshire: 'South East',
  hampshire: 'South East',
  kent: 'South East',
  oxfordshire: 'South East',
  surrey: 'South East',
  sussex: 'South East',
  'east sussex': 'South East',
  'west sussex': 'South East',

  cornwall: 'South West',
  devon: 'South West',
  dorset: 'South West',
  gloucestershire: 'South West',
  somerset: 'South West',
  wiltshire: 'South West',

  edinburgh: 'Scotland',
  glasgow: 'Scotland',
  belfast: 'Northern Ireland',
  sheffield: 'Yorkshire and the Humber',
}

const CITY_REGION_HINTS: Record<string, string> = {
  durham: 'North East',
  'newcastle upon tyne': 'North East',
  newcastle: 'North East',
  sunderland: 'North East',
  gateshead: 'North East',
  middlesbrough: 'North East',
  darlington: 'North East',

  blackpool: 'North West',
  bolton: 'North West',
  bury: 'North West',
  burnley: 'North West',
  carlisle: 'North West',
  chester: 'North West',
  crewe: 'North West',
  lancaster: 'North West',
  liverpool: 'North West',
  macclesfield: 'North West',
  manchester: 'North West',
  oldham: 'North West',
  preston: 'North West',
  rochdale: 'North West',
  runcorn: 'North West',
  salford: 'North West',
  stockport: 'North West',
  swinton: 'North West',
  warrington: 'North West',
  wigan: 'North West',

  bradford: 'Yorkshire and the Humber',
  doncaster: 'Yorkshire and the Humber',
  halifax: 'Yorkshire and the Humber',
  harrogate: 'Yorkshire and the Humber',
  huddersfield: 'Yorkshire and the Humber',
  'kingston upon hull': 'Yorkshire and the Humber',
  hull: 'Yorkshire and the Humber',
  leeds: 'Yorkshire and the Humber',
  ripon: 'Yorkshire and the Humber',
  sheffield: 'Yorkshire and the Humber',
  wakefield: 'Yorkshire and the Humber',
  york: 'Yorkshire and the Humber',

  derby: 'East Midlands',
  leicester: 'East Midlands',
  lincoln: 'East Midlands',
  northampton: 'East Midlands',
  nottingham: 'East Midlands',
  'west bridgford': 'East Midlands',

  birmingham: 'West Midlands',
  coventry: 'West Midlands',
  dudley: 'West Midlands',
  hereford: 'West Midlands',
  lichfield: 'West Midlands',
  solihull: 'West Midlands',
  'stoke on trent': 'West Midlands',
  'west bromwich': 'West Midlands',
  wolverhampton: 'West Midlands',
  worcester: 'West Midlands',

  bedford: 'East of England',
  cambridge: 'East of England',
  chelmsford: 'East of England',
  colchester: 'East of England',
  ely: 'East of England',
  ipswich: 'East of England',
  luton: 'East of England',
  norwich: 'East of England',
  peterborough: 'East of England',
  'st albans': 'East of England',
  'southend on sea': 'East of England',

  london: 'London',
  westminster: 'London',
  sutton: 'London',
  croydon: 'London',
  bromley: 'London',
  camden: 'London',
  walthamstow: 'London',
  stratford: 'London',
  deptford: 'London',
  soho: 'London',
  'south london': 'London',
  'north london': 'London',
  'east london': 'London',
  'west london': 'London',
  'central london': 'London',

  brighton: 'South East',
  'brighton and hove': 'South East',
  canterbury: 'South East',
  chichester: 'South East',
  guildford: 'South East',
  maidstone: 'South East',
  'milton keynes': 'South East',
  oxford: 'South East',
  portsmouth: 'South East',
  reading: 'South East',
  slough: 'South East',
  southampton: 'South East',
  winchester: 'South East',

  bath: 'South West',
  bournemouth: 'South West',
  bristol: 'South West',
  cheltenham: 'South West',
  exeter: 'South West',
  gloucester: 'South West',
  plymouth: 'South West',
  salisbury: 'South West',
  swindon: 'South West',
  truro: 'South West',
  wells: 'South West',

  aberdeen: 'Scotland',
  dundee: 'Scotland',
  dunfermline: 'Scotland',
  edinburgh: 'Scotland',
  glasgow: 'Scotland',
  inverness: 'Scotland',
  perth: 'Scotland',
  stirling: 'Scotland',

  bangor: 'Wales',
  cardiff: 'Wales',
  newport: 'Wales',
  swansea: 'Wales',
  wrexham: 'Wales',

  belfast: 'Northern Ireland',
  lisburn: 'Northern Ireland',
  londonderry: 'Northern Ireland',
  derry: 'Northern Ireland',
}

function clean(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function normalise(value: unknown) {
  return clean(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function compactPostcode(value: unknown) {
  return clean(value).toUpperCase().replace(/\s+/g, '')
}

function getLocationParts(value: unknown) {
  return clean(value)
    .split(/\s*(?:\/|\||•|,|;|–|—)\s*/)
    .map((part) => normalise(part))
    .filter(Boolean)
}

function canonicalRegion(result: any) {
  const country = clean(result?.country)

  if (country === 'Scotland') return 'Scotland'
  if (country === 'Wales') return 'Wales'
  if (country === 'Northern Ireland') return 'Northern Ireland'

  return REGION_ALIASES[normalise(result?.region)] || ''
}

function countryForRegion(region: string) {
  if (region === 'Scotland') return 'Scotland'
  if (region === 'Wales') return 'Wales'
  if (region === 'Northern Ireland') return 'Northern Ireland'
  return region ? 'England' : ''
}

function isMultiLocationRegion(value: unknown) {
  const region = normalise(value)
  return (
    region === 'uk wide' ||
    region === 'nationwide' ||
    region === 'multiple locations' ||
    region === 'various locations' ||
    region === 'various'
  )
}

function isExplicitMultiLocationVenue(venue: any) {
  if (isMultiLocationRegion(venue?.region)) return true

  const city = normalise(venue?.city_area)
  if (
    city.includes('uk wide') ||
    city.includes('uk events') ||
    city.includes('multiple locations') ||
    city.includes('various locations')
  ) {
    return true
  }

  const parts = getLocationParts(venue?.city_area)
  if (parts.includes('uk')) return true

  const regions = new Set(
    parts
      .map((part) => CITY_REGION_HINTS[part] || REGION_ALIASES[part] || '')
      .filter(Boolean)
  )

  return regions.size > 1
}

function inferFallbackRegion(venue: any) {
  if (isExplicitMultiLocationVenue(venue)) return ''

  const parts = getLocationParts(venue?.city_area)

  for (const part of parts) {
    const cityMatch = CITY_REGION_HINTS[part]
    if (cityMatch) return cityMatch

    const regionMatch = REGION_ALIASES[part]
    if (regionMatch) return regionMatch
  }

  const fullCity = normalise(venue?.city_area)

  for (const [city, region] of Object.entries(CITY_REGION_HINTS)) {
    if (` ${fullCity} `.includes(` ${city} `)) return region
  }

  return REGION_ALIASES[normalise(venue?.region)] || ''
}

function normaliseSecret(value: unknown) {
  return String(value ?? '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
}

function authorised(request: Request) {
  const expected = normaliseSecret(
    process.env.ADMIN_LOCATION_SECRET || process.env.ADMIN_RESTORE_SECRET
  )
  if (!expected) return false

  const supplied = normaliseSecret(request.headers.get('x-admin-secret'))
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
      'venue_id, name, city_area, region, postcode, canonical_city, canonical_region, admin_district, country, latitude, longitude, location_source, location_verification_error'
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

  // Missing-postcode venues still get a safe canonical REGION where possible.
  // This makes region search/indexing useful without pretending an exact address is verified.
  for (const venue of missingPostcode) {
    const now = new Date().toISOString()

    if (isExplicitMultiLocationVenue(venue)) {
      const update = {
        canonical_region: null,
        location_verified: false,
        location_source: 'manual-review',
        location_verification_error: 'multi_location_or_uk_wide_review',
        location_verified_at: now,
      }

      if (!dryRun) {
        await supabaseAdmin.from('venues').update(update).eq('venue_id', venue.venue_id)
      }

      results.push({
        venue_id: venue.venue_id,
        name: venue.name,
        postcode: null,
        status: 'review',
        reason: 'multi_location_or_uk_wide_review',
      })
      continue
    }

    const inferredRegion = inferFallbackRegion(venue)
    const canonicalCity = clean(venue.canonical_city || venue.city_area)
    const inferredCountry = countryForRegion(inferredRegion)

    if (inferredRegion) {
      const update = {
        canonical_city: canonicalCity || null,
        canonical_region: inferredRegion,
        region: inferredRegion,
        country: inferredCountry || venue.country || null,
        location_verified: false,
        location_source: 'city-region-fallback',
        location_verification_error: 'region_inferred_without_postcode',
        location_verified_at: now,
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
            status: 'error',
            reason: updateError.message,
          })
          continue
        }
      }

      results.push({
        venue_id: venue.venue_id,
        name: venue.name,
        postcode: null,
        status: 'indexed',
        canonical_region: inferredRegion,
        canonical_city: canonicalCity || null,
        country: inferredCountry || null,
        reason: 'region_inferred_without_postcode',
      })
      continue
    }

    const update = {
      canonical_city: canonicalCity || null,
      canonical_region: null,
      location_verified: false,
      location_source: 'manual-review',
      location_verification_error: 'missing_location_data',
      location_verified_at: now,
    }

    if (!dryRun) {
      await supabaseAdmin.from('venues').update(update).eq('venue_id', venue.venue_id)
    }

    results.push({
      venue_id: venue.venue_id,
      name: venue.name,
      postcode: null,
      status: 'review',
      reason: 'missing_location_data',
    })
  }

  // Postcode rows are still verified against postcodes.io.
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
      const now = new Date().toISOString()

      if (!lookup) {
        const update = {
          location_verified: false,
          location_source: 'postcodes.io',
          location_verification_error: 'postcode_not_found',
          location_verified_at: now,
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
          location_verified_at: now,
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

      if (isExplicitMultiLocationVenue(venue)) {
        const update = {
          postcode: verifiedPostcode,
          canonical_city: canonicalCity || null,
          canonical_region: null,
          admin_district: adminDistrict || null,
          country: country || null,
          latitude: typeof lookup.latitude === 'number' ? lookup.latitude : venue.latitude,
          longitude: typeof lookup.longitude === 'number' ? lookup.longitude : venue.longitude,
          location_verified: false,
          location_source: 'postcodes.io',
          location_verification_error: 'multi_location_or_uk_wide_review',
          location_verified_at: now,
        }

        if (!dryRun) {
          await supabaseAdmin.from('venues').update(update).eq('venue_id', venue.venue_id)
        }

        results.push({
          venue_id: venue.venue_id,
          name: venue.name,
          postcode: verifiedPostcode,
          status: 'review',
          reason: 'multi_location_or_uk_wide_review',
          suggested_region: verifiedRegion,
          previous_region: previousRegion,
          admin_district: adminDistrict || null,
          country: country || null,
        })
        continue
      }

      const update = {
        postcode: verifiedPostcode,
        canonical_city: canonicalCity || null,
        canonical_region: verifiedRegion,
        admin_district: adminDistrict || null,
        country: country || null,
        latitude: typeof lookup.latitude === 'number' ? lookup.latitude : venue.latitude,
        longitude: typeof lookup.longitude === 'number' ? lookup.longitude : venue.longitude,
        region: verifiedRegion,
        location_verified: true,
        location_source: 'postcodes.io',
        location_verification_error: null,
        location_verified_at: now,
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
    indexed_fallback: results.filter((item) => item.status === 'indexed').length,
    review: results.filter((item) => item.status === 'review').length,
    errors: results.filter((item) => item.status === 'error').length,
    region_changes: results.filter((item) => item.region_changed).length,
    dry_run: dryRun,
  }

  return Response.json({
    message: dryRun
      ? 'Location audit dry run finished'
      : 'Venue locations normalised and region-indexed',
    summary,
    results,
  })
}
