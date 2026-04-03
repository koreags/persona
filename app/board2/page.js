'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

function formatDate(value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) {
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
      .replace('. ', '/').replace('.', '')
  } catch {
    return ''
  }
}

export default function Board2Page() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/user-posts')
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setPosts([]); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter(p => {
      const hay = [p?.title, p?.excerpt, p?.person_name, p?.category, p?.author_name]
        .filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [posts, query])

  return (
    <div>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        {/* 게시판 상단 타이틀 */}
        <div style={{
          background: 'var(--accent-dk)',
          color: '#fff',
          padding: '0.6rem 1rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>2게시판 — 회원 글</span>
          <Link href="/submit" style={{ background: 'var(--accent)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '2px', fontSize: '0.75rem' }}>
            글쓰기
          </Link>
        </div>

        {/* 검색 */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0.3rem 0.75rem' }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="검색"
              style={{
                padding: '0.3rem 0.6rem',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                fontSize: '0.78rem',
                outline: 'none',
                width: '140px',
                background: '#fff',
                color: 'var(--text)',
              }}
            />
          </div>
        </div>

        {/* 게시판 테이블 */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>게시물이 없습니다.</div>
        ) : (
          <table className="board-table">
            <thead>
              <tr>
                <th className="title-col" style={{ paddingLeft: '1rem' }}>제목</th>
                <th>글쓴이</th>
                <th>날짜</th>
                <th>조회</th>
                <th>추천</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="fade-up">
                  <td className="col-title" style={{ paddingLeft: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {p.category && (
                        <span style={{
                          fontSize: '0.68rem',
                          background: 'var(--accent-lt)',
                          color: 'var(--accent)',
                          border: '1px solid rgba(72,118,191,0.3)',
                          padding: '0.05rem 0.4rem',
                          borderRadius: '2px',
                          whiteSpace: 'nowrap',
                        }}>{p.category}</span>
                      )}
                      <Link href={`/posts/${p.id}`} className="post-title">{p.title}</Link>
                      <span className="user-badge">투고</span>
                    </div>
                    {p.person_name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{p.person_name}</div>
                    )}
                  </td>
                  <td className="col-author">{p.author_name || '익명'}</td>
                  <td className="col-date">{formatDate(p.published_at)}</td>
                  <td className="col-views">{p.view_count ?? 0}</td>
                  <td className="col-views" style={{ color: (p.like_count > 0) ? '#c0392b' : 'var(--muted)' }}>
                    {p.like_count > 0 ? `▲ ${p.like_count}` : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

