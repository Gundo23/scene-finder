import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing venue id' }, { status: 400 })
    }

    const { data: venue, error: fetchError } = await supabaseAdmin
      .from('venues')
      .select('venue_id, like_count')
      .eq('venue_id', id)
      .single()

    if (fetchError || !venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const nextLikeCount = Number(venue.like_count || 0) + 1

    const { data, error } = await supabaseAdmin
      .from('venues')
      .update({ like_count: nextLikeCount })
      .eq('venue_id', id)
      .select('venue_id, like_count')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Could not update likes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      venue_id: data.venue_id,
      like_count: data.like_count || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected like error' },
      { status: 500 }
    )
  }
}