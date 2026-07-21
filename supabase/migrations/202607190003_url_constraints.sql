-- 限制可公开链接协议，避免导入或后台数据产生危险URL。

create or replace function public.all_https_urls(urls text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select not exists (
    select 1 from unnest(urls) as url
    where url !~ '^https://'
  )
$$;

alter table public.sales
  add constraint sales_source_url_https_check
  check (source_url is null or source_url ~ '^https://'),
  add constraint sales_photos_https_check
  check (public.all_https_urls(photos));

revoke execute on function public.all_https_urls(text[]) from public, anon, authenticated;
