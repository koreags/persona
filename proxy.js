import { NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from './lib/session'

const ADMIN_COOKIE = 'admin_auth'

export function proxy(req) {
  const { pathname } = req.nextUrl

  // ── 관리자 보호 ──
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdminApi  =
    pathname === '/api/drafts'  ||
    pathname === '/api/publish' ||
    pathname === '/api/reject'  ||
    pathname === '/api/crawl'   ||
    pathname === '/api/persons'

  if (isAdminPage || isAdminApi) {
    const isLoginPage = pathname === '/admin/login'
    const isLoginApi  = pathname === '/api/admin/login'
    if (isLoginPage || isLoginApi) return NextResponse.next()

    const authed = req.cookies.get(ADMIN_COOKIE)?.value === '1'
    if (!authed) {
      const url = new URL('/admin/login', req.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── 회원 전용: 글쓰기 ──
  if (pathname === '/submit' || pathname.startsWith('/submit/')) {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    const user  = verifySessionToken(token)
    if (!user) {
      const url = new URL('/login', req.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/drafts', '/api/publish', '/api/reject', '/api/crawl', '/api/persons', '/submit/:path*', '/submit'],
}
