import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactCurrency } from "@/lib/utils";
import type { StatCard } from "@/types/treasury";

export function MetricCard({ item }: { item: StatCard }) {
  const isPositive = item.change >= 0;
  const formattedValue =
    item.format === "number"
      ? new Intl.NumberFormat("en-US").format(item.value)
      : formatCompactCurrency(item.value, item.currency);

  return (
    <Card className="relative overflow-hidden border-primary/10">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
      <CardHeader className="pb-4">
        <CardTitle className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {item.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-4xl font-semibold tracking-tight">{formattedValue}</p>
        </div>
        <div
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
            isPositive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {Math.abs(item.change).toFixed(1)}%
        </div>
      </CardContent>
    </Card>
  );
}
