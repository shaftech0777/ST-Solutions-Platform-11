import { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/index.js";
import { ResponseBuilder } from "../../core/responses/index.js";

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

      let project = await prisma.portfolioProject.findFirst({
        where: {
          OR: [
            { id: idOrSlug },
            { slug: idOrSlug },
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

      if (!body.title || !body.description) {
        ResponseBuilder.badRequest(res, "Title and description are required");
        return;
      }

      const slug = body.slug ? generateSlug(body.slug) : generateSlug(body.title) + "-" + Date.now().toString(36);

      const created = await prisma.portfolioProject.create({
        data: {
          title: body.title.trim(),
          slug,
          categoryId: body.categoryId || null,
          tagline: body.tagline ? body.tagline.trim() : null,
          description: body.description.trim(),
          fullDescription: body.fullDescription ? body.fullDescription.trim() : null,
          projectType: body.projectType || "Web Application",
          liveUrl: body.liveUrl ? body.liveUrl.trim() : null,
          githubUrl: body.githubUrl ? body.githubUrl.trim() : null,
          thumbnailUrl: body.thumbnailUrl || body.coverImage || null,
          coverImage: body.coverImage || body.thumbnailUrl || null,
          galleryImages: body.galleryImages || null,
          videoUrl: body.videoUrl || null,
          features: body.features || [],
          benefits: body.benefits || [],
          targetAudience: body.targetAudience || null,
          technologies: body.technologies || [],
          status: body.status || "PUBLISHED",
          featured: Boolean(body.featured),
          displayOrder: Number(body.displayOrder) || 0,
          seoTitle: body.seoTitle || null,
          seoDescription: body.seoDescription || null,
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

      const existing = await prisma.portfolioProject.findUnique({
        where: { id },
      });

      if (!existing) {
        ResponseBuilder.notFound(res, "Showcase project not found");
        return;
      }

      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title.trim();
      if (body.slug !== undefined) updateData.slug = generateSlug(body.slug);
      if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null;
      if (body.tagline !== undefined) updateData.tagline = body.tagline?.trim() || null;
      if (body.description !== undefined) updateData.description = body.description.trim();
      if (body.fullDescription !== undefined) updateData.fullDescription = body.fullDescription?.trim() || null;
      if (body.projectType !== undefined) updateData.projectType = body.projectType;
      if (body.liveUrl !== undefined) updateData.liveUrl = body.liveUrl?.trim() || null;
      if (body.githubUrl !== undefined) updateData.githubUrl = body.githubUrl?.trim() || null;
      if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl || null;
      if (body.coverImage !== undefined) updateData.coverImage = body.coverImage || null;
      if (body.galleryImages !== undefined) updateData.galleryImages = body.galleryImages;
      if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl || null;
      if (body.features !== undefined) updateData.features = body.features;
      if (body.benefits !== undefined) updateData.benefits = body.benefits;
      if (body.targetAudience !== undefined) updateData.targetAudience = body.targetAudience || null;
      if (body.technologies !== undefined) updateData.technologies = body.technologies;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
      if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder) || 0;
      if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null;
      if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription || null;

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

      if (!Array.isArray(items)) {
        ResponseBuilder.badRequest(res, "Items must be an array of { id, displayOrder }");
        return;
      }

      await Promise.all(
        items.map((item: { id: string; displayOrder: number }) =>
          prisma.portfolioProject.update({
            where: { id: item.id },
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
