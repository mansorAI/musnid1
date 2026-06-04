-- Permission for cashier product display settings.

alter table public.employee_permissions
  add column if not exists can_product_settings boolean not null default false;

notify pgrst, 'reload schema';
