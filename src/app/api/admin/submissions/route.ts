import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function createVenueId(name: string, location: string) {
  const rawId = `${name || 'venue'}_${location || 'unknown'}`
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return rawId || `venue_${Date.now()}`
}

function getVenueCategory(type: string | null | undefined) {
  const normalisedType = String(type || '').toLowerCase()

  if (normalisedType.includes('event')) return 'Event Venue'
  if (normalisedType.includes('club')) return 'Swingers Club'
  if (normalisedType.includes('sauna')) return 'Sauna'
  if (normalisedType.includes('social')) return 'Social'

  return 'Venue'
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

  let venueId: string | null = null

  if (action === 'approved') {
    venueId = createVenueId(
      submission.name,
      submission.location || submission.hosted_at || 'unknown'
    )

    const { data: existingVenue, error: existingVenueError } = await supabaseAdmin
      .from('venues')
      .select('venue_id')
      .eq('venue_id', venueId)
      .maybeSingle()

    if (existingVenueError) {
      return Response.json({ error: existingVenueError.message }, { status: 500 })
    }

    if (!existingVenue) {
      const notes = [
        submission.notes ? `Submission notes: ${submission.notes}` : '',
        submission.contact_name ? `Contact name: ${submission.contact_name}` : '',
        submission.submitter_email ? `Contact email: ${submission.submitter_email}` : '',
        submission.event_date ? `Submitted event date: ${submission.event_date}` : '',
        submission.hosted_at ? `Hosted at: ${submission.hosted_at}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const { error: venueError } = await supabaseAdmin.from('venues').insert([
        {
          venue_id: venueId,
          name: submission.name || submission.hosted_at || 'Unnamed Venue',
          city_area: submission.location || '',
          region: '',
          website: submission.website || '',
          source_url: submission.website || '',
          collection_method: 'Manual Submission',
          category: getVenueCategory(submission.type),
          status: 'active',
          last_verified: new Date().toISOString().split('T')[0],
          notes,
          like_count: 0,
        },
      ])

      if (venueError) {
        return Response.json({ error: venueError.message }, { status: 500 })
      }
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('submissions')
    .update({ status: action })
    .eq('id', id)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({
    success: true,
    action,
    venue_id: venueId,
  })
}
