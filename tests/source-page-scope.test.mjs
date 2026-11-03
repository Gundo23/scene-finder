import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { scopedDirectoryVenuePageDecision, isHeatOfficialPage } from '../src/lib/source-page-scope.ts'

const source = 'https://www.gaysaunaguide.net/venue/neros-sauna/'

test('keeps a directory source on its exact venue page', () => {
  assert.equal(scopedDirectoryVenuePageDecision(source, source), true)
  assert.equal(scopedDirectoryVenuePageDecision(source, 'https://gaysaunaguide.net/venue/neros-sauna#hours'), true)
})

test('blocks global and other-venue directory pages', () => {
  assert.equal(scopedDirectoryVenuePageDecision(source, 'https://www.gaysaunaguide.net/events'), false)
  assert.equal(scopedDirectoryVenuePageDecision(source, 'https://www.gaysaunaguide.net/venue/heat-sauna/'), false)
  assert.equal(scopedDirectoryVenuePageDecision(source, 'http://www.gaysaunaguide.net/venue/neros-sauna/'), false)
})

test('leaves ordinary sources to the normal source policy', () => {
  assert.equal(scopedDirectoryVenuePageDecision('https://nerossauna.com/sauna-events/', 'https://nerossauna.com/'), null)
})

test('Heat discovery stays inside its verified Wix site path', () => {
  for (const path of ['/heat-sauna', '/heat-sauna/', '/heat-sauna/events', '/heat-sauna/event-details/party']) {
    assert.equal(isHeatOfficialPage(`https://chris37528.wixsite.com${path}`), true)
  }
  for (const url of ['https://chris37528.wixsite.com/events',
    'https://chris37528.wixsite.com/calendar', 'https://chris37528.wixsite.com/another-club/events',
    'https://chris37528.wixsite.com/heat-sauna-other/events',
    'https://other.wixsite.com/heat-sauna/events', 'http://chris37528.wixsite.com/heat-sauna/events',
    'https://user:pass@chris37528.wixsite.com/heat-sauna/events',
    'https://chris37528.wixsite.com/heat-sauna/../events']) {
    assert.equal(isHeatOfficialPage(url), false)
  }
})

test('the scraper applies directory scope before its generic same-domain rule', () => {
  const route = readFileSync(new URL('../src/app/api/scrape/route.ts', import.meta.url), 'utf8')
  const guard = route.indexOf('scopedDirectoryVenuePageDecision(source.source_url, pageUrl)')
  const generic = route.indexOf('sameDomainOrClubAlchemy(source.source_url, pageUrl)')
  assert.ok(guard >= 0 && generic > guard)
})
