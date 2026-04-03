import { createHmac } from 'crypto'

const SECRET = process.env.EMAIL_CODE_SECRET || 'fallback-secret'
export const SESSION_COOKIE = 'member_session'

export function createSessionToken(user) {
  const payload = Buffer.from(JSON.stringify({
    userId:   user.userId,
    username: user.username,
    nickname: user.nickname,
    email:    user.email,
    iat:      Date.now(),
  })).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifySessionToken(token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, sig] = parts
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url')
  if (sig !== expected) return null
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch {
    return null
  }
}
