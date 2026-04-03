'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['정치·외교', '테크·비즈니스', '경제·금융', '문화·예술', '스포츠', '기타']

const inputStyle = {
  width: '100%',
  padding: '0.55rem 0.8rem',
  border: '1px solid var(--border)',
  borderRadius: '3px',
  fontSize: '0.9rem',
  background: '#fff',
  color: '#111',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function SubmitPage() {
  const router = useRouter()
  const [user,     setUser]     = useState(undefined)
  const [person,   setPerson]   = useState('')
  const [title,    setTitle]    = useState('')
  const [category, setCategory] = useState('기타')
  const [content,  setContent]  = useState('')
  const [source,   setSource]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.replace('/login?next=/submit'); return }
        setUser(d.user)
      })
  }, [router])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!person || !title || !content) { setError('인물명, 제목, 내용은 필수입니다.'); return }
    setLoading(true); setError('')

    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        person, title, category, content,
        author: user.nickname,
        email:  user.email,
        source,
      }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.error) { setError(data.error); return }
    setDone(true)
  }

  if (user === undefined) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>불러오는 중...</div>
  )

  if (done) return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ background: 'var(--accent-dk)', color: '#fff', padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>글쓰기 완료</div>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✓</div>
        <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem' }}>투고가 접수되었습니다.</p>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>관리자 검토 후 게시됩니다.</p>
        <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center' }}>
          <button onClick={() => { setDone(false); setPerson(''); setTitle(''); setContent(''); setSource('') }}
            style={{ padding: '0.5rem 1.2rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '0.82rem', cursor: 'pointer' }}>
            다시 작성
          </button>
          <button onClick={() => router.push('/')}
            style={{ padding: '0.5rem 1.2rem', background: 'none', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '0.82rem', cursor: 'pointer' }}>
            홈으로
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '700px', margin: '1.5rem auto' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ background: 'var(--accent-dk)', color: '#fff', padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>
          글쓰기
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* 인물명 + 카테고리 */}
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#444', marginBottom: '0.3rem' }}>
                인물명 <span style={{ color: '#c0392b' }}>*</span>
              </label>
              <input value={person} onChange={e => setPerson(e.target.value)} placeholder="예: 일론 머스크" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#444', marginBottom: '0.3rem' }}>카테고리</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#444', marginBottom: '0.3rem' }}>
              제목 <span style={{ color: '#c0392b' }}>*</span>
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요" style={inputStyle} />
          </div>

          {/* 내용 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#444', marginBottom: '0.3rem' }}>
              내용 <span style={{ color: '#c0392b' }}>*</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={14}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
            />
          </div>

          {/* 출처 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#444', marginBottom: '0.3rem' }}>출처 URL (선택)</label>
            <input value={source} onChange={e => setSource(e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>

          {error && (
            <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '3px', fontSize: '0.82rem', color: '#c0392b' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>작성자: {user?.nickname}</span>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '0.55rem 1.6rem', background: loading ? '#aaa' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '0.88rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? '제출 중...' : '투고하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
