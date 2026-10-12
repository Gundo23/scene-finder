-- Apply in Scene Finder Supabase after the scraper upgrade deploys successfully.
-- Keep the existing job name and secret in Vault; two venues are processed per
-- request and the endpoint's work budget leaves time for safe publication.
SELECT cron.schedule(
  'scene-finder-scrape-one-venue-10m',
  '*/10 * * * *',
  $job$
  SELECT net.http_get(
    url := 'https://www.scenefinder.co.uk/api/scrape?batch_size=2',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                   WHERE name = 'scene_finder_cron_secret')
    ),
    timeout_milliseconds := 310000
  );
  $job$
);

SELECT jobname, schedule, command
FROM cron.job
WHERE jobname = 'scene-finder-scrape-one-venue-10m';
