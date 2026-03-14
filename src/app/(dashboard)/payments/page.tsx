import { ActionCard } from "@/components/operations/action-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";
import { formatCurrency } from "@/lib/utils";

export default async function PaymentsPage() {
  const snapshot = await getDashboardSnapshot();
  const atRiskCount = snapshot.payments.filter((payment) => payment.status === "at-risk").length;

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
              <p className="mt-3 font-display text-4xl font-semibold">{snapshot.payments.length}</p>
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
            {snapshot.payments.length ? (
              snapshot.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-[1.5rem] border border-border/70 bg-white/68 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-xl font-semibold">{payment.beneficiary}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{payment.id}</p>
                    </div>
                    <Badge
                      variant={
                        payment.status === "approved"
                          ? "success"
                          : payment.status === "at-risk"
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
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Due date</p>
                      <p className="mt-2 text-lg font-semibold">{payment.dueDate}</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Remaining approvals
                      </p>
                      <p className="mt-2 text-lg font-semibold">{payment.approvalsRemaining}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No payment items in queue"
                description="Create or import payment instructions to populate the approval and release queue."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
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
            { name: "paymentId", label: "Payment ID", placeholder: "Paste payment UUID" },
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
      </section>
    </>
  );
}
