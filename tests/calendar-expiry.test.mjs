import test from 'node:test'
import assert from 'node:assert/strict'
import { isNaturalCalendarExpiry } from '../src/lib/calendar-expiry.ts'

const old = { event_id: 'past', event_date: '2026-09-25', is_published: true }
const last = { event_id: 'last', event_date: '2026-10-30', is_published: true }
const evidence = () => ({ today: '2026-10-31', now: new Date('2026-10-31T00:07:00Z'),
  lastCompletedSuccess: '2026-10-30T10:40:10Z', latestSourceAttempt: '2026-10-30T10:40:00Z',
  snapshot: { created_at: '2026-10-30T10:40:10Z', events_json: [old, last] }, currentEvents: [last] })

test('recognises the midnight expiry only when snapshot rows are still published unchanged', () => {
  assert.equal(isNaturalCalendarExpiry(evidence()), true)
  for (const currentEvents of [[], [{ ...last, is_published: false }], [{ ...last, event_date: '2026-11-01' }],
    [{ ...last, event_date: null }], [{ ...last, event_id: 'replacement' }], [last, { ...last, event_id: 'extra' }]]) {
    assert.equal(isNaturalCalendarExpiry({ ...evidence(), currentEvents }), false)
  }
})

test('keeps future/undated loss and failed or stale sources critical', () => {
  for (const event_date of ['2026-11-01', null]) {
    const data = evidence()
    data.snapshot.events_json.push({ ...last, event_id: 'missing', event_date })
    assert.equal(isNaturalCalendarExpiry(data), false)
  }
  assert.equal(isNaturalCalendarExpiry({ ...evidence(), latestSourceAttempt: '2026-10-30T20:00:00Z' }), false)
  assert.equal(isNaturalCalendarExpiry({ ...evidence(), lastCompletedSuccess: '2026-10-25T10:00:00Z' }), false)
  assert.equal(isNaturalCalendarExpiry({ ...evidence(), snapshot: null }), false)
  assert.equal(isNaturalCalendarExpiry({ ...evidence(), today: '2026-02-30' }), false)
})
