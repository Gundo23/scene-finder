-- Run in the Scene Finder Supabase SQL editor after the scraper PR deploys.
-- Existing active sources already trigger the five dedicated official calendars.
-- Kennel Klub needs its iCal feed even when a homepage source exists.
WITH verified(venue_id, source_url) AS (
  VALUES
    ('afterdark_edinburgh_edinburgh', 'https://www.afterdarkedinburgh.co.uk/club-nights-events-1'),
    ('cjs_at_the_townhouse_glasgow', 'https://www.cjsatthetownhouse.com/dates.html'),
    ('club_play_blackpool', 'https://clubplay.net/events/'),
    ('ignite_west_drayton_heathrow', 'https://club-ignite.co.uk/events/list/'),
    ('the_mirage_caenby_corner_market_rasen', 'https://themiragelincoln.co.uk/events')
  UNION ALL
  SELECT venue_id, 'https://www.kennelklub.co.uk/?ical=1'
  FROM public.venues
  WHERE lower(trim(name)) = 'kennel klub'
    AND lower(coalesce(website, '')) LIKE '%kennelklub.co.uk%'
)
INSERT INTO public.event_sources (source_id, venue_id, source_url, active, collection_method)
SELECT gen_random_uuid(), v.venue_id, v.source_url, true, 'Manual'
FROM verified v
WHERE EXISTS (SELECT 1 FROM public.venues venue WHERE venue.venue_id = v.venue_id)
  AND (v.source_url = 'https://www.kennelklub.co.uk/?ical=1' OR NOT EXISTS (
    SELECT 1 FROM public.event_sources source
    WHERE source.venue_id = v.venue_id AND source.active = true
  ))
  AND NOT EXISTS (
    SELECT 1 FROM public.event_sources source
    WHERE source.venue_id = v.venue_id AND source.active = true
      AND source.source_url = v.source_url
  )
RETURNING venue_id, source_url;

-- Confirm the sources and current visible counts. This does not publish events;
-- the next scheduled scrape or a targeted scrape uses the deployed parsers.
SELECT h.venue_id, h.active_source_count, h.visible_future_count,
       h.latest_source_attempt, h.last_completed_success
FROM public.get_venue_event_health() h
WHERE h.venue_id IN (
  'afterdark_edinburgh_edinburgh',
  'cjs_at_the_townhouse_glasgow',
  'club_play_blackpool',
  'ignite_west_drayton_heathrow',
  'the_mirage_caenby_corner_market_rasen'
)
   OR h.venue_id IN (SELECT venue_id FROM public.venues WHERE lower(trim(name)) = 'kennel klub')
ORDER BY h.venue_id;
