import { ModuleSummaryCard } from "@/components/modules/module-summary-card";
import { PageHeader } from "@/components/layout/page-header";
import { getModuleCatalog } from "@/lib/modules/service";

export default async function ModulesPage() {
  const modules = await getModuleCatalog();

  return (
    <>
      <PageHeader
        eyebrow="Module Workspace"
        title="Full treasury module surface"
        description="Every documented module is available here with backend data, persisted schema, validated create flows, and dedicated operational context."
        meta={["18 modules", "Live Supabase data", "Validated workflows"]}
      />

      <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {modules.map((module) => (
          <ModuleSummaryCard key={module.slug} module={module} />
        ))}
      </section>
    </>
  );
}
