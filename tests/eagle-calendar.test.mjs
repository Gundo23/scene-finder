import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { parseEagleCalendar, EAGLE_CALENDAR_URL } from '../src/lib/eagle-calendar.ts'

const actual = fs.readFileSync(new URL('./fixtures/eagle-home-2026-10-17.html', import.meta.url), 'utf8')
const parse = (html = actual, today = '2026-10-17', url = EAGLE_CALENDAR_URL) => parseEagleCalendar(html, url, today)
const change = (update) => actual.replace(/(<script[^>]*id="wix-warmup-data"[^>]*>)([\s\S]*?)(<\/script>)/,
  (_, before, json, after) => { const data = JSON.parse(json); update(data.appsWarmupData['events-app'].widget.events.events); return before + JSON.stringify(data) + after })

test('actual homepage recovers 17 future events, including November, using local DST times', () => {
  const events = parse()
  assert.equal(events.length, 17)
  assert.equal(events.at(-1).event_date, '2026-11-14')
  assert.equal(events.find(e => e.text === '80:20').start_time, '21:00')
  assert.equal(events.find(e => e.event_date === '2026-10-18').start_time, '20:00')
  assert.equal(events.find(e => e.event_date === '2026-10-25').start_time, '20:00')
  assert.equal(events.find(e => e.text === 'Athena').start_time, '21:00')
  assert.equal(parse(actual + actual).length, 17)
  assert.deepEqual(parse(actual, '2026-11-15'), [])
})

test('requires the same title and explicit date in a visible first-party card', () => {
  assert.equal(parse(change(events => { events[1].title = 'Unpublished replacement' })).length, 16)
  assert.equal(parse(change(events => { events[1].scheduling.config.startDate = '2026-11-17T20:00:00.000Z' })).length, 16)
  assert.equal(parse(actual.replace('Sat 17 Oct', 'Fri 17 Oct')).length, 16)
  assert.deepEqual(parse(actual.replaceAll('https://www.eaglelondon.com/event-details/', 'https://other.example/event-details/')), [])
  assert.deepEqual(parse(actual, '2026-10-17', 'https://other.example/'), [])
})

test('holds cancelled, unpublished, undated, invalid and unrecognised event records', () => {
  for (const update of [
    e => { e.status = 2 }, e => { e.publishedDate = null },
    e => { e.scheduling.config.scheduleTbd = true },
    e => { e.scheduling.config.timeZoneId = 'America/New_York' },
    e => { e.scheduling.config.startDate = '2026-02-31T20:00:00.000Z' },
    e => { e.slug = '../unrelated-page' },
  ]) assert.equal(parse(change(events => update(events[1]))).length, 16)
  assert.deepEqual(parse(actual.replace('id="wix-warmup-data"', 'id="other-data"')), [])
  assert.deepEqual(parse(actual.replace(/<script[\s\S]*?<\/script>/, '<script id="wix-warmup-data" type="application/json">broken</script>')), [])
  assert.deepEqual(parse('<h1>Site Unavailable</h1>'), [])
  assert.deepEqual(parse(actual, '2026-02-31'), [])
})

test('a recurrence rule or unrelated JSON object cannot project additional occurrences', () => {
  const changed = change(events => {
    events[1].scheduling.config.recurrences = { occurrences: [{ startDate: '2026-11-17T20:00:00.000Z' }] }
    events.push({ ...events[1], slug: 'unlisted-occurrence' })
  })
  assert.deepEqual(parse(changed), parse())
})
