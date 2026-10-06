-- Run in the Scene Finder Supabase SQL editor before deploying the digest routes.
-- The 09:07 and 21:07 Europe/London hourly cron invocations dispatch routine mail.
CREATE TABLE IF NOT EXISTS public.scene_finder_routine_alert_queue (
  alert_key text PRIMARY KEY,
  subject text NOT NULL,
  detail text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scene_finder_routine_digest_slots (
  slot text PRIMARY KEY,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.scene_finder_routine_alert_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_finder_routine_digest_slots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.scene_finder_routine_alert_queue FROM anon, authenticated;
REVOKE ALL ON public.scene_finder_routine_digest_slots FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scene_finder_routine_alert_queue TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.scene_finder_routine_digest_slots TO service_role;

CREATE OR REPLACE FUNCTION public.claim_scene_finder_digest(p_slot text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  claimed boolean;
  items jsonb;
BEGIN
  IF p_slot !~ '^\d{4}-\d{2}-\d{2}-(09|21)$' THEN
    RAISE EXCEPTION 'Invalid digest slot';
  END IF;
  INSERT INTO public.scene_finder_routine_digest_slots (slot)
    SELECT p_slot WHERE EXISTS (SELECT 1 FROM public.scene_finder_routine_alert_queue)
    ON CONFLICT DO NOTHING RETURNING true INTO claimed;
  IF NOT coalesce(claimed, false) THEN RETURN '[]'::jsonb; END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'alert_key', alert_key, 'subject', subject, 'detail', detail, 'updated_at', updated_at
  ) ORDER BY alert_key), '[]'::jsonb)
  INTO items FROM public.scene_finder_routine_alert_queue;
  RETURN items;
END $$;

CREATE OR REPLACE FUNCTION public.complete_scene_finder_digest(p_slot text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE claimed timestamptz;
BEGIN
  UPDATE public.scene_finder_routine_digest_slots SET completed_at = now()
    WHERE slot = p_slot AND completed_at IS NULL RETURNING claimed_at INTO claimed;
  IF claimed IS NULL THEN RAISE EXCEPTION 'Digest slot missing or already completed'; END IF;
  DELETE FROM public.scene_finder_routine_alert_queue WHERE updated_at <= claimed;
END $$;

REVOKE ALL ON FUNCTION public.claim_scene_finder_digest(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_scene_finder_digest(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_scene_finder_digest(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_scene_finder_digest(text) TO service_role;
