import test from 'node:test'
import assert from 'node:assert/strict'
import { selectVenueIds, isPrioritySlot } from '../src/lib/venue-scheduling.ts'

const now = new Date('2026-10-12T18:00:00Z')
const sources = [
  { venue_id: 'normal', last_checked: '2026-10-11T18:00:00Z' },
  { venue_id: 'normal', last_checked: '2026-10-12T17:00:00Z' },
  { venue_id: 'empty', last_checked: '2026-10-12T10:00:00Z' },
  { venue_id: 'runway', last_checked: '2026-10-12T04:00:00Z' },
  { venue_id: 'fresh_empty', last_checked: '2026-10-12T17:00:00Z' },
]
const health = [
  { venue_id: 'empty', visible_future_count: 0, last_future_event_date: null },
  { venue_id: 'runway', visible_future_count: 2, last_future_event_date: '2026-10-18' },
  { venue_id: 'fresh_empty', visible_future_count: 0, last_future_event_date: null },
]

test('oldest-first slots preserve whole-venue scheduling', () => {
  assert.deepEqual(selectVenueIds(sources, health, 2, now, false), ['normal', 'runway'])
})

test('priority slot picks due zero calendars, then short runway, without rechecking fresh zeros', () => {
  assert.deepEqual(selectVenueIds(sources, health, 2, now, true), ['empty', 'runway'])
  assert.deepEqual(selectVenueIds(sources, health, 4, now, true),
    ['empty', 'runway', 'normal', 'fresh_empty'])
})

test('priority uses a fixed one-in-twelve rotation; missing health falls back to oldest', () => {
  const slots = Array.from({ length: 24 }, (_, index) =>
    isPrioritySlot(new Date(now.getTime() + index * 10 * 60 * 1000)))
  assert.deepEqual(slots.flatMap((value, index) => value ? [index] : []), [0, 12])
  assert.deepEqual(selectVenueIds(sources, [], 1, now, true), ['normal'])
})

test('routine scrapes wait twelve hours without delaying new sources', () => {
  assert.deepEqual(selectVenueIds(sources, health, 2, now, false, 12 * 60 * 60 * 1000),
    ['normal', 'runway'])
  assert.deepEqual(selectVenueIds([
    { venue_id: 'due', last_checked: '2026-10-11T11:00:00Z' },
  ], [], 2, now, false, 12 * 60 * 60 * 1000), ['due'])
  assert.deepEqual(selectVenueIds([
    { venue_id: 'new', last_checked: null },
    { venue_id: 'recent', last_checked: '2026-10-12T17:00:00Z' },
  ], [], 2, now, false, 12 * 60 * 60 * 1000), ['new'])
  assert.deepEqual(selectVenueIds([
    { venue_id: 'recent', last_checked: '2026-10-12T17:00:00Z' },
  ], [], 2, now, false, 12 * 60 * 60 * 1000), [])
})

test('priority slots retry empty and short-runway venues before the routine age', () => {
  assert.deepEqual(selectVenueIds(sources, health, 2, now, true, 12 * 60 * 60 * 1000),
    ['empty', 'runway'])
  assert.deepEqual(selectVenueIds(sources, [], 2, now, true, 12 * 60 * 60 * 1000),
    ['normal', 'runway'])
})
