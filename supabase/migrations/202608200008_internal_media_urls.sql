create or replace function public.all_https_urls(urls text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select not exists (
    select 1 from unnest(urls) as url
    where url !~ '^https://' and url not like '/media/%'
  )
$$;

revoke execute on function public.all_https_urls(text[]) from public, anon, authenticated;
grant execute on function public.all_https_urls(text[]) to service_role;

