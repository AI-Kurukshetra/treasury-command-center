# Database Schema

## 1. Scope
This document defines the logical relational schema for the operational datastore of the Enterprise Treasury & Cash Flow Command Center. The schema is designed for PostgreSQL and covers the entities defined in `SRS.md` plus the supporting entities required by the generated docs.

## 2. Modeling Principles
- Multi-tenant by `organization_id`
- UUID primary keys
- `created_at` and `updated_at` timestamps on operational tables
- Soft delete for user-facing master data where auditability matters
- Immutable audit tables for security and compliance events
- Enumerated status fields constrained at the application and database levels

## 3. Core Entity Groups
### 3.1 Identity and Organization
- organizations
- subsidiaries
- users
- roles
- permissions
- user_organization_memberships
- role_permissions
- user_role_assignments

### 3.2 Treasury Master Data
- bank_relationships
- bank_accounts
- counterparties
- currencies
- currency_rates
- treasury_policies
- workflow_rules
- dashboards
- dashboard_widgets

### 3.3 Operational Treasury Data
- transactions
- bank_statements
- statement_lines
- reconciliation_items
- cash_position_snapshots
- cash_position_lines
- cash_flow_forecasts
- forecast_lines
- forecast_scenarios
- payments
- payment_approvals
- electronic_signatures
- approval_workflows
- approval_workflow_steps

### 3.4 Liquidity, Risk, and Treasury Instruments
- cash_pools
- sweep_instructions
- intercompany_transactions
- risk_exposures
- hedging_instruments
- investments
- debt_facilities
- debt_schedules
- covenant_tests
- treasury_events
- market_data

### 3.5 Reporting and Platform Operations
- compliance_reports
- report_jobs
- notifications
- integration_connections
- integration_sync_runs
- integration_webhook_events
- audit_logs

## 4. Logical ER Summary
```text
organizations -> subsidiaries
organizations -> users through user_organization_memberships
users -> roles through user_role_assignments
roles -> permissions through role_permissions

organizations -> bank_relationships -> bank_accounts
organizations -> counterparties
organizations -> treasury_policies -> workflow_rules

bank_accounts -> transactions
bank_statements -> statement_lines
statement_lines <-> transactions via reconciliation_items

organizations -> cash_position_snapshots -> cash_position_lines
organizations -> cash_flow_forecasts -> forecast_lines
cash_flow_forecasts -> forecast_scenarios

organizations -> payments -> payment_approvals
approval_workflows -> approval_workflow_steps
payments -> electronic_signatures

organizations -> cash_pools -> sweep_instructions
organizations -> intercompany_transactions
organizations -> risk_exposures
organizations -> hedging_instruments
organizations -> investments
organizations -> debt_facilities -> debt_schedules -> covenant_tests

organizations -> compliance_reports
organizations -> report_jobs
organizations -> notifications
organizations -> integration_connections -> integration_sync_runs

all critical entities -> audit_logs
```

## 5. Table Definitions
### 5.1 organizations
Purpose: top-level tenant record.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| name | text | legal or commercial name |
| slug | text unique | tenant identifier |
| status | text | active, suspended, trial |
| base_currency_code | char(3) | default reporting currency |
| entity_count_limit | integer | plan constraint |
| settings_json | jsonb | tenant config |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.2 subsidiaries
Purpose: legal entities or operating entities under an organization.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| parent_subsidiary_id | uuid fk nullable | subsidiaries.id |
| name | text | |
| legal_entity_code | text | external identifier |
| country_code | char(2) | |
| base_currency_code | char(3) | |
| status | text | active, inactive |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.3 users
Purpose: identity principals.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| email | citext unique | |
| full_name | text | |
| auth_provider | text | internal, oidc, saml |
| auth_subject | text | provider subject |
| status | text | invited, active, locked, disabled |
| last_login_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.4 roles
Purpose: RBAC roles.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk nullable | null for system roles |
| name | text | |
| description | text | |
| is_system_role | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.5 permissions
Purpose: granular permission catalog.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| code | text unique | example `payments.approve` |
| description | text | |

