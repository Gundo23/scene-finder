-- Run in the verified Scene Finder Supabase SQL editor after this scraper deploys.
-- These are the only missing-source venues in the 22 Oct digest with verified
-- first-party event programmes.
BEGIN;

WITH verified(venue_id, source_url) AS (
  VALUES
    ('atlantisevolution_west_midlands_swingers_club_stoke_birmingham', 'https://www.atlantisevolution.co.uk/'),
    ('sweatbox_soho_london', 'https://www.sweatboxsoho.com/events/')
)
INSERT INTO public.event_sources (source_id, venue_id, source_url, active, collection_method)
SELECT gen_random_uuid(), v.venue_id, v.source_url, true, 'Manual'
FROM verified v
JOIN public.venues venue ON venue.venue_id = v.venue_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_sources source
  WHERE source.venue_id = v.venue_id AND source.active = true
);

UPDATE public.venues
SET website = COALESCE(website, 'https://www.atlantisevolution.co.uk/'),
    event_source_url = 'https://www.atlantisevolution.co.uk/'
WHERE venue_id = 'atlantisevolution_west_midlands_swingers_club_stoke_birmingham'
  AND EXISTS (
    SELECT 1 FROM public.event_sources
    WHERE venue_id = 'atlantisevolution_west_midlands_swingers_club_stoke_birmingham'
      AND source_url = 'https://www.atlantisevolution.co.uk/' AND active = true
  );

UPDATE public.venues
SET website = COALESCE(website, 'https://www.sweatboxsoho.com/'),
    event_source_url = 'https://www.sweatboxsoho.com/events/'
WHERE venue_id = 'sweatbox_soho_london'
  AND EXISTS (
    SELECT 1 FROM public.event_sources
    WHERE venue_id = 'sweatbox_soho_london'
      AND source_url = 'https://www.sweatboxsoho.com/events/' AND active = true
  );

COMMIT;

SELECT venue_id, source_url, active
FROM public.event_sources
WHERE venue_id IN (
  'atlantisevolution_west_midlands_swingers_club_stoke_birmingham',
  'sweatbox_soho_london'
)
ORDER BY venue_id, active DESC, source_url;
