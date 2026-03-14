import { describe, expect, it } from "vitest";

import { calculateApprovalStatus, countApprovedSteps } from "@/lib/domain/treasury-api";

describe("payment policy helpers", () => {
  it("counts approved workflow decisions only", () => {
    expect(
      countApprovedSteps([
        { decision: "pending" },
        { decision: "approved" },
        { decision: "approved" },
        { decision: "rejected" }
      ])
    ).toBe(2);
  });

  it("keeps payment submitted until all required steps are approved", () => {
    expect(
      calculateApprovalStatus({
        requiredSteps: [{ id: "step-1" }, { id: "step-2" }],
        existingApprovals: [{ decision: "approved" }],
        latestDecision: "approved"
      })
    ).toBe("approved");

    expect(
      calculateApprovalStatus({
        requiredSteps: [{ id: "step-1" }, { id: "step-2" }, { id: "step-3" }],
        existingApprovals: [{ decision: "approved" }],
        latestDecision: "approved"
      })
    ).toBe("submitted");
  });
});
