export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type PublicTable<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: never[];
};

export type Database = {
  public: {
    Tables: {
      organizations: PublicTable<{
        id: string;
        name: string;
        slug: string;
        status: string;
        base_currency_code: string;
        settings_json: Json;
        created_at: string;
        updated_at: string;
      }>;
      profiles: PublicTable<{
        id: string;
        full_name: string | null;
        role_label: string;
        created_at: string;
        updated_at: string;
      }>;
      organization_memberships: PublicTable<{
        id: string;
        organization_id: string;
        user_id: string;
        status: string;
        is_default: boolean;
        created_at: string;
        updated_at: string;
      }>;
      bank_accounts: PublicTable<{
        id: string;
        organization_id: string;
        subsidiary_id: string | null;
        bank_relationship_id: string | null;
        account_name: string;
        account_number_masked: string;
        currency_code: string;
        account_type: string;
        status: string;
        last_balance_at: string | null;
        created_at: string;
        updated_at: string;
      }>;
      cash_position_snapshots: PublicTable<{
        id: string;
        organization_id: string;
        snapshot_time: string;
        reporting_currency_code: string;
        freshness_status: string;
        created_at: string;
      }>;
      cash_position_lines: PublicTable<{
        id: string;
        cash_position_snapshot_id: string;
        subsidiary_id: string | null;
        bank_account_id: string | null;
        currency_code: string;
        balance_amount: number;
        reporting_amount: number;
        created_at: string;
      }>;
      cash_flow_forecasts: PublicTable<{
        id: string;
        organization_id: string;
        name: string;
        horizon_type: string;
        methodology: string;
        reporting_currency_code: string;
        status: string;
        accuracy_score: number | null;
        created_at: string;
        updated_at: string;
      }>;
      forecast_lines: PublicTable<{
        id: string;
        cash_flow_forecast_id: string;
        subsidiary_id: string | null;
        forecast_date: string;
        inflow_amount: number;
        outflow_amount: number;
        net_amount: number;
        currency_code: string;
        reporting_amount: number;
      }>;
      payments: PublicTable<{
        id: string;
        organization_id: string;
        subsidiary_id: string | null;
        source_bank_account_id: string | null;
        approval_workflow_id: string | null;
        beneficiary_name: string;
        payment_type: string;
        amount: number;
        currency_code: string;
        requested_execution_date: string;
        purpose: string | null;
        status: string;
        created_by: string | null;
        created_at: string;
        updated_at: string;
      }>;
      notifications: PublicTable<{
        id: string;
        organization_id: string;
        user_id: string | null;
        channel: string;
        notification_type: string;
        severity: string;
        title: string;
        body: string;
        status: string;
        created_at: string;
        read_at: string | null;
        updated_at: string;
      }>;
      integration_connections: PublicTable<{
        id: string;
        organization_id: string;
        integration_type: string;
        provider_name: string;
        status: string;
        credentials_reference: string | null;
        config_json: Json;
        last_success_at: string | null;
        created_at: string;
        updated_at: string;
      }>;
      risk_exposures: PublicTable<{
        id: string;
        organization_id: string;
        subsidiary_id: string | null;
        exposure_type: string;
        reference_entity_type: string;
        reference_entity_id: string | null;
        exposure_currency_code: string | null;
        gross_amount: number;
        net_amount: number | null;
        measured_at: string;
        created_at: string;
      }>;
      compliance_reports: PublicTable<{
        id: string;
        organization_id: string;
        report_type: string;
        period_start: string | null;
        period_end: string | null;
        status: string;
        storage_key: string | null;
        created_by_user_id: string | null;
        created_at: string;
        updated_at: string;
      }>;
      roles: PublicTable<{
        id: string;
        organization_id: string;
        name: string;
        description: string | null;
        permission_codes_json: Json;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      user_role_assignments: PublicTable<{
        id: string;
        organization_id: string;
        user_id: string;
        role_id: string;
        status: string;
        assigned_by: string | null;
        created_at: string;
      }>;
      bank_statements: PublicTable<{
        id: string;
        organization_id: string;
        bank_account_id: string | null;
        statement_date: string;
        source_type: string;
        file_name: string;
        processing_status: string;
        opening_balance: number;
        closing_balance: number;
        raw_text: string | null;
        created_at: string;
        updated_at: string;
      }>;
      reconciliation_runs: PublicTable<{
        id: string;
        organization_id: string;
        bank_account_id: string | null;
        run_date: string;
        status: string;
        matched_count: number;
        exception_count: number;
        created_at: string;
        updated_at: string;
      }>;
      reconciliation_items: PublicTable<{
        id: string;
        reconciliation_run_id: string;
        transaction_id: string | null;
        internal_reference: string | null;
        status: string;
        variance_amount: number;
        notes: string | null;
        created_at: string;
      }>;
      forecast_scenarios: PublicTable<{
        id: string;
        organization_id: string;
        cash_flow_forecast_id: string | null;
        name: string;
        scenario_type: string;
        assumptions_json: Json;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      electronic_signatures: PublicTable<{
        id: string;
        organization_id: string;
        payment_id: string;
        signer_user_id: string | null;
        provider_name: string;
        status: string;
        signed_at: string | null;
        created_at: string;
      }>;
      intercompany_loans: PublicTable<{
        id: string;
        organization_id: string;
        lender_subsidiary_id: string | null;
        borrower_subsidiary_id: string | null;
        currency_code: string;
        principal_amount: number;
        outstanding_amount: number;
        interest_rate: number;
        maturity_date: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      market_data_points: PublicTable<{
        id: string;
        organization_id: string;
        provider_name: string;
        instrument_type: string;
        symbol: string;
        value_numeric: number;
        observed_at: string;
        created_at: string;
      }>;
      hedging_instruments: PublicTable<{
        id: string;
        organization_id: string;
        exposure_id: string | null;
        counterparty_id: string | null;
        instrument_type: string;
        currency_code: string;
        notional_amount: number;
        mtm_amount: number;
        maturity_date: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      investments: PublicTable<{
        id: string;
        organization_id: string;
        counterparty_id: string | null;
        investment_type: string;
        instrument_name: string;
        principal_amount: number;
        current_value: number;
        currency_code: string;
        maturity_date: string | null;
        esg_label: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      debt_facilities: PublicTable<{
        id: string;
        organization_id: string;
        lender_name: string;
        facility_type: string;
        currency_code: string;
        committed_amount: number;
        drawn_amount: number;
        maturity_date: string | null;
        covenant_summary: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      covenant_tests: PublicTable<{
        id: string;
        debt_facility_id: string;
        metric_name: string;
        threshold_value: number;
        actual_value: number;
        test_date: string;
        status: string;
        created_at: string;
      }>;
      treasury_events: PublicTable<{
        id: string;
        organization_id: string;
        event_type: string;
        title: string;
        due_date: string;
        related_entity_type: string | null;
        related_entity_id: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      treasury_policies: PublicTable<{
        id: string;
        organization_id: string;
        name: string;
        policy_type: string;
        policy_json: Json;
        version: number;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      workflow_rules: PublicTable<{
        id: string;
        organization_id: string;
        approval_workflow_id: string | null;
        name: string;
        trigger_type: string;
        rule_json: Json;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      mobile_devices: PublicTable<{
        id: string;
        organization_id: string;
        user_id: string;
        device_label: string;
        platform: string;
        biometric_enabled: boolean;
        last_seen_at: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      dashboards: PublicTable<{
        id: string;
        organization_id: string;
        user_id: string;
        name: string;
        layout_json: Json;
        is_default: boolean;
        created_at: string;
        updated_at: string;
      }>;
      dashboard_widgets: PublicTable<{
        id: string;
        dashboard_id: string;
        widget_type: string;
        title: string;
        config_json: Json;
        position_index: number;
        created_at: string;
        updated_at: string;
      }>;
      query_threads: PublicTable<{
        id: string;
        organization_id: string;
        user_id: string;
        title: string;
        prompt_text: string;
        response_text: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      platform_settings: PublicTable<{
        id: string;
        organization_id: string;
        category: string;
        setting_key: string;
        setting_value_json: Json;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
