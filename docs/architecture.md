# System Architecture

## 1. Purpose
This document defines the target system architecture for the Enterprise Treasury & Cash Flow Command Center based on `SRS.md` and the generated product documentation in `/docs`.

## 2. Architecture Goals
- Provide real-time or near-real-time treasury visibility across many entities, accounts, and currencies.
- Support secure payment initiation, approval, and auditability.
- Integrate reliably with banks, ERP systems, market-data providers, and document-processing services.
- Scale from MVP scope to advanced AI, orchestration, and blockchain capabilities without re-platforming.
- Maintain strong separation between operational systems, analytical workloads, and external integration pipelines.

## 3. System Overview
### 3.1 High-Level View
The system is a modular, API-first, multi-tenant SaaS platform composed of:
- Web frontend for treasury operations, reporting, administration, and analytics
- Mobile frontend for approvals, alerts, and limited monitoring
- Backend domain services organized around treasury capabilities
- Event-driven integration layer for banks, ERP, OCR, market data, and notifications
- Relational operational database as the system of record
- Analytical and caching layers for live dashboards, forecasting, and reporting
- Identity and policy enforcement layer for authentication, authorization, and approval controls

### 3.2 Logical Architecture
```text
Users / Mobile Approvers / Admins
        |
        v
Web App / Mobile App
        |
        v
API Gateway / BFF Layer
        |
        +--> Identity & Access Service
        +--> Treasury Domain Services
        +--> Reporting & Query Services
        +--> Integration Management Service
        |
        v
Message Bus / Job Queue / Workflow Engine
        |
        +--> Bank Connectors
        +--> ERP Connectors
        +--> OCR / Statement Pipeline
        +--> Notification Dispatch
        +--> Forecasting / Risk Jobs
        |
        v
PostgreSQL + Redis + Object Storage + Analytics Store
```

### 3.3 Architectural Style
- Primary style: modular monolith at MVP, with internal service boundaries aligned to domains
- Evolution path: split high-volume or independently scaling domains into deployable services later
- Integration style: asynchronous event-driven processing for external data sync, reconciliation, forecasting, and alerting
- API style: versioned REST APIs with webhook/event support for external connectors and internal automation

## 4. Frontend Architecture
### 4.1 Clients
- Web app for full treasury operations
- Mobile app for approvals, alerts, cash snapshots, and limited workflow actions

### 4.2 Frontend Layers
- App shell and navigation
- Authentication and session layer
- Domain modules by business capability
- Shared data-access layer for API calls
- Reusable design system and component library
- State synchronization for live dashboards and notifications

### 4.3 Web Frontend Modules
- Authentication and session management
- Cash position dashboards
- Forecasting workspace
- Payments and approvals console
- Bank accounts and bank relationships
- Liquidity and inter-company workspace
- Risk, FX, and hedging dashboard
- Investments and debt management
- Reports and compliance center
- Admin, policies, and integrations console
- Custom dashboard builder
- Natural-language query surface for advanced releases

### 4.4 Frontend Design Decisions
- Use a server-rendered SPA-capable web architecture to optimize secure authenticated flows and data-heavy dashboards.
- Use route-level domain modules so large treasury screens can evolve independently.
- Use a typed API client generated from the API spec to reduce frontend-backend drift.
- Use optimistic UI only for safe, reversible interactions. Payment approvals and policy changes require server-confirmed state.
- Use websocket or server-sent event channels for live cash updates, approval inbox changes, and critical alerts.

### 4.5 Frontend Security Model
- Short-lived access token in memory
- Refresh token in secure HTTP-only cookie for web
- Device-bound refresh token for mobile
- Step-up authentication for sensitive actions such as payment approval, bank-connector changes, and policy edits
- Role- and permission-driven route guards

## 5. Backend Architecture
### 5.1 Core Backend Components
- API Gateway or edge router
- Backend-for-frontend layer for web and mobile composition
- Identity and access service
- Treasury domain services
- Workflow and policy engine
- Integration orchestration service
- Background workers for ingestion, reconciliation, forecasting, reporting, and notifications

