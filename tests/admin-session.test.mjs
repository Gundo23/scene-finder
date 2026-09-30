import assert from 'node:assert/strict'
import test from 'node:test'
import { ADMIN_SESSION_SECONDS, createAdminSession, publicEventSourceUrl, validAdminSession } from '../src/lib/admin-session.ts'

test('signed admin sessions expire and reject tampering', () => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key-only'
  const now = 1_780_000_000_000
  const token = createAdminSession(now)
  assert.equal(validAdminSession(token, now), true)
  assert.equal(validAdminSession(token, now + ADMIN_SESSION_SECONDS * 1000), false)
  assert.equal(validAdminSession(token.replace(/.$/, token.endsWith('A') ? 'B' : 'A'), now), false)
  assert.equal(validAdminSession(undefined, now), false)
})

test('only public HTTPS event sources can be registered', () => {
  assert.equal(publicEventSourceUrl('https://www.curious-club.com/special'), 'https://www.curious-club.com/special')
  for (const url of ['http://example.com/events', 'https://localhost/events',
    'https://127.0.0.1/events', 'https://user:pass@example.com/events',
    'https://example.com:8443/events', 'file:///etc/passwd']) {
    assert.equal(publicEventSourceUrl(url), null, url)
  }
})
