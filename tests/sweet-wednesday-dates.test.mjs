import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSweetWednesdayDates } from '../src/lib/sweet-wednesday-dates.ts'

test('renews only explicitly listed dates across the new year', () => {
  const page = `
    Future party dates 2026
    Wednesday 7th October Wednesday 21st October Wednesday 16th December 2026 – our HUGE Christmas party!
    Future party dates 2027
    Wednesday 6th January 2027 Wednesday 20th January Wednesday 3rd February
    Wednesday 7th April
    SWEET WEDNESDAY FACILITIES
  `
  assert.deepEqual(parseSweetWednesdayDates(page, '2026-10-01'), [
    '2026-10-07', '2026-10-21', '2026-12-16',
    '2027-01-06', '2027-01-20', '2027-02-03', '2027-04-07',
  ])
  assert.deepEqual(parseSweetWednesdayDates(page, '2027-04-08'), [])
})

test('rejects impossible or conflicting weekday dates', () => {
  assert.deepEqual(parseSweetWednesdayDates(
    'Future party dates 2027 Wednesday 30th February Wednesday 5th January Wednesday 7th April 2028 SWEET WEDNESDAY FACILITIES',
    '2027-01-01'
  ), [])
})
