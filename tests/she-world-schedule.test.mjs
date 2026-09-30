import test from 'node:test'
import assert from 'node:assert/strict'
import { sheWorldSchedule } from '../src/lib/she-world-schedule.ts'

test('recognises the published recurring times, including first Monday', () => {
  assert.deepEqual(sheWorldSchedule("1st Monday monthly 5pm-1am Thursday's 2pm-2am Weekly Saturday's 8pm-3am Weekly"), {
    thursday: true, saturday: true, firstMonday: true,
  })
})

test('does not invent a schedule when the site stops publishing it', () => {
  assert.deepEqual(sheWorldSchedule('Check back soon for event dates.'), {
    thursday: false, saturday: false, firstMonday: false,
  })
})
