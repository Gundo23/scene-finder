import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { parseAtlantisSchedule, parseSweatboxSchedule, parseUntamedListing, parseUntamedDetail, isUntamedDetailCandidate } from '../src/lib/published-schedules.ts'
import { isEagleNumericTitle, isVerifiedEagleNumericTitle } from '../src/lib/eagle-calendar.ts'
import { isVerifiedCupidsShortTitle } from '../src/lib/cupids-calendar.ts'

const scraperRoute = fs.readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')

test('Atlantis extracts only future dated sessions from its verified official page', () => {
  const html = `<h1>atlantisEVOLUTION</h1><p>Burslem Stoke on Trent</p><p>LAST UPDATE: 18 October 2026</p>
    <p>9pm | Friday 23 October | 2am 9pm | Saturday 24 October | 2am
    the HALLOWEEN SCREAMS WEEKEND 9pm | Friday 30 October | 2am
    9pm | Saturday 31 October | 2am</p>`
  const events = parseAtlantisSchedule(html, 'https://www.atlantisevolution.co.uk/', '2026-10-22')
  assert.deepEqual(events.map(event => event.event_date), ['2026-10-23', '2026-10-24', '2026-10-30', '2026-10-31'])
  assert.ok(events.every(event => event.text === 'Halloween Screams Weekend' && event.start_time === '21:00'))
  assert.deepEqual(parseAtlantisSchedule(html.replace('LAST UPDATE:', 'LAST UPDATE <span>:</span>'), 'https://www.atlantisevolution.co.uk/', '2026-10-22'), events)
  assert.deepEqual(parseAtlantisSchedule(html.replace('Burslem Stoke on Trent', 'Elsewhere'), 'https://www.atlantisevolution.co.uk/', '2026-10-22'), [])
  assert.deepEqual(parseAtlantisSchedule(html, 'https://www.atlantisevolution.co.uk/', '2026-12-22'), [])
  assert.deepEqual(parseAtlantisSchedule(html, 'https://example.com/', '2026-10-22'), [])
})

test('Sweatbox expands only the exact weekly programme published on its events page', () => {
  const html = `<h1>Sweatbox Soho</h1><p>Central London</p>
    <h2>Every Monday</h2><h3>Hard Up Mondays</h3>
    <h2>Every Tuesday</h2><h3>Towel Free Tuesdays</h3><p>every Tuesday, 4pm to midnight!</p>
    <h2>Every Wednesday</h2><h3>Mid Week Foam Party</h3><p>8pm till 10pm</p>
    <h2>Every Thursday</h2><h3>Hard Up Thursdays</h3>
    <h2>Every Sunday</h2><h3>Naked Workout</h3><p>Every Sunday from 2pm - 4pm</p>`
  const events = parseSweatboxSchedule(html, 'https://www.sweatboxsoho.com/events/', '2026-10-22')
  assert.equal(events.length, 30)
  assert.deepEqual(events.slice(0, 4).map(event => [event.event_date, event.text]), [
    ['2026-10-22', 'Hard Up Thursdays'], ['2026-10-25', 'Naked Workout'],
    ['2026-10-26', 'Hard Up Mondays'], ['2026-10-27', 'Towel Free Tuesdays'],
  ])
  assert.equal(events.find(event => event.text === 'Mid Week Foam Party').start_time, '20:00')
  assert.deepEqual(parseSweatboxSchedule(html.replace('Every Tuesday', 'Some Tuesdays'), 'https://www.sweatboxsoho.com/events/', '2026-10-22').filter(event => event.text === 'Towel Free Tuesdays'), [])
})

