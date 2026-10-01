const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

// Only use dates explicitly published beneath a year heading on the official page.
export function parseSweetWednesdayDates(text: string, today: string): string[] {
  const dates = new Set<string>()
  const sections = text.matchAll(/future party dates\s+(20\d{2})([\s\S]*?)(?=future party dates\s+20\d{2}|sweet wednesday facilities|$)/gi)

  for (const section of sections) {
    const year = Number(section[1])
    const rows = section[2].matchAll(/\bwednesday\s+(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(20\d{2}))?/gi)

    for (const row of rows) {
      const day = Number(row[1])
      const month = MONTHS.indexOf(row[2].toLowerCase())
      if (Number(row[3] || year) !== year || month < 0) continue

      const date = new Date(Date.UTC(year, month, day))
      if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month ||
          date.getUTCDate() !== day || date.getUTCDay() !== 3) continue

      const value = date.toISOString().slice(0, 10)
      if (value >= today) dates.add(value)
    }
  }

  return [...dates].sort()
}
