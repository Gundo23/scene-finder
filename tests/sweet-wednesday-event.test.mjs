import test from 'node:test'
import assert from 'node:assert/strict'
import { isOfficialSweetWednesdayCalendarEvent } from '../src/lib/sweet-wednesday-event.ts'

test('only dated Sweet Wednesday events on the official calendar qualify', () => {
  const event = { venueId: 'sweet_wednesday_london', title: 'Sweet Wednesday',
    eventDate: '2026-10-21', ticketUrl: 'https://sweetwednesday.co.uk/about/' }
  assert.equal(isOfficialSweetWednesdayCalendarEvent(event), true)
  assert.equal(isOfficialSweetWednesdayCalendarEvent({ ...event, ticketUrl: 'https://sweetwednesday.co.uk/find-us/' }), false)
  assert.equal(isOfficialSweetWednesdayCalendarEvent({ ...event, ticketUrl: 'https://elsewhere.example/about/' }), false)
  assert.equal(isOfficialSweetWednesdayCalendarEvent({ ...event, venueId: 'another_venue' }), false)
  assert.equal(isOfficialSweetWednesdayCalendarEvent({ ...event, title: 'About us' }), false)
  assert.equal(isOfficialSweetWednesdayCalendarEvent({ ...event, eventDate: null }), false)
})
