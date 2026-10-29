-- Additive: venue_id remains the physical host, preserving existing searches,
-- scraper ownership and global event counts. Link an existing event rather
-- than inserting a copy for its organiser.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS organiser_id text REFERENCES public.venues(venue_id);
CREATE INDEX IF NOT EXISTS events_organiser_id_idx
  ON public.events (organiser_id) WHERE organiser_id IS NOT NULL;
-- Existing event RLS policies continue to govern the same event rows.
