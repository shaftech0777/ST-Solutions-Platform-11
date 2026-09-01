import { Router } from "express";
import { authenticate, requireAccountType } from "../../middlewares/index.js";
import { projectInquiriesController } from "./project-inquiries.controller.js";

export const projectInquiriesRouter = Router();

/**
 * Public visitor submission endpoints:
 * POST /api/v1/inquiries/public
 * POST /api/v1/public/project-inquiries (also mounted on public router)
 */
projectInquiriesRouter.post("/public", projectInquiriesController.createPublicInquiry);

/**
 * Protected Admin / Sub-Admin Inquiry Management Endpoints
 */
projectInquiriesRouter.use(authenticate());
projectInquiriesRouter.use(requireAccountType("ADMIN", "SUB_ADMIN"));

/**
 * @route GET /api/v1/inquiries
 * @desc Retrieves paginated list of project inquiries
 * @access Protected (ADMIN, SUB_ADMIN)
 */
projectInquiriesRouter.get("/", projectInquiriesController.getInquiries);

/**
 * @route GET /api/v1/inquiries/statistics
 * @desc Retrieves inquiry telemetry statistics
 * @access Protected (ADMIN, SUB_ADMIN)
 */
projectInquiriesRouter.get("/statistics", projectInquiriesController.getStatistics);

/**
 * @route GET /api/v1/inquiries/:id
 * @desc Retrieves single inquiry detail with activity history
 * @access Protected (ADMIN, SUB_ADMIN)
 */
projectInquiriesRouter.get("/:id", projectInquiriesController.getInquiryById);

/**
 * @route PATCH /api/v1/inquiries/:id
 * @desc Updates inquiry status, priority, or notes
 * @access Protected (ADMIN, SUB_ADMIN)
 */
projectInquiriesRouter.patch("/:id", projectInquiriesController.updateInquiry);

/**
 * @route POST /api/v1/inquiries/:id/contact
 * @desc Records a contact attempt (WhatsApp, Email, Phone) and updates contactedAt
 * @access Protected (ADMIN, SUB_ADMIN)
 */
projectInquiriesRouter.post("/:id/contact", projectInquiriesController.recordContact);

/**
 * @route POST /api/v1/inquiries/:id/notes
 * @desc Appends internal admin notes to inquiry
 * @access Protected (ADMIN, SUB_ADMIN)
 */
projectInquiriesRouter.post("/:id/notes", projectInquiriesController.addNote);

/**
 * @route DELETE /api/v1/inquiries/:id
 * @desc Deletes an inquiry
 * @access Protected (ADMIN only)
 */
projectInquiriesRouter.delete("/:id", requireAccountType("ADMIN"), projectInquiriesController.deleteInquiry);
