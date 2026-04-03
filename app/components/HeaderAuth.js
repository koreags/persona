'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HeaderAuth() {
  const router   = useRouter()
  const menuRef  = useRef(null)
  const [user,     setUser]     = useState(undefined)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setUser(d.user || null))
      .catch(() => setUser(null))
  }, [])

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  // 로딩 중
  if (user === undefined) return <div style={{ width: '90px' }} />

  // 비로그인
  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Link href="/login" style={{
        color: '#aac4e8', fontSize: '0.8rem',
        padding: '0.3rem 0.7rem',
        border: '1px solid #3a4e6e',
        borderRadius: '3px',
      }}>
        로그인
      </Link>
      <Link href="/signup" style={{
        color: '#fff', fontSize: '0.8rem',
        padding: '0.3rem 0.7rem',
        background: 'var(--accent)',
        borderRadius: '3px',
      }}>
        회원가입
      </Link>
    </div>
  )

  // 로그인 상태
  const initial = (user.nickname || '?')[0].toUpperCase()

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setMenuOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0.4rem',
        }}
      >
        {/* 아바타 */}
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff', fontWeight: 700, fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.25)',
        }}>
          {initial}
        </div>
        <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 500, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.nickname}
        </span>
        <span style={{ color: '#7ba7e0', fontSize: '0.6rem' }}>▾</span>
      </button>

      {menuOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 400,
          background: '#fff', border: '1px solid #ddd', borderRadius: '4px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.13)', minWidth: '150px', overflow: 'hidden',
        }}>
          {/* 유저 정보 */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111' }}>{user.nickname}</div>
            <div style={{ fontSize: '0.72rem', color: '#999', marginTop: '0.1rem' }}>@{user.username}</div>
          </div>

          <Link href="/me" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#333', borderBottom: '1px solid #f0f0f0' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f7ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            내 활동
          </Link>

          <Link href="/submit" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#333', borderBottom: '1px solid #f0f0f0' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f7ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            글쓰기
          </Link>

          <button onClick={handleLogout} style={{ width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.82rem', color: '#c0392b', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
