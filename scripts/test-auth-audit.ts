import { AccountType, UserStatus } from "@prisma/client";
import { authService } from "../apps/api/src/modules/auth/auth.service.js";
import { usersService } from "../apps/api/src/modules/users/users.service.js";
import { jwtService } from "../apps/api/src/core/security/jwt.service.js";
import { config } from "../apps/api/src/config/index.js";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(suite: string, name: string, condition: boolean, expected: string, actual: string, error?: string) {
  results.push({
    suite,
    name,
    passed: condition,
    expected,
    actual,
    error,
  });
  const symbol = condition ? "✅ PASS" : "❌ FAIL";
  console.log(`[${symbol}] [${suite}] ${name}: expected ${expected}, got ${actual}`);
}

async function runAuthAuditTests() {
  console.log("================================================================");
  console.log("     STARTING PRODUCTION AUTHENTICATION & RBAC SECURITY AUDIT   ");
  console.log("================================================================");

  // 1. PUBLIC REGISTRATION AUDIT
  try {
    let regFailedAsExpected = false;
    let regMessage = "";
    try {
      await authService.register({
        email: "attacker@public.com",
        password: "AttackerPassword123!",
        fullName: "Attacker User",
      });
    } catch (err: any) {
      regFailedAsExpected = err.statusCode === 403 || err.message?.includes("Public account registration is disabled");
      regMessage = `${err.statusCode || 500}: ${err.message}`;
    }
    assert(
      "Public Policy",
      "POST /auth/register returns 403 Forbidden",
      regFailedAsExpected,
      "403 Forbidden with disabled message",
      regMessage
    );
  } catch (err: any) {
    assert("Public Policy", "POST /auth/register", false, "403 Forbidden", err.message);
  }

  // 2. ROOT ADMIN AUTHENTICATION
  let adminUser: any = null;
  try {
    const adminEmail = config.auth.adminEmail || "admin@st-solutions.com";
    const adminPassword = config.auth.adminPassword || "Admin@123456";

    const loginRes = await authService.login({
      identifier: adminEmail,
      email: adminEmail,
      password: adminPassword,
    });

    adminUser = loginRes.user;
    const hasTokens = !!loginRes.accessToken && !!loginRes.refreshToken;
    const isAdmin = loginRes.user.accountType === AccountType.ADMIN;

    assert(
      "Root Admin",
      "Admin Login via Environment Credentials",
      hasTokens && isAdmin,
      `Tokens returned, accountType=ADMIN`,
      `accountType=${loginRes.user.accountType}, hasAccessToken=${!!loginRes.accessToken}`
    );

    // Verify JWT payload
    const decoded = jwtService.verifyAccessToken(loginRes.accessToken);
    assert(
      "Root Admin JWT",
      "Access Token claims contain role=ADMIN and permissions",
      decoded.accountType === "ADMIN" && (decoded.permissions?.length ?? 0) > 0,
      "accountType=ADMIN, permissions count > 0",
      `accountType=${decoded.accountType}, permissionsCount=${decoded.permissions?.length}`
    );
  } catch (err: any) {
    assert("Root Admin", "Admin Login", false, "Successful login", err.message);
  }

  // 3. SUB-ADMIN AUTHENTICATION
  let subAdminUser: any = null;
  try {
    const subAdminEmail = config.auth.subAdminEmail || "subadmin@st-solutions.com";
    const subAdminPassword = config.auth.subAdminPassword || "SubAdmin@123456";

    const loginRes = await authService.login({
      identifier: subAdminEmail,
      email: subAdminEmail,
      password: subAdminPassword,
    });

    subAdminUser = loginRes.user;
    const isSubAdmin = loginRes.user.accountType === AccountType.SUB_ADMIN;
    const hasTokens = !!loginRes.accessToken && !!loginRes.refreshToken;

    assert(
      "Sub-Admin",
      "Sub-Admin Login via Environment Credentials",
      isSubAdmin && hasTokens,
      "accountType=SUB_ADMIN with valid tokens",
      `accountType=${loginRes.user.accountType}, hasTokens=${hasTokens}`
    );
  } catch (err: any) {
    assert("Sub-Admin", "Sub-Admin Login", false, "Successful login", err.message);
  }

  // 4. ADMIN RBAC & PROVISIONING CAPABILITIES
  let testManager: any = null;
  let testMember: any = null;
  try {
    const adminActor = { userId: adminUser?.id, accountType: AccountType.ADMIN };

    // Admin creates Manager with User ID
    const managerUid = `mgr-audit-${Date.now().toString(36)}`;
    testManager = await usersService.createUser(
      {
        id: managerUid,
        userId: managerUid,
        email: `${managerUid}@st-solutions.internal`,
        password: "ManagerPassword123!",
        accountType: AccountType.MANAGER,
        status: UserStatus.ACTIVE,
        profile: { fullName: "Audit Test Manager" },
      },
      adminActor
    );

    assert(
      "Admin Provisioning",
      "Admin can provision MANAGER account with User ID",
      testManager.accountType === AccountType.MANAGER,
      "accountType=MANAGER",
      `accountType=${testManager.accountType}, id=${testManager.id}`
    );

    // Admin creates Member with User ID
    const memberUid = `mbr-audit-${Date.now().toString(36)}`;
    testMember = await usersService.createUser(
      {
        id: memberUid,
        userId: memberUid,
        email: `${memberUid}@st-solutions.internal`,
        password: "MemberPassword123!",
        accountType: AccountType.MEMBER,
        status: UserStatus.ACTIVE,
        profile: { fullName: "Audit Test Member" },
      },
      adminActor
    );

    assert(
      "Admin Provisioning",
      "Admin can provision MEMBER account with User ID",
      testMember.accountType === AccountType.MEMBER,
      "accountType=MEMBER",
      `accountType=${testMember.accountType}, id=${testMember.id}`
    );
  } catch (err: any) {
    assert("Admin Provisioning", "Admin User Creation", false, "Creation Success", err.message);
  }

  // 5. SUB-ADMIN RBAC BOUNDARIES & HIERARCHY AUDIT
  try {
    const subAdminActor = { userId: subAdminUser?.id, accountType: AccountType.SUB_ADMIN };

    // Sub-Admin creates Member (Allowed)
    const subMemberUid = `sub-mbr-${Date.now().toString(36)}`;
    const subCreatedMember = await usersService.createUser(
      {
        id: subMemberUid,
        userId: subMemberUid,
        email: `${subMemberUid}@st-solutions.internal`,
        password: "MemberPassword123!",
        accountType: AccountType.MEMBER,
        status: UserStatus.ACTIVE,
        profile: { fullName: "SubAdmin Created Member" },
      },
      subAdminActor
    );

    assert(
      "Sub-Admin Hierarchy",
      "Sub-Admin can create MEMBER account",
      subCreatedMember.accountType === AccountType.MEMBER,
      "accountType=MEMBER",
      `accountType=${subCreatedMember.accountType}`
    );

    // Sub-Admin attempts to create ADMIN (Must be FORBIDDEN / 403)
    let adminCreationBlocked = false;
    let adminCreationError = "";
    try {
      await usersService.createUser(
        {
          id: `illegal-admin-${Date.now().toString(36)}`,
          email: "illegaladmin@st-solutions.com",
          password: "IllegalPassword123!",
          accountType: AccountType.ADMIN,
          status: UserStatus.ACTIVE,
        },
        subAdminActor
      );
    } catch (err: any) {
      adminCreationBlocked = err.statusCode === 403 || err.message?.includes("cannot create users with account type 'ADMIN'");
      adminCreationError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Sub-Admin Hierarchy",
      "Sub-Admin is FORBIDDEN from creating ADMIN accounts (403)",
      adminCreationBlocked,
      "403 Forbidden",
      adminCreationError
    );

    // Sub-Admin attempts to promote Member to ADMIN (Must be FORBIDDEN / 403)
    let promotionBlocked = false;
    let promotionError = "";
    try {
      await usersService.updateUserRole(
        subCreatedMember.id,
        { accountType: AccountType.ADMIN },
        subAdminActor
      );
    } catch (err: any) {
      promotionBlocked = err.statusCode === 403 || err.message?.includes("cannot promote or assign users to 'ADMIN'");
      promotionError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Sub-Admin Hierarchy",
      "Sub-Admin is FORBIDDEN from promoting users to ADMIN (403)",
      promotionBlocked,
      "403 Forbidden",
      promotionError
    );

    // Sub-Admin attempts to modify Admin account (Must be FORBIDDEN / 403)
    let adminModBlocked = false;
    let adminModError = "";
    try {
      await usersService.updateUserStatus(
        adminUser.id,
        { status: UserStatus.SUSPENDED },
        subAdminActor
      );
    } catch (err: any) {
      adminModBlocked = err.statusCode === 403 || err.message?.includes("cannot change status of users with 'ADMIN' level");
      adminModError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Sub-Admin Hierarchy",
      "Sub-Admin is FORBIDDEN from suspending Admin account (403)",
      adminModBlocked,
      "403 Forbidden",
      adminModError
    );
  } catch (err: any) {
    assert("Sub-Admin Hierarchy", "Sub-Admin Boundary Tests", false, "Enforced boundaries", err.message);
  }

  // 6. MANAGER RBAC BOUNDARIES & HIERARCHY AUDIT
  try {
    const managerActor = { userId: testManager?.id, accountType: AccountType.MANAGER };

    // Manager attempts to create ADMIN (Must be FORBIDDEN / 403)
    let managerCreateAdminBlocked = false;
    let managerCreateAdminError = "";
    try {
      await usersService.createUser(
        {
          id: `mgr-illegal-admin-${Date.now().toString(36)}`,
          email: "mgr-illegaladmin@st-solutions.com",
          password: "IllegalPassword123!",
          accountType: AccountType.ADMIN,
          status: UserStatus.ACTIVE,
        },
        managerActor
      );
    } catch (err: any) {
      managerCreateAdminBlocked = err.statusCode === 403;
      managerCreateAdminError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Manager Hierarchy",
      "Manager is FORBIDDEN from creating ADMIN accounts (403)",
      managerCreateAdminBlocked,
      "403 Forbidden",
      managerCreateAdminError
    );

    // Manager attempts to create SUB_ADMIN (Must be FORBIDDEN / 403)
    let managerCreateSubAdminBlocked = false;
    let managerCreateSubAdminError = "";
    try {
      await usersService.createUser(
        {
          id: `mgr-illegal-subadmin-${Date.now().toString(36)}`,
          email: "mgr-illegalsubadmin@st-solutions.com",
          password: "IllegalPassword123!",
          accountType: AccountType.SUB_ADMIN,
          status: UserStatus.ACTIVE,
        },
        managerActor
      );
    } catch (err: any) {
      managerCreateSubAdminBlocked = err.statusCode === 403;
      managerCreateSubAdminError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Manager Hierarchy",
      "Manager is FORBIDDEN from creating SUB_ADMIN accounts (403)",
      managerCreateSubAdminBlocked,
      "403 Forbidden",
      managerCreateSubAdminError
    );

    // Manager attempts to promote self (Must be FORBIDDEN / 422 or 403)
    let selfPromoteBlocked = false;
    let selfPromoteError = "";
    try {
      await usersService.updateUserRole(
        testManager.id,
        { accountType: AccountType.ADMIN },
        managerActor
      );
    } catch (err: any) {
      selfPromoteBlocked = err.statusCode === 422 || err.statusCode === 400 || err.statusCode === 403;
      selfPromoteError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Manager Hierarchy",
      "Manager is FORBIDDEN from modifying self role",
      selfPromoteBlocked,
      "Self-Modification Blocked (422/400/403)",
      selfPromoteError
    );
  } catch (err: any) {
    assert("Manager Hierarchy", "Manager Boundary Tests", false, "Enforced boundaries", err.message);
  }

  // 7. MEMBER RBAC BOUNDARIES AUDIT
  try {
    const memberActor = { userId: testMember?.id, accountType: AccountType.MEMBER };

    // Member attempts to create user (Must be FORBIDDEN / 403)
    let memberCreateUserBlocked = false;
    let memberCreateUserError = "";
    try {
      await usersService.createUser(
        {
          id: `mbr-illegal-usr-${Date.now().toString(36)}`,
          email: "mbr-illegal@st-solutions.com",
          password: "IllegalPassword123!",
          accountType: AccountType.MEMBER,
          status: UserStatus.ACTIVE,
        },
        memberActor
      );
    } catch (err: any) {
      memberCreateUserBlocked = err.statusCode === 403;
      memberCreateUserError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Member Hierarchy",
      "Member is FORBIDDEN from creating any user account (403)",
      memberCreateUserBlocked,
      "403 Forbidden",
      memberCreateUserError
    );

    // Member attempts to assign role to another user (Must be FORBIDDEN / 403)
    let memberRoleBlocked = false;
    let memberRoleError = "";
    try {
      await usersService.updateUserRole(
        testManager.id,
        { accountType: AccountType.MEMBER },
        memberActor
      );
    } catch (err: any) {
      memberRoleBlocked = err.statusCode === 403 || err.statusCode === 422 || err.statusCode === 400;
      memberRoleError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Member Hierarchy",
      "Member is FORBIDDEN from modifying other user roles (403)",
      memberRoleBlocked,
      "403 Forbidden",
      memberRoleError
    );
  } catch (err: any) {
    assert("Member Hierarchy", "Member Boundary Tests", false, "Enforced boundaries", err.message);
  }

  // 8. SUSPENDED / INACTIVE ACCOUNT ACCESS LOCKOUT AUDIT
  try {
    const adminActor = { userId: adminUser?.id, accountType: AccountType.ADMIN };

    // Create a user to suspend
    const userToSuspendId = `susp-user-${Date.now().toString(36)}`;
    const userToSuspend = await usersService.createUser(
      {
        id: userToSuspendId,
        userId: userToSuspendId,
        email: `${userToSuspendId}@st-solutions.internal`,
        password: "SuspendedPassword123!",
        accountType: AccountType.MEMBER,
        status: UserStatus.ACTIVE,
      },
      adminActor
    );

    // 1. Confirm login works when ACTIVE
    const activeLoginRes = await authService.login({
      identifier: userToSuspendId,
      password: "SuspendedPassword123!",
    });
    assert(
      "Account Status",
      "User can login when ACTIVE",
      !!activeLoginRes.accessToken,
      "Token returned",
      "Login Successful"
    );

    // 2. Suspend the user
    await usersService.updateUserStatus(userToSuspend.id, { status: UserStatus.SUSPENDED }, adminActor);

    // 3. Attempt login after suspension (Must FAIL / 401 or 403)
    let loginBlockedAfterSuspended = false;
    let suspendedLoginError = "";
    try {
      await authService.login({
        identifier: userToSuspendId,
        password: "SuspendedPassword123!",
      });
    } catch (err: any) {
      loginBlockedAfterSuspended = err.statusCode === 401 || err.statusCode === 403 || err.message?.includes("suspended");
      suspendedLoginError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Account Status",
      "SUSPENDED user login is rejected (401/403)",
      loginBlockedAfterSuspended,
      "Authentication Error (Suspended)",
      suspendedLoginError
    );

    // 4. Inactivate the user
    await usersService.updateUserStatus(userToSuspend.id, { status: UserStatus.INACTIVE }, adminActor);

    // 5. Attempt login after inactivation (Must FAIL / 401 or 403)
    let loginBlockedAfterInactive = false;
    let inactiveLoginError = "";
    try {
      await authService.login({
        identifier: userToSuspendId,
        password: "SuspendedPassword123!",
      });
    } catch (err: any) {
      loginBlockedAfterInactive = err.statusCode === 401 || err.statusCode === 403 || err.message?.includes("inactive") || err.message?.includes("deactivated");
      inactiveLoginError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Account Status",
      "INACTIVE user login is rejected (401/403)",
      loginBlockedAfterInactive,
      "Authentication Error (Inactive)",
      inactiveLoginError
    );
  } catch (err: any) {
    assert("Account Status", "Suspension & Deactivation Tests", false, "Account Lockout", err.message);
  }

  // 9. LAST ACTIVE ADMIN PROTECTION AUDIT
  try {
    // Create a temporary secondary admin to test the protection boundary
    const secondAdminUid = `admin-sec-${Date.now().toString(36)}`;
    const secondAdmin = await usersService.createUser(
      {
        id: secondAdminUid,
        userId: secondAdminUid,
        email: `${secondAdminUid}@st-solutions.internal`,
        password: "SecondAdminPass123!",
        accountType: AccountType.ADMIN,
        status: UserStatus.ACTIVE,
      },
      { userId: adminUser?.id, accountType: AccountType.ADMIN }
    );

    // With 2 admins, one admin can demote the second admin
    await usersService.updateUserRole(
      secondAdmin.id,
      { accountType: AccountType.MEMBER },
      { userId: adminUser?.id, accountType: AccountType.ADMIN }
    );

    // Now only 1 active admin remains (adminUser)
    // Attempting to demote or suspend the sole remaining admin by any other mechanism must fail
    let lastAdminBlocked = false;
    let lastAdminError = "";
    try {
      // Create a mock sub-admin attempting to delete or demote sole admin
      await usersService.deleteUser(adminUser.id, { userId: "other-actor", accountType: AccountType.ADMIN });
    } catch (err: any) {
      lastAdminBlocked = err.statusCode === 422 || err.statusCode === 400 || err.message?.includes("last active administrator");
      lastAdminError = `${err.statusCode || 500}: ${err.message}`;
    }

    assert(
      "Admin Protection",
      "System protects the last active Administrator account from deletion",
      lastAdminBlocked,
      "Action Blocked (Last Admin Protected)",
      lastAdminError
    );
  } catch (err: any) {
    assert("Admin Protection", "Last Admin Protection", false, "Protected", err.message);
  }

  // SUMMARY
  console.log("\n================================================================");
  console.log("                     AUDIT TEST SUMMARY                         ");
  console.log("================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`TOTAL TESTS: ${total}`);
  console.log(`PASSED:      ${passed}`);
  console.log(`FAILED:      ${failed}`);
  console.log("================================================================");

  if (failed > 0) {
    console.error("❌ Some audit tests failed. Review output above.");
    process.exit(1);
  } else {
    console.log("✅ All production-grade authentication & RBAC audit tests PASSED.");
    process.exit(0);
  }
}

runAuthAuditTests().catch((err) => {
  console.error("FATAL ERROR in audit tests:", err);
  process.exit(1);
});
