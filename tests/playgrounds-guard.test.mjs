import assert from 'node:assert/strict'
import test from 'node:test'
import { isPlaygroundsNavigationTitle } from '../src/lib/playgrounds-guard.ts'

test('rejects observed Wix navigation and prose fragments, keeps official event title', () => {
  for (const title of ['Book tickets here', 'THE PLAYGROUNDS', 'R TO A NEW']) {
    assert.equal(isPlaygroundsNavigationTitle('the_playgrounds_cleckheaton', title), true)
  }
  assert.equal(isPlaygroundsNavigationTitle('the_playgrounds_cleckheaton', 'TABU - Darker'), false)
  assert.equal(isPlaygroundsNavigationTitle('other_venue', 'Book tickets here'), false)
})
