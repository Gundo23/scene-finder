import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSwampDates } from '../src/lib/swamp-dates.ts'

const page = 'https://www.swampinbristol.org.uk/2026-dates/'
const html = `<h1>2026 Dates</h1><p>SWAMP takes place on the second Sunday.</p>
<p>SUNDAY OCTOBER 11th – Electrics/Violet Wands Demo @ 3pm.</p>
<p>SUNDAY NOVEMBER 8th – Bondage Workshop @ 2.30pm</p>
<p>SUNDAY DECEMBER 13th – Xmas Show/Raffle @ 3pm</p>
<p>SUNDAY NOVEMBER 9th – Incorrect weekday @ 3pm</p>`

test('keeps only explicitly published future dates, with no invented recurrence', () => {
  assert.deepEqual(parseSwampDates(html, page, '2026-10-15')
    .map(({ event_date, text, start_time }) => [event_date, text, start_time]), [
      ['2026-11-08', 'Bondage Workshop', '14:30'],
      ['2026-12-13', 'Xmas Show/Raffle', '15:00'],
    ])
  assert.deepEqual(parseSwampDates(html, page, '2027-01-01'), [])
})

test('rejects arbitrary pages or text that lacks an official year heading', () => {
  assert.deepEqual(parseSwampDates(html, 'https://example.com/2026-dates/', '2026-10-15'), [])
  assert.deepEqual(parseSwampDates(html.replace('2026 Dates', 'Archive'), page, '2026-10-15'), [])
})
