import { ApplicationStatus, Prisma, VerificationStatus } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { prisma } from "../../database/prisma.client.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import { ApplicationQueryFilters, AnswerItemInput } from "./applicants.types.js";

/**
 * Repository encapsulating database operations for MemberApplications, Questions, Answers, Verifications, and Onboarding.
 */
export class ApplicantsRepository extends BaseRepository {
  private readonly applicationIncludes = {
    answers: {
      include: {
        question: true,
      },
    },
    verifications: true,
    profiles: true,
  } as const;

  /**
   * Retrieves paginated applications list with filtering, search, and sorting.
   */
  public async findAndCount(filters: ApplicationQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.MemberApplicationWhereInput = {};

      if (filters.status) {
        where.applicationStatus = filters.status;
      }

      if (filters.verificationStatus) {
        where.verificationStatus = filters.verificationStatus;
      }

      if (filters.country) {
        where.country = { contains: filters.country.trim(), mode: "insensitive" };
      }

      if (filters.city) {
        where.city = { contains: filters.city.trim(), mode: "insensitive" };
      }

      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.trim();
        where.OR = [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phoneNumber: { contains: query, mode: "insensitive" } },
          { whatsappNumber: { contains: query, mode: "insensitive" } },
          { country: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { currentProfession: { contains: query, mode: "insensitive" } },
        ];
      }

      const sortBy = filters.sortBy ?? "createdAt";
      const sortOrder = filters.sortOrder ?? "desc";

