import { AccountType, ApplicationStatus, VerificationStatus } from "@prisma/client";
import {
  AuthorizationError,
  BusinessError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { Logger } from "../../core/logger/index.js";
import { passwordService as defaultPasswordService, PasswordService } from "../../core/security/password.service.js";
import { SecurityLogger } from "../../core/security/security.logger.js";
import { sanitizeApplicationResponse, sanitizeQuestionResponse } from "./applicants.mapper.js";
import { applicantsRepository as defaultApplicantsRepository, ApplicantsRepository } from "./applicants.repository.js";
import {
  ApplicationQuestionSummary,
  ApplicationResponse,
  MemberVerificationSummary,
  OnboardingResultResponse,
} from "./applicants.types.js";
import {
  ApproveApplicationInput,
  ApplicationQueryInput,
  CreateApplicationInput,
  CreateQuestionInput,
  OnboardApplicantInput,
  RejectApplicationInput,
  ReviewApplicationInput,
  SubmitAnswersInput,
  UpdateApplicationInput,
  VerificationInput,
} from "./applicants.validation.js";

/**
 * Valid Application Status State Transitions.
 */
const ALLOWED_STATUS_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  [ApplicationStatus.PENDING]: [
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.REJECTED,
    ApplicationStatus.MORE_INFORMATION_REQUIRED,
  ],
  [ApplicationStatus.UNDER_REVIEW]: [
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.MORE_INFORMATION_REQUIRED,
  ],
  [ApplicationStatus.MORE_INFORMATION_REQUIRED]: [
    ApplicationStatus.PENDING,
    ApplicationStatus.UNDER_REVIEW,
  ],
  [ApplicationStatus.APPROVED]: [],
  [ApplicationStatus.REJECTED]: [],
};

/**
 * Service encapsulating Member Application lifecycle, questions, answers, review, verification, and member onboarding.
 */
export class ApplicantsService {
  private readonly applicantsRepository: ApplicantsRepository;
  private readonly passwordService: PasswordService;

  constructor(
    applicantsRepository: ApplicantsRepository = defaultApplicantsRepository,
    passwordService: PasswordService = defaultPasswordService
  ) {
    this.applicantsRepository = applicantsRepository;
    this.passwordService = passwordService;
  }

  /**
   * Retrieves paginated applications list.
   */
  public async getApplications(filters: ApplicationQueryInput): Promise<{
    items: readonly ApplicationResponse[];
    totalRecords: number;
    page: number;
    limit: number;
  }> {
    const { items, totalRecords, page, limit } = await this.applicantsRepository.findAndCount(filters);

    const sanitizedItems = items.map((app) => sanitizeApplicationResponse(app));

    return {
      items: sanitizedItems,
      totalRecords,
      page,
      limit,
    };
  }

