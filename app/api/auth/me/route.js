import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '../../../../lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const token   = cookieStore.get(SESSION_COOKIE)?.value
  const user    = verifySessionToken(token)
  const isAdmin = cookieStore.get('admin_auth')?.value === '1'
  if (!user) return NextResponse.json({ user: null, isAdmin })
  return NextResponse.json({
    user: { username: user.username, nickname: user.nickname, email: user.email },
    isAdmin,
  })
}
