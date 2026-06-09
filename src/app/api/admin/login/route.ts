import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return Response.json(
      { error: 'Username and password are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin.rpc('verify_admin_login', {
    input_username: username,
    input_password: password,
  })

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }

  if (data === true) {
    return Response.json({
      success: true,
      username,
    })
  }

  return Response.json(
    { error: 'Invalid username or password' },
    { status: 401 }
  )
}