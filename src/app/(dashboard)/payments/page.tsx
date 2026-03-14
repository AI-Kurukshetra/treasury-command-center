import { ActionCard } from "@/components/operations/action-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getPaymentsPayload } from "@/lib/domain/treasury-api";
import { formatCurrency } from "@/lib/utils";

type PaymentRecord = {
  id: string;
  beneficiary_name: string;
  amount: number;
  currency_code: string;
  requested_execution_date: string;
  status: string;
  payment_type: string;
};

type ApprovalRecord = {
  id: string;
  payment_id: string;
  decision: string;
  decided_at: string | null;
  step_up_verified: boolean;
};

type SignatureRecord = {
  id: string;
  payment_id: string;
  provider_name: string;
  status: string;
  signed_at: string | null;
};

export default async function PaymentsPage() {
  const paymentsPayload = await getPaymentsPayload();
  const payments = paymentsPayload.payments as PaymentRecord[];
  const approvals = paymentsPayload.approvals as ApprovalRecord[];
  const signatures = paymentsPayload.signatures as SignatureRecord[];
  const atRiskCount = payments.filter((payment) => payment.status === "rejected").length;

  return (
    <>
      <PageHeader
        eyebrow="Payments"
        title="Approval and release queue"
        description="View submitted items, remaining approval steps, and payments that need escalation before release."
        meta={["Approval routing", "Release watch", "Escalation aware"]}
      />
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Queue signal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Visible items</p>
              <p className="mt-3 font-display text-4xl font-semibold">{payments.length}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">At risk</p>
              <p className="mt-3 font-display text-4xl font-semibold">{atRiskCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payments.length ? (
              payments.map((payment) => {
                const paymentApprovals = approvals.filter((approval) => approval.payment_id === payment.id);
                const approvalsRemaining = Math.max(
                  paymentApprovals.filter((approval) => approval.decision === "pending").length,
                  0
                );
                const hasRejected = paymentApprovals.some((approval) => approval.decision === "rejected");

                return (
                  <div
                    key={payment.id}
                    className="rounded-[1.5rem] border border-border/70 bg-white/68 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-xl font-semibold">{payment.beneficiary_name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{payment.id}</p>
                      </div>
                      <Badge
                        variant={
                          payment.status === "approved"
                            ? "success"
                            : hasRejected
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div className="rounded-[1.2rem] bg-background/80 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Amount</p>
                        <p className="mt-2 font-display text-2xl font-semibold">
                          {formatCurrency(payment.amount, payment.currency_code)}
                        </p>
                      </div>
                      <div className="rounded-[1.2rem] bg-background/80 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Due date</p>
                        <p className="mt-2 text-lg font-semibold">{payment.requested_execution_date}</p>
                      </div>
                      <div className="rounded-[1.2rem] bg-background/80 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Remaining approvals
                        </p>
                        <p className="mt-2 text-lg font-semibold">{approvalsRemaining}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {payment.payment_type} payment · {paymentApprovals.length} approval records ·{" "}
                      {signatures.filter((signature) => signature.payment_id === payment.id).length} signatures
                    </p>
                  </div>
                );
              })
            ) : (
              <SectionEmpty
                title="No payment items in queue"
                description="Create or import payment instructions to populate the approval and release queue."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Approval and signature history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvals.length ? (
              approvals.slice(0, 10).map((approval) => {
                const signature = signatures.find((entry) => entry.payment_id === approval.payment_id);

                return (
                  <div
                    key={approval.id}
                    className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{approval.payment_id}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Decision {approval.decision} · {approval.decided_at?.slice(0, 19) ?? "Pending"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          approval.decision === "approved"
                            ? "success"
                            : approval.decision === "rejected"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {approval.decision}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Step-up {approval.step_up_verified ? "verified" : "not verified"} · Signature{" "}
                      {signature
                        ? `${signature.status} via ${signature.provider_name}${signature.signed_at ? ` on ${signature.signed_at.slice(0, 10)}` : ""}`
                        : "not recorded"}
                    </p>
                  </div>
                );
              })
            ) : (
              <SectionEmpty
                title="No approval decisions yet"
                description="Payment approvals and signature events will accumulate here as the queue progresses."
              />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <ActionCard
            title="Initiate payment"
            description="Create a payment draft directly in the treasury workspace and route it into the approval engine."
            endpoint="/api/payments"
            submitLabel="Create payment"
            fields={[
              { name: "beneficiaryName", label: "Beneficiary", placeholder: "Acme Logistics" },
              { name: "amount", label: "Amount", type: "number", placeholder: "125000" },
              {
                name: "currencyCode",
                label: "Currency",
                type: "select",
                options: [
                  { label: "USD", value: "USD" },
                  { label: "EUR", value: "EUR" },
                  { label: "GBP", value: "GBP" }
                ]
              },
              {
                name: "requestedExecutionDate",
                label: "Requested execution date",
                type: "date"
              },
              { name: "purpose", label: "Purpose", type: "textarea", placeholder: "Supplier settlement" }
            ]}
          />
          <ActionCard
            title="Record approval decision"
            description="Approve or reject a payment and optionally register a signature event for audit coverage."
            endpoint="/api/approvals"
            submitLabel="Record decision"
            fields={[
              { name: "paymentId", label: "Payment ID", placeholder: payments[0]?.id ?? "Paste payment UUID" },
              {
                name: "decision",
                label: "Decision",
                type: "select",
                options: [
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                  { label: "Escalated", value: "escalated" }
                ]
              },
              { name: "reason", label: "Reason", type: "textarea", placeholder: "Optional rationale" },
              {
                name: "stepUpVerified",
                label: "Step-up verified",
                type: "select",
                options: [
                  { label: "True", value: "true" },
                  { label: "False", value: "false" }
                ],
                defaultValue: "false"
              },
              {
                name: "createSignature",
                label: "Create signature",
                type: "select",
                options: [
                  { label: "True", value: "true" },
                  { label: "False", value: "false" }
                ],
                defaultValue: "false"
              }
            ]}
          />
        </div>
      </section>
    </>
  );
}