### 5.2 Domain Service Boundaries
#### Identity and Access
- User lifecycle
- SSO and passwordless options
- MFA and biometric challenge coordination
- Role, permission, and session management

#### Organization and Administration
- Organizations, subsidiaries, legal entities
- Tenant configuration
- User-role assignment
- Feature flags and environment controls

#### Bank Connectivity and Accounts
- Bank connector registry
- Bank account onboarding
- Bank relationship metadata
- Balance and transaction sync state

#### Transaction and Statement Processing
- Transaction ingestion
- Bank statement upload and parsing
- OCR extraction pipeline
- MT940 normalization

#### Reconciliation
- Matching rules
- exception management
- reconciliation status publication

#### Cash Positioning
- Balance aggregation
- currency conversion
- entity-level and group-level cash calculations
- intraday snapshot generation

#### Forecasting and Analytics
- Forecast model execution
- scenario generation
- forecast accuracy tracking
- advanced ML inference integration

#### Payments and Approvals
- Payment draft creation
- validation and sanctions/policy hooks
- approval workflow progression
- release, rejection, cancellation, and audit trail

#### Liquidity and Inter-company
- Cash pool definitions
- sweeping instructions
- concentration and inter-company funding
- netting runs and settlements

#### Risk, FX, and Hedging
- Exposure calculation
- market data application
- hedge tracking and mark-to-market
- recommendation hooks for advanced releases

#### Investments and Debt
- Investment booking and maturity tracking
- debt facility schedules
- covenant calculations and alerts

#### Reporting and Compliance
- standard report generation
- custom report templates
- compliance evidence assembly
- audit log search

#### Notifications
- in-app, email, SMS, and push notification orchestration
- alert routing by severity and user role

#### Integrations Hub
- ERP sync orchestration
- connector credential storage
- sync jobs and retry policy
- webhook handling and ingestion monitoring

### 5.3 Internal Communication
- Synchronous communication for user-facing CRUD and queries
- Asynchronous events for:
  - bank transaction ingestion
  - statement processing
  - reconciliation completion
  - cash position recalculation
  - forecast generation
  - approval state changes
  - covenant breach alerts
  - report generation

### 5.4 Messaging and Workflow
- Queue-backed job execution for retries and backpressure
- Workflow engine for payment approvals, onboarding, covenant alerts, and policy-triggered actions
- Event topics organized by domain, for example:
  - `bank.transactions.imported`
  - `cash.position.updated`
  - `payment.submitted`
  - `payment.approved`
  - `forecast.generated`
  - `covenant.threshold.breached`

### 5.5 Caching and Read Models
- Redis for:
  - session and token metadata
  - short-lived dashboard cache
  - approval inbox cache
  - market-rate cache
- Materialized read models for:
  - consolidated cash positions
  - dashboard widgets
  - reporting snapshots

## 6. Database Architecture
### 6.1 Primary Operational Store
- PostgreSQL as the primary transactional system of record
- Multi-tenant logical isolation using `organization_id` on tenant-scoped tables
- Strong referential integrity for operational workflows such as approvals, policies, and debt tracking

### 6.2 Secondary Storage
- Redis for low-latency cache and coordination
- Object storage for:
  - uploaded bank statements
  - OCR artifacts
  - generated reports
  - exported audit packs
- Optional analytics warehouse for large historical reporting and ML feature extraction

### 6.3 Data Consistency Model
- Strong consistency for payments, approvals, policy changes, user management, and audit logs
- Eventual consistency allowed for dashboard refresh, ERP sync, market data updates, and external connector polling

## 7. Authentication Design
### 7.1 Identity Model
- Tenant-aware identity with organization-scoped membership
- Users can belong to one or more organizations if enabled by commercial configuration
- Roles map to permissions through RBAC with optional attribute checks on entity, currency, amount, and region

### 7.2 Auth Mechanisms
- OIDC/OAuth 2.1 for browser and mobile sign-in
- SAML SSO support for enterprise customers
- Password login optional for non-SSO tenants
- TOTP, email OTP, or authenticator-app MFA
- Biometric unlock on mobile as a second-factor experience layered on top of device trust

