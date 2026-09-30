import assert from 'node:assert/strict'
import test from 'node:test'

test('loading Route69 calendar helpers does not load the PDF canvas runtime', async () => {
  const originalDOMMatrix = globalThis.DOMMatrix
  const { route69CalendarLinks } = await import('../src/lib/route69-calendar.ts')

  assert.equal(globalThis.DOMMatrix, originalDOMMatrix)
  assert.deepEqual(
    route69CalendarLinks(
      'https://img1.wsimg.com/blobby/go/example/R69EventsOCT2026.pdf',
      'https://route69-wsm.co.uk/events',
      '2026-09-30'
    ),
    ['https://img1.wsimg.com/blobby/go/example/R69EventsOCT2026.pdf']
  )
})
