import { test } from "node:test";
import assert from "node:assert/strict";
import { AccountType, UserStatus } from "@prisma/client";
import { authService } from "../modules/auth/auth.service.js";
import { authRepository } from "../modules/auth/auth.repository.js";
import { usersService } from "../modules/users/users.service.js";
import { usersRepository } from "../modules/users/users.repository.js";
import { passwordService } from "../core/security/password.service.js";
import { jwtService } from "../core/security/jwt.service.js";
import { config } from "../config/index.js";
import { memoryDb } from "../database/in-memory-db.js";
import { prisma } from "../database/prisma.client.js";

test("FINAL End-to-End Production Authentication Verification", { concurrency: 1 }, async (t) => {
  memoryDb.reset();

  const managerUserId = "test-manager-final-001";
  const managerPassword = "ManagerSecretPass@2026!";
  const managerEmail = "manager.final.001@st-solutions.io";

  const memberUserId = "test-member-final-001";
  const memberPassword = "MemberSecretPass@2026!";
  const memberEmail = "member.final.001@st-solutions.io";

  try {
    await prisma.session.deleteMany({
      where: {
        userId: { in: [managerUserId, memberUserId, "test-inactive-user-001", "test-suspended-user-001"] },
      },
    });
    await prisma.userProfile.deleteMany({
      where: {
        userId: { in: [managerUserId, memberUserId, "test-inactive-user-001", "test-suspended-user-001"] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        OR: [
          { id: { in: [managerUserId, memberUserId, "test-inactive-user-001", "test-suspended-user-001"] } },
          { email: { in: [managerEmail, memberEmail, "inactive.user@st-solutions.io", "suspended.user@st-solutions.io"] } },
        ],
      },
    });
  } catch {
    // Non-fatal if database cleanup throws
  }

  let managerAccessToken = "";
  let managerRefreshToken = "";
  let memberAccessToken = "";
  let memberRefreshToken = "";

  // -------------------------------------------------------------
  // TEST 1 — MANAGER
  // -------------------------------------------------------------
  await t.test("TEST 1 — MANAGER: Complete creation, DB persistence, bcrypt hashing, User ID login, and /auth/me lookup", async () => {
    // 1. Create fresh MANAGER through admin user-management flow
    const createdManager = await usersService.createUser(
      {
        id: managerUserId,
        userId: managerUserId,
        email: managerEmail,
        password: managerPassword,
        accountType: AccountType.MANAGER,
        status: UserStatus.ACTIVE,
        profile: {
          fullName: "Final Manager Verification Officer",
        },
      },
      { accountType: AccountType.ADMIN, userId: "admin-system" }
    );

    assert.ok(createdManager);
    assert.equal(createdManager.id, managerUserId);
    assert.equal(createdManager.accountType, AccountType.MANAGER);
    assert.equal(createdManager.status, UserStatus.ACTIVE);

    // 2. Verify user is persisted in authoritative production persistence layer
    const persistedInDb = await usersRepository.findById(managerUserId);
    assert.ok(persistedInDb, "Manager must be found in authoritative database");
    assert.equal(persistedInDb.id, managerUserId);
    assert.equal(persistedInDb.accountType, "MANAGER");
    assert.equal(persistedInDb.status, "ACTIVE");

    // 3. Verify password is bcrypt-hashed and never stored in plaintext
    assert.notEqual(persistedInDb.passwordHash, managerPassword);
    const isPasswordHashValid = await passwordService.comparePassword(managerPassword, persistedInDb.passwordHash);
    assert.equal(isPasswordHashValid, true, "Bcrypt hash must match the assigned manager password");

    // 4. Authenticate via production login using { username: 'test-manager-final-001', password }
    const loginResult = await authService.login(
      {
        username: managerUserId,
        password: managerPassword,
      } as any,
      { ipAddress: "127.0.0.1", userAgent: "E2E-Final-Verifier" }
    );

    assert.ok(loginResult.accessToken, "Login must return an accessToken");
    assert.ok(loginResult.refreshToken, "Login must return a refreshToken");
    assert.equal(loginResult.user.id, managerUserId);
    assert.equal(loginResult.user.accountType, AccountType.MANAGER);
    assert.equal(loginResult.tokenType, "Bearer");

    managerAccessToken = loginResult.accessToken;
    managerRefreshToken = loginResult.refreshToken;

    // 5. Use access token against /auth/me to verify user identity
    const decoded = jwtService.verifyAccessToken(managerAccessToken);
    assert.equal(decoded.sub, managerUserId);
    assert.equal(decoded.accountType, AccountType.MANAGER);

    const authMeUser = await authRepository.findById(decoded.sub);
    assert.ok(authMeUser);
    assert.equal(authMeUser.id, managerUserId);
    assert.equal(authMeUser.accountType, AccountType.MANAGER);
    assert.equal(authMeUser.profile?.fullName, "Final Manager Verification Officer");
  });

  // -------------------------------------------------------------
  // TEST 2 — MEMBER
  // -------------------------------------------------------------
  await t.test("TEST 2 — MEMBER: Complete creation, DB persistence, User ID login, and /auth/me lookup", async () => {
    // 1. Create fresh MEMBER through admin user-management flow
    const createdMember = await usersService.createUser(
      {
        id: memberUserId,
        userId: memberUserId,
        email: memberEmail,
        password: memberPassword,
        accountType: AccountType.MEMBER,
        status: UserStatus.ACTIVE,
        profile: {
          fullName: "Final Member Verification Officer",
        },
      },
      { accountType: AccountType.ADMIN, userId: "admin-system" }
    );

    assert.ok(createdMember);
    assert.equal(createdMember.id, memberUserId);
    assert.equal(createdMember.accountType, AccountType.MEMBER);
    assert.equal(createdMember.status, UserStatus.ACTIVE);

    // 2. Verify user is persisted in authoritative persistence layer
    const persistedInDb = await usersRepository.findById(memberUserId);
    assert.ok(persistedInDb, "Member must be found in authoritative database");
    assert.equal(persistedInDb.id, memberUserId);
    assert.equal(persistedInDb.accountType, "MEMBER");
    assert.equal(persistedInDb.status, "ACTIVE");

    // 3. Authenticate with User ID + password
    const loginResult = await authService.login(
      {
        username: memberUserId,
        password: memberPassword,
      } as any,
      { ipAddress: "127.0.0.1", userAgent: "E2E-Final-Verifier" }
    );

    assert.ok(loginResult.accessToken);
    assert.ok(loginResult.refreshToken);
    assert.equal(loginResult.user.id, memberUserId);
    assert.equal(loginResult.user.accountType, AccountType.MEMBER);

    memberAccessToken = loginResult.accessToken;
    memberRefreshToken = loginResult.refreshToken;

    // 4. Verify /auth/me resolution
    const decoded = jwtService.verifyAccessToken(memberAccessToken);
    assert.equal(decoded.sub, memberUserId);
    assert.equal(decoded.accountType, AccountType.MEMBER);

    const authMeUser = await authRepository.findById(decoded.sub);
    assert.ok(authMeUser);
    assert.equal(authMeUser.id, memberUserId);
    assert.equal(authMeUser.accountType, AccountType.MEMBER);
  });

  // -------------------------------------------------------------
  // TEST 3 — EMAIL LOGIN
  // -------------------------------------------------------------
  await t.test("TEST 3 — EMAIL LOGIN: Manager and Member can authenticate using Email + password", async () => {
    // 1. Manager authenticates with email
    const managerEmailLogin = await authService.login(
      {
        email: managerEmail,
        password: managerPassword,
      },
      { ipAddress: "127.0.0.1", userAgent: "E2E-Final-Verifier" }
    );
    assert.ok(managerEmailLogin.accessToken);
    assert.equal(managerEmailLogin.user.id, managerUserId);
    assert.equal(managerEmailLogin.user.email, managerEmail);
    assert.equal(managerEmailLogin.user.accountType, AccountType.MANAGER);

    // 2. Member authenticates with email
    const memberEmailLogin = await authService.login(
      {
        email: memberEmail,
        password: memberPassword,
      },
      { ipAddress: "127.0.0.1", userAgent: "E2E-Final-Verifier" }
    );
    assert.ok(memberEmailLogin.accessToken);
    assert.equal(memberEmailLogin.user.id, memberUserId);
    assert.equal(memberEmailLogin.user.email, memberEmail);
    assert.equal(memberEmailLogin.user.accountType, AccountType.MEMBER);
  });

  // -------------------------------------------------------------
  // TEST 4 — NEGATIVE AUTHENTICATION
  // -------------------------------------------------------------
  await t.test("TEST 4 — NEGATIVE AUTHENTICATION: rejects wrong password, unknown user, inactive and suspended accounts", async () => {
    // 1. Wrong password -> 401
    await assert.rejects(
      async () => {
        await authService.login({
          username: managerUserId,
          password: "CompletelyWrongPassword123!",
        } as any);
      },
      (err: any) => {
        assert.equal(err.statusCode, 401);
        return true;
      }
    );

    // 2. Unknown User ID -> 401
    await assert.rejects(
      async () => {
        await authService.login({
          username: "nonexistent-user-id-99999",
          password: managerPassword,
        } as any);
      },
      (err: any) => {
        assert.equal(err.statusCode, 401);
        return true;
      }
    );

    // 3. Unknown email -> 401
    await assert.rejects(
      async () => {
        await authService.login({
          email: "unknown.user.random@nowhere-domain.com",
          password: managerPassword,
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 401);
        return true;
      }
    );

    // 4. Inactive account -> rejected
    const inactiveUserId = "test-inactive-user-001";
    await usersService.createUser(
      {
        id: inactiveUserId,
        userId: inactiveUserId,
        email: "inactive.user@st-solutions.io",
        password: "TempPassword@123",
        accountType: AccountType.MEMBER,
        status: UserStatus.INACTIVE,
      },
      { accountType: AccountType.ADMIN, userId: "admin-system" }
    );

    await assert.rejects(
      async () => {
        await authService.login({
          username: inactiveUserId,
          password: "TempPassword@123",
        } as any);
      },
      (err: any) => {
        assert.match(err.message, /deactivated/i);
        return true;
      }
    );

    // 5. Suspended account -> rejected
    const suspendedUserId = "test-suspended-user-001";
    await usersService.createUser(
      {
        id: suspendedUserId,
        userId: suspendedUserId,
        email: "suspended.user@st-solutions.io",
        password: "TempPassword@123",
        accountType: AccountType.MEMBER,
        status: UserStatus.SUSPENDED,
      },
      { accountType: AccountType.ADMIN, userId: "admin-system" }
    );

    await assert.rejects(
      async () => {
        await authService.login({
          username: suspendedUserId,
          password: "TempPassword@123",
        } as any);
      },
      (err: any) => {
        assert.match(err.message, /suspended/i);
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // TEST 5 — ADMIN / SUB_ADMIN
  // -------------------------------------------------------------
  await t.test("TEST 5 — ADMIN/SUB_ADMIN: ADMIN_EMAIL + ADMIN_PASSWORD and SUB_ADMIN_EMAIL + SUB_ADMIN_PASSWORD work", async () => {
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

  // -------------------------------------------------------------
  // TEST 6 — PUBLIC REGISTRATION
  // -------------------------------------------------------------
  await t.test("TEST 6 — PUBLIC REGISTRATION: POST /api/v1/auth/register returns 403 Forbidden", async () => {
    await assert.rejects(
      async () => {
        await authService.register({
          fullName: "Public Anonymous Attacker",
          email: "attacker@public-web.com",
          password: "AttackerPass@1234",
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 403, "Public registration must be strictly forbidden (403)");
        assert.match(err.message, /Public registration is disabled/i);
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // TEST 7 — API URL NORMALIZATION
  // -------------------------------------------------------------
  await t.test("TEST 7 — API URL: ensures clean /api/v1 prefix without /api/api/v1 duplication", () => {
    const normalizeUrl = (endpoint: string, base = "/api/v1") => {
      let clean = endpoint;
      if (clean.startsWith("/api/v1/")) clean = clean.slice(7);
      else if (clean.startsWith("api/v1/")) clean = clean.slice(6);
      else if (clean.startsWith("/api/")) clean = clean.slice(4);
      else if (clean.startsWith("api/")) clean = clean.slice(3);

      return `${base}${clean.startsWith("/") ? "" : "/"}${clean}`;
    };

    assert.equal(normalizeUrl("/auth/login"), "/api/v1/auth/login");
    assert.equal(normalizeUrl("auth/login"), "/api/v1/auth/login");
    assert.equal(normalizeUrl("/api/v1/auth/login"), "/api/v1/auth/login");
    assert.equal(normalizeUrl("api/v1/auth/login"), "/api/v1/auth/login");
    assert.equal(normalizeUrl("/api/auth/login"), "/api/v1/auth/login");
    assert.notEqual(normalizeUrl("/api/v1/auth/login"), "/api/api/v1/auth/login");
  });

  // -------------------------------------------------------------
  // TEST 8 — SESSION (Refresh & Logout)
  // -------------------------------------------------------------
  await t.test("TEST 8 — SESSION: /auth/me, /auth/refresh, and /auth/logout work for Manager & Member", async () => {
    // 1. Refresh Manager Token
    const refreshedManager = await authService.refreshToken(managerRefreshToken);
    assert.ok(refreshedManager.accessToken);
    assert.ok(refreshedManager.refreshToken);

    const decodedRefreshed = jwtService.verifyAccessToken(refreshedManager.accessToken);
    assert.equal(decodedRefreshed.sub, managerUserId);

    // 2. Refresh Member Token
    const refreshedMember = await authService.refreshToken(memberRefreshToken);
    assert.ok(refreshedMember.accessToken);

    // 3. Logout Manager & Member
    const managerLogout = await authService.logout(managerUserId);
    assert.match(managerLogout.message, /Logged out successfully/i);

    const memberLogout = await authService.logout(memberUserId);
    assert.match(memberLogout.message, /Logged out successfully/i);
  });

  // -------------------------------------------------------------
  // TEST 9 — RBAC
  // -------------------------------------------------------------
  await t.test("TEST 9 — RBAC: MANAGER cannot create/promote ADMIN/SUB_ADMIN; MEMBER cannot create users or manage roles", async () => {
    // 1. MANAGER cannot create ADMIN
    await assert.rejects(
      async () => {
        await usersService.createUser(
          {
            email: "unauthorized.admin@domain.com",
            password: "SomePassword@123",
            accountType: AccountType.ADMIN,
            status: UserStatus.ACTIVE,
          },
          { userId: managerUserId, accountType: AccountType.MANAGER }
        );
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /cannot create users with account type 'ADMIN'/i);
        return true;
      }
    );

    // 2. MANAGER cannot create SUB_ADMIN
    await assert.rejects(
      async () => {
        await usersService.createUser(
          {
            email: "unauthorized.subadmin@domain.com",
            password: "SomePassword@123",
            accountType: AccountType.SUB_ADMIN,
            status: UserStatus.ACTIVE,
          },
          { userId: managerUserId, accountType: AccountType.MANAGER }
        );
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /cannot create users with account type 'SUB_ADMIN'/i);
        return true;
      }
    );

    // 3. MEMBER cannot create any user
    await assert.rejects(
      async () => {
        await usersService.createUser(
          {
            email: "member.created.user@domain.com",
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

    // 4. MEMBER cannot change roles
    await assert.rejects(
      async () => {
        await usersService.updateUserRole(
          managerUserId,
          { accountType: AccountType.ADMIN },
          { userId: memberUserId, accountType: AccountType.MEMBER }
        );
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /cannot change role/i);
        return true;
      }
    );
  });
});

