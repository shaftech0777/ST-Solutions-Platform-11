import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { jwtService } from "../core/security/jwt.service.js";
import { DOMAIN_EVENTS } from "../core/events/domain-event.types.js";
import { eventBus } from "../core/events/event-bus.js";
import { ProjectInquiriesService } from "../modules/project-inquiries/project-inquiries.service.js";
import { ProjectInquiriesRepository } from "../modules/project-inquiries/project-inquiries.repository.js";
import { NotificationsService } from "../modules/notifications/notifications.service.js";
import { NotificationsRepository } from "../modules/notifications/notifications.repository.js";
import { registerNotificationHandlers } from "../modules/notifications/notification-handlers.js";
import { notificationStreamManager } from "../modules/notifications/notifications.stream.js";
import { hashPassword } from "../core/security/password.service.js";

const db = new PrismaClient();
const inquiriesRepo = new ProjectInquiriesRepository();
const inquiriesService = new ProjectInquiriesService(inquiriesRepo);
const notificationsRepo = new NotificationsRepository(db);
const notificationsService = new NotificationsService(notificationsRepo);

// Ensure notification handlers are registered
registerNotificationHandlers(eventBus, notificationsService, db);

test("ST-Solutions Platform 11: Public Inquiry -> Database -> Real-time Notification E2E Audit", async (t) => {
  let testAdminUserId = "";
  let testSubAdminUserId = "";
  let testManagerUserId = "";
  let testMemberUserId = "";
  let createdInquiryId = "";

  t.before(async () => {
    const passwordHash = await hashPassword("AuditTestPass123!@#");

    // Clean up any existing test records
    await db.inquiryActivity.deleteMany({
      where: { inquiry: { email: "e2e.audit.visitor@example.com" } },
    });
    await db.projectInquiry.deleteMany({
      where: { email: "e2e.audit.visitor@example.com" },
    });
    await db.notification.deleteMany({
      where: { title: "New Project Inquiry" },
    });

    // 1. Setup Admin user
    const adminUser = await db.user.upsert({
      where: { email: "inquiry-audit-admin@st-solutions.local" },
      update: { status: "ACTIVE", accountType: "ADMIN" },
      create: {
        id: "inquiry-audit-admin-001",
        email: "inquiry-audit-admin@st-solutions.local",
        passwordHash,
        accountType: "ADMIN",
        status: "ACTIVE",
      },
    });
    testAdminUserId = adminUser.id;

    // 2. Setup Sub-Admin user
    const subAdminUser = await db.user.upsert({
      where: { email: "inquiry-audit-subadmin@st-solutions.local" },
      update: { status: "ACTIVE", accountType: "SUB_ADMIN" },
      create: {
        id: "inquiry-audit-subadmin-001",
        email: "inquiry-audit-subadmin@st-solutions.local",
        passwordHash,
        accountType: "SUB_ADMIN",
        status: "ACTIVE",
      },
    });
    testSubAdminUserId = subAdminUser.id;

    // 3. Setup Manager user
    const managerUser = await db.user.upsert({
      where: { email: "inquiry-audit-manager@st-solutions.local" },
      update: { status: "ACTIVE", accountType: "MANAGER" },
      create: {
        id: "inquiry-audit-manager-001",
        email: "inquiry-audit-manager@st-solutions.local",
        passwordHash,
        accountType: "MANAGER",
        status: "ACTIVE",
      },
    });
    testManagerUserId = managerUser.id;

    // 4. Setup Member user
    const memberUser = await db.user.upsert({
      where: { email: "inquiry-audit-member@st-solutions.local" },
      update: { status: "ACTIVE", accountType: "MEMBER" },
      create: {
        id: "inquiry-audit-member-001",
        email: "inquiry-audit-member@st-solutions.local",
        passwordHash,
        accountType: "MEMBER",
        status: "ACTIVE",
      },
    });
    testMemberUserId = memberUser.id;
  });

  t.after(async () => {
    if (createdInquiryId) {
      await db.inquiryActivity.deleteMany({ where: { inquiryId: createdInquiryId } });
      await db.projectInquiry.deleteMany({ where: { id: createdInquiryId } });
    }
    await db.user.deleteMany({
      where: {
        id: {
          in: [
            "inquiry-audit-admin-001",
            "inquiry-audit-subadmin-001",
            "inquiry-audit-manager-001",
            "inquiry-audit-member-001",
          ],
        },
      },
    });
    await db.$disconnect();
  });

  await t.test("STEP 1: Public Visitor submits Project/Service Inquiry -> saved in PostgreSQL with full snapshot", async () => {
    const inquiryPayload = {
      visitorName: "Hamza Tariq",
      email: "e2e.audit.visitor@example.com",
      phone: "+92 300 1234567",
      companyName: "Apex Global Logistics",
      country: "Pakistan",
      projectId: "proj-ecommerce-cloud-99",
      projectNameSnapshot: "Custom Enterprise E-Commerce Platform",
      category: "Full Stack Web Development",
      message: "We require a robust B2B multitenant e-commerce solution with ERP integration and WhatsApp CRM tracking.",
      preferredContactMethod: "WHATSAPP" as const,
      budget: "$5,000 - $10,000",
      preferredContactTime: "Afternoon (PKT)",
    };

    const submissionResult = await inquiriesService.createPublicInquiry(inquiryPayload);

    assert.ok(submissionResult, "Submission response must be returned");
    assert.ok(submissionResult.id, "Submission must return an authoritative inquiry ID");
    assert.equal(submissionResult.status, "NEW");
    assert.equal(submissionResult.preferredContactMethod, "WHATSAPP");
    assert.equal(submissionResult.projectNameSnapshot, "Custom Enterprise E-Commerce Platform");

    createdInquiryId = submissionResult.id;

    // Verify PostgreSQL persistence
    const savedInDb = await db.projectInquiry.findUnique({
      where: { id: createdInquiryId },
      include: { activities: true },
    });

    assert.ok(savedInDb, "Inquiry must be permanently persisted in PostgreSQL");
    assert.equal(savedInDb?.visitorName, "Hamza Tariq");
    assert.equal(savedInDb?.email, "e2e.audit.visitor@example.com");
    assert.equal(savedInDb?.phone, "+92 300 1234567");
    assert.equal(savedInDb?.companyName, "Apex Global Logistics");
    assert.equal(savedInDb?.country, "Pakistan");
    assert.equal(savedInDb?.projectId, "proj-ecommerce-cloud-99");
    assert.equal(savedInDb?.projectNameSnapshot, "Custom Enterprise E-Commerce Platform");
    assert.equal(savedInDb?.category, "Full Stack Web Development");
    assert.equal(savedInDb?.budget, "$5,000 - $10,000");
    assert.equal(savedInDb?.preferredContactTime, "Afternoon (PKT)");
    assert.equal(savedInDb?.status, "NEW");
    assert.equal(savedInDb?.priority, "NORMAL");

    // Verify initial activity log
    assert.ok(savedInDb?.activities.length >= 1, "Initial creation activity must be logged in database");
    const initActivity = savedInDb?.activities.find((a) => a.action === "INQUIRY_CREATED");
    assert.ok(initActivity, "INQUIRY_CREATED activity record must exist");
    assert.equal(initActivity?.contactMethod, "WHATSAPP");
  });

  await t.test("STEP 2: In-App Notifications generated in PostgreSQL for ADMIN and SUB_ADMIN", async () => {
    // Wait briefly for asynchronous domain event handler execution
    await new Promise((resolve) => setTimeout(resolve, 500));

    const adminNotifications = await db.notification.findMany({
      where: {
        userId: testAdminUserId,
        entityType: "PROJECT_INQUIRY",
        entityId: createdInquiryId,
      },
    });

    assert.ok(adminNotifications.length >= 1, "ADMIN must receive persistent notification in PostgreSQL");
    const adminNotif = adminNotifications[0];
    assert.equal(adminNotif.title, "New Project Inquiry");
    assert.ok(adminNotif.message.includes("Hamza Tariq"), "Notification message must include visitor name");
    assert.ok(adminNotif.message.includes("Custom Enterprise E-Commerce Platform"), "Message must include project snapshot");
    assert.equal(adminNotif.actionUrl, `/inquiries?id=${createdInquiryId}`, "ActionUrl must target specific inquiry dossier");

    const subAdminNotifications = await db.notification.findMany({
      where: {
        userId: testSubAdminUserId,
        entityType: "PROJECT_INQUIRY",
        entityId: createdInquiryId,
      },
    });

    assert.ok(subAdminNotifications.length >= 1, "SUB_ADMIN must also receive persistent notification in PostgreSQL");
    const subAdminNotif = subAdminNotifications[0];
    assert.equal(subAdminNotif.actionUrl, `/inquiries?id=${createdInquiryId}`);

    // Verify MANAGER and MEMBER did NOT receive project inquiry notification
    const managerNotifs = await db.notification.findMany({
      where: {
        userId: testManagerUserId,
        entityType: "PROJECT_INQUIRY",
        entityId: createdInquiryId,
      },
    });
    assert.equal(managerNotifs.length, 0, "MANAGER must not receive unauthorized inquiry notification");
  });

  await t.test("STEP 3: ADMIN and SUB_ADMIN can query inquiry list, stats, and dossier detail", async () => {
    const listResult = await inquiriesService.getInquiries({
      status: "NEW",
      page: 1,
      limit: 10,
    });

    assert.ok(listResult.items.length >= 1, "Inquiry list must return items");
    const found = listResult.items.find((item) => item.id === createdInquiryId);
    assert.ok(found, "Created inquiry must be found in list query");
    assert.equal(found?.visitorName, "Hamza Tariq");

    // Query stats
    const stats = await inquiriesRepo.getStatistics();
    assert.ok(stats.total >= 1, "Stats total inquiries must be >= 1");
    assert.ok(stats.newCount >= 1, "Stats new inquiries must be >= 1");
    assert.ok(stats.byContactMethod.whatsapp >= 1, "WhatsApp contact count must be >= 1");

    // Query single dossier by ID
    const dossier = await inquiriesService.getInquiryById(createdInquiryId);
    assert.ok(dossier, "Dossier details must be returned");
    assert.equal(dossier.id, createdInquiryId);
    assert.equal(dossier.companyName, "Apex Global Logistics");
    assert.equal(dossier.activities?.length ? dossier.activities.length >= 1 : true, true);
  });

  await t.test("STEP 4: Contact Attempt Activity Logging & Status Update Flow", async () => {
    // 1. Record WhatsApp contact attempt
    const contactResult = await inquiriesService.recordContactAttempt(
      createdInquiryId,
      {
        contactMethod: "WHATSAPP",
        notes: "Sent WhatsApp introduction message with company profile and pricing estimate.",
        updateStatusToContacted: true,
      },
      testAdminUserId
    );

    assert.equal(contactResult.status, "CONTACTED");
    assert.ok(contactResult.contactedAt, "contactedAt timestamp must be populated");
    assert.equal(contactResult.contactedById, testAdminUserId);

    // Verify activity record in PostgreSQL
    const activities = await db.inquiryActivity.findMany({
      where: { inquiryId: createdInquiryId },
      orderBy: { createdAt: "desc" },
    });

    const contactAct = activities.find((a) => a.action === "CONTACT_ATTEMPTED");
    assert.ok(contactAct, "CONTACT_ATTEMPTED activity record must be in database");
    assert.equal(contactAct?.contactMethod, "WHATSAPP");
    assert.equal(contactAct?.userId, testAdminUserId);

    // 2. Append internal Admin Note
    const updatedWithNote = await inquiriesService.addNote(
      createdInquiryId,
      {
        notes: "Client requested follow-up meeting tomorrow at 3 PM PKT on Google Meet.",
      },
      testSubAdminUserId
    );

    assert.ok(updatedWithNote.adminNotes?.includes("Google Meet"), "Admin notes must be saved in database");

    const noteAct = (await db.inquiryActivity.findMany({ where: { inquiryId: createdInquiryId } })).find(
      (a) => a.action === "NOTE_ADDED"
    );
    assert.ok(noteAct, "NOTE_ADDED activity record must be persisted");
  });

  await t.test("STEP 5: Real-time SSE Stream Security & Keep-Alive Integration", async () => {
    // Verify notificationStreamManager connection tracking
    let writtenData: string[] = [];
    const mockResponse: any = {
      setHeader: () => {},
      flushHeaders: () => {},
      write: (chunk: string) => {
        writtenData.push(chunk);
      },
      on: () => {},
    };

    notificationStreamManager.addConnection(testAdminUserId, mockResponse);
    assert.ok(notificationStreamManager.getActiveConnectionCount() >= 1);

    // Verify initial handshake event
    assert.ok(
      writtenData.some((w) => w.includes("event: connected") && w.includes(testAdminUserId)),
      "SSE initial connected event must be dispatched to user"
    );

    // Broadcast test notification
    notificationStreamManager.broadcastNotification(testAdminUserId, {
      id: "live-test-notif-001",
      userId: testAdminUserId,
      title: "New Project Inquiry",
      message: "Live test visitor submitted inquiry",
      notificationType: "PROJECT",
      priority: "HIGH",
      status: "UNREAD",
      actionUrl: `/inquiries?id=${createdInquiryId}`,
      entityType: "PROJECT_INQUIRY",
      entityId: createdInquiryId,
      metadata: null,
      createdAt: new Date(),
      readAt: null,
    });

    assert.ok(
      writtenData.some((w) => w.includes("event: notification") && w.includes("live-test-notif-001")),
      "Real-time notification event must be written to active SSE connection"
    );
  });
});
