drop policy if exists "Users can delete own work_misc" on "public"."work_misc";

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
