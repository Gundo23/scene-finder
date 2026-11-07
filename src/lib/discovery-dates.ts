/** Calendar dates are UK-local; arithmetic uses UTC to avoid daylight-saving shifts. */
export function getTodayString() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  return `${parts.find((p) => p.type === 'year')!.value}-${parts.find((p) => p.type === 'month')!.value}-${parts.find((p) => p.type === 'day')!.value}`
}

export function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** The next Friday–Sunday, excluding days that have already passed. */
export function getWeekendRange(today: string) {
  const day = new Date(`${today}T12:00:00Z`).getUTCDay()
  const daysUntilFriday = (5 - day + 7) % 7
  const start = day === 0 || day === 6 ? today : addDays(today, daysUntilFriday)
  const end = day === 0 ? today : day === 6 ? addDays(today, 1) : addDays(start, 2)
  return { start, end }
}
