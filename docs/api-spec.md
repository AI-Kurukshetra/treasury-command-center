# API Specification

## 1. API Overview
The platform exposes versioned REST APIs under `/api/v1`. The API is organized by domain, follows tenant-aware access control, and supports synchronous CRUD plus asynchronous workflows through job submission, webhooks, and event-driven processing.

## 2. API Design Principles
- Resource-oriented REST endpoints
- JSON request and response bodies
- UTC timestamps in ISO 8601 format
- Idempotency support for payment creation and integration-triggering endpoints
- Consistent pagination, filtering, and sorting
- Role- and policy-based authorization on every endpoint
- Audit logging for sensitive mutations

## 3. Cross-Cutting Conventions
### 3.1 Headers
- `Authorization: Bearer <access-token>`
- `X-Organization-Id: <uuid>` for explicit tenant scoping when required
- `Idempotency-Key: <uuid>` for payment submission, connector actions, and report generation
- `X-Request-Id: <uuid>` optional client trace id

### 3.2 Common Query Parameters
- `page`
- `page_size`
- `sort`
- `order`
- `from`
- `to`
- `status`
- `subsidiary_id`
- `bank_account_id`
- `currency_code`

### 3.3 Standard Response Envelope
```json
{
  "data": {},
  "meta": {
    "request_id": "uuid",
    "page": 1,
    "page_size": 50,
    "total": 120
  },
  "errors": []
}
```

### 3.4 Error Shape
```json
{
  "data": null,
  "meta": {
    "request_id": "uuid"
  },
  "errors": [
    {
      "code": "PAYMENT_POLICY_VIOLATION",
      "message": "Payment exceeds the configured approval threshold.",
      "field": "amount"
    }
  ]
}
```

## 4. Authentication Design
### 4.1 Auth Flow
- Browser and mobile clients authenticate through OIDC.
- The API issues short-lived access tokens and refresh tokens.
- Enterprise tenants may federate through SAML via the identity provider.
- Step-up MFA is required for sensitive actions.

### 4.2 Token Model
- Access token: JWT, 5-15 minute lifetime
- Refresh token: opaque or JWT, rotated on use
- Claims:
  - `sub`
  - `org_ids`
  - `roles`
  - `permissions`
  - `amr`
  - `session_id`

### 4.3 Auth Endpoints
#### `POST /api/v1/auth/login`
Initiates username/password or delegated auth flow.

#### `POST /api/v1/auth/sso/start`
Starts SSO flow for OIDC or SAML tenant login.

#### `POST /api/v1/auth/mfa/verify`
Verifies MFA challenge.

#### `POST /api/v1/auth/refresh`
Rotates refresh token and issues new access token.

#### `POST /api/v1/auth/logout`
Revokes current session.

#### `GET /api/v1/auth/me`
Returns current user, memberships, permissions, and active organization context.

## 5. Authorization Model
- RBAC enforced using `roles` and `permissions`
- ABAC overlays for:
  - amount thresholds
  - subsidiary scope
  - currency scope
  - bank-account scope
  - workflow-specific approval routing

Example permissions:
- `cash_positions.view`
- `forecasts.manage`
- `payments.create`
- `payments.approve`
- `reports.generate`
- `integrations.manage`
- `admin.users.manage`

## 6. API Domains
### 6.1 `/auth`
Purpose: authentication, session management, and current-user context.

Endpoints:
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/sso/start`
- `POST /api/v1/auth/mfa/verify`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### 6.2 `/admin`
Purpose: organizations, users, roles, permissions, policies, and platform administration.

Endpoints:
- `GET /api/v1/admin/organizations/:organizationId`
- `PATCH /api/v1/admin/organizations/:organizationId`
- `GET /api/v1/admin/subsidiaries`
- `POST /api/v1/admin/subsidiaries`
- `PATCH /api/v1/admin/subsidiaries/:subsidiaryId`
- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:userId`
- `GET /api/v1/admin/roles`
- `POST /api/v1/admin/roles`
- `PATCH /api/v1/admin/roles/:roleId`
- `POST /api/v1/admin/users/:userId/role-assignments`
- `GET /api/v1/admin/permissions`
- `GET /api/v1/admin/policies`
- `POST /api/v1/admin/policies`
- `PATCH /api/v1/admin/policies/:policyId`
- `GET /api/v1/admin/audit-logs`

