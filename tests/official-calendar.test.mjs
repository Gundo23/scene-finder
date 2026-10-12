import test from 'node:test'
import assert from 'node:assert/strict'
import { isOfficialHeadingCalendar, officialCalendarNavigation, parseOfficialHeadingCalendar } from '../src/lib/official-calendar.ts'

test('Jaydees calendar reads future dated headings and ignores stale listings', () => {
  const html = `<h2>This Month at Jaydees</h2><h3>Pyjama Party</h3><p>Saturday 3rd Oct</p>
    <h3>Jaydees Naturist Spa Day</h3><p>Thursday 15th Oct</p><p>11am – 5pm</p>
    <h3>Newbie Night</h3><p>Saturday 28th Nov</p><p>20:30 – 2:00</p>`
  const events = parseOfficialHeadingCalendar(html, 'jaydees_colmworth_bedfordshire', 'https://jaydeesclub.com/events', '2026-10-12')
  assert.deepEqual(events.map(e => [e.text, e.event_date]), [
    ['Jaydees Naturist Spa Day', '2026-10-15'], ['Newbie Night', '2026-11-28'],
  ])
  assert.equal(events[0].start_time, '11:00')
  assert.equal(parseOfficialHeadingCalendar(html, 'jaydees_colmworth_bedfordshire', 'https://imposter.example/events', '2026-10-12').length, 0)
})

test('Private Club calendar reads dated headings with the adjacent party name', () => {
  const html = `<h3>Tuesday 13th October</h3><p>NEW Stay &amp; Play Parties at the Private Club. Booking form below.</p>
    <h3>Thursday 15th October</h3><p>HOT &amp; HORNY WIVES ANAL Party Featuring TWO HOT HOSTESSES. 8PM</p>
    <h3>Tuesday 32nd October</h3><p>Invalid date party</p>`
  const events = parseOfficialHeadingCalendar(html, 'the_private_club_birmingham_birmingham', 'https://www.theprivateclub.com/gangbang-party-birmingham/', '2026-10-12')
  assert.deepEqual(events.map(e => [e.text, e.event_date]), [
    ['NEW Stay & Play Parties at the Private Club', '2026-10-13'],
    ['HOT & HORNY WIVES ANAL Party Featuring TWO HOT HOSTESSES', '2026-10-15'],
  ])
  assert.equal(events[1].start_time, '20:00')
})

test('prioritizes only same-origin official calendar navigation', () => {
  const links = `<a href="/events/">Events</a><a href="https://different.example/calendar">Calendar</a>
    <a href="/events/other-club/">Events</a><a href="/diary/">Diary</a>`
  assert.deepEqual(officialCalendarNavigation(links, 'https://venue.example/'), [
    'https://venue.example/events/', 'https://venue.example/diary/',
  ])
  assert.equal(isOfficialHeadingCalendar('the_private_club_birmingham_birmingham', 'https://theprivateclub.com/gangbang-party-birmingham/'), true)
})
