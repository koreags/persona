import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase'
import { sendVerificationEmail } from '../../../../lib/mailer'
import { createEmailToken } from '../../../../lib/emailToken'

export async function POST(req) {
  const { email } = await req.json().catch(() => ({}))

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: '올바른 이메일 주소를 입력해 주세요.' }, { status: 400 })

  const admin = createAdminClient()

  // 이미 가입된 이메일 차단
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const exists = users.some(u => u.email === email)
  if (exists) return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409 })

  // 6자리 코드 생성 + HMAC 서명 토큰
  const code  = String(Math.floor(100000 + Math.random() * 900000))
  const token = createEmailToken(email, code)

  try {
    await sendVerificationEmail(email, code)
  } catch (err) {
    console.error('[send-code] 이메일 발송 실패:', err.message)
    return NextResponse.json({ error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, token })
}
