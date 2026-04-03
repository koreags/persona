import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase'

// GET /api/auth/check?field=username&value=foo
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const field = searchParams.get('field') // username | email | nickname
  const value = searchParams.get('value')

  if (!['username', 'email', 'nickname'].includes(field) || !value)
    return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const admin = createAdminClient()
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })

  let taken = false
  if (field === 'email') {
    taken = users.some(u => u.email === value)
  } else {
    taken = users.some(u => u.user_metadata?.[field] === value)
  }

  return NextResponse.json({ available: !taken })
}
