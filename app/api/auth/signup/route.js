import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase'
import { verifyEmailToken } from '../../../../lib/emailToken'

export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })

  const { id, password, email, nickname, emailCode, emailToken } = body

  // ── 유효성 검사 ──
  if (!id || !/^[a-z0-9_]{4,20}$/.test(id))
    return NextResponse.json({ error: '아이디는 영소문자·숫자·밑줄(_) 4~20자여야 합니다.' }, { status: 400 })
  if (!password || password.length < 6)
    return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: '이메일 형식이 올바르지 않습니다.' }, { status: 400 })
  if (!nickname || nickname.length < 2 || nickname.length > 20)
    return NextResponse.json({ error: '닉네임은 2~20자여야 합니다.' }, { status: 400 })

  // ── 이메일 인증 코드 검증 ──
  const verify = verifyEmailToken(emailToken, emailCode)
  if (!verify.ok) return NextResponse.json({ error: verify.error }, { status: 400 })
  if (verify.email !== email) return NextResponse.json({ error: '이메일 정보가 일치하지 않습니다.' }, { status: 400 })

  const admin = createAdminClient()

  // ── 아이디·닉네임 중복 확인 (auth.users 메타데이터 조회) ──
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const usernameTaken = users.some(u => u.user_metadata?.username === id)
  const nicknameTaken = users.some(u => u.user_metadata?.nickname === nickname)
  if (usernameTaken) return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 })
  if (nicknameTaken) return NextResponse.json({ error: '이미 사용 중인 닉네임입니다.' }, { status: 409 })

  // ── Supabase Auth 회원 생성 ──
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: { username: id, nickname },
    email_confirm: true, // 이미 이메일 인증 완료
  })

  if (error) {
    console.error('[signup]', error.message)
    if (error.message.includes('already registered'))
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 })
    return NextResponse.json({ error: `가입 오류: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true, userId: data.user.id })
}