### 5.6 user_organization_memberships
Purpose: user membership and tenant scoping.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| user_id | uuid fk | users.id |
| organization_id | uuid fk | organizations.id |
| default_subsidiary_id | uuid fk nullable | subsidiaries.id |
| status | text | invited, active, revoked |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Unique constraints:
- `(user_id, organization_id)`

### 5.7 user_role_assignments
Purpose: assign roles to users in tenant scope and optionally entity scope.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| user_id | uuid fk | users.id |
| role_id | uuid fk | roles.id |
| subsidiary_id | uuid fk nullable | subsidiaries.id |
| scope_json | jsonb | amount, currency, bank-account constraints |
| created_at | timestamptz | |

### 5.8 role_permissions
Purpose: map roles to permissions.

| Column | Type | Notes |
| --- | --- | --- |
| role_id | uuid fk | roles.id |
| permission_id | uuid fk | permissions.id |

Primary key:
- `(role_id, permission_id)`

### 5.9 bank_relationships
Purpose: banking partner registry.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| bank_name | text | |
| bank_code | text | SWIFT/BIC or internal code |
| region | text | |
| contact_name | text nullable | |
| contact_email | text nullable | |
| services_json | jsonb | cash mgmt, lending, FX |
| fee_structure_json | jsonb | |
| status | text | active, inactive |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.10 bank_accounts
Purpose: corporate bank account registry.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| subsidiary_id | uuid fk | subsidiaries.id |
| bank_relationship_id | uuid fk | bank_relationships.id |
| account_name | text | |
| account_number_masked | text | display-safe value |
| account_number_encrypted | bytea | encrypted sensitive value |
| iban_encrypted | bytea nullable | |
| currency_code | char(3) | |
| account_type | text | operating, payroll, sweep |
| status | text | active, pending_verification, closed |
| last_balance_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.11 counterparties
Purpose: payment and treasury counterparties.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| name | text | |
| type | text | vendor, customer, bank, affiliate |
| external_reference | text nullable | ERP reference |
| country_code | char(2) nullable | |
| default_currency_code | char(3) nullable | |
| bank_details_json | jsonb | encrypted/tokenized by app layer |
| risk_rating | text nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.12 currencies
Purpose: currency reference table.

| Column | Type | Notes |
| --- | --- | --- |
| code | char(3) pk | ISO 4217 |
| name | text | |
| decimals | integer | |
| is_active | boolean | |

### 5.13 currency_rates
Purpose: FX rates for conversion and reporting.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| base_currency_code | char(3) fk | currencies.code |
| quote_currency_code | char(3) fk | currencies.code |
| rate | numeric(20,10) | |
| source | text | market provider or bank |
| observed_at | timestamptz | |
| created_at | timestamptz | |

Indexes:
- `(base_currency_code, quote_currency_code, observed_at desc)`

### 5.14 treasury_policies
Purpose: configurable treasury business rules.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| name | text | |
| policy_type | text | approvals, liquidity, compliance |
| status | text | draft, active, retired |
| rules_json | jsonb | normalized enough for runtime evaluation |
| created_by_user_id | uuid fk | users.id |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.15 workflow_rules
Purpose: executable routing and threshold rules.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| treasury_policy_id | uuid fk nullable | treasury_policies.id |
| trigger_type | text | payment_submitted, covenant_alert |
| conditions_json | jsonb | |
| actions_json | jsonb | |
| priority | integer | |
| status | text | active, inactive |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.16 transactions
Purpose: normalized bank and ERP transaction ledger.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| bank_account_id | uuid fk nullable | bank_accounts.id |
| subsidiary_id | uuid fk nullable | subsidiaries.id |
| source_system | text | bank_api, erp, statement, manual |
| external_id | text nullable | |
| transaction_date | date | |
| value_date | date nullable | |
| direction | text | debit, credit |
| amount | numeric(20,4) | signed amount policy defined in app |
| currency_code | char(3) | |
| description | text | |
| counterparty_id | uuid fk nullable | counterparties.id |
| category | text nullable | |
| status | text | pending, booked, reversed |
| raw_payload_json | jsonb | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes:
- `(organization_id, transaction_date desc)`
- `(bank_account_id, transaction_date desc)`
- `(external_id, source_system)`

