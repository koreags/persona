'use client'
import { useState, useEffect } from 'react'

const FIXED_PERSONS = ['도널드 트럼프', '일론 머스크']

export default function AdminPage() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [crawling, setCrawling] = useState(false)
  const [crawlLog, setCrawlLog] = useState('')

  // 인물 관리
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNameEn, setNewNameEn] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [addingPerson, setAddingPerson] = useState(false)

  useEffect(() => {
    fetchDrafts()
    fetchPersons()
  }, [])

  async function fetchDrafts() {
    setLoading(true)
    const res = await fetch('/api/drafts')
    const data = await res.json()
    setDrafts(data || [])
    setLoading(false)
  }

  async function fetchPersons() {
    const res = await fetch('/api/persons')
    const data = await res.json()
    setPersons(data || [])
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function publish(id) {
    await fetch('/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setDrafts(d => d.filter(p => p.id !== id))
    showToast('✅ 게시되었습니다!')
  }

  async function reject(id) {
    await fetch('/api/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setDrafts(d => d.filter(p => p.id !== id))
    showToast('반려 처리되었습니다')
  }

  async function runCrawler() {
    setCrawling(true)
    setCrawlLog('')
    try {
      const res = await fetch('/api/crawl', { method: 'POST' })
      const data = await res.json()
      setCrawlLog(data.log || '')
      if (data.ok) {
        showToast('✅ 크롤러 완료! 초안을 새로고침합니다.')
        fetchDrafts()
      } else {
        showToast('❌ 크롤러 실행 중 오류가 발생했습니다.')
      }
    } catch (e) {
      setCrawlLog(e.message)
      showToast('❌ 네트워크 오류')
    } finally {
      setCrawling(false)
    }
  }

  async function addPerson(e) {
    e.preventDefault()
    if (!newName.trim() || !newNameEn.trim()) return
    setAddingPerson(true)
    const res = await fetch('/api/persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), name_en: newNameEn.trim(), category: newCategory.trim() }),
    })
    const data = await res.json()
    if (data.error) {
      showToast('❌ ' + data.error)
    } else {
      setNewName('')
      setNewNameEn('')
      setNewCategory('')
      fetchPersons()
      showToast('✅ 인물이 추가되었습니다.')
    }
    setAddingPerson(false)
  }

  async function removePerson(id) {
    await fetch('/api/persons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchPersons()
    showToast('인물이 제거되었습니다.')
  }

  function formatDate(str) {
    if (!str) return ''
    return new Date(str).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const activePeersons = persons.filter(p => p.active)

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem clamp(1rem, 4vw, 2rem)' }}>

      {/* ── 헤더 ── */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="label" style={{ marginBottom: '0.4rem' }}>관리자</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>초안 검토</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.3rem' }}>게시 전 내용을 확인하고 발행하세요</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.8rem 1.2rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-hero)', fontSize: '2rem', color: 'var(--accent)', lineHeight: 1 }}>{drafts.length}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>검토 대기</div>
          </div>
          <button
            onClick={runCrawler}
            disabled={crawling}
            style={{
              background: crawling ? 'var(--surface2)' : 'var(--accent-dk)',
              color: crawling ? 'var(--muted)' : '#fff',
              border: '1px solid var(--border)',
              padding: '0.6rem 1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              cursor: crawling ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
              minWidth: '90px',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{crawling ? '⏳' : '🤖'}</span>
            <span>{crawling ? '실행 중...' : '크롤러 실행'}</span>
          </button>
        </div>
      </div>

      {/* ── 크롤러 로그 ── */}
      {crawlLog && (
        <div style={{ background: '#0e0e0e', border: '1px solid var(--border)', borderRadius: '4px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>크롤러 로그</span>
            <button onClick={() => setCrawlLog('')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.8rem', cursor: 'pointer' }}>✕</button>
          </div>
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#ccc', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '240px', overflowY: 'auto', margin: 0 }}>{crawlLog}</pre>
        </div>
      )}

      {/* ── 크롤링 인물 관리 ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ background: 'var(--accent-dk)', color: '#fff', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
          크롤링 인물 관리
        </div>
        <div style={{ padding: '1rem' }}>

          {/* 고정 인물 */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              고정 인물 (항상 크롤링)
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {FIXED_PERSONS.map(name => (
                <span key={name} style={{
                  background: 'rgba(72,118,191,0.1)',
                  border: '1px solid rgba(72,118,191,0.4)',
                  color: 'var(--accent)',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '2px',
                  fontSize: '0.8rem',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                  🔒 {name}
                </span>
              ))}
            </div>
          </div>

          {/* 추가된 인물 목록 */}
          {activePeersons.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                추가 인물
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {activePeersons.map(p => (
                  <span key={p.id} style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    padding: '0.25rem 0.5rem 0.25rem 0.7rem',
                    borderRadius: '2px',
                    fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}>
                    {p.name}
                    {p.category && <span style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>· {p.category}</span>}
                    <button
                      onClick={() => removePerson(p.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '0 0.1rem', lineHeight: 1 }}
                      title="제거"
                    >✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 인물 추가 폼 */}
          <form onSubmit={addPerson} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.08em' }}>한글 이름 *</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="예: 제프 베이조스"
                required
                style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '2px', fontSize: '0.82rem', width: '140px', background: '#fff', color: '#111', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.08em' }}>영문 이름 *</label>
              <input
                value={newNameEn}
                onChange={e => setNewNameEn(e.target.value)}
                placeholder="예: Jeff Bezos"
                required
                style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '2px', fontSize: '0.82rem', width: '150px', background: '#fff', color: '#111', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.08em' }}>카테고리</label>
              <input
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="예: 비즈니스"
                style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '2px', fontSize: '0.82rem', width: '110px', background: '#fff', color: '#111', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={addingPerson}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '2px', fontSize: '0.8rem', cursor: addingPerson ? 'not-allowed' : 'pointer' }}
            >
              + 추가
            </button>
          </form>
        </div>
      </div>

      {/* ── 초안 목록 ── */}
      {loading && <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>불러오는 중...</p>}

      {!loading && drafts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>검토할 초안이 없습니다</p>
          <p style={{ fontSize: '0.82rem' }}>크롤러를 실행하면 새 초안이 생성됩니다.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {drafts.map(post => (
          <div key={post.id} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${post.post_type === 'ai' ? 'var(--accent)' : 'var(--green)'}`,
            padding: '1.4rem',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: post.post_type === 'ai' ? 'var(--accent)' : 'var(--green)', marginBottom: '0.4rem' }}>
                {post.post_type === 'ai' ? '🤖 AI 크롤 요약' : '👤 독자 투고'}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '0.3rem' }}>{post.title}</h3>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>인물: {post.person_name}</div>
              <p style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.7 }}>{post.excerpt}</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--muted)', marginTop: '0.6rem' }}>
                {post.post_type === 'ai' ? `수집: ${formatDate(post.crawled_at)}` : `투고자: ${post.author_name || '익명'} · ${formatDate(post.submitted_at)}`}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '90px' }}>
              <button onClick={() => publish(post.id)} style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '0.45rem 0.8rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>✓ 게시</button>
              <button onClick={() => reject(post.id)} style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', padding: '0.45rem 0.8rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>✕ 반려</button>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--surface)', border: '1px solid var(--green)', color: 'var(--green)', padding: '0.8rem 1.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', zIndex: 999 }}>{toast}</div>
      )}
    </main>
  )
}
