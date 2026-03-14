import { ActionCard } from "@/components/operations/action-card";
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

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <ActionCard
          title="Create role"
          description="Add a treasury role to the tenant RBAC model."
          endpoint="/api/admin"
          submitLabel="Create role"
          payloadDefaults={{ recordType: "role" }}
          fields={[
            { name: "name", label: "Role name", placeholder: "Regional Treasurer" },
            { name: "description", label: "Description", type: "textarea", placeholder: "Approves EMEA payments" }
          ]}
        />
        <ActionCard
          title="Publish policy draft"
          description="Register a new treasury policy artifact for workflow or control coverage."
          endpoint="/api/admin"
          submitLabel="Create policy"
          payloadDefaults={{ recordType: "policy" }}
          fields={[
            { name: "name", label: "Policy name", placeholder: "Liquidity buffer policy" },
            {
              name: "policyType",
              label: "Policy type",
              type: "select",
              options: [
                { label: "Approval", value: "approval" },
                { label: "Liquidity", value: "liquidity" },
                { label: "Risk", value: "risk" },
                { label: "Security", value: "security" }
              ]
            }
          ]}
        />
        <ActionCard
          title="Create approval workflow"
          description="Stand up a simple approval workflow and first routing step."
          endpoint="/api/admin"
          submitLabel="Create workflow"
          payloadDefaults={{ recordType: "workflow" }}
          fields={[
            { name: "name", label: "Workflow name", placeholder: "Payments over threshold" },
            { name: "workflowType", label: "Workflow type", placeholder: "payment" },
            { name: "approverReference", label: "Approver reference", placeholder: "Treasury Admin" },
            { name: "thresholdAmount", label: "Threshold amount", type: "number", defaultValue: "0" }
          ]}
        />
      </div>
    </>
  );
}