### 5.17 bank_statements
Purpose: uploaded or imported statement containers.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| bank_account_id | uuid fk nullable | bank_accounts.id |
| source_type | text | upload, api, sftp |
| format | text | pdf, csv, mt940 |
| storage_key | text | object storage pointer |
| ocr_status | text | pending, complete, failed, not_required |
| imported_at | timestamptz nullable | |
| statement_start_date | date nullable | |
| statement_end_date | date nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.18 statement_lines
Purpose: structured lines extracted from statements.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| bank_statement_id | uuid fk | bank_statements.id |
| line_number | integer | |
| transaction_date | date nullable | |
| amount | numeric(20,4) | |
| currency_code | char(3) | |
| description | text | |
| external_reference | text nullable | |
| extracted_confidence | numeric(5,2) nullable | |
| created_at | timestamptz | |

### 5.19 reconciliation_items
Purpose: map source lines to normalized transactions.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| transaction_id | uuid fk nullable | transactions.id |
| statement_line_id | uuid fk nullable | statement_lines.id |
| reconciliation_type | text | exact, suggested, manual |
| status | text | matched, unmatched, exception |
| match_score | numeric(5,2) nullable | |
| resolved_by_user_id | uuid fk nullable | users.id |
| resolved_at | timestamptz nullable | |
| created_at | timestamptz | |

### 5.20 cash_position_snapshots
Purpose: point-in-time aggregated cash state.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| snapshot_time | timestamptz | |
| reporting_currency_code | char(3) | |
| freshness_status | text | fresh, stale, partial |
| source_window_started_at | timestamptz nullable | |
| source_window_ended_at | timestamptz nullable | |
| created_at | timestamptz | |

### 5.21 cash_position_lines
Purpose: per account or entity balances within a snapshot.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| cash_position_snapshot_id | uuid fk | cash_position_snapshots.id |
| subsidiary_id | uuid fk nullable | subsidiaries.id |
| bank_account_id | uuid fk nullable | bank_accounts.id |
| currency_code | char(3) | |
| balance_amount | numeric(20,4) | |
| reporting_amount | numeric(20,4) | |
| created_at | timestamptz | |

### 5.22 cash_flow_forecasts
Purpose: forecast headers.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| name | text | |
| horizon_type | text | short_term, long_term |
| methodology | text | rules, statistical, ml |
| reporting_currency_code | char(3) | |
| status | text | draft, published, archived |
| generated_by_user_id | uuid fk nullable | users.id |
| generated_at | timestamptz nullable | |
| accuracy_score | numeric(5,2) nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.23 forecast_lines
Purpose: dated cash forecast values.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| cash_flow_forecast_id | uuid fk | cash_flow_forecasts.id |
| subsidiary_id | uuid fk nullable | subsidiaries.id |
| forecast_date | date | |
| inflow_amount | numeric(20,4) | |
| outflow_amount | numeric(20,4) | |
| net_amount | numeric(20,4) | |
| currency_code | char(3) | |
| reporting_amount | numeric(20,4) | |
| confidence_score | numeric(5,2) nullable | |

### 5.24 forecast_scenarios
Purpose: scenario metadata for forecasts and stress tests.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| cash_flow_forecast_id | uuid fk | cash_flow_forecasts.id |
| name | text | |
| scenario_type | text | baseline, downside, stress |
| assumptions_json | jsonb | |
| created_at | timestamptz | |

