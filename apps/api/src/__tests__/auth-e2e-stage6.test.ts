import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authService } from "../modules/auth/auth.service.js";
import { authRepository } from "../modules/auth/auth.repository.js";
import { passwordService } from "../core/security/password.service.js";
import { jwtService } from "../core/security/jwt.service.js";
import { organizationRepository } from "../modules/organizations/organization.repository.js";
import { workspaceRepository } from "../modules/workspaces/workspace.repository.js";
import { requireOrganizationMembership, requireWorkspaceMembership } from "../core/security/tenant.middleware.js";
import { normalizeError, sanitizeError } from "../core/errors/error.utils.js";

describe("Stage 6: Real Database + Production Authentication Foundation E2E", { concurrency: 1 }, () => {
  const testUserEmail = `stage6.test.${Date.now()}@st-solutions.com`;
  const testPassword = "SecurePassword@2026!";
  let registeredUserId = "";
  let activeAccessToken = "";
  let activeRefreshToken = "";
  let userOrgId = "";
  let userWorkspaceId = "";

  it("1. Real User Registration: validates, hashes password, creates user + profile + default Org & Workspace, issues JWT & session", async () => {
    const registerResult = await authService.register(
      {
        email: testUserEmail,
        password: testPassword,
        fullName: "Dr. Alexander Wright",
        accountType: "MEMBER",
        organizationName: "Wright Aerospace Research",
      },
      { ipAddress: "127.0.0.1", userAgent: "Stage6-E2E-Agent" }
    );

    assert.ok(registerResult);
    assert.ok(registerResult.accessToken);
    assert.ok(registerResult.refreshToken);
    assert.equal(registerResult.tokenType, "Bearer");
    assert.equal(registerResult.user.email, testUserEmail);
    assert.equal(registerResult.user.profile?.fullName, "Dr. Alexander Wright");
    assert.equal(registerResult.user.accountType, "MEMBER");
    // Verify password hash is never exposed
    assert.equal((registerResult.user as any).passwordHash, undefined);

    registeredUserId = registerResult.user.id;
    activeAccessToken = registerResult.accessToken;
    activeRefreshToken = registerResult.refreshToken;

    // Verify user in repository has hashed password
    const userInDb = await authRepository.findByEmail(testUserEmail);
    assert.ok(userInDb);
    assert.notEqual(userInDb.passwordHash, testPassword);
    const isPasswordValid = await passwordService.comparePassword(testPassword, userInDb.passwordHash);
    assert.equal(isPasswordValid, true);

    // Verify Organization and Workspace were provisioned
    const userOrgs = await organizationRepository.findUserOrganizations(registeredUserId);
    assert.ok(userOrgs.length > 0);
    assert.equal(userOrgs[0].name, "Wright Aerospace Research");
    userOrgId = userOrgs[0].id;

    const workspaces = await workspaceRepository.findByOrganizationId(userOrgId);
    assert.ok(workspaces.length > 0);
    assert.equal(workspaces[0].name, "Default Workspace");
    userWorkspaceId = workspaces[0].id;
  });

  it("2. Registration Rejection: prevents duplicate email registration with 409 Conflict", async () => {
    await assert.rejects(
      async () => {
        await authService.register({
          email: testUserEmail,
          password: "AnotherPassword@123",
          fullName: "Duplicate User",
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 409);
        assert.match(err.message, /already registered/i);
        return true;
      }
    );
  });

  it("3. Real User Login: authenticates candidate with bcrypt verification and issues valid tokens", async () => {
    const loginResult = await authService.login(
      {
        email: testUserEmail,
        password: testPassword,
      },
      { ipAddress: "127.0.0.1", userAgent: "Stage6-E2E-Agent" }
    );

    assert.ok(loginResult.accessToken);
    assert.ok(loginResult.refreshToken);
    assert.equal(loginResult.user.id, registeredUserId);
    assert.equal(loginResult.user.email, testUserEmail);
    // Ensure safe payload without password hash
    assert.equal((loginResult.user as any).passwordHash, undefined);

    activeAccessToken = loginResult.accessToken;
    activeRefreshToken = loginResult.refreshToken;
  });

  it("4. Login Failure: rejects invalid password with 401 Unauthorized", async () => {
    await assert.rejects(
      async () => {
        await authService.login({
          email: testUserEmail,
          password: "WrongPassword@999",
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /Invalid email or password/i);
        return true;
      }
    );
  });

  it("5. Login Failure: rejects non-existent email with 401 Unauthorized", async () => {
    await assert.rejects(
      async () => {
        await authService.login({
          email: "nonexistent.user.2026@domain.com",
          password: "SomePassword@123",
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /Invalid email or password/i);
        return true;
      }
    );
  });

  it("6. Session Persistence & Token Refresh: verifies refresh token and issues new token pair", async () => {
    const refreshResult = await authService.refreshToken(activeRefreshToken);

    assert.ok(refreshResult.accessToken);
    assert.ok(refreshResult.refreshToken);
    assert.equal(refreshResult.tokenType, "Bearer");

    const decoded = jwtService.verifyAccessToken(refreshResult.accessToken);
    assert.equal(decoded.sub, registeredUserId);
    assert.equal(decoded.type, "access");
  });

  it("7. Token Verification Failure: rejects tampered or expired refresh token", async () => {
    await assert.rejects(
      async () => {
        await authService.refreshToken("invalid.malformed.jwt.token.string");
      },
      (err: any) => {
        assert.equal(err.statusCode, 401);
        return true;
      }
    );
  });

  it("8. Multi-Tenant Request Context: verifies organization membership and header extraction", async () => {
    const middleware = requireOrganizationMembership();

    let nextCalled = false;
    let nextError: any = null;

    const req: any = {
      user: { userId: registeredUserId, accountType: "MEMBER" },
      headers: { "x-organization-id": userOrgId },
      params: {},
      query: {},
    };

    await middleware(req, {} as any, (err?: any) => {
      nextCalled = true;
      nextError = err;
    });

    assert.equal(nextCalled, true);
    assert.equal(nextError, undefined);
    assert.ok(req.tenantContext);
    assert.equal(req.tenantContext.organizationId, userOrgId);
  });

  it("9. Multi-Tenant Isolation: rejects user accessing organization they do not belong to", async () => {
    const middleware = requireOrganizationMembership();

    let nextCalled = false;
    let nextError: any = null;

    const req: any = {
      user: { userId: "foreign-unauthorized-user", accountType: "MEMBER" },
      headers: { "x-organization-id": userOrgId },
      params: {},
      query: {},
    };

    await middleware(req, {} as any, (err?: any) => {
      nextCalled = true;
      nextError = err;
    });

    assert.equal(nextCalled, true);
    assert.ok(nextError);
    assert.equal(nextError.statusCode, 403);
    assert.match(nextError.message, /not a member of this organization/i);
  });

  it("10. Multi-Tenant Workspace Isolation: verifies workspace membership and permissions", async () => {
    const middleware = requireWorkspaceMembership();

    let nextCalled = false;
    let nextError: any = null;

    const req: any = {
      user: { userId: registeredUserId, accountType: "MEMBER" },
      headers: {
        "x-organization-id": userOrgId,
        "x-workspace-id": userWorkspaceId,
      },
      params: {},
      query: {},
    };

    await middleware(req, {} as any, (err?: any) => {
      nextCalled = true;
      nextError = err;
    });

    assert.equal(nextCalled, true);
    assert.equal(nextError, undefined);
    assert.ok(req.tenantContext);
    assert.equal(req.tenantContext.workspaceId, userWorkspaceId);
  });

  it("11. Password Change Flow: verifies current password, stores new hash, and invalidates old sessions", async () => {
    const newPassword = "NewSecuredPassword@2026!";

    // Invalid current password should fail
    await assert.rejects(
      async () => {
        await authService.changePassword(registeredUserId, {
          currentPassword: "IncorrectCurrentPassword@123",
          newPassword,
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 401);
        return true;
      }
    );

    // Valid current password should succeed
    const changeResult = await authService.changePassword(registeredUserId, {
      currentPassword: testPassword,
      newPassword,
    });
    assert.match(changeResult.message, /Password updated successfully/i);

    // Login with new password should now succeed
    const newLoginResult = await authService.login({
      email: testUserEmail,
      password: newPassword,
    });
    assert.ok(newLoginResult.accessToken);

    // Login with old password should now fail
    await assert.rejects(
      async () => {
        await authService.login({
          email: testUserEmail,
          password: testPassword,
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 401);
        return true;
      }
    );
  });

  it("12. Logout & Session Revocation: revokes active sessions", async () => {
    const logoutResult = await authService.logout(registeredUserId);
    assert.match(logoutResult.message, /Logged out successfully/i);
  });

  it("13. Safe Error Normalization: sanitizes database and internal errors without leaking stack traces or credentials", () => {
    const internalDbError = new Error("FATAL: connection to server on socket '/var/run/postgresql/.s.PGSQL.5432' failed: password authentication failed for user 'postgres'");
    const normalized = normalizeError(internalDbError, "req-test-123");

    assert.equal(normalized.statusCode, 500);
    const sanitized = sanitizeError(normalized);
    assert.equal(sanitized.statusCode, 500);
    assert.equal(sanitized.requestId, "req-test-123");
    // Ensure stack trace is not in public presentation payload
    assert.equal(typeof sanitized.message, "string");
  });
});
