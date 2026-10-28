import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { isEagleNumericTitle, isVerifiedEagleNumericTitle } from '../src/lib/eagle-calendar.ts'
import { isVerifiedCupidsShortTitle } from '../src/lib/cupids-calendar.ts'
import { isUntamedDetailCandidate } from '../src/lib/published-schedules.ts'
import { DECADANCE_CALENDAR_URL, decadanceEventLinks, parseDecadanceEvent } from '../src/lib/decadance-calendar.ts'

const overview = `<h1>What's on at DECADANCE</h1><p>Decadance Swingers Club in Rochdale.</p>
<a href="/what-s-on-at-decadance/events-coming-soon/31-10-rocky-horror-halloween-party">31/10 Rocky Horror Halloween Party</a>
<a href="/what-s-on-at-decadance/events-coming-soon/06-11-popper-our-newbie-night">06/11 Popper</a>
<a href="/about">About</a>`

test('discovers only current official dated event detail pages', () => {
  assert.deepEqual(decadanceEventLinks(overview, DECADANCE_CALENDAR_URL, '2026-10-21'), [
    'https://www.decadanceswingersclub.com/what-s-on-at-decadance/events-coming-soon/31-10-rocky-horror-halloween-party',
    'https://www.decadanceswingersclub.com/what-s-on-at-decadance/events-coming-soon/06-11-popper-our-newbie-night',
  ])
  assert.deepEqual(decadanceEventLinks(overview, 'https://elsewhere.example/events', '2026-10-21'), [])
})

test('parses the dated official detail page without inferring a generic calendar row', () => {
  const html = `<title>31/10 Rocky Horror Halloween Party / Events Coming Soon</title>
    <main><p>Decadance Rochdale</p><p>Saturday 31st October 2026 from 8pm</p></main>`
  assert.deepEqual(parseDecadanceEvent(html,
    'https://www.decadanceswingersclub.com/what-s-on-at-decadance/events-coming-soon/31-10-rocky-horror-halloween-party',
    '2026-10-21'), [{
      href: 'https://www.decadanceswingersclub.com/what-s-on-at-decadance/events-coming-soon/31-10-rocky-horror-halloween-party',
      text: 'Rocky Horror Halloween Party', event_date: '2026-10-31', start_time: '20:00',
      raw: '31/10 Rocky Horror Halloween Party / Events Coming Soon Decadance Rochdale Saturday 31st October 2026 from 8pm',
      image_url: null, method: 'decadance-official-detail',
    }])
})

test('uses the published date slug for same-year events without rolling an expired page forward', () => {
  const html = `<title>06/11 Popper - Our newbie night / Events Coming Soon</title><p>Decadance Rochdale. First Friday of the month.</p>`
  const url = 'https://www.decadanceswingersclub.com/what-s-on-at-decadance/events-coming-soon/06-11-popper-our-newbie-night'
  assert.equal(parseDecadanceEvent(html, url, '2026-10-21')[0].event_date, '2026-11-06')
  assert.deepEqual(parseDecadanceEvent(html, url, '2026-11-07'), [])
})

test('rejects offsite, malformed, cancelled and non-venue pages', () => {
  const good = '<title>20/11 Nearly Naked Karaoke / Events Coming Soon</title><p>Decadance Rochdale at 8pm</p>'
  const url = 'https://www.decadanceswingersclub.com/what-s-on-at-decadance/events-coming-soon/20-11-nearly-naked-karaoke'
  assert.deepEqual(parseDecadanceEvent(good.replace('Rochdale', 'Elsewhere'), url, '2026-10-21'), [])
  assert.deepEqual(parseDecadanceEvent(good + ' Event cancelled', url, '2026-10-21'), [])
  assert.deepEqual(parseDecadanceEvent(good, url.replace('https://www.', 'http://www.'), '2026-10-21'), [])
  assert.deepEqual(parseDecadanceEvent(good, 'https://elsewhere.example/20-11-nearly-naked-karaoke', '2026-10-21'), [])
  assert.deepEqual(parseDecadanceEvent(good, url, '2026-02-30'), [])
})

test('publication guard ignores page-shell junk only for a verified dated Decadance detail', () => {
  const source = fs.readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
  const ast = ts.createSourceFile('route.ts', source, ts.ScriptTarget.Latest, true)
  const names = new Set(['cleanText', 'normalizeTitle', 'isJunkTitle', 'cleanEventName',
    'cleanSf10RescueCandidateTitle', 'candidateRejectionReason', 'hasBadEventPattern'])
  const declarations = ast.statements.filter(statement =>
    (ts.isFunctionDeclaration(statement) && names.has(statement.name?.text)) ||
    (ts.isVariableStatement(statement) && statement.declarationList.declarations.some(declaration =>
      ['JUNK_TITLES', 'BAD_EVENT_PATTERNS'].includes(declaration.name.getText(ast)))))
  const unrelated = ['isSf10SafeRescueCandidate', 'isLeBoudoirSource', 'isMinistryStudiosJunkEvent',
    'isChunkyMuffinsJunkEvent', 'isCarberrysJunkEvent', 'isSheWorldJunkEvent', 'isMirageLincolnSource',
    'isMirageLincolnJunkEvent', 'isCjsTownhouseJunkEvent', 'isGgsLoungeJunkEvent', 'isPurpleMambaSource',
    'isAcquaSafeDatedEvent', 'isBlacklistedTbcEvent', 'isJunkUrl', 'looksLikeEvent']
  const context = vm.createContext({ URL, isUntamedDetailCandidate, isEagleNumericTitle,
    isVerifiedEagleNumericTitle, isVerifiedCupidsShortTitle,
    ...Object.fromEntries(unrelated.map(name => [name, () => false])) })
  vm.runInContext(ts.transpileModule(declarations.map(declaration => declaration.getText(ast)).join('\n'),
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)

  const candidate = {
    venue_id: 'decadance_rochdale_greater_manchester',
    event_name: 'Rocky Horror Halloween Party',
    event_date: '2026-10-31',
    ticket_url: 'https://www.decadanceswingersclub.com/what-s-on-at-decadance/events-coming-soon/31-10-rocky-horror-halloween-party',
    description: 'Contact Us Membership Private Hire Rocky Horror Halloween Party',
  }
  assert.equal(context.candidateRejectionReason(candidate), null)
  for (const change of [{ venue_id: 'other' }, { event_date: null },
    { ticket_url: 'https://elsewhere.example/event' },
    { ticket_url: 'http://www.decadanceswingersclub.com/what-s-on-at-decadance/events-coming-soon/31-10-party' },
    { ticket_url: 'https://name@www.decadanceswingersclub.com/what-s-on-at-decadance/events-coming-soon/31-10-party' },
    { ticket_url: 'https://www.decadanceswingersclub.com/what-s-on-at-decadance' },
  ]) assert.equal(context.candidateRejectionReason({ ...candidate, ...change }), 'rejected_bad_pattern')
})
