import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { isEagleNumericTitle } from '../src/lib/eagle-calendar.ts'

// Execute actual route helpers and title guards, not substitutes for the parser.
const source = fs.readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
const ast = ts.createSourceFile('route.ts', source, ts.ScriptTarget.Latest, true)
const names = new Set(['cleanText', 'normalizeTitle', 'validDateOrNull', 'validTimeOrNull',
  'eventUrlWithAnchor', 'isJunkTitle', 'cleanEventName', 'extractTime', 'decodeEscapedText',
  'isSteelCliffeAllowedPage', 'parseSteelCliffeDate', 'isSteelCliffeDateLine',
  'isSteelCliffeSkipLine', 'cleanSteelCliffeTitle', 'extractSteelCliffeEvents'])
const declarations = ast.statements.filter(statement =>
  (ts.isFunctionDeclaration(statement) && names.has(statement.name?.text)) ||
  (ts.isVariableStatement(statement) && statement.declarationList.declarations.some(declaration =>
    ['JUNK_TITLES', 'BAD_EVENT_PATTERNS'].includes(declaration.name.getText(ast)))))
assert.equal(declarations.filter(ts.isFunctionDeclaration).length, names.size)
const context = vm.createContext({ URL, isEagleNumericTitle })
vm.runInContext(ts.transpileModule(declarations.map(d => d.getText(ast)).join('\n'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
const fixture = fs.readFileSync(new URL('./fixtures/steel-cliffe-2026-10-18.html', import.meta.url), 'utf8')
const parse = (html = fixture, url = 'https://steelcliffe.com/') =>
  JSON.parse(JSON.stringify(context.extractSteelCliffeEvents(html, url)))

test('current Events heading recovers four later dates, pairs starts and deduplicates cards', () => {
  const events = parse()
  assert.equal(events.length, 5) // Includes yesterday; existing staging rejects past dates.
  const future = events.filter(e => e.event_date >= '2026-10-18')
  assert.deepEqual(future.map(e => [e.text, e.event_date, e.start_time]), [
    ['Halloween Kink Night', '2026-10-30', '20:00'],
    ['Halloween Party', '2026-10-31', '20:00'],
    ['Fire and Ice', '2026-11-07', '20:00'],
    ['Kink night', '2026-11-20', '20:00'],
  ])
  assert.ok(events.every(e => e.href.startsWith('https://steelcliffe.com/#')))
  assert.ok(events.every(e => !e.raw.includes('Unrelated footer')))
  assert.deepEqual(parse(fixture.replace('<h2>Events</h2>', '<h2><span>Upcoming events</span></h2>')), events)
})

test('holds unrelated pages, hidden headings, unavailable source and invalid dates', () => {
  assert.deepEqual(parse(fixture, 'https://other.example/'), [])
  assert.deepEqual(parse(fixture, 'https://steelcliffe.com/about'), [])
  assert.deepEqual(parse('<h1>Site Unavailable</h1>'), [])
  assert.deepEqual(parse(fixture.replace('<h2>Events</h2>', '<p>Events</p>')), [])
  assert.deepEqual(parse(fixture.replace('<h2>Events</h2>', '<script><h2>Events</h2></script>')), [])
  assert.deepEqual(parse(fixture.replaceAll(/Steel\s*cliffe/gi, 'Other venue').replace('380 Attercliffe Road', 'Other address')), [])
  assert.equal(parse(fixture.replaceAll('30-10-2026', '31-02-2026')).length, 4)
})

test('Steel Cliffe uses the dedicated calendar and empty extraction records a failure', () => {
  assert.match(source, /const dedicatedCalendar =[\s\S]*?isSteelCliffeSource\(source\.venue_id, pageUrl\)/)
  assert.match(source, /if \(isSteelCliffeSource\(source\.venue_id, pageUrl\) && targetVenueEvents\.length === 0\) \{\s*failed\+\+\s*failedPages\.push/)
})
