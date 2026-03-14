import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import type { Route } from "next";

import { primaryNavigation } from "@/data/demo-data";
import { moduleDefinitionsBySlug } from "@/lib/modules/definitions";
import { moduleRecordSchemas } from "@/lib/modules/validators";
import { allSrsFeatureIds, srsCoverage } from "../support/srs-coverage";

function readFeatureIdsFromDocs() {
  const featureListPath = path.resolve(process.cwd(), "docs/feature-list.md");
  const content = fs.readFileSync(featureListPath, "utf8");
  return [...content.matchAll(/\|\s((?:CF|AF|PF)-\d+)\s\|/g)].map((match) => match[1]).sort();
}

describe("SRS coverage manifest", () => {
  it("covers every feature listed in docs/feature-list.md", () => {
    const documentedIds = readFeatureIdsFromDocs();
    const coveredIds = [...allSrsFeatureIds].sort();

    expect(coveredIds).toEqual(documentedIds);
  });

  it("maps every feature to a real module definition and validator", () => {
    for (const entry of srsCoverage) {
      const definition = moduleDefinitionsBySlug[entry.moduleSlug];

      expect(definition, entry.id).toBeDefined();
      expect(definition.route, entry.id).toBe(entry.moduleRoute);
      expect(
        moduleRecordSchemas[entry.moduleSlug as keyof typeof moduleRecordSchemas],
        entry.id
      ).toBeDefined();
      expect(entry.apiPath.startsWith("/api/"), entry.id).toBe(true);
    }
  });

  it("maps each feature to a reachable workspace route", () => {
    const navigationRoutes = new Set(primaryNavigation.map((item) => item.href));

    for (const entry of srsCoverage) {
      const isModuleRoute = entry.workspaceRoute.startsWith("/modules/");
      const isPlatformRoute =
        navigationRoutes.has(entry.workspaceRoute as Route) ||
        entry.workspaceRoute === "/dashboard" ||
        entry.workspaceRoute === "/auth/sign-in";

      expect(isModuleRoute || isPlatformRoute, entry.id).toBe(true);
    }
  });

  it("references every platform module from at least one SRS feature", () => {
    const referencedModules = new Set(srsCoverage.map((entry) => entry.moduleSlug));

    expect(referencedModules.size).toBe(Object.keys(moduleDefinitionsBySlug).length);
  });
});
