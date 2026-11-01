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

test('unchanged unpublished future records do not turn date expiry into a critical loss', () => {
  const hidden = { event_id: 'old-unpublished', event_date: '2027-09-04', is_published: false }
  const data = evidence()
  data.snapshot.events_json.push(hidden)
  data.currentEvents.push({ ...hidden })
  assert.equal(isNaturalCalendarExpiry(data), true)
  // A formerly published future row has now been hidden: retain critical severity.
  data.snapshot.events_json[2] = { ...hidden, is_published: true }
  assert.equal(isNaturalCalendarExpiry(data), false)
  data.snapshot.events_json[2] = hidden
  data.currentEvents[1] = { ...hidden, event_date: '2027-09-05' }
  assert.equal(isNaturalCalendarExpiry(data), false)
  data.currentEvents.pop()
  assert.equal(isNaturalCalendarExpiry(data), false)
})
