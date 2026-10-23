-- Clients must submit reports through the validated report_profile RPC.
REVOKE INSERT ON TABLE public.reports FROM anon, authenticated;