test('Untamed listing is a safe fallback when dynamic detail-link discovery is incomplete', () => {
  // Reduced fields from the actual Wix list-item markup fetched 23 Oct 2026.
  const card = (name, slug, day, location) => `<li data-hook="side-by-side-item">
    <p>Multiple Dates</p><a data-hook="title" href="https://www.untamednights.co.uk/event-details/${slug}">${name}</a>
    <div data-hook="short-date">${day}</div><div data-hook="short-location">${location}</div>
    <p>Share</p><a data-hook="ev-rsvp-button">Buy Tickets</a></li>`
  const html = `<h1>Events and tickets</h1><p>Untamed nights</p>
    <p>so it doesn't matter how you identify, everyone is welcome.</p>` +
    card('House of Hades: The Final Gate', 'house-of-hades-the-final-gate', 'Fri 30 Oct', 'Bournemouth') +
    card('The Social at UN', 'the-social-at-un-2026-11-04-19-30', 'Wed 04 Nov', 'Canvas') +
    card('Canvas 4 Yule', 'canvas-4-yule', 'Sun 27 Dec', 'Confirmed after ticket purchase')
  const events = parseUntamedListing(html, 'https://www.untamednights.co.uk/events-tickets', '2026-10-22')
  assert.deepEqual(events.map(event => event.event_date), ['2026-10-30', '2026-11-04', '2026-12-27'])
  assert.deepEqual(events.map(event => event.text), ['House of Hades: The Final Gate', 'The Social at UN', 'Canvas 4 Yule'])
  assert.ok(events.every(event => event.href.includes('/event-details/')))
  assert.deepEqual(parseUntamedListing(html + html, 'https://www.untamednights.co.uk/events-tickets', '2026-10-22'), events)
  assert.equal(parseUntamedListing(html.replace('Fri 30 Oct', 'Sat 30 Oct'), 'https://www.untamednights.co.uk/events-tickets', '2026-10-22').length, 2)
  assert.equal(parseUntamedListing(html.replace('Bournemouth</div>', 'London</div>'), 'https://www.untamednights.co.uk/events-tickets', '2026-10-22').length, 2)
  assert.equal(parseUntamedListing(html.replace('House of Hades: The Final Gate</a>', 'Cancelled</a>'), 'https://www.untamednights.co.uk/events-tickets', '2026-10-22').length, 2)
  assert.deepEqual(parseUntamedListing('<script>' + html + '</script>', 'https://www.untamednights.co.uk/events-tickets', '2026-10-22'), [])
  assert.deepEqual(parseUntamedListing(html.replaceAll('www.untamednights.co.uk/event-details', 'other.example/event-details'), 'https://www.untamednights.co.uk/events-tickets', '2026-10-22'), [])
  assert.deepEqual(parseUntamedListing(html, 'https://untamednights.co.uk/other', '2026-10-22'), [])
})

test('Untamed detail expands only occurrence dates explicitly published by Wix', () => {
  const html = `<h1>The Social at UN</h1>
    <p data-hook="event-full-date">04 Nov 2026, 19:30 – 23:59</p>
    <p data-hook="event-full-location">Canvas, 45 Poole Hill, Bournemouth BH2 5PW, UK</p>
    <script>window.warmup = {"upcomingOccurrencesSuggestions":[
      {\\"slug\\":\\"the-social-at-un-2026-11-18-19-30\\",\\"shortStartDateTime\\":\\"Wed 18 Nov, 19:30\\"},
      {\\"slug\\":\\"the-social-at-un-2026-12-02-19-30\\",\\"shortStartDateTime\\":\\"Wed 02 Dec, 19:30\\"},
      {\\"slug\\":\\"the-social-at-un-2026-12-16-19-30\\",\\"shortStartDateTime\\":\\"Wed 16 Dec, 19:30\\"},
      {\\"slug\\":\\"unrelated-2026-12-23-19-30\\",\\"shortStartDateTime\\":\\"Wed 23 Dec, 19:30\\"},
      {\\"slug\\":\\"the-social-at-un-2026-12-24-19-30\\",\\"shortStartDateTime\\":\\"Wed 23 Dec, 19:30\\"}
    ]}</script>`
  const pageUrl = 'https://www.untamednights.co.uk/event-details/the-social-at-un-2026-11-04-19-30'
  const events = parseUntamedDetail(html, pageUrl, '2026-10-24')
  assert.deepEqual(events.map(event => [event.event_date, event.start_time, event.href]), [
    ['2026-11-04', '19:30', pageUrl],
    ['2026-11-18', '19:30', 'https://www.untamednights.co.uk/event-details/the-social-at-un-2026-11-18-19-30'],
    ['2026-12-02', '19:30', 'https://www.untamednights.co.uk/event-details/the-social-at-un-2026-12-02-19-30'],
    ['2026-12-16', '19:30', 'https://www.untamednights.co.uk/event-details/the-social-at-un-2026-12-16-19-30'],
  ])
  assert.ok(events.every(event => event.text === 'The Social at UN'))
  assert.deepEqual(parseUntamedDetail(html.replace('Bournemouth', 'London'), pageUrl, '2026-10-24'), [])
  assert.deepEqual(parseUntamedDetail(html, pageUrl.replace('untamednights.co.uk', 'example.com'), '2026-10-24'), [])
})

