create policy "members can insert dashboard widgets"
on public.dashboard_widgets for insert
with check (
  exists (
    select 1
    from public.dashboards dashboard
    where dashboard.id = dashboard_widgets.dashboard_id
      and public.is_org_member(dashboard.organization_id)
  )
);

create policy "members can update dashboard widgets"
on public.dashboard_widgets for update
using (
  exists (
    select 1
    from public.dashboards dashboard
    where dashboard.id = dashboard_widgets.dashboard_id
      and public.is_org_member(dashboard.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.dashboards dashboard
    where dashboard.id = dashboard_widgets.dashboard_id
      and public.is_org_member(dashboard.organization_id)
  )
);

create policy "members can delete dashboard widgets"
on public.dashboard_widgets for delete
using (
  exists (
    select 1
    from public.dashboards dashboard
    where dashboard.id = dashboard_widgets.dashboard_id
      and public.is_org_member(dashboard.organization_id)
  )
);
