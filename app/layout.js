import './globals.css'
import Link from 'next/link'
import HeaderAuth from './components/HeaderAuth'
import VisitTracker from './components/VisitTracker'
import { cookies } from 'next/headers'

export const metadata = {
  title: '인물지 — People Chronicle',
  description: '인물에 집중한 블로그.',
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin_auth')?.value === '1'
  return (
    <html lang="ko">
      <body>
        <VisitTracker />
        {/* ── 최상단 헤더 ── */}
        <header style={{
          background: 'var(--header-bg)',
          color: 'var(--header-text)',
          borderBottom: '1px solid #0d1e38',
        }}>
          {/* 로고 + 검색 + 유저메뉴 */}
          <div style={{
            maxWidth: '1200px', margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.7rem 1rem',
          }}>
            <Link href="/" style={{
              fontFamily: 'var(--font-hero)',
              fontSize: '1.8rem',
              letterSpacing: '0.05em',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              인물지<span style={{ color: '#7ba7e0' }}>.</span>
            </Link>

            {/* 검색창 */}
            <div style={{ flex: 1, maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                style={{
                  width: '100%',
                  padding: '0.45rem 3rem 0.45rem 0.9rem',
                  border: '1px solid #3a4e6e',
                  borderRadius: '3px',
                  background: '#243556',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <span style={{
                position: 'absolute', right: '0.7rem', top: '50%',
                transform: 'translateY(-50%)', color: '#7ba7e0', fontSize: '1rem',
              }}>⌕</span>
            </div>

            {/* 우측 메뉴 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
              <Link href="/submit" style={{
                background: 'var(--accent)',
                color: '#fff',
                padding: '0.35rem 0.9rem',
                borderRadius: '3px',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}>
                글쓰기
              </Link>
              {isAdmin && (
                <Link href="/admin" style={{
                  color: '#aac4e8',
                  fontSize: '0.8rem',
                }}>
                  관리자
                </Link>
              )}
              <HeaderAuth />
            </div>
          </div>

          {/* 수평 내비게이션 탭 */}
          <nav style={{
            background: '#243556',
            borderTop: '1px solid #1a2d4a',
          }}>
            <div style={{
              maxWidth: '1200px', margin: '0 auto',
              display: 'flex', alignItems: 'center',
              padding: '0 1rem',
              gap: 0,
            }}>
              {[
                { label: '1게시판', href: '/' },          // 편집자 + 회원 인기글
                { label: '2게시판', href: '/board2' },    // 회원 글 전용
                { label: '글쓰기', href: '/submit' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="nav-tab">
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        {/* ── 본문 (사이드바 + 메인) ── */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          {/* 메인 콘텐츠 */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {children}
          </main>
        </div>

        {/* ── 푸터 ── */}
        <footer style={{
          marginTop: '2rem',
          borderTop: '1px solid var(--border)',
          background: '#2c3e50',
          color: '#aaa',
          padding: '1.2rem 1rem',
          fontSize: '0.78rem',
          textAlign: 'center',
        }}>
          © 2026 인물지 · People Chronicle
        </footer>
      </body>
    </html>
  )
}
