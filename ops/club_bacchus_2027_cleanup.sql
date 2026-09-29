-- Run only after deploying the Club Bacchus year guard.
-- The official September listing is for 2026: its Friday/Saturday weekdays
-- do not match the six September 2027 dates below. Hide those false rows;
-- leave all October 2026 events and all other venues untouched.
UPDATE public.events
SET is_published = false
WHERE venue_id = 'club_bacchus_dundee'
  AND is_published = true
  AND event_date IN (
    DATE '2027-09-04', DATE '2027-09-05', DATE '2027-09-11',
    DATE '2027-09-12', DATE '2027-09-18', DATE '2027-09-19'
  )
  AND lower(coalesce(ticket_url, '')) LIKE 'https://www.clubbacchusdundee.uk/events/%'
RETURNING event_id, event_name, event_date, ticket_url;
