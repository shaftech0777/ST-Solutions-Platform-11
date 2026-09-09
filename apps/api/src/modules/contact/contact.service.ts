import { prisma } from "../../database/prisma.client.js";
import { eventBus } from "../../core/events/event-bus.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { ValidationError } from "../../core/errors/index.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { CreateContactInput } from "./contact.types.js";

export class ContactService {
  /**
   * Records a new inbound public contact message and publishes the domain event for automation.
   */
  public async submitContactMessage(input: CreateContactInput) {
    if (!input.fullName || !input.fullName.trim()) {
      throw new ValidationError("Full name is required.", ERROR_CODES.VALIDATION_ERROR);
    }
    if (!input.email || !input.email.includes("@")) {
      throw new ValidationError("A valid email address is required.", ERROR_CODES.VALIDATION_ERROR);
    }
    if (!input.message || !input.message.trim()) {
      throw new ValidationError("Message content is required.", ERROR_CODES.VALIDATION_ERROR);
    }

    const cleanSubject = input.subject?.trim() || "Website Contact Form Submission";
    const cleanMessage = input.message.trim();

    // 1. Persist in authoritative database
    const contact = await prisma.contactMessage.create({
      data: {
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phoneNumber: input.phoneNumber?.trim() || null,
        whatsappNumber: input.whatsappNumber?.trim() || null,
        country: input.country?.trim() || null,
        subject: cleanSubject,
        message: cleanMessage,
        status: "NEW",
      },
    });

    // 2. Publish Domain Event to trigger notifications and n8n automation
    await eventBus.publish({
      name: DOMAIN_EVENTS.CONTACT_MESSAGE_RECEIVED,
      timestamp: new Date().toISOString(),
      entityId: contact.id,
      payload: {
        id: contact.id,
        fullName: contact.fullName,
        email: contact.email,
        phoneNumber: contact.phoneNumber,
        whatsappNumber: contact.whatsappNumber,
        country: contact.country,
        companyName: input.companyName?.trim() || null,
        subject: contact.subject,
        message: contact.message,
        sourcePage: input.sourcePage || "Contact Page",
      },
    });

    return {
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      createdAt: contact.createdAt.toISOString(),
    };
  }

  /**
   * Retrieves paginated contact messages for administrators.
   */
  public async getContactMessages(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count(),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export const contactService = new ContactService();
