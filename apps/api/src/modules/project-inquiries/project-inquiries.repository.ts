import { Prisma } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import {
  InquiryContactMethodType,
  InquiryPriorityType,
  InquiryStatusType,
  ProjectInquiryQueryFilters,
  ProjectInquiryStatistics,
} from "./project-inquiries.types.js";

export class ProjectInquiriesRepository extends BaseRepository {
  /**
   * Retrieves paginated list of project inquiries with filtering.
   */
  public async findAndCount(filters: ProjectInquiryQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.ProjectInquiryWhereInput = {};
      const conditions: Prisma.ProjectInquiryWhereInput[] = [];

      if (filters.status && filters.status.trim().length > 0 && filters.status !== "ALL") {
        conditions.push({ status: { equals: filters.status.trim().toUpperCase() as any } });
      }

      if (filters.priority && filters.priority.trim().length > 0 && filters.priority !== "ALL") {
        conditions.push({ priority: { equals: filters.priority.trim().toUpperCase() as any } });
      }

      if (filters.category && filters.category.trim().length > 0 && filters.category !== "ALL") {
        conditions.push({ category: { equals: filters.category.trim(), mode: "insensitive" } });
      }

      if (filters.projectId && filters.projectId.trim().length > 0) {
        conditions.push({ projectId: { equals: filters.projectId.trim() } });
      }

      if (filters.startDate || filters.endDate) {
        const dateCondition: Prisma.DateTimeFilter = {};
        if (filters.startDate) {
          dateCondition.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          dateCondition.lte = new Date(filters.endDate);
        }
        conditions.push({ createdAt: dateCondition });
      }

      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.trim();
        conditions.push({
          OR: [
            { visitorName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { companyName: { contains: query, mode: "insensitive" } },
            { projectNameSnapshot: { contains: query, mode: "insensitive" } },
            { message: { contains: query, mode: "insensitive" } },
          ],
        });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      const orderBy: Prisma.ProjectInquiryOrderByWithRelationInput = {};
      const sortBy = filters.sortBy || "createdAt";
      const sortOrder = filters.sortOrder || "desc";
      orderBy[sortBy] = sortOrder;

      const [total, data] = await Promise.all([
        (client as any).projectInquiry.count({ where }),
        (client as any).projectInquiry.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            contactedBy: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true } },
              },
            },
            activities: {
              orderBy: { createdAt: "desc" },
              take: 5,
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    profile: { select: { fullName: true } },
                  },
                },
              },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    });
  }

  /**
   * Retrieves single inquiry by ID with full activities and contactedBy details.
   */
  public async findById(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return (client as any).projectInquiry.findUnique({
        where: { id },
        include: {
          contactedBy: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: { select: { fullName: true } },
                },
              },
            },
          },
        },
      });
    });
  }

  /**
   * Finds a recent matching inquiry to prevent duplicate submissions within a short time window.
   */
  public async findRecentDuplicate(
    params: {
      email: string;
      projectNameSnapshot: string;
      message: string;
      thresholdSeconds?: number;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const thresholdSeconds = params.thresholdSeconds || 60;
      const since = new Date(Date.now() - thresholdSeconds * 1000);

      return (client as any).projectInquiry.findFirst({
        where: {
          email: { equals: params.email, mode: "insensitive" },
          projectNameSnapshot: params.projectNameSnapshot,
          message: params.message,
          createdAt: { gte: since },
        },
      });
    });
  }

  /**
   * Creates a new project inquiry record.
   */
  public async create(
    data: {
      visitorName: string;
      email: string;
      phone: string;
      companyName?: string | null;
      country?: string | null;
      projectId?: string | null;
      projectNameSnapshot: string;
      category?: string | null;
      message: string;
      preferredContactMethod: InquiryContactMethodType;
      budget?: string | null;
      preferredContactTime?: string | null;
      status?: InquiryStatusType;
      priority?: InquiryPriorityType;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return (client as any).projectInquiry.create({
        data: {
          visitorName: data.visitorName,
          email: data.email,
          phone: data.phone,
          companyName: data.companyName || null,
          country: data.country || null,
          projectId: data.projectId || null,
          projectNameSnapshot: data.projectNameSnapshot,
          category: data.category || null,
          message: data.message,
          preferredContactMethod: data.preferredContactMethod || "WHATSAPP",
          budget: data.budget || null,
          preferredContactTime: data.preferredContactTime || null,
          status: data.status || "NEW",
          priority: data.priority || "NORMAL",
        },
      });
    });
  }

  /**
   * Updates an existing project inquiry.
   */
  public async update(
    id: string,
    data: {
      status?: InquiryStatusType;
      priority?: InquiryPriorityType;
      adminNotes?: string | null;
      contactedAt?: Date | null;
      contactedById?: string | null;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return (client as any).projectInquiry.update({
        where: { id },
        data,
        include: {
          contactedBy: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: { select: { fullName: true } },
                },
              },
            },
          },
        },
      });
    });
  }

  /**
   * Records an activity for an inquiry.
   */
  public async createActivity(
    data: {
      inquiryId: string;
      userId?: string | null;
      action: string;
      contactMethod?: string | null;
      details?: string | null;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return (client as any).inquiryActivity.create({
        data: {
          inquiryId: data.inquiryId,
          userId: data.userId || null,
          action: data.action,
          contactMethod: data.contactMethod || null,
          details: data.details || null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });
    });
  }

  /**
   * Deletes an inquiry and associated activities.
   */
  public async delete(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return (client as any).projectInquiry.delete({
        where: { id },
      });
    });
  }

  /**
   * Calculates dashboard inquiry metric statistics.
   */
  public async getStatistics(tx?: TransactionClient): Promise<ProjectInquiryStatistics> {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const [
        total,
        newCount,
        inProgressCount,
        contactedCount,
        convertedCount,
        closedCount,
        spamCount,
        urgentCount,
        whatsappCount,
        emailCount,
        phoneCallCount,
      ] = await Promise.all([
        (client as any).projectInquiry.count(),
        (client as any).projectInquiry.count({ where: { status: "NEW" } }),
        (client as any).projectInquiry.count({ where: { status: "IN_PROGRESS" } }),
        (client as any).projectInquiry.count({ where: { status: "CONTACTED" } }),
        (client as any).projectInquiry.count({ where: { status: "CONVERTED" } }),
        (client as any).projectInquiry.count({ where: { status: "CLOSED" } }),
        (client as any).projectInquiry.count({ where: { status: "SPAM" } }),
        (client as any).projectInquiry.count({ where: { priority: "URGENT" } }),
        (client as any).projectInquiry.count({ where: { preferredContactMethod: "WHATSAPP" } }),
        (client as any).projectInquiry.count({ where: { preferredContactMethod: "EMAIL" } }),
        (client as any).projectInquiry.count({ where: { preferredContactMethod: "PHONE_CALL" } }),
      ]);

      return {
        total,
        newCount,
        inProgressCount,
        contactedCount,
        convertedCount,
        closedCount,
        spamCount,
        urgentCount,
        byContactMethod: {
          whatsapp: whatsappCount,
          email: emailCount,
          phoneCall: phoneCallCount,
        },
      };
    });
  }
}

export const projectInquiriesRepository = new ProjectInquiriesRepository();
