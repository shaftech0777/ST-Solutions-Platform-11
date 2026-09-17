import { PrismaClient, AccountType } from "@prisma/client";

const prisma = new PrismaClient();

interface CleanupSummary {
  preserved: Array<{ id: string; email: string | null; role: string; reason: string }>;
  identifiedTestAccounts: Array<{ id: string; email: string | null; role: string; pattern: string }>;
  unresolvedAccounts: Array<{ id: string; email: string | null; role: string; details: string }>;
  deletedOrDeactivated: Array<{ id: string; email: string | null; role: string; action: string }>;
}

/**
 * Deterministically checks if a user matches known test/demo account patterns.
 */
function identifyTestPattern(user: {
  id: string;
  email: string | null;
  accountType: AccountType;
  profile?: { fullName?: string | null } | null;
}): string | null {
  const email = (user.email || "").toLowerCase().trim();
  const id = user.id.toLowerCase().trim();
  const name = (user.profile?.fullName || "").toLowerCase().trim();

  // Test email patterns
  if (/^stage\d+\.test\.\d+@/i.test(email)) return "Automated test generator email pattern (stage*.test.*)";
  if (/^manager\.final\.\d+@/i.test(email)) return "Verification test manager email pattern";
  if (/^member\.final\.\d+@/i.test(email)) return "Verification test member email pattern";
  if (/^inactive\.user@/i.test(email)) return "Test fixture inactive user";
  if (/^suspended\.user@/i.test(email)) return "Test fixture suspended user";
  if (/^gbfgs@gmail\.com$/i.test(email)) return "Junk test submission email";

  // Test ID patterns
  if (id.startsWith("test-manager-") || id.startsWith("test-member-") || id.startsWith("test-user-")) {
    return `Test fixture prefix ID (${id})`;
  }
  if (id.startsWith("test-inactive-") || id.startsWith("test-suspended-")) {
    return `Test fixture status ID (${id})`;
  }

  // Test full name patterns
  if (name.includes("verification officer") || name === "gbfgn fg") {
    return `Test fixture full name (${name})`;
  }

  return null;
}

