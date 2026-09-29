# Scene Finder event reliability review — 29 September 2026

## What the evidence says

Liberty Elite had 37 linked published records but no future dates after 2 August. Its source attempt timestamp was still 10 June while other sources had been attempted on 29 September. A targeted scrape later returned 36 future event candidates and published 35 new records. This proves that the zero was a missing refresh of real source data; it does not prove which scheduled invocation first failed. The earlier targeted timeout and the source timestamp advancing without a completed publish show that an attempt timestamp alone is not evidence of a healthy scrape.

The current scraper stages candidates in memory. Before this patch it processed up to 80 sources and only then finalized every venue. A function timeout could discard all staged work. It updated `event_sources.last_checked` before finalization. The safety guard already preserved missing future events, but it could not preserve dates that had naturally moved into the past.

The scraper counted `status = 'published'` and UTC dates. The venues page counted `is_published = true`, including undated events, using the London calendar date. Those predicates can disagree. The page previously broke out of pagination on an error and displayed its partial result as an ordinary zero. Its pagination had no explicit order.

The zero event alert ran at the end of a successful scraper request and only for the venues selected in that request. It cannot fire for a venue omitted from the batch, for an expired calendar with no scrape, or for a request that times out first.

The 29 September live audit returned 92 affected venues: 86 had no source attempt since before 27 September, and 54 displayed zero events. Only six venue health runs completed in the previous 14 days, on three dates, despite the Vercel configuration calling `/api/scrape` daily at 03:00 UTC. The Hobby plan cannot schedule it more often in Vercel. These observations strongly support incomplete or failed scheduled runs, but the precise error remains unverified because older function logs are unavailable on the current plan.

Live event status breakdown exposed another safety defect: 849 future dated visible events have `status = 'active'`, while 334 have `status = 'published'`. There are also 42 undated visible rows. The old safety counter used only `status = 'published'`, so it ignored most of the future dated rows the site displays. The corrected safety counter uses `is_published = true` **and a future date**; the public page monitor additionally includes undated rows to match its visible count.

## Safeguards prepared

1. **Per venue completion:** finish publishing and record health when that venue's selected sources finish, then release staged records. Group sources by venue inside the selected batch. A later timeout no longer loses already completed venues.
2. **Fair attempts:** order sources oldest attempt first, select whole venues with the bounded `batch_size` query parameter, and record each source attempt before fetching. A hung source cannot remain first in every later batch. The health run timestamp is the evidence of completion.
3. **Preserve live rows:** do not automatically delete same title and date duplicates while publishing. The existing scrape safety path already disables the broad junk cleanup and never archives missing future events.
4. **Visible count check:** compare future dated `is_published = true` events before and after publishing, independent of whether their status is `active` or `published`. The separate page monitor also counts undated visible rows. Send a safety alert if published candidates still yield zero future dated events or the verification query fails.
5. **Public page integrity:** use stable keyset pagination. On an event query failure, display an unavailable message instead of a numeric zero or partial count on both the venues list and individual venue pages.
6. **Independent health job:** query all active venues in one database function, including their latest completed healthy scrape. Alert on zero visible future events, no healthy completion in 48 hours, and a short event runway. Persist per venue issue state and repeat unresolved notices daily. The endpoint requires `CRON_SECRET` and is independent of `/api/scrape`.
7. **Scraper authorization:** production `/api/scrape` also requires `CRON_SECRET`; targeted manual runs require an authenticated HTTP client rather than an ordinary browser address.

## Files and deployment order

| File | Destination or action |
| --- | --- |
| `src/app/api/scrape/route.ts` | Scrape safety and one venue batch. |
| `src/app/venues/page.tsx`, `src/app/venue/[id]/page.tsx` | Honest event query failure display. |
| `ops/event_health_migration.sql` | Run once in the correct Scene Finder Supabase project. |
| `src/app/api/events-health/route.ts` | Independent health check. |
| `ops/event_pipeline_audit.sql` | Read only diagnostics; run in the correct Scene Finder Supabase project before and after release. |

Set `CRON_SECRET` in production before deploying the protected scraper. The existing Vercel daily job remains as a fallback; Vercel attaches this secret as the bearer token automatically. `ops/supabase_cron_setup.sql` is a template for a ten minute source sweep and an hourly independent health check. The secret must be stored in Supabase Vault under `scene_finder_cron_secret` and match Vercel's `CRON_SECRET`. Run that template only after the patched routes are live and an authenticated request has succeeded. The scraper is capped at one complete venue per request. This offers 144 venue slots per day; the 120 active source rows imply no more than 120 distinct venues, so it can cover every venue daily if invocations complete. A venue that takes longer than the Vercel function limit will still fail, but it will not hold the oldest queue position forever and the health check will alert. Add a database claim or per venue lock before allowing overlapping invocations; the current query and timestamp update are not an atomic job claim.

Vercel Hobby Cron allows only daily scheduling, so the frequent jobs use Supabase Cron. It can call HTTP endpoints more frequently. Store the bearer secret in Vault, not in SQL text or a committed file. Check the actual `net._http_response` HTTP status, not only pg_cron's successful enqueue result, and the `venue_scrape_health_runs` timestamps. Dependencies installed and `npx tsc --noEmit` passed locally. The full Next.js build stops before compilation in this execution environment with `ENOENT: uv_resident_set_memory`; a CI or Vercel build remains an integration gate. Targeted ESLint reports existing errors in the oversized scraper and page files; the new health route has no lint errors.

## Release checks

1. Run the audit SQL and inspect status versus `is_published` mismatches, source age, and health run history. Confirm the actual scheduled job configuration, plan, schema, and any other writers to `events` before replacing production files.
2. Apply the migration. Test an unauthorized health request returns 401. Run an authorized health check and confirm its issue count and one digest email; run it twice and confirm the second sends no duplicate alert. Simulate a resolved issue and confirm a later recurrence alerts again.
3. Run one authenticated targeted scrape for a known healthy venue and one source with zero/failed candidates. Confirm live rows remain visible, `scrape_safety` is logged, and the health route detects stale or zero conditions. Check that the public page shows “Unavailable” if its event read fails.
4. Run a small global batch and confirm a health row is finished per selected venue before the overall request ends. Test a deliberately slow later source in staging to verify earlier venues remain committed.
5. Track active sources attempted and venues with a healthy completed run in the preceding 24 and 48 hours. The ten minute schedule must produce at least one completed venue run per active venue daily, plus capacity for retries.

## Remaining limit

No software can truthfully display future events if the venue has published none. The defensible promise is that a scraper failure does not silently erase valid future listings, every active source gets another chance, the page does not disguise query failure as zero, and genuine zero or stalled refresh is reported promptly. The precise failure of the daily invocation cannot be proved without its historical function log. The repository HEAD matches the supplied ZIP. No production database credentials were supplied, so the SQL migration, schedule, full build, and end to end checks have not been run against production.

Older Vercel logs were unavailable on the Hobby plan. Database service role counts can differ from the public client if Row Level Security policies change; a public read canary or public count RPC would be a useful follow-up before claiming a strict end to end availability guarantee. This patch has not been deployed.
