import { ApplicationStatus, VerificationStatus } from "@prisma/client";

export interface ApplicationQueryFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly status?: ApplicationStatus;
  readonly verificationStatus?: VerificationStatus;
  readonly country?: string;
  readonly city?: string;
  readonly sortBy?: "createdAt" | "fullName" | "email" | "applicationStatus" | "updatedAt";
  readonly sortOrder?: "asc" | "desc";
}

export interface ApplicationQuestionSummary {
  readonly id: string;
  readonly question: string;
  readonly fieldType: string;
  readonly isRequired: boolean;
  readonly options: any;
  readonly placeholder: string | null;
  readonly helpText: string | null;
  readonly category: string | null;
  readonly orderNumber: number;
  readonly isActive: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface CreateQuestionInput {
  readonly question: string;
  readonly fieldType?: string;
  readonly isRequired?: boolean;
  readonly options?: any;
  readonly placeholder?: string | null;
  readonly helpText?: string | null;
  readonly category?: string | null;
  readonly orderNumber?: number;
  readonly isActive?: boolean;
}

export interface UpdateQuestionInput {
  readonly question?: string;
  readonly fieldType?: string;
  readonly isRequired?: boolean;
  readonly options?: any;
  readonly placeholder?: string | null;
  readonly helpText?: string | null;
  readonly category?: string | null;
  readonly orderNumber?: number;
  readonly isActive?: boolean;
}

export interface ReorderQuestionsInput {
  readonly questionOrders: readonly { id: string; orderNumber: number }[];
}

export interface ApplicationAnswerSummary {
  readonly id: string;
  readonly questionId: string;
  readonly questionText?: string;
  readonly answer: string;
  readonly createdAt?: Date;
}

export interface MemberVerificationSummary {
  readonly id: string;
  readonly verificationStatus: VerificationStatus;
  readonly verifiedById: string | null;
  readonly verificationNotes: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface MemberProfileSummary {
  readonly id: string;
  readonly userId: string | null;
  readonly memberRank: string | null;
  readonly joinedAt: Date | null;
}

export interface ApplicationResponse {
  readonly id: string;
  readonly fullName: string;
  readonly fatherName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly whatsappNumber: string;
  readonly country: string;
  readonly city: string;
  readonly address: string;
  readonly cnicNumber: string | null;
  readonly cnicIssueDate: Date | null;
  readonly cnicExpiryDate: Date | null;
  readonly currentProfession: string | null;
  readonly currentQualification: string | null;
  readonly skillsDescription: string | null;
  readonly linkedinUrl: string | null;
  readonly instagramUrl: string | null;
  readonly facebookUrl: string | null;
  readonly tiktokUrl: string | null;
  readonly githubUrl: string | null;
  readonly heardAboutSTSolutions: string;
  readonly joiningPurpose: string;
  readonly profileImageUrl: string | null;
  readonly applicationStatus: ApplicationStatus;
  readonly verificationStatus: VerificationStatus;
  readonly reviewedById?: string | null;
  readonly reviewNotes?: string | null;
  readonly rejectionReason?: string | null;
  readonly answers?: readonly ApplicationAnswerSummary[];
  readonly verifications?: readonly MemberVerificationSummary[];
  readonly profiles?: readonly MemberProfileSummary[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AnswerItemInput {
  readonly questionId: string;
  readonly answer: string;
}

export interface OnboardingResultResponse {
  readonly applicationId: string;
  readonly userId: string;
  readonly email: string;
  readonly memberProfileId: string;
  readonly memberId: string | null;
  readonly rankName: string | null;
  readonly onboardedAt: Date;
}
