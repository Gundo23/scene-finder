import test from 'node:test'
import assert from 'node:assert/strict'
import { cupidsDetailDate, cupidsEventDetailLinks } from '../src/lib/cupids-calendar.ts'

test('discovers only official numeric event detail links from the new calendar', () => {
  const html = `
    <a href="/events/?event=950">Fri 9 Oct 2026 FU FUCKHOUSE UNLIMITED</a>
    <a href="https://www.cupidsswingersclub.co.uk/events/?event=951&amp;view=full">SQUIRT</a>
    <a href="/events/?event=950">Duplicate card</a>
    <a href="https://other.example/events/?event=952">Other venue</a>
    <a href="/events/?event=abc">Invalid identifier</a>`
  assert.deepEqual(cupidsEventDetailLinks(html, 'https://cupidsswingersclub.co.uk/events/'), [
    'https://cupidsswingersclub.co.uk/events/?event=950',
    'https://www.cupidsswingersclub.co.uk/events/?event=951&view=full',
  ])
})

test('uses the event start date rather than the overnight end date', () => {
  const html = '<h1>FU FUCKHOUSE UNLIMITED</h1><div>Date</div><div>Fri 9 Oct 2026</div>' +
    '<div>to Sat 10 Oct 2026</div><div>Time 7:00pm – 3:00am</div>'
  assert.equal(cupidsDetailDate(html), '2026-10-09')
  assert.equal(cupidsDetailDate('<div>DateFri 23 Oct 2026 to Sat 24 Oct 2026</div>'), '2026-10-23')
  assert.equal(cupidsDetailDate('<div>Date Fri 32 Oct 2026</div>'), null)
})
