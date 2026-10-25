-- Keep deletion jobs independent from auth.users,
-- so jobs survive after an account is deleted.
CREATE TABLE public.account_deletion_jobs (
  user_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  next_retry_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  claim_token uuid,
  auth_deleted_at timestamptz,
  storage_deleted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Do not allow access through the public API.
ALTER TABLE public.account_deletion_jobs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.account_deletion_jobs
FROM anon, authenticated;

-- Only trusted server-side code should create deletion jobs.
-- Repeated requests for the same user must not create duplicate jobs.
CREATE OR REPLACE FUNCTION public.enqueue_account_deletion(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.account_deletion_jobs (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_account_deletion(uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_account_deletion(uuid)
TO service_role;

CREATE OR REPLACE FUNCTION public.claim_account_deletion_jobs(
  p_limit integer DEFAULT 10
)
RETURNS SETOF public.account_deletion_jobs
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH available AS (
    SELECT j.user_id
    FROM public.account_deletion_jobs AS j
    WHERE (
      j.status IN ('pending', 'failed')
      AND j.next_retry_at <= now()
    )
    OR (
      j.status = 'processing'
      AND j.locked_at < now() - interval '5 minutes'
    )
    ORDER BY j.created_at
    LIMIT LEAST(GREATEST(p_limit, 1), 10)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.account_deletion_jobs AS j
    SET
    status = 'processing',
    attempts = j.attempts + 1,
    claim_token = pg_catalog.gen_random_uuid(),
    locked_at = now(),
    updated_at = now()
  FROM available
  WHERE j.user_id = available.user_id
  RETURNING j.*;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_account_deletion_jobs(integer)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_account_deletion_jobs(integer)
TO service_role;


CREATE OR REPLACE FUNCTION public.complete_account_deletion_job(
  p_user_id uuid,
  p_claim_token uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  UPDATE public.account_deletion_jobs
  SET
    status = 'completed',
    completed_at = now(),
    claim_token = NULL,
    locked_at = NULL,
    last_error = NULL,
    updated_at = now()
  WHERE user_id = p_user_id
    AND claim_token = p_claim_token
    AND status = 'processing'
    AND auth_deleted_at IS NOT NULL
    AND storage_deleted_at IS NOT NULL;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN v_updated_count = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_account_deletion_job(uuid, uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.complete_account_deletion_job(uuid, uuid)
TO service_role;


CREATE OR REPLACE FUNCTION public.fail_account_deletion_job(
  p_user_id uuid,
  p_claim_token uuid,
  p_error text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  UPDATE public.account_deletion_jobs
  SET
    status = 'failed',
    last_error = left(coalesce(p_error, 'Unknown error'), 500),
    next_retry_at = now() + (
      LEAST(POWER(2.0, LEAST(attempts, 8)), 256)
      * interval '1 minute'
    ),
    claim_token = NULL,
    locked_at = NULL,
    updated_at = now()
  WHERE user_id = p_user_id
    AND claim_token = p_claim_token
    AND status = 'processing';

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN v_updated_count = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.fail_account_deletion_job(uuid, uuid, text)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.fail_account_deletion_job(uuid, uuid, text)
TO service_role;


CREATE OR REPLACE FUNCTION public.mark_account_deletion_step(
  p_user_id uuid,
  p_claim_token uuid,
  p_step text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  IF p_step NOT IN ('auth', 'storage') OR p_step IS NULL THEN
    RAISE EXCEPTION 'Invalid deletion step';
  END IF;

  UPDATE public.account_deletion_jobs
  SET
    auth_deleted_at = CASE
      WHEN p_step = 'auth' THEN COALESCE(auth_deleted_at, now())
      ELSE auth_deleted_at
    END,
    storage_deleted_at = CASE
      WHEN p_step = 'storage' THEN COALESCE(storage_deleted_at, now())
      ELSE storage_deleted_at
    END,
    updated_at = now()
  WHERE user_id = p_user_id
    AND claim_token = p_claim_token
    AND status = 'processing';

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN v_updated_count = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_account_deletion_step(uuid, uuid, text)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.mark_account_deletion_step(uuid, uuid, text)
TO service_role;