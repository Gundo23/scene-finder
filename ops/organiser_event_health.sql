-- Include verified organiser associations in the existing public health metrics.
-- Host calendars retain their own monitoring and shared event IDs.
CREATE OR REPLACE FUNCTION public.get_venue_event_health()
 RETURNS TABLE(venue_id text, active_source_count bigint, latest_source_attempt timestamp with time zone, last_completed_success timestamp with time zone, historical_event_count bigint, visible_future_count bigint, last_future_event_date date)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH profile_events AS (
    SELECT e.venue_id AS profile_id, e.venue_id AS host_venue_id,
           e.event_id, e.is_published, e.event_date
    FROM public.events e
    UNION ALL
    SELECT e.organiser_id AS profile_id, e.venue_id AS host_venue_id,
           e.event_id, e.is_published, e.event_date
    FROM public.events e
    JOIN public.venues v ON v.venue_id = e.organiser_id
    WHERE v.source_type = 'event_organiser'
      AND e.organiser_id IS DISTINCT FROM e.venue_id
  ), profile_hosts AS (
    SELECT v.venue_id AS profile_id, v.venue_id AS host_venue_id
    FROM public.venues v
    UNION
    SELECT e.profile_id, e.host_venue_id FROM profile_events e
  ), active_sources AS (
    SELECT p.profile_id AS venue_id, count(*) AS active_source_count,
           max(s.last_checked) AS latest_source_attempt
    FROM profile_hosts p
    JOIN public.event_sources s ON s.venue_id = p.host_venue_id
    WHERE s.active = true
    GROUP BY p.profile_id
  ), event_summary AS (
    SELECT e.profile_id AS venue_id,
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
    FROM profile_events e
    GROUP BY e.profile_id
  ), productive_runs AS (
    SELECT p.profile_id AS venue_id, max(h.finished_at) AS last_completed_success
    FROM profile_hosts p
    JOIN public.venue_scrape_health_runs h ON h.venue_id = p.host_venue_id
    WHERE h.status IN ('accepted', 'accepted_stale_review')
      AND h.error_count = 0
      AND h.staged_future_event_count > 0
    GROUP BY p.profile_id
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
$function$;


REVOKE ALL ON FUNCTION public.get_venue_event_health() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_venue_event_health() TO service_role;
