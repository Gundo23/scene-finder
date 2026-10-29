-- Apply only to the verified Scene Finder project after the guarded MA1 parser deploys.
BEGIN;

INSERT INTO public.event_sources (source_id, venue_id, source_url, active, collection_method)
SELECT gen_random_uuid(), 'bunker_bar_ma1_the_bunker_london',
       'https://www.sewellandmarbury.co.uk/ma1home18.html', true, 'Manual'
WHERE EXISTS (
  SELECT 1 FROM public.venues
  WHERE venue_id = 'bunker_bar_ma1_the_bunker_london'
    AND name = 'Bunker Bar / MA1 The Bunker'
)
AND NOT EXISTS (
  SELECT 1 FROM public.event_sources
  WHERE venue_id = 'bunker_bar_ma1_the_bunker_london' AND active = true
);

UPDATE public.venues
SET website = COALESCE(website, 'https://www.sewellandmarbury.co.uk/ma1home18.html'),
    event_source_url = 'https://www.sewellandmarbury.co.uk/ma1home18.html',
    source_url = COALESCE(source_url, 'https://www.sewellandmarbury.co.uk/ma1home18.html')
WHERE venue_id = 'bunker_bar_ma1_the_bunker_london'
  AND EXISTS (
    SELECT 1 FROM public.event_sources
    WHERE venue_id = 'bunker_bar_ma1_the_bunker_london'
      AND source_url = 'https://www.sewellandmarbury.co.uk/ma1home18.html' AND active = true
  );

COMMIT;
