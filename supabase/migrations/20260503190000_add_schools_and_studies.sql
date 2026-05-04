create extension if not exists pgcrypto with schema extensions;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.studies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

insert into public.schools (name, slug)
values
  ('Annet', 'annet'),
  ('BI', 'bi'),
  ('NTNU', 'ntnu')
on conflict (slug) do update set name = excluded.name;

insert into public.studies (name, slug)
values
  ('Annet', 'annet'),
  ('Arkitektur', 'arkitektur'),
  ('Georessurser og geoteknologi', 'georessurser-og-geoteknologi'),
  ('Biologi', 'biologi'),
  ('Bioteknologi', 'bioteknologi'),
  ('Bygg- og infrastruktur', 'bygg-og-infrastruktur'),
  ('Datateknologi', 'datateknologi'),
  ('Digital Business Engineering', 'digital-business-engineering'),
  ('Digital forretningsutvikling', 'digital-forretningsutvikling'),
  ('Digital økonomi og datadrevet forretningsutvikling', 'digital-okonomi-og-datadrevet-forretningsutvikling'),
  ('Elektronikk', 'elektronikk'),
  ('Elektronisk systemdesign og innovasjon', 'elektronisk-systemdesign-og-innovasjon'),
  ('Energi og miljø', 'energi-og-miljo'),
  ('Engelsk', 'engelsk'),
  ('Entreprenørskap', 'entreprenorskap'),
  ('Filmvitenskap', 'filmvitenskap'),
  ('Forkurs for ingeniørutdanning', 'forkurs-for-ingeniorutdanning'),
  ('Fysikk', 'fysikk'),
  ('Fysioterapi', 'fysioterapi'),
  ('Fysikk og matematikk', 'fysikk-og-matematikk'),
  ('Geologi og petroleumsteknologi', 'geologi-og-petroleumsteknologi'),
  ('Global Manufacturing Management', 'global-manufacturing-management'),
  ('Ingeniørvitenskap og IKT', 'ingeniorvitenskap-og-ikt'),
  ('Informasjons- og kommunikasjonsteknologi', 'informasjons-og-kommunikasjonsteknologi'),
  ('Industriell design', 'industriell-design'),
  ('Industriell økonomi og teknologiledelse', 'industriell-okonomi-og-teknologiledelse'),
  ('Informatikk', 'informatikk'),
  ('Informasjonssikkerhet', 'informasjonssikkerhet'),
  ('Kjemi', 'kjemi'),
  ('Industriell kjemi og bioteknologi', 'industriell-kjemi-og-bioteknologi'),
  ('Kommunikasjonsteknologi og digital sikkerhet', 'kommunikasjonsteknologi-og-digital-sikkerhet'),
  ('Kybernetikk og robotikk', 'kybernetikk-og-robotikk'),
  ('Lektorutdanning', 'lektorutdanning'),
  ('Lektorutdanning i språkfag', 'lektorutdanning-i-sprakfag'),
  ('Lektorutdanning i realfag', 'lektorutdanning-i-realfag'),
  ('Grunnskolelærerutdanning', 'grunnskolelaererutdanning'),
  ('Marin teknikk', 'marin-teknikk'),
  ('Maskin- og energiteknologi', 'maskin-og-energiteknologi'),
  ('Matematiske fag', 'matematiske-fag'),
  ('Materialteknologi', 'materialteknologi'),
  ('Medisin', 'medisin'),
  ('Markedsføringsledelse', 'markedsforingsledelse'),
  ('Musikkvitenskap', 'musikkvitenskap'),
  ('Nanoteknologi', 'nanoteknologi'),
  ('Nettstudier', 'nettstudier'),
  ('Nordisk språk og litteratur', 'nordisk-sprak-og-litteratur'),
  ('Paramedisin', 'paramedisin'),
  ('Petroleumsfag', 'petroleumsfag'),
  ('Praktisk-pedagogisk utdanning', 'praktisk-pedagogisk-utdanning'),
  ('Project Management', 'project-management'),
  ('Psykologi', 'psykologi'),
  ('Reliability, Availability, Maintainability and Safety', 'reliability-availability-maintainability-and-safety'),
  ('Samfunns- og idrettsvitenskap', 'samfunns-og-idrettsvitenskap'),
  ('Sosiologi', 'sosiologi'),
  ('Statsvitenskap', 'statsvitenskap'),
  ('Tekniske geofag', 'tekniske-geofag'),
  ('Teknologiledelse', 'teknologiledelse'),
  ('Økonomi og administrasjon', 'okonomi-og-administrasjon')
on conflict (slug) do update set name = excluded.name;

