import test from 'node:test'
import assert from 'node:assert/strict'
import { eventProfileIds } from '../src/lib/event-profiles.ts'

test('one hosted event is discoverable from venue and organiser without a copied event', () => {
  assert.deepEqual(eventProfileIds({ venue_id: 'xtasia', organiser_id: 'bmfc' }), ['xtasia', 'bmfc'])
  assert.deepEqual(eventProfileIds({ venue_id: 'xtasia' }), ['xtasia'])
  assert.deepEqual(eventProfileIds({ venue_id: 'xtasia', organiser_id: 'xtasia' }), ['xtasia'])
})