async function runCleanup() {
  const isDryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";
  console.log("=========================================================");
  console.log(`ST-SOLUTIONS SAFE DATABASE CLEANUP UTILITY`);
  console.log(`Mode: ${isDryRun ? "DRY RUN (REPORT ONLY - NO CHANGES APPLIED)" : "LIVE EXECUTION (TRANSACTION PROTECTED)"}`);
  console.log("=========================================================");

  // 1. Fetch the primary ADMIN account
  const adminUser = await prisma.user.findFirst({
    where: { accountType: AccountType.ADMIN },
    include: { profile: true },
  });

  if (!adminUser) {
    throw new Error("Critical Safety Abort: No ADMIN account found in database. Halting cleanup.");
  }

  // 2. Fetch all users with relevant relational metadata
  const allUsers = await prisma.user.findMany({
    include: {
      profile: true,
      sessions: true,
      auditLogs: true,
      createdProjects: true,
      managedProjects: true,
      assignedProjects: true,
      ownedClients: true,
      supervisedClients: true,
      ownedOrganizations: true,
      organizationMemberships: true,
      workspaceMemberships: true,
    },
  });

  const summary: CleanupSummary = {
    preserved: [],
    identifiedTestAccounts: [],
    unresolvedAccounts: [],
    deletedOrDeactivated: [],
  };

  const usersToDelete: typeof allUsers = [];

  for (const user of allUsers) {
    // RULE 1: Never touch ADMIN accounts
    if (user.accountType === AccountType.ADMIN) {
      summary.preserved.push({
        id: user.id,
        email: user.email,
        role: user.accountType,
        reason: "Primary / Executive ADMIN Account (Protected)",
      });
      continue;
    }

    // RULE 2: Protect legitimate SUB_ADMIN accounts
    if (user.accountType === AccountType.SUB_ADMIN) {
      summary.preserved.push({
        id: user.id,
        email: user.email,
        role: user.accountType,
        reason: "Legitimate SUB_ADMIN Account (Protected)",
      });
      continue;
    }

    // RULE 3: Check for active business relations (projects, clients, inquiries)
    const hasBusinessData =
      user.createdProjects.length > 0 ||
      user.managedProjects.length > 0 ||
      user.assignedProjects.length > 0 ||
      user.ownedClients.length > 0 ||
      user.supervisedClients.length > 0;

    // RULE 4: Test pattern identification
    const testPattern = identifyTestPattern(user);

    if (testPattern) {
      summary.identifiedTestAccounts.push({
        id: user.id,
        email: user.email,
        role: user.accountType,
        pattern: testPattern,
      });

      if (hasBusinessData) {
        summary.unresolvedAccounts.push({
          id: user.id,
          email: user.email,
          role: user.accountType,
          details: `Matches test pattern (${testPattern}) but contains attached business records. Preserved for manual review.`,
        });
        summary.preserved.push({
          id: user.id,
          email: user.email,
          role: user.accountType,
          reason: `Preserved due to attached business data (${user.assignedProjects.length} projects, ${user.ownedClients.length} clients)`,
        });
      } else {
        usersToDelete.push(user);
      }
    } else {
      // Not a test pattern - preserve user
      summary.preserved.push({
        id: user.id,
        email: user.email,
        role: user.accountType,
        reason: "Valid production account without test markers",
      });
    }
  }

  // 3. Perform Deletion / Reassignment in Transaction if not Dry Run
  if (!isDryRun && usersToDelete.length > 0) {
    for (const user of usersToDelete) {
      await prisma.$transaction(async (tx) => {
        // Reassign any owned organizations to root admin
        if (user.ownedOrganizations.length > 0) {
          for (const org of user.ownedOrganizations) {
            await tx.organization.update({
              where: { id: org.id },
              data: { ownerId: adminUser.id },
            });
          }
        }

        // Clean dependent memberships and sessions
        await tx.organizationMember.deleteMany({ where: { userId: user.id } });
        await tx.workspaceMember.deleteMany({ where: { userId: user.id } });
        await tx.session.deleteMany({ where: { userId: user.id } });
        await tx.notification.deleteMany({ where: { userId: user.id } });

        if (user.profile) {
          await tx.userProfile.delete({ where: { userId: user.id } });
        }

        // Delete user record safely
        await tx.user.delete({ where: { id: user.id } });
      });

      summary.deletedOrDeactivated.push({
        id: user.id,
        email: user.email,
        role: user.accountType,
        action: "Cleanly deleted test user and associated sessions/profile",
      });
    }
  }

  // 4. Output Comprehensive Report
  console.log("\n--- PRESERVED ACCOUNTS ---");
  console.table(summary.preserved);

  console.log("\n--- IDENTIFIED TEST/DEMO ACCOUNTS ---");
  if (summary.identifiedTestAccounts.length > 0) {
    console.table(summary.identifiedTestAccounts);
  } else {
    console.log("No test/demo accounts found.");
  }

  console.log("\n--- UNRESOLVED ACCOUNTS REQUIRING MANUAL REVIEW ---");
  if (summary.unresolvedAccounts.length > 0) {
    console.table(summary.unresolvedAccounts);
  } else {
    console.log("None. All candidate accounts clearly categorized.");
  }

  if (isDryRun) {
    console.log(`\n[DRY RUN SUMMARY]: ${usersToDelete.length} accounts would be cleaned. No changes committed.`);
  } else {
    console.log(`\n[LIVE CLEANUP SUMMARY]: ${summary.deletedOrDeactivated.length} test accounts successfully cleaned.`);
  }

  await prisma.$disconnect();
}

runCleanup().catch((err) => {
  console.error("Cleanup execution failed:", err);
  process.exit(1);
});
