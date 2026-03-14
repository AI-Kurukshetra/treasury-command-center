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
      <Card className="h-full transition duration-200 hover:-translate-y-1 hover:shadow-[0_32px_80px_rgba(17,30,64,0.14)]">
        <CardHeader className="space-y-4">
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
            <CardTitle className="text-2xl">{module.title}</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">{module.description}</p>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 text-sm">
          <span className="rounded-full bg-background/90 px-3 py-1 uppercase tracking-[0.18em] text-muted-foreground">
            {module.priority}
          </span>
          <span className="font-semibold">
            {module.recordCount} {module.recordsLabel}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