  /**
   * Retrieves single application details by ID.
   */
  public async getApplicationById(
    id: string,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<ApplicationResponse> {
    const app = await this.applicantsRepository.findById(id);

    if (!app) {
      throw new NotFoundError(`Member application with ID '${id}' was not found`, ERROR_CODES.APPLICATION_NOT_FOUND);
    }

    const isStaff =
      actor?.accountType === AccountType.ADMIN ||
      actor?.accountType === AccountType.SUB_ADMIN ||
      actor?.accountType === AccountType.MANAGER;

    return sanitizeApplicationResponse(app, { includeReviewerDetails: isStaff });
  }

  /**
   * Creates a new member application. Prevents active duplicate applications.
   */
  public async createApplication(dto: CreateApplicationInput): Promise<ApplicationResponse> {
    const existing = await this.applicantsRepository.findByEmailOrPhone(dto.email, dto.phoneNumber);

    if (
      existing &&
      (existing.applicationStatus === ApplicationStatus.PENDING ||
        existing.applicationStatus === ApplicationStatus.UNDER_REVIEW ||
        existing.applicationStatus === ApplicationStatus.APPROVED)
    ) {
      throw new ConflictError(
        `An active application with email '${dto.email}' or phone number '${dto.phoneNumber}' already exists with status '${existing.applicationStatus}'`,
        ERROR_CODES.APPLICATION_ALREADY_EXISTS
      );
    }

    // Validate answers question IDs if answers provided
    if (dto.answers && dto.answers.length > 0) {
      for (const answerItem of dto.answers) {
        const question = await this.applicantsRepository.findQuestionById(answerItem.questionId);
        if (!question) {
          throw new NotFoundError(
            `Question with ID '${answerItem.questionId}' does not exist`,
            ERROR_CODES.QUESTION_NOT_FOUND
          );
        }
      }
    }

    const createdApp = await this.applicantsRepository.createApplication({
      fullName: dto.fullName.trim(),
      fatherName: dto.fatherName.trim(),
      email: dto.email.trim().toLowerCase(),
      phoneNumber: dto.phoneNumber.trim(),
      whatsappNumber: dto.whatsappNumber.trim(),
      country: dto.country.trim(),
      city: dto.city.trim(),
      address: dto.address.trim(),
      cnicNumber: dto.cnicNumber?.trim() ?? null,
      cnicIssueDate: dto.cnicIssueDate ?? null,
      cnicExpiryDate: dto.cnicExpiryDate ?? null,
      currentProfession: dto.currentProfession?.trim() ?? null,
      currentQualification: dto.currentQualification?.trim() ?? null,
      skillsDescription: dto.skillsDescription?.trim() ?? null,
      linkedinUrl: dto.linkedinUrl?.trim() || null,
      instagramUrl: dto.instagramUrl?.trim() || null,
      facebookUrl: dto.facebookUrl?.trim() || null,
      tiktokUrl: dto.tiktokUrl?.trim() || null,
      githubUrl: dto.githubUrl?.trim() || null,
      heardAboutSTSolutions: dto.heardAboutSTSolutions.trim(),
      joiningPurpose: dto.joiningPurpose.trim(),
      profileImageUrl: dto.profileImageUrl?.trim() || null,
      applicationStatus: ApplicationStatus.PENDING,
      verificationStatus: VerificationStatus.NOT_VERIFIED,
      answersData: dto.answers,
    });

    Logger.info(
      { applicationId: createdApp.id, email: createdApp.email },
      `New Member Application submitted: ${createdApp.id}`
    );

    return sanitizeApplicationResponse(createdApp);
  }

  /**
   * Updates an existing application fields.
   */
  public async updateApplication(
    id: string,
    dto: UpdateApplicationInput,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<ApplicationResponse> {
    const existing = await this.applicantsRepository.findById(id);

    if (!existing) {
      throw new NotFoundError(`Member application with ID '${id}' was not found`, ERROR_CODES.APPLICATION_NOT_FOUND);
    }

    if (
      existing.applicationStatus === ApplicationStatus.APPROVED ||
      existing.applicationStatus === ApplicationStatus.REJECTED
    ) {
      throw new BusinessError(
        `Application '${id}' has been finalized as '${existing.applicationStatus}' and cannot be modified`,
        ERROR_CODES.APPLICATION_ALREADY_PROCESSED
      );
    }

    const updated = await this.applicantsRepository.updateApplication(id, {
      ...(dto.fullName !== undefined && { fullName: dto.fullName.trim() }),
      ...(dto.fatherName !== undefined && { fatherName: dto.fatherName.trim() }),
      ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber.trim() }),
      ...(dto.whatsappNumber !== undefined && { whatsappNumber: dto.whatsappNumber.trim() }),
      ...(dto.country !== undefined && { country: dto.country.trim() }),
      ...(dto.city !== undefined && { city: dto.city.trim() }),
      ...(dto.address !== undefined && { address: dto.address.trim() }),
      ...(dto.cnicNumber !== undefined && { cnicNumber: dto.cnicNumber?.trim() ?? null }),
      ...(dto.cnicIssueDate !== undefined && { cnicIssueDate: dto.cnicIssueDate }),
      ...(dto.cnicExpiryDate !== undefined && { cnicExpiryDate: dto.cnicExpiryDate }),
      ...(dto.currentProfession !== undefined && { currentProfession: dto.currentProfession?.trim() ?? null }),
      ...(dto.currentQualification !== undefined && { currentQualification: dto.currentQualification?.trim() ?? null }),
      ...(dto.skillsDescription !== undefined && { skillsDescription: dto.skillsDescription?.trim() ?? null }),
      ...(dto.linkedinUrl !== undefined && { linkedinUrl: dto.linkedinUrl?.trim() || null }),
      ...(dto.instagramUrl !== undefined && { instagramUrl: dto.instagramUrl?.trim() || null }),
      ...(dto.facebookUrl !== undefined && { facebookUrl: dto.facebookUrl?.trim() || null }),
      ...(dto.tiktokUrl !== undefined && { tiktokUrl: dto.tiktokUrl?.trim() || null }),
      ...(dto.githubUrl !== undefined && { githubUrl: dto.githubUrl?.trim() || null }),
      ...(dto.heardAboutSTSolutions !== undefined && { heardAboutSTSolutions: dto.heardAboutSTSolutions.trim() }),
      ...(dto.joiningPurpose !== undefined && { joiningPurpose: dto.joiningPurpose.trim() }),
      ...(dto.profileImageUrl !== undefined && { profileImageUrl: dto.profileImageUrl?.trim() || null }),
    });

    return sanitizeApplicationResponse(updated);
  }

