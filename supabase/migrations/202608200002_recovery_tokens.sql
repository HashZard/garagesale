-- 恢复流程轮换管理 token，并把邮件任务写入 outbox。

create or replace function public.issue_sale_recovery_tokens(p_contact_email text)
returns table (
  sale_id uuid,
  sale_title text,
  sale_status text,
  manage_token text,
  verification_token text,
  outbox_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched record;
  raw_manage_token text;
  raw_verification_token text;
  new_outbox_id uuid;
begin
  for matched in
    select sale.id, sale.title, sale.status, sale.end_at, private.contact_email
    from public.sale_private_details private
    join public.sales sale on sale.id = private.sale_id
    where private.contact_email = lower(trim(p_contact_email))
      and sale.status in ('pending_verification', 'published')
      and sale.end_at > now()
    order by sale.created_at desc
  loop
    raw_manage_token := encode(extensions.gen_random_bytes(32), 'hex');
    raw_verification_token := null;

    update public.sale_access_tokens
    set revoked_at = now()
    where sale_access_tokens.sale_id = matched.id
      and purpose = 'manage'
      and revoked_at is null;

    insert into public.sale_access_tokens (sale_id, purpose, token_hash, expires_at)
    values (
      matched.id,
      'manage',
      encode(extensions.digest(raw_manage_token, 'sha256'), 'hex'),
      greatest(matched.end_at + interval '30 days', now() + interval '30 days')
    );

    if matched.status = 'pending_verification' then
      raw_verification_token := encode(extensions.gen_random_bytes(32), 'hex');
      update public.sale_access_tokens
      set revoked_at = now()
      where sale_access_tokens.sale_id = matched.id
        and purpose = 'verification'
        and revoked_at is null;

      insert into public.sale_access_tokens (sale_id, purpose, token_hash, expires_at)
      values (
        matched.id,
        'verification',
        encode(extensions.digest(raw_verification_token, 'sha256'), 'hex'),
        now() + interval '48 hours'
      );
    end if;

    insert into public.email_outbox (kind, recipient, payload)
    values (
      'sale-recovery',
      matched.contact_email,
      jsonb_build_object(
        'saleId', matched.id,
        'title', matched.title,
        'status', matched.status,
        'manageToken', raw_manage_token,
        'verificationToken', raw_verification_token
      )
    )
    returning id into new_outbox_id;

    sale_id := matched.id;
    sale_title := matched.title;
    sale_status := matched.status;
    manage_token := raw_manage_token;
    verification_token := raw_verification_token;
    outbox_id := new_outbox_id;
    return next;
  end loop;
end;
$$;

revoke all on function public.issue_sale_recovery_tokens(text) from public;
grant execute on function public.issue_sale_recovery_tokens(text) to service_role;

