-- Run once in Scene Finder production Supabase before deploying the scraper change.
-- Fetches only the club's public official events page, using the same declared
-- SceneFinderBot user agent as the application. The cache is private.
BEGIN;
CREATE TABLE IF NOT EXISTS public.official_event_page_cache (
  venue_id text PRIMARY KEY,
  source_url text NOT NULL,
  html text NOT NULL,
  fetched_at timestamptz NOT NULL
);

ALTER TABLE public.official_event_page_cache ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.official_event_page_cache FROM anon, authenticated;
GRANT SELECT ON public.official_event_page_cache TO service_role;

CREATE TABLE IF NOT EXISTS public.partners_calendar_fetch_requests (
  request_id bigint PRIMARY KEY,
  enqueued_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE public.partners_calendar_fetch_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.partners_calendar_fetch_requests FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.enqueue_partners_official_calendar()
RETURNS void LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO public.partners_calendar_fetch_requests(request_id)
  SELECT net.http_get(
    url := 'https://partnersswingersclub.com/events/',
    headers := jsonb_build_object(
      'User-Agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36 SceneFinderBot/5.0',
      'Accept', 'text/html,application/xhtml+xml',
      'Accept-Language', 'en-GB,en;q=0.9'
    ),
    timeout_milliseconds := 20000
  );
END $$;

CREATE OR REPLACE FUNCTION public.process_partners_official_calendar()
RETURNS void LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  latest record;
BEGIN
  SELECT r.request_id, r.enqueued_at, h.status_code, h.content
  INTO latest
  FROM public.partners_calendar_fetch_requests r
  LEFT JOIN net._http_response h ON h.id = r.request_id
  WHERE r.processed_at IS NULL
  ORDER BY r.request_id DESC
  LIMIT 1;

  IF NOT FOUND THEN RETURN; END IF;
  IF latest.status_code IS NULL THEN
    IF latest.enqueued_at < now() - interval '30 minutes' THEN
      UPDATE public.partners_calendar_fetch_requests
      SET processed_at = now() WHERE request_id = latest.request_id;
    END IF;
    RETURN;
  END IF;

  IF latest.request_id IS NOT NULL AND latest.status_code = 200
    AND length(latest.content) BETWEEN 1000 AND 500000
    AND position('partners-event-month-heading' IN latest.content) > 0
    AND position('partners-event-detail-card' IN latest.content) > 0
  THEN
    INSERT INTO public.official_event_page_cache(venue_id, source_url, html, fetched_at)
    VALUES ('partners_manchester_bury_area',
            'https://partnersswingersclub.com/events/',
            latest.content, now())
    ON CONFLICT (venue_id) DO UPDATE
      SET html = EXCLUDED.html, fetched_at = EXCLUDED.fetched_at,
          source_url = EXCLUDED.source_url;
  END IF;

  UPDATE public.partners_calendar_fetch_requests
  SET processed_at = now()
  WHERE request_id <= latest.request_id AND processed_at IS NULL;
END $$;

REVOKE ALL ON FUNCTION public.enqueue_partners_official_calendar() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.process_partners_official_calendar() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule(
  'scene-finder-partners-official-calendar-fetch',
  '15 */4 * * *',
  $$SELECT public.enqueue_partners_official_calendar()$$
);
SELECT cron.schedule(
  'scene-finder-partners-official-calendar-process',
  '*/5 * * * *',
  $$SELECT public.process_partners_official_calendar()$$
);

COMMIT;

-- Seed once. Run the process function after a few seconds, once pg_net
-- records the response; scheduled processing will also handle it.
SELECT public.enqueue_partners_official_calendar();
