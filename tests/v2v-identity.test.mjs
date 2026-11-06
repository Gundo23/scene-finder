import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
const ast = ts.createSourceFile('route.ts', source, ts.ScriptTarget.Latest, true)
const fn = ast.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'eventDedupeKey')
const context = vm.createContext({ URL, cleanEventName: (title) => title,
  normalizeTitle: (title) => title.toLowerCase() })
vm.runInContext(ts.transpileModule(fn.getText(ast),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)

test('V2V official detail title variants share an occurrence identity', () => {
  const url = 'https://v2v.uk/events/hot-wives-vivacious-vixens-1'
  assert.equal(
    context.eventDedupeKey('v2v_nuneaton', 'Hot Wives, Vivacious Vixens', '2026-11-06', url),
    context.eventDedupeKey('v2v_nuneaton', 'Hot Wives, Vivacious Vixens — V2V', '2026-11-06', url),
  )
  assert.notEqual(
    context.eventDedupeKey('v2v_nuneaton', 'Hot Wives, Vivacious Vixens', '2026-11-06', url),
    context.eventDedupeKey('v2v_nuneaton', 'Hot Wives, Vivacious Vixens', '2026-11-07', url),
  )
  assert.notEqual(
    context.eventDedupeKey('other_venue', 'One', '2026-11-06', url),
    context.eventDedupeKey('other_venue', 'Two', '2026-11-06', url),
  )
})

test('Club AntiChrist official detail title variants share only the same date and URL', () => {
  const url = 'https://www.clubantichrist.co.uk/events/not-new-years-eve-party'
  const venue = 'antichrist_club_antichrist_london'
  assert.equal(
    context.eventDedupeKey(venue, "Not New Year's Eve party", '2027-01-02', url),
    context.eventDedupeKey(venue, "Not New Year's Eve party — Club AntiChrist", '2027-01-02', url),
  )
  assert.equal(
    context.eventDedupeKey(venue, 'Club AntiChrist', '2027-01-02', url),
    context.eventDedupeKey(venue, "Not New Year's Eve party", '2027-01-02', url),
  )
  assert.notEqual(
    context.eventDedupeKey(venue, 'Club AntiChrist', '2027-01-02', url),
    context.eventDedupeKey(venue, 'Club AntiChrist', '2027-03-12', url),
  )
})

test('Hellfire Tockify occurrence variants share a URL/date identity', () => {
  const venue = 'hellfire_club_sunbury_on_thames_london_area'
  const url = 'https://tockify.com/hellfireclubuk/detail/82/1793998800000'
  assert.equal(
    context.eventDedupeKey(venue, 'Lets Get Bad Together (LGBTQAI+ Party)', '2026-11-06', url),
    context.eventDedupeKey(venue, 'Ladies Night', '2026-11-06', url),
  )
  assert.notEqual(
    context.eventDedupeKey(venue, 'Ladies Night', '2026-11-06', url),
    context.eventDedupeKey(venue, 'Ladies Night', '2026-12-04', url),
  )
})
