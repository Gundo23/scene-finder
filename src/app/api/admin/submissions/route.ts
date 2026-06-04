import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  const { error } = await supabaseAdmin
    .from('submissions')
    .update({ status: action })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}