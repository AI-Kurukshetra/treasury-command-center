import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModuleSummary } from "@/types/modules";

type ModuleSummaryCardProps = {
  module: ModuleSummary;
};

export function ModuleSummaryCard({ module }: ModuleSummaryCardProps) {
  return (
    <Link href={module.route as Route}>
      <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-panel">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <Badge variant="secondary">{module.id}</Badge>
            <Badge
              variant={
                module.health === "live"
                  ? "success"
                  : module.health === "partial"
                    ? "warning"
                    : "outline"
              }
            >
              {module.health}
            </Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">{module.title}</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">{module.description}</p>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm">
          <span className="uppercase tracking-[0.18em] text-muted-foreground">{module.priority}</span>
          <span className="font-semibold">
            {module.recordCount} {module.recordsLabel}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
