import { z } from "zod";
import { ApplicationStatus, VerificationStatus } from "@prisma/client";
import { paginationQuerySchema } from "../../core/validation/validation.schema.js";

/**
 * Route parameter validation schema for Application ID.
 */
export const applicationIdParamSchema = z.object({
  applicationId: z
    .string({ required_error: "Application ID is required" })
    .min(1, { message: "Application ID cannot be empty" }),
});

/**
 * Route parameter validation schema for Question ID.
 */
export const questionIdParamSchema = z.object({
  questionId: z
    .string({ required_error: "Question ID is required" })
    .min(1, { message: "Question ID cannot be empty" }),
});

/**
 * Query filters and search validation schema for listing applications.
 */
export const applicationQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).optional(),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "fullName", "email", "applicationStatus", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Single answer submission schema inside creation or answer submission DTO.
 */
export const answerItemSchema = z.object({
  questionId: z.string({ required_error: "Question ID is required" }).min(1),
  answer: z.string({ required_error: "Answer text is required" }).trim().min(1, { message: "Answer cannot be empty" }),
});

/**
 * Member Application creation schema.
 */
export const createApplicationSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(100, { message: "Full name cannot exceed 100 characters" }),
  fatherName: z
    .string({ required_error: "Father name is required" })
    .trim()
    .min(2, { message: "Father name must be at least 2 characters" })
    .max(100, { message: "Father name cannot exceed 100 characters" }),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address format" })
    .toLowerCase(),
  phoneNumber: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .min(5, { message: "Phone number must be at least 5 characters" })
    .max(30, { message: "Phone number cannot exceed 30 characters" }),
  whatsappNumber: z
    .string({ required_error: "WhatsApp number is required" })
    .trim()
    .min(5, { message: "WhatsApp number must be at least 5 characters" })
    .max(30, { message: "WhatsApp number cannot exceed 30 characters" }),
  country: z
    .string({ required_error: "Country is required" })
    .trim()
    .min(2, { message: "Country name is required" }),
  city: z
    .string({ required_error: "City is required" })
    .trim()
    .min(2, { message: "City name is required" }),
  address: z
    .string({ required_error: "Address is required" })
    .trim()
    .min(5, { message: "Address must be at least 5 characters" }),
  cnicNumber: z.string().trim().max(30).optional().nullable(),
  cnicIssueDate: z.coerce.date().optional().nullable(),
  cnicExpiryDate: z.coerce.date().optional().nullable(),
  currentProfession: z.string().trim().max(100).optional().nullable(),
  currentQualification: z.string().trim().max(100).optional().nullable(),
  skillsDescription: z.string().trim().max(1000).optional().nullable(),
  linkedinUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  instagramUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  tiktokUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  githubUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  heardAboutSTSolutions: z
    .string({ required_error: "Heard about ST-Solutions field is required" })
    .trim()
    .min(2, { message: "Please specify how you heard about ST-Solutions" }),
  joiningPurpose: z
    .string({ required_error: "Joining purpose is required" })
    .trim()
    .min(5, { message: "Please describe your joining purpose" }),
  profileImageUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  answers: z.array(answerItemSchema).optional(),
});

/**
 * Application update schema.
 */
export const updateApplicationSchema = createApplicationSchema.partial();

/**
 * Review application schema.
 */
export const reviewApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus, { required_error: "Application status is required" }),
  reviewNotes: z.string().trim().max(1000).optional(),
});

/**
 * Approve application schema.
 */
export const approveApplicationSchema = z.object({
  reviewNotes: z.string().trim().max(1000).optional(),
});

/**
 * Reject application schema.
 */
export const rejectApplicationSchema = z.object({
  rejectionReason: z
    .string({ required_error: "Rejection reason is required" })
    .trim()
    .min(5, { message: "Rejection reason must be at least 5 characters long" })
    .max(1000, { message: "Rejection reason cannot exceed 1000 characters" }),
  reviewNotes: z.string().trim().max(1000).optional(),
});

/**
 * Submit answers schema.
 */
export const submitAnswersSchema = z.object({
  answers: z
    .array(answerItemSchema, { required_error: "Answers array is required" })
    .min(1, { message: "At least one answer must be submitted" }),
});

/**
 * Create Application Question schema.
 */
export const createQuestionSchema = z.object({
  question: z
    .string({ required_error: "Question text is required" })
    .trim()
    .min(3, { message: "Question text must be at least 3 characters long" })
    .max(500, { message: "Question text cannot exceed 500 characters" }),
  orderNumber: z.number().int().min(1, { message: "Order number must be at least 1" }),
  isActive: z.boolean().optional().default(true),
});

/**
 * Verification update schema.
 */
export const verificationSchema = z.object({
  verificationStatus: z.nativeEnum(VerificationStatus, { required_error: "Verification status is required" }),
  verificationNotes: z.string().trim().max(1000).optional().nullable(),
});

/**
 * Onboard Applicant schema.
 */
export const onboardApplicantSchema = z.object({
  memberRank: z.string().trim().max(100).optional(),
  initialPassword: z
    .string()
    .min(8, { message: "Initial password must be at least 8 characters long" })
    .optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type ApplicationQueryInput = z.infer<typeof applicationQuerySchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;
export type ApproveApplicationInput = z.infer<typeof approveApplicationSchema>;
export type RejectApplicationInput = z.infer<typeof rejectApplicationSchema>;
export type SubmitAnswersInput = z.infer<typeof submitAnswersSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type VerificationInput = z.infer<typeof verificationSchema>;
export type OnboardApplicantInput = z.infer<typeof onboardApplicantSchema>;
