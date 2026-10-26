-- A successful scrape can still have failed auxiliary pages. The scraper's
-- safety policy records the overall run as accepted only when the confirmed
-- future events are safe to publish, so do not label those runs "never
-- successful" solely because failed_pages is non-zero.
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
      AND h.error_count = 0
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

-- Verification: these accepted partial runs should now have a success time.
SELECT h.venue_id, h.last_completed_success, h.latest_source_attempt,
       h.visible_future_count
FROM public.get_venue_event_health() h
WHERE h.venue_id IN (
  'ecclesia_glasgow', 'electrowerkz_london',
  'ministry_studios_west_bromwich', 'pandora_s_pandoras_leeds',
  'slimelight_london', 'temptations_2_eccles_manchester',
  'the_attic_experience_derby', 'the_playgrounds_cleckheaton',
  'within_temptation_steamer_quay_torquay'
)
ORDER BY h.venue_id;
