# Morning digest review — 17 October 2026

Read the original 08:07 UTC / 09:07 UK Gmail message. Two distinct `short_runway`
issues; no zero-event incident in this message.

## Eagle London — incomplete extraction, repair implemented

- Direct public Scene Finder HTML shows **3 records**: BRÜT SOCIAL on 24 October,
  Halloween on 31 October (both displayed at 20:00), and undated `OUR NIGHTS`.
  Three records do not mean three confirmed future occurrences.
- The [official homepage](https://www.eaglelondon.com/) publishes later dates.
  Its downloaded first-party HTML contains visible Wix event cards and matching
  `wix-warmup-data` records with full UTC timestamps and Europe/London timezone.
  There are **17 matching current/future candidates, 17 October–14 November**.
  One 16 October record is excluded as past; no recurrence is projected.
- First-party detail pages independently confirm [Athena, 7 November at 21:00](https://www.eaglelondon.com/event-details/athena-45)
  and [Horse Meat Disco, 8 November at 20:00](https://www.eaglelondon.com/event-details/horse-meat-disco-2026-11-08-20-00).
- Existing generic Wix tile parsing expects full month/year prose and titles
  with parenthesised times. These are not Eagle's current short-date cards, and
  generic JSON-LD does not read its Wix app data. The homepage's JSON-LD scripts
  describe the site/business, not all events. Generic crawling cannot guarantee
  the complete calendar within its page cap.
- New venue-bound parser pairs each metadata record with the same visible
  official card title, URL and short date. It validates explicit timestamps,
  converts UTC to London local date/time (including DST), requires published
  current records, excludes changed/invalid/undated data and deduplicates URLs.
- Reuse existing dedicated calendar staging, override existing Eagle sources to
  its canonical homepage and make only one fetch per venue. Do not crawl generic
  navigation. Empty extraction counts as a failed page and retains the safety
  guard; it cannot silently count as a healthy missing-event scrape.
- A reduced fixture retains actual public card markup and necessary event
  fields from today's downloaded HTML. Unrelated Wix configuration/identifiers
  are omitted. Local extraction against the **full original HTML** also yields
  17 future candidates through 14 November. Existing October start times should
  update from 20:00 to the source's 21:00 on a successful publication.

## Infusion Blackpool — valid short runway; no new dates invented

- Direct public HTML shows **12 dated rows**, ending 31 October. Two Sunday
  dates have preserved title variants, so this is not 12 distinct occurrences.
- The [official site](https://www.infusionblackpool.co.uk/) and
  [events index](https://www.infusionblackpool.co.uk/events/) link calendars only
  through October. The [checked October page](https://www.infusionblackpool.co.uk/events/october/)
  ends on **31 October**, with no linked November calendar found.
- Existing `infusionMonthLinks` follows published current/upcoming official month
  links; its parser already extracts explicit dates with weekday validation.
  The source's 23 October heading says Friday while the description says
  Saturday; the existing guard continues to hold that conflicting entry.
- No parser change justified by this warning. Await the venue's next published
  calendar. Do not synthesize November from October themes or delete preserved
  Sunday variants to clear a health alert.

## Verification and rollout

- All **72 Node tests** pass. TypeScript, new-helper ESLint and diff whitespace
  checks pass. Tests cover actual first-party event data, BST/GMT conversion,
  invisible/mismatched cards, changed sources, invalid timestamps, unpublished
  records, recurrence non-expansion and empty/unavailable pages.
- Hosted CI and Vercel build must pass before release. Deployment alone is not
  verification of production ingestion. After release, inspect a targeted Eagle
  scrape's candidates, failed pages and scrape-safety status, then verify public
  November dates. Protected scrape/health access and exact preserved-row review
  require authenticated production access; no credentials were extracted or
  protected endpoints bypassed.
- No published row, source row, schedule or alert threshold was deleted/changed
  directly in production. No database migration is needed for the Eagle parser.
