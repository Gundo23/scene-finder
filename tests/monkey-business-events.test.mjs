import test from 'node:test'
import assert from 'node:assert/strict'
import { isMonkeyBusinessEventUrl } from '../src/lib/monkey-business-events.ts'

test('requires the official Wix event-detail page, not a promo or index', () => {
  assert.equal(isMonkeyBusinessEventUrl('https://www.monkeybusiness1.com/event-details/save-the-date-halloween-a-bump-in-the-night-party'), true)
  for (const url of ['https://www.monkeybusiness1.com/coming-soon-03', 'https://www.monkeybusiness1.com/copy-of-home',
    'https://www.monkeybusiness1.com/', 'https://other.example/event-details/party',
    'http://www.monkeybusiness1.com/event-details/party', 'not a URL']) {
    assert.equal(isMonkeyBusinessEventUrl(url), false)
  }
})
