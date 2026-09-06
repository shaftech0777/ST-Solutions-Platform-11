import { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/index.js";
import { ResponseBuilder } from "../../core/responses/index.js";

const VALID_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class ShowcaseProjectsController {
  /**
   * Public: Retrieve published showcase projects
   */
  public getPublicProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, search, featured } = req.query;

      const where: any = {
        status: "PUBLISHED",
      };

      if (featured === "true") {
        where.featured = true;
      }

      const projects = await prisma.portfolioProject.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" },
        ],
      });

      let filtered = projects;

      // Filter by category name or id if specified
      if (category && category !== "All" && typeof category === "string") {
        const catLower = category.toLowerCase();
        filtered = filtered.filter((p: any) => {
          const catName = p.category?.name?.toLowerCase() || "";
          const projType = p.projectType?.toLowerCase() || "";
          return catName.includes(catLower) || projType.includes(catLower);
        });
      }

      // Filter by search term
      if (search && typeof search === "string" && search.trim()) {
        const query = search.trim().toLowerCase();
        filtered = filtered.filter((p: any) => {
          return (
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            (p.tagline && p.tagline.toLowerCase().includes(query)) ||
            (p.targetAudience && p.targetAudience.toLowerCase().includes(query))
          );
        });
      }

      ResponseBuilder.success(res, filtered, {
        message: "Showcase projects retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Public: Retrieve single showcase project by ID or Slug
   */
  public getPublicProjectByIdOrSlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idOrSlug } = req.params;

      if (!idOrSlug || typeof idOrSlug !== "string" || !idOrSlug.trim()) {
        ResponseBuilder.badRequest(res, "Invalid project identifier");
        return;
      }

      const project = await prisma.portfolioProject.findFirst({
        where: {
          OR: [
            { id: idOrSlug.trim() },
            { slug: idOrSlug.trim() },
          ],
          status: "PUBLISHED",
        },
        include: {
          category: true,
        },
      });

      if (!project) {
        ResponseBuilder.notFound(res, "Showcase project not found");
        return;
      }

      ResponseBuilder.success(res, project, {
        message: "Showcase project retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Protected: Admin list of all showcase projects (including DRAFT, ARCHIVED)
   */
  public getAllProjectsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projects = await prisma.portfolioProject.findMany({
        include: {
          category: true,
        },
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" },
        ],
      });

      ResponseBuilder.success(res, projects, {
        message: "All showcase projects retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Protected: Create a showcase project
   */
  public createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body;

      if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
        ResponseBuilder.badRequest(res, "Project title is required");
        return;
      }

      if (!body.description || typeof body.description !== "string" || !body.description.trim()) {
        ResponseBuilder.badRequest(res, "Project description is required");
        return;
      }

      if (body.status && !VALID_STATUSES.includes(body.status)) {
        ResponseBuilder.badRequest(res, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
        return;
      }

      let baseSlug = body.slug ? generateSlug(body.slug) : generateSlug(body.title);
      if (!baseSlug) baseSlug = "project-" + Date.now().toString(36);

      // Check if slug already exists; if so, append unique token
      const existingSlug = await prisma.portfolioProject.findUnique({
        where: { slug: baseSlug },
      });
      const slug = existingSlug ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

      const sanitizeArray = (val: any): string[] => {
        if (!Array.isArray(val)) return [];
        return val.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map(s => s.trim());
      };

      const created = await prisma.portfolioProject.create({
        data: {
          title: body.title.trim(),
          slug,
          categoryId: body.categoryId || null,
          tagline: body.tagline && typeof body.tagline === "string" ? body.tagline.trim() : null,
          description: body.description.trim(),
          fullDescription: body.fullDescription && typeof body.fullDescription === "string" ? body.fullDescription.trim() : null,
          projectType: body.projectType && typeof body.projectType === "string" ? body.projectType.trim() : "Web Application",
          liveUrl: body.liveUrl && typeof body.liveUrl === "string" ? body.liveUrl.trim() : null,
          githubUrl: body.githubUrl && typeof body.githubUrl === "string" ? body.githubUrl.trim() : null,
          thumbnailUrl: body.thumbnailUrl || body.coverImage || null,
          coverImage: body.coverImage || body.thumbnailUrl || null,
          galleryImages: sanitizeArray(body.galleryImages),
          videoUrl: body.videoUrl && typeof body.videoUrl === "string" ? body.videoUrl.trim() : null,
          features: sanitizeArray(body.features),
          benefits: sanitizeArray(body.benefits),
          targetAudience: body.targetAudience && typeof body.targetAudience === "string" ? body.targetAudience.trim() : null,
          technologies: sanitizeArray(body.technologies),
          status: body.status || "PUBLISHED",
          featured: Boolean(body.featured),
          displayOrder: typeof body.displayOrder === "number" ? Math.floor(body.displayOrder) : 0,
          seoTitle: body.seoTitle && typeof body.seoTitle === "string" ? body.seoTitle.trim() : null,
          seoDescription: body.seoDescription && typeof body.seoDescription === "string" ? body.seoDescription.trim() : null,
        },
        include: {
          category: true,
        },
      });

      ResponseBuilder.created(res, created, {
        message: "Showcase project created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Protected: Update a showcase project
   */
  public updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const body = req.body;

      if (!id || typeof id !== "string") {
        ResponseBuilder.badRequest(res, "Project ID is required");
        return;
      }

      const existing = await prisma.portfolioProject.findUnique({
        where: { id },
      });

      if (!existing) {
        ResponseBuilder.notFound(res, "Showcase project not found");
        return;
      }

      if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
        ResponseBuilder.badRequest(res, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
        return;
      }

      const sanitizeArray = (val: any): string[] => {
        if (!Array.isArray(val)) return [];
        return val.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map(s => s.trim());
      };

      const updateData: any = {};
      if (body.title !== undefined) updateData.title = typeof body.title === "string" ? body.title.trim() : existing.title;
      if (body.slug !== undefined && typeof body.slug === "string") {
        const newSlug = generateSlug(body.slug);
        if (newSlug && newSlug !== existing.slug) {
          const conflicting = await prisma.portfolioProject.findUnique({ where: { slug: newSlug } });
          updateData.slug = conflicting ? `${newSlug}-${Date.now().toString(36).slice(-4)}` : newSlug;
        }
      }
      if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null;
      if (body.tagline !== undefined) updateData.tagline = typeof body.tagline === "string" ? body.tagline.trim() : null;
      if (body.description !== undefined) updateData.description = typeof body.description === "string" ? body.description.trim() : existing.description;
      if (body.fullDescription !== undefined) updateData.fullDescription = typeof body.fullDescription === "string" ? body.fullDescription.trim() : null;
      if (body.projectType !== undefined) updateData.projectType = typeof body.projectType === "string" ? body.projectType.trim() : existing.projectType;
      if (body.liveUrl !== undefined) updateData.liveUrl = typeof body.liveUrl === "string" ? body.liveUrl.trim() : null;
      if (body.githubUrl !== undefined) updateData.githubUrl = typeof body.githubUrl === "string" ? body.githubUrl.trim() : null;
      if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl || null;
      if (body.coverImage !== undefined) updateData.coverImage = body.coverImage || null;
      if (body.galleryImages !== undefined) updateData.galleryImages = sanitizeArray(body.galleryImages);
      if (body.videoUrl !== undefined) updateData.videoUrl = typeof body.videoUrl === "string" ? body.videoUrl.trim() : null;
      if (body.features !== undefined) updateData.features = sanitizeArray(body.features);
      if (body.benefits !== undefined) updateData.benefits = sanitizeArray(body.benefits);
      if (body.targetAudience !== undefined) updateData.targetAudience = typeof body.targetAudience === "string" ? body.targetAudience.trim() : null;
      if (body.technologies !== undefined) updateData.technologies = sanitizeArray(body.technologies);
      if (body.status !== undefined) updateData.status = body.status;
      if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
      if (body.displayOrder !== undefined) updateData.displayOrder = typeof body.displayOrder === "number" ? Math.floor(body.displayOrder) : 0;
      if (body.seoTitle !== undefined) updateData.seoTitle = typeof body.seoTitle === "string" ? body.seoTitle.trim() : null;
      if (body.seoDescription !== undefined) updateData.seoDescription = typeof body.seoDescription === "string" ? body.seoDescription.trim() : null;

      const updated = await prisma.portfolioProject.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
        },
      });

      ResponseBuilder.success(res, updated, {
        message: "Showcase project updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Protected: Delete a showcase project
   */
  public deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string") {
        ResponseBuilder.badRequest(res, "Project ID is required");
        return;
      }

      await prisma.portfolioProject.delete({
        where: { id },
      });

      ResponseBuilder.success(res, { id }, {
        message: "Showcase project deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Protected: Reorder showcase projects
   */
  public reorderProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        ResponseBuilder.badRequest(res, "Items must be a non-empty array of { id, displayOrder }");
        return;
      }

      for (const item of items) {
        if (!item || typeof item.id !== "string" || !item.id.trim() || typeof item.displayOrder !== "number" || !Number.isInteger(item.displayOrder)) {
          ResponseBuilder.badRequest(res, "Each item must have a valid string id and integer displayOrder");
          return;
        }
      }

      // Execute transaction for atomic updates
      await prisma.$transaction(
        items.map((item: { id: string; displayOrder: number }) =>
          prisma.portfolioProject.update({
            where: { id: item.id.trim() },
            data: { displayOrder: item.displayOrder },
          })
        )
      );

      ResponseBuilder.success(res, { success: true }, {
        message: "Showcase projects reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Public: Categories list
   */
  public getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await prisma.portfolioCategory.findMany({
        orderBy: { displayOrder: "asc" },
      });

      ResponseBuilder.success(res, categories, {
        message: "Showcase categories retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const showcaseProjectsController = new ShowcaseProjectsController();
