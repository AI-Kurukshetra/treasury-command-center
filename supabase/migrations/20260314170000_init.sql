create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active', 'suspended', 'trial')),
  base_currency_code char(3) not null default 'USD',
  settings_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role_label text not null default 'Treasury User',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('invited', 'active', 'revoked')),
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_org_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  );
$$;

create table if not exists public.subsidiaries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  legal_entity_code text,
  country_code char(2),
  base_currency_code char(3) not null default 'USD',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bank_relationships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  bank_name text not null,
  bank_code text,
  region text,
  services_json jsonb not null default '[]'::jsonb,
  fee_structure_json jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  subsidiary_id uuid references public.subsidiaries (id) on delete set null,
  bank_relationship_id uuid references public.bank_relationships (id) on delete set null,
  account_name text not null,
  account_number_masked text not null,
  currency_code char(3) not null,
  account_type text not null default 'operating',
  status text not null default 'active' check (status in ('active', 'pending_verification', 'closed')),
  last_balance_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.currency_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency_code char(3) not null,
  quote_currency_code char(3) not null,
  rate numeric(20, 10) not null,
  source text not null,
  observed_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  bank_account_id uuid references public.bank_accounts (id) on delete set null,
  subsidiary_id uuid references public.subsidiaries (id) on delete set null,
  source_system text not null,
  external_id text,
  transaction_date date not null,
  value_date date,
  direction text not null check (direction in ('debit', 'credit')),
  amount numeric(20, 4) not null,
  currency_code char(3) not null,
  description text not null,
  status text not null default 'booked' check (status in ('pending', 'booked', 'reversed')),
  raw_payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists transactions_org_date_idx
  on public.transactions (organization_id, transaction_date desc);

create table if not exists public.cash_position_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  snapshot_time timestamptz not null default timezone('utc', now()),
  reporting_currency_code char(3) not null default 'USD',
  freshness_status text not null default 'fresh' check (freshness_status in ('fresh', 'stale', 'partial')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cash_position_lines (
  id uuid primary key default gen_random_uuid(),
  cash_position_snapshot_id uuid not null references public.cash_position_snapshots (id) on delete cascade,
  subsidiary_id uuid references public.subsidiaries (id) on delete set null,
  bank_account_id uuid references public.bank_accounts (id) on delete set null,
  currency_code char(3) not null,
  balance_amount numeric(20, 4) not null,
  reporting_amount numeric(20, 4) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cash_flow_forecasts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  horizon_type text not null check (horizon_type in ('short_term', 'long_term')),
  methodology text not null default 'rules',
  reporting_currency_code char(3) not null default 'USD',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  accuracy_score numeric(5, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.forecast_lines (
  id uuid primary key default gen_random_uuid(),
  cash_flow_forecast_id uuid not null references public.cash_flow_forecasts (id) on delete cascade,
  subsidiary_id uuid references public.subsidiaries (id) on delete set null,
  forecast_date date not null,
  inflow_amount numeric(20, 4) not null default 0,
  outflow_amount numeric(20, 4) not null default 0,
  net_amount numeric(20, 4) not null,
  currency_code char(3) not null,
  reporting_amount numeric(20, 4) not null
);

create table if not exists public.approval_workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  workflow_type text not null default 'payment',
  status text not null default 'active' check (status in ('active', 'inactive')),
  rules_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.approval_workflow_steps (
  id uuid primary key default gen_random_uuid(),
  approval_workflow_id uuid not null references public.approval_workflows (id) on delete cascade,
  step_order integer not null,
  approver_type text not null default 'role',
  approver_reference text not null,
  threshold_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  subsidiary_id uuid references public.subsidiaries (id) on delete set null,
  source_bank_account_id uuid references public.bank_accounts (id) on delete set null,
  approval_workflow_id uuid references public.approval_workflows (id) on delete set null,
  beneficiary_name text not null,
  payment_type text not null default 'domestic',
  amount numeric(20, 4) not null,
  currency_code char(3) not null,
  requested_execution_date date not null,
  purpose text,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'rejected', 'released', 'failed', 'cancelled')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_approvals (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  workflow_step_id uuid references public.approval_workflow_steps (id) on delete set null,
  approver_user_id uuid references auth.users (id) on delete set null,
  decision text not null default 'pending' check (decision in ('pending', 'approved', 'rejected', 'escalated')),
  decision_reason text,
  decided_at timestamptz,
  step_up_verified boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  channel text not null default 'in_app',
  notification_type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  title text not null,
  body text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'read', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz
);

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  integration_type text not null,
  provider_name text not null,
  status text not null default 'pending' check (status in ('active', 'disconnected', 'error', 'pending')),
  credentials_reference text,
  config_json jsonb not null default '{}'::jsonb,
  last_success_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  actor_type text not null default 'user',
  action text not null,
  entity_type text not null,
  entity_id uuid,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  metadata_json jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now())
);

create index if not exists audit_logs_org_occurred_idx
  on public.audit_logs (organization_id, occurred_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'organizations',
    'profiles',
    'organization_memberships',
    'subsidiaries',
    'bank_relationships',
    'bank_accounts',
    'transactions',
    'cash_flow_forecasts',
    'approval_workflows',
    'payments',
    'notifications',
    'integration_connections'
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

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.subsidiaries enable row level security;
alter table public.bank_relationships enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.cash_position_snapshots enable row level security;
alter table public.cash_position_lines enable row level security;
alter table public.cash_flow_forecasts enable row level security;
alter table public.forecast_lines enable row level security;
alter table public.approval_workflows enable row level security;
alter table public.approval_workflow_steps enable row level security;
alter table public.payments enable row level security;
alter table public.payment_approvals enable row level security;
alter table public.notifications enable row level security;
alter table public.integration_connections enable row level security;
alter table public.audit_logs enable row level security;

create policy "members can read organizations"
on public.organizations for select
using (public.is_org_member(id));

create policy "users can manage their profile"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "members can read memberships"
on public.organization_memberships for select
using (auth.uid() = user_id or public.is_org_member(organization_id));

create policy "members can access subsidiaries"
on public.subsidiaries for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access bank relationships"
on public.bank_relationships for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access bank accounts"
on public.bank_accounts for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access transactions"
on public.transactions for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access cash snapshots"
on public.cash_position_snapshots for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access cash lines"
on public.cash_position_lines for select
using (
  exists (
    select 1
    from public.cash_position_snapshots snapshot
    where snapshot.id = cash_position_lines.cash_position_snapshot_id
      and public.is_org_member(snapshot.organization_id)
  )
);

create policy "members can access forecasts"
on public.cash_flow_forecasts for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access forecast lines"
on public.forecast_lines for select
using (
  exists (
    select 1
    from public.cash_flow_forecasts forecast
    where forecast.id = forecast_lines.cash_flow_forecast_id
      and public.is_org_member(forecast.organization_id)
  )
);

create policy "members can access workflows"
on public.approval_workflows for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access workflow steps"
on public.approval_workflow_steps for select
using (
  exists (
    select 1
    from public.approval_workflows workflow
    where workflow.id = approval_workflow_steps.approval_workflow_id
      and public.is_org_member(workflow.organization_id)
  )
);

create policy "members can access payments"
on public.payments for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access payment approvals"
on public.payment_approvals for select
using (
  exists (
    select 1
    from public.payments payment
    where payment.id = payment_approvals.payment_id
      and public.is_org_member(payment.organization_id)
  )
);

create policy "members can access notifications"
on public.notifications for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access integrations"
on public.integration_connections for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "members can access audit logs"
on public.audit_logs for select
using (public.is_org_member(organization_id));
