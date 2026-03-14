create table if not exists public.risk_exposures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  subsidiary_id uuid references public.subsidiaries (id) on delete set null,
  exposure_type text not null default 'fx',
  reference_entity_type text not null default 'payment',
  reference_entity_id uuid,
  exposure_currency_code char(3),
  gross_amount numeric(20, 4) not null,
  net_amount numeric(20, 4),
  measured_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.compliance_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  report_type text not null,
  period_start date,
  period_end date,
  status text not null default 'pending' check (status in ('pending', 'generated', 'delivered', 'failed')),
  storage_key text,
  created_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.counterparties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  type text not null default 'vendor',
  external_reference text,
  country_code char(2),
  default_currency_code char(3),
  bank_details_json jsonb not null default '{}'::jsonb,
  risk_rating text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.integration_sync_runs (
  id uuid primary key default gen_random_uuid(),
  integration_connection_id uuid not null references public.integration_connections (id) on delete cascade,
  sync_type text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'partial')),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  records_processed integer not null default 0,
  error_summary text,
  metadata_json jsonb not null default '{}'::jsonb
);

drop trigger if exists set_compliance_reports_updated_at on public.compliance_reports;
create trigger set_compliance_reports_updated_at
before update on public.compliance_reports
for each row execute function public.set_updated_at();

drop trigger if exists set_counterparties_updated_at on public.counterparties;
create trigger set_counterparties_updated_at
before update on public.counterparties
for each row execute function public.set_updated_at();

alter table public.risk_exposures enable row level security;
alter table public.compliance_reports enable row level security;
alter table public.counterparties enable row level security;
alter table public.integration_sync_runs enable row level security;

create policy "members can access risk exposures"
on public.risk_exposures for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access compliance reports"
on public.compliance_reports for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access counterparties"
on public.counterparties for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access integration sync runs"
on public.integration_sync_runs for select
using (
  exists (
    select 1
    from public.integration_connections connection
    where connection.id = integration_sync_runs.integration_connection_id
      and public.is_org_member(connection.organization_id)
  )
);
