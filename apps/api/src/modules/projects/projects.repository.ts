import { Prisma, ProjectStatus } from "@prisma/client";
import { TransactionClient } from "../../database/database.types.js";
import { normalizePagination } from "../../database/pagination.js";
import { prisma } from "../../database/prisma.client.js";
import { BaseRepository } from "../../database/repositories/base.repository.js";
import { ProjectQueryFilters } from "./projects.types.js";

/**
 * Repository layer for Project domain database operations.
 */
export class ProjectsRepository extends BaseRepository {
  private readonly projectIncludes = {
    client: true,
    createdBy: {
      include: {
        profile: true,
      },
    },
    manager: {
      include: {
        profile: true,
      },
    },
    member: {
      include: {
        profile: true,
      },
    },
    _count: {
      select: {
        updates: true,
        payments: true,
      },
    },
  } as const;

  private readonly projectDetailIncludes = {
    ...this.projectIncludes,
    updates: {
      take: 10,
      orderBy: { createdAt: "desc" as const },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
      },
    },
  } as const;

  private readonly updateIncludes = {
    createdBy: {
      include: {
        profile: true,
      },
    },
  } as const;

  /**
   * Retrieves paginated list of projects with filtering and search support.
   */
  public async findAndCount(filters: ProjectQueryFilters, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      const { page, limit, skip } = normalizePagination({ page: filters.page, limit: filters.limit });

      const where: Prisma.ProjectWhereInput = {};
      const conditions: Prisma.ProjectWhereInput[] = [];

      if (filters.organizationId) {
        conditions.push({ organizationId: filters.organizationId });
      }

      if (filters.workspaceId) {
        conditions.push({ workspaceId: filters.workspaceId });
      }

      if (filters.status) {
        conditions.push({ projectStatus: filters.status });
      }

      if (filters.clientId) {
        conditions.push({ clientId: filters.clientId });
      }

      if (filters.assignedManagerId) {
        conditions.push({ assignedManagerId: filters.assignedManagerId });
      }

      if (filters.assignedMemberId) {
        conditions.push({ assignedMemberId: filters.assignedMemberId });
      }

      if (filters.createdById) {
        conditions.push({ createdById: filters.createdById });
      }

      if (filters.category && filters.category.trim().length > 0) {
        conditions.push({
          category: { contains: filters.category.trim(), mode: "insensitive" },
        });
      }

      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.trim();
        conditions.push({
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { client: { fullName: { contains: query, mode: "insensitive" } } },
            { client: { companyName: { contains: query, mode: "insensitive" } } },
          ],
        });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      const orderBy: Prisma.ProjectOrderByWithRelationInput = {};
      const sortBy = filters.sortBy || "createdAt";
      const sortOrder = filters.sortOrder || "desc";

      if (sortBy === "title") {
        orderBy.title = sortOrder;
      } else if (sortBy === "projectStatus") {
        orderBy.projectStatus = sortOrder;
      } else if (sortBy === "budget") {
        orderBy.budget = sortOrder;
      } else if (sortBy === "startDate") {
        orderBy.startDate = sortOrder;
      } else if (sortBy === "expectedCompletionDate") {
        orderBy.expectedCompletionDate = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      const [data, total] = await Promise.all([
        client.project.findMany({
          where,
          include: this.projectIncludes,
          skip,
          take: limit,
          orderBy,
        }),
        client.project.count({ where }),
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
   * Finds project by ID with deep relations.
   */
  public async findById(projectId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.project.findUnique({
        where: { id: projectId },
        include: this.projectDetailIncludes,
      });
    });
  }

  /**
   * Creates a new project record.
   */
  public async create(data: Prisma.ProjectCreateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.project.create({
        data,
        include: this.projectDetailIncludes,
      });
    });
  }

  /**
   * Updates existing project record.
   */
  public async update(projectId: string, data: Prisma.ProjectUpdateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.project.update({
        where: { id: projectId },
        data,
        include: this.projectDetailIncludes,
      });
    });
  }

  /**
   * Deletes a project record by ID.
   */
  public async delete(projectId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.project.delete({
        where: { id: projectId },
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
   * Creates a project update entry.
   */
  public async createProjectUpdate(data: Prisma.ProjectUpdateCreateInput, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.projectUpdate.create({
        data,
        include: this.updateIncludes,
      });
    });
  }

  /**
   * Finds project update entry by update ID.
   */
  public async findProjectUpdateById(updateId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.projectUpdate.findUnique({
        where: { id: updateId },
        include: this.updateIncludes,
      });
    });
  }

  /**
   * Retrieves all updates for a project.
   */
  public async findProjectUpdatesByProjectId(projectId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.projectUpdate.findMany({
        where: { projectId },
        include: this.updateIncludes,
        orderBy: { createdAt: "desc" },
      });
    });
  }

  /**
   * Updates a project update entry.
   */
  public async updateProjectUpdate(
    updateId: string,
    data: Prisma.ProjectUpdateUpdateInput,
    tx?: TransactionClient
  ) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.projectUpdate.update({
        where: { id: updateId },
        data,
        include: this.updateIncludes,
      });
    });
  }

  /**
   * Deletes a project update entry.
   */
  public async deleteProjectUpdate(updateId: string, tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);
      return client.projectUpdate.delete({
        where: { id: updateId },
      });
    });
  }

  /**
   * Calculates aggregate project statistics.
   */
  public async getStatistics(tx?: TransactionClient) {
    return this.execute(async () => {
      const client = this.getClient(tx);

      const [total, statusCounts, active, completed, cancelled, recent, assigned, unassigned, budgetAggregate] =
        await Promise.all([
          client.project.count(),
          client.project.groupBy({
            by: ["projectStatus"],
            _count: { projectStatus: true },
          }),
          client.project.count({
            where: {
              projectStatus: {
                in: [
                  ProjectStatus.IN_PROGRESS,
                  ProjectStatus.REVIEW,
                  ProjectStatus.DISCUSSION,
                  ProjectStatus.CONFIRMED,
                ],
              },
            },
          }),
          client.project.count({
            where: { projectStatus: ProjectStatus.COMPLETED },
          }),
          client.project.count({
            where: { projectStatus: ProjectStatus.CANCELLED },
          }),
          client.project.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
              },
            },
          }),
          client.project.count({
            where: {
              OR: [{ assignedManagerId: { not: null } }, { assignedMemberId: { not: null } }],
            },
          }),
          client.project.count({
            where: {
              assignedManagerId: null,
              assignedMemberId: null,
            },
          }),
          client.project.aggregate({
            _sum: { budget: true },
          }),
        ]);

      const projectsByStatus = statusCounts.map((sc) => ({
        status: sc.projectStatus,
        count: sc._count.projectStatus,
      }));

      return {
        totalProjects: total,
        activeProjects: active,
        completedProjects: completed,
        cancelledProjects: cancelled,
        projectsByStatus,
        recentlyCreatedCount: recent,
        assignedProjectsCount: assigned,
        unassignedProjectsCount: unassigned,
        totalBudget: budgetAggregate._sum.budget ?? 0,
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

export const projectsRepository = new ProjectsRepository();
