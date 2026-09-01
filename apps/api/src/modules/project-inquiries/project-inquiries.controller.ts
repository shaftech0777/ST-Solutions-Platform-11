import { NextFunction, Request, Response } from "express";
import { ResponseBuilder } from "../../core/responses/index.js";
import {
  projectInquiriesService as defaultService,
  ProjectInquiriesService,
} from "./project-inquiries.service.js";
import {
  addInquiryNoteSchema,
  projectInquiryQuerySchema,
  publicCreateProjectInquirySchema,
  recordContactAttemptSchema,
  updateProjectInquirySchema,
} from "./project-inquiries.validation.js";

export class ProjectInquiriesController {
  private readonly service: ProjectInquiriesService;

  constructor(service: ProjectInquiriesService = defaultService) {
    this.service = service;
  }

  /**
   * POST /api/v1/public/project-inquiries or /api/v1/inquiries/public
   * Public endpoint for visitors submitting project inquiries.
   */
  public createPublicInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedInput = publicCreateProjectInquirySchema.parse(req.body);
      const result = await this.service.createPublicInquiry(validatedInput as any);

      ResponseBuilder.created(res, result, {
        message:
          "Thank you! Your project inquiry has been received. An ST-Solutions architect will contact you shortly.",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/inquiries
   * Retrieves paginated list of project inquiries.
   */
  public getInquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = projectInquiryQuerySchema.parse(req.query);
      const result = await this.service.getInquiries(query as any);

      ResponseBuilder.paginated(res, result.items, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalRecords: result.pagination.total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/inquiries/statistics
   * Returns statistics counts.
   */
  public getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStatistics();
      ResponseBuilder.success(res, stats, {
        message: "Project inquiries statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/inquiries/:id
   * Retrieves single inquiry with history.
   */
  public getInquiryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const result = await this.service.getInquiryById(id);

      ResponseBuilder.success(res, result, {
        message: "Project inquiry retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/inquiries/:id
   * Updates status, priority, or admin notes.
   */
  public updateInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validatedInput = updateProjectInquirySchema.parse(req.body);
      const actorId = (req as any).user?.id || (req as any).user?.userId;

      const result = await this.service.updateInquiry(id, validatedInput as any, actorId);

      ResponseBuilder.success(res, result, {
        message: "Project inquiry updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/inquiries/:id/contact
   * Records a contact attempt (WhatsApp, Email, Phone Call).
   */
  public recordContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validatedInput = recordContactAttemptSchema.parse(req.body);
      const actorId = (req as any).user?.id || (req as any).user?.userId;

      const result = await this.service.recordContactAttempt(id, validatedInput as any, actorId);

      ResponseBuilder.success(res, result, {
        message: `Contact attempt via ${validatedInput.contactMethod} recorded successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/inquiries/:id/notes
   * Appends internal notes to inquiry.
   */
  public addNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validatedInput = addInquiryNoteSchema.parse(req.body);
      const actorId = (req as any).user?.id || (req as any).user?.userId;

      const result = await this.service.addNote(id, validatedInput, actorId);

      ResponseBuilder.success(res, result, {
        message: "Administrative note added successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/inquiries/:id
   * Deletes an inquiry (ADMIN only).
   */
  public deleteInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const actorId = (req as any).user?.id || (req as any).user?.userId;

      const result = await this.service.deleteInquiry(id, actorId);

      ResponseBuilder.success(res, result, {
        message: "Project inquiry deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const projectInquiriesController = new ProjectInquiriesController();
