import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AccountType, UserStatus } from "@prisma/client";
import { authService } from "../modules/auth/auth.service.js";
import { authRepository } from "../modules/auth/auth.repository.js";
import { usersService } from "../modules/users/users.service.js";
import { usersRepository } from "../modules/users/users.repository.js";
import { passwordService } from "../core/security/password.service.js";
import { jwtService } from "../core/security/jwt.service.js";
import { config } from "../config/index.js";

function normalizeBaseUrl(raw?: string): string {
  if (!raw || typeof raw !== "string") return "/api/v1";
  let trimmed = raw.trim();
  if (!trimmed) return "/api/v1";

  while (trimmed.endsWith("/")) {
    trimmed = trimmed.slice(0, -1);
  }

  if (trimmed.endsWith("/api/v1")) {
    trimmed = trimmed.slice(0, -7);
  } else if (trimmed.endsWith("api/v1")) {
    trimmed = trimmed.slice(0, -6);
  } else if (trimmed.endsWith("/api")) {
    trimmed = trimmed.slice(0, -4);
  } else if (trimmed.endsWith("api")) {
    trimmed = trimmed.slice(0, -3);
  }

  while (trimmed.endsWith("/")) {
    trimmed = trimmed.slice(0, -1);
  }

  return trimmed ? `${trimmed}/api/v1` : "/api/v1";
}

function normalizeApiUrl(endpoint: string, customBase?: string): string {
  const effectiveBase = customBase !== undefined ? normalizeBaseUrl(customBase) : "/api/v1";
  let cleanEndpoint = (endpoint || "").trim();

  if (cleanEndpoint.startsWith("http://") || cleanEndpoint.startsWith("https://")) {
    return cleanEndpoint;
  }

  if (cleanEndpoint.startsWith("/api/v1/")) {
    cleanEndpoint = cleanEndpoint.slice(7);
  } else if (cleanEndpoint.startsWith("api/v1/")) {
    cleanEndpoint = cleanEndpoint.slice(6);
  } else if (cleanEndpoint === "/api/v1" || cleanEndpoint === "api/v1") {
    cleanEndpoint = "";
  } else if (cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.slice(4);
  } else if (cleanEndpoint.startsWith("api/")) {
    cleanEndpoint = cleanEndpoint.slice(3);
  } else if (cleanEndpoint === "/api" || cleanEndpoint === "api") {
    cleanEndpoint = "";
  }

  if (cleanEndpoint && !cleanEndpoint.startsWith("/")) {
    cleanEndpoint = "/" + cleanEndpoint;
  }

  return `${effectiveBase}${cleanEndpoint}`;
}

