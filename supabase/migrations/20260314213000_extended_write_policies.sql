drop policy if exists "members can manage cash position lines" on public.cash_position_lines;
create policy "members can manage cash position lines"
on public.cash_position_lines for all
using (
  exists (
    select 1
    from public.cash_position_snapshots snapshot
    where snapshot.id = cash_position_lines.cash_position_snapshot_id
      and public.is_org_member(snapshot.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.cash_position_snapshots snapshot
    where snapshot.id = cash_position_lines.cash_position_snapshot_id
      and public.is_org_member(snapshot.organization_id)
  )
);

drop policy if exists "members can manage forecast lines" on public.forecast_lines;
create policy "members can manage forecast lines"
on public.forecast_lines for all
using (
  exists (
    select 1
    from public.cash_flow_forecasts forecast
    where forecast.id = forecast_lines.cash_flow_forecast_id
      and public.is_org_member(forecast.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.cash_flow_forecasts forecast
    where forecast.id = forecast_lines.cash_flow_forecast_id
      and public.is_org_member(forecast.organization_id)
  )
);

drop policy if exists "members can manage workflow steps" on public.approval_workflow_steps;
create policy "members can manage workflow steps"
on public.approval_workflow_steps for all
using (
  exists (
    select 1
    from public.approval_workflows workflow
    where workflow.id = approval_workflow_steps.approval_workflow_id
      and public.is_org_member(workflow.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.approval_workflows workflow
    where workflow.id = approval_workflow_steps.approval_workflow_id
      and public.is_org_member(workflow.organization_id)
  )
);

drop policy if exists "members can manage payment approvals" on public.payment_approvals;
create policy "members can manage payment approvals"
on public.payment_approvals for all
using (
  exists (
    select 1
    from public.payments payment
    where payment.id = payment_approvals.payment_id
      and public.is_org_member(payment.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.payments payment
    where payment.id = payment_approvals.payment_id
      and public.is_org_member(payment.organization_id)
  )
);

drop policy if exists "members can manage audit logs" on public.audit_logs;
create policy "members can manage audit logs"
on public.audit_logs for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists "members can manage covenant tests" on public.covenant_tests;
create policy "members can manage covenant tests"
on public.covenant_tests for all
using (
  exists (
    select 1
    from public.debt_facilities facility
    where facility.id = covenant_tests.debt_facility_id
      and public.is_org_member(facility.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.debt_facilities facility
    where facility.id = covenant_tests.debt_facility_id
      and public.is_org_member(facility.organization_id)
  )
);

drop policy if exists "members can manage integration sync runs" on public.integration_sync_runs;
create policy "members can manage integration sync runs"
on public.integration_sync_runs for all
using (
  exists (
    select 1
    from public.integration_connections connection
    where connection.id = integration_sync_runs.integration_connection_id
      and public.is_org_member(connection.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.integration_connections connection
    where connection.id = integration_sync_runs.integration_connection_id
      and public.is_org_member(connection.organization_id)
  )
);
