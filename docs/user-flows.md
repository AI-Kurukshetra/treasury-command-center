# User Flows

## 1. User Roles
| Role | Type | Primary Goals |
| --- | --- | --- |
| CFO | Explicit | Review liquidity, risk, and enterprise-level treasury performance |
| Treasurer | Explicit | Operate treasury functions, approve strategy, manage liquidity and risk |
| Treasury Manager | Derived | Oversee daily cash, policies, and workflows |
| Treasury Analyst | Derived | Analyze positions, forecasts, reports, and exposures |
| Cash Manager | Derived | Manage accounts, balances, pooling, and concentration |
| Payment Initiator | Derived | Create and submit payments |
| Payment Approver | Derived | Review and authorize payments |
| Risk Manager | Derived | Monitor exposures and hedge strategies |
| Investment Manager | Derived | Manage short-term investments |
| Debt Manager | Derived | Track debt facilities, schedules, and covenants |
| Compliance/Audit User | Derived | Review compliance reports and audit evidence |
| Bank Relationship Manager | Derived | Maintain banking partner data and fee intelligence |
| Subsidiary Finance User | Derived | Provide entity-level cash data and participate in netting/liquidity workflows |
| System Administrator | Derived | Manage users, roles, integrations, and policies |
| Integration Administrator | Derived | Configure ERP and bank connectivity |
| Mobile Approver | Derived | Take urgent approval and alert actions on mobile |

## 2. Workflow Catalog
- WF-01: Onboard organization, subsidiaries, users, and roles
- WF-02: Connect banks and ingest account data
- WF-03: Import statements and reconcile transactions
- WF-04: Monitor real-time cash position
- WF-05: Build and review cash forecasts
- WF-06: Initiate and approve payments
- WF-07: Execute liquidity management and inter-company actions
- WF-08: Monitor risk, FX, and hedging exposures
- WF-09: Manage investments
- WF-10: Manage debt facilities and covenant monitoring
- WF-11: Produce treasury, exposure, and compliance reports
- WF-12: Configure treasury policies and workflow rules
- WF-13: Review alerts and take mobile actions
- WF-14: Personalize dashboards and query the platform

## 3. Detailed Flows
### WF-01: Onboard Organization, Subsidiaries, Users, and Roles
Primary actors: System Administrator, Integration Administrator
1. Create the organization and legal-entity structure.
2. Configure users and assign role-based permissions.
3. Define currencies, treasury policies, and approval rules.
4. Configure ERP and bank integration credentials.
5. Verify that users can access the modules relevant to their roles.

### WF-02: Connect Banks and Ingest Account Data
Primary actors: Integration Administrator, Cash Manager
1. Select supported bank connectors.
2. Authenticate and establish direct API connectivity with each bank.
3. Import bank accounts, balances, and transactions.
4. Map accounts to organizations, subsidiaries, and currencies.
5. Schedule or trigger ongoing refresh for live cash visibility.

### WF-03: Import Statements and Reconcile Transactions
Primary actors: Cash Manager, Treasury Analyst
1. Upload or receive bank statements, including MT940 files.
2. Run OCR and AI extraction on statement content when needed.
3. Match statement lines against imported or ERP-originated transactions.
4. Flag exceptions for manual review.
5. Confirm reconciled balances and update audit history.

### WF-04: Monitor Real-time Cash Position
Primary actors: Treasurer, CFO, Treasury Analyst
1. Open the cash position dashboard.
2. View balances consolidated by bank, account, entity, and currency.
3. Apply filters or dashboard widgets for specific subsidiaries or exposures.
4. Review live updates and currency conversions.
5. Drill into underlying transactions and reconciliation status as needed.

### WF-05: Build and Review Cash Forecasts
Primary actors: Treasury Analyst, Treasurer
1. Pull historical transactions and planned cash movements.
2. Generate short-term and long-term forecasts.
3. Compare projected cash with current positions and policy limits.
4. Review forecast scenarios, assumptions, and external-factor impacts where available.
5. Publish forecasts and monitor forecast accuracy over time.

