import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, publicEventSourceUrl, validAdminSession } from '@/lib/admin-session'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export async function POST(request: Request) {
  if (!validAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Admin sign-in required' }, { status: 401 })
  }
  const formData = await request.formData()
  const id = String(formData.get('id') || '')
  const sourceType = String(formData.get('source_type') || 'unknown')
  const eventSourceUrl = String(formData.get('event_source_url') || '')

  if (!id) {
    return NextResponse.redirect(
      new URL('/admin/venue-candidates?error=missing-id', request.url)
    )
  }

  const { data: candidate, error: candidateError } = await supabaseAdmin
    .from('venue_candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (candidateError || !candidate) {
    return NextResponse.redirect(
      new URL('/admin/venue-candidates?error=not-found', request.url)
    )
  }

  const venueId = slugify(`${candidate.name || 'venue'}_${candidate.location || 'uk'}`)
  const sourceUrl = publicEventSourceUrl(eventSourceUrl || candidate.event_source_url || candidate.website)

  if (!sourceUrl) {
    return NextResponse.redirect(new URL('/admin/venue-candidates?error=valid-https-event-source-required', request.url))
  }

  const { error: insertError } = await supabaseAdmin.from('venues').upsert(
    {
      venue_id: venueId,
      name: candidate.name || 'Untitled Venue',
      website: candidate.website,
      source_url: candidate.website,
      event_source_url: sourceUrl,
      source_type: sourceType || candidate.source_type || 'unknown',
      scout_confidence: candidate.confidence_score,
      scout_discovery_query: candidate.discovery_query,
      city_area: candidate.location,
      region: candidate.location,
      status: 'published',
    },
    { onConflict: 'venue_id' }
  )

  if (insertError) {
    return NextResponse.redirect(
      new URL(
        `/admin/venue-candidates?error=${encodeURIComponent(insertError.message)}`,
        request.url
      )
    )
  }

  const { data: activeSources, error: lookupError } = await supabaseAdmin
    .from('event_sources')
    .select('source_id')
    .eq('venue_id', venueId)
    .eq('active', true)
    .limit(1)

  let sourceError = lookupError
  if (!sourceError && !activeSources?.length) {
    const result = await supabaseAdmin.from('event_sources').insert({
      source_id: randomUUID(),
      venue_id: venueId,
      source_url: sourceUrl,
      active: true,
      collection_method: 'Manual',
    })
    sourceError = result.error
  }

  if (sourceError) {
    return NextResponse.redirect(new URL(`/admin/venue-candidates?error=${encodeURIComponent(sourceError.message)}`, request.url))
  }

  await supabaseAdmin
    .from('venue_candidates')
    .update({
      status: 'approved',
      source_type: sourceType,
      event_source_url: sourceUrl,
    })
    .eq('id', id)

  return NextResponse.redirect(new URL('/admin/venue-candidates', request.url))
}
