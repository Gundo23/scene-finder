-- The old event-directory page is empty; this venue location lists dated events.
UPDATE public.event_sources
SET source_url = 'https://townhouseswingers.com/event-location/townhouse/'
WHERE venue_id = 'townhouse_wirral_near_liverpool'
  AND active = true
  AND source_url = 'https://townhouseswingers.com/event-directory/';

UPDATE public.venues
SET event_source_url = 'https://townhouseswingers.com/event-location/townhouse/'
WHERE venue_id = 'townhouse_wirral_near_liverpool'
  AND event_source_url = 'https://townhouseswingers.com/event-directory/'
  AND EXISTS (
    SELECT 1 FROM public.event_sources
    WHERE venue_id = 'townhouse_wirral_near_liverpool'
      AND active = true
      AND source_url = 'https://townhouseswingers.com/event-location/townhouse/'
  );

SELECT venue_id, source_url, active, last_checked
FROM public.event_sources
WHERE venue_id = 'townhouse_wirral_near_liverpool';