do $$
begin
  -- This repo now includes a pulled remote-schema baseline after this migration.
  -- Supabase CLI shadow-database replays can still evaluate this file before
  -- public.users exists, so user linkage is skipped only in that baseline replay case.
  if to_regclass('public.users') is null then
    return;
  end if;

  execute '
    alter table public.users
      add column if not exists school_id uuid references public.schools(id),
      add column if not exists study_id uuid references public.studies(id)
  ';

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'place_of_education'
  ) then
    execute $sql$
      with school_aliases(alias, slug) as (
        values
          ('annet', 'annet'),
          ('bi', 'bi'),
          ('ntnu', 'ntnu')
      )
      update public.users u
      set school_id = coalesce(
        (
          select s.id
          from public.schools s
          left join school_aliases a on a.slug = s.slug
          where lower(trim(u.place_of_education)) = lower(s.name)
             or lower(trim(u.place_of_education)) = a.alias
          limit 1
        ),
        (select id from public.schools where slug = 'annet')
      )
      where u.school_id is null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'study_program'
  ) then
    execute $sql$
      with study_aliases(alias, slug) as (
        values
          ('annet', 'annet'),
          ('arkitekt', 'arkitektur'),
          ('berg', 'georessurser-og-geoteknologi'),
          ('biologi', 'biologi'),
          ('biotek', 'bioteknologi'),
          ('bygg', 'bygg-og-infrastruktur'),
          ('data', 'datateknologi'),
          ('dbe', 'digital-business-engineering'),
          ('digfor', 'digital-forretningsutvikling'),
          ('død', 'digital-okonomi-og-datadrevet-forretningsutvikling'),
          ('elektro', 'elektronikk'),
          ('elsys', 'elektronisk-systemdesign-og-innovasjon'),
          ('emil', 'energi-og-miljo'),
          ('eng', 'engelsk'),
          ('entrepenørskap', 'entreprenorskap'),
          ('entreprenørskap', 'entreprenorskap'),
          ('filmvitenskap', 'filmvitenskap'),
          ('forkurs', 'forkurs-for-ingeniorutdanning'),
          ('fysikk', 'fysikk'),
          ('fysioterapi', 'fysioterapi'),
          ('fysmat', 'fysikk-og-matematikk'),
          ('geopet', 'geologi-og-petroleumsteknologi'),
          ('gmm', 'global-manufacturing-management'),
          ('i & ikt', 'ingeniorvitenskap-og-ikt'),
          ('i&ikt', 'ingeniorvitenskap-og-ikt'),
          ('ikt', 'informasjons-og-kommunikasjonsteknologi'),
          ('ind.des', 'industriell-design'),
          ('ind.øk', 'industriell-okonomi-og-teknologiledelse'),
          ('informatikk', 'informatikk'),
          ('infosec', 'informasjonssikkerhet'),
          ('kjemi', 'kjemi'),
          ('kjemi og biotek.', 'industriell-kjemi-og-bioteknologi'),
          ('komtek', 'kommunikasjonsteknologi-og-digital-sikkerhet'),
          ('kyb', 'kybernetikk-og-robotikk'),
          ('lektor', 'lektorutdanning'),
          ('lol', 'lektorutdanning-i-sprakfag'),
          ('lur', 'lektorutdanning-i-realfag'),
          ('lær', 'grunnskolelaererutdanning'),
          ('lærer', 'grunnskolelaererutdanning'),
          ('marin', 'marin-teknikk'),
          ('maskin', 'maskin-og-energiteknologi'),
          ('matte', 'matematiske-fag'),
          ('mattek', 'materialteknologi'),
          ('medisin', 'medisin'),
          ('mrkled', 'markedsforingsledelse'),
          ('mus.vit', 'musikkvitenskap'),
          ('nano', 'nanoteknologi'),
          ('nettstudie', 'nettstudier'),
          ('nordisk', 'nordisk-sprak-og-litteratur'),
          ('parmed', 'paramedisin'),
          ('petroleum', 'petroleumsfag'),
          ('plu', 'praktisk-pedagogisk-utdanning'),
          ('ppu', 'praktisk-pedagogisk-utdanning'),
          ('proman', 'project-management'),
          ('psy', 'psykologi'),
          ('rams', 'reliability-availability-maintainability-and-safety'),
          ('samf/idr.vit', 'samfunns-og-idrettsvitenskap'),
          ('sosiologi', 'sosiologi'),
          ('stat.vit', 'statsvitenskap'),
          ('tekgeo', 'tekniske-geofag'),
          ('tekled', 'teknologiledelse'),
          ('økad', 'okonomi-og-administrasjon')
      )
      update public.users u
      set study_id = coalesce(
        (
          select st.id
          from public.studies st
          left join study_aliases a on a.slug = st.slug
          where lower(trim(u.study_program)) = lower(st.name)
             or lower(trim(u.study_program)) = a.alias
          limit 1
        ),
        (select id from public.studies where slug = 'annet')
      )
      where u.study_id is null
    $sql$;
  end if;

  execute '
    alter table public.users
      drop column if exists place_of_education,
      drop column if exists study_program
  ';
end
$$;

alter table public.schools enable row level security;
alter table public.studies enable row level security;

drop policy if exists "Authenticated users can read schools" on public.schools;
create policy "Authenticated users can read schools"
  on public.schools for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read studies" on public.studies;
create policy "Authenticated users can read studies"
  on public.studies for select
  to authenticated
  using (true);
