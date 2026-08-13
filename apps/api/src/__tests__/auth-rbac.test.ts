import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { jwtService } from "../core/security/jwt.service.js";
import { requirePermission } from "../middlewares/index.js";

describe("Authentication & RBAC Middleware", () => {
  it("should sign and verify access tokens", () => {
    const payload = {
      sub: "user-uuid-123",
      email: "admin@shaftech.com",
      role: "ADMIN",
      accountType: "ADMIN",
    };

    const token = jwtService.signAccessToken(payload);
    assert.equal(typeof token, "string");
    assert.ok(token.length > 20);

    const decoded = jwtService.verifyAccessToken(token);
    assert.equal(decoded.sub, "user-uuid-123");
    assert.equal(decoded.email, "admin@shaftech.com");
    assert.equal(decoded.role, "ADMIN");
  });

  it("should fail verification on tampered JWT token", () => {
    const token = jwtService.signAccessToken({ sub: "user-1" });
    const tampered = token.slice(0, -5) + "xxxxx";

    assert.throws(() => {
      jwtService.verifyAccessToken(tampered);
    });
  });

  it("should enforce permissions in requirePermission middleware", async () => {
    const middleware = requirePermission("projects.create");

    let nextCalled = false;
    let nextError: any = null;

    const req: any = {
      user: {
        userId: "user-1",
        roleName: "MANAGER",
        permissions: ["projects.read", "projects.create"],
      },
    };

    const res: any = {};
    const next = (err?: any) => {
      nextCalled = true;
      nextError = err;
    };

    middleware(req, res, next);
    assert.equal(nextCalled, true);
    assert.equal(nextError, undefined);
  });

  it("should reject request when user lacks required permission", async () => {
    const middleware = requirePermission("projects.delete");

    let nextCalled = false;
    let nextError: any = null;

    const req: any = {
      user: {
        userId: "user-2",
        roleName: "MEMBER",
        permissions: ["projects.read"],
      },
    };

    const res: any = {};
    const next = (err?: any) => {
      nextCalled = true;
      nextError = err;
    };

    middleware(req, res, next);
    assert.equal(nextCalled, true);
    assert.ok(nextError);
    assert.equal(nextError.statusCode, 403);
  });
});
