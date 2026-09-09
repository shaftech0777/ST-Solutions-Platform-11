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
        reviewNotes: payload.reviewNotes || null,
        approvedBy: payload.reviewerId || null,
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
        rejectionReason: payload.reviewNotes || "Does not match current criteria",
        reviewNotes: payload.reviewNotes || null,
        rejectedBy: payload.reviewerId || null,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      {
        recipient: payload.email,
        entityType: "MEMBER_APPLICATION",
        entityId: event.entityId,
      }
    );
  });

  // 6. Member Application Status Changed (e.g. Under Review / More Info)
  eventBus.subscribe(DOMAIN_EVENTS.MEMBER_APPLICATION_STATUS_CHANGED, async (event: DomainEvent) => {
    const payload = event.payload;
    await automationService.dispatch(
      AUTOMATION_EVENTS.MEMBER_APPLICATION_STATUS_CHANGED,
      {
        applicationId: payload.applicationId || event.entityId,
        fullName: payload.fullName,
        email: payload.email,
        status: payload.status,
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

  // 7. Marketing Subscriber Added
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
}
