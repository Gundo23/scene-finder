import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const route = fs.readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
const ast = ts.createSourceFile('route.ts', route, ts.ScriptTarget.Latest, true)
const monitor = ast.statements.find(s => ts.isFunctionDeclaration(s) && s.name?.text === 'monitorVenueFutureEventCount')
const code = ts.transpileModule(monitor.getText(ast), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText

test('scrapes observe a zero without sending a second email or changing legacy alert state', async () => {
  for (const count of [0, 2]) {
    const tables = []
    const query = { select() { return query }, eq() { return query },
      or() { return Promise.resolve({ count, error: null }) } }
    const context = vm.createContext({ londonToday: () => '2026-11-01',
      supabaseAdmin: { from(table) { tables.push(table); return query } } })
    vm.runInContext(code, context)
    const result = await context.monitorVenueFutureEventCount('club_bacchus_dundee')
    assert.equal(result.checked, true)
    assert.equal(result.alerted, false)
    assert.equal(result.current_count, count)
    assert.equal(result.monitor, 'independent_event_health')
    assert.deepEqual(tables, ['events'])
  }
})

test('count read failures remain visible', async () => {
  const query = { select() { return query }, eq() { return query },
    or() { return Promise.resolve({ count: null, error: { message: 'unavailable' } }) } }
  const context = vm.createContext({ londonToday: () => '2026-11-01', supabaseAdmin: { from() { return query } } })
  vm.runInContext(code, context)
  const result = await context.monitorVenueFutureEventCount('venue')
  assert.equal(result.checked, false)
  assert.equal(result.error, 'event count failed: unavailable')
})
