/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiError } from "@/lib/api/errors";
import { getAppSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
type JsonRecord = Record<string, unknown>;
type IntegrationContext = {
  organizationId: string;
  userId: string;
  userName: string;
  supabase: SupabaseClient;
};
type IntegrationConnection = {
  id: string;
  integration_type: string;
  provider_name: string;
  status: string;
};
type ProviderHandler = (
  context: IntegrationContext,
  connection: IntegrationConnection,
  syncType: string
) => Promise<{ recordsProcessed: number; summary: string; metadata: JsonRecord }>;

const providerHandlers: Record<string, ProviderHandler> = {
  bank: runBankSync,
  erp: runErpSync,
  market_data: runMarketDataSync,
  ocr: runOcrSync,
  signature: runSignatureSync
};

export async function runIntegrationSync(payload: unknown) {
  const context = await getIntegrationContext();
  const body = normalizeSyncPayload(payload);
  const connection = (await selectOne(
    context.supabase,
    "integration_connections",
    "id, integration_type, provider_name, status",
    context.organizationId,
    [{ column: "id", value: body.integrationConnectionId }]
  )) as IntegrationConnection | null;

  if (!connection) {
    throw new ApiError(404, "Integration connection not found.");
  }

  const handler = providerHandlers[connection.integration_type];
  if (!handler) {
    throw new ApiError(400, `No sync handler configured for ${connection.integration_type}.`);
  }

  const syncRun = await insertOne(context.supabase, "integration_sync_runs", {
    integration_connection_id: connection.id,
    sync_type: body.syncType,
    status: "running",
    metadata_json: { initiated_by: context.userId }
  });

  try {
    const result = await handler(context, connection, body.syncType);

    await updateById(context.supabase, "integration_sync_runs", String(syncRun.id), {
      status: "succeeded",
      completed_at: new Date().toISOString(),
      records_processed: result.recordsProcessed,
      metadata_json: result.metadata
    });
    await updateById(context.supabase, "integration_connections", connection.id, {
      status: "active",
      last_success_at: new Date().toISOString()
    });
    await insertOne(context.supabase, "notifications", {
      organization_id: context.organizationId,
      user_id: context.userId,
      channel: "in_app",
      notification_type: "integration_sync",
      severity: "info",
      title: `${connection.provider_name} sync completed`,
      body: result.summary,
      status: "queued"
    });
    await createAuditLog(
      context,
      "integrations.sync_completed",
      "integration_sync_run",
      String(syncRun.id),
      {
        integrationConnectionId: connection.id,
        integrationType: connection.integration_type,
        recordsProcessed: result.recordsProcessed
      }
    );

    return {
      ok: true,
      syncRunId: syncRun.id,
      recordsProcessed: result.recordsProcessed,
      summary: result.summary
    };
  } catch (error) {
    await updateById(context.supabase, "integration_sync_runs", String(syncRun.id), {
      status: "failed",
      completed_at: new Date().toISOString(),
      error_summary: error instanceof Error ? error.message : "Sync failed."
    });
    throw error;
  }
}

async function runBankSync(
  context: IntegrationContext,
  connection: IntegrationConnection,
  syncType: string
) {
  const subsidiaryId =
    (await getFirstId(context.supabase, "subsidiaries", context.organizationId)) ??
    (await ensureSubsidiary(context, "Treasury Operations"));
  const relationshipId =
    (await getFirstId(context.supabase, "bank_relationships", context.organizationId)) ??
    (
      await insertOne(context.supabase, "bank_relationships", {
        organization_id: context.organizationId,
        bank_name: connection.provider_name,
        bank_code: connection.provider_name.slice(0, 4).toUpperCase(),
        region: "Global"
      })
    ).id;
  const accountId =
    (await getFirstId(context.supabase, "bank_accounts", context.organizationId)) ??
    (
      await insertOne(context.supabase, "bank_accounts", {
        organization_id: context.organizationId,
        subsidiary_id: subsidiaryId,
        bank_relationship_id: relationshipId,
        account_name: `${connection.provider_name} Operating`,
        account_number_masked: "****1001",
        currency_code: "USD",
        account_type: "operating"
      })
    ).id;

  const statement = await insertOne(context.supabase, "bank_statements", {
    organization_id: context.organizationId,
    bank_account_id: accountId,
    statement_date: currentDate(),
    source_type: "api",
    file_name: `${connection.provider_name.toLowerCase().replaceAll(" ", "-")}-${currentDate()}.json`,
    processing_status: "completed",
    opening_balance: 500000,
    closing_balance: 685000
  });

  await insertMany(context.supabase, "transactions", [
    {
      organization_id: context.organizationId,
      bank_account_id: accountId,
      subsidiary_id: subsidiaryId,
      source_system: connection.provider_name,
      transaction_date: currentDate(),
      value_date: currentDate(),
      direction: "credit",
      amount: 185000,
      currency_code: "USD",
      description: "Imported customer collections",
      status: "booked"
    },
    {
      organization_id: context.organizationId,
      bank_account_id: accountId,
      subsidiary_id: subsidiaryId,
      source_system: connection.provider_name,
      transaction_date: currentDate(),
      value_date: currentDate(),
      direction: "debit",
      amount: 42000,
      currency_code: "USD",
      description: "Imported supplier settlement",
      status: "booked"
    }
  ]);

  return {
    recordsProcessed: 3,
    summary: `${connection.provider_name} imported a statement and 2 transactions via ${syncType}.`,
    metadata: {
      statementId: statement.id,
      importedTransactions: 2
    }
  };
}

async function runErpSync(
  context: IntegrationContext,
  connection: IntegrationConnection,
  syncType: string
) {
  const counterpartyId =
    (await getFirstId(context.supabase, "counterparties", context.organizationId)) ??
    (
      await insertOne(context.supabase, "counterparties", {
        organization_id: context.organizationId,
        name: "ERP Imported Vendor",
        type: "vendor",
        country_code: "US",
        default_currency_code: "USD"
      })
    ).id;
  const subsidiaryId =
    (await getFirstId(context.supabase, "subsidiaries", context.organizationId)) ??
    (await ensureSubsidiary(context, "ERP Shared Services"));
  const bankAccountId = await getFirstId(context.supabase, "bank_accounts", context.organizationId);

  const payment = await insertOne(context.supabase, "payments", {
    organization_id: context.organizationId,
    subsidiary_id: subsidiaryId,
    source_bank_account_id: bankAccountId,
    beneficiary_name: "ERP Imported Vendor",
    payment_type: "domestic",
    amount: 94000,
    currency_code: "USD",
    requested_execution_date: currentDateOffset(3),
    purpose: `Imported from ${connection.provider_name}`,
    status: "submitted",
    created_by: context.userId
  });

  await insertOne(context.supabase, "transactions", {
    organization_id: context.organizationId,
    bank_account_id: bankAccountId,
    subsidiary_id: subsidiaryId,
    source_system: connection.provider_name,
    transaction_date: currentDate(),
    value_date: currentDate(),
    direction: "debit",
    amount: 94000,
    currency_code: "USD",
    description: "ERP payable export",
    status: "pending"
  });

  return {
    recordsProcessed: 2,
    summary: `${connection.provider_name} synchronized one payable and one transaction reference via ${syncType}.`,
    metadata: {
      counterpartyId,
      paymentId: payment.id
    }
  };
}

async function runMarketDataSync(
  context: IntegrationContext,
  connection: IntegrationConnection,
  syncType: string
) {
  await insertMany(context.supabase, "currency_rates", [
    {
      base_currency_code: "USD",
      quote_currency_code: "EUR",
      rate: 0.92,
      source: connection.provider_name,
      observed_at: new Date().toISOString()
    },
    {
      base_currency_code: "USD",
      quote_currency_code: "GBP",
      rate: 0.79,
      source: connection.provider_name,
      observed_at: new Date().toISOString()
    }
  ]);

  await insertMany(context.supabase, "market_data_points", [
    {
      organization_id: context.organizationId,
      provider_name: connection.provider_name,
      instrument_type: "fx",
      symbol: "USD/EUR",
      value_numeric: 0.92,
      observed_at: new Date().toISOString()
    },
    {
      organization_id: context.organizationId,
      provider_name: connection.provider_name,
      instrument_type: "interest_rate",
      symbol: "SOFR",
      value_numeric: 5.15,
      observed_at: new Date().toISOString()
    }
  ]);

  return {
    recordsProcessed: 4,
    summary: `${connection.provider_name} refreshed FX and market data points via ${syncType}.`,
    metadata: {
      fxPairs: ["USD/EUR", "USD/GBP"],
      observations: 2
    }
  };
}

async function runOcrSync(
  context: IntegrationContext,
  connection: IntegrationConnection,
  syncType: string
) {
  const bankAccountId = await getFirstId(context.supabase, "bank_accounts", context.organizationId);
  if (!bankAccountId) {
    throw new ApiError(400, "Create a bank account before running OCR statement extraction.");
  }

  const statement = await insertOne(context.supabase, "bank_statements", {
    organization_id: context.organizationId,
    bank_account_id: bankAccountId,
    statement_date: currentDate(),
    source_type: "ocr",
    file_name: `ocr-${currentDate()}.pdf`,
    processing_status: "completed",
    opening_balance: 300000,
    closing_balance: 327500,
    raw_text: "Extracted statement text"
  });

  return {
    recordsProcessed: 1,
    summary: `${connection.provider_name} completed OCR extraction for one statement via ${syncType}.`,
    metadata: { statementId: statement.id }
  };
}

async function runSignatureSync(
  context: IntegrationContext,
  connection: IntegrationConnection,
  syncType: string
) {
  const paymentId =
    (await getFirstId(context.supabase, "payments", context.organizationId)) ??
    (
      await insertOne(context.supabase, "payments", {
        organization_id: context.organizationId,
        beneficiary_name: "Signature Test Counterparty",
        payment_type: "domestic",
        amount: 10000,
        currency_code: "USD",
        requested_execution_date: currentDateOffset(1),
        status: "approved",
        created_by: context.userId
      })
    ).id;

  const signature = await insertOne(context.supabase, "electronic_signatures", {
    organization_id: context.organizationId,
    payment_id: paymentId,
    signer_user_id: context.userId,
    provider_name: connection.provider_name,
    status: "signed",
    signed_at: new Date().toISOString()
  });

  return {
    recordsProcessed: 1,
    summary: `${connection.provider_name} registered a signed approval event via ${syncType}.`,
    metadata: { signatureId: signature.id, paymentId }
  };
}

async function getIntegrationContext(): Promise<IntegrationContext> {
  const [session, supabase] = await Promise.all([getAppSession(), createSupabaseServerClient()]);

  if (!session || !supabase || session.organization.id === "unassigned") {
    throw new ApiError(401, "Unauthorized");
  }

  return {
    organizationId: session.organization.id,
    userId: session.user.id,
    userName: session.user.name,
    supabase
  };
}

function normalizeSyncPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new ApiError(400, "Request body is required.");
  }

  const body = payload as Record<string, unknown>;
  const integrationConnectionId = String(body.integrationConnectionId ?? "").trim();
  const syncType = String(body.syncType ?? "").trim() || "manual";

  if (!integrationConnectionId) {
    throw new ApiError(400, "Integration connection ID is required.");
  }

  return { integrationConnectionId, syncType };
}

