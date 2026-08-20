-- The service role bypasses RLS, but PostgreSQL privileges still have to be
-- granted explicitly after the public roles are locked down.
grant select on table public.suburbs to service_role;
grant select, insert, update, delete on table public.sales to service_role;
grant select, insert, update, delete on table public.sale_private_details to service_role;
grant select, insert, update, delete on table public.sale_access_tokens to service_role;
grant select, insert, update, delete on table public.email_outbox to service_role;
grant select, insert, update, delete on table public.moderation_events to service_role;
grant select, insert, update, delete on table public.rate_limits to service_role;

