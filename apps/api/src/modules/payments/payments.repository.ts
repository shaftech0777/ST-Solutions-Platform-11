import { PaymentStatus, Prisma } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { prisma } from "../../database/prisma.client.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import { PaymentQueryFilters } from "./payments.types.js";

/**
 * Repository layer for Payment domain database operations.
 */
export class PaymentsRepository extends BaseRepository {
  private readonly paymentIncludes = {
    client: true,
    project: true,
    approvedBy: {
      include: {
        profile: true,
      },
    },
  } as const;

  /**
   * Retrieves paginated list of payments with filtering and search support.
   */
  public async findAndCount(filters: PaymentQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.PaymentWhereInput = {};
      const conditions: Prisma.PaymentWhereInput[] = [];

      if (filters.status) {
        conditions.push({ paymentStatus: filters.status });
      }

      if (filters.clientId) {
        conditions.push({ clientId: filters.clientId });
      }

      if (filters.projectId) {
        conditions.push({ projectId: filters.projectId });
      }

      if (filters.paymentMethod && filters.paymentMethod.trim().length > 0) {
        conditions.push({
          paymentMethod: { contains: filters.paymentMethod.trim(), mode: "insensitive" },
        });
      }

      if (filters.currency && filters.currency.trim().length > 0) {
        conditions.push({
          currency: { equals: filters.currency.trim().toUpperCase() },
        });
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
            { transactionReference: { contains: query, mode: "insensitive" } },
            { approvalNotes: { contains: query, mode: "insensitive" } },
            { paymentMethod: { contains: query, mode: "insensitive" } },
            { client: { fullName: { contains: query, mode: "insensitive" } } },
            { client: { companyName: { contains: query, mode: "insensitive" } } },
            { project: { title: { contains: query, mode: "insensitive" } } },
          ],
        });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      const orderBy: Prisma.PaymentOrderByWithRelationInput = {};
      const sortBy = filters.sortBy || "createdAt";
      const sortOrder = filters.sortOrder || "desc";

      if (sortBy === "amount") {
        orderBy.amount = sortOrder;
      } else if (sortBy === "paymentStatus") {
        orderBy.paymentStatus = sortOrder;
      } else if (sortBy === "submittedAt") {
        orderBy.submittedAt = sortOrder;
      } else if (sortBy === "approvedAt") {
        orderBy.approvedAt = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      const [data, total] = await Promise.all([
        client.payment.findMany({
          where,
          include: this.paymentIncludes,
          skip,
          take: limit,
          orderBy,
        }),
        client.payment.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

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
   * Finds payment by ID with relations.
   */
  public async findById(paymentId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.payment.findUnique({
        where: { id: paymentId },
        include: this.paymentIncludes,
      });
    });
  }

  /**
   * Creates a new payment record.
   */
  public async create(data: Prisma.PaymentCreateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.payment.create({
        data,
        include: this.paymentIncludes,
      });
    });
  }

  /**
   * Updates an existing payment record.
   */
  public async update(paymentId: string, data: Prisma.PaymentUpdateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.payment.update({
        where: { id: paymentId },
        data,
        include: this.paymentIncludes,
      });
    });
  }

  /**
   * Deletes a payment record by ID.
   */
  public async delete(paymentId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.payment.delete({
        where: { id: paymentId },
      });
    });
  }

  /**
   * Finds client record by ID.
   */
  public async findClientById(clientId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.client.findUnique({
        where: { id: clientId },
      });
    });
  }

  /**
   * Finds project record by ID.
   */
  public async findProjectById(projectId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.project.findUnique({
        where: { id: projectId },
      });
    });
  }

  /**
   * Finds user record by ID.
   */
  public async findUserById(userId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.user.findUnique({
        where: { id: userId },
      });
    });
  }

  /**
   * Calculates aggregate financial statistics.
   */
  public async getStatistics(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      const [
        totalPayments,
        statusGroups,
        methodGroups,
        currencyGroups,
        totalAggregate,
        recentAggregate,
      ] = await Promise.all([
        client.payment.count(),
        client.payment.groupBy({
          by: ["paymentStatus"],
          _count: { paymentStatus: true },
          _sum: { amount: true },
        }),
        client.payment.groupBy({
          by: ["paymentMethod"],
          _count: { paymentMethod: true },
          _sum: { amount: true },
        }),
        client.payment.groupBy({
          by: ["currency"],
          _count: { currency: true },
          _sum: { amount: true },
        }),
        client.payment.aggregate({
          _sum: { amount: true },
        }),
        client.payment.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
            },
          },
        }),
      ]);

      let paidDecimal = new Prisma.Decimal(0);
      let pendingDecimal = new Prisma.Decimal(0);
      let rejectedDecimal = new Prisma.Decimal(0);

      const statusBreakdown = statusGroups.map((sg) => {
        const amtDecimal = sg._sum.amount ? new Prisma.Decimal(sg._sum.amount) : new Prisma.Decimal(0);
        if (sg.paymentStatus === PaymentStatus.APPROVED) {
          paidDecimal = paidDecimal.plus(amtDecimal);
        } else if (sg.paymentStatus === PaymentStatus.PENDING || sg.paymentStatus === PaymentStatus.SUBMITTED) {
          pendingDecimal = pendingDecimal.plus(amtDecimal);
        } else if (sg.paymentStatus === PaymentStatus.REJECTED) {
          rejectedDecimal = rejectedDecimal.plus(amtDecimal);
        }

        return {
          status: sg.paymentStatus,
          count: sg._count.paymentStatus,
          totalAmount: Number(amtDecimal.toFixed(2)),
        };
      });

      const paymentMethodBreakdown = methodGroups.map((mg) => ({
        method: mg.paymentMethod || "UNSPECIFIED",
        count: mg._count.paymentMethod,
        totalAmount: mg._sum.amount ? Number(new Prisma.Decimal(mg._sum.amount).toFixed(2)) : 0,
      }));

      const currencyBreakdown = currencyGroups.map((cg) => ({
        currency: cg.currency,
        count: cg._count.currency,
        totalAmount: cg._sum.amount ? Number(new Prisma.Decimal(cg._sum.amount).toFixed(2)) : 0,
      }));

      return {
        totalPayments,
        totalAmount: totalAggregate._sum.amount ? Number(new Prisma.Decimal(totalAggregate._sum.amount).toFixed(2)) : 0,
        paidAmount: Number(paidDecimal.toFixed(2)),
        pendingAmount: Number(pendingDecimal.toFixed(2)),
        rejectedAmount: Number(rejectedDecimal.toFixed(2)),
        statusBreakdown,
        paymentMethodBreakdown,
        currencyBreakdown,
        recentPaymentsTotal: recentAggregate._sum.amount ? Number(new Prisma.Decimal(recentAggregate._sum.amount).toFixed(2)) : 0,
      };
    });
  }

  /**
   * Executes database transaction.
   */
  public async withTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.execute(async () => {
      return prisma.$transaction(fn);
    });
  }
}

export const paymentsRepository = new PaymentsRepository();
