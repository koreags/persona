import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('post_type', 'user')
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[/api/user-posts]', error.message)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(data || [])
}

