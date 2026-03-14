# Development Plan

## 1. Purpose
This document defines the implementation roadmap for the Enterprise Treasury & Cash Flow Command Center using the requirements, architecture, schema, and API docs already produced in `/docs`.

## 2. Planning Assumptions
- Delivery starts with the MVP defined in `SRS.md`.
- Implementation target is a modular monolith with strong internal domain boundaries.
- Core web application is required in MVP. Mobile can start with approval and alert flows only.
- External integrations should be abstracted behind connector interfaces from the first release.
- The plan is phase-based rather than calendar-based because team size and sprint length are not specified.

## 3. Delivery Objectives
- Ship an MVP covering real-time cash positions, forecasting, payments, approvals, multi-currency support, reporting, and 2-3 bank integrations.
- Establish a secure, auditable, tenant-aware platform foundation.
- Build domain seams that allow later addition of liquidity, risk, debt, investments, dashboard builder, and AI features.

## 4. Module Breakdown
### 4.1 Foundation Modules
| Module | Priority | Scope in Plan |
| --- | --- | --- |
| M-01 Identity and Access Management | Critical | Auth, RBAC, MFA, sessions, audit hooks |
| M-02 Organization and Entity Management | Critical | Organizations, subsidiaries, memberships, tenant scoping |
| M-13 Policy and Orchestration Engine | Critical | Approval routing and policy enforcement baseline |
| M-18 Administration and Platform Operations | Critical | Config, feature flags, operational controls |

### 4.2 MVP Operational Modules
| Module | Priority | Scope in Plan |
| --- | --- | --- |
| M-03 Bank Connectivity and Account Management | Critical | Bank relationships, accounts, bank connector abstraction |
| M-04 Transaction Ingestion and Statement Processing | Critical | Transactions, statement ingestion, MT940 baseline |
| M-05 Reconciliation Engine | Critical | Matching and exception workflow baseline |
| M-06 Cash Position Engine and Dashboard | Critical | Consolidated balances, snapshots, dashboard views |
| M-07 Forecasting and Scenario Analytics | Critical | Basic short-term and long-term forecasting |
| M-08 Payments and Approval Workflow Engine | Critical | Payment lifecycle, approval steps, release controls |
| M-14 Reporting, Audit, and Compliance | Critical | Standard reports, audit logs, compliance-ready exports |
| M-17 Integrations Hub | Critical | Connector lifecycle, sync jobs, retry and monitoring |

### 4.3 Post-MVP Core Treasury Modules
| Module | Priority | Scope in Plan |
| --- | --- | --- |
| M-09 Liquidity, Pooling, and Inter-company Management | High | Sweeps, concentration, inter-company loans, netting |
| M-10 FX, Risk, and Hedging Management | High | FX rates, exposures, hedges, market data |
| M-11 Investment Management | Medium | Short-term investment tracking |
| M-12 Debt and Covenant Management | High | Facilities, schedules, covenants, events |
| M-15 Notifications and Mobile Experience | High | Alerts, push, mobile approvals |

### 4.4 Differentiation Modules
| Module | Priority | Scope in Plan |
| --- | --- | --- |
| M-16 Dashboard Personalization and Query Interface | Medium | Dashboard builder, saved views, natural-language queries |
| M-07 Advanced Analytics extensions | Medium | AI forecasting, stress tests, digital twin |
| M-10 Advanced Risk extensions | Medium | Predictive risk, dynamic hedging |
| M-17 Advanced Integrations | Medium | Market data, OCR, blockchain, signature providers |

## 5. Development Phases
### Phase 0: Project Setup and Delivery Foundations
Goals:
- establish repo standards, environments, CI/CD, observability, coding conventions, and local tooling

Deliverables:
- application skeleton for web, backend, workers, and shared libraries
- CI pipeline for lint, tests, build, migrations
- environment configuration strategy
- secrets handling and baseline monitoring

Exit criteria:
- developers can run the app locally
- CI is green on empty baseline
- deployment path to development and staging environments exists

