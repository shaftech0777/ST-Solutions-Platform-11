import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupTestStaffData() {
  console.log("=== STARTING IDEMPOTENT DB STAFF CLEANUP ===");

  // Find the real ADMIN account to reassign orphaned organization ownership if needed
  const adminUser = await prisma.user.findFirst({
    where: { accountType: "ADMIN" },
  });

  if (!adminUser) {
    throw new Error("No ADMIN account found in database. Aborting cleanup.");
  }

  // Find all users excluding ADMIN and SUB_ADMIN
  const candidateUsers = await prisma.user.findMany({
    where: {
      accountType: {
        notIn: ["ADMIN", "SUB_ADMIN"],
      },
    },
    include: {
      profile: true,
      sessions: true,
      auditLogs: true,
      createdProjects: true,
      managedProjects: true,
      assignedProjects: true,
      ownedClients: true,
      ownedOrganizations: true,
    },
  });

  console.log(`Found ${candidateUsers.length} non-admin/non-subadmin user accounts to inspect.`);

  let deletedCount = 0;
  let preservedCount = 0;

  for (const user of candidateUsers) {
    // Preserve accounts that own real client data or real projects with payments
    const hasRealProjects =
      user.createdProjects.length > 0 ||
      user.managedProjects.length > 0 ||
      user.assignedProjects.length > 0 ||
      user.ownedClients.length > 0;

    if (hasRealProjects) {
      console.log(`[PRESERVED] User ID: ${user.id} (${user.email}) - Has active project or client data.`);
      preservedCount++;
      continue;
    }

    try {
      // 1. Reassign or delete test organizations owned by this test user
      if (user.ownedOrganizations.length > 0) {
        for (const org of user.ownedOrganizations) {
          await prisma.organization.update({
            where: { id: org.id },
            data: { ownerId: adminUser.id },
          });
          console.log(`Reassigned organization '${org.id}' owner from test user '${user.id}' to ADMIN '${adminUser.id}'`);
        }
      }

      // 2. Clear organization memberships and workspace memberships
      await prisma.organizationMember.deleteMany({ where: { userId: user.id } });
      await prisma.workspaceMember.deleteMany({ where: { userId: user.id } });

      // 3. Delete sessions
      await prisma.session.deleteMany({ where: { userId: user.id } });

      // 4. Delete profile
      if (user.profile) {
        await prisma.userProfile.delete({ where: { userId: user.id } });
      }

      // 5. Delete notifications
      await prisma.notification.deleteMany({ where: { userId: user.id } });

      // 6. Delete user record
      await prisma.user.delete({ where: { id: user.id } });

      console.log(`[DELETED] User ID: ${user.id} | Email: ${user.email} | Role: ${user.accountType}`);
      deletedCount++;
    } catch (err: any) {
      console.error(`[ERROR DELETING USER ${user.id}]:`, err.message);
    }
  }

  // Verify remaining accounts in database
  const remainingUsers = await prisma.user.findMany({
    include: {
      profile: true,
    },
  });

  console.log("=== CLEANUP VERIFICATION ===");
  console.log(`Deleted: ${deletedCount} demo/test staff accounts`);
  console.log(`Preserved: ${preservedCount} accounts with active data`);
  console.log(`Total Remaining Users in Database: ${remainingUsers.length}`);
  console.table(
    remainingUsers.map((u) => ({
      ID: u.id,
      Email: u.email,
      AccountType: u.accountType,
      Status: u.status,
      FullName: u.profile?.fullName || "N/A",
    }))
  );

  await prisma.$disconnect();
}

cleanupTestStaffData().catch((e) => {
  console.error("Cleanup failed:", e);
  process.exit(1);
});
