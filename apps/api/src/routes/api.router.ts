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
import { aiRouter } from "../modules/ai/index.js";
import { projectInquiriesRouter, projectInquiriesController } from "../modules/project-inquiries/index.js";
import { showcaseProjectsRouter, showcaseProjectsController } from "../modules/showcase-projects/index.js";
import { automationRoutes, automationController } from "../modules/automation/index.js";
import { contactRoutes, contactController } from "../modules/contact/index.js";
import { newsletterRoutes, newsletterController } from "../modules/newsletter/index.js";

export const apiRouter = Router();

// Public Visitor Endpoints
apiRouter.post("/public/project-inquiries", projectInquiriesController.createPublicInquiry);
apiRouter.post("/public/inquiries", projectInquiriesController.createPublicInquiry);
apiRouter.post("/public/contact", (req, res, next) => { contactController.submit(req, res).catch(next); });
apiRouter.post("/contact", (req, res, next) => { contactController.submit(req, res).catch(next); });
apiRouter.post("/newsletter/subscribe", (req, res, next) => { newsletterController.subscribe(req, res).catch(next); });
apiRouter.post("/marketing/subscribers", (req, res, next) => { newsletterController.subscribe(req, res).catch(next); });
apiRouter.post("/automation/callback", (req, res, next) => { automationController.handleCallback(req, res).catch(next); });
apiRouter.post("/webhooks/n8n", (req, res, next) => { automationController.handleCallback(req, res).catch(next); });
apiRouter.get("/public/projects", showcaseProjectsController.getPublicProjects);
apiRouter.get("/public/projects/:idOrSlug", showcaseProjectsController.getPublicProjectByIdOrSlug);
apiRouter.get("/public/showcase-projects", showcaseProjectsController.getPublicProjects);
apiRouter.get("/public/showcase-projects/categories", showcaseProjectsController.getCategories);

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
apiRouter.use("/showcase-projects", showcaseProjectsRouter);
apiRouter.use("/inquiries", projectInquiriesRouter);
apiRouter.use("/project-inquiries", projectInquiriesRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/audit-logs", auditRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/automation", automationRoutes);
apiRouter.use("/contact-messages", contactRoutes);
apiRouter.use("/newsletter", newsletterRoutes);
apiRouter.use("/marketing", newsletterRoutes);