### Phase 1: Platform Foundation
Goals:
- implement tenant model, auth, RBAC, admin primitives, and core schema

Modules:
- M-01, M-02, M-13 baseline, M-18 baseline

Deliverables:
- organizations, subsidiaries, users, roles, permissions, memberships
- login, session management, MFA, audit logging
- policy and workflow definition scaffolding
- admin APIs and admin screens

Exit criteria:
- tenant-scoped access works end to end
- privileged mutations are audited
- platform can onboard a new organization and users

### Phase 2: Integration Backbone and Bank Master Data
Goals:
- establish integration orchestration and bank connectivity model

Modules:
- M-03, M-17

Deliverables:
- bank connector abstraction
- integration connection management
- bank relationships and bank accounts
- sync run tracking and retry behavior
- support for first bank connector end to end

Exit criteria:
- one bank can be connected in staging
- account metadata and balances can be imported
- sync failures are visible and recoverable

### Phase 3: Transactions, Statements, and Reconciliation
Goals:
- normalize external financial data into the platform

Modules:
- M-04, M-05

Deliverables:
- transaction ingestion pipeline
- statement upload flow
- MT940 parser
- reconciliation rules and exception queue
- transaction and statement APIs

Exit criteria:
- imported data lands in the canonical transaction model
- reconciliation can match a basic happy path
- unresolved items are surfaced to users

### Phase 4: Cash Positioning and Reporting MVP
Goals:
- deliver the first meaningful treasury visibility experience

Modules:
- M-06, M-14

Deliverables:
- cash snapshot generation
- dashboard for balances by account, entity, and currency
- standard reports for cash position and transaction history
- reporting jobs and download flows

Exit criteria:
- users can see a consolidated current cash position
- dashboard freshness and stale-source state are visible
- standard reports are exportable

### Phase 5: Forecasting MVP
Goals:
- produce basic short-term and long-term forecasts

Modules:
- M-07 baseline

Deliverables:
- forecast models using historical and planned transaction inputs
- forecast scenarios baseline
- accuracy tracking
- forecast APIs and screens

Exit criteria:
- forecasts can be generated for a tenant
- forecast results can be viewed and compared over time

### Phase 6: Payments and Approval Workflows MVP
Goals:
- enable secure payment initiation and controlled approval flows

Modules:
- M-08, M-13 expanded, M-14 audit coverage

Deliverables:
- payment draft, submit, approve, reject, release, cancel flows
- multi-step approval workflow execution
- step-up auth for sensitive actions
- payment audit history

Exit criteria:
- configured users can create and approve payments
- policy and threshold checks are enforced
- payment state transitions are fully audited

### Phase 7: Hardening and MVP Release Readiness
Goals:
- stabilize the MVP and complete production readiness

Modules:
- all MVP modules

Deliverables:
- role-based UAT flows
- performance tuning for dashboard, transaction lists, approvals
- security testing and remediation
- operational runbooks and alerting
- bank connector coverage extended to 2-3 major banks

Exit criteria:
- MVP requirements FR-093 to FR-100 are met
- production readiness checklist is complete
- release candidate passes regression and UAT

### Phase 8: Post-MVP Treasury Expansion
Goals:
- complete the broader treasury operating platform

Modules:
- M-09, M-10, M-11, M-12, M-15

Deliverables:
- liquidity management, sweeps, pools, inter-company transactions
- FX rates, exposures, hedges, market data
- investments, debt facilities, covenants, treasury events
- notifications and mobile approval app

Exit criteria:
- major non-MVP core treasury workflows are supported
- critical alerts and mobile approvals are operational

### Phase 9: Differentiation and Advanced Intelligence
Goals:
- add advanced analytics and differentiators after core operating stability

Modules:
- M-16 and advanced extensions to M-07, M-10, M-17

Deliverables:
- dashboard builder
- natural-language treasury query
- AI forecasting enhancements
- predictive risk analytics
- OCR enrichment, market intelligence, advanced connector ecosystem

Exit criteria:
- advanced features are isolated behind feature flags
- baseline explainability and operational monitoring exist for AI-assisted capabilities