      const [items, totalRecords] = await Promise.all([
        client.memberApplication.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: this.applicationIncludes,
        }),
        client.memberApplication.count({ where }),
      ]);

      return {
        items,
        totalRecords,
        page,
        limit,
      };
    });
  }

  /**
   * Finds application by ID with relations.
   */
  public async findById(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.memberApplication.findUnique({
        where: { id },
        include: this.applicationIncludes,
      });
    });
  }

  /**
   * Finds application matching email or phone number.
   */
  public async findByEmailOrPhone(email: string, phoneNumber: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.memberApplication.findFirst({
        where: {
          OR: [
            { email: { equals: email.trim(), mode: "insensitive" } },
            { phoneNumber: { equals: phoneNumber.trim() } },
          ],
        },
        include: this.applicationIncludes,
        orderBy: { createdAt: "desc" },
      });
    });
  }

  /**
   * Creates a new MemberApplication record with optional answers.
   */
  public async createApplication(
    data: Prisma.MemberApplicationUncheckedCreateInput & {
      answersData?: AnswerItemInput[];
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { answersData, ...appData } = data;

      return client.memberApplication.create({
        data: {
          ...appData,
          answers: answersData && answersData.length > 0
            ? {
                create: answersData.map((a) => ({
                  questionId: a.questionId,
                  answer: a.answer,
                })),
              }
            : undefined,
        },
        include: this.applicationIncludes,
      });
    });
  }

  /**
   * Updates an existing application entity.
   */
  public async updateApplication(
    id: string,
    data: Prisma.MemberApplicationUpdateInput,
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.memberApplication.update({
        where: { id },
        data,
        include: this.applicationIncludes,
      });
    });
  }

  /**
   * Updates status, review notes, and reviewer info of an application.
   */
  public async updateStatus(
    id: string,
    data: {
      status: ApplicationStatus;
      reviewedById?: string | null;
      reviewNotes?: string | null;
      rejectionReason?: string | null;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const isRejected = data.status === ApplicationStatus.REJECTED;
      return client.memberApplication.update({
        where: { id },
        data: {
          applicationStatus: data.status,
          ...(data.reviewedById !== undefined && { reviewedById: data.reviewedById }),
          ...(data.reviewNotes !== undefined && { reviewNotes: data.reviewNotes }),
          ...(data.rejectionReason !== undefined && { rejectionReason: data.rejectionReason }),
          ...(isRejected && {
            rejectedAt: new Date(),
            // Auto retention expiry after 7 days
            retentionExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }),
        },
        include: this.applicationIncludes,
      });
    });
  }

  /**
   * Purges rejected applications that have exceeded their 7-day retention period.
   */
  public async purgeExpiredRejectedApplications(tx?: TransactionClient): Promise<number> {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const expired = await client.memberApplication.findMany({
        where: {
          applicationStatus: ApplicationStatus.REJECTED,
          retentionExpiresAt: {
            lte: new Date(),
          },
        },
        select: { id: true },
      });

      if (expired.length === 0) return 0;

      const ids = expired.map((e) => e.id);
      // Delete child relations if needed or cascade
      await client.applicationAnswer.deleteMany({
        where: { applicationId: { in: ids } },
      });
      await client.memberVerification.deleteMany({
        where: { applicationId: { in: ids } },
      });
      const result = await client.memberApplication.deleteMany({
        where: { id: { in: ids } },
      });

      return result.count;
    });
  }

  /**
   * Retrieves list of application questions.
   */
  public async getQuestions(onlyActive = true, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.applicationQuestion.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: { orderNumber: "asc" },
      });
    });
  }

  /**
   * Finds single question by ID.
   */
  public async findQuestionById(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.applicationQuestion.findUnique({
        where: { id },
      });
    });
  }

  /**
   * Creates a new ApplicationQuestion record.
   */
  public async createQuestion(
    data: {
      question: string;
      fieldType?: string;
      isRequired?: boolean;
      options?: any;
      placeholder?: string | null;
      helpText?: string | null;
      category?: string | null;
      orderNumber?: number;
      isActive?: boolean;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      let order = data.orderNumber;
      if (order === undefined || order === null) {
        const count = await client.applicationQuestion.count();
        order = count + 1;
      }
      return client.applicationQuestion.create({
        data: {
          question: data.question,
          fieldType: data.fieldType || "SHORT_TEXT",
          isRequired: data.isRequired ?? false,
          options: data.options ?? undefined,
          placeholder: data.placeholder ?? null,
          helpText: data.helpText ?? null,
          category: data.category || "GENERAL",
          orderNumber: order,
          isActive: data.isActive ?? true,
        },
      });
    });
  }

  /**
   * Updates an existing ApplicationQuestion record.
   */
  public async updateQuestion(
    id: string,
    data: {
      question?: string;
      fieldType?: string;
      isRequired?: boolean;
      options?: any;
      placeholder?: string | null;
      helpText?: string | null;
      category?: string | null;
      orderNumber?: number;
      isActive?: boolean;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.applicationQuestion.update({
        where: { id },
        data: {
          question: data.question,
          fieldType: data.fieldType,
          isRequired: data.isRequired,
          options: data.options !== undefined ? data.options : undefined,
          placeholder: data.placeholder,
          helpText: data.helpText,
          category: data.category,
          orderNumber: data.orderNumber,
          isActive: data.isActive,
        },
      });
    });
  }

  /**
   * Deletes or deactivates an ApplicationQuestion record.
   */
  public async deleteQuestion(id: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      // Soft-delete / deactivate first to ensure historical answers remain intact
      const answerCount = await client.applicationAnswer.count({ where: { questionId: id } });
      if (answerCount > 0) {
        return client.applicationQuestion.update({
          where: { id },
          data: { isActive: false },
        });
      }
      return client.applicationQuestion.delete({
        where: { id },
      });
    });
  }

  /**
   * Reorders multiple ApplicationQuestion records in batch.
   */
  public async reorderQuestions(
    questionOrders: readonly { id: string; orderNumber: number }[],
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      for (const item of questionOrders) {
        await client.applicationQuestion.update({
          where: { id: item.id },
          data: { orderNumber: item.orderNumber },
        });
      }
      return client.applicationQuestion.findMany({
        orderBy: { orderNumber: "asc" },
      });
    });
  }

  /**
   * Submits or updates answers for an application.
   */
  public async submitAnswers(applicationId: string, answers: AnswerItemInput[], tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      // Upsert each answer using transaction or iteration
      for (const item of answers) {
        await client.applicationAnswer.upsert({
          where: {
            applicationId_questionId: {
              applicationId,
              questionId: item.questionId,
            },
          },
          create: {
            applicationId,
            questionId: item.questionId,
            answer: item.answer,
          },
          update: {
            answer: item.answer,
          },
        });
      }

      return client.memberApplication.findUnique({
        where: { id: applicationId },
        include: this.applicationIncludes,
      });
    });
  }

  /**
   * Gets all answers for an application.
   */
  public async getAnswers(applicationId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.applicationAnswer.findMany({
        where: { applicationId },
        include: { question: true },
        orderBy: { question: { orderNumber: "asc" } },
      });
    });
  }

  /**
   * Creates or updates a MemberVerification record and updates application verificationStatus.
   */
  public async createOrUpdateVerification(
    applicationId: string,
    data: {
      verificationStatus: VerificationStatus;
      verifiedById?: string | null;
      verificationNotes?: string | null;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      const [verification] = await Promise.all([
        client.memberVerification.create({
          data: {
            applicationId,
            verificationStatus: data.verificationStatus,
            verifiedById: data.verifiedById ?? null,
            verificationNotes: data.verificationNotes ?? null,
          },
        }),
        client.memberApplication.update({
          where: { id: applicationId },
          data: {
            verificationStatus: data.verificationStatus,
          },
        }),
      ]);

      return verification;
    });
  }

  /**
   * Finds user by email address.
   */
  public async findUserByEmail(email: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        include: { profile: true },
      });
    });
  }

  /**
   * Finds role entity by name.
   */
  public async findRoleByName(name: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.role.findUnique({
        where: { name: name.trim().toUpperCase() },
      });
    });
  }

  /**
   * Finds default or specified Rank entity.
   */
  public async findRankByNameOrLowestPriority(rankName?: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      if (rankName && rankName.trim().length > 0) {
        const foundRank = await client.rank.findFirst({
          where: { name: { equals: rankName.trim(), mode: "insensitive" } },
        });
        if (foundRank) return foundRank;
      }

      // Fallback to rank with highest priority number (lowest rank level) or first rank
      return client.rank.findFirst({
        where: { isActive: true },
        orderBy: { priority: "desc" },
      });
    });
  }

  /**
   * Performs atomic Applicant -> Member onboarding transaction in Prisma.
   */
  public async onboardApplicantTx(
    params: {
      application: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        country: string;
        city: string;
        address: string;
        profileImageUrl: string | null;
      };
      passwordHash: string;
      roleId: string | null;
      rankId: string | null;
      memberRankName: string | null;
      notes?: string;
    },
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const fn = async (transaction: Prisma.TransactionClient) => {
        const app = params.application;

        // 1. Find or create User account
        let user = await transaction.user.findUnique({
          where: { email: app.email.trim().toLowerCase() },
        });

        if (!user) {
          user = await transaction.user.create({
            data: {
              email: app.email.trim().toLowerCase(),
              passwordHash: params.passwordHash,
              accountType: "MEMBER",
              status: "ACTIVE",
              roleId: params.roleId,
              profile: {
                create: {
                  fullName: app.fullName,
                  phoneNumber: app.phoneNumber,
                  country: app.country,
                  city: app.city,
                  address: app.address,
                  profileImage: app.profileImageUrl,
                },
              },
            },
          });
        } else {
          // Update user status and accountType if needed
          user = await transaction.user.update({
            where: { id: user.id },
            data: {
              accountType: "MEMBER",
              status: "ACTIVE",
              ...(params.roleId && { roleId: params.roleId }),
            },
          });
        }

        // 2. Create or update MemberProfile linking applicationId and userId
        const joinedAt = new Date();
        const memberProfile = await transaction.memberProfile.create({
          data: {
            applicationId: app.id,
            userId: user.id,
            memberRank: params.memberRankName,
            joinedAt,
          },
        });

        // 3. Create Member record if rank is available and Member record does not exist
        let member = await transaction.member.findUnique({
          where: { userId: user.id },
        });

        if (!member && params.rankId) {
          member = await transaction.member.create({
            data: {
              userId: user.id,
              rankId: params.rankId,
              status: "ACTIVE",
              joinedAt,
              notes: params.notes ?? `Onboarded from application ${app.id}`,
            },
          });
        }

        // 4. Update application status to APPROVED if not already, and set verification status to VERIFIED
        await transaction.memberApplication.update({
          where: { id: app.id },
          data: {
            applicationStatus: "APPROVED",
            verificationStatus: "VERIFIED",
          },
        });

        return {
          user,
          memberProfile,
          member,
          joinedAt,
        };
      };

      if (tx) {
        return fn(tx as Prisma.TransactionClient);
      }

      return prisma.$transaction(fn);
    });
  }
}

export const applicantsRepository = new ApplicantsRepository();
