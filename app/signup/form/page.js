'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STEPS = ['약관 동의', '정보 입력', '가입 완료']
const CODE_TTL = 180 // 3분(초)

const inputBase = {
  padding: '0.5rem 0.75rem',
  border: '1px solid #ccc',
  borderRadius: '3px',
  fontSize: '0.85rem',
  outline: 'none',
  color: '#111',
  background: '#fff',
}

// 실시간 중복 확인 훅
function useFieldCheck() {
  const [status, setStatus]   = useState(null)
  const [message, setMessage] = useState('')

  const check = useCallback(async (field, value) => {
    if (!value) return
    setStatus('checking'); setMessage('확인 중...')
    try {
      const res  = await fetch(`/api/auth/check?field=${field}&value=${encodeURIComponent(value)}`)
      const data = await res.json()
      if (data.available) { setStatus('ok');    setMessage('사용 가능합니다.') }
      else                { setStatus('taken'); setMessage('이미 사용 중입니다.') }
    } catch {
      setStatus('error'); setMessage('확인 중 오류가 발생했습니다.')
    }
  }, [])

  const reset = useCallback(() => { setStatus(null); setMessage('') }, [])
  return { status, message, check, reset }
}

function CheckBadge({ status, message }) {
  if (!status) return null
  const color = status === 'ok' ? '#27ae60' : status === 'checking' ? '#888' : '#c0392b'
  const prefix = status === 'ok' ? '✓ ' : status === 'checking' ? '' : '✕ '
  return <span style={{ fontSize: '0.72rem', color, marginLeft: '0.5rem', fontWeight: 500 }}>{prefix}{message}</span>
}

