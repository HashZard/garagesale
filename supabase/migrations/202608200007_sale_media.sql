create table public.sale_media (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  url text not null,
  storage_key text,
  sort_order smallint not null,
  media_type text,
  byte_size bigint,
  status text not null default 'published'
    check (status in ('pending', 'published', 'removed')),
  created_at timestamptz not null default now(),
  unique (sale_id, sort_order),
  check (sort_order between 0 and 5),
  check (url like '/media/%' or url ~ '^https://'),
  check (byte_size is null or byte_size between 1 and 5242880)
);

create index sale_media_sale_id_idx on public.sale_media (sale_id, sort_order);
alter table public.sale_media enable row level security;
revoke all on public.sale_media from anon, authenticated;
grant select, insert, update, delete on public.sale_media to service_role;

insert into public.sale_media (sale_id, url, storage_key, sort_order)
select
  sale.id,
  photo.url,
  case when photo.url like '/media/%' then substring(photo.url from 8) end,
  (photo.ordinality - 1)::smallint
from public.sales sale
cross join lateral unnest(sale.photos) with ordinality as photo(url, ordinality);

create or replace function public.sync_sale_media_from_photos()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.sale_media where sale_id = new.id;
  insert into public.sale_media (sale_id, url, storage_key, sort_order)
  select
    new.id,
    photo.url,
    case when photo.url like '/media/%' then substring(photo.url from 8) end,
    (photo.ordinality - 1)::smallint
  from unnest(new.photos) with ordinality as photo(url, ordinality);
  return new;
end;
$$;

revoke all on function public.sync_sale_media_from_photos() from public, anon, authenticated;
grant execute on function public.sync_sale_media_from_photos() to service_role;

create trigger sales_sync_media
after insert or update of photos on public.sales
for each row execute function public.sync_sale_media_from_photos();

