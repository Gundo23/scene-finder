-- One-time recovery from Partners' official events page, checked 10 October 2026.
-- The official site returns HTTP 403 to the production scraper. Recheck each
-- event on the official page before attending; this import is not a live feed.
BEGIN;

UPDATE public.venues
SET notes = 'Partners Swingers Club is a verified fixed venue in Bury. For the latest event times, guest list requirements and changes, check the official events page.'
WHERE venue_id = 'partners_manchester_bury_area'
  AND notes ILIKE '%Only social/secondary traces found; needs manual check%';

WITH official_events(event_date, event_name, start_time) AS (
  VALUES
    (DATE '2026-10-10', 'SECRET DESIRES', TIME '20:00'),
    (DATE '2026-10-11', 'SINFUL SUNDAY SOCIAL', TIME '20:00'),
    (DATE '2026-10-15', 'Biphoria', TIME '11:00'),
    (DATE '2026-10-16', 'STOCKINGS, SECRETS & SCANDAL!', TIME '20:00'),
    (DATE '2026-10-17', 'OKTOBERFEST CELEBRATION', TIME '20:00'),
    (DATE '2026-10-18', 'SINFUL SUNDAY SOCIAL', TIME '20:00'),
    (DATE '2026-10-22', 'BIPHORIA', TIME '11:00'),
    (DATE '2026-10-23', 'CHOCOLATE & CHAMPAGNE', TIME '20:00'),
    (DATE '2026-10-24', 'RAUNCHY REGGAE & RUM', TIME '20:00'),
    (DATE '2026-10-25', 'SINFUL SUNDAY SOCIAL', TIME '20:00'),
    (DATE '2026-10-29', 'BIPHORIA: HALLOWEEN SPECIAL', TIME '11:00'),
    (DATE '2026-10-30', 'HALLOWEEN SWING & KINK ROCK NIGHT', TIME '20:00'),
    (DATE '2026-10-31', 'KILLA CURVES: HOE-CUS POKE-US', TIME '20:00'),
    (DATE '2026-11-01', 'SPOOKTACULAR', TIME '20:00')
)
INSERT INTO public.events
  (venue_id, event_name, event_date, start_time, event_type, description,
   ticket_url, source_url, status, is_published)
SELECT 'partners_manchester_bury_area', e.event_name, e.event_date, e.start_time,
       'Club Night', 'See the official Partners event card for current times and entry details.',
       'https://partnersswingersclub.com/events/',
       'https://partnersswingersclub.com/events/', 'published', true
FROM official_events e
WHERE NOT EXISTS (
  SELECT 1 FROM public.events existing
  WHERE existing.venue_id = 'partners_manchester_bury_area'
    AND existing.event_date = e.event_date
    AND lower(trim(existing.event_name)) = lower(trim(e.event_name))
);

COMMIT;

SELECT event_date, event_name, start_time
FROM public.events
WHERE venue_id = 'partners_manchester_bury_area'
  AND event_date >= CURRENT_DATE
  AND is_published = true
ORDER BY event_date, event_name;
