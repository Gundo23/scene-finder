import test from 'node:test'
import assert from 'node:assert/strict'
import { parseQuestCalendar, QUEST_CALENDAR_URL } from '../src/lib/quest-calendar.ts'

// Reduced semantic fixtures from the new official rendered calendar, 16 Oct 2026.
// Raw first-party HTML is unavailable in this environment; these are not snapshots.
const card = (title, stamp, id, body = '') => `<article>
 <a href="/all-events/?event=${id}">${title}</a><div>Quest</div>
 <div>${stamp}</div><h2>${title}</h2><p>${body}</p>
 <a href="/all-events/?event=${id}">View Details</a></article>`

test('keeps the new dated event titles and canonical local times, not description times', () => {
  const html = card('80s PARTY NIGHT AT QUEST', 'Fri, October 16, 2026 20:30', 1100) +
    card('QUEST WRESTLEMANIA EVENT', 'Sat, October 17, 2026 20:30', 1101) +
    card('Funday Sunday – Couples &amp; Singles-18-10-2026', 'Sun, October 18, 2026 13:00', 1102) +
    card('Midweek Chill Night – Couples &amp; Singles', 'Wed, October 21, 2026 19:00', 1103,
      'Doors Open 11.00am – 6.00pm')
  assert.deepEqual(parseQuestCalendar(html + html, QUEST_CALENDAR_URL, '2026-10-16')
    .map(({ text, event_date, start_time }) => [text, event_date, start_time]), [
    ['80s PARTY NIGHT AT QUEST', '2026-10-16', '20:30'],
    ['QUEST WRESTLEMANIA EVENT', '2026-10-17', '20:30'],
    ['Funday Sunday – Couples & Singles', '2026-10-18', '13:00'],
    ['Midweek Chill Night – Couples & Singles', '2026-10-21', '19:00'],
  ])
})

test('rejects invalid dates, wrong weekdays, invalid times, past and distant events', () => {
  const bad = card('Invalid date', 'Tue, February 31, 2026 19:00', 1) +
    card('Wrong weekday', 'Fri, October 17, 2026 19:00', 2) +
    card('Invalid time', 'Sat, October 17, 2026 29:00', 3) +
    card('Past event', 'Thu, October 15, 2026 19:00', 4) +
    card('Too distant', 'Fri, October 15, 2027 19:00', 5)
  assert.deepEqual(parseQuestCalendar(bad, QUEST_CALENDAR_URL, '2026-10-16'), [])
})

test('requires official event links and adjacent date metadata; ignores generic pages and scripts', () => {
  const good = card('Actual event', 'Sat, October 17, 2026 20:30', 12)
  const bad = good.replaceAll('/all-events/?event=12', 'https://other.example/all-events/?event=12') +
    good.replaceAll('/all-events/?event=12', '/gallery/') +
    good.replaceAll('/all-events/?event=12', 'https://questswingersclub.uk.evil.example/all-events/?event=12') +
    good.replaceAll('/all-events/?event=12', '/all-events/?event=12&amp;redirect=evil') +
    `<script>${good}</script>` +
    card('Clear All', 'Sat, October 17, 2026 20:30', 20) +
    card('Closed for private event', 'Sat, October 17, 2026 20:30', 21) +
    card('Cancelled event', 'Sat, October 17, 2026 20:30', 22) +
    card('Unconfirmed title', 'Description mentions Sat, October 17, 2026 20:30', 23)
  assert.deepEqual(parseQuestCalendar(bad, QUEST_CALENDAR_URL, '2026-10-16'), [])
  assert.deepEqual(parseQuestCalendar(good, 'https://other.example/events/', '2026-10-16'), [])
  assert.deepEqual(parseQuestCalendar(good, 'https://questswingersclub.co.uk/upcoming-events/', '2026-10-16'), [])
  assert.deepEqual(parseQuestCalendar('<h1>Site Unavailable</h1>', QUEST_CALENDAR_URL, '2026-10-16'), [])
})

test('does not borrow a following event date or treat calendar grid labels as event titles', () => {
  const html = `<a href="/all-events/?event=12">8:30pm Calendar grid title</a>
   <a href="/all-events/?event=13">No timestamp here</a><p>No date confirmed</p>` +
    card('Actual event', 'Sat, October 17, 2026 20:30', 14)
  assert.deepEqual(parseQuestCalendar(html, QUEST_CALENDAR_URL, '2026-10-16').map(x => x.text), ['Actual event'])
})
