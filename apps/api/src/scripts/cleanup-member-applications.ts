import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CleanupResult {
  applicationsTargeted: number;
  answersDeleted: number;
  verificationsDeleted: number;
  applicationProfilesDeleted: number;
  applicationsDeleted: number;
  usersPreserved: number;
  questionsPreserved: number;
  projectsPreserved: number;
  inquiriesPreserved: number;
}

export async function cleanupMemberApplications(isDryRun = false): Promise<CleanupResult> {
  console.log("=========================================================");
  console.log("ST-SOLUTIONS SAFE MEMBER APPLICATION CLEANUP UTILITY");
  console.log(`Mode: ${isDryRun ? "DRY RUN (REPORT ONLY - NO CHANGES APPLIED)" : "LIVE EXECUTION (TRANSACTION PROTECTED)"}`);
  console.log("=========================================================");

  // 1. Audit baseline entities to protect
  const initialUsersCount = await prisma.user.count();
  const initialQuestionsCount = await prisma.applicationQuestion.count();
  const initialProjectsCount = await prisma.project.count();
  const initialInquiriesCount = await prisma.projectInquiry.count();

  const applicationRecords = await prisma.memberApplication.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      applicationStatus: true,
      createdAt: true,
    },
  });

  const targetCount = applicationRecords.length;
  console.log(`Identified ${targetCount} MemberApplication record(s) for cleanup.`);

  if (targetCount === 0) {
    console.log("No application records found in database. Cleanup is complete.");
    return {
      applicationsTargeted: 0,
      answersDeleted: 0,
      verificationsDeleted: 0,
      applicationProfilesDeleted: 0,
      applicationsDeleted: 0,
      usersPreserved: initialUsersCount,
      questionsPreserved: initialQuestionsCount,
      projectsPreserved: initialProjectsCount,
      inquiriesPreserved: initialInquiriesCount,
    };
  }

  const appIds = applicationRecords.map((a) => a.id);

  // Count dependent records
  const answersCount = await prisma.applicationAnswer.count({
    where: { applicationId: { in: appIds } },
  });
  const verificationsCount = await prisma.memberVerification.count({
    where: { applicationId: { in: appIds } },
  });
  const appProfilesCount = await prisma.memberProfile.count({
    where: { applicationId: { in: appIds } },
  });

  console.log(`Associated dependent records:`);
  console.log(`- ApplicationAnswer rows: ${answersCount}`);
  console.log(`- MemberVerification rows: ${verificationsCount}`);
  console.log(`- Application-linked MemberProfile rows: ${appProfilesCount}`);

  if (isDryRun) {
    console.log("\n[DRY RUN] No database modifications performed.");
    return {
      applicationsTargeted: targetCount,
      answersDeleted: answersCount,
      verificationsDeleted: verificationsCount,
      applicationProfilesDeleted: appProfilesCount,
      applicationsDeleted: targetCount,
      usersPreserved: initialUsersCount,
      questionsPreserved: initialQuestionsCount,
      projectsPreserved: initialProjectsCount,
      inquiriesPreserved: initialInquiriesCount,
    };
  }

  // Live execution in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Disassociate any communication logs
    await tx.communicationLog.updateMany({
      where: { memberApplicationId: { in: appIds } },
      data: { memberApplicationId: null },
    });

    // 2. Delete child records explicitly for full safety
    if (answersCount > 0) {
      await tx.applicationAnswer.deleteMany({
        where: { applicationId: { in: appIds } },
      });
    }

    if (verificationsCount > 0) {
      await tx.memberVerification.deleteMany({
        where: { applicationId: { in: appIds } },
      });
    }

    if (appProfilesCount > 0) {
      await tx.memberProfile.deleteMany({
        where: { applicationId: { in: appIds } },
      });
    }

    // 3. Delete MemberApplication records
    const deleteResult = await tx.memberApplication.deleteMany({
      where: { id: { in: appIds } },
    });

    console.log(`Successfully deleted ${deleteResult.count} MemberApplication record(s).`);
  });

  // Verification checks
  const finalAppCount = await prisma.memberApplication.count();
  const finalUsersCount = await prisma.user.count();
  const finalQuestionsCount = await prisma.applicationQuestion.count();
  const finalProjectsCount = await prisma.project.count();
  const finalInquiriesCount = await prisma.projectInquiry.count();

  console.log("\nPOST-CLEANUP INTEGRITY VERIFICATION:");
  console.log(`- MemberApplication count: ${finalAppCount} (Expected: 0)`);
  console.log(`- ApplicationQuestion count: ${finalQuestionsCount} (Preserved: ${initialQuestionsCount})`);
  console.log(`- User accounts count: ${finalUsersCount} (Preserved: ${initialUsersCount})`);
  console.log(`- Projects count: ${finalProjectsCount} (Preserved: ${initialProjectsCount})`);
  console.log(`- Project Inquiries count: ${finalInquiriesCount} (Preserved: ${initialInquiriesCount})`);

  if (finalUsersCount !== initialUsersCount) {
    throw new Error(`CRITICAL INTEGRITY VIOLATION: User count changed from ${initialUsersCount} to ${finalUsersCount}!`);
  }

  return {
    applicationsTargeted: targetCount,
    answersDeleted: answersCount,
    verificationsDeleted: verificationsCount,
    applicationProfilesDeleted: appProfilesCount,
    applicationsDeleted: targetCount,
    usersPreserved: finalUsersCount,
    questionsPreserved: finalQuestionsCount,
    projectsPreserved: finalProjectsCount,
    inquiriesPreserved: finalInquiriesCount,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const isDry = process.argv.includes("--dry-run");
  cleanupMemberApplications(isDry)
    .then((res) => {
      console.log("\nCleanup execution summary:", JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("\nCleanup failed with error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
