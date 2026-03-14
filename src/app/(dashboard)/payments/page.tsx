import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";
import { formatCurrency } from "@/lib/utils";

export default async function PaymentsPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <>
      <PageHeader
        eyebrow="Payments"
        title="Approval and release queue"
        description="View submitted items, remaining approval steps, and payments that need escalation before release."
      />
      <Card>
        <CardHeader>
          <CardTitle>Current queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshot.payments.length ? (
            snapshot.payments.map((payment) => (
              <div key={payment.id} className="rounded-xl border border-border bg-background/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{payment.beneficiary}</p>
                    <p className="text-sm text-muted-foreground">{payment.id}</p>
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
                <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Amount</p>
                    <p className="mt-2 font-semibold">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Due date</p>
                    <p className="mt-2 font-semibold">{payment.dueDate}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Remaining approvals
                    </p>
                    <p className="mt-2 font-semibold">{payment.approvalsRemaining}</p>
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
    </>
  );
}
