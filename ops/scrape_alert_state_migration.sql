-- Apply after deploying the scrape-safety alert change. Existing alert
-- delivery continues if this table is temporarily unavailable.
CREATE TABLE IF NOT EXISTS public.venue_scrape_alert_state (
  venue_id text NOT NULL,
  reason_key text NOT NULL,
  status text NOT NULL,
  last_notified_at timestamptz NOT NULL,
  PRIMARY KEY (venue_id, reason_key)
);

ALTER TABLE public.venue_scrape_alert_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.venue_scrape_alert_state FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.venue_scrape_alert_state TO service_role;
