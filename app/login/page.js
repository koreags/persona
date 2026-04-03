'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const inputStyle = {
  padding: '0.55rem 0.8rem',
  border: '1px solid #ccc',
  borderRadius: '3px',
  fontSize: '0.9rem',
  outline: 'none',
  color: '#111',
  background: '#fff',
  width: '100%',
}

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') || '/'

  const [loginId,  setLoginId]  = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!loginId || !password) { setError('아이디와 비밀번호를 입력해 주세요.'); return }
    setLoading(true); setError('')

    const res  = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.error) { setError(data.error); return }
    router.push(next)
    router.refresh()
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden', maxWidth: '420px', margin: '2rem auto' }}>
      <div style={{ background: 'var(--accent-dk)', color: '#fff', padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>
        로그인
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#444', marginBottom: '0.35rem' }}>
            아이디 또는 이메일
          </label>
          <input
            value={loginId}
            onChange={e => setLoginId(e.target.value)}
            placeholder="아이디 또는 이메일"
            autoComplete="username"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#444', marginBottom: '0.35rem' }}>
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="new-password"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '3px', fontSize: '0.82rem', color: '#c0392b' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.65rem', background: loading ? '#aaa' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '0.9rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.25rem' }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
          <span>계정이 없으신가요?</span>
          <Link href="/signup" style={{ color: 'var(--accent)', fontWeight: 500 }}>회원가입</Link>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
