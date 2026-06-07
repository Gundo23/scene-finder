export function cleanText(text: string | null | undefined) {
  if (!text) return ''

  return text
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')

    .replace(/&pound;/gi, '£')
    .replace(/&#163;/g, '£')

    .replace(/&euro;/gi, '€')
    .replace(/&#8364;/g, '€')

    .replace(/&dollar;/gi, '$')
    .replace(/&#36;/g, '$')

    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')

    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')

    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')

    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')

    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')

    .replace(/\s+/g, ' ')
    .trim()
}