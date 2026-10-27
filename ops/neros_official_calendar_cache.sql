-- Run once in Scene Finder production Supabase before deploying the scraper change.
-- Supabase can fetch these public first-party pages while Vercel currently gets
-- HTTP 403. The cache is private and updates only when all three pages pass
-- exact source identity checks in the same fetch batch.
BEGIN;

CREATE TABLE IF NOT EXISTS public.neros_calendar_fetch_requests (
  request_id bigint PRIMARY KEY,
  batch_id uuid NOT NULL,
  page_key text NOT NULL CHECK (page_key IN ('events', 'biphoria', 'naked')),
  enqueued_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE (batch_id, page_key)
);

ALTER TABLE public.neros_calendar_fetch_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.neros_calendar_fetch_requests FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.enqueue_neros_official_calendar()
RETURNS void LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  new_batch uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.neros_calendar_fetch_requests(request_id, batch_id, page_key)
  SELECT net.http_get(
    url := pages.source_url,
    headers := jsonb_build_object(
      'User-Agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36 SceneFinderBot/5.0',
      'Accept', 'text/html,application/xhtml+xml',
      'Accept-Language', 'en-GB,en;q=0.9'
    ),
    timeout_milliseconds := 20000
  ), new_batch, pages.page_key
  FROM (VALUES
    ('events', 'https://nerossauna.com/sauna-events/'),
    ('biphoria', 'https://nerossauna.com/biphoria-bisexual-event-at-neros-sauna/'),
    ('naked', 'https://nerossauna.com/naked-thursdays-at-neros-sauna/')
  ) AS pages(page_key, source_url);
END $$;

CREATE OR REPLACE FUNCTION public.process_neros_official_calendar()
RETURNS void LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  latest_batch uuid;
  batch_time timestamptz;
  response_count integer;
  valid_count integer;
  combined_html text;
BEGIN
  SELECT batch_id, min(enqueued_at)
  INTO latest_batch, batch_time
  FROM public.neros_calendar_fetch_requests
  WHERE processed_at IS NULL
  GROUP BY batch_id
  ORDER BY min(enqueued_at) DESC
  LIMIT 1;

  IF latest_batch IS NULL THEN RETURN; END IF;

  SELECT count(h.id), count(*) FILTER (
    WHERE h.status_code = 200
      AND length(h.content) BETWEEN 1000 AND 500000
      AND (
        (r.page_key = 'events' AND position('Neros Sauna Events' IN h.content) > 0) OR
        (r.page_key = 'biphoria' AND position('Biphoria at Neros Sauna' IN h.content) > 0) OR
        (r.page_key = 'naked' AND position('Naked Sauna Day Fridays at Neros Sauna' IN h.content) > 0)
      )
  )
  INTO response_count, valid_count
  FROM public.neros_calendar_fetch_requests r
  LEFT JOIN net._http_response h ON h.id = r.request_id
  WHERE r.batch_id = latest_batch;

  IF response_count < 3 AND batch_time > now() - interval '30 minutes' THEN RETURN; END IF;

  IF valid_count = 3 THEN
    SELECT string_agg('<!-- NEROS PAGE: ' || r.page_key || ' -->' || E'\n' || h.content,
                      E'\n' ORDER BY r.page_key)
    INTO combined_html
    FROM public.neros_calendar_fetch_requests r
    JOIN net._http_response h ON h.id = r.request_id
    WHERE r.batch_id = latest_batch;

    INSERT INTO public.official_event_page_cache(venue_id, source_url, html, fetched_at)
    VALUES ('nero_s_sauna_bury', 'https://nerossauna.com/sauna-events/', combined_html, now())
    ON CONFLICT (venue_id) DO UPDATE
      SET html = EXCLUDED.html, fetched_at = EXCLUDED.fetched_at,
          source_url = EXCLUDED.source_url;
  END IF;

  UPDATE public.neros_calendar_fetch_requests
  SET processed_at = now()
  WHERE batch_id = latest_batch;
END $$;

REVOKE ALL ON FUNCTION public.enqueue_neros_official_calendar() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.process_neros_official_calendar() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule(
  'scene-finder-neros-official-calendar-fetch',
  '25 */4 * * *',
  $$SELECT public.enqueue_neros_official_calendar()$$
);
SELECT cron.schedule(
  'scene-finder-neros-official-calendar-process',
  '*/5 * * * *',
  $$SELECT public.process_neros_official_calendar()$$
);

COMMIT;

SELECT public.enqueue_neros_official_calendar();
