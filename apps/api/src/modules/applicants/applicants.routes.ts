import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { applicantsController } from "./applicants.controller.js";
import {
  applicationIdParamSchema,
  applicationQuerySchema,
  approveApplicationSchema,
  createApplicationSchema,
  createQuestionSchema,
  onboardApplicantSchema,
  questionIdParamSchema,
  rejectApplicationSchema,
  reorderQuestionsSchema,
  reviewApplicationSchema,
  submitAnswersSchema,
  updateApplicationSchema,
  updateQuestionSchema,
  verificationSchema,
} from "./applicants.validation.js";

export const applicantsRouter = Router();

/**
 * @route GET /applicants/questions
 * @desc Retrieves active application questions for applicants
 * @access Public / Unprotected
 */
applicantsRouter.get("/questions", applicantsController.getQuestions);

/**
 * @route POST /applicants
 * @desc Submits a new member application
 * @access Public / Unprotected
 */
applicantsRouter.post(
  "/",
  validate({ body: createApplicationSchema }),
  applicantsController.createApplication
);

// Protect remaining application management routes with Authentication
applicantsRouter.use(authenticate());

/**
 * @route GET /applicants
 * @desc Retrieves paginated list of member applications
 * @access Protected (Requires applicants.read permission or ADMIN)
 */
applicantsRouter.get(
  "/",
  requirePermission("applicants.read"),
  validate({ query: applicationQuerySchema }),
  applicantsController.getApplications
);

/**
 * @route POST /applicants/questions
 * @desc Creates a new application question
 * @access Protected (Requires applicants.update permission or ADMIN)
 */
applicantsRouter.post(
  "/questions",
  requirePermission("applicants.update"),
  validate({ body: createQuestionSchema }),
  applicantsController.createQuestion
);

/**
 * @route PATCH /applicants/questions/:questionId
 * @desc Updates an existing application question
 * @access Protected (Requires applicants.update permission or ADMIN)
 */
applicantsRouter.patch(
  "/questions/:questionId",
  requirePermission("applicants.update"),
  validate({ params: questionIdParamSchema, body: updateQuestionSchema }),
  applicantsController.updateQuestion
);

/**
 * @route DELETE /applicants/questions/:questionId
 * @desc Deletes or deactivates an application question
 * @access Protected (Requires applicants.update permission or ADMIN)
 */
applicantsRouter.delete(
  "/questions/:questionId",
  requirePermission("applicants.update"),
  validate({ params: questionIdParamSchema }),
  applicantsController.deleteQuestion
);

/**
 * @route POST /applicants/questions/reorder
 * @desc Reorders application questions
 * @access Protected (Requires applicants.update permission or ADMIN)
 */
applicantsRouter.post(
  "/questions/reorder",
  requirePermission("applicants.update"),
  validate({ body: reorderQuestionsSchema }),
  applicantsController.reorderQuestions
);

applicantsRouter.put(
  "/questions/reorder",
  requirePermission("applicants.update"),
  validate({ body: reorderQuestionsSchema }),
  applicantsController.reorderQuestions
);

/**
 * @route GET /applicants/:applicationId
 * @desc Retrieves single application detail
 * @access Protected (Requires applicants.read permission or ADMIN)
 */
applicantsRouter.get(
  "/:applicationId",
  requirePermission("applicants.read"),
  validate({ params: applicationIdParamSchema }),
  applicantsController.getApplicationById
);

/**
 * @route PATCH /applicants/:applicationId
 * @desc Updates fields on an existing application
 * @access Protected (Requires applicants.update permission or ADMIN)
 */
applicantsRouter.patch(
  "/:applicationId",
  requirePermission("applicants.update"),
  validate({ params: applicationIdParamSchema, body: updateApplicationSchema }),
  applicantsController.updateApplication
);

/**
 * @route POST /applicants/:applicationId/review
 * @desc Reviews an application and sets status/notes
 * @access Protected (Requires applicants.review permission or ADMIN)
 */
applicantsRouter.post(
  "/:applicationId/review",
  requirePermission("applicants.review"),
  validate({ params: applicationIdParamSchema, body: reviewApplicationSchema }),
  applicantsController.reviewApplication
);

/**
 * @route POST /applicants/:applicationId/approve
 * @desc Approves a member application
 * @access Protected (Requires applicants.approve permission or ADMIN)
 */
applicantsRouter.post(
  "/:applicationId/approve",
  requirePermission("applicants.approve"),
  validate({ params: applicationIdParamSchema, body: approveApplicationSchema }),
  applicantsController.approveApplication
);

/**
 * @route POST /applicants/:applicationId/reject
 * @desc Rejects a member application with reason
 * @access Protected (Requires applicants.reject permission or ADMIN)
 */
applicantsRouter.post(
  "/:applicationId/reject",
  requirePermission("applicants.reject"),
  validate({ params: applicationIdParamSchema, body: rejectApplicationSchema }),
  applicantsController.rejectApplication
);

/**
 * @route POST /applicants/:applicationId/answers
 * @desc Submits or updates answers for an application
 * @access Protected
 */
applicantsRouter.post(
  "/:applicationId/answers",
  validate({ params: applicationIdParamSchema, body: submitAnswersSchema }),
  applicantsController.submitAnswers
);

/**
 * @route GET /applicants/:applicationId/answers
 * @desc Retrieves answers for an application
 * @access Protected (Requires applicants.read permission or ADMIN)
 */
applicantsRouter.get(
  "/:applicationId/answers",
  requirePermission("applicants.read"),
  validate({ params: applicationIdParamSchema }),
  applicantsController.getAnswers
);

/**
 * @route POST /applicants/:applicationId/verification
 * @desc Updates verification status for an application
 * @access Protected (Requires verification.review permission or ADMIN)
 */
applicantsRouter.post(
  "/:applicationId/verification",
  requirePermission("verification.review"),
  validate({ params: applicationIdParamSchema, body: verificationSchema }),
  applicantsController.updateVerification
);

/**
 * @route POST /applicants/:applicationId/onboard
 * @desc Converts an approved applicant into an active member user
 * @access Protected (Requires members.onboard permission or ADMIN)
 */
applicantsRouter.post(
  "/:applicationId/onboard",
  requirePermission("members.onboard"),
  validate({ params: applicationIdParamSchema, body: onboardApplicantSchema }),
  applicantsController.onboardApplicant
);

/**
 * @route DELETE /applicants/:applicationId
 * @desc Permanently deletes a member application
 * @access Protected (Requires applicants.delete permission or ADMIN)
 */
applicantsRouter.delete(
  "/:applicationId",
  requirePermission("applicants.delete"),
  validate({ params: applicationIdParamSchema }),
  applicantsController.deleteApplication
);
