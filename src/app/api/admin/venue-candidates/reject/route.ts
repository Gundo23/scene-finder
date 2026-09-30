import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, validAdminSession } from '@/lib/admin-session'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  if (!validAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Admin sign-in required' }, { status: 401 })
  }
  const formData = await request.formData()
  const id = String(formData.get('id') || '')

  if (!id) {
    return NextResponse.redirect(
      new URL('/admin/venue-candidates?error=missing-id', request.url)
    )
  }

  await supabaseAdmin
    .from('venue_candidates')
    .update({ status: 'rejected' })
    .eq('id', id)

  return NextResponse.redirect(new URL('/admin/venue-candidates', request.url))
}
