import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares/index.js";
import { membersController } from "./members.controller.js";
import {
  memberIdParamSchema,
  memberQuerySchema,
  updateMemberProfileSchema,
  updateMemberRankSchema,
  updateMemberStatusSchema,
} from "./members.validation.js";

export const membersRouter = Router();

// Protect all member management routes with Authentication
membersRouter.use(authenticate());

/**
 * @route GET /members
 * @desc Retrieves paginated list of members
 * @access Protected (Requires members.read permission or ADMIN)
 */
membersRouter.get(
  "/",
  requirePermission("members.read"),
  validate({ query: memberQuerySchema }),
  membersController.getMembers
);

/**
 * @route GET /members/statistics
 * @desc Retrieves high-level aggregate statistics for members
 * @access Protected (Requires members.read permission or ADMIN)
 */
membersRouter.get(
  "/statistics",
  requirePermission("members.read"),
  membersController.getStatistics
);

/**
 * @route GET /members/me
 * @desc Retrieves member profile of currently authenticated user
 * @access Protected
 */
membersRouter.get("/me", membersController.getMe);

/**
 * @route GET /members/:memberId
 * @desc Retrieves detailed information for a single member
 * @access Protected (Requires members.read permission or ADMIN)
 */
membersRouter.get(
  "/:memberId",
  requirePermission("members.read"),
  validate({ params: memberIdParamSchema }),
  membersController.getMemberById
);

/**
 * @route PATCH /members/:memberId/profile
 * @desc Updates member profile information
 * @access Protected (Requires members.update permission, self, or ADMIN)
 */
membersRouter.patch(
  "/:memberId/profile",
  requirePermission("members.update"),
  validate({ params: memberIdParamSchema, body: updateMemberProfileSchema }),
  membersController.updateProfile
);

/**
 * @route PATCH /members/:memberId/status
 * @desc Updates member status
 * @access Protected (Requires members.manage_status permission or ADMIN)
 */
membersRouter.patch(
  "/:memberId/status",
  requirePermission("members.manage_status"),
  validate({ params: memberIdParamSchema, body: updateMemberStatusSchema }),
  membersController.updateStatus
);

/**
 * @route PATCH /members/:memberId/rank
 * @desc Updates member rank
 * @access Protected (Requires members.manage_rank permission or ADMIN)
 */
membersRouter.patch(
  "/:memberId/rank",
  requirePermission("members.manage_rank"),
  validate({ params: memberIdParamSchema, body: updateMemberRankSchema }),
  membersController.updateRank
);

/**
 * @route DELETE /members/:memberId
 * @desc Deactivates / removes a member
 * @access Protected (Requires members.delete permission or ADMIN)
 */
membersRouter.delete(
  "/:memberId",
  requirePermission("members.delete"),
  validate({ params: memberIdParamSchema }),
  membersController.deactivateMember
);
