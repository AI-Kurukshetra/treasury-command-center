create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  permission_codes_json jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table if not exists public.user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'revoked')),
  assigned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id, role_id)
);

create table if not exists public.bank_statements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  bank_account_id uuid references public.bank_accounts (id) on delete set null,
  statement_date date not null,
  source_type text not null default 'mt940',
  file_name text not null,
  processing_status text not null default 'processed' check (processing_status in ('queued', 'processing', 'processed', 'failed')),
  opening_balance numeric(20, 4) not null default 0,
  closing_balance numeric(20, 4) not null default 0,
  raw_text text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  bank_account_id uuid references public.bank_accounts (id) on delete set null,
  run_date date not null,
  status text not null default 'completed' check (status in ('queued', 'running', 'completed', 'failed')),
  matched_count integer not null default 0,
  exception_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reconciliation_items (
  id uuid primary key default gen_random_uuid(),
  reconciliation_run_id uuid not null references public.reconciliation_runs (id) on delete cascade,
  transaction_id uuid references public.transactions (id) on delete set null,
  internal_reference text,
  status text not null default 'matched' check (status in ('matched', 'exception', 'manual_review')),
  variance_amount numeric(20, 4) not null default 0,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.forecast_scenarios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  cash_flow_forecast_id uuid references public.cash_flow_forecasts (id) on delete set null,
  name text not null,
  scenario_type text not null default 'base_case',
  assumptions_json jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.electronic_signatures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  payment_id uuid not null references public.payments (id) on delete cascade,
  signer_user_id uuid references auth.users (id) on delete set null,
  provider_name text not null,
  status text not null default 'pending' check (status in ('pending', 'signed', 'declined')),
  signed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.intercompany_loans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lender_subsidiary_id uuid references public.subsidiaries (id) on delete set null,
  borrower_subsidiary_id uuid references public.subsidiaries (id) on delete set null,
  currency_code char(3) not null,
  principal_amount numeric(20, 4) not null,
  outstanding_amount numeric(20, 4) not null,
  interest_rate numeric(8, 4) not null default 0,
  maturity_date date,
  status text not null default 'active' check (status in ('active', 'settled', 'defaulted')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.market_data_points (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider_name text not null,
  instrument_type text not null,
  symbol text not null,
  value_numeric numeric(20, 8) not null,
  observed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hedging_instruments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  exposure_id uuid references public.risk_exposures (id) on delete set null,
  counterparty_id uuid references public.counterparties (id) on delete set null,
  instrument_type text not null,
  currency_code char(3) not null,
  notional_amount numeric(20, 4) not null,
  mtm_amount numeric(20, 4) not null default 0,
  maturity_date date,
  status text not null default 'active' check (status in ('active', 'matured', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  counterparty_id uuid references public.counterparties (id) on delete set null,
  investment_type text not null,
  instrument_name text not null,
  principal_amount numeric(20, 4) not null,
  current_value numeric(20, 4) not null,
  currency_code char(3) not null,
  maturity_date date,
  esg_label text,
  status text not null default 'active' check (status in ('active', 'matured', 'redeemed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.debt_facilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lender_name text not null,
  facility_type text not null,
  currency_code char(3) not null,
  committed_amount numeric(20, 4) not null,
  drawn_amount numeric(20, 4) not null default 0,
  maturity_date date,
  covenant_summary text,
  status text not null default 'active' check (status in ('active', 'repaid', 'breached')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.covenant_tests (
  id uuid primary key default gen_random_uuid(),
  debt_facility_id uuid not null references public.debt_facilities (id) on delete cascade,
  metric_name text not null,
  threshold_value numeric(20, 4) not null,
  actual_value numeric(20, 4) not null,
  test_date date not null,
  status text not null default 'pass' check (status in ('pass', 'warning', 'breach')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.treasury_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  event_type text not null,
  title text not null,
  due_date date not null,
  related_entity_type text,
  related_entity_id uuid,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.treasury_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  policy_type text not null,
  policy_json jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  status text not null default 'active' check (status in ('draft', 'active', 'retired')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workflow_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  approval_workflow_id uuid references public.approval_workflows (id) on delete set null,
  name text not null,
  trigger_type text not null,
  rule_json jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.mobile_devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  device_label text not null,
  platform text not null,
  biometric_enabled boolean not null default false,
  last_seen_at timestamptz,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.dashboards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  layout_json jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.dashboards (id) on delete cascade,
  widget_type text not null,
  title text not null,
  config_json jsonb not null default '{}'::jsonb,
  position_index integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.query_threads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  prompt_text text not null,
  response_text text,
  status text not null default 'completed' check (status in ('queued', 'completed', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  category text not null,
  setting_key text not null,
  setting_value_json jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, category, setting_key)
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles',
    'bank_statements',
    'reconciliation_runs',
    'forecast_scenarios',
    'intercompany_loans',
    'hedging_instruments',
    'investments',
    'debt_facilities',
    'treasury_events',
    'treasury_policies',
    'workflow_rules',
    'mobile_devices',
    'dashboards',
    'dashboard_widgets',
    'query_threads',
    'platform_settings'
  ]
  loop
    execute format(
      'drop trigger if exists set_%1$s_updated_at on public.%1$s;
       create trigger set_%1$s_updated_at
       before update on public.%1$s
       for each row execute function public.set_updated_at();',
      table_name
    );
  end loop;
end;
$$;

alter table public.roles enable row level security;
alter table public.user_role_assignments enable row level security;
alter table public.bank_statements enable row level security;
alter table public.reconciliation_runs enable row level security;
alter table public.reconciliation_items enable row level security;
alter table public.forecast_scenarios enable row level security;
alter table public.electronic_signatures enable row level security;
alter table public.intercompany_loans enable row level security;
alter table public.market_data_points enable row level security;
alter table public.hedging_instruments enable row level security;
alter table public.investments enable row level security;
alter table public.debt_facilities enable row level security;
alter table public.covenant_tests enable row level security;
alter table public.treasury_events enable row level security;
alter table public.treasury_policies enable row level security;
alter table public.workflow_rules enable row level security;
alter table public.mobile_devices enable row level security;
alter table public.dashboards enable row level security;
alter table public.dashboard_widgets enable row level security;
alter table public.query_threads enable row level security;
alter table public.platform_settings enable row level security;

create policy "members can access roles"
on public.roles for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access user role assignments"
on public.user_role_assignments for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access bank statements"
on public.bank_statements for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access reconciliation runs"
on public.reconciliation_runs for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access reconciliation items"
on public.reconciliation_items for select
using (
  exists (
    select 1
    from public.reconciliation_runs run
    where run.id = reconciliation_items.reconciliation_run_id
      and public.is_org_member(run.organization_id)
  )
);

create policy "members can access forecast scenarios"
on public.forecast_scenarios for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access electronic signatures"
on public.electronic_signatures for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access intercompany loans"
on public.intercompany_loans for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access market data points"
on public.market_data_points for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access hedging instruments"
on public.hedging_instruments for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access investments"
on public.investments for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access debt facilities"
on public.debt_facilities for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access covenant tests"
on public.covenant_tests for select
using (
  exists (
    select 1
    from public.debt_facilities facility
    where facility.id = covenant_tests.debt_facility_id
      and public.is_org_member(facility.organization_id)
  )
);

create policy "members can access treasury events"
on public.treasury_events for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access treasury policies"
on public.treasury_policies for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access workflow rules"
on public.workflow_rules for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access mobile devices"
on public.mobile_devices for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access dashboards"
on public.dashboards for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access dashboard widgets"
on public.dashboard_widgets for select
using (
  exists (
    select 1
    from public.dashboards dashboard
    where dashboard.id = dashboard_widgets.dashboard_id
      and public.is_org_member(dashboard.organization_id)
  )
);

create policy "members can access query threads"
on public.query_threads for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access platform settings"
on public.platform_settings for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));
