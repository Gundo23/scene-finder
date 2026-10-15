import test from 'node:test'
import assert from 'node:assert/strict'
import { monitorsEventCalendar } from '../src/lib/event-monitoring.ts'

test('excludes curated closed locations and unconfirmed directory leads', () => {
  for (const kind of ['closed', ' Closed ', 'lead']) assert.equal(monitorsEventCalendar(kind), false)
})

test('keeps active venues, travelling organisers and unknown classifications monitored', () => {
  for (const kind of ['fixed_venue', 'event_series', 'multi_location', 'needs_review', '', null, undefined]) {
    assert.equal(monitorsEventCalendar(kind), true)
  }
})
