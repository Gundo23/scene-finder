-- Read-only. Run in the Scene Finder Supabase SQL editor to inspect every
-- public venue whose /venues card currently shows zero upcoming events.
-- The page includes published undated events in its count.
WITH event_counts AS (
  SELECT e.venue_id,
         count(*) FILTER (WHERE e.is_published = true) AS historical_published_events,
         count(*) FILTER (
           WHERE e.is_published = true
             AND (e.event_date >= (now() AT TIME ZONE 'Europe/London')::date
                  OR e.event_date IS NULL)
         ) AS visible_upcoming_events,
         max(e.event_date) FILTER (WHERE e.is_published = true) AS latest_published_date
  FROM public.events e
  GROUP BY e.venue_id
), sources AS (
  SELECT s.venue_id,
         count(*) FILTER (WHERE s.active = true) AS active_sources,
         max(s.last_checked) FILTER (WHERE s.active = true) AS latest_source_attempt,
         string_agg(DISTINCT s.source_url, ' | ') FILTER (WHERE s.active = true) AS active_source_urls
  FROM public.event_sources s
  GROUP BY s.venue_id
), runs AS (
  SELECT DISTINCT ON (h.venue_id) h.venue_id, h.status AS last_run_status,
         h.finished_at AS last_run_finished, h.failed_pages AS last_failed_pages
  FROM public.venue_scrape_health_runs h
  ORDER BY h.venue_id, h.finished_at DESC
)
SELECT v.venue_id, v.name, v.website,
       coalesce(e.historical_published_events, 0) AS historical_published_events,
       e.latest_published_date,
       coalesce(s.active_sources, 0) AS active_sources,
       s.active_source_urls, s.latest_source_attempt,
       r.last_run_status, r.last_run_finished, r.last_failed_pages
FROM public.venues v
LEFT JOIN event_counts e USING (venue_id)
LEFT JOIN sources s USING (venue_id)
LEFT JOIN runs r USING (venue_id)
WHERE coalesce(e.visible_upcoming_events, 0) = 0
  AND lower(coalesce(v.status, '')) NOT IN
      ('tbc', 'closed', 'inactive', 'removed', 'deleted', 'permanently closed', 'permanent closed')
  AND lower(coalesce(v.status, '')) NOT LIKE '%lead%'
  AND lower(coalesce(v.category, '')) NOT LIKE '%lead%'
  AND lower(coalesce(v.name, '')) NOT LIKE 'about %'
  AND lower(coalesce(v.name, '')) NOT LIKE '% social lead'
  AND lower(coalesce(v.name, '')) NOT LIKE '%/ social lead%'
  AND lower(coalesce(v.name, '')) NOT LIKE '%swingers club lead%'
  AND lower(coalesce(v.name, '')) NOT LIKE '%kink munch / social lead%'
  AND lower(coalesce(v.name, '')) NOT IN ('about us', 'adult club')
ORDER BY coalesce(e.historical_published_events, 0) DESC,
         coalesce(s.active_sources, 0) DESC, v.name;
