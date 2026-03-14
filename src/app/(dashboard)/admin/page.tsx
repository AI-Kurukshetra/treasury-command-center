import { ActionCard } from "@/components/operations/action-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getAdminPayload } from "@/lib/domain/treasury-api";

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

type RoleRecord = {
  id: string;
  name: string;
  description: string | null;
  status: string;
};

type PolicyRecord = {
  id: string;
  name: string;
  policy_type: string;
  status: string;
  version: number;
};

type WorkflowRuleRecord = {
  id: string;
  name: string;
  trigger_type: string;
  status: string;
};

type SettingRecord = {
  id: string;
  category: string;
  setting_key: string;
  status: string;
};

type AuditLogRecord = {
  id: string;
  action: string;
  entity_type: string;
  severity: string;
  occurred_at: string;
};

export default async function AdminPage() {
  const adminPayload = await getAdminPayload();
  const roles = adminPayload.roles as RoleRecord[];
  const policies = adminPayload.policies as PolicyRecord[];
  const workflowRules = adminPayload.workflowRules as WorkflowRuleRecord[];
  const settings = adminPayload.settings as SettingRecord[];
  const auditLogs = adminPayload.auditLogs as AuditLogRecord[];

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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Access and policy inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Roles
              </p>
              {roles.length ? (
                roles.map((role) => (
                  <div key={role.id} className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{role.description ?? "No description"}</p>
                      </div>
                      <Badge variant="secondary">{role.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <SectionEmpty title="No roles yet" description="Create the first treasury role to establish access boundaries." />
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Policies and workflows
              </p>
              {[...policies, ...workflowRules].length ? (
                <>
                  {policies.map((policy) => (
                    <div key={policy.id} className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{policy.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {policy.policy_type} · v{policy.version}
                          </p>
                        </div>
                        <Badge variant={policy.status === "active" ? "success" : "secondary"}>{policy.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {workflowRules.map((workflowRule) => (
                    <div key={workflowRule.id} className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{workflowRule.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{workflowRule.trigger_type}</p>
                        </div>
                        <Badge variant={workflowRule.status === "active" ? "success" : "secondary"}>
                          {workflowRule.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <SectionEmpty title="No policies or workflow rules" description="Policy drafts and orchestration rules will appear here." />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings and audit visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ActionCard
              title="Store platform setting"
              description="Persist tenant-level operating preferences and feature controls."
              endpoint="/api/admin"
              submitLabel="Create setting"
              payloadDefaults={{ recordType: "setting" }}
              fields={[
                { name: "category", label: "Category", placeholder: "workspace" },
                { name: "settingKey", label: "Setting key", placeholder: "home_layout" }
              ]}
            />

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Active settings
              </p>
              {settings.length ? (
                settings.slice(0, 5).map((setting) => (
                  <div key={setting.id} className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{setting.setting_key}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{setting.category}</p>
                      </div>
                      <Badge variant="secondary">{setting.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <SectionEmpty title="No settings stored" description="Persisted platform settings will appear here once created." />
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Recent audit events
              </p>
              {auditLogs.length ? (
                auditLogs.slice(0, 5).map((auditLog) => (
                  <div key={auditLog.id} className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{auditLog.action}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {auditLog.entity_type} · {auditLog.occurred_at.slice(0, 10)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          auditLog.severity === "critical"
                            ? "destructive"
                            : auditLog.severity === "warning"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {auditLog.severity}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <SectionEmpty title="No audit events yet" description="Administrative changes and workflow decisions will populate the audit feed." />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
