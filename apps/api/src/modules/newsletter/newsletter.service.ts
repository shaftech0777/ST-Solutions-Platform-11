import { prisma } from "../../database/prisma.client.js";
import { eventBus } from "../../core/events/event-bus.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { ValidationError } from "../../core/errors/index.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";

export class NewsletterService {
  public async subscribe(email: string, source: string = "WEBSITE_FOOTER") {
    if (!email || !email.includes("@")) {
      throw new ValidationError("A valid email address is required.", ERROR_CODES.VALIDATION_ERROR);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Upsert subscriber in database
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: cleanEmail },
      update: {
        isActive: true,
        unsubscribedAt: null,
      },
      create: {
        email: cleanEmail,
        source: source.trim(),
        isActive: true,
      },
    });

    // Publish domain event to trigger n8n welcome sequence
    await eventBus.publish({
      name: DOMAIN_EVENTS.MARKETING_SUBSCRIBER_ADDED,
      timestamp: new Date().toISOString(),
      entityId: subscriber.id,
      payload: {
        subscriberId: subscriber.id,
        email: subscriber.email,
        source: subscriber.source,
      },
    });

    return {
      id: subscriber.id,
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt.toISOString(),
    };
  }

  public async unsubscribe(email: string) {
    if (!email || !email.includes("@")) {
      throw new ValidationError("A valid email address is required.", ERROR_CODES.VALIDATION_ERROR);
    }
    const cleanEmail = email.trim().toLowerCase();
    const updated = await prisma.newsletterSubscriber.updateMany({
      where: { email: cleanEmail },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });
    return { unsubscribed: updated.count > 0 };
  }

  public async broadcastCampaign(title: string, subject: string, content: string) {
    if (!subject || !content) {
      throw new ValidationError("Subject and content are required for marketing campaigns.", ERROR_CODES.VALIDATION_ERROR);
    }
    const activeSubscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, id: true },
    });

    await eventBus.publish({
      name: DOMAIN_EVENTS.MARKETING_CAMPAIGN_REQUESTED,
      timestamp: new Date().toISOString(),
      payload: {
        title: title || "Newsletter Campaign",
        subject,
        content,
        subscriberCount: activeSubscribers.length,
        recipients: activeSubscribers.map((s) => s.email),
      },
    });

    return {
      recipientCount: activeSubscribers.length,
      status: "QUEUED_FOR_DISPATCH",
    };
  }

  public async getSubscribers(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscriber.count(),
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

export const newsletterService = new NewsletterService();