  /**
   * Reviews application and transitions status according to state transition rules.
   */
  public async reviewApplication(
    id: string,
    dto: ReviewApplicationInput,
    reviewer: { userId: string }
  ): Promise<ApplicationResponse> {
    const existing = await this.applicantsRepository.findById(id);

    if (!existing) {
      throw new NotFoundError(`Member application with ID '${id}' was not found`, ERROR_CODES.APPLICATION_NOT_FOUND);
    }

    const currentStatus = existing.applicationStatus;
    const targetStatus = dto.status;

    if (currentStatus !== targetStatus) {
      const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus];
      if (!allowedNext || !allowedNext.includes(targetStatus)) {
        throw new BusinessError(
          `Cannot transition application status from '${currentStatus}' to '${targetStatus}'`,
          ERROR_CODES.APPLICATION_STATUS_TRANSITION_INVALID
        );
      }
    }

    const updated = await this.applicantsRepository.updateStatus(id, {
      status: targetStatus,
      reviewedById: reviewer.userId,
      reviewNotes: dto.reviewNotes,
    });

    Logger.info(
      { applicationId: id, reviewerId: reviewer.userId, from: currentStatus, to: targetStatus },
      `Application ${id} status reviewed and changed from ${currentStatus} to ${targetStatus}`
    );

