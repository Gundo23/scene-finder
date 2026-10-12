/** Limit decompressed response bodies before parsing third-party content. */
export async function readBoundedResponse(response: Response, maxBytes = 12 * 1024 * 1024) {
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new Error(`Response exceeds ${maxBytes} byte limit`)
  }
  if (!response.body) return ''

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let bytes = 0
  let text = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > maxBytes) {
        void reader.cancel().catch(() => {})
        throw new Error(`Response exceeds ${maxBytes} byte limit`)
      }
      text += decoder.decode(value, { stream: true })
    }
    return text + decoder.decode()
  } finally {
    reader.releaseLock()
  }
}
