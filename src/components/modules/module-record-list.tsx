import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import type { ModuleRecord } from "@/types/modules";

type ModuleRecordListProps = {
  title: string;
  records: ModuleRecord[];
};

export function ModuleRecordList({ title, records }: ModuleRecordListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {records.length ? (
          records.map((record) => (
            <div key={record.id} className="rounded-xl border border-border bg-background/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{record.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{record.description}</p>
                </div>
                <Badge variant={record.status === "active" || record.status === "completed" || record.status === "generated" || record.status === "processed" || record.status === "fresh" || record.status === "signed" || record.status === "delivered" ? "success" : record.status === "warning" || record.status === "queued" || record.status === "draft" || record.status === "pending" ? "warning" : "outline"}>
                  {record.status}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {record.meta.map((item) => (
                  <span key={`${record.id}-${item}`}>{item}</span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <SectionEmpty
            title="No records yet"
            description="Create the first module record to start populating this operational surface."
          />
        )}
      </CardContent>
    </Card>
  );
}