### 6.3 `/accounts`
Purpose: bank accounts and bank relationships.

Endpoints:
- `GET /api/v1/accounts/bank-relationships`
- `POST /api/v1/accounts/bank-relationships`
- `PATCH /api/v1/accounts/bank-relationships/:relationshipId`
- `GET /api/v1/accounts/counterparties`
- `POST /api/v1/accounts/counterparties`
- `PATCH /api/v1/accounts/counterparties/:counterpartyId`
- `GET /api/v1/accounts`
- `POST /api/v1/accounts`
- `GET /api/v1/accounts/:accountId`
- `PATCH /api/v1/accounts/:accountId`
- `GET /api/v1/accounts/:accountId/balances`
- `GET /api/v1/accounts/:accountId/transactions`
- `GET /api/v1/accounts/cash-pools`
- `POST /api/v1/accounts/cash-pools`
- `PATCH /api/v1/accounts/cash-pools/:cashPoolId`
- `GET /api/v1/accounts/sweep-instructions`
- `POST /api/v1/accounts/sweep-instructions`
- `PATCH /api/v1/accounts/sweep-instructions/:instructionId`

### 6.4 `/transactions`
Purpose: transaction ledger, statements, and reconciliation.

Endpoints:
- `GET /api/v1/transactions`
- `GET /api/v1/transactions/:transactionId`
- `POST /api/v1/transactions/imports`
- `GET /api/v1/transactions/statements`
- `POST /api/v1/transactions/statements`
- `GET /api/v1/transactions/statements/:statementId`
- `GET /api/v1/transactions/statements/:statementId/lines`
- `POST /api/v1/transactions/reconciliations/run`
- `GET /api/v1/transactions/reconciliations`
- `PATCH /api/v1/transactions/reconciliations/:reconciliationId`

### 6.5 `/cash-positions`
Purpose: consolidated cash visibility.

Endpoints:
- `GET /api/v1/cash-positions/current`
- `GET /api/v1/cash-positions/snapshots`
- `GET /api/v1/cash-positions/snapshots/:snapshotId`
- `POST /api/v1/cash-positions/recalculate`

Example response:
```json
{
  "data": {
    "snapshot_id": "uuid",
    "snapshot_time": "2026-03-14T10:00:00Z",
    "reporting_currency_code": "USD",
    "freshness_status": "fresh",
    "totals": {
      "reporting_amount": "12450000.25"
    },
    "lines": [
      {
        "subsidiary_id": "uuid",
        "bank_account_id": "uuid",
        "currency_code": "EUR",
        "balance_amount": "210000.00",
        "reporting_amount": "228600.00"
      }
    ]
  },
  "meta": {
    "request_id": "uuid"
  },
  "errors": []
}
```

### 6.6 `/forecasts`
Purpose: forecast generation, scenarios, and accuracy.

Endpoints:
- `GET /api/v1/forecasts`
- `POST /api/v1/forecasts`
- `GET /api/v1/forecasts/:forecastId`
- `PATCH /api/v1/forecasts/:forecastId`
- `POST /api/v1/forecasts/:forecastId/generate`
- `POST /api/v1/forecasts/:forecastId/scenarios`
- `GET /api/v1/forecasts/:forecastId/accuracy`

### 6.7 `/payments`
Purpose: payment lifecycle.

Endpoints:
- `GET /api/v1/payments`
- `POST /api/v1/payments`
- `GET /api/v1/payments/:paymentId`
- `PATCH /api/v1/payments/:paymentId`
- `POST /api/v1/payments/:paymentId/submit`
- `POST /api/v1/payments/:paymentId/release`
- `POST /api/v1/payments/:paymentId/cancel`
- `GET /api/v1/payments/intercompany`
- `POST /api/v1/payments/intercompany`
- `POST /api/v1/payments/netting-runs`
- `GET /api/v1/payments/netting-runs/:nettingRunId`

