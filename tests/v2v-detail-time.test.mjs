import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const route = readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
const ast = ts.createSourceFile('route.ts', route, ts.ScriptTarget.Latest, true)
const fn = ast.statements.find(node => ts.isFunctionDeclaration(node) &&
  node.name?.text === 'extractV2vDetailStartTime')
assert.ok(fn)
const context = vm.createContext({ validTimeOrNull: time => time })
vm.runInContext(ts.transpileModule(fn.getText(ast), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText, context)

test('V2V takes 20:00 from its own official detail, not a 22:00 calendar end', () => {
  const html = '<script type="application/ld+json">{"startDate":"2026-11-06T20:00:00+0000","endDate":"2026-11-06T22:00:00+0000"}</script>'
  const url = 'https://v2v.uk/events/hot-wives-vivacious-vixens-1'
  assert.equal(context.extractV2vDetailStartTime(html, url, '2026-11-06'), '20:00')
  assert.equal(context.extractV2vDetailStartTime(html, url, '2026-11-07'), null)
  assert.equal(context.extractV2vDetailStartTime(html, 'https://other.example/events/hot-wives', '2026-11-06'), null)
})
