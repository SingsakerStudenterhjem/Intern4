alter table "public"."work_assignments"
  add column if not exists "performed_at" date;

update "public"."work_assignments"
set "performed_at" = "created_at"::date
where "performed_at" is null;

alter table "public"."work_assignments"
  alter column "performed_at" set default current_date,
  alter column "performed_at" set not null;

create index if not exists "work_assignments_performed_at_idx"
on "public"."work_assignments" using btree ("performed_at");
