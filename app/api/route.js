import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data } = await supabase
    .from('posts')
    .select('id,title,excerpt,person_name,category,post_type,author_name,published_at,view_count')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)
  return NextResponse.json(data || [])
}