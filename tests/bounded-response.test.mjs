import test from 'node:test'
import assert from 'node:assert/strict'
import { readBoundedResponse } from '../src/lib/bounded-response.ts'

test('decodes split UTF-8 chunks without corrupting event titles', async () => {
  const bytes = new TextEncoder().encode('Halloween 🎃')
  const response = new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(bytes.slice(0, 11))
      controller.enqueue(bytes.slice(11, 12))
      controller.enqueue(bytes.slice(12))
      controller.close()
    },
  }))
  assert.equal(await readBoundedResponse(response, 100), 'Halloween 🎃')
})

test('rejects oversized declared and streamed pages', async () => {
  await assert.rejects(readBoundedResponse(new Response('small', {
    headers: { 'content-length': '999' },
  }), 10), /exceeds/)
  await assert.rejects(readBoundedResponse(new Response('actually too big'), 8), /exceeds/)
})
