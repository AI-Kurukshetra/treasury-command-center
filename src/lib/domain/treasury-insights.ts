import { getDebtPayload, getInvestmentsPayload, getLiquidityPayload, getPaymentsPayload, getRiskPayload } from "@/lib/domain/treasury-api";

type InsightTone = "info" | "warning" | "critical" | "positive";

export type TreasuryInsight = {
  id: string;
  title: string;
  detail: string;
  action: string;
  tone: InsightTone;
  category: "liquidity" | "risk" | "funding" | "payments" | "esg";
};

export type TreasuryInsightsPayload = {
  insights: TreasuryInsight[];
  summary: {
    criticalCount: number;
    recommendationCount: number;
    esgTaggedInvestments: number;
  };
};

type ExposureRecord = {
  exposure_currency_code: string | null;
  gross_amount: number;
  net_amount: number | null;
};

type HedgeRecord = {
  currency_code: string;
  notional_amount: number;
};

type CovenantTestRecord = {
  metric_name: string;
  threshold_value: number;
  actual_value: number;
  status: string;
};

type PaymentRecord = {
  currency_code: string;
  payment_type: string;
  amount: number;
  status: string;
};

type InvestmentRecord = {
  esg_label: string | null;
  current_value: number;
};

type LiquidityLoanRecord = {
  outstanding_amount: number;
};

export async function getTreasuryInsights(): Promise<TreasuryInsightsPayload> {
  const [riskPayload, debtPayload, paymentsPayload, investmentsPayload, liquidityPayload] = await Promise.all([
    getRiskPayload(),
    getDebtPayload(),
    getPaymentsPayload(),
    getInvestmentsPayload(),
    getLiquidityPayload()
  ]);

  const exposures = riskPayload.exposures as ExposureRecord[];
  const hedges = riskPayload.hedges as HedgeRecord[];
  const covenantTests = debtPayload.covenantTests as CovenantTestRecord[];
  const payments = paymentsPayload.payments as PaymentRecord[];
  const investments = investmentsPayload.investments as InvestmentRecord[];
  const loans = liquidityPayload.loans as LiquidityLoanRecord[];

  const insights: TreasuryInsight[] = [];

  const openFx = exposures.reduce((sum, exposure) => sum + Number(exposure.net_amount ?? exposure.gross_amount ?? 0), 0);
  const hedgeCoverage = hedges.reduce((sum, hedge) => sum + Number(hedge.notional_amount ?? 0), 0);
  if (openFx > hedgeCoverage * 1.15) {
    insights.push({
      id: "hedge-gap",
      title: "Open exposure exceeds hedge coverage",
      detail: `Net measured exposure is ${openFx.toFixed(0)} while visible hedge coverage is ${hedgeCoverage.toFixed(0)}. Consider layering another hedge or reducing uncovered positions.`,
      action: "Review hedge book",
      tone: "warning",
      category: "risk"
    });
  }

  const breachedCovenants = covenantTests.filter((test) => test.status === "breach");
  if (breachedCovenants.length) {
    insights.push({
      id: "covenant-breach",
      title: "Covenant breach risk detected",
      detail: `${breachedCovenants.length} covenant test records are in breach. Reforecast debt headroom and prepare an escalation pack before the next lender review.`,
      action: "Open debt controls",
      tone: "critical",
      category: "funding"
    });
  }

  const internationalPayments = payments.filter(
    (payment) => payment.payment_type === "international" && ["draft", "submitted"].includes(payment.status)
  );
  if (internationalPayments.length) {
    const total = internationalPayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    insights.push({
      id: "payment-routing",
      title: "Cross-border routing opportunity",
      detail: `${internationalPayments.length} international payments remain in-flight with approximately ${total.toFixed(0)} in notional value. Review correspondent-bank routing before release.`,
      action: "Optimize release route",
      tone: "info",
      category: "payments"
    });
  }

  const esgTaggedInvestments = investments.filter((investment) => Boolean(investment.esg_label));
  if (esgTaggedInvestments.length) {
    const esgValue = esgTaggedInvestments.reduce(
      (sum, investment) => sum + Number(investment.current_value ?? 0),
      0
    );
    insights.push({
      id: "esg-portfolio",
      title: "ESG-tagged treasury capital tracked",
      detail: `${esgTaggedInvestments.length} investments are tagged for ESG reporting, representing ${esgValue.toFixed(0)} in current value.`,
      action: "Prepare ESG disclosure",
      tone: "positive",
      category: "esg"
    });
  }

  const intercompanyOutstanding = loans.reduce(
    (sum, loan) => sum + Number(loan.outstanding_amount ?? 0),
    0
  );
  if (intercompanyOutstanding > 0) {
    insights.push({
      id: "liquidity-netting",
      title: "Intercompany funding can support concentration",
      detail: `Outstanding intercompany balances total ${intercompanyOutstanding.toFixed(0)}. Use them to plan internal netting and reduce external draw usage.`,
      action: "Review liquidity transfers",
      tone: "info",
      category: "liquidity"
    });
  }

  if (!insights.length) {
    insights.push({
      id: "stable-posture",
      title: "Treasury posture is stable",
      detail: "No major gaps were detected across the current payment, liquidity, debt, and exposure datasets.",
      action: "Monitor operating windows",
      tone: "positive",
      category: "liquidity"
    });
  }

  return {
    insights,
    summary: {
      criticalCount: insights.filter((insight) => insight.tone === "critical").length,
      recommendationCount: insights.length,
      esgTaggedInvestments: esgTaggedInvestments.length
    }
  };
}
