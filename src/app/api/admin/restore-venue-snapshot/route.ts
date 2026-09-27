import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function isAuthorised(request: Request) {
  const expected = process.env.ADMIN_RESTORE_SECRET
  const provided = request.headers.get('x-admin-secret')

  return Boolean(expected && provided && provided === expected)
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const venueId = url.searchParams.get('venue_id')?.trim()

  if (!venueId) {
    return Response.json({ error: 'venue_id is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('venue_event_snapshots')
    .select('id, venue_id, batch_id, snapshot_type, event_count, created_at, restored_at, restored_by')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ venue_id: venueId, snapshots: data || [] })
}

export async function POST(request: Request) {
  if (!isAuthorised(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { snapshot_id?: string; restored_by?: string }

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const snapshotId = body.snapshot_id?.trim()

  if (!snapshotId) {
    return Response.json({ error: 'snapshot_id is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.rpc('restore_venue_event_snapshot', {
    p_snapshot_id: snapshotId,
    p_restored_by: body.restored_by?.trim() || 'scene-finder-admin',
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ message: 'Venue snapshot restored', result: data })
}
