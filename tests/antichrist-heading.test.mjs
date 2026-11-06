import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const route = readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
const ast = ts.createSourceFile('route.ts', route, ts.ScriptTarget.Latest, true)
const fn = ast.statements.find(node => ts.isFunctionDeclaration(node) &&
  node.name?.text === 'extractAntiChristDetailTitle')
assert.ok(fn)
const context = vm.createContext({
  cleanText: text => text.replace(/<[^>]*>/g, ' ').replace(/&#39;/g, "'").trim(),
})
vm.runInContext(ts.transpileModule(fn.getText(ast), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText, context)

test('Club AntiChrist detail heading wins over the generic site heading', () => {
  const html = '<h1 class="site-title">Club AntiChrist</h1>' +
    '<h1 class="eventitem-title">Not New Year&#39;s Eve party</h1>'
  assert.equal(context.extractAntiChristDetailTitle(
    html, 'https://www.clubantichrist.co.uk/events/not-new-years-eve-party'
  ), "Not New Year's Eve party")
  assert.equal(context.extractAntiChristDetailTitle(
    html, 'https://example.com/events/not-new-years-eve-party'
  ), null)
  assert.equal(context.extractAntiChristDetailTitle(
    '<h1 class="site-title">Club AntiChrist</h1>',
    'https://www.clubantichrist.co.uk/events/not-new-years-eve-party'
  ), null)
})
