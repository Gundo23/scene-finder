import test from 'node:test'
import assert from 'node:assert/strict'
import { parseHeroesSchedule, venueSourceIdentityError } from '../src/lib/heroes-schedule.ts'

// Reduced semantic fixture of the visible official page, not a raw HTML capture.
const page = `<h2>WELCOME</h2><p>Heroes is a health club for gay and bisexual men.</p>
<h2>OPENING TIMES</h2><p>Thursday 11am–9pm. Sunday 12pm–8pm.</p>
<h2><span>EVENTS</span></h2><p>Every Thursday and Sunday we host a Dare 2 Bare.
This means NO TOWEL compulsory (Micro fibre towel provided).</p>
<h2>DIRECTIONS</h2><p>5 Lower High Street, Stourbridge, DY8 1TE</p>`
const url = 'https://www.heroessauna.co.uk/'

test('only published Thursday/Sunday sessions recur for six weeks across DST', () => {
  const events = parseHeroesSchedule(page, url, '2026-10-20')
  assert.equal(events.length, 12)
  assert.deepEqual(events.slice(0, 3).map(e => e.event_date), ['2026-10-22', '2026-10-25', '2026-10-29'])
  assert.equal(events.at(-1).event_date, '2026-11-29')
  assert.ok(events.every(e => e.text === 'Dare 2 Bare' && e.start_time === null))
  assert.deepEqual(parseHeroesSchedule(page, url, '2026-12-30').slice(0, 2).map(e => e.event_date), ['2026-12-31', '2027-01-03'])
})

test('changed, cancelled, hidden, offsite or invalid schedules do not generate events', () => {
  for (const html of [page.replace('Every Thursday and Sunday', 'Every Friday'),
    page.replace('Every Thursday', 'No longer: Every Thursday'),
    page.replace('This means', 'Sessions are suspended. This means'),
    page.replace('<h2><span>EVENTS</span></h2>', '<h2>NEWS</h2>'),
    '<script>' + page + '</script>', page.replace('Stourbridge', 'Elsewhere')]) {
    assert.deepEqual(parseHeroesSchedule(html, url, '2026-10-20'), [])
  }
  for (const source of ['https://elsewhere.example/', 'http://www.heroessauna.co.uk/', url + 'other'])
    assert.deepEqual(parseHeroesSchedule(page, source, '2026-10-20'), [])
  assert.deepEqual(parseHeroesSchedule(page, url, '2026-02-30'), [])
})

test('repurposed Gentry pages fail identity before extraction without affecting other feeds', () => {
  const source = 'https://gentryhull.com/home/'
  assert.ok(venueSourceIdentityError('gentry_spa_kingston_upon_hull', source, '<h1>MARIOTOTO slot gacor</h1>'))
  assert.ok(venueSourceIdentityError('gentry_spa_kingston_upon_hull', source, '<h1>Site unavailable</h1>'))
  assert.ok(venueSourceIdentityError('gentry_spa_kingston_upon_hull', source, '<h1>Gentry Hull</h1><p>MARIOTOTO</p>'))
  assert.equal(venueSourceIdentityError('gentry_spa_kingston_upon_hull', source, '<h1>Gentry Spa</h1><p>17 Scott Street, Hull</p>'), null)
  assert.equal(venueSourceIdentityError('another_venue', source, 'unrelated'), null)
})
