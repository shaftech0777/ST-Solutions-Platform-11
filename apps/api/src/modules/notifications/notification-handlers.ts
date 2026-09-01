import { NotificationPriority, NotificationType, PrismaClient } from "@prisma/client";
import { DOMAIN_EVENTS, DomainEvent } from "../../core/events/domain-event.types.js";
import { EventBus } from "../../core/events/event-bus.js";
import { NotificationsService } from "./notifications.service.js";

export function registerNotificationHandlers(
  eventBus: EventBus,
  notificationsService: NotificationsService,
  db: PrismaClient
): void {
  const getUserIdFromMemberId = async (memberId: string | null | undefined): Promise<string | null> => {
    if (!memberId) return null;
    try {
      const member = await db.member.findUnique({
        where: { id: memberId },
        select: { userId: true },
      });
      return member?.userId || memberId;
    } catch {
      return memberId;
    }
  };

  const notifyUsers = async (
    targetUserIds: (string | null | undefined)[],
    notification: {
      title: string;
      message: string;
      notificationType: NotificationType;
      priority?: NotificationPriority;
      actionUrl?: string | null;
      entityType?: string | null;
      entityId?: string | null;
      metadata?: Record<string, any> | null;
    }
  ) => {
    const uniqueUserIds = Array.from(new Set(targetUserIds.filter((id): id is string => Boolean(id))));
    for (const userId of uniqueUserIds) {
      await notificationsService.sendNotification({
        userId,
        ...notification,
      });
    }
  };

  eventBus.subscribe(DOMAIN_EVENTS.CLIENT_CREATED, async (event: DomainEvent) => {
    const { clientId, companyName, memberId, assignedManagerId } = event.payload;
    const memberUserId = await getUserIdFromMemberId(memberId);
    await notifyUsers([memberUserId, assignedManagerId], {
      title: "New Client Created",
      message: `Client '${companyName}' has been added to the platform.`,
      notificationType: "CLIENT",
      priority: "NORMAL",
      entityType: "CLIENT",
      entityId: clientId,
      actionUrl: `/clients/${clientId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.CLIENT_STATUS_CHANGED, async (event: DomainEvent) => {
    const { clientId, companyName, newStatus, memberId, assignedManagerId } = event.payload;
    const memberUserId = await getUserIdFromMemberId(memberId);
    await notifyUsers([memberUserId, assignedManagerId], {
      title: "Client Status Updated",
      message: `Client '${companyName}' status changed to ${newStatus}.`,
      notificationType: "CLIENT",
      priority: "NORMAL",
      entityType: "CLIENT",
      entityId: clientId,
      actionUrl: `/clients/${clientId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.CLIENT_OWNERSHIP_CHANGED, async (event: DomainEvent) => {
    const { clientId, companyName, newMemberId, assignedManagerId } = event.payload;
    const memberUserId = await getUserIdFromMemberId(newMemberId);
    await notifyUsers([memberUserId, assignedManagerId], {
      title: "Client Ownership Reassigned",
      message: `Client '${companyName}' has been reassigned to you.`,
      notificationType: "CLIENT",
      priority: "HIGH",
      entityType: "CLIENT",
      entityId: clientId,
      actionUrl: `/clients/${clientId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_CREATED, async (event: DomainEvent) => {
    const { projectId, title, assignedMemberId, assignedManagerId } = event.payload;
    const memberUserId = await getUserIdFromMemberId(assignedMemberId);
    await notifyUsers([memberUserId, assignedManagerId], {
      title: "New Project Assigned",
      message: `Project '${title}' has been assigned.`,
      notificationType: "PROJECT",
      priority: "NORMAL",
      entityType: "PROJECT",
      entityId: projectId,
      actionUrl: `/projects/${projectId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_STATUS_CHANGED, async (event: DomainEvent) => {
    const { projectId, title, newStatus, assignedMemberId, assignedManagerId } = event.payload;
    const memberUserId = await getUserIdFromMemberId(assignedMemberId);
    await notifyUsers([memberUserId, assignedManagerId], {
      title: "Project Status Updated",
      message: `Project '${title}' status changed to ${newStatus}.`,
      notificationType: "PROJECT",
      priority: "NORMAL",
      entityType: "PROJECT",
      entityId: projectId,
      actionUrl: `/projects/${projectId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_COMPLETED, async (event: DomainEvent) => {
    const { projectId, title, assignedMemberId, assignedManagerId } = event.payload;
    const memberUserId = await getUserIdFromMemberId(assignedMemberId);
    await notifyUsers([memberUserId, assignedManagerId], {
      title: "Project Completed",
      message: `Project '${title}' has been completed.`,
      notificationType: "PROJECT",
      priority: "HIGH",
      entityType: "PROJECT",
      entityId: projectId,
      actionUrl: `/projects/${projectId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_UPDATE_CREATED, async (event: DomainEvent) => {
    const { projectId, projectTitle, updateTitle, assignedMemberId, assignedManagerId } = event.payload;
    const memberUserId = await getUserIdFromMemberId(assignedMemberId);
    await notifyUsers([memberUserId, assignedManagerId], {
      title: "Project Progress Update",
      message: `New update '${updateTitle}' added to project '${projectTitle}'.`,
      notificationType: "PROJECT",
      priority: "NORMAL",
      entityType: "PROJECT",
      entityId: projectId,
      actionUrl: `/projects/${projectId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.PAYMENT_SUBMITTED, async (event: DomainEvent) => {
    const { paymentId, amount, currency, submittedByUserId } = event.payload;
    await notifyUsers([submittedByUserId], {
      title: "Payment Submitted",
      message: `Payment of ${currency} ${amount} has been submitted for review.`,
      notificationType: "PAYMENT",
      priority: "NORMAL",
      entityType: "PAYMENT",
      entityId: paymentId,
      actionUrl: `/payments/${paymentId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.PAYMENT_APPROVED, async (event: DomainEvent) => {
    const { paymentId, amount, currency, approvedByUserId } = event.payload;
    await notifyUsers([approvedByUserId], {
      title: "Payment Approved",
      message: `Payment of ${currency} ${amount} has been approved.`,
      notificationType: "PAYMENT",
      priority: "HIGH",
      entityType: "PAYMENT",
      entityId: paymentId,
      actionUrl: `/payments/${paymentId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.PAYMENT_REJECTED, async (event: DomainEvent) => {
    const { paymentId, amount, currency, rejectedByUserId, reason } = event.payload;
    await notifyUsers([rejectedByUserId], {
      title: "Payment Rejected",
      message: `Payment of ${currency} ${amount} was rejected.${reason ? ` Reason: ${reason}` : ""}`,
      notificationType: "PAYMENT",
      priority: "HIGH",
      entityType: "PAYMENT",
      entityId: paymentId,
      actionUrl: `/payments/${paymentId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.CLIENT_REQUEST_CREATED, async (event: DomainEvent) => {
    const { requestId, fullName, companyName } = event.payload;
    try {
      const adminUsers = await db.user.findMany({
        where: { role: { name: { in: ["ADMIN", "MANAGER", "SUPER_ADMIN"] } } },
        select: { id: true },
        take: 10,
      });
      const adminIds = adminUsers.map((u) => u.id);
      await notifyUsers(adminIds, {
        title: "New Client Request",
        message: `New client request received from ${fullName}${companyName ? ` (${companyName})` : ""}.`,
        notificationType: NotificationType.CLIENT,
        priority: "NORMAL",
        entityType: "CLIENT_REQUEST",
        entityId: requestId,
        actionUrl: `/client-requests/${requestId}`,
      });
    } catch {
      // Non-blocking catch
    }
  });

  eventBus.subscribe(DOMAIN_EVENTS.CLIENT_REQUEST_STATUS_CHANGED, async (event: DomainEvent) => {
    const { requestId, fullName, newStatus } = event.payload;
    try {
      const adminUsers = await db.user.findMany({
        where: { role: { name: { in: ["ADMIN", "MANAGER", "SUPER_ADMIN"] } } },
        select: { id: true },
        take: 10,
      });
      const adminIds = adminUsers.map((u) => u.id);
      await notifyUsers(adminIds, {
        title: "Client Request Status Updated",
        message: `Request from ${fullName} status changed to ${newStatus}.`,
        notificationType: NotificationType.CLIENT,
        priority: "NORMAL",
        entityType: "CLIENT_REQUEST",
        entityId: requestId,
        actionUrl: `/client-requests/${requestId}`,
      });
    } catch {
      // Non-blocking catch
    }
  });

  eventBus.subscribe(DOMAIN_EVENTS.CLIENT_REQUEST_CONVERTED, async (event: DomainEvent) => {
    const { requestId, clientId, companyName, convertedByUserId } = event.payload;
    await notifyUsers([convertedByUserId], {
      title: "Lead Converted",
      message: `Client request for '${companyName}' was converted to a Client.`,
      notificationType: NotificationType.CLIENT,
      priority: "HIGH",
      entityType: "CLIENT",
      entityId: clientId,
      actionUrl: `/clients/${clientId}`,
    });
  });

  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_INQUIRY_CREATED, async (event: DomainEvent) => {
    const {
      inquiryId,
      visitorName,
      email,
      phone,
      projectNameSnapshot,
      preferredContactMethod,
      message,
      priority,
    } = event.payload;

    try {
      const recipientUsers = await db.user.findMany({
        where: {
          OR: [
            { accountType: { in: ["ADMIN", "SUB_ADMIN"] } },
            { role: { name: { in: ["ADMIN", "SUB_ADMIN", "SUPER_ADMIN"] } } },
          ],
          status: "ACTIVE",
        },
        select: { id: true },
      });

      const recipientIds = recipientUsers.map((u) => u.id);

      const snippet = message && message.length > 80 ? `${message.slice(0, 80)}...` : message || "";
      const contactLabel = preferredContactMethod || "WhatsApp";

      await notifyUsers(recipientIds, {
        title: "New Project Inquiry",
        message: `${visitorName} submitted an inquiry for '${projectNameSnapshot}'. Preferred: ${contactLabel}.${snippet ? ` "${snippet}"` : ""}`,
        notificationType: "PROJECT" as NotificationType,
        priority: priority === "URGENT" ? "URGENT" : "HIGH",
        entityType: "PROJECT_INQUIRY",
        entityId: inquiryId,
        actionUrl: `/inquiries?id=${inquiryId}`,
        metadata: {
          inquiryId,
          visitorName,
          email,
          phone,
          projectNameSnapshot,
          preferredContactMethod,
        },
      });
    } catch {
      // Non-blocking catch
    }
  });

  eventBus.subscribe(DOMAIN_EVENTS.SETTINGS_UPDATED, async (event: DomainEvent) => {
    const { section, updatedByUserId } = event.payload;
    if (updatedByUserId) {
      await notifyUsers([updatedByUserId], {
        title: "System Settings Modified",
        message: `Settings section '${section}' was updated.`,
        notificationType: NotificationType.SYSTEM,
        priority: "NORMAL",
        entityType: "SETTINGS",
        entityId: section,
      });
    }
  });

  eventBus.subscribe(DOMAIN_EVENTS.SECURITY_EVENT, async (event: DomainEvent) => {
    const { action, severity, targetUserId, details } = event.payload;
    if (targetUserId) {
      await notifyUsers([targetUserId], {
        title: "Security Event Alert",
        message: `Security event '${action}' occurred.${details ? ` Details: ${details}` : ""}`,
        notificationType: NotificationType.SYSTEM,
        priority: severity || "URGENT",
        entityType: "SECURITY",
      });
    }
  });
}
