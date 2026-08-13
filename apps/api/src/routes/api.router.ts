import { Router } from "express";
import { authRouter } from "../modules/auth/index.js";
import { permissionsRouter } from "../modules/permissions/index.js";
import { rolesRouter } from "../modules/roles/index.js";
import { usersRouter } from "../modules/users/index.js";
import { organizationsRouter } from "../modules/organizations/index.js";
import { workspacesRouter } from "../modules/workspaces/index.js";
import { applicantsRouter } from "../modules/applicants/index.js";
import { membersRouter } from "../modules/members/index.js";
import { clientsRouter } from "../modules/clients/index.js";
import { clientRequestsRouter } from "../modules/client-requests/index.js";
import { projectsRouter } from "../modules/projects/index.js";
import { paymentsRouter } from "../modules/payments/index.js";
import { settingsRouter } from "../modules/settings/index.js";
import { auditRouter } from "../modules/audit/index.js";
import { notificationsRouter } from "../modules/notifications/index.js";

export const apiRouter = Router();

// Mount Domain Module Routers
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/roles", rolesRouter);
apiRouter.use("/permissions", permissionsRouter);
apiRouter.use("/organizations", organizationsRouter);
apiRouter.use("/workspaces", workspacesRouter);
apiRouter.use("/applicants", applicantsRouter);
apiRouter.use("/members", membersRouter);
apiRouter.use("/clients", clientsRouter);
apiRouter.use("/client-requests", clientRequestsRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/audit-logs", auditRouter);
apiRouter.use("/notifications", notificationsRouter);



