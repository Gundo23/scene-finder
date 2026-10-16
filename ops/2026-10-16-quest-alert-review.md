# Quest Leeds stale-scrape alert — 16 October 2026

Read the original Gmail message received at 20:07 UTC (21:07 UK). One issue:
`quest_leeds_leeds: stale_scrape`; last confirmed successful scrape 14 October
16:54 UTC, latest attempt 16 October 13:10 UTC. This is not a zero-event alert.

## Evidence and diagnosis

- Scene Finder's public venue page still shows 28 upcoming records, including
  malformed `ober` prefixes, `Clear All`, undated navigation/facility pages, and
  older October events. These are preserved public records, not a verified count
  of 28 current official occurrences.
- The old official homepage `https://questswingersclub.co.uk/` redirects in the
  rendered first-party result to `https://questswingersclub.uk/`. The replacement
  site retains Quest's name, Leeds/Hunslet location and 0113 2713013 contact number.
- The current [official calendar](https://questswingersclub.uk/events/) publishes
  event-specific links of the form `/all-events/?event=<id>` with adjacent full
  weekday/month/day/year and local start time. It includes the 16 October 80s
  Party Night at 20:30, 17 October Wrestlemania at 20:30, and Sunday 18 October at
  13:00. The 80s detail page independently confirms 16 October 2026 at 20:30.
  Later November and December entries are published; this is not simply waiting
  for the organiser to release more dates.
- The old scraper visits `/upcoming-events/` and expects old weekday/day/month
  prose. Its month alternation can consume `Oct` before `October`, leaking `ober`
  into titles. Generic link extraction also admits navigation. Neither mechanism
  describes the replacement calendar reliably.

## Repair

- Override existing Quest source rows to the verified new official calendar;
  deduplicate equivalent sources and fetch one listing page per venue.
- Use a dedicated parser that requires an exact official event URL and an
  adjacent canonical timestamp. Validate real dates, weekdays, local times,
  future range and duplicates. Ignore grid labels, navigation and scripts. Use
  canonical timestamps rather than conflicting times in description prose.
- Reuse the existing dedicated calendar staging path; do not crawl retired
  Quest pages or publish generic link candidates. Empty extraction is recorded
  as a failed page so it cannot count as a healthy missing-event scrape.
- No source registration migration or deletion is needed. Existing junk, stale
  titles and duplicate records remain for exact comparison with production rows.

## Verification and limits

- All 68 Node tests, TypeScript, helper ESLint and `git diff --check` pass.
- Tests use reduced semantic fixtures from observed official rendered content;
  they are **not** actual HTML snapshots. Both direct HTTP and the public browser
  return a 195-byte `Site Unavailable` page here. Search-rendered first-party
  calendar and detail pages are accessible. The full raw HTML and end-to-end
  extraction could not be verified in this environment.
- Hosted build/CI must pass before release. A merged/deployed parser alone is
  not proof of imported records. After release, verify an authenticated targeted
  Quest scrape's candidates, failed pages and scrape-safety status, then compare
  public dates/times. If production also receives the unavailable page, the
  failed-page guard will preserve records and keep the problem visible.
- Prior production access limits persist: the connected Supabase project was
  not verified as Scene Finder, and Vercel denied the Scene Finder team scope.
  No credentials were extracted and no protected endpoint was bypassed.
