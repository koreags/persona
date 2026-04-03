import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

export function createAdminClient() {
  return createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )
}

// 게시된 글 목록
export async function getPublishedPosts({ limit = 20, personName = null } = {}) {
  let query = supabase
    .from('posts')
    .select('id, title, excerpt, person_name, category, post_type, author_name, published_at, view_count')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (personName) query = query.eq('person_name', personName)

  const { data, error } = await query
  if (error) throw error
  return data
}

// 단일 글
export async function getPost(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()
  if (error) throw error
  return data
}

// 인물 목록
export async function getPersons() {
  const { data, error } = await supabase
    .from('persons')
    .select('id, name, category, post_count')
    .eq('active', true)
    .order('post_count', { ascending: false })
  if (error) throw error
  return data
}

// 관리자: 초안 목록
export async function adminGetDrafts() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('posts')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
