import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const adminSections = [
  {
    title: "Organization and entity management",
    detail: "Manage subsidiaries, reporting currency defaults, and tenant-specific configuration."
  },
  {
    title: "Users, roles, and permissions",
    detail: "Assign treasury roles, approval scopes, and privileged access boundaries."
  },
  {
    title: "Policies and workflows",
    detail: "Configure approval thresholds, routing logic, and treasury rule enforcement."
  }
];

export default function AdminPage() {
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Platform controls"
        description="Configure the tenant, access model, and policy controls that govern treasury operations."
        meta={["Tenant setup", "Access model", "Control policies"]}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {adminSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-muted-foreground">{section.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
