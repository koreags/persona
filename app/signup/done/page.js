import Link from 'next/link'

export default function SignupDonePage() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ background: 'var(--accent-dk)', color: '#fff', padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>
        회원가입
      </div>

      {/* 스텝 표시 */}
      <div style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1.5rem', display: 'flex', gap: 0 }}>
        {['약관 동의', '정보 입력', '가입 완료'].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.8rem',
              color: i === 2 ? 'var(--accent)' : 'var(--muted)',
              fontWeight: i === 2 ? 600 : 400,
            }}>
              <span style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: i < 2 ? 'var(--accent)' : i === 2 ? 'var(--accent)' : 'var(--border)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 600, flexShrink: 0,
              }}>
                {i < 2 ? '✓' : '✓'}
              </span>
              {step}
            </div>
            {i < 2 && <span style={{ margin: '0 0.75rem', color: 'var(--border)', fontSize: '0.8rem' }}>›</span>}
          </div>
        ))}
      </div>

      <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>
          회원가입이 완료되었습니다!
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          인물지의 회원이 되신 것을 환영합니다.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Link href="/">
            <button style={{ padding: '0.6rem 2rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              메인으로 가기
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
