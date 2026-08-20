-- CHECK constraints execute helper functions as the row-changing role.
-- Keep the helper private from browser roles while allowing server writes.
grant execute on function public.all_https_urls(text[]) to service_role;

