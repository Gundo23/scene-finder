import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { discoverNerosEventPages, isNerosAllowedPage, parseNerosSchedule } from '../src/lib/neros-schedule.ts'

test('projects only the weekly rules explicitly published on official detail pages', () => {
  const biphoria = parseNerosSchedule(`
    <h1>Nero's Sauna / Bury</h1><p>Weekly mixed event</p><p>When Thu 11am – midnight</p>
  `, discoverNerosEventPages()[1], '2026-10-27')
  const naked = parseNerosSchedule(`
    <h1>Nero's Sauna / Bury</h1><h2>Naked Sauna Day Fridays at Neros Sauna</h2>
    <p>The dedicated Neros page advertises Naked Sauna Day on Friday from 11:00am to 7:00pm.</p>
  `, discoverNerosEventPages()[2], '2026-10-27')

  assert.deepEqual(biphoria.slice(0, 2).map((event) => [event.event_date, event.text, event.start_time]), [
    ['2026-10-29', 'Biphoria at Neros Sauna', '11:00'],
    ['2026-11-05', 'Biphoria at Neros Sauna', '11:00'],
  ])
  assert.deepEqual(naked.slice(0, 2).map((event) => [event.event_date, event.text, event.start_time]), [
    ['2026-10-30', 'Naked Sauna Day', '11:00'],
    ['2026-11-06', 'Naked Sauna Day', '11:00'],
  ])
  assert.ok(biphoria.every((event) => event.method === 'neros-published-recurrence'))
})

test('projects the official last-Tuesday rule but not the conflicting bear schedule', () => {
  const events = parseNerosSchedule(`
    <h1>Nero's Sauna / Bury</h1><p>Last Tuesday</p><h2>T-Girl Tuesday</h2>
    <p>Last Tuesday of the month, 11am-7pm.</p><p>Second Saturday</p><h2>Sauna Bears</h2>
  `, discoverNerosEventPages()[0], '2026-10-27')

  assert.deepEqual(events.map((event) => [event.event_date, event.text]), [
    ['2026-10-27', 'T-Girl Tuesday'],
    ['2026-11-24', 'T-Girl Tuesday'],
    ['2026-12-29', 'T-Girl Tuesday'],
  ])
})

test('rejects unrelated hosts, pages, identity text and unsupported recurrence claims', () => {
  const html = `<h1>Nero's Sauna / Bury</h1><p>Weekly mixed event</p><p>When Thu 11am – midnight</p>`
  assert.equal(isNerosAllowedPage('https://nerossauna.com/sauna-events/'), true)
  assert.equal(isNerosAllowedPage('https://nerossauna.com/'), false)
  assert.deepEqual(parseNerosSchedule(html, 'https://evil.example/sauna-events/', '2026-10-27'), [])
  assert.deepEqual(parseNerosSchedule('<p>Weekly mixed event</p>', discoverNerosEventPages()[1], '2026-10-27'), [])
  assert.deepEqual(parseNerosSchedule(html, discoverNerosEventPages()[1], '2026-10-32'), [])
})

test('the scraper routes Neros through its guarded discovery and parser', () => {
  const route = readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
  assert.match(route, /venueId === 'nero_s_sauna_bury'/)
  assert.match(route, /return discoverNerosEventPages\(\)/)
  assert.match(route, /return parseNerosSchedule\(html, pageUrl, londonToday\(\)\)/)
  assert.match(route, /fetchNerosOfficialCalendar\(pageUrl/)
  assert.match(route, /data\.html\.includes\('Neros Sauna Events'\)/)
  assert.match(route, /data\.html\.includes\('Biphoria at Neros Sauna'\)/)
  assert.match(route, /data\.html\.includes\('Naked Sauna Day Fridays at Neros Sauna'\)/)
  assert.match(route, /if \(source\.venue_id === 'nero_s_sauna_bury'\) \{[\s\S]*?The dedicated parser owns this feed[\s\S]*?continue/)
})
