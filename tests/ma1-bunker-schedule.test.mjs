import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { MA1_BUNKER_SCHEDULE_URL, parseMa1BunkerSchedule } from '../src/lib/ma1-bunker-schedule.ts'

const scraperRoute = fs.readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')

const html = `<h1>MA1: The Bunker, 215-221 City Road, London, EC1V 1JN</h1>
<p>Sewell and Marbury (S&amp;M) &amp; all external promotions and events operate with permission of MA1: Bunker</p>
<p>Every Monday 6pm to 10pm The UK's original club for men who like Jacking Off</p>
<p>Tuesday 6pm to 10pm ClubCP returns every Tuesday</p>
<p>Every Wednesday 6pm to 10pm Buff hosts their midweek session</p>
<p>Every Friday 6pm to 10pm Buff is one the best parties</p>
<p>Every Sunday 6pm to Midnight Buff on Sunday is now the longest established</p>
<p>Saturday afternoon 2pm to 6pm Boyz &amp; Sirs is a long running club</p>
<p>Saturday evening 6pm to 10pm The new club “Blackout” continues</p>
<p>1st Saturday of the month 10pm-4am Stripped take up their new resident spot</p>
<p>2nd Saturday of the month 10pm to 4am Roadwiorks is FREE in Hi-Viz for the rest of 2026</p>
<p>4th Saturday of the month 10pm to 4am Fitladz/Fitdadz has moved</p>
<p>3rd Sunday of the month 2pm to 6pm Rimpack proved such a hit</p>
<p>5th Saturday 10pm to 4am (31st October 2026) Gooniversity will be taking over</p>`

test('MA1 parser expands only proved current official schedule rules', () => {
  const events = parseMa1BunkerSchedule(html, MA1_BUNKER_SCHEDULE_URL, '2026-10-29')
  assert.ok(events.some(event => event.text === 'Gooniversity' && event.event_date === '2026-10-31'))
  assert.ok(events.some(event => event.text === 'Stripped' && event.event_date === '2026-11-07'))
  assert.ok(events.some(event => event.text === 'Roadworks' && event.event_date === '2026-11-14'))
  assert.ok(events.some(event => event.text === 'Fitladz/Fitdadz' && event.event_date === '2026-11-28'))
  assert.equal(events.filter(event => event.text === 'Rimpack').length, 1)
  assert.ok(events.every(event => event.event_date >= '2026-10-29' && event.event_date <= '2026-12-09'))
  assert.deepEqual(parseMa1BunkerSchedule(html, 'https://example.com/ma1home18.html', '2026-10-29'), [])
  assert.deepEqual(parseMa1BunkerSchedule(html.replace('215-221 City Road', 'Elsewhere'), MA1_BUNKER_SCHEDULE_URL, '2026-10-29'), [])
})

test('MA1 parser does not infer a rule whose proof is missing', () => {
  const events = parseMa1BunkerSchedule(html.replace('Roadwiorks is FREE in Hi-Viz for the rest of 2026', 'rotation details unavailable'), MA1_BUNKER_SCHEDULE_URL, '2026-10-29')
  assert.equal(events.some(event => event.text === 'Roadworks'), false)
})

test('scraper routes MA1 through the dedicated single-page parser', () => {
  assert.match(scraperRoute, /bunker_bar_ma1_the_bunker_london[\s\S]{0,200}?MA1_BUNKER_SCHEDULE_URL/)
  assert.match(scraperRoute, /parseMa1BunkerSchedule\(html, pageUrl, londonToday\(\)\)/)
  assert.match(scraperRoute, /Official MA1 programme yielded no verified current schedule/)
})