### WF-06: Initiate and Approve Payments
Primary actors: Payment Initiator, Payment Approver, Mobile Approver
1. Create a payment instruction.
2. Validate currency, bank account, counterparty, and policy requirements.
3. Route the payment through a configurable multi-level approval workflow.
4. Capture electronic signatures where required.
5. Approvers review, approve, reject, or escalate.
6. Release the payment and record full audit history.
7. Send alerts for exceptions or urgent approvals, including mobile notifications.

### WF-07: Execute Liquidity Management and Inter-company Actions
Primary actors: Treasurer, Cash Manager, Subsidiary Finance User
1. Review surplus and deficit positions across entities.
2. Trigger or schedule sweeping, concentration, or pooling actions.
3. Record inter-company loans where funding is reallocated.
4. Run inter-company netting to reduce settlement volume.
5. Execute settlements and update entity balances.

### WF-08: Monitor Risk, FX, and Hedging Exposures
Primary actors: Risk Manager, Treasurer
1. Aggregate FX, interest-rate, and credit exposures.
2. View mark-to-market valuation of hedge instruments.
3. Monitor market data and risk thresholds.
4. Review predictive warnings for volatility, liquidity stress, or breach risk.
5. Decide whether to execute, adjust, or recommend hedging actions.

### WF-09: Manage Investments
Primary actors: Investment Manager, Treasurer
1. Register available cash for short-term investment.
2. Track placements into money market funds, deposits, or equivalent instruments.
3. Monitor maturities, returns, and compliance constraints.
4. Report investment exposure alongside cash and risk positions.

### WF-10: Manage Debt Facilities and Covenant Monitoring
Primary actors: Debt Manager, Treasurer, Compliance/Audit User
1. Register debt facilities, credit lines, repayment schedules, and covenants.
2. Track balances, maturities, and debt-service obligations.
3. Continuously monitor covenant ratios where advanced capability is enabled.
4. Raise alerts when ratios approach breach levels.
5. Record evidence for compliance reporting.

### WF-11: Produce Treasury, Exposure, and Compliance Reports
Primary actors: Treasurer, CFO, Compliance/Audit User
1. Select a standard report or build a custom report.
2. Choose scope by time period, entity, account, currency, or exposure type.
3. Generate cash position, exposure, compliance, debt, or investment views.
4. Export or distribute reports to stakeholders.
5. Preserve report outputs and supporting audit data.

### WF-12: Configure Treasury Policies and Workflow Rules
Primary actors: System Administrator, Treasurer
1. Define policy limits, approval thresholds, and automated actions.
2. Configure workflow routing by entity, amount, bank, currency, or risk condition.
3. Apply policies to payments, liquidity operations, and compliance checks.
4. Review policy changes in the audit log.

### WF-13: Review Alerts and Take Mobile Actions
Primary actors: Mobile Approver, Treasurer, Risk Manager
1. Receive alert for a critical payment, risk threshold, covenant issue, or liquidity event.
2. Open the mobile treasury app.
3. Authenticate using supported biometric controls.
4. Review the underlying context.
5. Approve, reject, escalate, or acknowledge the item.

### WF-14: Personalize Dashboards and Query the Platform
Primary actors: Treasurer, Treasury Analyst, CFO
1. Create or edit a personalized dashboard using drag-and-drop widgets.
2. Save views by role, entity, or treasury topic.
3. Optionally ask natural-language questions about exposures, balances, or forecasts.
4. Review system-generated insights and market context.

## 4. External Actor Flows
- Bank partner systems provide balances, transactions, and payment connectivity.
- ERP systems exchange master data and transaction data bi-directionally.
- Market-data providers supply rates, currencies, and economic indicators.
- OCR/document services convert statements into structured transaction data.
- Blockchain or smart-contract networks enable advanced settlement workflows.

## 5. Workflow Coverage Notes
- Every workflow is mapped to at least one core or advanced SRS feature.
- Supporting flows for auth, notifications, admin, and reconciliation are included because the SRS explicitly names the API groups or capabilities needed to operate the platform.
