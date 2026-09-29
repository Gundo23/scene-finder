-- Run once in the Scene Finder Supabase project's SQL editor.
-- The health check uses the same visibility rule as src/app/venues/page.tsx.
CREATE TABLE IF NOT EXISTS public.venue_event_health_alert_state (
  venue_id text NOT NULL,
  issue_kind text NOT NULL CHECK (issue_kind IN ('zero_events', 'stale_scrape', 'short_runway')),
  active boolean NOT NULL DEFAULT false,
  last_notified_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (venue_id, issue_kind)
);

ALTER TABLE public.venue_event_health_alert_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.venue_event_health_alert_state FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.venue_event_health_alert_state TO service_role;

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
  ), successful_runs AS (
    SELECT h.venue_id, max(h.finished_at) AS last_completed_success
    FROM public.venue_scrape_health_runs h
    WHERE h.status IN ('accepted', 'accepted_stale_review')
      AND h.failed_pages = 0 AND h.error_count = 0
    GROUP BY h.venue_id
  )
  SELECT s.venue_id::text, s.active_source_count, s.latest_source_attempt,
         r.last_completed_success,
         coalesce(e.historical_event_count, 0),
         coalesce(e.visible_future_count, 0), e.last_future_event_date
  FROM active_sources s
  LEFT JOIN event_summary e ON e.venue_id = s.venue_id
  LEFT JOIN successful_runs r ON r.venue_id = s.venue_id;
$$;

REVOKE ALL ON FUNCTION public.get_venue_event_health() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_venue_event_health() TO service_role;
