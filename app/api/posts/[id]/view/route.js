import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req, context) {
  const { id } = await context.params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: post, error: fetchErr } = await supabase
    .from('posts')
    .select('view_count')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (fetchErr || !post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { error } = await supabase
    .from('posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
