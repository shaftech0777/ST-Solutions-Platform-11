import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProjectSchema, updateProjectStatusSchema } from "../modules/projects/projects.validation.js";
import { createPaymentSchema, updatePaymentStatusSchema } from "../modules/payments/payments.validation.js";
import { createClientSchema } from "../modules/clients/clients.validation.js";

describe("Input Validation & Zod Schemas", () => {
  it("should validate valid createProject payload", () => {
    const valid = {
      title: "New E-Commerce Platform",
      description: "Building custom web portal",
      clientId: "123e4567-e89b-12d3-a456-426614174000",
      budget: 15000,
    };

    const result = createProjectSchema.safeParse(valid);
    assert.equal(result.success, true);
  });

  it("should reject project creation with empty title or invalid UUID", () => {
    const invalid = {
      title: "",
      clientId: "not-a-uuid",
    };

    const result = createProjectSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  it("should validate project status transitions schema", () => {
    const valid = { projectStatus: "IN_PROGRESS" };
    const invalid = { projectStatus: "SUPER_COMPLETED" };

    assert.equal(updateProjectStatusSchema.safeParse(valid).success, true);
    assert.equal(updateProjectStatusSchema.safeParse(invalid).success, false);
  });

  it("should validate payment creation with currency normalization", () => {
    const valid = {
      amount: 2500.5,
      currency: "usd",
      clientId: "123e4567-e89b-12d3-a456-426614174000",
    };

    const result = createPaymentSchema.safeParse(valid);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.currency, "USD");
    }
  });

  it("should reject negative payment amount", () => {
    const invalid = {
      amount: -50,
      currency: "USD",
      clientId: "123e4567-e89b-12d3-a456-426614174000",
    };

    const result = createPaymentSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  it("should validate client schema and normalize email address", () => {
    const valid = {
      fullName: "Jane Doe",
      email: "JANE.DOE@COMPANY.COM  ",
      phoneNumber: "+15551234567",
    };

    const result = createClientSchema.safeParse(valid);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "jane.doe@company.com");
    }
  });
});
