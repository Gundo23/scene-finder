import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const formData = await request.formData()
  const id = String(formData.get('id') || '')

  if (!id) {
    return NextResponse.redirect(
      new URL('/admin/venue-candidates?error=missing-id', request.url)
    )
  }

  await supabaseAdmin
    .from('venue_candidates')
    .delete()
    .eq('id', id)

  return NextResponse.redirect(new URL('/admin/venue-candidates', request.url))
}