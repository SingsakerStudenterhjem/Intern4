alter table "public"."work_misc"
  add column if not exists "image_paths" text[] not null default '{}';

drop policy if exists "Users can insert own work_misc" on "public"."work_misc";
drop policy if exists "Users can delete own work_misc" on "public"."work_misc";

create policy "Users can insert own work_misc"
on "public"."work_misc"
as permissive
for insert
to authenticated
with check (
  exists (
    select 1
    from "public"."work_assignments" assignment
    where assignment.work_id = work_misc.id
      and assignment.user_uuid = auth.uid()
  )
);

create policy "Users can delete own work_misc"
on "public"."work_misc"
as permissive
for delete
to authenticated
using (
  exists (
    select 1
    from "public"."work_assignments" assignment
    where assignment.work_id = work_misc.id
      and assignment.user_uuid = auth.uid()
      and assignment.approved_state = 0
  )
);

drop policy if exists "users can read own images" on "storage"."objects";
drop policy if exists "authenticated users can read images" on "storage"."objects";

create policy "authenticated users can read images"
on "storage"."objects"
as permissive
for select
to authenticated
using (bucket_id = 'Bilder'::text);
