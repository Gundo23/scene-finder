import test from 'node:test'
import assert from 'node:assert/strict'
import { scrapeSafetyPolicy, alertReasonKey } from '../src/lib/scrape-safety-policy.ts'

const policy = (previousCount, stagedCount, failedPageCount = 0,
  candidateAttempts = 0, qualityReviewCount = 0) => scrapeSafetyPolicy({
  previousCount, stagedCount, failedPageCount, candidateAttempts, qualityReviewCount,
})

test('partial source failures preserve old events and permit individually approved additions', () => {
  assert.deepEqual(policy(74, 67, 4).blocking, [])
  assert.match(policy(74, 67, 4).advisory[0], /pages failed/)
  assert.deepEqual(policy(54, 1).blocking, [])
  assert.deepEqual(policy(2, 0).blocking, [])
})

test('held candidates do not block the separately approved two events', () => {
  const result = policy(2, 2, 0, 16, 14)
  assert.deepEqual(result.blocking, [])
  assert.match(result.qualityReviewReason, /14 of 16/)
})

test('unusually large or spiking batches remain quarantined', () => {
  assert.deepEqual(policy(379, 336).blocking, [])
  assert.match(policy(0, 336).blocking[0], /unusually large/)
  assert.match(policy(10, 100).blocking[0], /spiked/)
})

test('reason key groups changed counts but distinguishes new alert causes', () => {
  assert.equal(alertReasonKey(['14 source pages failed']), alertReasonKey(['4 source pages failed']))
  assert.notEqual(alertReasonKey(['4 source pages failed']), alertReasonKey(['Recovery snapshot failed']))
})
