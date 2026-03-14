do $$
declare
  seeded_user_id uuid;
begin
  select id
    into seeded_user_id
  from auth.users
  where email = 'treasurer@local.test'
  limit 1;

  if seeded_user_id is null then
    seeded_user_id := '0062bd80-358c-4548-822c-a5cdea728a0e';

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      reauthentication_token,
      phone_change,
      phone_change_token,
      raw_app_meta_data,
      raw_user_meta_data,
      email_change_confirm_status,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      seeded_user_id,
      'authenticated',
      'authenticated',
      'treasurer@local.test',
      crypt('Treasury123!', gen_salt('bf')),
      timezone('utc', now()),
      timezone('utc', now()),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role":"Treasury Admin","full_name":"Local Treasurer","email_verified":true,"organization_name":"Atlas Treasury Group"}'::jsonb,
      0,
      timezone('utc', now()),
      timezone('utc', now()),
      false,
      false
    );
  end if;

  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    seeded_user_id::text,
    seeded_user_id,
    jsonb_build_object(
      'sub',
      seeded_user_id::text,
      'email',
      'treasurer@local.test',
      'email_verified',
      true,
      'phone_verified',
      false
    ),
    'email',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (provider_id, provider) do update
  set
    identity_data = excluded.identity_data,
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at = excluded.updated_at;

  if seeded_user_id is null then
    raise exception 'Unable to create auth user treasurer@local.test during seed.';
  end if;

  insert into public.organizations (
    id,
    name,
    slug,
    status,
    base_currency_code,
    settings_json
  )
  values (
    '11111111-1111-1111-1111-111111111111',
    'Atlas Treasury Group',
    'atlas-treasury-group',
    'active',
    'USD',
    '{"dashboard":{"default_view":"global"}}'::jsonb
  )
  on conflict (id) do update
  set
    name = excluded.name,
    slug = excluded.slug,
    status = excluded.status,
    base_currency_code = excluded.base_currency_code,
    settings_json = excluded.settings_json;

  insert into public.profiles (
    id,
    full_name,
    role_label
  )
  values (
    seeded_user_id,
    'Local Treasurer',
    'Treasury Admin'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role_label = excluded.role_label;

  insert into public.organization_memberships (
    id,
    organization_id,
    user_id,
    status,
    is_default
  )
  values (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    seeded_user_id,
    'active',
    true
  )
  on conflict (id) do update
  set
    organization_id = excluded.organization_id,
    user_id = excluded.user_id,
    status = excluded.status,
    is_default = excluded.is_default;

  insert into public.subsidiaries (
    id,
    organization_id,
    name,
    legal_entity_code,
    country_code,
    base_currency_code,
    status
  )
  values (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Atlas Holdings US',
    'US-ATLAS',
    'US',
    'USD',
    'active'
  )
  on conflict (id) do update
  set
    name = excluded.name,
    legal_entity_code = excluded.legal_entity_code,
    country_code = excluded.country_code,
    base_currency_code = excluded.base_currency_code,
    status = excluded.status;

  insert into public.bank_relationships (
    id,
    organization_id,
    bank_name,
    bank_code,
    region,
    services_json,
    fee_structure_json,
    status
  )
  values (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Global Treasury Bank',
    'GTB-US',
    'North America',
    '["cash_management","payments"]'::jsonb,
    '{"monthly_fee":250}'::jsonb,
    'active'
  )
  on conflict (id) do update
  set
    bank_name = excluded.bank_name,
    bank_code = excluded.bank_code,
    region = excluded.region,
    services_json = excluded.services_json,
    fee_structure_json = excluded.fee_structure_json,
    status = excluded.status;

  insert into public.bank_accounts (
    id,
    organization_id,
    subsidiary_id,
    bank_relationship_id,
    account_name,
    account_number_masked,
    currency_code,
    account_type,
    status,
    last_balance_at
  )
  values (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'Operating Account',
    '****5521',
    'USD',
    'operating',
    'active',
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    account_name = excluded.account_name,
    account_number_masked = excluded.account_number_masked,
    currency_code = excluded.currency_code,
    account_type = excluded.account_type,
    status = excluded.status,
    last_balance_at = excluded.last_balance_at;

  insert into public.cash_position_snapshots (
    id,
    organization_id,
    snapshot_time,
    reporting_currency_code,
    freshness_status
  )
  values (
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    timezone('utc', now()),
    'USD',
    'fresh'
  )
  on conflict (id) do update
  set
    snapshot_time = excluded.snapshot_time,
    reporting_currency_code = excluded.reporting_currency_code,
    freshness_status = excluded.freshness_status;

  insert into public.cash_position_lines (
    id,
    cash_position_snapshot_id,
    subsidiary_id,
    bank_account_id,
    currency_code,
    balance_amount,
    reporting_amount
  )
  values (
    '77777777-7777-7777-7777-777777777777',
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'USD',
    4250000.00,
    4385000.00
  )
  on conflict (id) do update
  set
    balance_amount = excluded.balance_amount,
    reporting_amount = excluded.reporting_amount;

  insert into public.cash_flow_forecasts (
    id,
    organization_id,
    name,
    horizon_type,
    methodology,
    reporting_currency_code,
    status,
    accuracy_score
  )
  values (
    '88888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    '13 Week Liquidity Forecast',
    'short_term',
    'rules',
    'USD',
    'published',
    94.20
  )
  on conflict (id) do update
  set
    name = excluded.name,
    horizon_type = excluded.horizon_type,
    methodology = excluded.methodology,
    reporting_currency_code = excluded.reporting_currency_code,
    status = excluded.status,
    accuracy_score = excluded.accuracy_score;

  delete from public.forecast_lines
  where cash_flow_forecast_id = '88888888-8888-8888-8888-888888888888';

  insert into public.forecast_lines (
    id,
    cash_flow_forecast_id,
    subsidiary_id,
    forecast_date,
    inflow_amount,
    outflow_amount,
    net_amount,
    currency_code,
    reporting_amount
  )
  values
    ('88888888-8888-8888-8888-000000000001', '88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', current_date + 7, 900000, 650000, 250000, 'USD', 240000),
    ('88888888-8888-8888-8888-000000000002', '88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', current_date + 14, 880000, 610000, 270000, 'USD', 265000),
    ('88888888-8888-8888-8888-000000000003', '88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', current_date + 21, 940000, 700000, 240000, 'USD', 238000),
    ('88888888-8888-8888-8888-000000000004', '88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', current_date + 28, 990000, 730000, 260000, 'USD', 255000),
    ('88888888-8888-8888-8888-000000000005', '88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', current_date + 35, 1020000, 760000, 260000, 'USD', 258000),
    ('88888888-8888-8888-8888-000000000006', '88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', current_date + 42, 1100000, 810000, 290000, 'USD', 287000);

  insert into public.payments (
    id,
    organization_id,
    subsidiary_id,
    source_bank_account_id,
    beneficiary_name,
    payment_type,
    amount,
    currency_code,
    requested_execution_date,
    purpose,
    status,
    created_by
  )
  values (
    '99999999-9999-9999-9999-999999999999',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'Northwind Components',
    'domestic',
    185000.00,
    'USD',
    current_date + 2,
    'Vendor settlement',
    'submitted',
    seeded_user_id
  )
  on conflict (id) do update
  set
    beneficiary_name = excluded.beneficiary_name,
    amount = excluded.amount,
    currency_code = excluded.currency_code,
    requested_execution_date = excluded.requested_execution_date,
    purpose = excluded.purpose,
    status = excluded.status,
    created_by = excluded.created_by;

  insert into public.notifications (
    id,
    organization_id,
    user_id,
    channel,
    notification_type,
    severity,
    title,
    body,
    status
  )
  values (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    seeded_user_id,
    'in_app',
    'liquidity_watch',
    'warning',
    'Liquidity concentration watch',
    'US operating cash exceeds configured concentration threshold by 8 percent.',
    'delivered'
  )
  on conflict (id) do update
  set
    severity = excluded.severity,
    title = excluded.title,
    body = excluded.body,
    status = excluded.status;

  insert into public.integration_connections (
    id,
    organization_id,
    integration_type,
    provider_name,
    status,
    credentials_reference,
    config_json,
    last_success_at
  )
  values (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'bank',
    'Global Treasury Bank API',
    'active',
    'vault://local/global-treasury-bank',
    '{"mode":"sandbox"}'::jsonb,
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    integration_type = excluded.integration_type,
    provider_name = excluded.provider_name,
    status = excluded.status,
    credentials_reference = excluded.credentials_reference,
    config_json = excluded.config_json,
    last_success_at = excluded.last_success_at;

  insert into public.risk_exposures (
    id,
    organization_id,
    subsidiary_id,
    exposure_type,
    reference_entity_type,
    reference_entity_id,
    exposure_currency_code,
    gross_amount,
    net_amount
  )
  values (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'fx',
    'payment',
    '99999999-9999-9999-9999-999999999999',
    'USD',
    950000.00,
    320000.00
  )
  on conflict (id) do update
  set
    gross_amount = excluded.gross_amount,
    net_amount = excluded.net_amount,
    measured_at = timezone('utc', now());

  insert into public.compliance_reports (
    id,
    organization_id,
    report_type,
    period_start,
    period_end,
    status,
    storage_key,
    created_by_user_id
  )
  values (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'cash_position',
    current_date - 7,
    current_date,
    'generated',
    'reports/cash-position-latest.pdf',
    seeded_user_id
  )
  on conflict (id) do update
  set
    status = excluded.status,
    storage_key = excluded.storage_key,
    created_by_user_id = excluded.created_by_user_id,
    updated_at = timezone('utc', now());
end
$$;

do $$
declare
  seeded_user_id uuid;
begin
  select id
    into seeded_user_id
  from auth.users
  where email = 'treasurer@local.test'
  limit 1;

  if seeded_user_id is null then
    raise exception 'Missing auth user treasurer@local.test. Create the user before running seed.sql.';
  end if;

  insert into public.subsidiaries (
    id,
    organization_id,
    name,
    legal_entity_code,
    country_code,
    base_currency_code,
    status
  )
  values (
    '33333333-3333-3333-3333-333333333334',
    '11111111-1111-1111-1111-111111111111',
    'Atlas Treasury EU',
    'EU-ATLAS',
    'DE',
    'EUR',
    'active'
  )
  on conflict (id) do update
  set
    name = excluded.name,
    legal_entity_code = excluded.legal_entity_code,
    country_code = excluded.country_code,
    base_currency_code = excluded.base_currency_code,
    status = excluded.status;

  insert into public.roles (
    id,
    organization_id,
    name,
    description,
    permission_codes_json,
    status
  )
  values (
    '11111111-aaaa-aaaa-aaaa-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Treasury Admin',
    'Full operating access to treasury modules.',
    '["cash.read","payments.approve","admin.manage"]'::jsonb,
    'active'
  )
  on conflict (id) do update
  set
    name = excluded.name,
    description = excluded.description,
    permission_codes_json = excluded.permission_codes_json,
    status = excluded.status;

  insert into public.user_role_assignments (
    id,
    organization_id,
    user_id,
    role_id,
    status,
    assigned_by
  )
  values (
    '11111111-bbbb-bbbb-bbbb-111111111111',
    '11111111-1111-1111-1111-111111111111',
    seeded_user_id,
    '11111111-aaaa-aaaa-aaaa-111111111111',
    'active',
    seeded_user_id
  )
  on conflict (id) do update
  set
    status = excluded.status,
    assigned_by = excluded.assigned_by;

  insert into public.bank_statements (
    id,
    organization_id,
    bank_account_id,
    statement_date,
    source_type,
    file_name,
    processing_status,
    opening_balance,
    closing_balance,
    raw_text
  )
  values (
    '11111111-cccc-cccc-cccc-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    current_date,
    'mt940',
    'atlas-us-operating.mt940',
    'processed',
    4100000,
    4250000,
    'Sample MT940 content'
  )
  on conflict (id) do update
  set
    processing_status = excluded.processing_status,
    opening_balance = excluded.opening_balance,
    closing_balance = excluded.closing_balance,
    raw_text = excluded.raw_text;

  insert into public.reconciliation_runs (
    id,
    organization_id,
    bank_account_id,
    run_date,
    status,
    matched_count,
    exception_count
  )
  values (
    '11111111-dddd-dddd-dddd-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    current_date,
    'completed',
    42,
    3
  )
  on conflict (id) do update
  set
    status = excluded.status,
    matched_count = excluded.matched_count,
    exception_count = excluded.exception_count;

  insert into public.reconciliation_items (
    id,
    reconciliation_run_id,
    internal_reference,
    status,
    variance_amount,
    notes
  )
  values (
    '11111111-eeee-eeee-eeee-111111111111',
    '11111111-dddd-dddd-dddd-111111111111',
    'REC-ATLAS-001',
    'exception',
    2400,
    'Variance pending ERP sync.'
  )
  on conflict (id) do update
  set
    status = excluded.status,
    variance_amount = excluded.variance_amount,
    notes = excluded.notes;

  insert into public.forecast_scenarios (
    id,
    organization_id,
    cash_flow_forecast_id,
    name,
    scenario_type,
    assumptions_json,
    status
  )
  values (
    '11111111-ffff-ffff-ffff-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '88888888-8888-8888-8888-888888888888',
    'Supplier stress case',
    'stress',
    '{"payables_uplift":0.12,"collections_delay_days":5}'::jsonb,
    'active'
  )
  on conflict (id) do update
  set
    name = excluded.name,
    scenario_type = excluded.scenario_type,
    assumptions_json = excluded.assumptions_json,
    status = excluded.status;

  insert into public.electronic_signatures (
    id,
    organization_id,
    payment_id,
    signer_user_id,
    provider_name,
    status,
    signed_at
  )
  values (
    '22222222-aaaa-aaaa-aaaa-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '99999999-9999-9999-9999-999999999999',
    seeded_user_id,
    'DocuSign',
    'signed',
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    provider_name = excluded.provider_name,
    status = excluded.status,
    signed_at = excluded.signed_at;

  insert into public.intercompany_loans (
    id,
    organization_id,
    lender_subsidiary_id,
    borrower_subsidiary_id,
    currency_code,
    principal_amount,
    outstanding_amount,
    interest_rate,
    maturity_date,
    status
  )
  values (
    '22222222-bbbb-bbbb-bbbb-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333334',
    'USD',
    1500000,
    1100000,
    4.25,
    current_date + 180,
    'active'
  )
  on conflict (id) do update
  set
    outstanding_amount = excluded.outstanding_amount,
    interest_rate = excluded.interest_rate,
    maturity_date = excluded.maturity_date,
    status = excluded.status;

  insert into public.market_data_points (
    id,
    organization_id,
    provider_name,
    instrument_type,
    symbol,
    value_numeric,
    observed_at
  )
  values (
    '22222222-cccc-cccc-cccc-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'MarketFeed Pro',
    'fx_spot',
    'EURUSD',
    1.0875,
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    value_numeric = excluded.value_numeric,
    observed_at = excluded.observed_at;

  insert into public.counterparties (
    id,
    organization_id,
    name,
    type,
    external_reference,
    country_code,
    default_currency_code,
    bank_details_json,
    risk_rating
  )
  values (
    '22222222-dddd-dddd-dddd-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Nordic Risk Counterparty',
    'bank',
    'CP-001',
    'DE',
    'EUR',
    '{"iban":"DE89370400440532013000"}'::jsonb,
    'A'
  )
  on conflict (id) do update
  set
    name = excluded.name,
    type = excluded.type,
    default_currency_code = excluded.default_currency_code,
    risk_rating = excluded.risk_rating;

  insert into public.hedging_instruments (
    id,
    organization_id,
    exposure_id,
    counterparty_id,
    instrument_type,
    currency_code,
    notional_amount,
    mtm_amount,
    maturity_date,
    status
  )
  values (
    '22222222-eeee-eeee-eeee-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-dddd-dddd-dddd-222222222222',
    'fx_forward',
    'USD',
    500000,
    18000,
    current_date + 90,
    'active'
  )
  on conflict (id) do update
  set
    notional_amount = excluded.notional_amount,
    mtm_amount = excluded.mtm_amount,
    maturity_date = excluded.maturity_date,
    status = excluded.status;

  insert into public.investments (
    id,
    organization_id,
    counterparty_id,
    investment_type,
    instrument_name,
    principal_amount,
    current_value,
    currency_code,
    maturity_date,
    esg_label,
    status
  )
  values (
    '22222222-ffff-ffff-ffff-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '22222222-dddd-dddd-dddd-222222222222',
    'money_market',
    'Atlas Liquidity Fund',
    2000000,
    2012500,
    'USD',
    current_date + 45,
    'Green',
    'active'
  )
  on conflict (id) do update
  set
    current_value = excluded.current_value,
    maturity_date = excluded.maturity_date,
    esg_label = excluded.esg_label,
    status = excluded.status;

  insert into public.debt_facilities (
    id,
    organization_id,
    lender_name,
    facility_type,
    currency_code,
    committed_amount,
    drawn_amount,
    maturity_date,
    covenant_summary,
    status
  )
  values (
    '33333333-aaaa-aaaa-aaaa-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Global Credit Bank',
    'revolver',
    'USD',
    10000000,
    4000000,
    current_date + 365,
    'Leverage ratio < 3.5x',
    'active'
  )
  on conflict (id) do update
  set
    drawn_amount = excluded.drawn_amount,
    maturity_date = excluded.maturity_date,
    covenant_summary = excluded.covenant_summary,
    status = excluded.status;

  insert into public.covenant_tests (
    id,
    debt_facility_id,
    metric_name,
    threshold_value,
    actual_value,
    test_date,
    status
  )
  values (
    '33333333-bbbb-bbbb-bbbb-333333333333',
    '33333333-aaaa-aaaa-aaaa-333333333333',
    'Leverage ratio',
    3.5,
    3.2,
    current_date,
    'pass'
  )
  on conflict (id) do update
  set
    actual_value = excluded.actual_value,
    test_date = excluded.test_date,
    status = excluded.status;

  insert into public.treasury_events (
    id,
    organization_id,
    event_type,
    title,
    due_date,
    related_entity_type,
    related_entity_id,
    status
  )
  values (
    '33333333-cccc-cccc-cccc-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'covenant_test',
    'Quarterly covenant certification',
    current_date + 14,
    'debt_facility',
    '33333333-aaaa-aaaa-aaaa-333333333333',
    'scheduled'
  )
  on conflict (id) do update
  set
    due_date = excluded.due_date,
    status = excluded.status;

  insert into public.treasury_policies (
    id,
    organization_id,
    name,
    policy_type,
    policy_json,
    version,
    status
  )
  values (
    '33333333-dddd-dddd-dddd-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Global payments approval policy',
    'approval',
    '{"thresholds":{"warning":100000,"escalation":500000}}'::jsonb,
    3,
    'active'
  )
  on conflict (id) do update
  set
    policy_json = excluded.policy_json,
    version = excluded.version,
    status = excluded.status;

  insert into public.workflow_rules (
    id,
    organization_id,
    approval_workflow_id,
    name,
    trigger_type,
    rule_json,
    status
  )
  values (
    '33333333-eeee-eeee-eeee-333333333333',
    '11111111-1111-1111-1111-111111111111',
    null,
    'High-value payment escalation',
    'payment_amount',
    '{"min_amount":500000,"require_role":"Treasury Admin"}'::jsonb,
    'active'
  )
  on conflict (id) do update
  set
    rule_json = excluded.rule_json,
    status = excluded.status;

  insert into public.mobile_devices (
    id,
    organization_id,
    user_id,
    device_label,
    platform,
    biometric_enabled,
    last_seen_at,
    status
  )
  values (
    '44444444-aaaa-aaaa-aaaa-444444444444',
    '11111111-1111-1111-1111-111111111111',
    seeded_user_id,
    'Treasury iPhone',
    'iOS',
    true,
    timezone('utc', now()),
    'active'
  )
  on conflict (id) do update
  set
    biometric_enabled = excluded.biometric_enabled,
    last_seen_at = excluded.last_seen_at,
    status = excluded.status;

  insert into public.dashboards (
    id,
    organization_id,
    user_id,
    name,
    layout_json,
    is_default
  )
  values (
    '44444444-bbbb-bbbb-bbbb-444444444444',
    '11111111-1111-1111-1111-111111111111',
    seeded_user_id,
    'Treasury control room',
    '{"columns":12,"theme":"ops"}'::jsonb,
    true
  )
  on conflict (id) do update
  set
    name = excluded.name,
    layout_json = excluded.layout_json,
    is_default = excluded.is_default;

  insert into public.dashboard_widgets (
    id,
    dashboard_id,
    widget_type,
    title,
    config_json,
    position_index
  )
  values (
    '44444444-cccc-cccc-cccc-444444444444',
    '44444444-bbbb-bbbb-bbbb-444444444444',
    'metric',
    'Global cash monitor',
    '{"metric":"global_cash"}'::jsonb,
    0
  )
  on conflict (id) do update
  set
    widget_type = excluded.widget_type,
    title = excluded.title,
    config_json = excluded.config_json,
    position_index = excluded.position_index;

  insert into public.query_threads (
    id,
    organization_id,
    user_id,
    title,
    prompt_text,
    response_text,
    status
  )
  values (
    '44444444-dddd-dddd-dddd-444444444444',
    '11111111-1111-1111-1111-111111111111',
    seeded_user_id,
    'Why is available liquidity down?',
    'Explain the drivers behind this week''s liquidity change.',
    'Lower projected collections and one high-value supplier payment reduced available liquidity by 6 percent.',
    'completed'
  )
  on conflict (id) do update
  set
    response_text = excluded.response_text,
    status = excluded.status;

  insert into public.integration_sync_runs (
    id,
    integration_connection_id,
    sync_type,
    status,
    started_at,
    completed_at,
    records_processed,
    error_summary,
    metadata_json
  )
  values (
    '44444444-eeee-eeee-eeee-444444444444',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bank_balances',
    'succeeded',
    timezone('utc', now()) - interval '6 minutes',
    timezone('utc', now()) - interval '4 minutes',
    128,
    null,
    '{"source":"bank_api"}'::jsonb
  )
  on conflict (id) do update
  set
    status = excluded.status,
    completed_at = excluded.completed_at,
    records_processed = excluded.records_processed,
    metadata_json = excluded.metadata_json;

  insert into public.platform_settings (
    id,
    organization_id,
    category,
    setting_key,
    setting_value_json,
    status
  )
  values (
    '44444444-ffff-ffff-ffff-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'security',
    'session_timeout_minutes',
    '{"value":30}'::jsonb,
    'active'
  )
  on conflict (id) do update
  set
    setting_value_json = excluded.setting_value_json,
    status = excluded.status;
end
$$;
