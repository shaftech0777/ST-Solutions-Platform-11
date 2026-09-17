import { NextFunction, Request, Response } from "express";
import { AccountType } from "@prisma/client";
import { ResponseBuilder } from "../../core/responses/index.js";
import { AuthenticatedRequest } from "../../core/security/security.types.js";
import { auditService } from "../audit/audit.service.js";
import { applicantsService as defaultApplicantsService, ApplicantsService } from "./applicants.service.js";
import {
  CreateQuestionInput,
  ReorderQuestionsInput,
  UpdateQuestionInput,
} from "./applicants.types.js";
import {
  ApproveApplicationInput,
  ApplicationQueryInput,
  CreateApplicationInput,
  OnboardApplicantInput,
  RejectApplicationInput,
  ReviewApplicationInput,
  SubmitAnswersInput,
  UpdateApplicationInput,
  VerificationInput,
} from "./applicants.validation.js";

/**
 * Express Controller handling Applicants & Member Onboarding HTTP endpoints.
 */
export class ApplicantsController {
  private readonly applicantsService: ApplicantsService;

  constructor(applicantsService: ApplicantsService = defaultApplicantsService) {
    this.applicantsService = applicantsService;
  }

  /**
   * GET /api/v1/applicants
   * Retrieves paginated applications list.
   */
  public getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ApplicationQueryInput;
      const result = await this.applicantsService.getApplications(query);

      ResponseBuilder.paginated(res, result.items, {
        page: result.page,
        limit: result.limit,
        totalRecords: result.totalRecords,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/applicants/questions
   * Retrieves application questions.
   */
  public getQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const onlyActive = req.query.all !== "true";
      const questions = await this.applicantsService.getQuestions(onlyActive);

      ResponseBuilder.success(res, questions, {
        message: "Application questions retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/applicants/questions
   * Creates a new application question.
   */
  public createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateQuestionInput;
      const question = await this.applicantsService.createQuestion(body);

      ResponseBuilder.created(res, question, {
        message: "Application question created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/applicants/questions/:questionId
   * Updates an application question.
   */
  public updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { questionId } = req.params;
      const body = req.body as UpdateQuestionInput;
      const question = await this.applicantsService.updateQuestion(questionId, body);

      ResponseBuilder.success(res, question, {
        message: "Application question updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/applicants/questions/:questionId
   * Deletes or deactivates an application question.
   */
  public deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { questionId } = req.params;
      const result = await this.applicantsService.deleteQuestion(questionId);

      ResponseBuilder.success(res, result, {
        message: "Application question deleted/deactivated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/applicants/questions/reorder
   * Reorders application questions.
   */
  public reorderQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as ReorderQuestionsInput;
      const questions = await this.applicantsService.reorderQuestions(body);

      ResponseBuilder.success(res, questions, {
        message: "Application questions reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/applicants/:applicationId
   * Retrieves a single application detail by ID.
   */
  public getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { applicationId } = req.params;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const application = await this.applicantsService.getApplicationById(applicationId, actor);

      ResponseBuilder.success(res, application, {
        message: "Member application details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/applicants
   * Creates/Submits a new member application.
   */
  public createApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateApplicationInput;
      const application = await this.applicantsService.createApplication(body);

      ResponseBuilder.created(res, application, {
        message: "Member application submitted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/applicants/:applicationId
   * Updates fields on an existing application.
   */
  public updateApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { applicationId } = req.params;
      const body = req.body as UpdateApplicationInput;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const updated = await this.applicantsService.updateApplication(applicationId, body, actor);

      ResponseBuilder.success(res, updated, {
        message: "Member application updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/applicants/:applicationId/review
   * Reviews application and sets status & notes.
   */
  public reviewApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { applicationId } = req.params;
      const body = req.body as ReviewApplicationInput;

      const updated = await this.applicantsService.reviewApplication(
        applicationId,
        body,
        { userId: authReq.user!.userId }
      );

      ResponseBuilder.success(res, updated, {
        message: "Member application reviewed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/applicants/:applicationId/approve
   * Approves a member application.
   */
  public approveApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { applicationId } = req.params;
      const body = req.body as ApproveApplicationInput;

      const updated = await this.applicantsService.approveApplication(
        applicationId,
        body,
        { userId: authReq.user!.userId }
      );

      ResponseBuilder.success(res, updated, {
        message: "Member application approved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/applicants/:applicationId/reject
   * Rejects a member application with reason.
   */
  public rejectApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { applicationId } = req.params;
      const body = req.body as RejectApplicationInput;

      const updated = await this.applicantsService.rejectApplication(
        applicationId,
        body,
        { userId: authReq.user!.userId }
      );

      ResponseBuilder.success(res, updated, {
        message: "Member application rejected successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/applicants/:applicationId/answers
   * Submits or updates answers for an application.
   */
  public submitAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const body = req.body as SubmitAnswersInput;

      const application = await this.applicantsService.submitAnswers(applicationId, body);

      ResponseBuilder.success(res, application, {
        message: "Application answers submitted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/applicants/:applicationId/answers
   * Retrieves answers submitted for an application.
   */
  public getAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const answers = await this.applicantsService.getAnswers(applicationId);

      ResponseBuilder.success(res, answers, {
        message: "Application answers retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/applicants/:applicationId/verification
   * Updates verification status for an application.
   */
  public updateVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { applicationId } = req.params;
      const body = req.body as VerificationInput;

      const result = await this.applicantsService.updateVerification(
        applicationId,
        body,
        { userId: authReq.user!.userId }
      );

      ResponseBuilder.success(res, result, {
        message: "Member application verification status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/applicants/:applicationId/onboard
   * Onboards an approved applicant into an active member account.
   */
  public onboardApplicant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { applicationId } = req.params;
      const body = req.body as OnboardApplicantInput;
      const actor = authReq.user
        ? { userId: authReq.user.userId, accountType: authReq.user.accountType as AccountType }
        : undefined;

      const result = await this.applicantsService.onboardApplicant(applicationId, body, actor);

      await auditService.recordEvent(
        req,
        "APPLICANT_ONBOARDED",
        `Onboarded approved applicant ${applicationId} to Member user ${result.userId}`
      );

      ResponseBuilder.success(res, result, {
        message: "Approved applicant successfully onboarded as a active Member",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/applicants/:applicationId
   * Permanently deletes an application.
   */
  public deleteApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { applicationId } = req.params;

      const result = await this.applicantsService.deleteApplication(
        applicationId,
        authReq.user ? { userId: authReq.user.userId } : undefined
      );

      await auditService.recordEvent(
        req,
        "APPLICANT_DELETED",
        `Permanently deleted member application ${applicationId}`
      );

      ResponseBuilder.success(res, result, {
        message: "Member application permanently deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const applicantsController = new ApplicantsController();

