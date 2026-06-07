import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: venue, error: fetchError } = await supabase
    .from('venues')
    .select('like_count')
    .eq('venue_id', id)
    .single()

  if (fetchError || !venue) {
    return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
  }

  const nextLikeCount = Number(venue.like_count || 0) + 1

  const { data, error } = await supabase
    .from('venues')
    .update({ like_count: nextLikeCount })
    .eq('venue_id', id)
    .select('like_count')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Could not like venue' }, { status: 500 })
  }

  return NextResponse.json({ like_count: data.like_count })
}