## 6. Task List
### 6.1 Cross-Cutting Platform Tasks
- Define coding standards, branching strategy, migration process, and release policy.
- Set up CI for linting, tests, migrations, builds, and deploy previews.
- Configure structured logging, tracing, metrics, and alerting.
- Implement secrets management and environment configuration.
- Create seed data and demo organization fixtures for development and QA.

### 6.2 Backend Tasks
#### Identity, Tenant, and Admin
- Implement database migrations for organizations, subsidiaries, users, roles, permissions, and memberships.
- Build auth session flows, MFA, refresh, logout, and auth context APIs.
- Implement tenant resolution and request-scoped authorization middleware.
- Build admin APIs for users, roles, policies, and audit logs.

#### Integrations and Banking
- Define canonical bank account, transaction, and statement models.
- Implement integration connection registry and sync-run tracking.
- Build connector interface contracts and first bank adapter.
- Add support for bank relationship and account management APIs.

#### Transactions and Reconciliation
- Implement transaction ingestion workers.
- Build statement storage and parsing pipeline.
- Implement MT940 support and statement normalization.
- Build reconciliation matching logic and exception handling.

#### Cash, Forecasting, and Reporting
- Implement cash position aggregation jobs and read models.
- Build forecast generation engine and scenario persistence.
- Implement report-job queue and export pipeline.
- Create report and dashboard query APIs.

#### Payments and Policies
- Implement payment lifecycle state machine.
- Build approval workflow resolution and step progression.
- Enforce policy checks and step-up auth hooks.
- Integrate audit logging for all sensitive actions.

#### Expansion Domains
- Implement cash pools, sweep instructions, and inter-company flows.
- Implement FX rate ingestion and exposure calculation.
- Implement hedge, investment, debt, covenant, and event models.
- Implement notification dispatch and delivery tracking.

### 6.3 Frontend Tasks
- Build auth and organization switching flows.
- Build admin screens for users, roles, subsidiaries, policies, and integrations.
- Build bank account and connector management UIs.
- Build transaction, statement, and reconciliation views.
- Build cash position dashboard and reporting views.
- Build forecasting workspace.
- Build payment creation, approval inbox, and payment details screens.
- Build post-MVP screens for liquidity, risk, debt, investments, and alerts.
- Build dashboard builder and query UI in the advanced phase.

### 6.4 Data and DevOps Tasks
- Implement schema migrations and rollback process.
- Provision PostgreSQL, Redis, object storage, queue service, and secrets store.
- Configure environments and deployment manifests.
- Set up database backups, restore drills, and retention policy.
- Configure connector credential rotation and audit controls.

## 7. Dependency Plan
### 7.1 High-Level Dependencies
| Area | Depends On |
| --- | --- |
| Web and mobile auth flows | Identity foundation, session APIs |
| Tenant-scoped APIs | Organizations, memberships, RBAC |
| Bank account management | Integrations hub, organization model |
| Transaction ingestion | Bank connectivity, canonical schema |
| Reconciliation | Transactions, statements |
| Cash positions | Bank accounts, transactions, FX rates |
| Forecasting | Transactions, cash positions, optional planned-data inputs |
| Payment workflows | Users, roles, policies, bank accounts, counterparties |
| Reporting | Stable operational schema and read models |
| Liquidity management | Cash positions, bank accounts, policies |
| Risk and hedging | FX rates, market data, transactions, debt, investments |
| Debt and covenant monitoring | Counterparties, reporting, notifications |
| Dashboard builder | Stable reporting/query layer |

### 7.2 Critical Path
1. Project setup and CI/CD
2. Identity, tenant model, admin primitives
3. Integration hub and first bank connector
4. Bank accounts and transaction ingestion
5. Reconciliation and cash position aggregation
6. Reporting baseline
7. Forecasting
8. Payments and approvals
9. Hardening and release readiness

### 7.3 Dependency Rules
- Do not begin payments release logic before RBAC, policy enforcement, and audit logging exist.
- Do not treat cash positions as production-ready until data freshness and reconciliation status are exposed.
- Do not add AI features before deterministic forecasting and risk baselines are measurable.
- Do not expand connector count until the first connector lifecycle is operationally stable.

