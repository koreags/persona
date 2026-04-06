import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const board = searchParams.get('board') // '1' | '2' | null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[/api/posts]', error.message)
    return NextResponse.json({ _error: error.message }, { status: 500 })
  }

  const all = data || []

  let result
  if (board === '1') {
    result = all.filter(p =>
      p.post_type === 'ai' || (p.post_type === 'user' && (p.like_count ?? 0) >= 5)
    )
  } else if (board === '2') {
    result = all.filter(p => p.post_type === 'user')
  } else {
    result = all
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
