insert into public.roles (name)
values
  ('Admin'),
  ('Regisjef'),
  ('Romsjef'),
  ('Data'),
  ('Halv/Halv'),
  ('Full Regi'),
  ('Full Vakt');

insert into public.regi_categories (name, required_hours)
values
  ('Full Regi', 36),
  ('Halv/Halv', 18),
  ('Utvalget', 0),
  ('Full Vakt', 0),
  ('Data', 0),
  ('Brann', 48);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@singsaker.no',
    extensions.crypt('passord123', extensions.gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'beboer@singsaker.no',
    extensions.crypt('passord123', extensions.gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

insert into auth.identities (user_id, provider_id, provider, identity_data, created_at, updated_at)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'email',
    '{"sub": "00000000-0000-0000-0000-000000000001", "email": "admin@singsaker.no"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'email',
    '{"sub": "00000000-0000-0000-0000-000000000002", "email": "beboer@singsaker.no"}',
    now(),
    now()
  );

insert into public.users (id, name, email, is_active, on_leave, role_id, regi_category_id)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Admin Testesen',
    'admin@singsaker.no',
    true,
    false,
    (select id from public.roles where name = 'Admin'),
    (select id from public.regi_categories where name = 'Data')
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Beboer Testesen',
    'beboer@singsaker.no',
    true,
    false,
    (select id from public.roles where name = 'Halv/Halv'),
    (select id from public.regi_categories where name = 'Halv/Halv')
  );
