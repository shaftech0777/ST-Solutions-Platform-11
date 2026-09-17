import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspect() {
  const applicationCount = await prisma.memberApplication.count();
  const questionCount = await prisma.applicationQuestion.count();
  const answerCount = await prisma.applicationAnswer.count();
  const verificationCount = await prisma.memberVerification.count();
  const memberProfileCount = await prisma.memberProfile.count();
  const userCount = await prisma.user.count();
  const projectCount = await prisma.project.count();
  const inquiryCount = await prisma.projectInquiry.count();

  console.log("DATABASE INVENTORY:");
  console.log(`- MemberApplication count: ${applicationCount}`);
  console.log(`- ApplicationQuestion count: ${questionCount}`);
  console.log(`- ApplicationAnswer count: ${answerCount}`);
  console.log(`- MemberVerification count: ${verificationCount}`);
  console.log(`- MemberProfile count: ${memberProfileCount}`);
  console.log(`- User count: ${userCount}`);
  console.log(`- Project count: ${projectCount}`);
  console.log(`- ProjectInquiry count: ${inquiryCount}`);

  if (applicationCount > 0) {
    const apps = await prisma.memberApplication.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        applicationStatus: true,
        createdAt: true,
      },
    });
    console.log("\nExisting Member Applications:");
    console.table(apps);
  }

  await prisma.$disconnect();
}

inspect().catch((err) => {
  console.error("Inspection error:", err);
  process.exit(1);
});
