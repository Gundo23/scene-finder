import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing venue id' }, { status: 400 })
    }

    const { data: venue, error: fetchError } = await supabase
      .from('venues')
      .select('venue_id, like_count')
      .eq('venue_id', id)
      .single()

    if (fetchError || !venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      )
    }

    const nextLikeCount = Number(venue.like_count || 0) + 1

    const { data, error } = await supabase
      .from('venues')
      .update({ like_count: nextLikeCount })
      .eq('venue_id', id)
      .select('venue_id, like_count')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Could not like venue' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      venue_id: data.venue_id,
      like_count: data.like_count || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected like error' },
      { status: 500 }
    )
  }
}