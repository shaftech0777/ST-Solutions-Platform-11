import { NotFoundError, ValidationError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { eventBus } from "../../core/events/event-bus.js";
import {
  sanitizeProjectInquiryResponse,
  sanitizePublicInquirySubmissionResponse,
} from "./project-inquiries.mapper.js";
import {
  projectInquiriesRepository as defaultRepo,
  ProjectInquiriesRepository,
} from "./project-inquiries.repository.js";
import {
  AddInquiryNoteInput,
  InquiryContactMethodType,
  InquiryPriorityType,
  InquiryStatusType,
  ProjectInquiryQueryFilters,
  ProjectInquiryResponse,
  ProjectInquiryStatistics,
  PublicCreateProjectInquiryInput,
  RecordContactAttemptInput,
  UpdateProjectInquiryInput,
} from "./project-inquiries.types.js";

export class ProjectInquiriesService {
  private readonly repository: ProjectInquiriesRepository;

  constructor(repository: ProjectInquiriesRepository = defaultRepo) {
    this.repository = repository;
  }

  /**
   * Public Visitor Inquiry Submission flow:
   * 1. Inserts ProjectInquiry record in PostgreSQL.
   * 2. Logs initial creation activity.
   * 3. Dispatches DOMAIN_EVENTS.PROJECT_INQUIRY_CREATED so ADMIN & SUB_ADMIN are notified.
   * 4. Returns clean public response.
   */
  public async createPublicInquiry(input: PublicCreateProjectInquiryInput) {
    const preferredContactMethod: InquiryContactMethodType = input.preferredContactMethod || "WHATSAPP";
    const email = input.email.trim().toLowerCase();
    const projectNameSnapshot = input.projectNameSnapshot.trim();
    const message = input.message.trim();

    // Check for rapid duplicate submissions (within 60s)
    const existingDuplicate = await this.repository.findRecentDuplicate({
      email,
      projectNameSnapshot,
      message,
      thresholdSeconds: 60,
    });

    if (existingDuplicate) {
      return sanitizePublicInquirySubmissionResponse(existingDuplicate);
    }

    const created = await this.repository.create({
      visitorName: input.visitorName.trim(),
      email,
      phone: input.phone.trim(),
      companyName: input.companyName?.trim() || null,
      country: input.country?.trim() || null,
      projectId: input.projectId?.trim() || null,
      projectNameSnapshot,
      category: input.category?.trim() || null,
      message,
      preferredContactMethod,
      budget: input.budget?.trim() || null,
      preferredContactTime: input.preferredContactTime?.trim() || null,
      status: "NEW",
      priority: "NORMAL",
    });

    // Record initial activity in PostgreSQL
    await this.repository.createActivity({
      inquiryId: created.id,
      userId: null,
      action: "INQUIRY_CREATED",
      contactMethod: preferredContactMethod,
      details: `Inquiry submitted via public portal for "${created.projectNameSnapshot}". Preferred contact: ${preferredContactMethod}.`,
    });

    // Dispatch domain event to trigger Admin/Sub-Admin notifications
    await eventBus.publish({
      eventName: DOMAIN_EVENTS.PROJECT_INQUIRY_CREATED,
      entityType: "PROJECT_INQUIRY",
      entityId: created.id,
      timestamp: new Date(),
      payload: {
        inquiryId: created.id,
        visitorName: created.visitorName,
        email: created.email,
        phone: created.phone,
        companyName: created.companyName,
        projectId: created.projectId,
        projectNameSnapshot: created.projectNameSnapshot,
        category: created.category,
        message: created.message,
        preferredContactMethod: created.preferredContactMethod,
        priority: created.priority,
      },
    });

    return sanitizePublicInquirySubmissionResponse(created);
  }

  /**
   * Retrieves paginated inquiries for ADMIN and SUB_ADMIN.
   */
  public async getInquiries(filters: ProjectInquiryQueryFilters): Promise<{
    items: ProjectInquiryResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const { data, meta } = await this.repository.findAndCount(filters);
    const sanitizedItems = data.map((item) => sanitizeProjectInquiryResponse(item));

    return {
      items: sanitizedItems,
      pagination: meta,
    };
  }

  /**
   * Retrieves full single inquiry record by ID.
   */
  public async getInquiryById(id: string): Promise<ProjectInquiryResponse> {
    const inquiry = await this.repository.findById(id);
    if (!inquiry) {
      throw new NotFoundError("Project inquiry not found", ERROR_CODES.RESOURCE_NOT_FOUND);
    }
    return sanitizeProjectInquiryResponse(inquiry);
  }

  /**
   * Updates status, priority, or admin notes on an inquiry.
   */
  public async updateInquiry(
    id: string,
    input: UpdateProjectInquiryInput,
    actorId?: string
  ): Promise<ProjectInquiryResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Project inquiry not found", ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const updated = await this.repository.update(id, input);

    if (input.status && input.status !== existing.status) {
      await this.repository.createActivity({
        inquiryId: id,
        userId: actorId || null,
        action: "STATUS_CHANGED",
        details: `Status updated from ${existing.status} to ${input.status}`,
      });

      await eventBus.publish({
        eventName: DOMAIN_EVENTS.PROJECT_INQUIRY_STATUS_CHANGED,
        entityType: "PROJECT_INQUIRY",
        entityId: id,
        timestamp: new Date(),
        payload: {
          inquiryId: id,
          oldStatus: existing.status,
          newStatus: input.status,
          actorId,
        },
      });
    }

    if (input.priority && input.priority !== existing.priority) {
      await this.repository.createActivity({
        inquiryId: id,
        userId: actorId || null,
        action: "PRIORITY_CHANGED",
        details: `Priority updated from ${existing.priority} to ${input.priority}`,
      });
    }

    return sanitizeProjectInquiryResponse(updated);
  }

  /**
   * Records that an administrator/sub-administrator reached out to the visitor.
   */
  public async recordContactAttempt(
    id: string,
    input: RecordContactAttemptInput,
    actorId?: string
  ): Promise<ProjectInquiryResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Project inquiry not found", ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    // Record activity
    await this.repository.createActivity({
      inquiryId: id,
      userId: actorId || null,
      action: "CONTACT_ATTEMPTED",
      contactMethod: input.contactMethod,
      details: input.notes
        ? `Contact attempted via ${input.contactMethod}: ${input.notes}`
        : `Contact initiated via ${input.contactMethod}`,
    });

    const updatePayload: UpdateProjectInquiryInput = {
      contactedAt: new Date(),
      contactedById: actorId || input.userId || null,
    };

    if (input.newStatus) {
      updatePayload.status = input.newStatus;
    } else if ((input.updateStatusToContacted ?? true) && existing.status === "NEW") {
      updatePayload.status = "CONTACTED";
    }

    const updated = await this.repository.update(id, updatePayload);

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.PROJECT_INQUIRY_CONTACTED,
      entityType: "PROJECT_INQUIRY",
      entityId: id,
      timestamp: new Date(),
      payload: {
        inquiryId: id,
        contactMethod: input.contactMethod,
        actorId,
      },
    });

    return sanitizeProjectInquiryResponse(updated);
  }

  /**
   * Adds an administrative note to an inquiry.
   */
  public async addNote(id: string, input: AddInquiryNoteInput, actorId?: string): Promise<ProjectInquiryResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Project inquiry not found", ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const newNoteBlock = `[${timestamp}]: ${input.notes.trim()}`;
    const combinedNotes = existing.adminNotes
      ? `${existing.adminNotes}\n\n${newNoteBlock}`
      : newNoteBlock;

    const updated = await this.repository.update(id, {
      adminNotes: combinedNotes,
    });

    await this.repository.createActivity({
      inquiryId: id,
      userId: actorId || null,
      action: "NOTE_ADDED",
      details: input.notes.trim(),
    });

    return sanitizeProjectInquiryResponse(updated);
  }

  /**
   * Deletes an inquiry record.
   */
  public async deleteInquiry(id: string, actorId?: string): Promise<{ success: boolean; id: string }> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Project inquiry not found", ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    await this.repository.delete(id);
    return { success: true, id };
  }

  /**
   * Retrieves aggregated KPI metrics for inquiries.
   */
  public async getStatistics(): Promise<ProjectInquiryStatistics> {
    return this.repository.getStatistics();
  }
}

export const projectInquiriesService = new ProjectInquiriesService();
