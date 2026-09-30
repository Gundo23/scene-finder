import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE = 'sf_admin_session'
export const ADMIN_SESSION_SECONDS = 12 * 60 * 60

function signature(payload: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('Admin session key is not configured')
  return createHmac('sha256', key).update(payload).digest('base64url')
}

export function createAdminSession(now = Date.now()) {
  const payload = String(now + ADMIN_SESSION_SECONDS * 1000)
  return `${payload}.${signature(payload)}`
}

export function validAdminSession(token: string | undefined, now = Date.now()) {
  if (!token || !/^\d{13}\.[A-Za-z0-9_-]{43}$/.test(token)) return false
  const [payload, supplied] = token.split('.')
  const expires = Number(payload)
  if (expires <= now || expires > now + ADMIN_SESSION_SECONDS * 1000) return false
  const expected = signature(payload)
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
}

export function publicEventSourceUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    const host = url.hostname.toLowerCase()
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !host.includes('.') || /^(?:localhost|\d+\.\d+\.\d+\.\d+)$/.test(host) ||
        /\.(?:local|internal|localhost|test|invalid)$/.test(host)) return null
    return url.href
  } catch { return null }
}
