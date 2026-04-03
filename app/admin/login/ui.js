'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginForm({ nextPath = '/admin' }) {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setError('비밀번호가 올바르지 않습니다.')
        return
      }
      router.replace(nextPath)
    } catch {
      setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem clamp(1rem, 4vw, 2rem)' }}>
      <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'inline-block', marginBottom: '1.6rem' }}>
        ← 블로그로
      </Link>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.6rem', borderRadius: '10px' }}>
        <div className="label" style={{ marginBottom: '0.5rem' }}>Admin</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.3rem' }}>로그인</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
          관리자 페이지에 접근하려면 비밀번호가 필요합니다.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="ADMIN_PASSWORD"
            autoComplete="current-password"
            required
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0.85rem 1rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              borderRadius: '8px',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--accent)',
              color: 'var(--bg)',
              border: 'none',
              padding: '0.85rem 1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              borderRadius: '8px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '확인 중…' : '로그인'}
          </button>

          {error && (
            <div style={{ color: 'var(--red)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </main>
  )
}

