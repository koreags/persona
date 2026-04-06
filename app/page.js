'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

function formatDate(value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
      .replace('. ', '/').replace('.', '')
  } catch {
    return ''
  }
}

export default function HomePage() {
  const [tab, setTab] = useState('1')
  const [posts, setPosts] = useState([])
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/posts?board=${tab}`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
      fetch('/api/persons', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
    ]).then(([postsData, personsData]) => {
      setPosts(Array.isArray(postsData) ? postsData : [])
      setPersons(Array.isArray(personsData) ? personsData : [])
      setLoading(false)
    })
  }, [tab])

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

      {/* 메인 */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* 탭 */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--accent)', marginBottom: '0' }}>
          {[['1', '1게시판'], ['2', '2게시판']].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '0.45rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: tab === t ? 700 : 400,
                color: tab === t ? '#fff' : 'var(--muted)',
                background: tab === t ? 'var(--accent)' : 'var(--surface)',
                border: '1px solid var(--border)',
                borderBottom: tab === t ? '2px solid var(--accent)' : '1px solid var(--border)',
                marginBottom: tab === t ? '-2px' : 0,
                cursor: 'pointer',
                borderRadius: '3px 3px 0 0',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem' }}>
              불러오는 중...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem' }}>
              게시물이 없습니다.
            </div>
          ) : posts.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.55rem 1rem',
              borderBottom: i < posts.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: '0.85rem',
            }}>
              {/* 번호 */}
              <span style={{ color: 'var(--muted)', fontSize: '0.75rem', width: '2rem', textAlign: 'right', flexShrink: 0 }}>
                {i + 1}
              </span>

              {/* 카테고리 */}
              {p.category ? (
                <span style={{
                  fontSize: '0.68rem',
                  background: 'var(--accent-lt)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(72,118,191,0.3)',
                  padding: '0.05rem 0.4rem',
                  borderRadius: '2px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {p.category}
                </span>
              ) : (
                <span style={{ width: '2rem', flexShrink: 0 }} />
              )}

              {/* 제목 */}
              <Link href={`/posts/${p.id}`} style={{
                flex: 1,
                color: 'var(--text)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {p.title}
              </Link>

              {/* 뱃지 */}
              <span style={{
                fontSize: '0.65rem',
                padding: '0.05rem 0.35rem',
                borderRadius: '2px',
                border: '1px solid',
                flexShrink: 0,
                ...(p.post_type === 'ai'
                  ? { color: 'var(--accent)', borderColor: 'rgba(72,118,191,0.4)', background: 'var(--accent-lt)' }
                  : { color: '#888', borderColor: '#ddd', background: '#f9f9f9' }),
              }}>
                {p.post_type === 'ai' ? '관리자 게시' : '독자투고'}
              </span>

              {/* 조회·추천·날짜 */}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, fontSize: '0.72rem', color: 'var(--muted)' }}>
                <span>👁 {p.view_count ?? 0}</span>
                <span style={{ color: (p.like_count ?? 0) > 0 ? '#c0392b' : 'var(--muted)' }}>
                  👍 {p.like_count ?? 0}
                </span>
                <span style={{ minWidth: '3rem', textAlign: 'right' }}>{formatDate(p.published_at)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 사이드바 */}
      <aside style={{ width: '160px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        {/* 방문자 수 */}
        {stats && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              background: 'var(--accent-dk)',
              color: '#fff',
              padding: '0.45rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}>
              방문자
            </div>
            <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                <span>오늘</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{(stats.today_visits ?? 0).toLocaleString()}명</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                <span>누적</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{(stats.total_visits ?? 0).toLocaleString()}명</span>
              </div>
            </div>
          </div>
        )}

        {/* 인물 목록 */}
        {persons.length > 0 && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              background: 'var(--accent-dk)',
              color: '#fff',
              padding: '0.45rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}>
              인물
            </div>
            {persons.map((person, i) => (
              <div key={person.id ?? person.name ?? i} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                <Link
                  href={`/persons/${person.id ?? person.slug ?? ''}`}
                  style={{ display: 'block', padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--text)', textDecoration: 'none' }}
                >
                  {person.name}
                </Link>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  )
}
