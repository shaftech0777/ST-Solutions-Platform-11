import { Router } from "express";
import { authenticate, validate } from "../../middlewares/index.js";
import { workspaceController } from "./workspace.controller.js";
import {
  addWorkspaceMemberSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
} from "./workspace.validation.js";

export const workspacesRouter = Router();

workspacesRouter.use(authenticate());

workspacesRouter.get("/", workspaceController.getOrganizationWorkspaces);
workspacesRouter.post("/", validate({ body: createWorkspaceSchema }), workspaceController.createWorkspace);

workspacesRouter.get("/:id", validate({ params: workspaceIdParamSchema }), workspaceController.getWorkspaceById);
workspacesRouter.patch("/:id", validate({ params: workspaceIdParamSchema, body: updateWorkspaceSchema }), workspaceController.updateWorkspace);
workspacesRouter.delete("/:id", validate({ params: workspaceIdParamSchema }), workspaceController.deleteWorkspace);

workspacesRouter.post("/:id/members", validate({ params: workspaceIdParamSchema, body: addWorkspaceMemberSchema }), workspaceController.addMember);
