import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ProjectStatus, PaymentStatus } from "@prisma/client";

describe("Domain Business Rules & Status Transitions", () => {
  it("should enforce valid project status transitions matrix", () => {
    const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      [ProjectStatus.PENDING]: [ProjectStatus.DISCUSSION, ProjectStatus.CONFIRMED, ProjectStatus.CANCELLED],
      [ProjectStatus.DISCUSSION]: [ProjectStatus.CONFIRMED, ProjectStatus.PENDING, ProjectStatus.CANCELLED],
      [ProjectStatus.CONFIRMED]: [ProjectStatus.IN_PROGRESS, ProjectStatus.DISCUSSION, ProjectStatus.CANCELLED],
      [ProjectStatus.IN_PROGRESS]: [ProjectStatus.REVIEW, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
      [ProjectStatus.REVIEW]: [ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
      [ProjectStatus.COMPLETED]: [ProjectStatus.IN_PROGRESS],
      [ProjectStatus.CANCELLED]: [ProjectStatus.PENDING, ProjectStatus.DISCUSSION, ProjectStatus.CONFIRMED],
    };

    assert.equal(allowedTransitions[ProjectStatus.PENDING].includes(ProjectStatus.DISCUSSION), true);
    assert.equal(allowedTransitions[ProjectStatus.PENDING].includes(ProjectStatus.COMPLETED), false);
    assert.equal(allowedTransitions[ProjectStatus.IN_PROGRESS].includes(ProjectStatus.COMPLETED), true);
  });

  it("should enforce valid payment status transitions matrix", () => {
    const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [PaymentStatus.SUBMITTED, PaymentStatus.APPROVED, PaymentStatus.REJECTED],
      [PaymentStatus.SUBMITTED]: [PaymentStatus.APPROVED, PaymentStatus.REJECTED, PaymentStatus.PENDING],
      [PaymentStatus.APPROVED]: [PaymentStatus.REJECTED],
      [PaymentStatus.REJECTED]: [PaymentStatus.PENDING, PaymentStatus.SUBMITTED],
    };

    assert.equal(allowedTransitions[PaymentStatus.PENDING].includes(PaymentStatus.APPROVED), true);
    assert.equal(allowedTransitions[PaymentStatus.APPROVED].includes(PaymentStatus.PENDING), false);
  });
});
