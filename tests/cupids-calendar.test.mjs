import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { cupidsDetailDate, cupidsEventDetailLinks, parseCupidsCalendar, isVerifiedCupidsShortTitle, cupidsCanonicalDetailUrl } from '../src/lib/cupids-calendar.ts'
import { isEagleNumericTitle, isVerifiedEagleNumericTitle } from '../src/lib/eagle-calendar.ts'

const actual = fs.readFileSync(new URL('./fixtures/cupids-cards-2026-10-18.html', import.meta.url), 'utf8')
const parse = (html = actual, today = '2026-10-18', url = 'https://cupidsswingersclub.co.uk/events/') =>
  parseCupidsCalendar(html, url, today)

test('actual current cards recover all 20 dated events through 13 November in one page', () => {
  const events = parse()
  assert.equal(events.length, 20)
  assert.equal(events.at(-1).event_date, '2026-11-13')
  assert.equal(events.at(-1).text, 'BLACK MAGIC')
  assert.equal(events.at(-1).start_time, '19:00')
  assert.deepEqual(events.filter(e => e.text === 'MOTD').map(e => [e.event_date, e.start_time]),
    [['2026-10-20', '11:00'], ['2026-11-03', '11:00']])
  assert.equal(events.find(e => e.text === 'FU FUCKHOUSE UNLIMITED').event_date, '2026-11-07')
  assert.ok(events.every(e => e.method === 'cupids-official-calendar-card'))
  assert.deepEqual(parse(actual + actual), events)
  assert.deepEqual(parse(actual, '2026-11-14'), [])
})

test('card dates must be explicit, real, future and agree with the rendered weekday', () => {
  assert.equal(parse(actual.replaceAll('2026-10-20', '2026-02-31')).length, 19)
  assert.equal(parse(actual.replace('Tue 20 Oct 2026', 'Wed 20 Oct 2026')).length, 19)
  assert.equal(parse(actual.replace('datetime="2026-10-20"', 'datetime="2026-10-21"')).length, 19)
  assert.equal(parse(actual.replace('data-event-date="2026-10-20"', 'data-event-date=""')).length, 19)
  assert.deepEqual(parse(actual, '2026-02-31'), [])
  assert.deepEqual(parse(actual, '2026-01-01'), [])
  const absent = parse(actual.replace('11:00am – 6:00pm', 'Time to be confirmed'))
  assert.equal(absent.find(e => e.event_date === '2026-10-20').start_time, null)
})

test('rejects another host, navigation, scripts, conflicting cards and unsafe URLs', () => {
  assert.deepEqual(parse(actual, '2026-10-18', 'https://other.example/events/'), [])
  assert.deepEqual(parse(actual, '2026-10-18', 'https://cupidsswingersclub.co.uk/'), [])
  assert.deepEqual(parse('<script>' + actual + '</script>'), [])
  assert.deepEqual(parse('<h1>Site Unavailable</h1>'), [])
  assert.deepEqual(parse(actual.replaceAll('https://cupidsswingersclub.co.uk/events/?event=', 'https://other.example/events/?event=')), [])
  assert.equal(parse(actual.replace('event=1432', 'event=1432&amp;event=4')).length, 19)
  assert.equal(parse(actual.replace('<h2>MOTD</h2>', '<h2>View Event</h2>')).length, 19)
  assert.equal(parse(actual.replace('<h2>MOTD</h2>', '<h2>ABCD</h2>')).length, 19)
  const first = actual.match(/<article\b[\s\S]*?<\/article>/)[0]
  assert.deepEqual(parse(actual + first.replace('THREE’S A FANTASY</h2>', 'Changed event title</h2>')), [])
})

test('the MOTD exception requires the exact venue, title, real date and numeric official detail URL', () => {
  const input = { venue_id: 'cupids_health_club_swinton_manchester', event_name: 'MOTD',
    event_date: '2026-10-20', ticket_url: 'https://cupidsswingersclub.co.uk/events/?event=1432' }
  assert.equal(isVerifiedCupidsShortTitle(input), true)
  for (const change of [{ venue_id: 'another_venue' }, { event_name: 'ABCD' },
    { event_date: null }, { event_date: '2026-02-31' },
    { ticket_url: '/events/?event=1432' },
    { ticket_url: 'https://other.example/events/?event=1432' },
    { ticket_url: 'https://cupidsswingersclub.co.uk/events/' },
    { ticket_url: 'https://cupidsswingersclub.co.uk/events/?event=1432&other=1' },
    { ticket_url: 'https://name@cupidsswingersclub.co.uk/events/?event=1432' },
    { ticket_url: 'https://cupidsswingersclub.co.uk/events/?event=1432#unrelated' },
  ]) assert.equal(isVerifiedCupidsShortTitle({ ...input, ...change }), false)
})

