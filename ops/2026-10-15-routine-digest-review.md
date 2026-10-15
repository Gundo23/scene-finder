# Routine digest review — 15 October 2026

Read the original Gmail message `1a1412d1d0ffff82` (20:07 UTC). It contains 18 distinct venue issues. The last seven days of Gmail contain one matching Scene Finder message; the repository has no open PR duplicating this repair.

## Verified repair

- **Townhouse:** its old WordPress location page now returns a Svelte application shell with no events. The current first-party [`/events`](https://townhouseswingers.com/events) page has rendered cards with explicit ISO start times and full dated URLs. The new parser reads **32 confirmed dates, 16 October–31 December 2026**, without evaluating the site's JavaScript or requesting each detail page. Retired WordPress REST calls are removed. An empty extraction records a failed page and cannot count as a healthy missing-event scrape.
- **F Society:** its next-event card no longer renders a date. Its JSON-LD and new detail page identify **F-Society: Social - Fetish Fright Night, 30 October 2026 at 19:00**, at Zerox. The old Scene Finder listing still points to `/events/monthly-social` and says 21:00. The new parser requires metadata to match both the current next-card title and its official URL; it excludes past-card text, conflicting dates, cancelled events without a dated fallback, and unrelated metadata. It retains the older explicitly dated format. Sources: [listing](https://f-society.uk/events), [detail](https://f-society.uk/events/f-society-social-october-fetish-fright-night).
- **Monitor:** `get_venue_event_health()` excludes closed `status` values, but the curated UI labels use the separate `location_kind`. The health route now excludes records explicitly classified `closed` or `lead`, resolves their existing health alert states/queue entries, and keeps active organisers and unknown classifications monitored. No database migration is required.

## Every venue in the message

Public counts below were read directly from Scene Finder on 15 October. These are the UI's counts and can include undated records; they are not all confirmed future dated events.

| Venue | Public count | Finding and disposition |
| --- | ---: | --- |
| Atlantis Evolution | 0 | Official [homepage](https://atlantisevolution.co.uk/) advertises 16/17 October and links [`whats_on.htm`](https://atlantisevolution.co.uk/whats_on.htm). Genuine source-coverage gap; no active source per email. Requires source registration and a verified date/title parser in the correct database. No event rows written. |
| Birmingham Swingers Clubs | 0 | Public page identifies a **directory lead** and links generic Swingtowns, not a venue calendar. Excluded by the new monitor classification policy. |
| BMFC – Bangin’ in Birmingham | 0 | Configured website is an [official historical event](https://blackmansfanclub.co.uk/dir/events/bmfc-bangin-in-birmingham/) dated **10–11 August 2018**, at Xtasia. It cannot supply future Birmingham dates. Leave unresolved pending a current organiser calendar and location confirmation. |
| Boltz Club | 0 | Public page explicitly classifies this as **closed/inactive**. Monitor noise, handled by classification fix; no claim of a new event loss. |
| Bunker Bar / MA1 The Bunker | 0 | No website on the public record. [Operator page](https://www.sewellandmarbury.co.uk/ma1home18.html) independently matches **215–221 City Road**, with recurring event descriptions; some copy is old/contradictory. Requires a bounded verified source/parser and database registration. No dates inferred from ambiguous copy. |
| Chameleons Newport | 0 | First-party [Newport Events](https://www.chameleons.cc/newport-events/) says **no posts matched**. Direct fetch in this environment returned an unavailable page; indexed official page corroborates venue identity. No confirmed future dated events to import. |
| Edinburgh Kinky Swingers Party | 0 | Its website redirects from Circus Maximus to [Maximus BDSM](https://maximusbdsm.com/), whose current venue is Celestial Studios, Derby. Those events cannot be assigned to Edinburgh. Identity/source mismatch remains unresolved. |
| F Society | 1 | Real parser breakage; repair above. One confirmed official future occurrence, short runway to 30 October. No later date invented. |
| Fever Parties | 0 | Linked [official site](https://www.feverparties.com/) returned an unavailable page to this fetch. No accessible verified dated feed; leave source gap visible. |
| Pleasuredrome | 0 | [Official site](https://www.pleasuredrome.com/) confirms the Waterloo address and 24/7 operation; no dated calendar on the checked page. Opening hours are not a dated special-event feed. Source-coverage/policy gap remains. |
| Sailors Sauna | 0 | No website on the public record. [Official site](https://www.sailorssauna.com/) independently matches **570–574 Commercial Road**; hours-page fetch failed. Need a current event schedule and registration; do not create dates from directory copy. |
| Sexual entertainment, Sheffield | 0 | Generic record points to [steelcliffe.com](https://steelcliffe.com/), which returned an unavailable page. Venue identity and current calendar unverified; leave unresolved. |
| Sweatbox Soho | 0 | [Official events page](https://www.sweatboxsoho.com/events/) publishes explicit weekly Tuesday, Wednesday and Sunday schedules, plus Monday/Thursday admission promotions. Renewable source is available, but requires a dedicated recurrence parser and registration in verified Scene Finder Supabase. No unsupported one-off dates created. |
| The Backstreet | 0 | Public record explicitly **closed/inactive**. Classification fix excludes its live-calendar warnings. |
| The Hoist | 0 | Public record explicitly **closed/inactive**. Classification fix excludes its live-calendar warnings. |
| Townhouse | 36 | Real site replacement and stale ingestion; repair above. Existing public count includes **13 undated/TBC rows**, so 36 does not mean 36 confirmed future dates. Preserved rows require separate comparison after new dated import. |
| Vault 139 | 0 | [Official site](https://www.vault139.com/) verifies the cruise bar but indexed landing page is an age gate and direct fetch was unavailable. No verified calendar extracted. Source registration/parser remains outstanding. |
| Liberty Elite | 35 | Safety guard is preserving records, not reporting a public zero. Public cards show five pairs with the same official URL/date but different names: Halloween 23/24/25 October, Secret House 31 October, LiberateD 5 December. The [current official listing](https://libertyelite.co.uk/events/list/?eventDisplay=list&post_type=tribe_events) corroborates renamed Halloween nights. This supports title-change duplicates as a contributor; it does **not** prove the exact six missed database rows. A visible `Closed` listing is also present. Direct REST feed unavailable here. No preserved row deleted or hidden. Exact row review and any rename/duplicate reconciliation require verified production access. |

## Verification and production limits

- Actual downloaded official HTML: Townhouse **32 dated events**; F Society **one event, 30 October at 19:00**.
- Focused regression tests pass; all **21 test files** pass; TypeScript and ESLint on changed health/helper modules pass; `git diff --check` passes.
- Local production build fails in this workspace with `ENOENT: uv_resident_set_memory` before application build completes. Hosted Vercel build remains the release gate.
- Vercel lists `scene-finder` / `prj_UYAmayUNk6iho6r3o5fxgeqtdb3r`, but reading that project under `team_cFOALld9wMzV6snI1ST9ILyl` returns **403**, explicitly lacking access to `gundo23s-projects`. No Vercel CLI is installed for the mapped fallback.
- Public `/api/events-health` returns **401 Unauthorized**, as expected. No cron secret was requested, exposed, or bypassed.
- The only connected Supabase project is `nwgichgyqplfsrtgwbbr`, named `enquiries@u-print.org's Project`, created 13 October 2026. It is **not verified as Scene Finder**; no SQL was run against it. Production source registration, health-run inspection and targeted scrapes are unavailable in this run.
- Parser changes use the existing active F Society/Townhouse source rows and override the retired fetch path; no SQL migration is required for these two repairs. After a successful hosted build/deploy, run targeted authenticated scrapes for both venues, inspect `failed_pages` and `scrape_safety`, then verify the public dated listings. Monitor exclusion takes effect on the next health invocation.

No production events, sources, secrets or schedules were directly changed during investigation.