### 5.25 approval_workflows
Purpose: workflow definitions for approvals.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| name | text | |
| workflow_type | text | payment, policy, connector_change |
| status | text | active, inactive |
| rules_json | jsonb | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.26 approval_workflow_steps
Purpose: ordered steps in a workflow.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| approval_workflow_id | uuid fk | approval_workflows.id |
| step_order | integer | |
| approver_type | text | role, user, dynamic |
| approver_reference | text | role id, user id, or resolver key |
| threshold_json | jsonb nullable | |
| created_at | timestamptz | |

### 5.27 payments
Purpose: payment instructions and lifecycle state.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| subsidiary_id | uuid fk nullable | subsidiaries.id |
| source_bank_account_id | uuid fk | bank_accounts.id |
| counterparty_id | uuid fk | counterparties.id |
| approval_workflow_id | uuid fk nullable | approval_workflows.id |
| payment_type | text | domestic, cross_border, intercompany |
| amount | numeric(20,4) | |
| currency_code | char(3) | |
| requested_execution_date | date | |
| purpose | text nullable | |
| status | text | draft, submitted, approved, rejected, released, failed, cancelled |
| submitted_by_user_id | uuid fk nullable | users.id |
| released_at | timestamptz nullable | |
| external_payment_reference | text nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.28 payment_approvals
Purpose: approval decisions for a payment.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| payment_id | uuid fk | payments.id |
| workflow_step_id | uuid fk | approval_workflow_steps.id |
| approver_user_id | uuid fk nullable | users.id |
| decision | text | pending, approved, rejected, escalated |
| decision_reason | text nullable | |
| decided_at | timestamptz nullable | |
| step_up_verified | boolean | |
| created_at | timestamptz | |

### 5.29 electronic_signatures
Purpose: external or internal signature artifacts tied to approvals or releases.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| payment_id | uuid fk nullable | payments.id |
| signed_by_user_id | uuid fk nullable | users.id |
| provider | text | |
| signature_reference | text | provider-side id |
| status | text | pending, signed, failed |
| signed_at | timestamptz nullable | |
| created_at | timestamptz | |

### 5.30 cash_pools
Purpose: cash pool configuration.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| name | text | |
| pool_type | text | notional, physical |
| header_account_id | uuid fk nullable | bank_accounts.id |
| status | text | active, inactive |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.31 sweep_instructions
Purpose: automated movement rules for concentration and pooling.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| cash_pool_id | uuid fk nullable | cash_pools.id |
| source_bank_account_id | uuid fk | bank_accounts.id |
| destination_bank_account_id | uuid fk nullable | bank_accounts.id |
| threshold_amount | numeric(20,4) | |
| target_balance_amount | numeric(20,4) nullable | |
| currency_code | char(3) | |
| frequency | text | intraday, daily, weekly |
| status | text | active, inactive |
| created_at | timestamptz | |

### 5.32 intercompany_transactions
Purpose: inter-company loans, netting lines, and settlements.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| from_subsidiary_id | uuid fk | subsidiaries.id |
| to_subsidiary_id | uuid fk | subsidiaries.id |
| transaction_type | text | loan, netting, settlement |
| amount | numeric(20,4) | |
| currency_code | char(3) | |
| status | text | proposed, approved, settled, cancelled |
| settlement_date | date nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.33 risk_exposures
Purpose: exposure records across risk types.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| subsidiary_id | uuid fk nullable | subsidiaries.id |
| exposure_type | text | fx, interest_rate, credit |
| reference_entity_type | text | payment, debt, investment, account |
| reference_entity_id | uuid nullable | polymorphic reference |
| exposure_currency_code | char(3) nullable | |
| gross_amount | numeric(20,4) | |
| net_amount | numeric(20,4) nullable | |
| measured_at | timestamptz | |
| created_at | timestamptz | |