test('actual cleanup and publication guard permit verified MOTD, without widening other title guards', () => {
  const source = fs.readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
  const ast = ts.createSourceFile('route.ts', source, ts.ScriptTarget.Latest, true)
  const names = new Set(['cleanText', 'normalizeTitle', 'isJunkTitle', 'cleanEventName',
    'cleanSf10RescueCandidateTitle', 'candidateRejectionReason', 'normalizeTicketUrl'])
  const declarations = ast.statements.filter(s =>
    (ts.isFunctionDeclaration(s) && names.has(s.name?.text)) ||
    (ts.isVariableStatement(s) && s.declarationList.declarations.some(d =>
      ['JUNK_TITLES', 'BAD_EVENT_PATTERNS'].includes(d.name.getText(ast)))))
  const unrelatedGuards = ['isSf10SafeRescueCandidate', 'isLeBoudoirSource',
    'isMinistryStudiosJunkEvent', 'isChunkyMuffinsJunkEvent', 'isCarberrysJunkEvent',
    'isSheWorldJunkEvent', 'isMirageLincolnJunkEvent', 'isCjsTownhouseJunkEvent',
    'isGgsLoungeJunkEvent', 'isPurpleMambaSource', 'isAcquaSafeDatedEvent',
    'isBlacklistedTbcEvent', 'isJunkUrl', 'hasBadEventPattern', 'looksLikeEvent']
  const context = vm.createContext({ ...Object.fromEntries(unrelatedGuards.map(n => [n, () => false])),
    URL, isEagleNumericTitle, isVerifiedEagleNumericTitle, isVerifiedCupidsShortTitle, cupidsCanonicalDetailUrl })
  vm.runInContext(ts.transpileModule(declarations.map(d => d.getText(ast)).join('\n'),
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
  const input = { venue_id: 'cupids_health_club_swinton_manchester', event_name: 'MOTD',
    event_date: '2026-10-20', ticket_url: 'https://cupidsswingersclub.co.uk/events/?event=1432',
    description: 'MOTD. Official Cupids Swingers Club event listing for 2026-10-20.' }
  assert.equal(context.cleanSf10RescueCandidateTitle('MOTD', input.description), 'MOTD')
  assert.equal(context.isJunkTitle('MOTD'), true) // Generic rule stays strict.
  assert.equal(context.normalizeTicketUrl(input.ticket_url), input.ticket_url)
  assert.equal(context.normalizeTicketUrl('https://www.cupidsswingersclub.co.uk/events/?event=1432'), input.ticket_url)
  assert.equal(context.normalizeTicketUrl('https://other.example/events/?event=1432'), 'https://other.example/events')
  assert.equal(context.normalizeTicketUrl('/events/?event=1432'), '/events/?event=1432')
  assert.equal(context.candidateRejectionReason({ ...input, ticket_url: context.normalizeTicketUrl(input.ticket_url) }), null)
  assert.equal(context.candidateRejectionReason({ ...input, venue_id: 'other' }), 'rejected_unverified_short_title')
  assert.equal(context.candidateRejectionReason({ ...input, event_name: 'ABCD' }), 'rejected_junk_title')
  assert.match(source, /isCupidsSource\(source\.venue_id, source\.source_url\)\s*\? 1/)
  assert.match(source, /if \(isCupidsSource\(source\.venue_id, pageUrl\) && targetVenueEvents\.length === 0\) \{\s*failed\+\+/)
  assert.doesNotMatch(source, /for \(const link of cupidsEventDetailLinks/)
})

test('discovers only official numeric event detail links from the new calendar', () => {
  const html = `
    <a href="/events/?event=950">Fri 9 Oct 2026 FU FUCKHOUSE UNLIMITED</a>
    <a href="https://www.cupidsswingersclub.co.uk/events/?event=951&amp;view=full">SQUIRT</a>
    <a href="/events/?event=950">Duplicate card</a>
    <a href="https://other.example/events/?event=952">Other venue</a>
    <a href="/events/?event=abc">Invalid identifier</a>`
  assert.deepEqual(cupidsEventDetailLinks(html, 'https://cupidsswingersclub.co.uk/events/'), [
    'https://cupidsswingersclub.co.uk/events/?event=950',
    'https://www.cupidsswingersclub.co.uk/events/?event=951&view=full',
  ])
})

test('uses the event start date rather than the overnight end date', () => {
  const html = '<h1>FU FUCKHOUSE UNLIMITED</h1><div>Date</div><div>Fri 9 Oct 2026</div>' +
    '<div>to Sat 10 Oct 2026</div><div>Time 7:00pm – 3:00am</div>'
  assert.equal(cupidsDetailDate(html), '2026-10-09')
  assert.equal(cupidsDetailDate('<div>DateFri 23 Oct 2026 to Sat 24 Oct 2026</div>'), '2026-10-23')
  assert.equal(cupidsDetailDate('<div>Date Fri 32 Oct 2026</div>'), null)
})
