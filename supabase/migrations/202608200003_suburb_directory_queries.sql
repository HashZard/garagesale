-- 目录和 sitemap 查询在 PostGIS/Postgres 内完成，避免应用层全州扫描和 N+1。

create or replace function public.get_nearby_suburbs(
  origin_suburb_id bigint,
  result_limit integer default 6
)
returns table (
  id bigint,
  name text,
  state text,
  postcode text,
  slug text,
  longitude double precision,
  latitude double precision,
  distance_km double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    target.id,
    target.name,
    target.state,
    target.postcode,
    target.slug,
    extensions.st_x(target.location::extensions.geometry),
    extensions.st_y(target.location::extensions.geometry),
    extensions.st_distance(target.location, origin.location) / 1000.0 as distance_km
  from public.suburbs origin
  join public.suburbs target
    on target.state = origin.state
   and target.id <> origin.id
  where origin.id = origin_suburb_id
  order by distance_km
  limit least(greatest(result_limit, 1), 20)
$$;

create or replace function public.get_indexable_suburbs(
  state_filter text default null
)
returns table (
  id bigint,
  name text,
  state text,
  postcode text,
  slug text,
  longitude double precision,
  latitude double precision,
  listing_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    suburb.id,
    suburb.name,
    suburb.state,
    suburb.postcode,
    suburb.slug,
    extensions.st_x(suburb.location::extensions.geometry),
    extensions.st_y(suburb.location::extensions.geometry),
    count(sale.id) as listing_count
  from public.suburbs suburb
  join public.sales sale
    on sale.state = suburb.state
   and sale.postcode = suburb.postcode
   and lower(sale.suburb) = lower(suburb.name)
  where sale.status = 'published'
    and sale.end_at >= now() - interval '90 days'
    and (state_filter is null or suburb.state = state_filter)
  group by suburb.id
  order by suburb.name
$$;

revoke all on function public.get_nearby_suburbs(bigint, integer) from public;
revoke all on function public.get_indexable_suburbs(text) from public;
grant execute on function public.get_nearby_suburbs(bigint, integer) to anon, authenticated, service_role;
grant execute on function public.get_indexable_suburbs(text) to anon, authenticated, service_role;

