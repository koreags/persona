import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req, context) {
  const { id } = await context.params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // 현재 like_count 조회 후 +1
  const { data: post, error: fetchErr } = await supabase
    .from('posts')
    .select('like_count')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (fetchErr || !post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const newCount = (post.like_count || 0) + 1
  const { error: updateErr } = await supabase
    .from('posts')
    .update({ like_count: newCount })
    .eq('id', id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
  return NextResponse.json({ like_count: newCount })
}
