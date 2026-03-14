import { describe, expect, it } from "vitest";

import { moduleRecordSchemas } from "@/lib/modules/validators";
import { moduleTestCases } from "../support/module-fixtures";

describe("module validation fixtures", () => {
  it("accepts the valid payload for every module", () => {
    for (const testCase of moduleTestCases) {
      const result = moduleRecordSchemas[testCase.slug as keyof typeof moduleRecordSchemas].safeParse(
        testCase.payload()
      );
      expect(result.success, testCase.slug).toBe(true);
    }
  });

  it("rejects empty payloads for every module", () => {
    for (const testCase of moduleTestCases) {
      const result = moduleRecordSchemas[testCase.slug as keyof typeof moduleRecordSchemas].safeParse(
        {}
      );
      expect(result.success, testCase.slug).toBe(false);
    }
  });
});
