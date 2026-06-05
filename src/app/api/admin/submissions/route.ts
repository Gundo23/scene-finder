import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function createVenueId(name: string, location: string) {
  return `${name}_${location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

async function triggerVenueScrape(request: Request, venueId: string) {
  try {
    const scrapeUrl = new URL('/api/scrape', request.url)
    scrapeUrl.searchParams.set('venue_id', venueId)

    const response = await fetch(scrapeUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
    })

    const result = await response.json().catch(() => null)

    return {
      triggered: true,
      ok: response.ok,
      status: response.status,
      result,
    }
  } catch (error: any) {
    return {
      triggered: false,
      ok: false,
      status: null,
      error: error?.message || 'Scrape trigger failed',
    }
  }
}

export async function POST(request: Request) {
  const { id, action } = await request.json()

  if (!id || !action) {
    return Response.json({ error: 'Missing id or action' }, { status: 400 })
  }

  if (action === 'delete') {
    const { error } = await supabaseAdmin
      .from('submissions')
      .delete()
      .eq('id', id)

    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ success: true })
  }

  if (!['approved', 'denied'].includes(action)) {
    return Response.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { data: submission, error: submissionError } = await supabaseAdmin
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (submissionError || !submission) {
    return Response.json({ error: 'Submission not found' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('submissions')
    .update({ status: action })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  let venueId: string | null = null
  let scrapeResult: any = null

  if (action === 'approved') {
    venueId = createVenueId(
      submission.name,
      submission.location || 'unknown'
    )

    const { data: existingVenue } = await supabaseAdmin
      .from('venues')
      .select('venue_id')
      .eq('venue_id', venueId)
      .maybeSingle()

    if (!existingVenue) {
      const { error: venueError } = await supabaseAdmin.from('venues').insert([
        {
          venue_id: venueId,
          name: submission.name,
          city_area: submission.location || '',
          region: '',
          website: submission.website || '',
          source_url: submission.website || '',
          collection_method: 'User Submission',
          category: submission.type === 'club' ? 'Swingers Club' : 'Event Venue',
          status: 'active',
          last_verified: new Date().toISOString().split('T')[0],
          notes: submission.notes || '',
        },
      ])

      if (venueError) {
        return Response.json({ error: venueError.message }, { status: 500 })
      }
    }

    if (submission.website) {
      const { data: existingSource } = await supabaseAdmin
        .from('event_sources')
        .select('source_id')
        .eq('venue_id', venueId)
        .eq('source_url', submission.website)
        .maybeSingle()

      if (!existingSource) {
        const { error: sourceError } = await supabaseAdmin
          .from('event_sources')
          .insert([
            {
              venue_id: venueId,
              source_url: submission.website,
              collection_method: 'User Submission',
              active: true,
            },
          ])

        if (sourceError) {
          return Response.json({ error: sourceError.message }, { status: 500 })
        }
      }

      scrapeResult = await triggerVenueScrape(request, venueId)
    }
  }

  return Response.json({
    success: true,
    venue_id: venueId,
    scrape: scrapeResult,
  })
}
