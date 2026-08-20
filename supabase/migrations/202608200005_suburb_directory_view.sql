create or replace view public.suburb_directory
with (security_invoker = true)
as
select
  id,
  name,
  state,
  postcode,
  slug,
  extensions.st_x(location::extensions.geometry) as longitude,
  extensions.st_y(location::extensions.geometry) as latitude
from public.suburbs;

revoke all on public.suburb_directory from anon, authenticated;
grant select on public.suburb_directory to anon, authenticated, service_role;