async function ensureSubsidiary(context: IntegrationContext, name: string) {
  const record = await insertOne(context.supabase, "subsidiaries", {
    organization_id: context.organizationId,
    name,
    country_code: "US",
    base_currency_code: "USD"
  });
  return String(record.id);
}

async function createAuditLog(
  context: IntegrationContext,
  action: string,
  entityType: string,
  entityId: string,
  metadataJson: JsonRecord
) {
  await insertOne(context.supabase, "audit_logs", {
    organization_id: context.organizationId,
    actor_user_id: context.userId,
    actor_type: "user",
    action,
    entity_type: entityType,
    entity_id: entityId,
    severity: "info",
    metadata_json: metadataJson
  });
}

async function selectOne(
  supabase: SupabaseClient,
  table: string,
  columns: string,
  organizationId?: string,
  filters: Array<{ column: string; value: unknown }> = []
) {
  let query = (supabase as any).from(table).select(columns);
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }
  filters.forEach((filter) => {
    query = query.eq(filter.column, filter.value);
  });
  const result = await query.limit(1).maybeSingle();
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

async function updateById(supabase: SupabaseClient, table: string, id: string, values: JsonRecord) {
  const result = await (supabase as any).from(table).update(values).eq("id", id).select("*").single();
  throwIfSupabaseError(result.error);
  return result.data ?? null;
}

async function getFirstId(supabase: SupabaseClient, table: string, organizationId: string) {
  const record = await selectOne(supabase, table, "id", organizationId);
  return record ? String(record.id) : null;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
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