## 8. Suggested Workstreams
### Workstream A: Platform and Security
- identity
- admin
- RBAC
- policies
- audit

### Workstream B: Integrations and Data Ingestion
- connectors
- statements
- transaction normalization
- reconciliation

### Workstream C: Treasury Operations
- cash positions
- forecasts
- payments
- reporting

### Workstream D: Expansion Domains
- liquidity
- risk
- debt
- investments
- notifications

### Workstream E: UX and Product Surface
- web shell
- dashboards
- forms
- approval inbox
- mobile approvals

## 9. Testing Strategy
### 9.1 Test Pyramid
- Unit tests for business rules, policy checks, workflow transitions, parsers, and calculations
- Integration tests for database repositories, API handlers, connector adapters, and queue workers
- Contract tests for bank, ERP, OCR, and e-signature integration boundaries
- End-to-end tests for critical user journeys
- Performance and resilience tests for high-risk workflows

### 9.2 Backend Testing
- Unit test approval workflow evaluation.
- Unit test FX conversion, exposure calculations, and forecast math.
- Unit test MT940 and statement parsers.
- Integration test migrations and repository logic against a real PostgreSQL instance.
- Integration test auth, tenant scoping, and permission enforcement.
- Integration test payment lifecycle transitions and audit log creation.
- Integration test queue workers, retries, and idempotency behavior.

### 9.3 Frontend Testing
- Component tests for forms, grids, and dashboard widgets.
- Route-level tests for auth, tenant switching, and role-restricted screens.
- API mocking for frontend development and regression checks.
- End-to-end tests for:
  - organization onboarding
  - bank connection setup
  - transaction and statement review
  - cash dashboard access
  - forecast generation
  - payment creation and approval

### 9.4 Data and Integration Testing
- Connector sandbox tests for each supported bank.
- ERP sync mapping tests with representative payloads.
- OCR and statement extraction validation using curated fixture sets.
- Reconciliation accuracy tests against known datasets.
- Data freshness and lag monitoring tests for cash positions.

### 9.5 Security Testing
- Authentication and session abuse tests.
- Authorization boundary tests across tenants and subsidiaries.
- MFA and step-up auth tests for protected actions.
- Sensitive data encryption and secrets-handling verification.
- Audit trail completeness checks.
- Dependency scanning, SAST, and DAST in CI/CD.

### 9.6 Performance and Reliability Testing
- Load test cash dashboard reads and transaction list queries.
- Load test approval inbox and payment submission throughput.
- Stress test queue-backed connector ingestion.
- Run failover and restart tests for workers handling sync and report jobs.
- Verify graceful degradation when connectors or market-data feeds are stale.

### 9.7 Release Gates
- No open critical security findings.
- No open Sev-1 or Sev-2 defects in MVP workflows.
- End-to-end tests pass for onboarding, cash visibility, forecasting, and payment approval.
- Migration and rollback drills succeed in staging.
- Observability dashboards and runbooks are in place.

## 10. Definition of Done
- Code merged with review and passing CI
- Schema migration included where applicable
- Tests added or updated
- Observability hooks added for new async or critical flows
- Documentation updated for API, schema, or operational changes
- Security and authorization implications reviewed

## 11. Risks to Track During Development
- External bank API inconsistency slows connector delivery.
- Multi-tenant authorization defects create security risk.
- Reconciliation logic underperforms on real customer data.
- Forecast quality is limited by input-data quality.
- Reporting and dashboard queries can overload the transactional database.
- Approval rules become too complex without strict workflow constraints.

## 12. Recommended Delivery Order Summary
- Build the platform foundation first.
- Connect one bank and normalize data second.
- Deliver cash visibility and reporting before payments.
- Add payments only after policy, auth, and audit controls are proven.
- Expand into liquidity, risk, debt, and investments after MVP stabilization.
- Add AI, dashboard builder, and advanced integrations only after core treasury operations are reliable.
