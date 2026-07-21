-- GarageSale发布图片：公开读取，写入仅通过服务器签名上传URL授权。

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sale-photos',
  'sale-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "公开读取销售图片"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'sale-photos');

