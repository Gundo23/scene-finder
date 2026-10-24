import test from 'node:test'
import assert from 'node:assert/strict'
import { parseXtasiaEvents } from '../src/lib/xtasia-events.ts'

const page = 'https://xtasia.co.uk/events'
const html = `
  <section><h3>Today</h3><h5><a href="/events/20261016/hot-wives">Hot Wives</a></h5></section>
  <script>"href":"/events/20261019/explore-whats-on"</script>
  <section><h4>Fri 16 Oct</h4><p>Swing event</p><h5>Hot Wives</h5>
    <p>Fri 16 Oct 2026 8:00pm – 3:00am Xtasia</p>
    <a href="/events/20261016/hot-wives">View Event</a></section>
  <section><h4>Sat 17 Oct</h4><h5>Flirts closed</h5><p>Sat 17 Oct 2026 Closed</p></section>
  <section><h4>Fri 20 Nov</h4><p>Fetish event</p><h5>7 Deadly Sins</h5>
    <p>Fri 20 Nov 2026 8:00pm – 2:00am Flirts</p>
    <a href="https://xtasia.co.uk/events/20261120/7-deadly-sins">View Event</a></section>
  <section><h4>Fri 18 Dec</h4><h5>7 Deadly Sins</h5>
    <p>Fri 18 Dec 2026 8:00pm – 2:00am Flirts</p>
    <a href="/events/20261218/7-deadly-sins">View Event</a></section>
  <section><h4>Fri 20 Nov</h4><h5>7 Deadly Sins</h5>
    <p>Fri 20 Nov 2026 8:00pm – 2:00am Flirts</p>
    <a href="https://elsewhere.example/events/20261120/7-deadly-sins">View Event</a></section>
`

test('reads only dated official event cards, with year, title and URL from the same listing', () => {
  assert.deepEqual(parseXtasiaEvents(html, page, '2026-10-15')
    .map(({ event_date, text, start_time, href }) => [event_date, text, start_time, href]), [
      ['2026-10-16', 'Hot Wives', '20:00', 'https://xtasia.co.uk/events/20261016/hot-wives'],
      ['2026-11-20', '7 Deadly Sins', '20:00', 'https://xtasia.co.uk/events/20261120/7-deadly-sins'],
      ['2026-12-18', '7 Deadly Sins', '20:00', 'https://xtasia.co.uk/events/20261218/7-deadly-sins'],
    ])
})

test('does not infer a date from a URL alone or turn a redirected homepage into events', () => {
  const mismatch = '<h5>Flirts - 7 Deadly Sins</h5><p>Fri 16 Oct 2026 8:00pm</p><a href="/events/20261120/7-deadly-sins">View Event</a>'
  assert.deepEqual(parseXtasiaEvents(mismatch, page, '2026-10-15'), [])
  assert.deepEqual(parseXtasiaEvents('<h3>Explore what\'s on</h3><a href="/events">Events</a>', page, '2026-10-15'), [])
  assert.deepEqual(parseXtasiaEvents(html, 'https://xtasia.co.uk/', '2026-10-15'), [])
})

test('requires the official day and excludes past and distant events', () => {
  const markup = '<h5>Bad date</h5><p>Thu 16 Oct 2026 8:00pm</p><a href="/events/20261016/bad-date">View Event</a>'
  assert.deepEqual(parseXtasiaEvents(markup, page, '2026-10-15'), [])
  assert.deepEqual(parseXtasiaEvents(html, page, '2027-01-01'), [])
})

test('accepts official punctuation in literal and percent-encoded event slugs', () => {
  const markup = `<h5>Blood, Sweat and Tears</h5><p>Sun 18 Oct 2026 2:00pm – 8:00pm Xtasia</p>
    <a href="/events/20261018/blood%2C-sweat-and-tears">View Event</a>
    <h5>Paint and Play: Fright Night</h5><p>Fri 30 Oct 2026 8:30pm – 1:00am Flirts</p>
    <a href="/events/20261030/paint-and-play:-fright-night">View Event</a>`
  assert.deepEqual(parseXtasiaEvents(markup, page, '2026-10-16').map(({text, start_time}) => [text, start_time]), [
    ['Blood, Sweat and Tears', '14:00'], ['Paint and Play: Fright Night', '20:30'],
  ])
})

test('time belongs to the last validated date, not an earlier unlinked/closed card', () => {
  const markup = `<h5>Flirts closed</h5><p>Sun 18 Oct 2026 2:00pm – 8:00pm</p>
    <h5>7 Deadly Sins</h5><p>Fri 20 Nov 2026 8:00pm – 2:00am Flirts</p>
    <a href="/events/20261120/7-deadly-sins">View Event</a>`
  assert.equal(parseXtasiaEvents(markup, page, '2026-10-16')[0].start_time, '20:00')
})

test('a separate closure never contaminates the following public event description', () => {
  const markup = `<article><h5>Flirts &amp; Spa closed</h5><p>Private Hire Event</p>
    <p>Sat 19 Dec 2026</p><span>Closed</span></article>
    <article><h5>Naughty &amp; Nice - Christmas Party</h5>
    <p>Sat 19 Dec 2026 8:00pm &ndash; 3:00am Xtasia</p>
    <a href="/events/20261219/naughty-%26-nice---christmas-party">View Event</a></article>`
  const events = parseXtasiaEvents(markup, page, '2026-10-24')
  assert.equal(events.length, 1)
  assert.equal(events[0].text, 'Naughty & Nice - Christmas Party')
  assert.equal(events[0].event_date, '2026-12-19')
  assert.equal(events[0].start_time, '20:00')
  assert.doesNotMatch(events[0].raw, /closed|private hire|Flirts/i)
  assert.match(events[0].raw, /Naughty & Nice - Christmas Party\. Sat 19 Dec 2026 8:00pm/)
})

test('uses Midday rather than the end time and leaves absent/invalid starts unknown', () => {
  const card = (time) => `<h5>CherriPie Gangbang</h5><p>Wed 21 Oct 2026 ${time} Flirts</p>
    <a href="/events/20261021/cherripie-gangbang">View Event</a>`
  assert.equal(parseXtasiaEvents(card('Midday – 2:00pm'), page, '2026-10-16')[0].start_time, '12:00')
  assert.equal(parseXtasiaEvents(card('Midnight – 3am'), page, '2026-10-16')[0].start_time, '00:00')
  assert.equal(parseXtasiaEvents(card('TBC – 2:00pm'), page, '2026-10-16')[0].start_time, null)
  assert.equal(parseXtasiaEvents(card('25:00pm – 2:00pm'), page, '2026-10-16')[0].start_time, null)
})

test('punctuation support never admits encoded separators, controls or another host', () => {
  for (const href of ['/events/20261018/blood%2Fother', '/events/20261018/blood%5Cother',
    '/events/20261018/blood%00other', 'https://elsewhere.example/events/20261018/blood,-sweat-and-tears']) {
    const markup = `<h5>Blood, Sweat and Tears</h5><p>Sun 18 Oct 2026 2:00pm</p><a href="${href}">View Event</a>`
    assert.deepEqual(parseXtasiaEvents(markup, page, '2026-10-16'), [])
  }
})
