import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
const ast = ts.createSourceFile('route.ts', source, ts.ScriptTarget.Latest, true)
const selected = new Set(['cleanKlubVerbotenTitle', 'extractKlubVerbotenEvents', 'extractUntamedNightsEvent'])
const functions = ast.statements.filter(s => ts.isFunctionDeclaration(s) && selected.has(s.name?.text))
assert.equal(functions.length, selected.size)
const context = vm.createContext({
  URL,
  cleanText: value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(),
  cleanEventName: value => String(value || '').trim(),
  normalizeTitle: value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(),
  isJunkTitle: value => !value || /^(tickets|upcoming|view event)$/i.test(value),
  isJunkUrl: () => false,
  extractLinks: () => [],
  extractBestImage: () => null,
  extractTime: () => null,
  normalizeTicketUrl: value => value,
  eventUrlWithAnchor: (url, title) => url + '#' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  futureSafeYear: () => '2026',
  londonToday: () => '2026-10-20',
  validDateOrNull: value => {
    const parsed = new Date(value + 'T12:00:00Z')
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : null
  },
  monthNameToNumber: value => ({ oct: '10', dec: '12' })[value.toLowerCase().slice(0, 3)] || null,
})
vm.runInContext(ts.transpileModule(functions.map(s => s.getText(ast)).join('\n'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 }
}).outputText, context)

const klub = `
<h2>Verboten Social: LONDON</h2><p>21/10/26</p><p>DOORS 19:00 — LAST ENTRY 23:00</p><p>LONDON Night Tales</p>
<h2>Klub Verboten: HALLOWEEN SPECIAL</h2><p>31/10/26</p><p>DOORS 22:30</p><p>BERLIN ROSA</p>
<h2>Klub Verboten</h2><p>13/11/26</p><p>DOORS 22:30 — LAST ENTRY 02:00</p><p>LONDON ROSA</p>
<h2>Verboten Social</h2><p>18/11/26</p><p>DOORS 19:00</p><p>LONDON Night Tales</p>
<h2>Klub Verboten</h2><p>11/12/26</p><p>DOORS 22:30</p><p>LONDON ROSA</p>
<h2>Verboten Social</h2><p>16/12/26</p><p>DOORS 19:00</p><p>LONDON Night Tales</p>
<h2>PREVIOUS EVENTS</h2><h2>Klub Verboten</h2><p>01/08/26</p><p>LONDON ROSA</p>`

test('Klub Verboten current dates include London only and stop before archive', () => {
  const events = context.extractKlubVerbotenEvents(klub, 'https://klubverboten.com/dates')
  assert.deepEqual(Array.from(events, e => e.event_date),
    ['2026-10-21', '2026-11-13', '2026-11-18', '2026-12-11', '2026-12-16'])
  assert.ok(events.every(e => /London/i.test(e.text)))
  assert.equal(events[1].start_time, '22:30')
  assert.equal(events[2].start_time, '19:00')
  assert.deepEqual(context.extractKlubVerbotenEvents('<h1>Site Unavailable</h1>',
    'https://klubverboten.com/dates'), [])
})

function detail(title, date, location = 'Bournemouth, UK') {
  return `<h1>${title}</h1><h2>Time &amp; Location</h2><p>${date} – 31 Oct 2026, 02:00</p><p>${location}</p><h2>Tickets</h2>`
}

test('Untamed detail requires an official Bournemouth start date and real future day', () => {
  const oct = context.extractUntamedNightsEvent(detail('House of Hades: The Final Gate',
    '30 Oct 2026, 19:30'), 'https://www.untamednights.co.uk/event-details/house-of-hades-the-final-gate')
  assert.equal(oct.length, 1)
  assert.equal(oct[0].event_date, '2026-10-30')
  assert.equal(oct[0].start_time, '19:30')
  const dec = context.extractUntamedNightsEvent(detail('Canvas 4 Yule',
    '27 Dec 2026, 20:00'), 'https://www.untamednights.co.uk/event-details/canvas-4-yule')
  assert.equal(dec[0].event_date, '2026-12-27')
  assert.deepEqual(context.extractUntamedNightsEvent(detail('Canvas 4 Yule',
    '27 Dec 2026, 20:00'), 'https://other.example/event-details/canvas-4-yule'), [])
  assert.deepEqual(context.extractUntamedNightsEvent(detail('Canvas 4 Yule',
    '27 Dec 2026, 20:00', 'London, UK'), 'https://www.untamednights.co.uk/event-details/canvas-4-yule'), [])
  assert.deepEqual(context.extractUntamedNightsEvent(detail('Bad date',
    '31 Feb 2027, 20:00'), 'https://www.untamednights.co.uk/event-details/bad-date'), [])
})

test('route discovers the official listing and keeps generic candidates out of both dedicated feeds', () => {
  assert.match(source, /absoluteUrl\(source\.source_url, '\/events-tickets'\)/)
  assert.match(source, /source\.venue_id === 'klub_verboten_london' \|\| source\.venue_id === 'untamed_nights_bournemouth'/)
})
