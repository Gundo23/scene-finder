import test from 'node:test'
import assert from 'node:assert/strict'
import { nextTemptationsPage, parseTemptationsCalendar } from '../src/lib/temptations-calendar.ts'

const card = (title, date, href) => `<article class="tribe-events-calendar-list__event tribe-common-g-row">
  <h3 class="tribe-events-calendar-list__event-title"><a href="${href}">${title}</a></h3>
  <time class="tribe-events-calendar-list__event-datetime" datetime="${date}T12:00:00+01:00">Noon</time>
  </article>`

test('dates each recurring event from its own calendar article, across pages', () => {
  const html = card('BI MONDAY TEMPTATION', '2026-11-09', '/event/bi-monday/') +
    card('BI MONDAY TEMPTATION', '2026-11-16', '/event/bi-monday/') +
    card('NEWBIE WEDNESDAY', '2026-11-18', '/event/newbie-wednesday/')
  assert.deepEqual(parseTemptationsCalendar(html, 'https://temptations2.co.uk/events/list/page/3/', '2026-10-15')
    .map(({ event_date, text, start_time }) => [event_date, text, start_time]), [
      ['2026-11-09', 'BI MONDAY TEMPTATION', '12:00'],
      ['2026-11-16', 'BI MONDAY TEMPTATION', '12:00'],
      ['2026-11-18', 'NEWBIE WEDNESDAY', '12:00'],
    ])
})

test('rejects undated links and unrelated hosts', () => {
  const html = card('Old', '2026-09-01', '/event/old/') +
    card('Offsite', '2026-11-01', 'https://example.com/event/offsite/') +
    '<a href="/event/false/">An undated article elsewhere</a>'
  assert.deepEqual(parseTemptationsCalendar(html, 'https://temptations2.co.uk/events/', '2026-10-15'), [])
})

test('follows the next calendar listing, even when the link has nested markup', () => {
  const html = '<a class="tribe-events-c-nav__next" href="/events/list/page/2/"><span>Next Events</span></a>'
  assert.equal(nextTemptationsPage(html, 'https://temptations2.co.uk/events/'),
    'https://temptations2.co.uk/events/list/page/2/')
  assert.equal(nextTemptationsPage(html.replace('page/2', 'page/3'), 'https://temptations2.co.uk/events/list/page/2/'),
    'https://temptations2.co.uk/events/list/page/3/')
})

test('follows the official shortcode pagination without accepting arbitrary queries', () => {
  const html = '<a class="tribe-events-c-nav__next" ' +
    'href="/events/list/page/2/?shortcode=f0b1cb7d"><span>Next Events</span></a>'
  assert.equal(nextTemptationsPage(html, 'https://temptations2.co.uk/events/'),
    'https://temptations2.co.uk/events/list/page/2/?shortcode=f0b1cb7d')
  assert.equal(nextTemptationsPage(html.replace('page/2', 'page/3'),
    'https://temptations2.co.uk/events/list/page/2/?shortcode=f0b1cb7d'),
    'https://temptations2.co.uk/events/list/page/3/?shortcode=f0b1cb7d')
  assert.deepEqual(parseTemptationsCalendar(card('Later event', '2026-11-19', '/event/later/'),
    'https://temptations2.co.uk/events/list/page/3/?shortcode=f0b1cb7d', '2026-10-15')
    .map(({ event_date, text }) => [event_date, text]), [['2026-11-19', 'Later event']])

  assert.equal(nextTemptationsPage(html.replace('shortcode=f0b1cb7d', 'utm_source=bad'),
    'https://temptations2.co.uk/events/'), null)
  assert.equal(nextTemptationsPage(html.replace('shortcode=f0b1cb7d', 'shortcode=f0b1cb7d&other=bad'),
    'https://temptations2.co.uk/events/'), null)
})

test('stops at four pages and rejects offsite, skipped and non-calendar links', () => {
  assert.equal(nextTemptationsPage('<a href="/events/list/page/5/">Next Events</a>',
    'https://temptations2.co.uk/events/list/page/4/'), null)
  assert.equal(nextTemptationsPage('<a href="https://evil.example/events/list/page/2/">Next Events</a>',
    'https://temptations2.co.uk/events/'), null)
  assert.equal(nextTemptationsPage('<a href="/events/list/page/3/">Next Events</a>',
    'https://temptations2.co.uk/events/'), null)
})
