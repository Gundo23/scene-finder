import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

test('detail enrichment preserves the normalized Brief Encounter feed title', () => {
  const route = readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
  const ast = ts.createSourceFile('route.ts', route, ts.ScriptTarget.Latest, true)
  let block
  function visit(node) {
    if (ts.isBlock(node) && node.statements[0]?.getText(ast).startsWith('const detailTitle =') &&
      node.getText(ast).includes('const detailImage = extractBestImage(eventHtml, ticketUrl)') &&
      node.getText(ast).includes('startTime = startTime || extractTime(cleanText(eventHtml)')) block = node
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.ok(block)
  const context = {
    targetVenueEvent: { method: 'hellfire-tockify-ics' },
    source: { venue_id: 'hellfire_club_sunbury_on_thames_london_area' },
    extractAntiChristDetailTitle: () => null,
    title: 'Brief Encounter', description: 'Feed description', imageUrl: null,
    eventHtml: '<title>Brief Encounter Every Wed</title>',
    eventDate: '2026-11-25', startTime: '18:30', ticketUrl: 'https://tockify.com/hellfireclubuk/detail/77/1795631400000',
    extractPageTitle: html => html.match(/<title>(.*?)<\/title>/)[1],
    extractMetaDescription: () => 'Detail description',
    extractDateFromHtml: () => null, extractBestImage: () => null, isJunkTitle: () => false,
  }
  vm.runInNewContext(block.getText(ast), context)
  assert.equal(context.title, 'Brief Encounter')
  assert.equal(context.description, 'Detail description')
  context.targetVenueEvent.method = 'another-calendar'
  vm.runInNewContext(block.getText(ast), context)
  assert.equal(context.title, 'Brief Encounter Every Wed')
})