// 카운트다운 훅
function useCountdown(initial = 0) {
  const [left, setLeft]   = useState(0)
  const timerRef          = useRef(null)

  function start() {
    clearInterval(timerRef.current)
    setLeft(initial)
    timerRef.current = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
  return { left, start, fmt }
}

export default function SignupFormPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '', password: '', passwordConfirm: '',
    email: '', emailCode: '', nickname: '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  // 이메일 인증 상태
  const [codeSent,     setCodeSent]     = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)
  const [sendingCode,  setSendingCode]  = useState(false)
  const [emailToken,   setEmailToken]   = useState('')

  const usernameCheck = useFieldCheck()
  const nicknameCheck = useFieldCheck()
  const countdown     = useCountdown(CODE_TTL)

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '', submit: '' }))
    if (key === 'username') usernameCheck.reset()
    if (key === 'nickname') nicknameCheck.reset()
    if (key === 'email') { setCodeSent(false); setCodeVerified(false) }
  }

  // 인증번호 발송
  async function handleSendCode() {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors(e => ({ ...e, email: '올바른 이메일 주소를 입력해 주세요.' }))
      return
    }
    setSendingCode(true)
    setErrors(e => ({ ...e, email: '', emailCode: '' }))
    try {
      const res  = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      })
      const data = await res.json()
      if (data.error) {
        setErrors(e => ({ ...e, email: data.error }))
      } else {
        setCodeSent(true)
        setCodeVerified(false)
        setEmailToken(data.token)
        setForm(f => ({ ...f, emailCode: '' }))
        countdown.start()
      }
    } catch {
      setErrors(e => ({ ...e, email: '이메일 발송 중 오류가 발생했습니다.' }))
    } finally {
      setSendingCode(false)
    }
  }

  function validate() {
    const errs = {}
    if (!form.username || !/^[a-z0-9_]{4,20}$/.test(form.username))
      errs.username = '영소문자·숫자·밑줄(_) 4~20자로 입력해 주세요.'
    if (usernameCheck.status === 'taken') errs.username = '이미 사용 중인 아이디입니다.'

    if (!form.password || form.password.length < 6)
      errs.password = '비밀번호는 6자 이상 입력해 주세요.'
    if (form.password !== form.passwordConfirm)
      errs.passwordConfirm = '비밀번호가 일치하지 않습니다.'

    if (!form.nickname || form.nickname.length < 2)
      errs.nickname = '닉네임은 2자 이상 입력해 주세요.'
    if (nicknameCheck.status === 'taken') errs.nickname = '이미 사용 중인 닉네임입니다.'

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = '올바른 이메일 주소를 입력해 주세요.'

    if (!codeSent)
      errs.emailCode = '이메일 인증번호를 먼저 발송해 주세요.'
    else if (!form.emailCode || form.emailCode.length !== 6)
      errs.emailCode = '인증번호 6자리를 입력해 주세요.'
    else if (countdown.left === 0)
      errs.emailCode = '인증번호가 만료되었습니다. 다시 발송해 주세요.'

    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    const res  = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.username, password: form.password,
        email: form.email, nickname: form.nickname,
        emailCode: form.emailCode, emailToken,
      }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.error) {
      // 인증 오류는 emailCode 필드에 표시
      const key = data.error.includes('인증') ? 'emailCode' : 'submit'
      setErrors({ [key]: data.error })
    } else {
      router.push('/signup/done')
    }
  }

  const bc = (errKey, checkStatus) => {
    if (errors[errKey] || checkStatus === 'taken') return '#c0392b'
    if (checkStatus === 'ok') return '#27ae60'
    return '#ccc'
  }

  const expired = codeSent && countdown.left === 0

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
      {/* 타이틀 */}
      <div style={{ background: 'var(--accent-dk)', color: '#fff', padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>
        회원가입
      </div>

      {/* 스텝 */}
      <div style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1.5rem', display: 'flex' }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: i === 1 ? 'var(--accent)' : 'var(--muted)', fontWeight: i === 1 ? 600 : 400 }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--accent)' : 'var(--border)', color: i <= 1 ? '#fff' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600 }}>
                {i === 0 ? '✓' : i + 1}
              </span>
              {step}
            </div>
            {i < 2 && <span style={{ margin: '0 0.75rem', color: 'var(--border)', fontSize: '0.8rem' }}>›</span>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>

            {/* 아이디 */}
            <tr>
              <Th>아이디 *</Th>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input value={form.username} onChange={e => set('username', e.target.value)}
                    onBlur={() => /^[a-z0-9_]{4,20}$/.test(form.username) && usernameCheck.check('username', form.username)}
                    placeholder="영소문자·숫자·밑줄(_) 4~20자" maxLength={20} autoComplete="username"
                    style={{ ...inputBase, width: '220px', borderColor: bc('username', usernameCheck.status) }} />
                  <CheckBadge status={usernameCheck.status} message={usernameCheck.message} />
                </div>
                {errors.username && <ErrMsg>{errors.username}</ErrMsg>}
              </td>
            </tr>
            <Divider />

            {/* 비밀번호 */}
            <tr>
              <Th>비밀번호 *</Th>
              <td style={tdStyle}>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="6자 이상" autoComplete="new-password"
                  style={{ ...inputBase, width: '260px', borderColor: errors.password ? '#c0392b' : '#ccc' }} />
                <Hint>영문, 숫자, 특수문자 조합을 권장합니다.</Hint>
                {errors.password && <ErrMsg>{errors.password}</ErrMsg>}
              </td>
            </tr>
            <Divider />

            {/* 비밀번호 확인 */}
            <tr>
              <Th>비밀번호 확인 *</Th>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="password" value={form.passwordConfirm} onChange={e => set('passwordConfirm', e.target.value)}
                    placeholder="비밀번호 재입력" autoComplete="new-password"
                    style={{ ...inputBase, width: '260px', borderColor: errors.passwordConfirm ? '#c0392b' : form.passwordConfirm && form.password === form.passwordConfirm ? '#27ae60' : '#ccc' }} />
                  {form.passwordConfirm && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: form.password === form.passwordConfirm ? '#27ae60' : '#c0392b' }}>
                      {form.password === form.passwordConfirm ? '✓ 일치' : '✕ 불일치'}
                    </span>
                  )}
                </div>
                {errors.passwordConfirm && <ErrMsg>{errors.passwordConfirm}</ErrMsg>}
              </td>
            </tr>
            <Divider />

            {/* 닉네임 */}
            <tr>
              <Th>닉네임 *</Th>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input value={form.nickname} onChange={e => set('nickname', e.target.value)}
                    onBlur={() => form.nickname.length >= 2 && nicknameCheck.check('nickname', form.nickname)}
                    placeholder="2~20자" maxLength={20}
                    style={{ ...inputBase, width: '220px', borderColor: bc('nickname', nicknameCheck.status) }} />
                  <CheckBadge status={nicknameCheck.status} message={nicknameCheck.message} />
                </div>
                {errors.nickname && <ErrMsg>{errors.nickname}</ErrMsg>}
              </td>
            </tr>
            <Divider />

            {/* 이메일 */}
            <tr>
              <Th>이메일 *</Th>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="example@email.com" readOnly={codeSent && !expired}
                    style={{ ...inputBase, width: '230px', borderColor: errors.email ? '#c0392b' : codeVerified ? '#27ae60' : '#ccc', background: codeSent && !expired ? '#f8f8f8' : '#fff' }} />
                  <button type="button" onClick={handleSendCode} disabled={sendingCode || (codeSent && !expired)}
                    style={{ padding: '0.5rem 0.85rem', background: codeSent && !expired ? '#aaa' : 'var(--accent-dk)', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '0.78rem', cursor: codeSent && !expired ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                    {sendingCode ? '발송 중...' : expired ? '재발송' : codeSent ? '재발송' : '인증번호 받기'}
                  </button>
                </div>
                {errors.email && <ErrMsg>{errors.email}</ErrMsg>}
                {codeSent && !errors.email && (
                  <p style={{ fontSize: '0.72rem', color: expired ? '#c0392b' : '#27ae60', marginTop: '0.3rem' }}>
                    {expired ? '인증번호가 만료되었습니다. 재발송해 주세요.' : `✓ 인증번호가 발송되었습니다. (${form.email})`}
                  </p>
                )}
              </td>
            </tr>

            {/* 인증번호 입력 */}
            {codeSent && (
              <>
                <Divider />
                <tr>
                  <Th>인증번호 *</Th>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input value={form.emailCode} onChange={e => set('emailCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="숫자 6자리" maxLength={6} inputMode="numeric"
                        style={{ ...inputBase, width: '140px', letterSpacing: '0.2em', textAlign: 'center', fontSize: '1rem', borderColor: errors.emailCode ? '#c0392b' : '#ccc' }} />
                      {/* 카운트다운 */}
                      {!expired && (
                        <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: countdown.left <= 30 ? '#c0392b' : '#888', fontWeight: 600 }}>
                          {countdown.fmt(countdown.left)}
                        </span>
                      )}
                    </div>
                    {errors.emailCode && <ErrMsg>{errors.emailCode}</ErrMsg>}
                    {!errors.emailCode && <Hint>이메일로 발송된 6자리 숫자를 입력해 주세요.</Hint>}
                  </td>
                </tr>
              </>
            )}

          </tbody>
        </table>

        {errors.submit && (
          <div style={{ margin: '1rem 0 0', padding: '0.7rem 1rem', background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '3px', fontSize: '0.82rem', color: '#c0392b' }}>
            {errors.submit}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem' }}>
          <Link href="/signup">
            <button type="button" style={{ padding: '0.6rem 1.8rem', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', borderRadius: '3px', fontSize: '0.85rem', cursor: 'pointer' }}>
              이전
            </button>
          </Link>
          <button type="submit" disabled={loading}
            style={{ padding: '0.6rem 2.5rem', border: 'none', background: loading ? '#aaa' : 'var(--accent)', color: '#fff', borderRadius: '3px', fontSize: '0.85rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '처리 중...' : '가입하기'}
          </button>
        </div>
      </form>
    </div>
  )
}

const tdStyle = { padding: '0.65rem 0' }

function Th({ children }) {
  return <td style={{ padding: '0.65rem 1rem 0.65rem 0', width: '130px', fontSize: '0.85rem', fontWeight: 500, color: '#333', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{children}</td>
}
function Hint({ children }) {
  return <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{children}</p>
}
function ErrMsg({ children }) {
  return <p style={{ fontSize: '0.72rem', color: '#c0392b', marginTop: '0.25rem', fontWeight: 500 }}>{children}</p>
}
function Divider() {
  return <tr><td colSpan={2} style={{ padding: 0 }}><div style={{ borderTop: '1px solid #f0f0f0' }} /></td></tr>
}
