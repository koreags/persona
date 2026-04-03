import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '../../../../lib/supabase'
import { createSessionToken, SESSION_COOKIE } from '../../../../lib/session'

export async function POST(req) {
  const { loginId, password } = await req.json().catch(() => ({}))

  if (!loginId || !password)
    return NextResponse.json({ error: '아이디(또는 이메일)와 비밀번호를 입력해 주세요.' }, { status: 400 })

  const admin = createAdminClient()

  // 아이디 또는 이메일로 사용자 조회
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const found = users.find(u =>
    u.email === loginId || u.user_metadata?.username === loginId
  )

  if (!found)
    return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })

  // Supabase Auth로 비밀번호 검증
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { error } = await supabase.auth.signInWithPassword({
    email: found.email,
    password,
  })

  if (error)
    return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })

  // 세션 쿠키 발급
  const token = createSessionToken({
    userId:   found.id,
    username: found.user_metadata?.username || '',
    nickname: found.user_metadata?.nickname || '',
    email:    found.email,
  })

  const res = NextResponse.json({
    ok: true,
    user: {
      username: found.user_metadata?.username,
      nickname: found.user_metadata?.nickname,
    },
  })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7일
  })
  return res
}
