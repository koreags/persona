'use client'
import { useEffect, useState } from 'react'
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

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/posts').then(r => r.json()).catch(() => []),
      fetch('/api/persons').then(r => r.json()).catch(() => []),
    ]).then(([postsData, personsData]) => {
      setPosts(Array.isArray(postsData) ? postsData : [])
      setPersons(Array.isArray(personsData) ? personsData : [])
      setLoading(false)
    })
  }, [])

  const hero = posts[0] ?? null
  const cards = posts.slice(1, 5)
  const list = posts.slice(5)

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
        불러오는 중...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
      {/* 메인 콘텐츠 */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* 히어로 배너 — 첫 번째 글 */}
        {hero && (
          <Link href={`/posts/${hero.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '1.5rem' }}>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {hero.category && (
                <span style={{
                  fontSize: '0.72rem',
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '2px',
                  marginBottom: '0.75rem',
                  display: 'inline-block',
                }}>
                  {hero.category}
                </span>
              )}
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text)',
                margin: '0 0 0.5rem',
                lineHeight: 1.3,
              }}>
                {hero.title}
              </h1>
              {hero.excerpt && (
                <p style={{
                  color: 'var(--muted)',
                  fontSize: '0.9rem',
                  margin: '0 0 1rem',
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {hero.excerpt}
                </p>
              )}
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
                {hero.person_name && <span>{hero.person_name}</span>}
                <span>{formatDate(hero.published_at)}</span>
              </div>
            </div>
          </Link>
        )}

        {/* 카드 그리드 — 2~5번째 글 */}
        {cards.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            {cards.map(p => (
              <Link key={p.id} href={`/posts/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '1rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}>
                  {p.category && (
                    <span style={{
                      fontSize: '0.68rem',
                      background: 'var(--accent-lt)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(72,118,191,0.3)',
                      padding: '0.05rem 0.4rem',
                      borderRadius: '2px',
                      alignSelf: 'flex-start',
                    }}>
                      {p.category}
                    </span>
                  )}
                  <div style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--text)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {p.title}
                  </div>
                  {p.person_name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 'auto' }}>
                      {p.person_name}
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    {formatDate(p.published_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 리스트 — 6번째 이후 글 */}
        {list.length > 0 && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            {list.map((p, i) => (
              <div
                key={p.id}
                style={{
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  padding: '0.6rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                {p.category && (
                  <span style={{
                    fontSize: '0.68rem',
                    background: 'var(--accent-lt)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(72,118,191,0.3)',
                    padding: '0.05rem 0.35rem',
                    borderRadius: '2px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {p.category}
                  </span>
                )}
                <Link
                  href={`/posts/${p.id}`}
                  style={{
                    flex: 1,
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.title}
                </Link>
                {p.person_name && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', flexShrink: 0 }}>
                    {p.person_name}
                  </span>
                )}
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', flexShrink: 0 }}>
                  {formatDate(p.published_at)}
                </span>
              </div>
            ))}
          </div>
        )}

        {!hero && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
            게시물이 없습니다.
          </div>
        )}
      </div>

      {/* 사이드바 — 인물 목록 */}
      {persons.length > 0 && (
        <aside style={{
          width: '180px',
          flexShrink: 0,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            background: 'var(--accent-dk)',
            color: '#fff',
            padding: '0.5rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            인물
          </div>
          {persons.map((person, i) => (
            <div
              key={person.id ?? person.name ?? i}
              style={{
                borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              }}
            >
              <Link
                href={`/persons/${person.id ?? person.slug ?? ''}`}
                style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.82rem',
                  color: 'var(--text)',
                  textDecoration: 'none',
                }}
              >
                {person.name}
              </Link>
            </div>
          ))}
        </aside>
      )}
    </div>
  )
}
