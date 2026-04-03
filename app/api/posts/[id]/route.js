import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '../../../../lib/session'

function createAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(req, context) {
  const params = await context.params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'published')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(req, context) {
  const { id } = await context.params
  const cookieStore = await cookies()

  const isAdmin = cookieStore.get('admin_auth')?.value === '1'
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value
  const user = verifySessionToken(sessionToken)

  if (!isAdmin && !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const supabase = createAdminSupabase()

  // 글 조회
  const { data: post, error: fetchErr } = await supabase
    .from('posts')
    .select('id, author_name')
    .eq('id', id)
    .single()

  if (fetchErr || !post) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 })
  }

  // 권한 확인: 관리자 또는 작성자 본인
  if (!isAdmin && post.author_name !== user.nickname) {
    return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 })
  }

  const { error: deleteErr } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}