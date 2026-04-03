import { createHmac } from 'crypto'

const SECRET = process.env.EMAIL_CODE_SECRET || 'fallback-secret'

/** 인증 토큰 생성: base64(payload).signature */
export function createEmailToken(email, code) {
  const exp     = Date.now() + 3 * 60 * 1000 // 3분
  const payload = Buffer.from(JSON.stringify({ email, code, exp })).toString('base64url')
  const sig     = createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

/** 인증 토큰 검증 — { ok, email, code } 또는 { ok: false, error } */
export function verifyEmailToken(token, inputCode) {
  if (!token || !inputCode) return { ok: false, error: '인증 정보가 없습니다.' }

  const parts = token.split('.')
  if (parts.length !== 2) return { ok: false, error: '인증 토큰이 올바르지 않습니다.' }

  const [payload, sig] = parts
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url')
  if (sig !== expected) return { ok: false, error: '인증 토큰이 올바르지 않습니다.' }

  let data
  try { data = JSON.parse(Buffer.from(payload, 'base64url').toString()) }
  catch { return { ok: false, error: '인증 토큰 파싱 오류입니다.' } }

  if (Date.now() > data.exp) return { ok: false, error: '인증번호가 만료되었습니다. 다시 발송해 주세요.' }
  if (data.code !== inputCode) return { ok: false, error: '인증번호가 올바르지 않습니다.' }

  return { ok: true, email: data.email }
}
