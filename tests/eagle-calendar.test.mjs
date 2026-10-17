import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { cleanText } from '../src/lib/cleanText.ts'
import { parseEagleCalendar, EAGLE_CALENDAR_URL, isEagleNumericTitle, isVerifiedEagleNumericTitle } from '../src/lib/eagle-calendar.ts'

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

test('the actual scraper cleanup preserves 80:20 instead of replacing it with description prose', () => {
  const source = fs.readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
  const extract = (name) => {
    const start = source.indexOf(`function ${name}(`)
    assert.ok(start >= 0)
    const end = source.indexOf('\nfunction ', start + 1)
    return source.slice(start, end < 0 ? source.length : end)
  }
  const code = ts.transpileModule(extract('cleanEventName') + '\n' + extract('cleanSf10RescueCandidateTitle'),
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  const context = vm.createContext({ cleanText, isEagleNumericTitle,
    normalizeTitle: value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() })
  vm.runInContext(code, context)
  assert.equal(context.cleanEventName('80:20'), '80:20')
  assert.equal(context.cleanSf10RescueCandidateTitle('80:20', '80:20. Official Eagle London event listing.'), '80:20')
  assert.equal(context.cleanSf10RescueCandidateTitle('21:00 Club Night'), 'Club Night')
  assert.notEqual(context.cleanEventName('80:21'), '80:21')
})

test('numeric-title publication exception requires Eagle, its exact official event URL and a real date', () => {
  const input = { venue_id: 'eagle_london_london', event_name: '80:20',
    event_date: '2026-10-17', ticket_url: 'https://www.eaglelondon.com/event-details/80-20-50' }
  assert.equal(isVerifiedEagleNumericTitle(input), true)
  for (const change of [
    { venue_id: 'another_venue' }, { event_name: '21:00' }, { event_date: null },
    { event_date: '2026-02-31' }, { ticket_url: 'https://other.example/event-details/80-20-50' },
    { ticket_url: 'https://www.eaglelondon.com/' },
    { ticket_url: 'https://www.eaglelondon.com/event-details/80-20-50?other=1' },
    { ticket_url: 'https://www.eaglelondon.com/event-details/horse-meat-disco' },
  ]) assert.equal(isVerifiedEagleNumericTitle({ ...input, ...change }), false)
})
