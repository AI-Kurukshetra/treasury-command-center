export type ModuleFieldOption = {
  label: string;
  value: string;
};

export type ModuleField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select";
  placeholder?: string;
  step?: string;
  options?: ModuleFieldOption[];
};

export type ModuleDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: "core" | "support" | "advanced";
  priority: "must-have" | "important" | "nice-to-have";
  primaryTable: string;
  recordsLabel: string;
  route: string;
  fields: ModuleField[];
};

export type ModuleMetric = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "warning";
};

export type ModuleRecord = {
  id: string;
  title: string;
  status: string;
  description: string;
  meta: string[];
};

export type ModuleSummary = ModuleDefinition & {
  recordCount: number;
  recordsLabel: string;
  health: "live" | "partial" | "empty";
};

export type ModuleDetail = ModuleSummary & {
  metrics: ModuleMetric[];
  records: ModuleRecord[];
};
