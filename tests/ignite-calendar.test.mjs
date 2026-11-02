import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { parseIgniteElementorCalendar, parseIgniteDetailTime } from '../src/lib/ignite-calendar.ts'

const calendar = fs.readFileSync(new URL('./fixtures/ignite-calendar-2026-11-02.html', import.meta.url), 'utf8')
const detail = fs.readFileSync(new URL('./fixtures/ignite-detail-2026-11-02.html', import.meta.url), 'utf8')
const page = 'https://club-ignite.co.uk/events-new/'
const today = '2026-11-02'

test('observed Elementor layout binds explicit dates to unquoted event links and deduplicates sections', () => {
  const events = parseIgniteElementorCalendar(calendar, page, today)
  assert.equal(events.length, 16)
  assert.deepEqual(events.map(e => e.event_date).sort(), [
    '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-12', '2026-11-13',
    '2026-11-14', '2026-11-19', '2026-11-20', '2026-11-20', '2026-11-26',
    '2026-11-27', '2026-11-28', '2026-12-03', '2026-12-04', '2026-12-05', '2026-12-31',
  ])
  assert.equal(events.find(e => e.href.includes('121026')).event_date, '2026-11-12')
  assert.equal(events.find(e => e.event_date === '2026-11-06').text, 'Flirt and Fling')
  assert.ok(events.every(e => e.start_time === null))
  assert.deepEqual(parseIgniteElementorCalendar(calendar + calendar, page, today), events)
  assert.deepEqual(parseIgniteElementorCalendar(calendar, page, '2027-01-01'), [])
})

test('does not manufacture dates, use external URLs or read invisible calendar markup', () => {
  assert.deepEqual(parseIgniteElementorCalendar(calendar, 'https://example.com/events-new/', today), [])
  assert.deepEqual(parseIgniteElementorCalendar(calendar, page.replace('events-new', 'membership'), today), [])
  assert.deepEqual(parseIgniteElementorCalendar(calendar.replaceAll('club-ignite.co.uk/events/', 'example.com/events/'), page, today), [])
  const markup = calendar.replace(/<!--[\s\S]*?-->/g, '')
  assert.deepEqual(parseIgniteElementorCalendar(`<script>${markup}</script><style>${markup}</style><!--${markup}-->`, page, today), [])
  assert.deepEqual(parseIgniteElementorCalendar(calendar.replace(/ewpe-ev-yr/g, 'missing-year'), page, today), [])
  assert.deepEqual(parseIgniteElementorCalendar(calendar.replace(/ewpe-ev-day">\d+/g, 'ewpe-ev-day">32'), page, today), [])
  assert.deepEqual(parseIgniteElementorCalendar(calendar.replace(/ewpe-event-title">/g, 'ewpe-event-title">Cancelled '), page, today), [])
})

test('detail time comes only from the official matching Event and occurrence', () => {
  const url = 'https://club-ignite.co.uk/events/flirt-and-fling-61126/'
  assert.equal(parseIgniteDetailTime(detail, url, '2026-11-06'), '21:00')
  assert.equal(parseIgniteDetailTime(detail, url, '2026-11-07'), null)
  assert.equal(parseIgniteDetailTime(detail, url.replace('61126', '41226'), '2026-11-06'), null)
  assert.equal(parseIgniteDetailTime(detail, url.replace('club-ignite.co.uk', 'example.com'), '2026-11-06'), null)
  assert.equal(parseIgniteDetailTime('<p>Last entry 11:30 pm. Ticket sales 9:00 am.</p>', url, '2026-11-06'), null)
  assert.equal(parseIgniteDetailTime(detail.replaceAll('2026-11-06T21:00:00+00:00', '2026-11-06T29:99:00+00:00'), url, '2026-11-06'), null)
})

test('actual Ignite route consumes the new calendar without guessing time from date text', () => {
  const route = fs.readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
  const ast = ts.createSourceFile('route.ts', route, ts.ScriptTarget.Latest, true)
  const fn = ast.statements.find(s => ts.isFunctionDeclaration(s) && s.name?.text === 'extractIgniteEvents')
  const context = vm.createContext({ parseIgniteElementorCalendar, londonToday: () => today, URL,
    Set, extractBestImage: () => null, cleanEventName: s => s, isIgniteJunkTitle: () => false,
    normalizeTitle: s => s.toLowerCase(), cleanText: s => s, absoluteUrl: (base, path) => new URL(path, base).href,
    sameDomain: () => true, validDateOrNull: s => s, validTimeOrNull: s => s || null,
    extractTime: () => { throw new Error('listing has no time') } })
  vm.runInContext(ts.transpileModule(fn.getText(ast), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
  assert.equal(context.extractIgniteEvents(calendar, page).length, 16)
  const tribe = `<article class="tribe-events-calendar-list__event"><time datetime="2026-11-06">6 November at9:00 pm</time>
    <h3><a href="https://club-ignite.co.uk/events/flirt-and-fling-61126/">Flirt and Fling</a></h3></article>`
  const legacy = context.extractIgniteEvents(tribe, page)
  assert.equal(legacy.length, 1)
  assert.equal(legacy[0].start_time, null)
  assert.equal(legacy[0].event_date, '2026-11-06')
  assert.equal(legacy[0].method, 'ignite-tribe-calendar')
})
