import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const sort = searchParams.get('sort') // 'popular' | null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  let query = supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .limit(50)

  if (sort === 'popular') {
    query = query.order('like_count', { ascending: false })
  } else {
    query = query.order('published_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) {
    console.error('[/api/posts]', error.message)
    return NextResponse.json([], { status: 500 })
  }
  return NextResponse.json(data || [])
}