    return sanitizeApplicationResponse(updated);
  }

  /**
   * Approves an application.
   */
  public async approveApplication(
    id: string,
    dto: ApproveApplicationInput,
    reviewer: { userId: string }
  ): Promise<ApplicationResponse> {
    return this.reviewApplication(
      id,
      {
        status: ApplicationStatus.APPROVED,
        reviewNotes: dto.reviewNotes,
      },
      reviewer
    );
  }

  /**
   * Rejects an application.
   */
  public async rejectApplication(
    id: string,
    dto: RejectApplicationInput,
    reviewer: { userId: string }
  ): Promise<ApplicationResponse> {
    const existing = await this.applicantsRepository.findById(id);

    if (!existing) {
      throw new NotFoundError(`Member application with ID '${id}' was not found`, ERROR_CODES.APPLICATION_NOT_FOUND);
    }

    const currentStatus = existing.applicationStatus;
    const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus];

    if (!allowedNext || !allowedNext.includes(ApplicationStatus.REJECTED)) {
      throw new BusinessError(
        `Cannot reject application '${id}' with status '${currentStatus}'`,
        ERROR_CODES.APPLICATION_STATUS_TRANSITION_INVALID
      );
    }

    const updated = await this.applicantsRepository.updateStatus(id, {
      status: ApplicationStatus.REJECTED,
      reviewedById: reviewer.userId,
      reviewNotes: dto.reviewNotes,
      rejectionReason: dto.rejectionReason.trim(),
    });

    Logger.info(
      { applicationId: id, reviewerId: reviewer.userId },
      `Application ${id} rejected: ${dto.rejectionReason}`
    );

    return sanitizeApplicationResponse(updated);
  }

  /**
   * Retrieves active or all application questions.
   */
  public async getQuestions(onlyActive = true): Promise<readonly ApplicationQuestionSummary[]> {
    const questions = await this.applicantsRepository.getQuestions(onlyActive);
    return questions.map((q) => sanitizeQuestionResponse(q));
  }

  /**
   * Creates a new application question.
   */
  public async createQuestion(dto: CreateQuestionInput): Promise<ApplicationQuestionSummary> {
    const question = await this.applicantsRepository.createQuestion({
      question: dto.question.trim(),
      orderNumber: dto.orderNumber,
      isActive: dto.isActive,
    });

    return sanitizeQuestionResponse(question);
  }

  /**
   * Submits or updates answers for an application.
   */
  public async submitAnswers(applicationId: string, dto: SubmitAnswersInput): Promise<ApplicationResponse> {
    const app = await this.applicantsRepository.findById(applicationId);

    if (!app) {
      throw new NotFoundError(`Member application with ID '${applicationId}' was not found`, ERROR_CODES.APPLICATION_NOT_FOUND);
    }

    if (app.applicationStatus === ApplicationStatus.APPROVED || app.applicationStatus === ApplicationStatus.REJECTED) {
      throw new BusinessError(
        `Application '${applicationId}' is finalized and cannot accept new answers`,
        ERROR_CODES.APPLICATION_ALREADY_PROCESSED
      );
    }

    // Verify all question IDs exist
    for (const item of dto.answers) {
      const q = await this.applicantsRepository.findQuestionById(item.questionId);
      if (!q) {
        throw new NotFoundError(`Question with ID '${item.questionId}' was not found`, ERROR_CODES.QUESTION_NOT_FOUND);
      }
    }

    const updatedApp = await this.applicantsRepository.submitAnswers(applicationId, dto.answers);

    if (!updatedApp) {
      throw new NotFoundError(`Member application with ID '${applicationId}' was not found`, ERROR_CODES.APPLICATION_NOT_FOUND);
    }

    return sanitizeApplicationResponse(updatedApp);
  }

  /**
   * Retrieves answers for an application.
   */
  public async getAnswers(applicationId: string) {
    const app = await this.applicantsRepository.findById(applicationId);

    if (!app) {
      throw new NotFoundError(`Member application with ID '${applicationId}' was not found`, ERROR_CODES.APPLICATION_NOT_FOUND);
    }

    return this.applicantsRepository.getAnswers(applicationId);
  }

  /**
   * Creates or updates verification for an application.
   */
  public async updateVerification(
    applicationId: string,
    dto: VerificationInput,
    reviewer: { userId: string }
  ): Promise<MemberVerificationSummary> {
    const app = await this.applicantsRepository.findById(applicationId);

    if (!app) {
      throw new NotFoundError(`Member application with ID '${applicationId}' was not found`, ERROR_CODES.APPLICATION_NOT_FOUND);
    }

    const verification = await this.applicantsRepository.createOrUpdateVerification(applicationId, {
      verificationStatus: dto.verificationStatus,
      verifiedById: reviewer.userId,
      verificationNotes: dto.verificationNotes,
    });

    Logger.info(
      { applicationId, verificationId: verification.id, status: dto.verificationStatus, reviewerId: reviewer.userId },
      `Application verification status updated to ${dto.verificationStatus}`
    );

    return {
      id: verification.id,
      verificationStatus: verification.verificationStatus,
      verifiedById: verification.verifiedById,
      verificationNotes: verification.verificationNotes,
      createdAt: verification.createdAt,
      updatedAt: verification.updatedAt,
    };
  }

  /**
   * Onboards an approved applicant into the system as an active User, MemberProfile, and Member record.
   */
  public async onboardApplicant(
    applicationId: string,
    dto: OnboardApplicantInput,
    actor?: { userId?: string; accountType?: AccountType }
  ): Promise<OnboardingResultResponse> {
    const app = await this.applicantsRepository.findById(applicationId);

    if (!app) {
      throw new NotFoundError(`Member application with ID '${applicationId}' was not found`, ERROR_CODES.APPLICATION_NOT_FOUND);
    }

    if (app.applicationStatus !== ApplicationStatus.APPROVED) {
      throw new BusinessError(
        `Application '${applicationId}' must be APPROVED before onboarding. Current status: '${app.applicationStatus}'`,
        ERROR_CODES.APPLICATION_NOT_APPROVED
      );
    }

    // Check if member profile already exists for this application
    if (app.profiles && app.profiles.length > 0) {
      const existingProfile = app.profiles[0];
      if (existingProfile.userId) {
        throw new ConflictError(
          `Application '${applicationId}' has already been onboarded to User ID '${existingProfile.userId}'`,
          ERROR_CODES.MEMBER_ALREADY_EXISTS
        );
      }
    }

    // Hash initial password or default fallback
    const rawPassword = dto.initialPassword ?? `ST#${Math.random().toString(36).substring(2, 10)}!`;
    const passwordHash = await this.passwordService.hashPassword(rawPassword);

    // Find MEMBER role if exists
    const memberRole = await this.applicantsRepository.findRoleByName("MEMBER");
    const roleId = memberRole?.id ?? null;

    // Find Rank for member
    const rank = await this.applicantsRepository.findRankByNameOrLowestPriority(dto.memberRank);
    const rankId = rank?.id ?? null;
    const rankName = rank?.name ?? dto.memberRank ?? "Member";

    const result = await this.applicantsRepository.onboardApplicantTx({
      application: {
        id: app.id,
        fullName: app.fullName,
        email: app.email,
        phoneNumber: app.phoneNumber,
        country: app.country,
        city: app.city,
        address: app.address,
        profileImageUrl: app.profileImageUrl,
      },
      passwordHash,
      roleId,
      rankId,
      memberRankName: rankName,
      notes: dto.notes,
    });

    Logger.info(
      { applicationId, userId: result.user.id, email: result.user.email },
      `Applicant onboarded successfully as Member User '${result.user.id}'`
    );

    return {
      applicationId: app.id,
      userId: result.user.id,
      email: result.user.email ?? app.email,
      memberProfileId: result.memberProfile.id,
      memberId: result.member?.id ?? null,
      rankName,
      onboardedAt: result.joinedAt,
    };
  }
}

export const applicantsService = new ApplicantsService();
