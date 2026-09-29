-- Template to run only AFTER:
-- 1. CRON_SECRET is set in the Vercel Scene Finder production environment.
-- 2. The patched routes are deployed and return 200 with that bearer token.
-- 3. pg_cron, pg_net, and Vault are enabled in the Scene Finder Supabase project.
-- 4. Vault contains a secret named scene_finder_cron_secret with exactly the
--    same value as Vercel's CRON_SECRET. Add it through Supabase Vault's UI;
--    never paste its value into a saved SQL snippet or commit it to Git.
-- 5. The existing Vercel daily /api/scrape cron remains as a fallback.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets
    WHERE name = 'scene_finder_cron_secret'
      AND decrypted_secret IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Scene Finder Cron secret missing from Supabase Vault';
  END IF;
END $$;

SELECT cron.schedule(
  'scene-finder-scrape-one-venue-10m',
  '*/10 * * * *',
  $job$
  SELECT net.http_get(
    url := 'https://www.scenefinder.co.uk/api/scrape?batch_size=1',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                   WHERE name = 'scene_finder_cron_secret')
    ),
    timeout_milliseconds := 310000
  );
  $job$
);

SELECT cron.schedule(
  'scene-finder-independent-event-health-hourly',
  '7 * * * *',
  $job$
  SELECT net.http_get(
    url := 'https://www.scenefinder.co.uk/api/events-health',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                   WHERE name = 'scene_finder_cron_secret')
    ),
    timeout_milliseconds := 30000
  );
  $job$
);
