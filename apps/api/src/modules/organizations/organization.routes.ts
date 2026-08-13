import { Router } from "express";
import { authenticate, validate } from "../../middlewares/index.js";
import { organizationController } from "./organization.controller.js";
import {
  acceptInvitationSchema,
  createOrganizationSchema,
  inviteMemberSchema,
  memberIdParamSchema,
  organizationIdParamSchema,
  updateMemberRoleSchema,
  updateOrganizationSchema,
} from "./organization.validation.js";

export const organizationsRouter = Router();

organizationsRouter.use(authenticate());

organizationsRouter.get("/", organizationController.getUserOrganizations);
organizationsRouter.post("/", validate({ body: createOrganizationSchema }), organizationController.createOrganization);
organizationsRouter.post("/invitations/accept", validate({ body: acceptInvitationSchema }), organizationController.acceptInvitation);

organizationsRouter.get("/:id", validate({ params: organizationIdParamSchema }), organizationController.getOrganizationById);
organizationsRouter.patch("/:id", validate({ params: organizationIdParamSchema, body: updateOrganizationSchema }), organizationController.updateOrganization);

organizationsRouter.get("/:id/members", validate({ params: organizationIdParamSchema }), organizationController.getMembers);
organizationsRouter.post("/:id/invitations", validate({ params: organizationIdParamSchema, body: inviteMemberSchema }), organizationController.inviteMember);
organizationsRouter.patch("/:id/members/:memberId/role", validate({ params: memberIdParamSchema, body: updateMemberRoleSchema }), organizationController.updateMemberRole);
organizationsRouter.delete("/:id/members/:memberId", validate({ params: memberIdParamSchema }), organizationController.removeMember);
