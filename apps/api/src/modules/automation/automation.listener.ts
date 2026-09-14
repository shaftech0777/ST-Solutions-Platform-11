import { DOMAIN_EVENTS, DomainEvent } from "../../core/events/domain-event.types.js";
import { EventBus } from "../../core/events/event-bus.js";
import { AUTOMATION_EVENTS } from "./automation.types.js";
import { AutomationService, automationService as defaultAutomationService } from "./automation.service.js";

/**
 * Subscribes to platform Domain Events and bridges them to the Automation & n8n Dispatcher.
 */
export function registerAutomationEventListeners(
  eventBus: EventBus,
  automationService: AutomationService = defaultAutomationService
): void {
  // 1. Contact Message Received / Client Request Created
  eventBus.subscribe(DOMAIN_EVENTS.CONTACT_MESSAGE_RECEIVED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.CONTACT_MESSAGE_RECEIVED,
      {
        messageId: payload.id || payload.messageId || event.entityId,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber || null,
        whatsappNumber: payload.whatsappNumber || null,
        country: payload.country || null,
        companyName: payload.companyName || null,
        subject: payload.subject || "Website General Inquiry",
        message: payload.message,
        sourcePage: payload.sourcePage || "Website Contact Form",
        submissionTime: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "CONTACT_MESSAGE",
        entityId: event.entityId,
      }
    );
  });

  // Client Request lead intake bridge
  eventBus.subscribe(DOMAIN_EVENTS.CLIENT_REQUEST_CREATED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.CONTACT_MESSAGE_RECEIVED,
      {
        messageId: payload.requestId || event.entityId,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber || null,
        whatsappNumber: payload.whatsappNumber || null,
        country: payload.country || null,
        companyName: payload.companyName || null,
        subject: "Direct Client Request / Project Consultation",
        message: payload.message || "No detailed message provided.",
        sourcePage: "Client Request Intake",
        submissionTime: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "CLIENT_REQUEST",
        entityId: event.entityId,
      }
    );
  });

  // 2. Project Inquiry Created (Start Project / Project Discovery Wizard)
  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_INQUIRY_CREATED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PROJECT_INQUIRY_CREATED,
      {
        inquiryId: payload.inquiryId || event.entityId,
        visitorName: payload.visitorName,
        email: payload.email,
        phone: payload.phone,
        companyName: payload.companyName || null,
        country: payload.country || null,
        projectId: payload.projectId || null,
        projectNameSnapshot: payload.projectNameSnapshot,
        category: payload.category || null,
        budget: payload.budget || null,
        preferredContactMethod: payload.preferredContactMethod || "WHATSAPP",
        preferredContactTime: payload.preferredContactTime || null,
        message: payload.message,
        priority: payload.priority || "NORMAL",
        submissionTime: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "PROJECT_INQUIRY",
        entityId: event.entityId,
      }
    );
  });

  // 3. Member Application Submitted
  eventBus.subscribe(DOMAIN_EVENTS.MEMBER_APPLICATION_SUBMITTED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.MEMBER_APPLICATION_SUBMITTED,
      {
        applicationId: payload.applicationId || event.entityId,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        whatsappNumber: payload.whatsappNumber,
        country: payload.country,
        city: payload.city,
        currentProfession: payload.currentProfession,
        currentQualification: payload.currentQualification,
        skillsDescription: payload.skillsDescription,
        linkedinUrl: payload.linkedinUrl || null,
        githubUrl: payload.githubUrl || null,
        joiningPurpose: payload.joiningPurpose || null,
        submissionTime: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "MEMBER_APPLICATION",
        entityId: event.entityId,
      }
    );
  });

  // 4. Member Application Approved
  eventBus.subscribe(DOMAIN_EVENTS.MEMBER_APPLICATION_APPROVED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.MEMBER_APPLICATION_APPROVED,
      {
        applicationId: payload.applicationId || event.entityId,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        whatsappNumber: payload.whatsappNumber,
        country: payload.country,
        city: payload.city,
        currentProfession: payload.currentProfession,
        currentQualification: payload.currentQualification,
        skillsDescription: payload.skillsDescription,
        joiningPurpose: payload.joiningPurpose,
        status: payload.status,
        previousStatus: payload.previousStatus,
        reviewNotes: payload.reviewNotes || null,
        approvedBy: payload.reviewerId || null,
        reviewerId: payload.reviewerId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "MEMBER_APPLICATION",
        entityId: event.entityId,
      }
    );
  });

  // 5. Member Application Rejected
  eventBus.subscribe(DOMAIN_EVENTS.MEMBER_APPLICATION_REJECTED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.MEMBER_APPLICATION_REJECTED,
      {
        applicationId: payload.applicationId || event.entityId,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        whatsappNumber: payload.whatsappNumber,
        country: payload.country,
        city: payload.city,
        currentProfession: payload.currentProfession,
        currentQualification: payload.currentQualification,
        skillsDescription: payload.skillsDescription,
        joiningPurpose: payload.joiningPurpose,
        status: payload.status,
        previousStatus: payload.previousStatus,
        rejectionReason: payload.rejectionReason || payload.reviewNotes || "Does not match current criteria",
        reviewNotes: payload.reviewNotes || null,
        rejectedBy: payload.reviewerId || null,
        reviewerId: payload.reviewerId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "MEMBER_APPLICATION",
        entityId: event.entityId,
      }
    );
  });

  // 6. Member Application More Information Required
  eventBus.subscribe(DOMAIN_EVENTS.MEMBER_APPLICATION_MORE_INFORMATION_REQUIRED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.MEMBER_APPLICATION_MORE_INFORMATION_REQUIRED,
      {
        applicationId: payload.applicationId || event.entityId,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        whatsappNumber: payload.whatsappNumber,
        country: payload.country,
        city: payload.city,
        currentProfession: payload.currentProfession,
        currentQualification: payload.currentQualification,
        skillsDescription: payload.skillsDescription,
        joiningPurpose: payload.joiningPurpose,
        status: payload.status,
        previousStatus: payload.previousStatus,
        informationRequested: payload.reviewNotes || payload.informationRequested || "Additional details required to process your application.",
        reviewNotes: payload.reviewNotes || null,
        reviewerId: payload.reviewerId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "MEMBER_APPLICATION",
        entityId: event.entityId,
      }
    );
  });

  // 7. Member Application Status Changed (e.g. Under Review)
  eventBus.subscribe(DOMAIN_EVENTS.MEMBER_APPLICATION_STATUS_CHANGED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.MEMBER_APPLICATION_STATUS_CHANGED,
      {
        applicationId: payload.applicationId || event.entityId,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        whatsappNumber: payload.whatsappNumber,
        country: payload.country,
        city: payload.city,
        currentProfession: payload.currentProfession,
        currentQualification: payload.currentQualification,
        skillsDescription: payload.skillsDescription,
        joiningPurpose: payload.joiningPurpose,
        status: payload.status,
        previousStatus: payload.previousStatus,
        reviewNotes: payload.reviewNotes || null,
        reviewerId: payload.reviewerId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "MEMBER_APPLICATION",
        entityId: event.entityId,
      }
    );
  });

  // 8. Marketing Subscriber Added
  eventBus.subscribe(DOMAIN_EVENTS.MARKETING_SUBSCRIBER_ADDED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.MARKETING_SUBSCRIBER_ADDED,
      {
        subscriberId: payload.subscriberId || event.entityId,
        email: payload.email,
        source: payload.source || "Website Footer",
        subscribedAt: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "NEWSLETTER_SUBSCRIBER",
        entityId: event.entityId,
      }
    );
  });

  // 9. Marketing Campaign Requested
  eventBus.subscribe(DOMAIN_EVENTS.MARKETING_CAMPAIGN_REQUESTED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.MARKETING_CAMPAIGN_REQUESTED,
      {
        title: payload.title,
        subject: payload.subject,
        content: payload.content,
        subscriberCount: payload.subscriberCount,
        recipients: payload.recipients,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: null,
        entityType: "MARKETING_CAMPAIGN",
        entityId: event.entityId,
      }
    );
  });

  // 10. Project Created
  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_CREATED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PROJECT_CREATED,
      {
        projectId: payload.projectId || event.entityId,
        title: payload.title,
        description: payload.description || null,
        category: payload.category || null,
        budget: payload.budget || null,
        currency: payload.currency || "USD",
        status: payload.projectStatus || "PENDING",
        clientId: payload.clientId,
        clientName: payload.clientName || null,
        clientEmail: payload.clientEmail || null,
        companyName: payload.companyName || null,
        assignedManagerId: payload.assignedManagerId || null,
        assignedMemberId: payload.assignedMemberId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.clientEmail || null,
        entityType: "PROJECT",
        entityId: event.entityId,
      }
    );
  });

  // 11. Project Started (In Progress)
  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_STARTED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PROJECT_STARTED,
      {
        projectId: payload.projectId || event.entityId,
        title: payload.title,
        clientId: payload.clientId,
        clientName: payload.clientName || null,
        clientEmail: payload.clientEmail || null,
        startDate: payload.startDate || new Date().toISOString(),
        assignedManagerId: payload.assignedManagerId || null,
        assignedMemberId: payload.assignedMemberId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.clientEmail || null,
        entityType: "PROJECT",
        entityId: event.entityId,
      }
    );
  });

  // 12. Project Status Changed
  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_STATUS_CHANGED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PROJECT_STATUS_CHANGED,
      {
        projectId: payload.projectId || event.entityId,
        title: payload.title,
        previousStatus: payload.previousStatus || null,
        newStatus: payload.newStatus,
        clientId: payload.clientId || null,
        clientName: payload.clientName || null,
        clientEmail: payload.clientEmail || null,
        assignedManagerId: payload.assignedManagerId || null,
        assignedMemberId: payload.assignedMemberId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.clientEmail || null,
        entityType: "PROJECT",
        entityId: event.entityId,
      }
    );
  });

  // 13. Project Progress Updated
  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_PROGRESS_UPDATED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PROJECT_PROGRESS_UPDATED,
      {
        projectId: payload.projectId || event.entityId,
        projectTitle: payload.projectTitle,
        progressPercentage: payload.progressPercentage,
        milestoneTitle: payload.milestoneTitle || null,
        updateType: payload.updateType || "PROGRESS_UPDATE",
        summary: payload.summary || null,
        nextSteps: payload.nextSteps || null,
        clientId: payload.clientId || null,
        clientName: payload.clientName || null,
        clientEmail: payload.clientEmail || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.clientEmail || null,
        entityType: "PROJECT",
        entityId: event.entityId,
      }
    );
  });

  // 14. Project Update Created
  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_UPDATE_CREATED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PROJECT_UPDATE_CREATED,
      {
        projectId: payload.projectId || event.entityId,
        projectTitle: payload.projectTitle,
        updateId: payload.updateId,
        updateTitle: payload.updateTitle,
        updateType: payload.updateType || "DAILY_UPDATE",
        description: payload.description || null,
        blockers: payload.blockers || null,
        nextSteps: payload.nextSteps || null,
        progressPercentage: payload.progressPercentage ?? null,
        clientId: payload.clientId || null,
        clientName: payload.clientName || null,
        clientEmail: payload.clientEmail || null,
        assignedManagerId: payload.assignedManagerId || null,
        assignedMemberId: payload.assignedMemberId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.clientEmail || null,
        entityType: "PROJECT",
        entityId: event.entityId,
      }
    );
  });

  // 15. Project Completed
  eventBus.subscribe(DOMAIN_EVENTS.PROJECT_COMPLETED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PROJECT_COMPLETED,
      {
        projectId: payload.projectId || event.entityId,
        title: payload.title,
        clientId: payload.clientId,
        clientName: payload.clientName || null,
        clientEmail: payload.clientEmail || null,
        completedDate: payload.completedDate || new Date().toISOString(),
        productionUrl: payload.productionUrl || null,
        assignedManagerId: payload.assignedManagerId || null,
        assignedMemberId: payload.assignedMemberId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.clientEmail || null,
        entityType: "PROJECT",
        entityId: event.entityId,
      }
    );
  });

  // 16. Client Created
  eventBus.subscribe(DOMAIN_EVENTS.CLIENT_CREATED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.CLIENT_CREATED,
      {
        clientId: payload.clientId || event.entityId,
        companyName: payload.companyName,
        fullName: payload.fullName,
        email: payload.email,
        memberId: payload.memberId || null,
        assignedManagerId: payload.assignedManagerId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "CLIENT",
        entityId: event.entityId,
      }
    );
  });

  // 17. Client Status Changed
  eventBus.subscribe(DOMAIN_EVENTS.CLIENT_STATUS_CHANGED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.CLIENT_STATUS_CHANGED,
      {
        clientId: payload.clientId || event.entityId,
        companyName: payload.companyName,
        fullName: payload.fullName || null,
        email: payload.email || null,
        previousStatus: payload.previousStatus || null,
        newStatus: payload.newStatus,
        memberId: payload.memberId || null,
        assignedManagerId: payload.assignedManagerId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email || null,
        entityType: "CLIENT",
        entityId: event.entityId,
      }
    );
  });

  // 18. Payment Created
  eventBus.subscribe(DOMAIN_EVENTS.PAYMENT_CREATED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PAYMENT_CREATED,
      {
        paymentId: payload.paymentId || event.entityId,
        amount: payload.amount,
        currency: payload.currency,
        status: payload.status,
        clientId: payload.clientId,
        clientName: payload.clientName || null,
        clientEmail: payload.clientEmail || null,
        projectId: payload.projectId || null,
        projectTitle: payload.projectTitle || null,
        transactionReference: payload.transactionReference || null,
        paymentMethod: payload.paymentMethod || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.clientEmail || null,
        entityType: "PAYMENT",
        entityId: event.entityId,
      }
    );
  });

  // 19. Payment Submitted
  eventBus.subscribe(DOMAIN_EVENTS.PAYMENT_SUBMITTED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PAYMENT_SUBMITTED,
      {
        paymentId: payload.paymentId || event.entityId,
        amount: payload.amount,
        currency: payload.currency,
        clientId: payload.clientId,
        clientName: payload.clientName || null,
        clientEmail: payload.clientEmail || null,
        projectId: payload.projectId || null,
        projectTitle: payload.projectTitle || null,
        transactionReference: payload.transactionReference || null,
        submittedByUserId: payload.submittedByUserId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.clientEmail || null,
        entityType: "PAYMENT",
        entityId: event.entityId,
      }
    );
  });

  // 20. Payment Approved
  eventBus.subscribe(DOMAIN_EVENTS.PAYMENT_APPROVED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PAYMENT_APPROVED,
      {
        paymentId: payload.paymentId || event.entityId,
        amount: payload.amount,
        currency: payload.currency,
        clientId: payload.clientId,
        clientName: payload.clientName || null,
        clientEmail: payload.clientEmail || null,
        projectId: payload.projectId || null,
        projectTitle: payload.projectTitle || null,
        transactionReference: payload.transactionReference || null,
        approvalNotes: payload.approvalNotes || null,
        approvedByUserId: payload.approvedByUserId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.clientEmail || null,
        entityType: "PAYMENT",
        entityId: event.entityId,
      }
    );
  });

  // 21. Payment Rejected
  eventBus.subscribe(DOMAIN_EVENTS.PAYMENT_REJECTED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.PAYMENT_REJECTED,
      {
        paymentId: payload.paymentId || event.entityId,
        amount: payload.amount,
        currency: payload.currency,
        clientId: payload.clientId,
        clientName: payload.clientName || null,
        clientEmail: payload.clientEmail || null,
        projectId: payload.projectId || null,
        projectTitle: payload.projectTitle || null,
        transactionReference: payload.transactionReference || null,
        rejectionReason: payload.rejectionReason || null,
        rejectedByUserId: payload.rejectedByUserId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.clientEmail || null,
        entityType: "PAYMENT",
        entityId: event.entityId,
      }
    );
  });

  // 22. Member Onboarded
  eventBus.subscribe(DOMAIN_EVENTS.MEMBER_ONBOARDED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.MEMBER_ONBOARDED,
      {
        memberId: payload.memberId || event.entityId,
        userId: payload.userId,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber || null,
        whatsappNumber: payload.whatsappNumber || null,
        role: payload.role || null,
        department: payload.department || null,
        onboardedAt: payload.onboardedAt || event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "MEMBER",
        entityId: event.entityId,
      }
    );
  });
}
