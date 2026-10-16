import test from 'node:test'
import assert from 'node:assert/strict'
import { parseBacchusCalendar } from '../src/lib/bacchus-calendar.ts'

const url = 'https://www.clubbacchusdundee.uk/events/'
const event = (day, title, description = '') => `<p><strong>${day}</strong></p><h3><span>${title}</span></h3><p>${description}</p>`
const html = `<h2>September</h2>${event('Friday 25th', 'Old event')}
  <h2>October</h2>
  ${event('Friday 16th', 'Kink Night - Sci-Fi/Anime Theme<br>8pm - Late')}
  ${event('Saturday 17th', 'No Lights No Towels - Mixed Sauna<br>8pm - Late')}
  ${event('Wednesday 21st', 'Social - Games &amp; Karaoke - No Play - 6pm - 10pm', '- No Play')}
  ${event('FRIday 23rd', 'Dundee Dominas - House Mistress Event', 'Long official description. '.repeat(40))}
  ${event('Saturday 24th', 'Swingers - Mixed<br>8pm - late')}
  ${event('Friday 30th', 'Halloween - Silent Killer - Men Only')}
  ${event('SATURday 31st', 'Halloween Hosted Kink Event - 2pm - 7pm', 'Long official description. '.repeat(40))}
  ${event('Saturday 31st', 'Swingers - Halloween - Silent Killer - 9pm - Late')}
  <footer>We need your consent to load the translations. ${'Footer text. '.repeat(40)}</footer>`

test('reads all eight dated heading cards despite long descriptions and footer text', () => {
  const events = parseBacchusCalendar(html, url, '2026-10-16')
  assert.equal(events.length, 8)
  assert.equal(events[3].event_date, '2026-10-23')
  assert.equal(events[3].text, 'Dundee Dominas - House Mistress Event')
  assert.deepEqual(events.slice(-2).map(({ text, event_date, start_time }) => [text, event_date, start_time]), [
    ['Halloween Hosted Kink Event', '2026-10-31', '14:00'],
    ['Swingers - Halloween - Silent Killer', '2026-10-31', '21:00'],
  ])
  assert.equal(events[2].start_time, '18:00')
  assert.equal(events[5].start_time, null)
})

test('rejects changed source, wrong weekday, bad dates, cancelled and undated headings', () => {
  assert.deepEqual(parseBacchusCalendar(html, 'https://other.example/events/', '2026-10-16'), [])
  assert.deepEqual(parseBacchusCalendar(html, 'https://www.clubbacchusdundee.uk/', '2026-10-16'), [])
  const bad = `<h2>October</h2>${event('Thursday 30th', 'Wrong weekday')}
    ${event('Saturday 32nd', 'Invalid day')}${event('Saturday 31st', 'Cancelled Halloween event')}
    <h3>No date at all</h3><script>${event('Saturday 31st', 'Script event')}</script>`
  assert.deepEqual(parseBacchusCalendar(bad, url, '2026-10-16'), [])
})

test('does not roll a past yearless block into a future year and respects explicit years', () => {
  assert.deepEqual(parseBacchusCalendar(html, url, '2027-01-01'), [])
  const explicit = '<h2>January 2027</h2>' + event('Friday 1st', 'New Year event 8pm - Late')
  assert.equal(parseBacchusCalendar(explicit, url, '2026-12-30')[0].event_date, '2027-01-01')
  assert.deepEqual(parseBacchusCalendar(html, url, 'not-a-date'), [])
})
