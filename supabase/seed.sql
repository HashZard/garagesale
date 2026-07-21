-- 本地开发种子：五个 Perth suburb 和二十条未来活动。

insert into public.suburbs (name, state, postcode, slug, location)
values
  ('Fremantle', 'WA', '6160', 'fremantle-wa-6160', extensions.st_setsrid(extensions.st_makepoint(115.7478, -32.0569), 4326)::extensions.geography),
  ('East Fremantle', 'WA', '6158', 'east-fremantle-wa-6158', extensions.st_setsrid(extensions.st_makepoint(115.7678, -32.0389), 4326)::extensions.geography),
  ('South Fremantle', 'WA', '6162', 'south-fremantle-wa-6162', extensions.st_setsrid(extensions.st_makepoint(115.7540, -32.0737), 4326)::extensions.geography),
  ('Hamilton Hill', 'WA', '6163', 'hamilton-hill-wa-6163', extensions.st_setsrid(extensions.st_makepoint(115.7790, -32.0840), 4326)::extensions.geography),
  ('Bicton', 'WA', '6157', 'bicton-wa-6157', extensions.st_setsrid(extensions.st_makepoint(115.7830, -32.0270), 4326)::extensions.geography)
on conflict (slug) do nothing;

with demo_sales as (
  select * from (values
    (1, 'Fremantle', '6160', '12 Hampton Road, Fremantle WA 6160', 115.7490, -32.0580, 'Big Moving Sale — Furniture & Tools', array['furniture', 'tools']::text[]),
    (2, 'Fremantle', '6160', '8 Ord Street, Fremantle WA 6160', 115.7530, -32.0500, 'Vintage Finds and Household Sale', array['collectables', 'household']::text[]),
    (3, 'Fremantle', '6160', '31 High Street, Fremantle WA 6160', 115.7460, -32.0540, 'Books, Records and Retro Homewares', array['books-media', 'collectables']::text[]),
    (4, 'Fremantle', '6160', '19 Amherst Street, Fremantle WA 6160', 115.7570, -32.0550, 'Family Garage Clear-out', array['kids-baby', 'clothing']::text[]),
    (5, 'East Fremantle', '6158', '22 George Street, East Fremantle WA 6158', 115.7660, -32.0410, 'Garden and Outdoor Equipment Sale', array['garden', 'tools']::text[]),
    (6, 'East Fremantle', '6158', '7 Moss Street, East Fremantle WA 6158', 115.7710, -32.0360, 'Quality Furniture Downsizing Sale', array['furniture', 'household']::text[]),
    (7, 'East Fremantle', '6158', '48 Hubble Street, East Fremantle WA 6158', 115.7700, -32.0440, 'Kids Gear, Toys and Clothes', array['kids-baby', 'clothing']::text[]),
    (8, 'East Fremantle', '6158', '11 Marmion Street, East Fremantle WA 6158', 115.7650, -32.0350, 'Weekend Electronics Clear-out', array['electronics', 'other']::text[]),
    (9, 'South Fremantle', '6162', '15 Douro Road, South Fremantle WA 6162', 115.7550, -32.0720, 'Beach House Moving Sale', array['furniture', 'household']::text[]),
    (10, 'South Fremantle', '6162', '27 Nelson Street, South Fremantle WA 6162', 115.7520, -32.0770, 'Collectables and Vinyl Records', array['collectables', 'books-media']::text[]),
    (11, 'South Fremantle', '6162', '3 Scott Street, South Fremantle WA 6162', 115.7580, -32.0700, 'Clothing Rack and Homewares Sale', array['clothing', 'household']::text[]),
    (12, 'South Fremantle', '6162', '40 Daly Street, South Fremantle WA 6162', 115.7510, -32.0740, 'Tools and Workshop Clear-out', array['tools', 'garden']::text[]),
    (13, 'Hamilton Hill', '6163', '9 Winterfold Road, Hamilton Hill WA 6163', 115.7810, -32.0820, 'Whole House Garage Sale', array['household', 'furniture']::text[]),
    (14, 'Hamilton Hill', '6163', '25 Redmond Road, Hamilton Hill WA 6163', 115.7760, -32.0870, 'Baby Items and Kids Clothing', array['kids-baby', 'clothing']::text[]),
    (15, 'Hamilton Hill', '6163', '6 Grandpre Crescent, Hamilton Hill WA 6163', 115.7840, -32.0860, 'Garden Shed and Tool Sale', array['garden', 'tools']::text[]),
    (16, 'Hamilton Hill', '6163', '18 Healy Road, Hamilton Hill WA 6163', 115.7770, -32.0800, 'Books, DVDs and Games', array['books-media', 'electronics']::text[]),
    (17, 'Bicton', '6157', '14 Harris Street, Bicton WA 6157', 115.7860, -32.0290, 'Riverside Downsizing Sale', array['furniture', 'collectables']::text[]),
    (18, 'Bicton', '6157', '5 Canning Highway, Bicton WA 6157', 115.7800, -32.0320, 'Household Bargains This Saturday', array['household', 'other']::text[]),
    (19, 'Bicton', '6157', '33 View Terrace, Bicton WA 6157', 115.7890, -32.0250, 'Designer Clothes and Accessories', array['clothing', 'collectables']::text[]),
    (20, 'Bicton', '6157', '10 Point Walter Road, Bicton WA 6157', 115.7820, -32.0230, 'Family Sale — Something for Everyone', array['kids-baby', 'household']::text[])
  ) as rows(sequence_number, suburb, postcode, address, longitude, latitude, title, categories)
)
insert into public.sales (
  title,
  description,
  address,
  suburb,
  state,
  postcode,
  location,
  start_at,
  end_at,
  categories,
  source,
  source_url,
  contact_email,
  manage_token,
  status,
  email_verified_at
)
select
  title,
  'Demo listing for local development. Plenty of useful items available — arrive early for the best selection.',
  address,
  suburb,
  'WA',
  postcode,
  extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326)::extensions.geography,
  ((current_date + ((sequence_number % 10) + 1)) + time '08:00') at time zone 'Australia/Perth',
  ((current_date + ((sequence_number % 10) + 1)) + time '13:00') at time zone 'Australia/Perth',
  categories,
  case when sequence_number % 5 = 0 then 'gumtree' else 'self' end,
  case when sequence_number % 5 = 0 then 'https://example.com/source/' || sequence_number else null end,
  case when sequence_number % 5 = 0 then null else 'seller' || sequence_number || '@example.com' end,
  case when sequence_number % 5 = 0 then null else gen_random_uuid() end,
  'published',
  case when sequence_number % 5 = 0 then null else now() end
from demo_sales;

