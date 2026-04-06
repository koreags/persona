import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '../../../../../lib/supabase'

export async function POST(req, context) {
  const { id } = await context.params
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin_auth')?.value === '1'

  const admin = createAdminClient()

  const { data: post, error: fetchErr } = await admin
    .from('posts')
    .select('like_count')
    .eq('id', id)
    .single()

  if (fetchErr || !post) {
    console.error('[like] fetch error:', fetchErr?.message, 'id:', id)
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const newCount = (post.like_count || 0) + 1

  const { error: updateErr } = await admin
    .from('posts')
    .update({ like_count: newCount })
    .eq('id', id)

  if (updateErr) {
    console.error('[like] update error:', updateErr.message)
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ like_count: newCount })
}
