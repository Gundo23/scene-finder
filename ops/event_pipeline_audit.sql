-- Read-only audit. Run in the Scene Finder Supabase project.
WITH active_sources AS (
  SELECT venue_id, count(*) AS active_source_rows,
         count(DISTINCT source_url) AS distinct_source_urls,
         max(last_checked) AS latest_source_attempt
  FROM public.event_sources
  WHERE active = true
  GROUP BY venue_id
), event_counts AS (
  SELECT venue_id,
         count(*) FILTER (
           WHERE status = 'published'
             AND event_date >= (now() AT TIME ZONE 'Europe/London')::date
         ) AS legacy_status_future_count,
         count(*) FILTER (
           WHERE is_published = true
             AND event_date >= (now() AT TIME ZONE 'Europe/London')::date
         ) AS visible_dated_count,
         count(*) FILTER (
           WHERE is_published = true
             AND (event_date >= (now() AT TIME ZONE 'Europe/London')::date OR event_date IS NULL)
         ) AS page_visible_count,
         max(event_date) FILTER (WHERE status = 'published') AS latest_published_date
  FROM public.events
  GROUP BY venue_id
), latest_run AS (
  SELECT DISTINCT ON (venue_id) venue_id, status AS last_run_status,
         finished_at AS last_completed_run,
         previous_future_event_count, staged_future_event_count,
         failed_pages, error_count
  FROM public.venue_scrape_health_runs
  ORDER BY venue_id, finished_at DESC
)
SELECT s.venue_id, s.active_source_rows, s.distinct_source_urls,
       s.latest_source_attempt,
       r.last_completed_run, r.last_run_status,
       r.previous_future_event_count, r.staged_future_event_count,
       r.failed_pages, r.error_count,
       coalesce(e.legacy_status_future_count, 0) AS legacy_status_future_count,
       coalesce(e.visible_dated_count, 0) AS visible_dated_count,
       coalesce(e.page_visible_count, 0) AS page_visible_count,
       e.latest_published_date
FROM active_sources s
LEFT JOIN event_counts e USING (venue_id)
LEFT JOIN latest_run r USING (venue_id)
WHERE coalesce(e.page_visible_count, 0) = 0
   OR s.latest_source_attempt IS NULL
   OR s.latest_source_attempt < now() - interval '48 hours'
   OR r.last_completed_run IS NULL
   OR r.last_completed_run < now() - interval '48 hours'
   OR r.last_run_status NOT IN ('accepted', 'accepted_stale_review')
   OR coalesce(e.legacy_status_future_count, 0) <> coalesce(e.visible_dated_count, 0)
ORDER BY coalesce(e.page_visible_count, 0), s.latest_source_attempt NULLS FIRST
LIMIT 100;

-- How often did scrapes finish, and how often were they quarantined or partial?
SELECT date_trunc('day', finished_at) AS day_utc, status,
       count(*) AS venue_runs,
       sum(failed_pages) AS failed_pages,
       sum(error_count) AS errors
FROM public.venue_scrape_health_runs
WHERE finished_at >= now() - interval '14 days'
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

-- If status and is_published disagree, the scraper and public page see
-- different counts. Inspect any mismatches before changing the schema.
SELECT venue_id, status, is_published, count(*) AS events,
       min(event_date) AS first_date, max(event_date) AS last_date
FROM public.events
WHERE event_date >= (now() AT TIME ZONE 'Europe/London')::date
  AND (status = 'published') IS DISTINCT FROM (is_published = true)
GROUP BY venue_id, status, is_published
ORDER BY events DESC
LIMIT 100;

-- Recent attempts with no recorded completed venue run indicate timeout,
-- crash, or a write failure. They do not alone prove which one occurred.
WITH latest_attempt AS (
  SELECT venue_id, max(last_checked) AS attempted_at
  FROM public.event_sources WHERE active = true GROUP BY venue_id
), latest_completion AS (
  SELECT venue_id, max(finished_at) AS completed_at
  FROM public.venue_scrape_health_runs GROUP BY venue_id
)
SELECT a.venue_id, a.attempted_at, c.completed_at
FROM latest_attempt a
LEFT JOIN latest_completion c USING (venue_id)
WHERE a.attempted_at > coalesce(c.completed_at, '-infinity'::timestamptz)
ORDER BY a.attempted_at DESC
LIMIT 100;