Example create request:
```json
{
  "source_bank_account_id": "uuid",
  "counterparty_id": "uuid",
  "payment_type": "cross_border",
  "amount": "50000.00",
  "currency_code": "USD",
  "requested_execution_date": "2026-03-20",
  "purpose": "Supplier settlement"
}
```

### 6.8 `/approvals`
Purpose: workflow definitions and approval actions.

Endpoints:
- `GET /api/v1/approvals/workflows`
- `POST /api/v1/approvals/workflows`
- `PATCH /api/v1/approvals/workflows/:workflowId`
- `GET /api/v1/approvals/inbox`
- `POST /api/v1/approvals/:approvalId/approve`
- `POST /api/v1/approvals/:approvalId/reject`
- `POST /api/v1/approvals/:approvalId/escalate`

Example approval action:
```json
{
  "decision_reason": "Approved within treasury policy",
  "step_up_token": "challenge-token"
}
```

### 6.9 `/reports`
Purpose: standard and custom report generation.

Endpoints:
- `GET /api/v1/reports/catalog`
- `POST /api/v1/reports/generate`
- `GET /api/v1/reports/jobs/:jobId`
- `GET /api/v1/reports/:reportId/download`
- `GET /api/v1/reports/compliance`
- `GET /api/v1/reports/dashboards`
- `POST /api/v1/reports/dashboards`
- `PATCH /api/v1/reports/dashboards/:dashboardId`
- `GET /api/v1/reports/dashboards/:dashboardId/widgets`
- `POST /api/v1/reports/query`

### 6.10 `/risk`
Purpose: exposures, market intelligence, and hedging analytics.

Endpoints:
- `GET /api/v1/risk/exposures`
- `POST /api/v1/risk/exposures/recalculate`
- `GET /api/v1/risk/market-data`
- `GET /api/v1/risk/hedges`
- `POST /api/v1/risk/hedges`
- `PATCH /api/v1/risk/hedges/:hedgeId`
- `GET /api/v1/risk/recommendations`

### 6.11 `/investments`
Purpose: investment lifecycle and reporting.

Endpoints:
- `GET /api/v1/investments`
- `POST /api/v1/investments`
- `GET /api/v1/investments/:investmentId`
- `PATCH /api/v1/investments/:investmentId`

### 6.12 `/debt`
Purpose: debt facilities, schedules, covenants, and treasury events.

Endpoints:
- `GET /api/v1/debt/facilities`
- `POST /api/v1/debt/facilities`
- `GET /api/v1/debt/facilities/:facilityId`
- `PATCH /api/v1/debt/facilities/:facilityId`
- `GET /api/v1/debt/facilities/:facilityId/schedules`
- `GET /api/v1/debt/facilities/:facilityId/covenants`
- `POST /api/v1/debt/facilities/:facilityId/covenants/recalculate`
- `GET /api/v1/debt/events`

### 6.13 `/fx`
Purpose: rates and FX utilities.

Endpoints:
- `GET /api/v1/fx/rates`
- `POST /api/v1/fx/rates/import`
- `POST /api/v1/fx/convert`

### 6.14 `/integrations`
Purpose: connector lifecycle and sync operations.

Endpoints:
- `GET /api/v1/integrations`
- `POST /api/v1/integrations`
- `GET /api/v1/integrations/:connectionId`
- `PATCH /api/v1/integrations/:connectionId`
- `POST /api/v1/integrations/:connectionId/test`
- `POST /api/v1/integrations/:connectionId/sync`
- `GET /api/v1/integrations/:connectionId/sync-runs`
- `POST /api/v1/integrations/webhooks/:provider`

### 6.15 `/notifications`
Purpose: user alerts and messaging.