### 5.34 hedging_instruments
Purpose: derivative and hedge positions.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| instrument_type | text | forward, option, swap, other |
| counterparty_id | uuid fk nullable | counterparties.id |
| notional_amount | numeric(20,4) | |
| currency_pair | text nullable | |
| strike_rate | numeric(20,10) nullable | |
| maturity_date | date nullable | |
| mark_to_market_amount | numeric(20,4) nullable | |
| status | text | active, matured, closed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.35 investments
Purpose: short-term investment positions.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| subsidiary_id | uuid fk nullable | subsidiaries.id |
| instrument_name | text | |
| investment_type | text | mmf, deposit, t_bill, other |
| counterparty_id | uuid fk nullable | counterparties.id |
| principal_amount | numeric(20,4) | |
| currency_code | char(3) | |
| start_date | date | |
| maturity_date | date nullable | |
| yield_rate | numeric(10,6) nullable | |
| esg_flag | boolean | |
| status | text | active, matured, redeemed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.36 debt_facilities
Purpose: debt and credit facilities.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| lender_counterparty_id | uuid fk nullable | counterparties.id |
| facility_name | text | |
| facility_type | text | revolver, term_loan, overdraft, other |
| limit_amount | numeric(20,4) | |
| outstanding_amount | numeric(20,4) | |
| currency_code | char(3) | |
| interest_basis | text nullable | |
| start_date | date nullable | |
| maturity_date | date nullable | |
| covenant_definition_json | jsonb nullable | |
| status | text | active, matured, closed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.37 debt_schedules
Purpose: future obligations on debt facilities.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| debt_facility_id | uuid fk | debt_facilities.id |
| schedule_type | text | principal, interest, fee |
| due_date | date | |
| amount | numeric(20,4) | |
| currency_code | char(3) | |
| status | text | pending, paid, overdue |
| created_at | timestamptz | |

### 5.38 covenant_tests
Purpose: covenant monitoring snapshots.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| debt_facility_id | uuid fk | debt_facilities.id |
| test_name | text | |
| measurement_date | date | |
| actual_value | numeric(20,6) | |
| threshold_value | numeric(20,6) | |
| status | text | compliant, warning, breached |
| created_at | timestamptz | |

### 5.39 treasury_events
Purpose: treasury calendar events and reminders.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| related_entity_type | text | debt, payment, investment, covenant |
| related_entity_id | uuid nullable | |
| event_type | text | maturity, payment_due, covenant_test, alert |
| event_date | date | |
| status | text | scheduled, completed, cancelled |
| metadata_json | jsonb | |
| created_at | timestamptz | |

### 5.40 market_data
Purpose: external market information used in analytics.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| data_type | text | fx_rate, rate_curve, macro_indicator |
| symbol | text | |
| value_numeric | numeric(20,10) nullable | |
| value_json | jsonb nullable | |
| source | text | |
| observed_at | timestamptz | |
| created_at | timestamptz | |

### 5.41 compliance_reports
Purpose: generated compliance and audit reporting outputs.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| report_type | text | compliance, audit, exposure, treasury |
| period_start | date nullable | |
| period_end | date nullable | |
| status | text | pending, generated, delivered, failed |
| storage_key | text nullable | |
| created_by_user_id | uuid fk nullable | users.id |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.42 report_jobs
Purpose: asynchronous report generation jobs across standard and custom reporting.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| report_type | text | standard, custom, compliance, exposure |
| request_payload_json | jsonb | filters and format |
| status | text | queued, running, completed, failed |
| output_report_id | uuid fk nullable | compliance_reports.id or future report artifact |
| requested_by_user_id | uuid fk nullable | users.id |
| started_at | timestamptz nullable | |
| completed_at | timestamptz nullable | |
| error_summary | text nullable | |
| created_at | timestamptz | |

### 5.43 dashboards
Purpose: saved personalized dashboards.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| user_id | uuid fk nullable | users.id |
| role_id | uuid fk nullable | roles.id |
| name | text | |
| scope_type | text | personal, role, organization |
| layout_json | jsonb | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.44 dashboard_widgets
Purpose: dashboard widget configuration.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| dashboard_id | uuid fk | dashboards.id |
| widget_type | text | cash_position, forecast, approvals, alerts, risk, debt, investments |
| title | text | |
| query_json | jsonb | |
| position_json | jsonb | |
| created_at | timestamptz | |

