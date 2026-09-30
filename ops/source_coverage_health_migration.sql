-- Apply to the Scene Finder Supabase project after deploying the matching
-- /api/events-health route. Existing alert state and cron jobs are retained.
ALTER TABLE public.venue_event_health_alert_state
  DROP CONSTRAINT IF EXISTS venue_event_health_alert_state_issue_kind_check;
ALTER TABLE public.venue_event_health_alert_state
  ADD CONSTRAINT venue_event_health_alert_state_issue_kind_check
  CHECK (issue_kind IN ('zero_events', 'stale_scrape', 'short_runway', 'missing_source'));

-- Infusion moved its calendar from the old /21.html page to /events/.
-- Keep an already configured canonical source, if present, and retire the
-- obsolete duplicate instead of hitting the same page twice each run.
UPDATE public.event_sources AS old_source
SET active = false
WHERE old_source.venue_id = 'infusions_infusion_blackpool_blackpool'
  AND old_source.active = true
  AND old_source.source_url ~* '^https?://(www\.)?infusionblackpool\.co\.uk/21\.html/?$'
  AND EXISTS (
    SELECT 1 FROM public.event_sources AS canonical
    WHERE canonical.venue_id = old_source.venue_id AND canonical.active = true
      AND canonical.source_url = 'https://www.infusionblackpool.co.uk/events/'
  );

UPDATE public.event_sources AS source
SET source_url = 'https://www.infusionblackpool.co.uk/events/'
WHERE source.venue_id = 'infusions_infusion_blackpool_blackpool'
  AND source.active = true
  AND source.source_url ~* '^https?://(www\.)?infusionblackpool\.co\.uk/21\.html/?$';

-- A clean HTTP run with no usable dated candidates is not evidence of a
-- renewable event feed. This query covers the same public venues as /venues,
-- including those without any active event_sources rows.
CREATE OR REPLACE FUNCTION public.get_venue_event_health()
RETURNS TABLE (
  venue_id text,
  active_source_count bigint,
  latest_source_attempt timestamptz,
  last_completed_success timestamptz,
  historical_event_count bigint,
  visible_future_count bigint,
  last_future_event_date date
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH active_sources AS (
    SELECT s.venue_id, count(*) AS active_source_count,
           max(s.last_checked) AS latest_source_attempt
    FROM public.event_sources s
    WHERE s.active = true
    GROUP BY s.venue_id
  ), event_summary AS (
    SELECT e.venue_id,
           count(*) FILTER (WHERE e.is_published = true) AS historical_event_count,
           count(*) FILTER (
             WHERE e.is_published = true
               AND (e.event_date >= (now() AT TIME ZONE 'Europe/London')::date
                    OR e.event_date IS NULL)
           ) AS visible_future_count,
           max(e.event_date) FILTER (
             WHERE e.is_published = true
               AND e.event_date >= (now() AT TIME ZONE 'Europe/London')::date
           ) AS last_future_event_date
    FROM public.events e
    GROUP BY e.venue_id
  ), productive_runs AS (
    SELECT h.venue_id, max(h.finished_at) AS last_completed_success
    FROM public.venue_scrape_health_runs h
    WHERE h.status IN ('accepted', 'accepted_stale_review')
      AND h.failed_pages = 0 AND h.error_count = 0
      AND h.staged_future_event_count > 0
    GROUP BY h.venue_id
  )
  SELECT v.venue_id::text, coalesce(s.active_source_count, 0),
         s.latest_source_attempt, r.last_completed_success,
         coalesce(e.historical_event_count, 0),
         coalesce(e.visible_future_count, 0), e.last_future_event_date
  FROM public.venues v
  LEFT JOIN active_sources s ON s.venue_id = v.venue_id
  LEFT JOIN event_summary e ON e.venue_id = v.venue_id
  LEFT JOIN productive_runs r ON r.venue_id = v.venue_id
  WHERE lower(trim(coalesce(v.status, ''))) NOT IN
    ('tbc', 'closed', 'inactive', 'removed', 'deleted', 'permanently closed', 'permanent closed')
    AND lower(coalesce(v.status, '')) NOT LIKE '%lead%'
    AND lower(coalesce(v.category, '')) NOT LIKE '%lead%'
    AND lower(trim(coalesce(v.name, ''))) NOT LIKE 'about %'
    AND lower(trim(coalesce(v.name, ''))) NOT IN ('about us', 'adult club')
    AND lower(trim(coalesce(v.name, ''))) NOT LIKE '% social lead'
    AND lower(coalesce(v.name, '')) NOT LIKE '%/ social lead%'
    AND lower(coalesce(v.name, '')) NOT LIKE '%swingers club lead%'
    AND lower(coalesce(v.name, '')) NOT LIKE '%kink munch / social lead%';
$$;

REVOKE ALL ON FUNCTION public.get_venue_event_health() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_venue_event_health() TO service_role;

-- Read-only verification: missing sources are now included in the health RPC.
SELECT count(*) AS public_venues_checked,
       count(*) FILTER (WHERE active_source_count = 0) AS missing_sources,
       count(*) FILTER (
         WHERE active_source_count > 0 AND last_completed_success IS NULL
       ) AS active_sources_without_productive_run
FROM public.get_venue_event_health();
