-- Run in the Scene Finder Supabase SQL editor after the scraper PR deploys.
-- Only these two venue/site pairs have verified dated calendars.
BEGIN;

UPDATE public.event_sources
SET active = false
WHERE venue_id = 'jaydees_colmworth_bedfordshire'
  AND active = true
  AND source_url ~* '^https?://(www\.)?jay-dees\.com(/|$)';

WITH verified(venue_id, source_url) AS (
  VALUES
    ('jaydees_colmworth_bedfordshire', 'https://jaydeesclub.com/events'),
    ('the_private_club_birmingham_birmingham', 'https://www.theprivateclub.com/gangbang-party-birmingham/')
)
INSERT INTO public.event_sources (source_id, venue_id, source_url, active, collection_method)
SELECT gen_random_uuid(), v.venue_id, v.source_url, true, 'Manual'
FROM verified v
JOIN public.venues venue ON venue.venue_id = v.venue_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_sources source
  WHERE source.venue_id = v.venue_id AND source.active = true
    AND source.source_url = v.source_url
)
  AND (v.venue_id = 'jaydees_colmworth_bedfordshire' OR NOT EXISTS (
    SELECT 1 FROM public.event_sources source
    WHERE source.venue_id = v.venue_id AND source.active = true
  ));

UPDATE public.venues
SET website = 'https://jaydeesclub.com',
    event_source_url = 'https://jaydeesclub.com/events'
WHERE venue_id = 'jaydees_colmworth_bedfordshire'
  AND EXISTS (SELECT 1 FROM public.event_sources
              WHERE venue_id = 'jaydees_colmworth_bedfordshire'
                AND source_url = 'https://jaydeesclub.com/events' AND active = true)
  AND (website IS NULL OR website ~* '^https?://(www\.)?jay-dees\.com(/|$)');

UPDATE public.venues
SET event_source_url = 'https://www.theprivateclub.com/gangbang-party-birmingham/'
WHERE venue_id = 'the_private_club_birmingham_birmingham'
  AND EXISTS (SELECT 1 FROM public.event_sources
              WHERE venue_id = 'the_private_club_birmingham_birmingham'
                AND source_url = 'https://www.theprivateclub.com/gangbang-party-birmingham/'
                AND active = true);

COMMIT;

SELECT venue_id, source_url, active
FROM public.event_sources
WHERE venue_id IN ('jaydees_colmworth_bedfordshire', 'the_private_club_birmingham_birmingham')
ORDER BY venue_id, active DESC, source_url;