### 7.3 Authorization Model
- Coarse permissions by module, such as `payments.create` or `reports.view`
- Fine-grained policy checks for:
  - approval threshold amounts
  - subsidiary or legal-entity scope
  - currency restrictions
  - payment type restrictions
  - bank-account access restrictions

### 7.4 Step-Up Controls
- Required for payment release
- Required for bank connector credential updates
- Required for policy changes
- Required for user-role changes

### 7.5 Audit Requirements
- Every login, failed login, token refresh, approval decision, payment state transition, and policy change must be written to immutable audit logs.

## 8. Deployment Architecture
### 8.1 Runtime Topology
- CDN in front of web assets
- WAF and edge load balancer
- Containerized application workloads running in Kubernetes or equivalent managed container platform
- Managed PostgreSQL cluster
- Managed Redis
- Managed object storage
- Managed message broker or queue service
- Managed secrets store and KMS

### 8.2 Environment Layout
- Local development
- Shared development
- Staging
- Production

Each environment has isolated:
- databases
- message queues
- object storage buckets
- secrets
- third-party credentials

### 8.3 Production Layout
- Multi-AZ application deployment
- Primary database with synchronous replica or managed HA failover
- Read replicas for reporting-heavy workloads
- Queue workers deployed separately from API nodes
- Scheduled jobs isolated from interactive API traffic

### 8.4 Scalability Strategy
- Scale API nodes horizontally
- Scale background workers independently by queue type
- Scale reporting and forecast workers separately from payment-processing flows
- Split connector workers by bank or ERP volume when needed

### 8.5 Security and Compliance Controls
- TLS everywhere
- Encryption at rest for database, cache, and object storage
- KMS-backed secrets encryption
- Network segmentation between edge, app, data, and worker layers
- Private connectivity to managed data services where possible
- Immutable audit log retention policy
- Periodic key rotation and connector credential rotation

### 8.6 Observability
- Centralized logs
- Metrics for API latency, queue depth, sync failures, forecasting jobs, and payment success rate
- Distributed tracing across API, workers, and integration services
- Alerting for:
  - bank connector failures
  - ERP sync drift
  - elevated approval latency
  - failed payment releases
  - stale cash-position updates
  - covenant breach events

## 9. MVP vs Target Architecture
### 9.1 MVP
- Modular monolith backend
- Single web app and limited mobile app
- PostgreSQL, Redis, object storage
- Queue workers for integrations and reporting
- 2-3 bank connectors
- Basic ERP sync adapters

### 9.2 Target State
- Split high-throughput domains into services where justified:
  - payments
  - integrations
  - analytics and forecasting
  - reporting
- Dedicated analytics store
- richer event streaming
- advanced AI services
- optional blockchain settlement adapter

## 10. Architectural Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Bank APIs vary heavily by provider | High | Use connector abstraction, canonical banking model, retry and reconciliation tooling |
| ERP schemas differ by customer | High | Introduce mapping layer, sync rules, and connector health dashboard |
| Real-time cash data can become stale | High | Track freshness metadata and alert on stale connectors |
| Approval logic becomes unmanageable | High | Centralize workflow engine and policy rule evaluation |
| Reporting queries degrade OLTP performance | High | Use read models, replicas, and async report generation |
| Multi-entity authorization becomes error-prone | High | Enforce tenant- and entity-scoped authorization at service and query layer |
| Forecasting quality is poor early | Medium | Start with deterministic models, track accuracy, add ML after baseline data quality is stable |

## 11. Recommended Technology Direction
These are implementation recommendations, not SRS requirements.

- Frontend: React-based web app with TypeScript
- Mobile: React Native or native mobile shell for approvals and alerts
- Backend: TypeScript, Java, Go, or similar strongly typed service stack
- Database: PostgreSQL
- Cache: Redis
- Queue: managed queue or Kafka-compatible event platform depending on scale
- Object storage: S3-compatible managed storage
- Auth: OIDC provider with enterprise SAML support