test('the actual publication guard ignores only a verified Untamed detail URL when checking junk words', () => {
  const ast = ts.createSourceFile('route.ts', scraperRoute, ts.ScriptTarget.Latest, true)
  const names = new Set(['cleanText', 'normalizeTitle', 'isJunkTitle', 'cleanEventName',
    'cleanSf10RescueCandidateTitle', 'candidateRejectionReason', 'hasBadEventPattern'])
  const declarations = ast.statements.filter(s =>
    (ts.isFunctionDeclaration(s) && names.has(s.name?.text)) ||
    (ts.isVariableStatement(s) && s.declarationList.declarations.some(d =>
      ['JUNK_TITLES', 'BAD_EVENT_PATTERNS'].includes(d.name.getText(ast)))))
  const unrelated = ['isSf10SafeRescueCandidate', 'isLeBoudoirSource', 'isMinistryStudiosJunkEvent',
    'isChunkyMuffinsJunkEvent', 'isCarberrysJunkEvent', 'isSheWorldJunkEvent', 'isMirageLincolnJunkEvent',
    'isCjsTownhouseJunkEvent', 'isGgsLoungeJunkEvent', 'isPurpleMambaSource', 'isAcquaSafeDatedEvent',
    'isBlacklistedTbcEvent', 'isJunkUrl', 'looksLikeEvent']
  const context = vm.createContext({ URL, isUntamedDetailCandidate, isEagleNumericTitle,
    isVerifiedEagleNumericTitle, isVerifiedCupidsShortTitle,
    ...Object.fromEntries(unrelated.map(name => [name, () => false])) })
  vm.runInContext(ts.transpileModule(declarations.map(d => d.getText(ast)).join('\n'),
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
  const candidate = { venue_id: 'untamed_nights_bournemouth', event_name: 'Canvas Yule',
    event_date: '2026-12-27', ticket_url: 'https://www.untamednights.co.uk/event-details/canvas-4-yule',
    description: 'Canvas Yule. Official Untamed Nights detail for 2026-12-27 in Bournemouth.' }
  assert.equal(context.candidateRejectionReason(candidate), null)
  assert.equal(context.candidateRejectionReason({ ...candidate, event_name: 'House of Hades: The Final Gate',
    event_date: '2026-10-30', ticket_url: 'https://www.untamednights.co.uk/event-details/house-of-hades-the-final-gate' }), null)
  assert.equal(context.candidateRejectionReason({ ...candidate, description: 'Join now for membership' }), 'rejected_bad_pattern')
  for (const change of [{ venue_id: 'other' }, { event_date: '2026-02-31' },
    { ticket_url: 'https://other.example/event-details/canvas-4-yule' },
    { ticket_url: 'https://name@www.untamednights.co.uk/event-details/canvas-4-yule' },
    { ticket_url: 'https://www.untamednights.co.uk/event-details/canvas-4-yule?next=1' },
    { ticket_url: 'https://www.untamednights.co.uk/event-details/canvas-4-yule#next' },
  ]) assert.equal(context.candidateRejectionReason({ ...candidate, ...change }), 'rejected_bad_pattern')
})

test('scraper routes all three repaired venues through the dedicated parsers', () => {
  assert.match(scraperRoute, /venueId === 'untamed_nights_bournemouth' \|\|/)
  assert.match(scraperRoute, /return listingEvents\.length > 0 \? listingEvents : parseUntamedDetail/)
  assert.match(scraperRoute, /return parseAtlantisSchedule\(html, pageUrl, londonToday\(\)\)/)
  assert.match(scraperRoute, /return parseSweatboxSchedule\(html, pageUrl, londonToday\(\)\)/)
})

test('Untamed publication retains a known time when only a listing is available', async () => {
  const ast = ts.createSourceFile('route.ts', scraperRoute, ts.ScriptTarget.Latest, true)
  const publisher = ast.statements.find(s => ts.isFunctionDeclaration(s) && s.name?.text === 'publishStagedEvent')
  const code = ts.transpileModule(publisher.getText(ast),
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  const base = { venue_id: 'untamed_nights_bournemouth', event_name: 'The Social at UN',
    event_date: '2026-11-04', start_time: null,
    ticket_url: 'https://www.untamednights.co.uk/event-details/the-social-at-un-2026-11-04-19-30' }
  for (const matchBy of ['url', 'title']) {
    for (const change of [{}, { start_time: '19:30' }, { venue_id: 'other_venue' }]) {
      const input = { ...base, ...change }
      let reads = 0
      let update
      const supabaseAdmin = { from() {
        let write = false
        const query = { select() { return query }, eq() { return query }, limit() { return query },
          update(value) { update = value; write = true; return query },
          then(resolve) {
            if (write) return resolve({ error: null })
            reads++
            const found = matchBy === 'url' || reads === 2
            return resolve({ data: found ? [{ event_id: 'existing', event_name: input.event_name,
              event_date: input.event_date, start_time: '19:30' }] : [] })
          } }
        return query
      } }
      const context = vm.createContext({ supabaseAdmin, isUntamedDetailCandidate,
        normalizeTitle: value => value.toLowerCase() })
      vm.runInContext(code, context)
      assert.equal((await context.publishStagedEvent(input, 'run')).action, 'updated')
      if (change.start_time) assert.equal(update.start_time, '19:30')
      else if (change.venue_id) assert.equal(update.start_time, null)
      else assert.equal(Object.hasOwn(update, 'start_time'), false)
    }
  }
})
