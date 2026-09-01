import { z } from "zod";

export const publicCreateProjectInquirySchema = z.object({
  visitorName: z
    .string({ required_error: "Full Name is required" })
    .trim()
    .min(2, "Full Name must be at least 2 characters")
    .max(120, "Full Name must not exceed 120 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
    .max(255, "Email must not exceed 255 characters"),
  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .min(5, "Phone number must be at least 5 characters")
    .max(50, "Phone number must not exceed 50 characters"),
  companyName: z
    .string()
    .trim()
    .max(150, "Company name must not exceed 150 characters")
    .optional()
    .nullable(),
  country: z
    .string()
    .trim()
    .max(100, "Country must not exceed 100 characters")
    .optional()
    .nullable(),
  projectId: z.string().trim().optional().nullable(),
  projectNameSnapshot: z
    .string({ required_error: "Project Name is required" })
    .trim()
    .min(1, "Project Name is required")
    .max(200, "Project Name must not exceed 200 characters"),
  category: z
    .string()
    .trim()
    .max(100, "Category must not exceed 100 characters")
    .optional()
    .nullable(),
  message: z
    .string({ required_error: "Message / Requirements are required" })
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(5000, "Message must not exceed 5000 characters"),
  preferredContactMethod: z
    .enum(["WHATSAPP", "EMAIL", "PHONE_CALL"])
    .default("WHATSAPP"),
  budget: z
    .string()
    .trim()
    .max(100, "Budget must not exceed 100 characters")
    .optional()
    .nullable(),
  preferredContactTime: z
    .string()
    .trim()
    .max(100, "Preferred Contact Time must not exceed 100 characters")
    .optional()
    .nullable(),
});

export const updateProjectInquirySchema = z.object({
  status: z
    .enum(["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "CLOSED", "SPAM"])
    .optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  adminNotes: z.string().trim().max(10000).optional().nullable(),
});

export const recordContactAttemptSchema = z.object({
  contactMethod: z.enum(["WHATSAPP", "EMAIL", "PHONE_CALL"], {
    required_error: "Contact method is required",
  }),
  notes: z.string().trim().max(2000).optional().nullable(),
  updateStatusToContacted: z.boolean().optional().default(true),
});

export const addInquiryNoteSchema = z.object({
  notes: z
    .string({ required_error: "Note text is required" })
    .trim()
    .min(1, "Note cannot be empty")
    .max(10000, "Note exceeds maximum character limit"),
});

export const projectInquiryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  category: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  sortBy: z
    .enum(["createdAt", "visitorName", "email", "status", "priority", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