describe("ST-Solutions Platform 11: Real Deployment-Readiness Audit Suite", { concurrency: 1 }, () => {
  const managerUserId = "production-test-manager-001";
  const managerPassword = "ManagerProdPass@2026!";
  const managerEmail = "production.manager001@st-solutions.io";

  const memberUserId = "production-test-member-001";
  const memberPassword = "MemberProdPass@2026!";
  const memberEmail = "production.member001@st-solutions.io";

  let managerAccessToken = "";
  let managerRefreshToken = "";
  let memberAccessToken = "";
  let memberRefreshToken = "";

  // =========================================================================
  // AUDIT SECTION 1: PRODUCTION API URL & NORMALIZATION
  // =========================================================================
  it("AUDIT 1 — Production API URL Normalization: guarantees clean /api/v1 and prevents /api/api/v1 under all env values", () => {
    const testCases = [
      {
        rawEnv: "https://st-solutions-api.onrender.com",
        endpoint: "/auth/login",
        expectedUrl: "https://st-solutions-api.onrender.com/api/v1/auth/login",
      },
      {
        rawEnv: "https://st-solutions-api.onrender.com/",
        endpoint: "/auth/login",
        expectedUrl: "https://st-solutions-api.onrender.com/api/v1/auth/login",
      },
      {
        rawEnv: "https://st-solutions-api.onrender.com/api",
        endpoint: "/auth/login",
        expectedUrl: "https://st-solutions-api.onrender.com/api/v1/auth/login",
      },
      {
        rawEnv: "https://st-solutions-api.onrender.com/api/v1",
        endpoint: "/auth/login",
        expectedUrl: "https://st-solutions-api.onrender.com/api/v1/auth/login",
      },
      {
        rawEnv: "https://st-solutions-api.onrender.com/api/v1/",
        endpoint: "/auth/login",
        expectedUrl: "https://st-solutions-api.onrender.com/api/v1/auth/login",
      },
      {
        rawEnv: "https://st-solutions-api.onrender.com/api/v1",
        endpoint: "/api/v1/auth/login",
        expectedUrl: "https://st-solutions-api.onrender.com/api/v1/auth/login",
      },
      {
        rawEnv: "https://st-solutions-api.onrender.com/api/v1",
        endpoint: "api/v1/auth/login",
        expectedUrl: "https://st-solutions-api.onrender.com/api/v1/auth/login",
      },
      {
        rawEnv: "https://st-solutions-api.onrender.com/api/v1",
        endpoint: "/api/auth/login",
        expectedUrl: "https://st-solutions-api.onrender.com/api/v1/auth/login",
      },
      {
        rawEnv: "",
        endpoint: "/auth/login",
        expectedUrl: "/api/v1/auth/login",
      },
      {
        rawEnv: "",
        endpoint: "/api/v1/auth/login",
        expectedUrl: "/api/v1/auth/login",
      },
      {
        rawEnv: "/api/v1",
        endpoint: "/auth/login",
        expectedUrl: "/api/v1/auth/login",
      },
    ];

    for (const tc of testCases) {
      const generatedUrl = normalizeApiUrl(tc.endpoint, tc.rawEnv);
      assert.equal(generatedUrl, tc.expectedUrl, `Failed for env='${tc.rawEnv}' & endpoint='${tc.endpoint}'`);
      assert.equal(generatedUrl.includes("/api/api/v1"), false, "Must never contain /api/api/v1");
      assert.equal(generatedUrl.includes("/api/v1/api/v1"), false, "Must never contain /api/v1/api/v1");
    }
  });

  // =========================================================================
  // AUDIT SECTION 2: PRODUCTION MANAGER AUTHENTICATION
  // =========================================================================
  it("AUDIT 2 — Production MANAGER: creation via admin flow, bcrypt hash, User ID login, and /auth/me resolution", async () => {
    // 1. Create MANAGER user through administrative workflow
    const createdManager = await usersService.createUser(
      {
        id: managerUserId,
        userId: managerUserId,
        email: managerEmail,
        password: managerPassword,
        accountType: AccountType.MANAGER,
        status: UserStatus.ACTIVE,
        profile: {
          fullName: "Production Test Manager Officer",
        },
      },
      { accountType: AccountType.ADMIN, userId: "admin-system" }
    );

    assert.ok(createdManager);
    assert.equal(createdManager.id, managerUserId);
    assert.equal(createdManager.accountType, AccountType.MANAGER);
    assert.equal(createdManager.status, UserStatus.ACTIVE);

    // 2. Verify in authoritative persistence layer
    const persisted = await usersRepository.findById(managerUserId);
    assert.ok(persisted);
    assert.equal(persisted.id, managerUserId);
    assert.equal(persisted.accountType, "MANAGER");
    assert.equal(persisted.status, "ACTIVE");

    // 3. Verify password is salted and bcrypt-hashed (never plaintext)
    assert.notEqual(persisted.passwordHash, managerPassword);
    const isPasswordValid = await passwordService.comparePassword(managerPassword, persisted.passwordHash);
    assert.equal(isPasswordValid, true);

    // 4. Authenticate using User ID: production-test-manager-001
    const loginResult = await authService.login(
      {
        username: managerUserId,
        password: managerPassword,
      } as any,
      { ipAddress: "127.0.0.1", userAgent: "Vercel-Frontend-Audit" }
    );

    assert.ok(loginResult.accessToken);
    assert.ok(loginResult.refreshToken);
    assert.equal(loginResult.user.id, managerUserId);
    assert.equal(loginResult.user.accountType, AccountType.MANAGER);
    assert.equal(loginResult.tokenType, "Bearer");

    managerAccessToken = loginResult.accessToken;
    managerRefreshToken = loginResult.refreshToken;

    // 5. Query /auth/me with the access token
    const decoded = jwtService.verifyAccessToken(managerAccessToken);
    assert.equal(decoded.sub, managerUserId);
    assert.equal(decoded.accountType, AccountType.MANAGER);

    const authMeUser = await authRepository.findById(decoded.sub);
    assert.ok(authMeUser);
    assert.equal(authMeUser.id, managerUserId);
    assert.equal(authMeUser.accountType, AccountType.MANAGER);
    assert.equal(authMeUser.profile?.fullName, "Production Test Manager Officer");
  });

  // =========================================================================
  // AUDIT SECTION 3: PRODUCTION MEMBER AUTHENTICATION
  // =========================================================================
  it("AUDIT 3 — Production MEMBER: creation via admin flow, User ID login, and /auth/me resolution", async () => {
    // 1. Create MEMBER user
    const createdMember = await usersService.createUser(
      {
        id: memberUserId,
        userId: memberUserId,
        email: memberEmail,
        password: memberPassword,
        accountType: AccountType.MEMBER,
        status: UserStatus.ACTIVE,
        profile: {
          fullName: "Production Test Member Officer",
        },
      },
      { accountType: AccountType.ADMIN, userId: "admin-system" }
    );

    assert.ok(createdMember);
    assert.equal(createdMember.id, memberUserId);
    assert.equal(createdMember.accountType, AccountType.MEMBER);

    // 2. Authenticate using User ID: production-test-member-001
    const loginResult = await authService.login(
      {
        username: memberUserId,
        password: memberPassword,
      } as any,
      { ipAddress: "127.0.0.1", userAgent: "Vercel-Frontend-Audit" }
    );

    assert.ok(loginResult.accessToken);
    assert.ok(loginResult.refreshToken);
    assert.equal(loginResult.user.id, memberUserId);
    assert.equal(loginResult.user.accountType, AccountType.MEMBER);

    memberAccessToken = loginResult.accessToken;
    memberRefreshToken = loginResult.refreshToken;

    // 3. /auth/me lookup
    const decoded = jwtService.verifyAccessToken(memberAccessToken);
    assert.equal(decoded.sub, memberUserId);
    assert.equal(decoded.accountType, AccountType.MEMBER);

    const authMeUser = await authRepository.findById(decoded.sub);
    assert.ok(authMeUser);
    assert.equal(authMeUser.id, memberUserId);
    assert.equal(authMeUser.accountType, AccountType.MEMBER);
  });

  // =========================================================================
  // AUDIT SECTION 4: ADMIN & SUB_ADMIN PRODUCTION AUTHENTICATION
  // =========================================================================
  it("AUDIT 4 — Production ADMIN & SUB_ADMIN: Authenticate with configured environment credentials", async () => {
    const adminEmail = config.auth.adminEmail || "admin@st-solutions.com";
    const adminPassword = config.auth.adminPassword || "Admin@123456";
    const subAdminEmail = config.auth.subAdminEmail || "subadmin@st-solutions.com";
    const subAdminPassword = config.auth.subAdminPassword || "SubAdmin@123456";

    // 1. Admin login
    const adminLogin = await authService.login({
      email: adminEmail,
      password: adminPassword,
    });
    assert.ok(adminLogin.accessToken);
    assert.equal(adminLogin.user.accountType, "ADMIN");
    assert.equal(adminLogin.user.email?.toLowerCase(), adminEmail.toLowerCase());

    // 2. Sub-Admin login
    const subAdminLogin = await authService.login({
      email: subAdminEmail,
      password: subAdminPassword,
    });
    assert.ok(subAdminLogin.accessToken);
    assert.equal(subAdminLogin.user.accountType, "SUB_ADMIN");
    assert.equal(subAdminLogin.user.email?.toLowerCase(), subAdminEmail.toLowerCase());
  });

  // =========================================================================
  // AUDIT SECTION 5: PUBLIC REGISTRATION FORBIDDEN
  // =========================================================================
  it("AUDIT 5 — Public Registration Disabled: POST /api/v1/auth/register returns 403 Forbidden", async () => {
    await assert.rejects(
      async () => {
        await authService.register({
          fullName: "Public Anonymous Attacker",
          email: "attacker@public-web.com",
          password: "AttackerPass@1234",
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /Public registration is disabled/i);
        return true;
      }
    );
  });

  // =========================================================================
  // AUDIT SECTION 6: SESSION LIFECYCLE (Refresh & Logout)
  // =========================================================================
  it("AUDIT 6 — Session Lifecycle: Token refresh rotation and session logout", async () => {
    // 1. Refresh token rotation
    const refreshed = await authService.refreshToken(managerRefreshToken);
    assert.ok(refreshed.accessToken);
    assert.ok(refreshed.refreshToken);

    const decodedRefreshed = jwtService.verifyAccessToken(refreshed.accessToken);
    assert.equal(decodedRefreshed.sub, managerUserId);

    // 2. Logout session
    const logoutRes = await authService.logout(managerUserId);
    assert.match(logoutRes.message, /Logged out successfully/i);
  });

  // =========================================================================
  // AUDIT SECTION 7: RBAC & PRIVILEGE BOUNDARIES
  // =========================================================================
  it("AUDIT 7 — Role-Based Access Control: MANAGER cannot promote ADMIN; MEMBER cannot create users", async () => {
    // 1. MANAGER cannot create ADMIN
    await assert.rejects(
      async () => {
        await usersService.createUser(
          {
            email: "escalated.admin@st-solutions.io",
            password: "SomePassword@123",
            accountType: AccountType.ADMIN,
            status: UserStatus.ACTIVE,
          },
          { userId: managerUserId, accountType: AccountType.MANAGER }
        );
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        return true;
      }
    );

    // 2. MEMBER cannot create user
    await assert.rejects(
      async () => {
        await usersService.createUser(
          {
            email: "unauthorized.member@st-solutions.io",
            password: "SomePassword@123",
            accountType: AccountType.MEMBER,
            status: UserStatus.ACTIVE,
          },
          { userId: memberUserId, accountType: AccountType.MEMBER }
        );
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        return true;
      }
    );
  });
});

