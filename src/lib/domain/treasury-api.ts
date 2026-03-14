/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

import { ApiError } from "@/lib/api/errors";
import type { AppSession } from "@/lib/auth";
import { getAppSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
type TreasuryApiContext = {
  organizationId: string;
  userId: string;
  session: AppSession;
  supabase: SupabaseClient;
};
type JsonRecord = Record<string, unknown>;
type FxRateRow = {
  base_currency_code: string;
  quote_currency_code: string;
  rate: number | string;
};

const isoCurrency = z.string().trim().length(3).transform((value) => value.toUpperCase());
const shortText = (label: string) => z.string().trim().min(1, `${label} is required.`);
const numericValue = (label: string) => z.coerce.number().finite(`${label} must be numeric.`);
const optionalUuid = z.string().uuid().optional();

const accountCreateSchema = z.discriminatedUnion("recordType", [
  z.object({
    recordType: z.literal("bank_relationship"),
    bankName: shortText("Bank name"),
    bankCode: z.string().trim().optional(),
    region: z.string().trim().optional()
  }),
  z.object({
    recordType: z.literal("bank_account"),
    accountName: shortText("Account name"),
    maskedNumber: shortText("Masked number"),
    currencyCode: isoCurrency,
    subsidiaryId: optionalUuid,
    bankRelationshipId: optionalUuid
  }),
  z.object({
    recordType: z.literal("counterparty"),
    name: shortText("Counterparty name"),
    type: z.enum(["vendor", "bank", "customer", "intercompany"]).default("vendor"),
    countryCode: z.string().trim().length(2).optional(),
    defaultCurrencyCode: isoCurrency.optional()
  })
]);

const transactionCreateSchema = z.discriminatedUnion("recordType", [
  z.object({
    recordType: z.literal("transaction"),
    bankAccountId: optionalUuid,
    subsidiaryId: optionalUuid,
    sourceSystem: shortText("Source system"),
    transactionDate: shortText("Transaction date"),
    valueDate: z.string().trim().optional(),
    direction: z.enum(["debit", "credit"]),
    amount: numericValue("Amount").positive(),
    currencyCode: isoCurrency,
    description: shortText("Description")
  }),
  z.object({
    recordType: z.literal("statement_import"),
    bankAccountId: optionalUuid,
    fileName: shortText("File name"),
    statementDate: shortText("Statement date"),
    sourceType: z.enum(["mt940", "ocr", "api"]).default("mt940")
  }),
  z.object({
    recordType: z.literal("reconciliation"),
    bankAccountId: optionalUuid,
    runDate: shortText("Run date")
  })
]);

const cashPositionCreateSchema = z.object({
  reportingCurrencyCode: isoCurrency.default("USD"),
  refreshFromTransactions: z.boolean().default(true),
  freshnessStatus: z.enum(["fresh", "stale", "partial"]).default("fresh")
});

const forecastCreateSchema = z.object({
  name: shortText("Forecast name"),
  horizonType: z.enum(["short_term", "long_term"]).default("short_term"),
  methodology: z.enum(["rules", "historical", "scenario"]).default("historical"),
  reportingCurrencyCode: isoCurrency.default("USD"),
  weeks: z.coerce.number().int().min(1).max(13).default(6),
  scenarioName: z.string().trim().optional()
});

const paymentCreateSchema = z.object({
  beneficiaryName: shortText("Beneficiary name"),
  amount: numericValue("Amount").positive(),
  currencyCode: isoCurrency,
  requestedExecutionDate: shortText("Requested execution date"),
  purpose: z.string().trim().optional(),
  paymentType: z.enum(["domestic", "international", "intercompany"]).default("domestic"),
  subsidiaryId: optionalUuid,
  sourceBankAccountId: optionalUuid,
  approvalWorkflowId: optionalUuid
});

const approvalDecisionSchema = z.object({
  paymentId: z.string().uuid(),
  decision: z.enum(["approved", "rejected", "escalated"]),
  reason: z.string().trim().optional(),
  stepUpVerified: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((value) => value === true || value === "true")
    .default(false),
  createSignature: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((value) => value === true || value === "true")
    .default(false)
});

const riskCreateSchema = z.discriminatedUnion("recordType", [
  z.object({
    recordType: z.literal("exposure"),
    exposureType: z.enum(["fx", "interest_rate", "credit"]).default("fx"),
    referenceEntityType: shortText("Reference entity type"),
    referenceEntityId: optionalUuid,
    exposureCurrencyCode: isoCurrency.optional(),
    grossAmount: numericValue("Gross amount"),
    netAmount: numericValue("Net amount").optional(),
    subsidiaryId: optionalUuid
  }),
  z.object({
    recordType: z.literal("hedge"),
    instrumentType: z.enum(["fx_forward", "option", "swap"]),
    currencyCode: isoCurrency,
    notionalAmount: numericValue("Notional amount").positive(),
    mtmAmount: numericValue("Mark to market").default(0),
    maturityDate: z.string().trim().optional(),
    counterpartyId: optionalUuid,
    exposureId: optionalUuid
  }),
  z.object({
    recordType: z.literal("market_data"),
    providerName: shortText("Provider name"),
    instrumentType: shortText("Instrument type"),
    symbol: shortText("Symbol"),
    valueNumeric: numericValue("Value"),
    observedAt: z.string().trim().optional()
  })
]);

const investmentCreateSchema = z.object({
  instrumentName: shortText("Instrument name"),
  investmentType: z.enum(["money_market", "deposit", "commercial_paper"]).default("money_market"),
  principalAmount: numericValue("Principal amount").positive(),
  currentValue: numericValue("Current value").optional(),
  currencyCode: isoCurrency,
  maturityDate: z.string().trim().optional(),
  counterpartyId: optionalUuid,
  esgLabel: z.string().trim().optional()
});

const debtCreateSchema = z.discriminatedUnion("recordType", [
  z.object({
    recordType: z.literal("facility"),
    lenderName: shortText("Lender name"),
    facilityType: z.enum(["revolver", "term_loan", "overdraft"]).default("revolver"),
    currencyCode: isoCurrency,
    committedAmount: numericValue("Committed amount").positive(),
    drawnAmount: numericValue("Drawn amount").min(0).default(0),
    maturityDate: z.string().trim().optional(),
    covenantSummary: z.string().trim().optional()
  }),
  z.object({
    recordType: z.literal("covenant_test"),
    debtFacilityId: z.string().uuid(),
    metricName: shortText("Metric name"),
    thresholdValue: numericValue("Threshold value"),
    actualValue: numericValue("Actual value"),
    testDate: shortText("Test date")
  }),
  z.object({
    recordType: z.literal("event"),
    eventType: z.enum(["maturity", "covenant_test", "payment_due", "calendar"]).default("calendar"),
    title: shortText("Event title"),
    dueDate: shortText("Due date"),
    relatedEntityType: z.string().trim().optional(),
    relatedEntityId: optionalUuid
  })
]);

const fxCreateSchema = z.object({
  baseCurrencyCode: isoCurrency,
  quoteCurrencyCode: isoCurrency,
  rate: numericValue("Rate").positive(),
  source: shortText("Source"),
  observedAt: z.string().trim().optional()
});

const integrationCreateSchema = z.discriminatedUnion("recordType", [
  z.object({
    recordType: z.literal("connection"),
    integrationType: z.enum(["erp", "bank", "market_data", "ocr", "signature"]),
    providerName: shortText("Provider name"),
    credentialsReference: z.string().trim().optional()
  }),
  z.object({
    recordType: z.literal("sync_run"),
    integrationConnectionId: z.string().uuid(),
    syncType: shortText("Sync type"),
    metadataJson: z.record(z.string(), z.unknown()).default({})
  })
]);

const adminCreateSchema = z.discriminatedUnion("recordType", [
  z.object({
    recordType: z.literal("role"),
    name: shortText("Role name"),
    description: z.string().trim().optional()
  }),
  z.object({
    recordType: z.literal("policy"),
    name: shortText("Policy name"),
    policyType: z.enum(["approval", "liquidity", "risk", "security"]),
    policyJson: z.record(z.string(), z.unknown()).default({})
  }),
  z.object({
    recordType: z.literal("setting"),
    category: shortText("Category"),
    settingKey: shortText("Setting key"),
    settingValueJson: z.record(z.string(), z.unknown()).default({})
  }),
  z.object({
    recordType: z.literal("workflow"),
    name: shortText("Workflow name"),
    workflowType: shortText("Workflow type"),
    approverReference: shortText("Approver reference"),
    thresholdAmount: numericValue("Threshold amount").min(0).default(0)
  })
]);

const dashboardCreateSchema = z.discriminatedUnion("recordType", [
  z.object({
    recordType: z.literal("dashboard"),
    name: shortText("Dashboard name"),
    isDefault: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((value) => value === true || value === "true")
      .default(false),
    layoutJson: z.record(z.string(), z.unknown()).default({})
  }),
  z.object({
    recordType: z.literal("widget"),
    widgetType: shortText("Widget type"),
    title: shortText("Widget title"),
    dashboardId: z.string().uuid().optional(),
    configJson: z.record(z.string(), z.unknown()).default({}),
    positionIndex: z.coerce.number().int().min(0).default(0)
  })
]);

const queryCreateSchema = z.object({
  title: z.string().trim().optional(),
  promptText: shortText("Prompt")
});

const reportCreateSchema = z.object({
  reportType: shortText("Report type"),
  periodStart: z.string().trim().optional(),
  periodEnd: z.string().trim().optional()
});

const liquidityCreateSchema = z.object({
  lenderSubsidiaryId: optionalUuid,
  borrowerSubsidiaryId: optionalUuid,
  currencyCode: isoCurrency,
  principalAmount: numericValue("Principal amount").positive(),
  interestRateBps: z.coerce.number().int().min(0).default(0),
  maturityDate: z.string().trim().optional()
});

const notificationCreateSchema = z.discriminatedUnion("recordType", [
  z.object({
    recordType: z.literal("notification"),
    title: shortText("Title"),
    body: shortText("Body"),
    severity: z.enum(["info", "warning", "critical"]).default("info")
  }),
  z.object({
    recordType: z.literal("mobile_device"),
    deviceLabel: shortText("Device label"),
    platform: shortText("Platform"),
    biometricEnabled: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((value) => value === true || value === "true")
      .default(false)
  })
]);

export async function getAccountsPayload() {
  const context = await getTreasuryApiContext();
  const [accounts, bankRelationships, counterparties, currencyRates] = await Promise.all([
    selectMany(
      context.supabase,
      "bank_accounts",
      "id, subsidiary_id, bank_relationship_id, account_name, account_number_masked, currency_code, account_type, status, last_balance_at, updated_at",
      context.organizationId
    ),
    selectMany(
      context.supabase,
      "bank_relationships",
      "id, bank_name, bank_code, region, services_json, fee_structure_json, status, updated_at",
      context.organizationId
    ),
    selectMany(
      context.supabase,
      "counterparties",
      "id, name, type, country_code, default_currency_code, risk_rating, updated_at",
      context.organizationId
    ),
    selectMany(
      context.supabase,
      "currency_rates",
      "id, base_currency_code, quote_currency_code, rate, source, observed_at",
      undefined,
      { orderBy: "observed_at", ascending: false, limit: 10 }
    )
  ]);

  return {
    organization: context.session.organization,
    bankRelationships,
    accounts,
    counterparties,
    currencyRates
  };
}

export async function createAccountsRecord(payload: unknown) {
  const parsed = accountCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();

  let record: JsonRecord;
  if (parsed.recordType === "bank_relationship") {
    record = await insertOne(context.supabase, "bank_relationships", {
      organization_id: context.organizationId,
      bank_name: parsed.bankName,
      bank_code: parsed.bankCode,
      region: parsed.region
    });
  } else if (parsed.recordType === "counterparty") {
    record = await insertOne(context.supabase, "counterparties", {
      organization_id: context.organizationId,
      name: parsed.name,
      type: parsed.type,
      country_code: parsed.countryCode?.toUpperCase(),
      default_currency_code: parsed.defaultCurrencyCode
    });
  } else {
    record = await insertOne(context.supabase, "bank_accounts", {
      organization_id: context.organizationId,
      subsidiary_id: parsed.subsidiaryId ?? (await getFirstId(context.supabase, "subsidiaries", context.organizationId)),
      bank_relationship_id:
        parsed.bankRelationshipId ?? (await getFirstId(context.supabase, "bank_relationships", context.organizationId)),
      account_name: parsed.accountName,
      account_number_masked: parsed.maskedNumber,
      currency_code: parsed.currencyCode,
      account_type: "operating"
    });
  }

  await createAuditLog(context, `accounts.${parsed.recordType}.created`, parsed.recordType, String(record.id));
  return { ok: true, recordType: parsed.recordType, record };
}

export async function getTransactionsPayload() {
  const context = await getTreasuryApiContext();
  const [transactions, statements, reconciliationRuns] = await Promise.all([
    selectMany(
      context.supabase,
      "transactions",
      "id, bank_account_id, subsidiary_id, source_system, transaction_date, value_date, direction, amount, currency_code, description, status, updated_at",
      context.organizationId,
      { orderBy: "transaction_date", ascending: false, limit: 25 }
    ),
    selectMany(
      context.supabase,
      "bank_statements",
      "id, bank_account_id, statement_date, source_type, file_name, processing_status, closing_balance, updated_at",
      context.organizationId,
      { orderBy: "statement_date", ascending: false, limit: 10 }
    ),
    selectMany(
      context.supabase,
      "reconciliation_runs",
      "id, bank_account_id, run_date, status, matched_count, exception_count, updated_at",
      context.organizationId,
      { orderBy: "run_date", ascending: false, limit: 10 }
    )
  ]);

  return { transactions, statements, reconciliationRuns };
}

export async function createTransactionsRecord(payload: unknown) {
  const parsed = transactionCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();

  if (parsed.recordType === "transaction") {
    const record = await insertOne(context.supabase, "transactions", {
      organization_id: context.organizationId,
      bank_account_id: parsed.bankAccountId,
      subsidiary_id: parsed.subsidiaryId,
      source_system: parsed.sourceSystem,
      transaction_date: parsed.transactionDate,
      value_date: parsed.valueDate,
      direction: parsed.direction,
      amount: parsed.amount,
      currency_code: parsed.currencyCode,
      description: parsed.description
    });
    await createAuditLog(context, "transactions.booked", "transaction", String(record.id));
    return { ok: true, recordType: parsed.recordType, record };
  }

  if (parsed.recordType === "statement_import") {
    const bankAccountId =
      parsed.bankAccountId ?? (await getFirstId(context.supabase, "bank_accounts", context.organizationId));
    if (!bankAccountId) {
      throw new ApiError(400, "Create a bank account before importing statements.");
    }

    const record = await insertOne(context.supabase, "bank_statements", {
      organization_id: context.organizationId,
      bank_account_id: bankAccountId,
      statement_date: parsed.statementDate,
      source_type: parsed.sourceType,
      file_name: parsed.fileName,
      processing_status: "queued"
    });
    await createAuditLog(context, "statements.imported", "bank_statement", String(record.id));
    return { ok: true, recordType: parsed.recordType, record };
  }

  const bankAccountId =
    parsed.bankAccountId ?? (await getFirstId(context.supabase, "bank_accounts", context.organizationId));
  if (!bankAccountId) {
    throw new ApiError(400, "Create a bank account before running reconciliation.");
  }

  const transactions = await selectMany(
    context.supabase,
    "transactions",
    "id, bank_account_id, direction, amount, status",
    context.organizationId,
    { filters: [{ column: "bank_account_id", value: bankAccountId }] }
  );
  const exceptionCount = transactions.filter((row: JsonRecord) => row.status !== "booked").length;
  const matchedCount = transactions.length - exceptionCount;

  const record = await insertOne(context.supabase, "reconciliation_runs", {
    organization_id: context.organizationId,
    bank_account_id: bankAccountId,
    run_date: parsed.runDate,
    status: exceptionCount ? "partial" : "completed",
    matched_count: matchedCount,
    exception_count: exceptionCount
  });
  await createAuditLog(context, "reconciliation.completed", "reconciliation_run", String(record.id), "info", {
    matchedCount,
    exceptionCount
  });
  return { ok: true, recordType: parsed.recordType, record };
}

export async function getCashPositionsPayload() {
  const context = await getTreasuryApiContext();
  const [snapshots, lines] = await Promise.all([
    selectMany(
      context.supabase,
      "cash_position_snapshots",
      "id, snapshot_time, reporting_currency_code, freshness_status, created_at",
      context.organizationId,
      { orderBy: "snapshot_time", ascending: false, limit: 5 }
    ),
    getLatestCashLines(context)
  ]);

  return {
    snapshots,
    latestLines: lines,
    snapshotSummary: {
      totalLines: lines.length,
      currencies: Array.from(new Set(lines.map((line: JsonRecord) => String(line.currency_code))))
    }
  };
}

export async function createCashPositionsRecord(payload: unknown) {
  const parsed = cashPositionCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();
  const accounts = await selectMany(
    context.supabase,
    "bank_accounts",
    "id, subsidiary_id, currency_code",
    context.organizationId
  );
  const transactions = parsed.refreshFromTransactions
    ? await selectMany(
        context.supabase,
        "transactions",
        "bank_account_id, subsidiary_id, direction, amount, currency_code",
        context.organizationId
      )
    : [];

  const snapshot = await insertOne(context.supabase, "cash_position_snapshots", {
    organization_id: context.organizationId,
    reporting_currency_code: parsed.reportingCurrencyCode,
    freshness_status: parsed.freshnessStatus
  });

  const grouped = new Map<string, JsonRecord>();
  accounts.forEach((account: JsonRecord) => {
    grouped.set(String(account.id), {
      bank_account_id: account.id,
      subsidiary_id: account.subsidiary_id,
      currency_code: account.currency_code,
      balance_amount: 0
    });
  });

  transactions.forEach((transaction: JsonRecord) => {
    const key = String(transaction.bank_account_id ?? `${transaction.subsidiary_id}-${transaction.currency_code}`);
    const current = grouped.get(key) ?? {
      bank_account_id: transaction.bank_account_id,
      subsidiary_id: transaction.subsidiary_id,
      currency_code: transaction.currency_code,
      balance_amount: 0
    };
    const signedAmount =
      transaction.direction === "credit"
        ? Number(transaction.amount ?? 0)
        : -Number(transaction.amount ?? 0);
    current.balance_amount = Number(current.balance_amount ?? 0) + signedAmount;
    grouped.set(key, current);
  });

  const rateMap = await getRateMap(context, parsed.reportingCurrencyCode);
  const lines = Array.from(grouped.values()).map((row: JsonRecord) => {
    const currencyCode = String(row.currency_code ?? parsed.reportingCurrencyCode);
    const balanceAmount = Number(row.balance_amount ?? 0);
    return {
      cash_position_snapshot_id: snapshot.id,
      bank_account_id: row.bank_account_id ?? null,
      subsidiary_id: row.subsidiary_id ?? null,
      currency_code: currencyCode,
      balance_amount: balanceAmount,
      reporting_amount: balanceAmount * (rateMap[currencyCode] ?? 1)
    };
  });

  if (lines.length) {
    await insertMany(context.supabase, "cash_position_lines", lines);
  }

  await createAuditLog(context, "cash_positions.snapshot_created", "cash_position_snapshot", String(snapshot.id), "info", {
    lineCount: lines.length
  });
  return { ok: true, snapshot, lineCount: lines.length };
}

export async function getForecastsPayload() {
  const context = await getTreasuryApiContext();
  const [forecasts, scenarios, lines] = await Promise.all([
    selectMany(
      context.supabase,
      "cash_flow_forecasts",
      "id, name, horizon_type, methodology, reporting_currency_code, status, accuracy_score, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 10 }
    ),
    selectMany(
      context.supabase,
      "forecast_scenarios",
      "id, cash_flow_forecast_id, name, scenario_type, status, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 10 }
    ),
    getLatestForecastLines(context)
  ]);

  return { forecasts, scenarios, latestLines: lines };
}

export async function createForecastsRecord(payload: unknown) {
  const parsed = forecastCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();
  const forecast = await insertOne(context.supabase, "cash_flow_forecasts", {
    organization_id: context.organizationId,
    name: parsed.name,
    horizon_type: parsed.horizonType,
    methodology: parsed.methodology,
    reporting_currency_code: parsed.reportingCurrencyCode,
    status: "published"
  });

  const historicalTransactions = await selectMany(
    context.supabase,
    "transactions",
    "direction, amount, currency_code",
    context.organizationId,
    { orderBy: "transaction_date", ascending: false, limit: 60 }
  );
  const scheduledPayments = await selectMany(
    context.supabase,
    "payments",
    "requested_execution_date, amount, currency_code, status",
    context.organizationId,
    { filters: [{ column: "status", value: "draft", operator: "in", multiValue: ["draft", "submitted", "approved"] }] }
  );

  const averageNet = computeAverageNet(historicalTransactions);
  const lines = Array.from({ length: parsed.weeks }, (_, index) => {
    const dueBucket = scheduledPayments
      .filter((payment: JsonRecord) => weekOffsetFromToday(String(payment.requested_execution_date)) === index)
      .reduce((sum: number, payment: JsonRecord) => sum + Number(payment.amount ?? 0), 0);
    const netAmount = averageNet - dueBucket;

    return {
      cash_flow_forecast_id: forecast.id,
      subsidiary_id: null,
      forecast_date: currentDateOffset((index + 1) * 7),
      inflow_amount: Math.max(netAmount, 0),
      outflow_amount: Math.max(-netAmount, 0),
      net_amount: netAmount,
      currency_code: parsed.reportingCurrencyCode,
      reporting_amount: netAmount
    };
  });

  await insertMany(context.supabase, "forecast_lines", lines);

  let scenario: JsonRecord | null = null;
  if (parsed.scenarioName) {
    scenario = await insertOne(context.supabase, "forecast_scenarios", {
      organization_id: context.organizationId,
      cash_flow_forecast_id: forecast.id,
      name: parsed.scenarioName,
      scenario_type: "base_case",
      assumptions_json: {
        methodology: parsed.methodology,
        generated_weeks: parsed.weeks
      }
    });
  }

  await createAuditLog(context, "forecasts.generated", "cash_flow_forecast", String(forecast.id));
  return { ok: true, forecast, linesCreated: lines.length, scenario };
}

export async function getPaymentsPayload() {
  const context = await getTreasuryApiContext();
  const [payments, approvals, signatures] = await Promise.all([
    selectMany(
      context.supabase,
      "payments",
      "id, approval_workflow_id, beneficiary_name, payment_type, amount, currency_code, requested_execution_date, purpose, status, created_at, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 25 }
    ),
    selectPaymentApprovals(context),
    selectMany(
      context.supabase,
      "electronic_signatures",
      "id, payment_id, provider_name, status, signed_at, created_at",
      context.organizationId,
      { selectOrgViaTable: "payments", selectOrgKey: "payment_id", selectOrgForeignKey: "id", limit: 25 }
    )
  ]);

  return { payments, approvals, signatures };
}

export async function createPaymentsRecord(payload: unknown) {
  const parsed = paymentCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();
  const workflowId =
    parsed.approvalWorkflowId ?? (await resolveApprovalWorkflowId(context, parsed.amount));
  const payment = await insertOne(context.supabase, "payments", {
    organization_id: context.organizationId,
    subsidiary_id:
      parsed.subsidiaryId ?? (await getFirstId(context.supabase, "subsidiaries", context.organizationId)),
    source_bank_account_id:
      parsed.sourceBankAccountId ?? (await getFirstId(context.supabase, "bank_accounts", context.organizationId)),
    approval_workflow_id: workflowId,
    beneficiary_name: parsed.beneficiaryName,
    payment_type: parsed.paymentType,
    amount: parsed.amount,
    currency_code: parsed.currencyCode,
    requested_execution_date: parsed.requestedExecutionDate,
    purpose: parsed.purpose,
    status: workflowId ? "submitted" : "draft",
    created_by: context.userId
  });

  if (workflowId) {
    const requiredSteps = await getRequiredWorkflowSteps(context, workflowId, parsed.amount);
    if (requiredSteps.length) {
      await insertMany(
        context.supabase,
        "payment_approvals",
        requiredSteps.map((step: JsonRecord) => ({
          payment_id: payment.id,
          workflow_step_id: step.id,
          decision: "pending",
          step_up_verified: false
        }))
      );
    }
  }

  await createAuditLog(context, "payments.created", "payment", String(payment.id), "info", {
    amount: parsed.amount,
    currencyCode: parsed.currencyCode,
    approvalWorkflowId: workflowId
  });
  return { ok: true, payment };
}

export async function getApprovalsPayload() {
  const context = await getTreasuryApiContext();
  const [workflows, steps, approvals] = await Promise.all([
    selectMany(
      context.supabase,
      "approval_workflows",
      "id, name, workflow_type, status, rules_json, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 10 }
    ),
    selectWorkflowSteps(context),
    selectPaymentApprovals(context)
  ]);

  return { workflows, steps, approvals };
}

export async function createApprovalDecision(payload: unknown) {
  const parsed = approvalDecisionSchema.parse(payload);
  const context = await getTreasuryApiContext();
  const payment = await selectOne(
    context.supabase,
    "payments",
    "id, organization_id, created_by, status, amount, approval_workflow_id",
    context.organizationId,
    [{ column: "id", value: parsed.paymentId }]
  );

  if (!payment) {
    throw new ApiError(404, "Payment not found.");
  }

  if (
    parsed.decision === "approved" &&
    Number(payment.amount ?? 0) >= 100000 &&
    !parsed.stepUpVerified
  ) {
    throw new ApiError(400, "Step-up verification is required for high-value approvals.");
  }

  const existingApprovals = await selectByColumn(
    context.supabase,
    "payment_approvals",
    "id, workflow_step_id, decision, step_up_verified, created_at",
    "payment_id",
    parsed.paymentId,
    { orderBy: "created_at", ascending: true }
  );
  const requiredSteps = payment.approval_workflow_id
    ? await getRequiredWorkflowSteps(
        context,
        String(payment.approval_workflow_id),
        Number(payment.amount ?? 0)
      )
    : [];
  const nextPendingApproval = existingApprovals.find(
    (row: JsonRecord) => String(row.decision) === "pending"
  );

  const approval = await insertOne(context.supabase, "payment_approvals", {
    payment_id: parsed.paymentId,
    workflow_step_id: nextPendingApproval?.workflow_step_id ?? requiredSteps[0]?.id ?? null,
    approver_user_id: context.userId,
    decision: parsed.decision,
    decision_reason: parsed.reason,
    decided_at: new Date().toISOString(),
    step_up_verified: parsed.stepUpVerified
  });

  let signature: JsonRecord | null = null;
  if (parsed.createSignature) {
    signature = await insertOne(context.supabase, "electronic_signatures", {
      organization_id: context.organizationId,
      payment_id: parsed.paymentId,
      signer_user_id: context.userId,
      provider_name: "internal_approval",
      status: parsed.decision === "approved" ? "signed" : "declined",
      signed_at: parsed.decision === "approved" ? new Date().toISOString() : null
    });
  }

  const nextStatus =
    parsed.decision === "approved"
      ? calculateApprovalStatus({
          requiredSteps,
          existingApprovals,
          latestDecision: parsed.decision
        })
      : parsed.decision === "rejected"
        ? "rejected"
        : "submitted";

  const updatedPayment = await updateOne(context.supabase, "payments", parsed.paymentId, {
    status: nextStatus
  });

  await insertOne(context.supabase, "notifications", {
    organization_id: context.organizationId,
    user_id: payment.created_by ?? context.userId,
    channel: "in_app",
    notification_type: "approval_decision",
    severity: parsed.decision === "rejected" ? "warning" : "info",
    title: `Payment ${parsed.decision}`,
    body: `Payment ${parsed.paymentId} was ${parsed.decision} by ${context.session.user.name}.`,
    status: "queued"
  });

  await createAuditLog(context, `payments.${parsed.decision}`, "payment", parsed.paymentId, "info", {
    stepUpVerified: parsed.stepUpVerified,
    remainingApprovals: Math.max(
      requiredSteps.length -
        countApprovedSteps(existingApprovals) -
        (parsed.decision === "approved" ? 1 : 0),
      0
    )
  });
  return { ok: true, approval, signature, payment: updatedPayment };
}

export async function getRiskPayload() {
  const context = await getTreasuryApiContext();
  const [exposures, hedges, marketData] = await Promise.all([
    selectMany(
      context.supabase,
      "risk_exposures",
      "id, exposure_type, reference_entity_type, reference_entity_id, exposure_currency_code, gross_amount, net_amount, measured_at",
      context.organizationId,
      { orderBy: "measured_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "hedging_instruments",
      "id, exposure_id, counterparty_id, instrument_type, currency_code, notional_amount, mtm_amount, maturity_date, status, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "market_data_points",
      "id, provider_name, instrument_type, symbol, value_numeric, observed_at",
      context.organizationId,
      { orderBy: "observed_at", ascending: false, limit: 20 }
    )
  ]);

  return { exposures, hedges, marketData };
}

export async function createRiskRecord(payload: unknown) {
  const parsed = riskCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();

  if (parsed.recordType === "exposure") {
    const record = await insertOne(context.supabase, "risk_exposures", {
      organization_id: context.organizationId,
      subsidiary_id: parsed.subsidiaryId,
      exposure_type: parsed.exposureType,
      reference_entity_type: parsed.referenceEntityType,
      reference_entity_id: parsed.referenceEntityId,
      exposure_currency_code: parsed.exposureCurrencyCode,
      gross_amount: parsed.grossAmount,
      net_amount: parsed.netAmount ?? parsed.grossAmount
    });
    await createAuditLog(context, "risk.exposure_recorded", "risk_exposure", String(record.id));
    return { ok: true, record };
  }

  if (parsed.recordType === "market_data") {
    const record = await insertOne(context.supabase, "market_data_points", {
      organization_id: context.organizationId,
      provider_name: parsed.providerName,
      instrument_type: parsed.instrumentType,
      symbol: parsed.symbol,
      value_numeric: parsed.valueNumeric,
      observed_at: parsed.observedAt ?? new Date().toISOString()
    });
    await createAuditLog(context, "risk.market_data_recorded", "market_data_point", String(record.id));
    return { ok: true, record };
  }

  const counterpartyId =
    parsed.counterpartyId ?? (await getFirstId(context.supabase, "counterparties", context.organizationId));
  const exposureId =
    parsed.exposureId ?? (await getFirstId(context.supabase, "risk_exposures", context.organizationId));
  const record = await insertOne(context.supabase, "hedging_instruments", {
    organization_id: context.organizationId,
    exposure_id: exposureId,
    counterparty_id: counterpartyId,
    instrument_type: parsed.instrumentType,
    currency_code: parsed.currencyCode,
    notional_amount: parsed.notionalAmount,
    mtm_amount: parsed.mtmAmount,
    maturity_date: parsed.maturityDate ?? currentDateOffset(90)
  });
  await createAuditLog(context, "risk.hedge_recorded", "hedging_instrument", String(record.id));
  return { ok: true, record };
}

export async function getInvestmentsPayload() {
  const context = await getTreasuryApiContext();
  const investments = await selectMany(
    context.supabase,
    "investments",
    "id, counterparty_id, investment_type, instrument_name, principal_amount, current_value, currency_code, maturity_date, esg_label, status, updated_at",
    context.organizationId,
    { orderBy: "updated_at", ascending: false, limit: 20 }
  );

  return { investments };
}

export async function createInvestmentsRecord(payload: unknown) {
  const parsed = investmentCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();
  const counterpartyId =
    parsed.counterpartyId ?? (await getFirstId(context.supabase, "counterparties", context.organizationId));
  const record = await insertOne(context.supabase, "investments", {
    organization_id: context.organizationId,
    counterparty_id: counterpartyId,
    investment_type: parsed.investmentType,
    instrument_name: parsed.instrumentName,
    principal_amount: parsed.principalAmount,
    current_value: parsed.currentValue ?? parsed.principalAmount,
    currency_code: parsed.currencyCode,
    maturity_date: parsed.maturityDate ?? currentDateOffset(30),
    esg_label: parsed.esgLabel,
    status: "active"
  });
  await createAuditLog(context, "investments.recorded", "investment", String(record.id));
  return { ok: true, record };
}

export async function getDebtPayload() {
  const context = await getTreasuryApiContext();
  const [facilities, covenantTests, events] = await Promise.all([
    selectMany(
      context.supabase,
      "debt_facilities",
      "id, lender_name, facility_type, currency_code, committed_amount, drawn_amount, maturity_date, covenant_summary, status, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 20 }
    ),
    selectCovenantTests(context),
    selectMany(
      context.supabase,
      "treasury_events",
      "id, event_type, title, due_date, related_entity_type, related_entity_id, status, updated_at",
      context.organizationId,
      { orderBy: "due_date", ascending: true, limit: 20 }
    )
  ]);

  return { facilities, covenantTests, events };
}

export async function createDebtRecord(payload: unknown) {
  const parsed = debtCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();

  if (parsed.recordType === "facility") {
    const record = await insertOne(context.supabase, "debt_facilities", {
      organization_id: context.organizationId,
      lender_name: parsed.lenderName,
      facility_type: parsed.facilityType,
      currency_code: parsed.currencyCode,
      committed_amount: parsed.committedAmount,
      drawn_amount: parsed.drawnAmount,
      maturity_date: parsed.maturityDate ?? currentDateOffset(365),
      covenant_summary: parsed.covenantSummary,
      status: "active"
    });
    await createAuditLog(context, "debt.facility_recorded", "debt_facility", String(record.id));
    return { ok: true, record };
  }

  if (parsed.recordType === "covenant_test") {
    const record = await insertOne(context.supabase, "covenant_tests", {
      debt_facility_id: parsed.debtFacilityId,
      metric_name: parsed.metricName,
      threshold_value: parsed.thresholdValue,
      actual_value: parsed.actualValue,
      test_date: parsed.testDate,
      status: parsed.actualValue > parsed.thresholdValue ? "breach" : "pass"
    });
    await createAuditLog(context, "debt.covenant_test_recorded", "covenant_test", String(record.id));
    return { ok: true, record };
  }

  const record = await insertOne(context.supabase, "treasury_events", {
    organization_id: context.organizationId,
    event_type: parsed.eventType,
    title: parsed.title,
    due_date: parsed.dueDate,
    related_entity_type: parsed.relatedEntityType,
    related_entity_id: parsed.relatedEntityId,
    status: "scheduled"
  });
  await createAuditLog(context, "debt.event_recorded", "treasury_event", String(record.id));
  return { ok: true, record };
}

export async function getFxPayload(request: Request) {
  const context = await getTreasuryApiContext();
  const rates = await selectMany(
    context.supabase,
    "currency_rates",
    "id, base_currency_code, quote_currency_code, rate, source, observed_at",
    undefined,
    { orderBy: "observed_at", ascending: false, limit: 20 }
  );

  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base")?.toUpperCase();
  const quote = searchParams.get("quote")?.toUpperCase();
  const amountParam = searchParams.get("amount");
  if (!base || !quote || !amountParam) {
    return { rates };
  }

  const amount = Number(amountParam);
  const rate = findFxRate(rates as FxRateRow[], base, quote);
  if (rate === null) {
    throw new ApiError(404, `No FX rate available for ${base}/${quote}.`);
  }

  return {
    rates,
    conversion: {
      base,
      quote,
      amount,
      rate,
      convertedAmount: amount * rate
    }
  };
}

export async function createFxRecord(payload: unknown) {
  const parsed = fxCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();
  const record = await insertOne(context.supabase, "currency_rates", {
    base_currency_code: parsed.baseCurrencyCode,
    quote_currency_code: parsed.quoteCurrencyCode,
    rate: parsed.rate,
    source: parsed.source,
    observed_at: parsed.observedAt ?? new Date().toISOString()
  });
  await createAuditLog(context, "fx.rate_recorded", "currency_rate", String(record.id));
  return { ok: true, record };
}

export async function getIntegrationsPayload() {
  const context = await getTreasuryApiContext();
  const [connections, syncRuns] = await Promise.all([
    selectMany(
      context.supabase,
      "integration_connections",
      "id, integration_type, provider_name, status, credentials_reference, config_json, last_success_at, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 20 }
    ),
    selectIntegrationRuns(context)
  ]);

  return { connections, syncRuns };
}

export async function createIntegrationsRecord(payload: unknown) {
  const parsed = integrationCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();

  if (parsed.recordType === "connection") {
    const record = await insertOne(context.supabase, "integration_connections", {
      organization_id: context.organizationId,
      integration_type: parsed.integrationType,
      provider_name: parsed.providerName,
      credentials_reference: parsed.credentialsReference,
      status: "pending",
      config_json: { bootstrap: true }
    });
    await createAuditLog(context, "integrations.connection_created", "integration_connection", String(record.id));
    return { ok: true, record };
  }

  const record = await insertOne(context.supabase, "integration_sync_runs", {
    integration_connection_id: parsed.integrationConnectionId,
    sync_type: parsed.syncType,
    status: "queued",
    metadata_json: parsed.metadataJson
  });
  await createAuditLog(context, "integrations.sync_queued", "integration_sync_run", String(record.id));
  return { ok: true, record };
}

export async function getAdminPayload() {
  const context = await getTreasuryApiContext();
  const [organization, roles, policies, workflowRules, settings, auditLogs] = await Promise.all([
    selectOne(
      context.supabase,
      "organizations",
      "id, name, slug, status, base_currency_code, settings_json, updated_at",
      undefined,
      [{ column: "id", value: context.organizationId }]
    ),
    selectMany(
      context.supabase,
      "roles",
      "id, name, description, permission_codes_json, status, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "treasury_policies",
      "id, name, policy_type, policy_json, version, status, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "workflow_rules",
      "id, approval_workflow_id, name, trigger_type, rule_json, status, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "platform_settings",
      "id, category, setting_key, setting_value_json, status, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "audit_logs",
      "id, actor_user_id, actor_type, action, entity_type, entity_id, severity, metadata_json, occurred_at",
      context.organizationId,
      { orderBy: "occurred_at", ascending: false, limit: 30 }
    )
  ]);

  return {
    organization,
    roles,
    policies,
    workflowRules,
    settings,
    auditLogs
  };
}

export async function createAdminRecord(payload: unknown) {
  const parsed = adminCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();

  if (parsed.recordType === "role") {
    const record = await insertOne(context.supabase, "roles", {
      organization_id: context.organizationId,
      name: parsed.name,
      description: parsed.description,
      permission_codes_json: ["dashboard.view", "payments.view"]
    });
    await createAuditLog(context, "admin.role_created", "role", String(record.id));
    return { ok: true, record };
  }

  if (parsed.recordType === "policy") {
    const record = await insertOne(context.supabase, "treasury_policies", {
      organization_id: context.organizationId,
      name: parsed.name,
      policy_type: parsed.policyType,
      policy_json: parsed.policyJson,
      version: 1,
      status: "draft"
    });
    await createAuditLog(context, "admin.policy_created", "treasury_policy", String(record.id));
    return { ok: true, record };
  }

  if (parsed.recordType === "setting") {
    const record = await insertOne(context.supabase, "platform_settings", {
      organization_id: context.organizationId,
      category: parsed.category,
      setting_key: parsed.settingKey,
      setting_value_json: parsed.settingValueJson,
      status: "active"
    });
    await createAuditLog(context, "admin.setting_created", "platform_setting", String(record.id));
    return { ok: true, record };
  }

  const workflow = await insertOne(context.supabase, "approval_workflows", {
    organization_id: context.organizationId,
    name: parsed.name,
    workflow_type: parsed.workflowType,
    rules_json: {
      thresholdAmount: parsed.thresholdAmount,
      minimumApprovals: parsed.thresholdAmount >= 500000 ? 2 : 1,
      requireStepUp: parsed.thresholdAmount >= 100000
    },
    status: "active"
  });
  const step = await insertOne(context.supabase, "approval_workflow_steps", {
    approval_workflow_id: workflow.id,
    step_order: 1,
    approver_type: "role",
    approver_reference: parsed.approverReference,
    threshold_json: {
      minimumAmount: parsed.thresholdAmount
    }
  });
  const workflowRule = await insertOne(context.supabase, "workflow_rules", {
    organization_id: context.organizationId,
    approval_workflow_id: workflow.id,
    name: `${parsed.name} routing rule`,
    trigger_type: parsed.workflowType,
    rule_json: {
      thresholdAmount: parsed.thresholdAmount,
      minimumApprovals: parsed.thresholdAmount >= 500000 ? 2 : 1,
      requireStepUp: parsed.thresholdAmount >= 100000
    },
    status: "active"
  });

  await createAuditLog(context, "admin.workflow_created", "approval_workflow", String(workflow.id));
  return { ok: true, workflow, step, workflowRule };
}

export async function getDashboardsPayload() {
  const context = await getTreasuryApiContext();
  const [dashboards, queries] = await Promise.all([
    selectMany(
      context.supabase,
      "dashboards",
      "id, user_id, name, layout_json, is_default, updated_at",
      context.organizationId,
      {
        filters: [{ column: "user_id", value: context.userId }],
        orderBy: "updated_at",
        ascending: false,
        limit: 10
      }
    ),
    selectMany(
      context.supabase,
      "query_threads",
      "id, title, prompt_text, response_text, status, created_at, updated_at",
      context.organizationId,
      {
        filters: [{ column: "user_id", value: context.userId }],
        orderBy: "updated_at",
        ascending: false,
        limit: 10
      }
    )
  ]);

  const dashboardIds = dashboards.map((dashboard: JsonRecord) => String(dashboard.id));
  const widgets = dashboardIds.length
    ? await selectMany(
        context.supabase,
        "dashboard_widgets",
        "id, dashboard_id, widget_type, title, config_json, position_index, updated_at",
        undefined,
        {
          filters: [{ column: "dashboard_id", value: dashboardIds[0], operator: "in", multiValue: dashboardIds }],
          orderBy: "position_index",
          ascending: true,
          limit: 30
        }
      )
    : [];

  return {
    dashboards,
    widgets,
    queries
  };
}

export async function createDashboardRecord(payload: unknown) {
  const parsed = dashboardCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();

  if (parsed.recordType === "dashboard") {
    if (parsed.isDefault) {
      await (context.supabase as any)
        .from("dashboards")
        .update({ is_default: false })
        .eq("organization_id", context.organizationId)
        .eq("user_id", context.userId);
    }

    const record = await insertOne(context.supabase, "dashboards", {
      organization_id: context.organizationId,
      user_id: context.userId,
      name: parsed.name,
      is_default: parsed.isDefault,
      layout_json: parsed.layoutJson
    });

    await createAuditLog(context, "dashboard.created", "dashboard", String(record.id));
    return { ok: true, record };
  }

  const targetDashboard =
    parsed.dashboardId ??
    String(
      (
        await selectOne(
          context.supabase,
          "dashboards",
          "id",
          context.organizationId,
          [{ column: "user_id", value: context.userId }],
          { orderBy: "is_default", ascending: false }
        )
      )?.id ?? ""
    );

  if (!targetDashboard) {
    throw new ApiError(400, "Create a dashboard before adding widgets.");
  }

  const record = await insertOne(context.supabase, "dashboard_widgets", {
    dashboard_id: targetDashboard,
    widget_type: parsed.widgetType,
    title: parsed.title,
    config_json: parsed.configJson,
    position_index: parsed.positionIndex
  });

  await createAuditLog(context, "dashboard.widget_created", "dashboard_widget", String(record.id));
  return { ok: true, record };
}

export async function getQueryPayload() {
  const context = await getTreasuryApiContext();
  const queries = await selectMany(
    context.supabase,
    "query_threads",
    "id, title, prompt_text, response_text, status, created_at, updated_at",
    context.organizationId,
    {
      filters: [{ column: "user_id", value: context.userId }],
      orderBy: "updated_at",
      ascending: false,
      limit: 20
    }
  );

  return { queries };
}

export async function createQueryRecord(payload: unknown) {
  const parsed = queryCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();
  const [payments, notifications, reports, integrations] = await Promise.all([
    selectMany(context.supabase, "payments", "id, amount, currency_code, status", context.organizationId, {
      orderBy: "created_at",
      ascending: false,
      limit: 50
    }),
    selectMany(
      context.supabase,
      "notifications",
      "id, severity, title, created_at",
      context.organizationId,
      { orderBy: "created_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "compliance_reports",
      "id, report_type, status, created_at",
      context.organizationId,
      { orderBy: "created_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "integration_connections",
      "id, provider_name, integration_type, status, last_success_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 20 }
    )
  ]);

  const responseText = buildQueryResponse(parsed.promptText, {
    payments,
    notifications,
    reports,
    integrations
  });

  const record = await insertOne(context.supabase, "query_threads", {
    organization_id: context.organizationId,
    user_id: context.userId,
    title: parsed.title || parsed.promptText.slice(0, 64),
    prompt_text: parsed.promptText,
    response_text: responseText,
    status: "completed"
  });

  await createAuditLog(context, "query.completed", "query_thread", String(record.id));
  return { ok: true, record };
}

export async function getReportsPayload() {
  const context = await getTreasuryApiContext();
  const [reports, auditLogs, notifications] = await Promise.all([
    selectMany(
      context.supabase,
      "compliance_reports",
      "id, report_type, period_start, period_end, status, storage_key, created_at, updated_at",
      context.organizationId,
      { orderBy: "created_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "audit_logs",
      "id, action, entity_type, severity, occurred_at, metadata_json",
      context.organizationId,
      { orderBy: "occurred_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "notifications",
      "id, title, severity, body, created_at",
      context.organizationId,
      { orderBy: "created_at", ascending: false, limit: 10 }
    )
  ]);

  return {
    reports,
    auditLogs,
    notifications
  };
}

export async function createReportRecord(payload: unknown) {
  const parsed = reportCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();

  const record = await insertOne(context.supabase, "compliance_reports", {
    organization_id: context.organizationId,
    report_type: parsed.reportType,
    period_start: parsed.periodStart || null,
    period_end: parsed.periodEnd || null,
    status: "generated",
    storage_key: [
      "reports",
      context.organizationId,
      parsed.reportType,
      new Date().toISOString().slice(0, 10)
    ].join("/"),
    created_by_user_id: context.userId
  });

  await insertOne(context.supabase, "notifications", {
    organization_id: context.organizationId,
    title: `${parsed.reportType} report generated`,
    body: "A new treasury report is ready for review and distribution.",
    severity: "info",
    channel: "in_app",
    status: "pending"
  });

  await createAuditLog(context, "reports.generated", "compliance_report", String(record.id));
  return { ok: true, record };
}

export async function getLiquidityPayload() {
  const context = await getTreasuryApiContext();
  const [loans, events] = await Promise.all([
    selectMany(
      context.supabase,
      "intercompany_loans",
      "id, lender_subsidiary_id, borrower_subsidiary_id, currency_code, principal_amount, outstanding_amount, interest_rate, maturity_date, status, updated_at",
      context.organizationId,
      { orderBy: "updated_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "treasury_events",
      "id, event_type, title, due_date, status, related_entity_type",
      context.organizationId,
      { orderBy: "due_date", ascending: true, limit: 20 }
    )
  ]);

  return { loans, events };
}

export async function createLiquidityRecord(payload: unknown) {
  const parsed = liquidityCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();

  const lenderSubsidiaryId =
    parsed.lenderSubsidiaryId ?? (await getFirstId(context.supabase, "subsidiaries", context.organizationId));
  const borrowerSubsidiaryId =
    parsed.borrowerSubsidiaryId ??
    (await getAnotherSubsidiaryId(
      context.supabase,
      context.organizationId,
      lenderSubsidiaryId ? String(lenderSubsidiaryId) : undefined
    ));

  if (!lenderSubsidiaryId || !borrowerSubsidiaryId) {
    throw new ApiError(400, "Create at least two subsidiaries before recording intercompany liquidity.");
  }

  const record = await insertOne(context.supabase, "intercompany_loans", {
    organization_id: context.organizationId,
    lender_subsidiary_id: lenderSubsidiaryId,
    borrower_subsidiary_id: borrowerSubsidiaryId,
    currency_code: parsed.currencyCode,
    principal_amount: parsed.principalAmount,
    outstanding_amount: parsed.principalAmount,
    interest_rate: parsed.interestRateBps / 10000,
    maturity_date: parsed.maturityDate ?? currentDateOffset(90),
    status: "active"
  });

  await createAuditLog(context, "liquidity.intercompany_loan_created", "intercompany_loan", String(record.id));
  return { ok: true, record };
}

export async function getNotificationsPayload() {
  const context = await getTreasuryApiContext();
  const [notifications, mobileDevices] = await Promise.all([
    selectMany(
      context.supabase,
      "notifications",
      "id, title, body, severity, status, created_at",
      context.organizationId,
      { orderBy: "created_at", ascending: false, limit: 20 }
    ),
    selectMany(
      context.supabase,
      "mobile_devices",
      "id, device_label, platform, biometric_enabled, last_seen_at, status, created_at, user_id",
      context.organizationId,
      {
        filters: [{ column: "user_id", value: context.userId }],
        orderBy: "created_at",
        ascending: false,
        limit: 10
      }
    )
  ]);

  return { notifications, mobileDevices };
}

export async function createNotificationRecord(payload: unknown) {
  const parsed = notificationCreateSchema.parse(payload);
  const context = await getTreasuryApiContext();

  if (parsed.recordType === "notification") {
    const record = await insertOne(context.supabase, "notifications", {
      organization_id: context.organizationId,
      user_id: context.userId,
      channel: "in_app",
      notification_type: "manual_alert",
      severity: parsed.severity,
      title: parsed.title,
      body: parsed.body,
      status: "queued"
    });
    await createAuditLog(context, "notifications.created", "notification", String(record.id), parsed.severity);
    return { ok: true, record };
  }

  const record = await insertOne(context.supabase, "mobile_devices", {
    organization_id: context.organizationId,
    user_id: context.userId,
    device_label: parsed.deviceLabel,
    platform: parsed.platform,
    biometric_enabled: parsed.biometricEnabled,
    status: "active"
  });
  await createAuditLog(context, "mobile.device_registered", "mobile_device", String(record.id));
  return { ok: true, record };
}

async function getTreasuryApiContext(): Promise<TreasuryApiContext> {
  const [session, supabase] = await Promise.all([getAppSession(), createSupabaseServerClient()]);

  if (!session || !supabase || session.organization.id === "unassigned") {
    throw new ApiError(401, "Unauthorized");
  }

  return {
    organizationId: session.organization.id,
    userId: session.user.id,
    session,
    supabase
  };
}

async function createAuditLog(
  context: TreasuryApiContext,
  action: string,
  entityType: string,
  entityId: string,
  severity: "info" | "warning" | "critical" = "info",
  metadata: JsonRecord = {}
) {
  await insertOne(context.supabase, "audit_logs", {
    organization_id: context.organizationId,
    actor_user_id: context.userId,
    actor_type: "user",
    action,
    entity_type: entityType,
    entity_id: entityId,
    severity,
    metadata_json: metadata
  });
}

async function getLatestCashLines(context: TreasuryApiContext) {
  const latestSnapshot = await selectOne(
    context.supabase,
    "cash_position_snapshots",
    "id",
    context.organizationId,
    [],
    { orderBy: "snapshot_time", ascending: false }
  );

  if (!latestSnapshot) {
    return [];
  }

  return selectByColumn(
    context.supabase,
    "cash_position_lines",
    "id, bank_account_id, subsidiary_id, currency_code, balance_amount, reporting_amount, created_at",
    "cash_position_snapshot_id",
    String(latestSnapshot.id),
    { orderBy: "created_at", ascending: false }
  );
}

async function getLatestForecastLines(context: TreasuryApiContext) {
  const latestForecast = await selectOne(
    context.supabase,
    "cash_flow_forecasts",
    "id",
    context.organizationId,
    [],
    { orderBy: "updated_at", ascending: false }
  );

  if (!latestForecast) {
    return [];
  }

  return selectByColumn(
    context.supabase,
    "forecast_lines",
    "id, forecast_date, inflow_amount, outflow_amount, net_amount, currency_code, reporting_amount",
    "cash_flow_forecast_id",
    String(latestForecast.id),
    { orderBy: "forecast_date", ascending: true }
  );
}

async function getAnotherSubsidiaryId(
  supabase: SupabaseClient,
  organizationId: string,
  excludeId?: string
) {
  const subsidiaries = await selectMany(
    supabase,
    "subsidiaries",
    "id",
    organizationId,
    { orderBy: "created_at", ascending: true, limit: 10 }
  );
  const alternative = subsidiaries.find((subsidiary: JsonRecord) => String(subsidiary.id) !== excludeId);
  return alternative ? String(alternative.id) : null;
}

function buildQueryResponse(
  promptText: string,
  context: {
    payments: JsonRecord[];
    notifications: JsonRecord[];
    reports: JsonRecord[];
    integrations: JsonRecord[];
  }
) {
  const prompt = promptText.toLowerCase();
  const paymentVolume = context.payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const pendingPayments = context.payments.filter((payment) =>
    ["draft", "submitted", "approved"].includes(String(payment.status))
  ).length;
  const criticalAlerts = context.notifications.filter(
    (notification) => String(notification.severity) === "critical"
  ).length;
  const generatedReports = context.reports.filter(
    (report) => String(report.status) === "generated" || String(report.status) === "delivered"
  ).length;
  const unhealthyIntegrations = context.integrations.filter(
    (integration) => !["active", "healthy"].includes(String(integration.status))
  ).length;

  if (prompt.includes("payment")) {
    return `There are ${pendingPayments} payment items still moving through the workflow, representing approximately ${paymentVolume.toFixed(2)} in notional volume. Prioritize approval or release actions before the next execution window.`;
  }

  if (prompt.includes("integration") || prompt.includes("connector")) {
    return unhealthyIntegrations
      ? `${unhealthyIntegrations} integration connections currently need attention. Review the integrations workspace and trigger sync retries for stale connectors.`
      : "All tracked integration connections are currently healthy. No stalled sync runs are visible in the latest operating window.";
  }

  if (prompt.includes("report") || prompt.includes("compliance") || prompt.includes("audit")) {
    return `The workspace currently holds ${generatedReports} generated compliance outputs. ${criticalAlerts} critical alerts are present in the audit and notification trail and should be included in the next reporting pack.`;
  }

  if (prompt.includes("risk") || prompt.includes("alert")) {
    return criticalAlerts
      ? `There are ${criticalAlerts} critical treasury alerts active right now. Review the alert rail and recent audit events before approving sensitive actions.`
      : "No critical treasury alerts are currently active. Risk monitoring is running without severe exceptions in the latest dataset.";
  }

  return `Treasury operating summary: ${pendingPayments} open payment items, ${criticalAlerts} critical alerts, ${generatedReports} generated reports, and ${unhealthyIntegrations} connectors requiring intervention. Refine the question for a more specific operational answer.`;
}

async function resolveApprovalWorkflowId(context: TreasuryApiContext, amount: number) {
  const workflows = await selectMany(
    context.supabase,
    "approval_workflows",
    "id, name, rules_json, status, updated_at",
    context.organizationId,
    { orderBy: "updated_at", ascending: false, limit: 20 }
  );

  const activeWorkflows = workflows.filter((workflow: JsonRecord) => workflow.status === "active");
  if (!activeWorkflows.length) {
    return null;
  }

  const ranked = [...activeWorkflows].sort((left: JsonRecord, right: JsonRecord) => {
    const leftThreshold = Number((left.rules_json as JsonRecord | undefined)?.thresholdAmount ?? 0);
    const rightThreshold = Number((right.rules_json as JsonRecord | undefined)?.thresholdAmount ?? 0);
    return rightThreshold - leftThreshold;
  });

  const matched = ranked.find((workflow: JsonRecord) => {
    const threshold = Number((workflow.rules_json as JsonRecord | undefined)?.thresholdAmount ?? 0);
    return amount >= threshold;
  });

  return String((matched ?? ranked[ranked.length - 1])?.id ?? "");
}

async function getRequiredWorkflowSteps(
  context: TreasuryApiContext,
  workflowId: string,
  amount: number
) {
  const steps = await selectByColumn(
    context.supabase,
    "approval_workflow_steps",
    "id, approval_workflow_id, step_order, approver_reference, threshold_json",
    "approval_workflow_id",
    workflowId,
    { orderBy: "step_order", ascending: true }
  );

  return steps.filter((step: JsonRecord) => {
    const minimumAmount = Number((step.threshold_json as JsonRecord | undefined)?.minimumAmount ?? 0);
    return amount >= minimumAmount;
  });
}

export function countApprovedSteps(approvals: JsonRecord[]) {
  return approvals.filter((approval) => String(approval.decision) === "approved").length;
}

export function calculateApprovalStatus({
  requiredSteps,
  existingApprovals,
  latestDecision
}: {
  requiredSteps: JsonRecord[];
  existingApprovals: JsonRecord[];
  latestDecision: string;
}) {
  const approvedCount = countApprovedSteps(existingApprovals) + (latestDecision === "approved" ? 1 : 0);
  return approvedCount >= Math.max(requiredSteps.length, 1) ? "approved" : "submitted";
}

async function selectPaymentApprovals(context: TreasuryApiContext) {
  const approvals = await (context.supabase as any)
    .from("payment_approvals")
    .select("id, payment_id, approver_user_id, decision, decision_reason, decided_at, step_up_verified, created_at")
    .order("created_at", { ascending: false })
    .limit(25);
  throwIfSupabaseError(approvals.error);
  return approvals.data ?? [];
}

async function selectWorkflowSteps(context: TreasuryApiContext) {
  const workflows = await selectMany(context.supabase, "approval_workflows", "id", context.organizationId);
  const workflowIds = workflows.map((workflow: JsonRecord) => String(workflow.id));
  if (!workflowIds.length) {
    return [];
  }

  const query = await (context.supabase as any)
    .from("approval_workflow_steps")
    .select("id, approval_workflow_id, step_order, approver_type, approver_reference, threshold_json, created_at")
    .in("approval_workflow_id", workflowIds)
    .order("step_order", { ascending: true });
  throwIfSupabaseError(query.error);
  return query.data ?? [];
}

async function selectCovenantTests(context: TreasuryApiContext) {
  const facilities = await selectMany(context.supabase, "debt_facilities", "id", context.organizationId);
  const facilityIds = facilities.map((facility: JsonRecord) => String(facility.id));
  if (!facilityIds.length) {
    return [];
  }

  const query = await (context.supabase as any)
    .from("covenant_tests")
    .select("id, debt_facility_id, metric_name, threshold_value, actual_value, test_date, status, created_at")
    .in("debt_facility_id", facilityIds)
    .order("test_date", { ascending: false });
  throwIfSupabaseError(query.error);
  return query.data ?? [];
}

async function selectIntegrationRuns(context: TreasuryApiContext) {
  const connections = await selectMany(context.supabase, "integration_connections", "id", context.organizationId);
  const connectionIds = connections.map((connection: JsonRecord) => String(connection.id));
  if (!connectionIds.length) {
    return [];
  }

  const query = await (context.supabase as any)
    .from("integration_sync_runs")
    .select("id, integration_connection_id, sync_type, status, started_at, completed_at, records_processed, error_summary, metadata_json")
    .in("integration_connection_id", connectionIds)
    .order("started_at", { ascending: false });
  throwIfSupabaseError(query.error);
  return query.data ?? [];
}

async function getRateMap(context: TreasuryApiContext, reportingCurrencyCode: string) {
  const rates = await selectMany(
    context.supabase,
    "currency_rates",
    "base_currency_code, quote_currency_code, rate, observed_at",
    undefined,
    {
      filters: [{ column: "quote_currency_code", value: reportingCurrencyCode }],
      orderBy: "observed_at",
      ascending: false,
      limit: 50
    }
  );
  const map: Record<string, number> = { [reportingCurrencyCode]: 1 };

  rates.forEach((rate: JsonRecord) => {
    const base = String(rate.base_currency_code);
    if (!(base in map)) {
      map[base] = Number(rate.rate ?? 1);
    }
  });

  return map;
}

function findFxRate(rates: FxRateRow[], base: string, quote: string) {
  if (base === quote) {
    return 1;
  }

  const direct = rates.find(
    (rate) => rate.base_currency_code === base && rate.quote_currency_code === quote
  );
  if (direct) {
    return Number(direct.rate);
  }

  const inverse = rates.find(
    (rate) => rate.base_currency_code === quote && rate.quote_currency_code === base
  );
  if (inverse) {
    return 1 / Number(inverse.rate);
  }

  return null;
}

function computeAverageNet(transactions: JsonRecord[]) {
  if (!transactions.length) {
    return 0;
  }

  const total = transactions.reduce((sum, transaction) => {
    const amount = Number(transaction.amount ?? 0);
    return sum + (transaction.direction === "credit" ? amount : -amount);
  }, 0);
  return total / Math.max(Math.ceil(transactions.length / 10), 1);
}

function weekOffsetFromToday(dateValue: string) {
  const due = new Date(dateValue);
  const today = new Date();
  const diff = due.getTime() - today.getTime();
  return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24 * 7)), 0);
}

async function selectMany(
  supabase: SupabaseClient,
  table: string,
  columns: string,
  organizationId?: string,
  options?: {
    filters?: Array<{ column: string; value: unknown; operator?: "eq" | "in"; multiValue?: unknown[] }>;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
    selectOrgViaTable?: string;
    selectOrgKey?: string;
    selectOrgForeignKey?: string;
  }
) {
  let query = (supabase as any).from(table).select(columns);

  if (organizationId && !options?.selectOrgViaTable) {
    query = query.eq("organization_id", organizationId);
  }

  options?.filters?.forEach((filter) => {
    query =
      filter.operator === "in"
        ? query.in(filter.column, filter.multiValue ?? [filter.value])
        : query.eq(filter.column, filter.value);
  });

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const result = await query;
  throwIfSupabaseError(result.error);

  let data = result.data ?? [];
  if (organizationId && options?.selectOrgViaTable && options.selectOrgKey && options.selectOrgForeignKey) {
    const orgParents = await selectMany(
      supabase,
      options.selectOrgViaTable,
      `${options.selectOrgForeignKey}, organization_id`,
      organizationId
    );
    const allowedIds = new Set(
      orgParents.map((row: JsonRecord) => String(row[options.selectOrgForeignKey!]))
    );
    data = data.filter((row: JsonRecord) => allowedIds.has(String(row[options.selectOrgKey!])));
  }

  return data;
}

async function selectByColumn(
  supabase: SupabaseClient,
  table: string,
  columns: string,
  column: string,
  value: unknown,
  options?: { orderBy?: string; ascending?: boolean }
) {
  let query = (supabase as any).from(table).select(columns).eq(column, value);
  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  }
  const result = await query;
  throwIfSupabaseError(result.error);
  return result.data ?? [];
}

async function selectOne(
  supabase: SupabaseClient,
  table: string,
  columns: string,
  organizationId?: string,
  filters: Array<{ column: string; value: unknown }> = [],
  options?: { orderBy?: string; ascending?: boolean }
) {
  let query = (supabase as any).from(table).select(columns);
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }
  filters.forEach((filter) => {
    query = query.eq(filter.column, filter.value);
  });
  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  }
  query = query.limit(1).maybeSingle();
  const result = await query;
  throwIfSupabaseError(result.error);
  return result.data ?? null;
}

async function insertOne(supabase: SupabaseClient, table: string, values: JsonRecord) {
  const result = await (supabase as any).from(table).insert(values).select("*").single();
  throwIfSupabaseError(result.error);
  return result.data as JsonRecord;
}

async function insertMany(supabase: SupabaseClient, table: string, values: JsonRecord[]) {
  const result = await (supabase as any).from(table).insert(values).select("*");
  throwIfSupabaseError(result.error);
  return result.data ?? [];
}

async function updateOne(supabase: SupabaseClient, table: string, id: string, values: JsonRecord) {
  const result = await (supabase as any)
    .from(table)
    .update(values)
    .eq("id", id)
    .select("*")
    .single();
  throwIfSupabaseError(result.error);
  return result.data as JsonRecord;
}

async function getFirstId(supabase: SupabaseClient, table: string, organizationId: string) {
  const record = await selectOne(supabase, table, "id", organizationId, [], {
    orderBy: "created_at",
    ascending: true
  });
  return record ? String(record.id) : null;
}

function currentDateOffset(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function throwIfSupabaseError(error: { message?: string } | null) {
  if (error) {
    throw new ApiError(400, error.message ?? "Supabase request failed.");
  }
}
