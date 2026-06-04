-- Allow the same profile to be linked as both staff and cashier in one business.

do $$ declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'business_employees'
    and con.contype = 'u'
    and (
      select array_agg(att.attname order by att.attname)
      from unnest(con.conkey) key(attnum)
      join pg_attribute att on att.attrelid = rel.oid and att.attnum = key.attnum
    ) = array['business_id', 'profile_id']
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.business_employees drop constraint %I', constraint_name);
  end if;
end $$;

create unique index if not exists business_employees_active_role_unique
  on public.business_employees (business_id, profile_id, role_type)
  where status <> 'removed';

notify pgrst, 'reload schema';
