import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppError, ValidationError, NotFoundError, ConflictError, BusinessError } from "../core/errors/app-error.js";
import { normalizeError } from "../core/errors/error.utils.js";
import { ERROR_CODES } from "../core/errors/error.codes.js";

describe("AppError System & Error Normalization", () => {
  it("should correctly instantiate AppError with defaults and options", () => {
    const error = new NotFoundError("Project missing", ERROR_CODES.PROJECT_NOT_FOUND, "req-123");
    assert.equal(error.statusCode, 404);
    assert.equal(error.errorCode, ERROR_CODES.PROJECT_NOT_FOUND);
    assert.equal(error.requestId, "req-123");
    assert.equal(error.isOperational, true);
  });

  it("should normalize duck-typed Zod validation error", () => {
    const zodError = {
      name: "ZodError",
      issues: [
        { path: ["email"], message: "Invalid email address" },
        { path: ["amount"], message: "Amount must be positive" },
      ],
    };

    const normalized = normalizeError(zodError, "req-zod");
    assert.equal(normalized.statusCode, 422);
    assert.equal(normalized.errorCode, ERROR_CODES.VALIDATION_FAILED);
    assert.equal(Array.isArray(normalized.details), true);
    assert.equal((normalized.details as any[]).length, 2);
  });

  it("should normalize Prisma P2002 duplicate record error to ConflictError", () => {
    const prismaError = {
      code: "P2002",
      meta: { target: ["email"] },
      message: "Unique constraint failed",
    };

    const normalized = normalizeError(prismaError, "req-prisma");
    assert.equal(normalized.statusCode, 409);
    assert.equal(normalized.errorCode, ERROR_CODES.CONFLICT_RECORD_EXISTS);
  });

  it("should normalize unknown thrown exceptions safely without exposing stack trace", () => {
    const unknownErr = new Error("Database network socket reset");
    const normalized = normalizeError(unknownErr, "req-unknown");
    assert.equal(normalized.statusCode, 500);
    assert.equal(normalized.errorCode, ERROR_CODES.SYSTEM_INTERNAL_ERROR);

    const json = normalized.toJSON(false);
    assert.equal(json.stack, undefined);
    assert.equal(json.requestId, "req-unknown");
  });
});
