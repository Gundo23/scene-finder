-- The former dv8kent.co.uk calendar currently lists no future events.
-- The venue's new site publishes its dated specials and recurring nights.
UPDATE public.event_sources
SET source_url = 'https://dv8club.co.uk/'
WHERE venue_id = 'dv8_kent_kent'
  AND active = true
  AND source_url = 'https://dv8kent.co.uk/event-calendar/';

UPDATE public.venues
SET event_source_url = 'https://dv8club.co.uk/'
WHERE venue_id = 'dv8_kent_kent'
  AND event_source_url = 'https://dv8kent.co.uk/event-calendar/'
  AND EXISTS (
    SELECT 1 FROM public.event_sources
    WHERE venue_id = 'dv8_kent_kent'
      AND active = true
      AND source_url = 'https://dv8club.co.uk/'
  );

SELECT venue_id, source_url, active, last_checked
FROM public.event_sources
WHERE venue_id = 'dv8_kent_kent';
