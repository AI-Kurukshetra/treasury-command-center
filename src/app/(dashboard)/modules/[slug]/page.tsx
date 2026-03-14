import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ModuleRecordForm } from "@/components/modules/module-record-form";
import { ModuleRecordList } from "@/components/modules/module-record-list";
import { getModuleDetail } from "@/lib/modules/service";
import { moduleSlugSchema } from "@/lib/modules/validators";

export default async function ModuleDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsedSlug = moduleSlugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    notFound();
  }

  const moduleDetail = await getModuleDetail(parsedSlug.data);
  if (!moduleDetail) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow={moduleDetail.id}
        title={moduleDetail.title}
        description={moduleDetail.description}
        meta={[moduleDetail.priority, moduleDetail.recordsLabel, moduleDetail.primaryTable]}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {moduleDetail.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="space-y-2 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {metric.label}
              </p>
              <p
                className={
                  metric.tone === "positive"
                    ? "text-2xl font-semibold text-emerald-600"
                    : metric.tone === "warning"
                      ? "text-2xl font-semibold text-amber-600"
                      : "text-2xl font-semibold"
                }
              >
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ModuleRecordList
          title={`Recent ${moduleDetail.recordsLabel}`}
          records={moduleDetail.records}
        />
        <ModuleRecordForm slug={moduleDetail.slug} fields={moduleDetail.fields} />
      </section>
    </>
  );
}
