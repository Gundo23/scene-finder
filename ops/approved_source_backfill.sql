-- Apply once after deploying the admin source-registration change. These
-- venue/page pairs were checked against their official event or diary pages.
-- Do not provision a source just because a venue has a generic website: a
-- listing for another location can produce plausible but misplaced events.
WITH verified(venue_id, source_url) AS (
  VALUES
    ('curious_club_leicester', 'https://www.curious-club.com/special'),
    ('dv8_kent_kent', 'https://dv8kent.co.uk/event-calendar/'),
    ('xtasia_west_bromwich', 'https://www.xtasia.co.uk/en')
)
INSERT INTO public.event_sources (source_id, venue_id, source_url, active, collection_method)
SELECT gen_random_uuid(), verified.venue_id, verified.source_url, true, 'Manual'
FROM verified
JOIN public.venues venue ON venue.venue_id = verified.venue_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_sources source
  WHERE source.venue_id = verified.venue_id AND source.active = true
)
RETURNING venue_id, source_url;

SELECT h.venue_id, h.active_source_count, h.visible_future_count,
       h.latest_source_attempt, h.last_completed_success
FROM public.get_venue_event_health() h
WHERE h.venue_id IN ('curious_club_leicester', 'dv8_kent_kent', 'xtasia_west_bromwich')
ORDER BY h.venue_id;
