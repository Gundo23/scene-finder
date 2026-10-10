-- Run in the production Scene Finder Supabase project to restore the real club listing.
-- The official venue site confirms Partners operates at Bury and publishes dated events.
UPDATE public.venues
SET category = 'Swingers club',
    website = 'https://partnersswingersclub.com/'
WHERE venue_id = 'partners_manchester_bury_area'
  AND lower(trim(name)) = 'partners'
  AND lower(category) LIKE '%lead%'
RETURNING venue_id, name, status, category, website;
