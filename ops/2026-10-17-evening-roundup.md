# Daily alert roundup — 17 October 2026

## Alerts since the previous roundup

Read both actual Gmail messages. All Mail search includes Spam; a separate Spam
search also found no messages. Two routine emails, three distinct venue/issues:

- 16 October, 20:07 UTC: Quest Leeds `stale_scrape`.
- 17 October, 08:07 UTC: Eagle London and Infusion Blackpool `short_runway`.

No new critical zero-event email was found in this window. All three email issues
were already investigated in PRs #39 and #40; both remain merged with successful
Vercel checks for their merged commits.

## Fresh direct production observations

- **Quest:** public total **87 records**, initial 40 rendered. The 17 October
  Wrestlemania at 20:30, Sunday 18 October at 13:00, and new November dates are
  visible. This verifies new-calendar ingestion after #39, not a complete clean
  calendar: older `ober` title variants and duplicate dates remain preserved.
- **Eagle:** public total **19 records**, 18 dated through **15 November** plus
  undated `OUR NIGHTS`. Athena on 7 November and Horse Meat Disco on 8 November
  are live with correct displayed local times. The November import after #40 is
  now publicly verified. One new defect was found: the 17 October official
  `80:20` title displays as `. Official Eagle London event listing.`
- **Infusion:** **12 dated rows**, ending **31 October**. Preserved title variants
  remain on 18/25 October. The checked official events index still links only
  through October; a later published calendar is still awaited.
- **Bacchus follow-up:** **8 public rows**, including the previously missing
  **23 October** and both **31 October** occurrences. A preserved 21 October
  title variant means eight rows do not represent eight distinct occurrences.
  The new imports after #34 are now visible; short runway and exact row review
  are separate issues.

## Newly discovered Eagle numeric-title defect

The source parser correctly emits `80:20`; the actual scraper's later
`cleanEventName` strips numbers as date/time page chrome. Rescue cleanup then
falls back to the event description, creating the malformed live title.

Preserve the exact known numeric name during cleanup. The final short/numeric
title guard is exempted only when all of these match: Eagle's venue ID, the
exact `80:20` title, a real event date, and an HTTPS official Eagle
`/event-details/80-20-<number>` URL without query, fragment or credentials.
Other numeric names retain existing rejection rules; all other publication,
quality, staging and preservation checks remain active.

Tests execute the actual scraper title-cleanup functions against this regression
and check wrong venue, host, date and URL cases. All **74 tests**, TypeScript,
new-helper ESLint and diff checks pass. Hosted CI/build must pass before release.

The malformed row is deliberately not deleted or silently reconciled. A future
scrape may publish the corrected title alongside the preserved artifact, because
the existing identity rules include title/date/URL. Exact row correction still
requires verified production database access. A successful deployment of this
follow-up is not proof that the corrected title has imported.

No live source rows, event rows, schedules or alert thresholds were directly
changed, and no events were fabricated.
