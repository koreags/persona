import { NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_auth'

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}))
  const expected = process.env.ADMIN_PASSWORD

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'ADMIN_PASSWORD is not set' },
      { status: 500 }
    )
  }

  if (!password || password !== expected) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return res
}

