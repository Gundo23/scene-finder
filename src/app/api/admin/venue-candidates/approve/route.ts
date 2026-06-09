import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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

  const { error: insertError } = await supabaseAdmin.from('venues').upsert(
    {
      venue_id: venueId,
      name: candidate.name || 'Untitled Venue',
      website: candidate.website,
      source_url: candidate.website,
      event_source_url: eventSourceUrl || candidate.event_source_url || candidate.website,
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

  await supabaseAdmin
    .from('venue_candidates')
    .update({
      status: 'approved',
      source_type: sourceType,
      event_source_url: eventSourceUrl || candidate.event_source_url || candidate.website,
    })
    .eq('id', id)

  return NextResponse.redirect(new URL('/admin/venue-candidates', request.url))
}