Endpoints:
- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:notificationId/read`
- `POST /api/v1/notifications/preferences`
- `GET /api/v1/notifications/stream`

## 7. Capability-to-API Mapping
| Capability | Primary Endpoints |
| --- | --- |
| Authentication and session | `/auth/*` |
| User, role, and policy administration | `/admin/*` |
| Bank account and relationship management | `/accounts/*` |
| Counterparty management | `/accounts/counterparties*` |
| Transaction ingestion and reconciliation | `/transactions/*` |
| Cash positions | `/cash-positions/*` |
| Forecasting and scenarios | `/forecasts/*` |
| Payments and approvals | `/payments/*`, `/approvals/*` |
| Liquidity, cash pools, sweeps, intercompany netting | `/accounts/cash-pools*`, `/accounts/sweep-instructions*`, `/payments/intercompany*`, `/payments/netting-runs*` |
| Risk, FX, and hedging | `/risk/*`, `/fx/*` |
| Investments | `/investments/*` |
| Debt and covenants | `/debt/*` |
| Reporting and dashboard builder | `/reports/*` |
| Integrations | `/integrations/*` |
| Notifications and alerts | `/notifications/*` |

## 8. Domain Resource Shapes
### 7.1 Payment Resource
```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "subsidiary_id": "uuid",
  "source_bank_account_id": "uuid",
  "counterparty_id": "uuid",
  "payment_type": "domestic",
  "amount": "10000.00",
  "currency_code": "USD",
  "requested_execution_date": "2026-03-20",
  "status": "submitted",
  "approval_workflow_id": "uuid",
  "submitted_by_user_id": "uuid",
  "released_at": null,
  "created_at": "2026-03-14T10:00:00Z",
  "updated_at": "2026-03-14T10:05:00Z"
}
```

### 7.2 Forecast Resource
```json
{
  "id": "uuid",
  "name": "13-week forecast",
  "horizon_type": "short_term",
  "methodology": "rules",
  "reporting_currency_code": "USD",
  "status": "published",
  "accuracy_score": "92.40"
}
```

### 7.3 Debt Facility Resource
```json
{
  "id": "uuid",
  "facility_name": "Revolving Credit Facility",
  "facility_type": "revolver",
  "limit_amount": "25000000.00",
  "outstanding_amount": "10000000.00",
  "currency_code": "USD",
  "maturity_date": "2028-06-30",
  "status": "active"
}
```

## 9. Workflow-Specific API Behavior
### 8.1 Payment Submission
1. Client creates draft via `POST /payments`
2. Client submits via `POST /payments/:paymentId/submit`
3. API validates policy and resolves approval workflow
4. Approval tasks are created
5. Notification events are dispatched

### 8.2 Approval Decision
1. Approver fetches inbox via `GET /approvals/inbox`
2. Approver completes step-up auth if required
3. Approver calls approve, reject, or escalate endpoint
4. Workflow state advances
5. Payment status updates and audit log entry is written

### 8.3 Connector Sync
1. Admin configures connector via `POST /integrations`
2. Admin triggers test or sync
3. API enqueues sync run
4. Worker processes connector job
5. Results available via sync-runs endpoint

### 9.4 Custom Dashboard Query
1. User creates a dashboard via `POST /reports/dashboards`
2. User adds or updates widgets using dashboard endpoints
3. Widget queries resolve against read models and tenant-scoped filters
4. Optional natural-language query is sent to `POST /reports/query`
5. Response may return structured answers, metrics, and suggested drill-down links

## 10. Webhooks
### 9.1 Inbound Webhooks
Supported for:
- bank transaction availability notifications
- ERP sync callbacks
- OCR completion callbacks
- e-signature completion

Requirements:
- HMAC signature verification
- replay protection
- provider event id deduplication
- asynchronous processing after receipt

### 9.2 Outbound Webhooks
Optional for enterprise customers:
- payment status change
- approval decision
- connector failure
- covenant alert

## 11. Non-Functional API Requirements
- Median read latency should remain low enough for dashboard interactivity.
- Long-running operations such as report generation, forecast generation, large sync jobs, and netting runs should return async job references rather than block request threads.
- Sensitive endpoints must enforce step-up auth and full audit logging.
- Public webhook endpoints must be isolated from user session auth and secured via signed requests.

## 12. Versioning Strategy
- Base path versioning: `/api/v1`
- Backward-compatible additions allowed within a version
- Breaking changes require `/api/v2`

## 13. OpenAPI Recommendation
The implementation should generate an OpenAPI 3.1 document from the source API contracts so frontend clients, partner integrations, and test suites can share one canonical spec.
