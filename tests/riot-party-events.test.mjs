import test from 'node:test'
import assert from 'node:assert/strict'
import { parseRiotPartyOrganiser } from '../src/lib/riot-party-events.ts'

const card = (url, title, date) => `<a href="${url}">
  <div class="event-feed latest"><div class="entry-details">
    <h5>${title}</h5><div class="time"><span class="copy">${date}</span></div>
    <div class="address"><span class="copy">Electrowerkz, London</span></div>
  </div></div></a>`

test('reads newly announced Riot events without a fixed event list', () => {
  const html = `<h1>Riot Party UK</h1>${card(
    'https://www.outsavvy.com/event/39287/riot-manchester-halloween',
    'Riot Manchester Halloween', 'Friday 23rd October 2026')}${card(
    'https://www.outsavvy.com/event/40450/riot-london-halloween',
    'Riot London Halloween', 'Sunday 1st November 2026')}`
  const events = parseRiotPartyOrganiser(html, '2026-10-12')
  assert.deepEqual(events.map(({ text, event_date }) => [text, event_date]), [
    ['Riot Manchester Halloween', '2026-10-23'],
    ['Riot London Halloween', '2026-11-01'],
  ])
})

test('rejects unrelated, past, unconfirmed, and foreign links', () => {
  const html = `<h1>Riot Party UK</h1>${card(
    'https://www.outsavvy.com/event/38951/for-the-dancers',
    'For the Dancers', 'Friday 23rd October 2026')}${card(
    'https://www.outsavvy.com/event/39564/riot-london-october',
    'Riot London October', 'Past Event')}${card(
    'https://other.example/event/123/riot-fake',
    'Riot Fake', 'Saturday 21st November 2026')}${card(
    'https://www.outsavvy.com/event/39287/riot-manchester-halloween',
    'Riot Manchester Halloween', 'Friday 23rd October 2026')}`
  assert.equal(parseRiotPartyOrganiser(html, '2026-10-12').length, 1)
  assert.deepEqual(parseRiotPartyOrganiser('<h1>Someone Else</h1>' + html.slice(23), '2026-10-12'), [])
})
