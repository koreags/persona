'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '/').replace('.', '')
}

function joinDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const TABS = ['내가 쓴 글', '내가 쓴 댓글']

export default function MePage() {
  const router = useRouter()
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState(0)
  const [posts,   setPosts]   = useState([])
  const [postsLoading, setPostsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.replace('/login?next=/me'); return }
        setUser(d.user)
        setLoading(false)
      })
  }, [router])

  useEffect(() => {
    if (!user) return
    setPostsLoading(true)
    fetch('/api/auth/my-posts')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setPosts(d)
        } else {
          console.error('[my-posts]', d)
          setPosts([])
        }
        setPostsLoading(false)
      })
  }, [user])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
      불러오는 중...
    </div>
  )

  const initial = (user?.nickname || '?')[0].toUpperCase()
  const publishedPosts = posts.filter(p => p.status === 'published')
  const totalLikes = publishedPosts.reduce((s, p) => s + (p.like_count || 0), 0)

  return (
    <div>
      {/* ── 프로필 카드 ── */}
      <div style={{
        background: 'var(--accent-dk)',
        color: '#fff',
        padding: '1.25rem 1.25rem 0',
        borderRadius: '3px 3px 0 0',
      }}>
        {/* 유저 정보 행 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
          {/* 아바타 */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.25)',
          }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              {user.nickname}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#aac4e8' }}>
              @{user.username}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7ba7e0', marginTop: '0.1rem' }}>
              {user.email}
            </div>
          </div>
          <button
            onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); router.refresh() }}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#aac4e8', padding: '0.35rem 0.8rem', borderRadius: '3px', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            로그아웃
          </button>
        </div>

        {/* 통계 행 */}
        <div style={{
          display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          margin: '0 -1.25rem',
        }}>
          {[
            { label: '작성글', value: posts.length },
            { label: '받은 추천', value: totalLikes },
          ].map(({ label, value }, i) => (
            <div key={i} style={{
              flex: 1, padding: '0.75rem 0', textAlign: 'center',
              borderRight: i < 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.68rem', color: '#7ba7e0', marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', margin: '0 -1.25rem' }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              flex: 1, padding: '0.7rem 0',
              background: 'none', border: 'none',
              borderBottom: tab === i ? '2px solid #fff' : '2px solid transparent',
              color: tab === i ? '#fff' : '#7ba7e0',
              fontSize: '0.82rem', fontWeight: tab === i ? 600 : 400,
              cursor: 'pointer', transition: 'color 0.15s',
            }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 3px 3px' }}>

        {/* 내가 쓴 글 */}
        {tab === 0 && (
          postsLoading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>작성한 글이 없습니다.</p>
              <Link href="/submit">
                <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '3px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  첫 글 작성하기
                </button>
              </Link>
            </div>
          ) : (
            <table className="board-table">
              <thead>
                <tr>
                  <th className="title-col" style={{ paddingLeft: '1rem' }}>제목</th>
                  <th>상태</th>
                  <th>날짜</th>
                  <th>추천</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td className="col-title" style={{ paddingLeft: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {p.category && (
                          <span style={{ fontSize: '0.68rem', background: 'var(--accent-lt)', color: 'var(--accent)', border: '1px solid rgba(72,118,191,0.3)', padding: '0.05rem 0.4rem', borderRadius: '2px' }}>
                            {p.category}
                          </span>
                        )}
                        {p.status === 'published'
                          ? <Link href={`/posts/${p.id}`} className="post-title">{p.title}</Link>
                          : <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{p.title}</span>
                        }
                      </div>
                      {p.person_name && <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{p.person_name}</div>}
                    </td>
                    <td className="col-author">
                      <span style={{
                        fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '2px',
                        background: p.status === 'published' ? 'rgba(39,174,96,0.1)' : 'rgba(212,168,83,0.1)',
                        color: p.status === 'published' ? 'var(--green)' : '#c8973a',
                        border: `1px solid ${p.status === 'published' ? 'rgba(39,174,96,0.3)' : 'rgba(212,168,83,0.3)'}`,
                      }}>
                        {p.status === 'published' ? '게시됨' : '검토중'}
                      </span>
                    </td>
                    <td className="col-date">{formatDate(p.published_at)}</td>
                    <td className="col-views" style={{ color: (p.like_count > 0) ? '#c0392b' : 'var(--muted)' }}>
                      {p.like_count > 0 ? `▲ ${p.like_count}` : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* 내가 쓴 댓글 */}
        {tab === 1 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>아직 댓글 기능이 준비 중입니다.</p>
            <p style={{ fontSize: '0.78rem' }}>곧 업데이트될 예정입니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
