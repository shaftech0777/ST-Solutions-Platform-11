import {
  ApplicationAnswerSummary,
  ApplicationQuestionSummary,
  ApplicationResponse,
  MemberProfileSummary,
  MemberVerificationSummary,
} from "./applicants.types.js";

/**
 * Transforms raw database MemberApplication record into a sanitized public ApplicationResponse payload.
 */
export function sanitizeApplicationResponse(
  app: {
    id: string;
    fullName: string;
    fatherName: string;
    email: string;
    phoneNumber: string;
    whatsappNumber: string;
    country: string;
    city: string;
    address: string;
    cnicNumber: string | null;
    cnicIssueDate: Date | null;
    cnicExpiryDate: Date | null;
    currentProfession: string | null;
    currentQualification: string | null;
    skillsDescription: string | null;
    linkedinUrl: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    tiktokUrl: string | null;
    githubUrl: string | null;
    heardAboutSTSolutions: string;
    joiningPurpose: string;
    profileImageUrl: string | null;
    applicationStatus: any;
    verificationStatus: any;
    reviewedById?: string | null;
    reviewNotes?: string | null;
    rejectionReason?: string | null;
    answers?: {
      id: string;
      questionId: string;
      answer: string;
      createdAt?: Date;
      question?: {
        question: string;
      };
    }[];
    verifications?: {
      id: string;
      verificationStatus: any;
      verifiedById: string | null;
      verificationNotes: string | null;
      createdAt: Date;
      updatedAt: Date;
    }[];
    profiles?: {
      id: string;
      userId: string | null;
      memberRank: string | null;
      joinedAt: Date | null;
    }[];
    createdAt: Date;
    updatedAt: Date;
  },
  options?: {
    includeReviewerDetails?: boolean;
  }
): ApplicationResponse {
  const includeReviewer = options?.includeReviewerDetails ?? true;

  const answers: ApplicationAnswerSummary[] = app.answers
    ? app.answers.map((a) => ({
        id: a.id,
        questionId: a.questionId,
        questionText: a.question?.question,
        answer: a.answer,
        createdAt: a.createdAt,
      }))
    : [];

  const verifications: MemberVerificationSummary[] = app.verifications
    ? app.verifications.map((v) => ({
        id: v.id,
        verificationStatus: v.verificationStatus,
        verifiedById: includeReviewer ? v.verifiedById : null,
        verificationNotes: includeReviewer ? v.verificationNotes : null,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      }))
    : [];

  const profiles: MemberProfileSummary[] = app.profiles
    ? app.profiles.map((p) => ({
        id: p.id,
        userId: p.userId,
        memberRank: p.memberRank,
        joinedAt: p.joinedAt,
      }))
    : [];

  return {
    id: app.id,
    fullName: app.fullName,
    fatherName: app.fatherName,
    email: app.email,
    phoneNumber: app.phoneNumber,
    whatsappNumber: app.whatsappNumber,
    country: app.country,
    city: app.city,
    address: app.address,
    cnicNumber: app.cnicNumber,
    cnicIssueDate: app.cnicIssueDate,
    cnicExpiryDate: app.cnicExpiryDate,
    currentProfession: app.currentProfession,
    currentQualification: app.currentQualification,
    skillsDescription: app.skillsDescription,
    linkedinUrl: app.linkedinUrl,
    instagramUrl: app.instagramUrl,
    facebookUrl: app.facebookUrl,
    tiktokUrl: app.tiktokUrl,
    githubUrl: app.githubUrl,
    heardAboutSTSolutions: app.heardAboutSTSolutions,
    joiningPurpose: app.joiningPurpose,
    profileImageUrl: app.profileImageUrl,
    applicationStatus: app.applicationStatus,
    verificationStatus: app.verificationStatus,
    reviewedById: includeReviewer ? app.reviewedById : undefined,
    reviewNotes: includeReviewer ? app.reviewNotes : undefined,
    rejectionReason: app.rejectionReason,
    answers,
    verifications,
    profiles,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

/**
 * Transforms raw database ApplicationQuestion into sanitized summary payload.
 */
export function sanitizeQuestionResponse(q: {
  id: string;
  question: string;
  fieldType?: string;
  isRequired?: boolean;
  options?: any;
  placeholder?: string | null;
  helpText?: string | null;
  category?: string | null;
  orderNumber: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}): ApplicationQuestionSummary {
  return {
    id: q.id,
    question: q.question,
    fieldType: q.fieldType || "SHORT_TEXT",
    isRequired: q.isRequired ?? false,
    options: q.options ?? null,
    placeholder: q.placeholder ?? null,
    helpText: q.helpText ?? null,
    category: q.category || "GENERAL",
    orderNumber: q.orderNumber,
    isActive: q.isActive,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}
