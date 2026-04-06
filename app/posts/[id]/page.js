'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function PostPage() {
  const { id } = useParams()
  const router = useRouter()
  const [post,      setPost]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [likeCount, setLikeCount] = useState(0)
  const [liked,     setLiked]     = useState(false)
  const [liking,    setLiking]    = useState(false)
  const [user,      setUser]      = useState(null)
  const [isAdmin,   setIsAdmin]   = useState(false)
  const [deleting,  setDeleting]  = useState(false)

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(r => r.json())
      .then(data => {
        setPost(data)
        setLikeCount(data.like_count || 0)
        setLoading(false)
      })

    // 조회수 증가
    fetch(`/api/posts/${id}/view`, { method: 'POST' })

    const stored = localStorage.getItem(`liked_${id}`)
    if (stored) queueMicrotask(() => setLiked(true))

    // 로그인 정보 + 관리자 여부
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        setUser(d.user || null)
        setIsAdmin(d.isAdmin || false)
      })
  }, [id])

  async function handleLike() {
    if (liking) return
    if (!isAdmin && liked) return   // 일반 사용자: 1회 제한
    setLiking(true)
    try {
      const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' })
      const data = await res.json()
      console.log('[like] status:', res.status, 'body:', data)
      if (data.error) {
        console.warn('[like] API error:', data.error)
        alert('추천 실패: ' + data.error)
      } else {
        setLikeCount(data.like_count)
        if (!isAdmin) {
          setLiked(true)
          localStorage.setItem(`liked_${id}`, '1')
        }
      }
    } catch (err) {
      console.error('[like] fetch failed:', err)
    } finally {
      setLiking(false)
    }
  }

  async function handleDelete() {
    if (!confirm('정말 이 글을 삭제하시겠습니까?')) return
    setDeleting(true)
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.ok) {
      router.push('/')
      router.refresh()
    } else {
      alert(data.error || '삭제에 실패했습니다.')
      setDeleting(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)' }}>불러오는 중...</span>
    </div>
  )

  if (!post || post.error) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>글을 찾을 수 없습니다</p>
      <Link href="/"><button style={{ marginTop: '1rem', background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer' }}>← 목록으로</button></Link>
    </div>
  )

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  const sources = post.sources
    ? (typeof post.sources === 'string' ? JSON.parse(post.sources) : post.sources)
    : []

  const canDelete = isAdmin || (user && user.nickname === post.author_name)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
      {/* 게시판 헤더 */}
      <div style={{ background: 'var(--accent-dk)', color: '#fff', padding: '0.6rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link href="/" style={{ color: '#aac4e8', fontSize: '0.8rem' }}>← 목록</Link>
        <span style={{ color: '#4a6a9a' }}>/</span>
        <span>{post.category || '전체'}</span>
      </div>

      <div style={{ padding: '1.5rem 1.75rem' }}>
        {/* 제목 */}
        <h1 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '0.75rem' }}>
          {post.title}
        </h1>

        {/* 메타 정보 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1.2rem',
          paddingBottom: '0.9rem', borderBottom: '1px solid var(--border)',
          fontSize: '0.78rem', color: 'var(--muted)', flexWrap: 'wrap',
        }}>
          {post.person_name && (
            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>인물: {post.person_name}</span>
          )}
          <span>{date}</span>
          {post.post_type !== 'ai' && <span className="user-badge">독자 투고 · {post.author_name || '익명'}</span>}
          <span>조회 {post.view_count || 0}</span>
          <span style={{ color: likeCount > 0 ? '#c0392b' : 'var(--muted)' }}>추천 {likeCount}</span>

          {/* 삭제 버튼 */}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                marginLeft: 'auto', padding: '0.25rem 0.7rem',
                background: 'none', border: '1px solid #c0392b',
                color: '#c0392b', borderRadius: '3px',
                fontSize: '0.72rem', cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          )}
        </div>

        {/* 본문 */}
        <div style={{ fontSize: '0.95rem', lineHeight: 2, color: '#111', whiteSpace: 'pre-wrap', padding: '1.5rem 0' }}>
          {post.content}
        </div>

        {/* 출처 */}
        {sources.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.6rem' }}>참고 출처</div>
            {sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.3rem', textDecoration: 'underline' }}>{s.title || s.url}</a>
            ))}
          </div>
        )}

        {/* 추천 버튼 */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleLike}
            disabled={(!isAdmin && liked) || liking}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              padding: '0.6rem 2rem',
              border: `2px solid ${liked ? '#c0392b' : 'var(--border)'}`,
              borderRadius: '4px',
              background: liked ? 'rgba(192,57,43,0.06)' : 'var(--surface2)',
              color: liked ? '#c0392b' : 'var(--muted)',
              cursor: liked ? 'default' : 'pointer',
              transition: 'all 0.15s',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>{liked ? '▲' : '△'}</span>
            <span>추천 {likeCount}</span>
            {liked && <span style={{ fontSize: '0.65rem' }}>추천하셨습니다</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