### 5.45 notifications
Purpose: alert and messaging records.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| user_id | uuid fk | users.id |
| channel | text | in_app, email, sms, push |
| notification_type | text | payment, risk, covenant, liquidity, system |
| severity | text | info, warning, critical |
| title | text | |
| body | text | |
| status | text | queued, sent, delivered, read, failed |
| related_entity_type | text nullable | |
| related_entity_id | uuid nullable | |
| created_at | timestamptz | |
| read_at | timestamptz nullable | |

### 5.46 integration_connections
Purpose: configured external connectors.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk | organizations.id |
| integration_type | text | bank, erp, market_data, ocr, signature |
| provider_name | text | |
| status | text | active, disconnected, error, pending |
| credentials_reference | text | pointer to secrets manager |
| config_json | jsonb | |
| last_success_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.47 integration_sync_runs
Purpose: execution history of connector sync jobs.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| integration_connection_id | uuid fk | integration_connections.id |
| sync_type | text | import_accounts, import_transactions, erp_push, erp_pull, market_data_refresh |
| status | text | queued, running, succeeded, failed, partial |
| started_at | timestamptz | |
| completed_at | timestamptz nullable | |
| records_processed | integer | |
| error_summary | text nullable | |
| metadata_json | jsonb | |

### 5.48 integration_webhook_events
Purpose: store inbound webhook payloads for traceability and replay.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| integration_connection_id | uuid fk | integration_connections.id |
| event_type | text | |
| provider_event_id | text nullable | |
| payload_json | jsonb | |
| received_at | timestamptz | |
| processed_at | timestamptz nullable | |
| status | text | pending, processed, failed |

### 5.49 audit_logs
Purpose: immutable system audit trail.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| organization_id | uuid fk nullable | organizations.id |
| actor_user_id | uuid fk nullable | users.id |
| actor_type | text | user, system, integration |
| action | text | |
| entity_type | text | |
| entity_id | uuid nullable | |
| severity | text | info, warning, critical |
| ip_address | inet nullable | |
| user_agent | text nullable | |
| metadata_json | jsonb | |
| occurred_at | timestamptz | |

Indexes:
- `(organization_id, occurred_at desc)`
- `(entity_type, entity_id, occurred_at desc)`
- `(actor_user_id, occurred_at desc)`

## 6. High-Value Constraints
- Every tenant-scoped operational table should carry `organization_id` except when implied through a parent row.
- Monetary values should use `numeric`, never floating-point types.
- Sensitive identifiers such as account numbers and IBANs must be encrypted or tokenized.
- Payment, approval, policy, and audit records must never be hard-deleted.
- Integration credentials must not be stored directly in the application database.

## 7. Suggested Indexing Strategy
- Time-series indexes on transactions, snapshots, rates, sync runs, and audit logs
- Composite indexes on tenant plus business date
- Partial indexes for active payments, pending approvals, and unread notifications
- GIN indexes on selected `jsonb` columns used for policy or workflow filtering

## 8. Partitioning Recommendations
- Partition `transactions` by month or quarter for high-volume tenants
- Partition `audit_logs` by month for long retention
- Partition `market_data` by data type and time where volume justifies it

## 9. Read Models and Derived Tables
These may be physical tables or materialized views.

- `mv_current_cash_positions`
- `mv_pending_payment_approvals`
- `mv_daily_forecast_accuracy`
- `mv_exposure_summary`
- `mv_connector_health`

## 10. Schema Evolution Notes
- Start with the operational schema above in a single PostgreSQL cluster.
- Add read replicas before splitting transactional domains.
- Move heavy analytics to a warehouse only when reporting or ML workloads justify it.
