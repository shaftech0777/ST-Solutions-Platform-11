import { AccountType, MemberStatus } from "@prisma/client";
import { AuthorizationError, BusinessError, NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { sanitizeMemberDetailResponse, sanitizeMemberResponse } from "./members.mapper.js";
import { membersRepository as defaultMembersRepository, MembersRepository } from "./members.repository.js";
import {
  MemberDetailResponse,
  MemberQueryFilters,
  MemberStatistics,
  MemberSummaryResponse,
  UpdateMemberProfileInput,
  UpdateMemberRankInput,
  UpdateMemberStatusInput,
} from "./members.types.js";

/**
 * Domain service encapsulating business rules and policy logic for Members.
 */
export class MembersService {
  private readonly membersRepository: MembersRepository;

  constructor(membersRepository: MembersRepository = defaultMembersRepository) {
    this.membersRepository = membersRepository;
  }

  /**
   * Retrieves a paginated list of members with sanitization.
   */
  public async getMembers(filters: MemberQueryFilters): Promise<{
    items: MemberSummaryResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const { data, meta } = await this.membersRepository.findAndCount(filters);
    const sanitizedItems = data.map((member) => sanitizeMemberResponse(member));

    return {
      items: sanitizedItems,
      pagination: meta,
    };
  }

  /**
   * Retrieves detailed information for a specific member by ID.
   */
  public async getMemberById(
    memberId: string,
    actor?: { userId: string; accountType?: string }
  ): Promise<MemberDetailResponse> {
    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new NotFoundError("Member not found", ERROR_CODES.MEMBER_NOT_FOUND);
    }

    if (actor && actor.accountType === AccountType.MEMBER && member.userId !== actor.userId) {
      // Normal members can view basic member details
    }

    return sanitizeMemberDetailResponse(member);
  }

  /**
   * Retrieves member details by associated User ID.
   */
  public async getMemberByUserId(userId: string): Promise<MemberDetailResponse> {
    const member = await this.membersRepository.findByUserId(userId);
    if (!member) {
      throw new NotFoundError("Member profile not found for user", ERROR_CODES.MEMBER_NOT_FOUND);
    }

    return sanitizeMemberDetailResponse(member);
  }

  /**
   * Updates member profile details with ownership and authorization checks.
   */
  public async updateProfile(
    memberId: string,
    input: UpdateMemberProfileInput,
    actor: { userId: string; accountType?: string }
  ): Promise<MemberDetailResponse> {
    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new NotFoundError("Member not found", ERROR_CODES.MEMBER_NOT_FOUND);
    }

    const isSelf = member.userId === actor.userId;
    const isAdmin =
      actor.accountType === AccountType.ADMIN ||
      actor.accountType === AccountType.SUB_ADMIN ||
      actor.accountType === AccountType.MANAGER;

    if (!isSelf && !isAdmin) {
      throw new AuthorizationError(
        "You do not have permission to update this member profile",
        ERROR_CODES.MEMBER_UNAUTHORIZED
      );
    }

    await this.membersRepository.updateProfile(member.userId, {
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      profileImage: input.profileImage,
      country: input.country,
      city: input.city,
      address: input.address,
    });

    const updatedMember = await this.membersRepository.findById(memberId);
    return sanitizeMemberDetailResponse(updatedMember!);
  }

  /**
   * Administrative member status management with transition validation.
   */
  public async updateStatus(
    memberId: string,
    input: UpdateMemberStatusInput,
    actor: { userId: string; accountType?: string }
  ): Promise<MemberDetailResponse> {
    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new NotFoundError("Member not found", ERROR_CODES.MEMBER_NOT_FOUND);
    }

    if (member.userId === actor.userId) {
      throw new BusinessError(
        "Self-modification of member status is prohibited",
        ERROR_CODES.MEMBER_CANNOT_MODIFY_SELF
      );
    }

    const currentStatus = member.status;
    const newStatus = input.status;

    if (currentStatus === newStatus) {
      return sanitizeMemberDetailResponse(member);
    }

    // Status transition rules validation
    const allowedTransitions: Record<MemberStatus, MemberStatus[]> = {
      [MemberStatus.ACTIVE]: [MemberStatus.INACTIVE, MemberStatus.SUSPENDED, MemberStatus.REMOVED],
      [MemberStatus.INACTIVE]: [MemberStatus.ACTIVE, MemberStatus.SUSPENDED, MemberStatus.REMOVED],
      [MemberStatus.SUSPENDED]: [MemberStatus.ACTIVE, MemberStatus.INACTIVE, MemberStatus.REMOVED],
      [MemberStatus.REMOVED]: [MemberStatus.ACTIVE, MemberStatus.INACTIVE, MemberStatus.SUSPENDED],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BusinessError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        ERROR_CODES.MEMBER_STATUS_TRANSITION_INVALID
      );
    }

    const updateData: any = {
      status: newStatus,
      notes: input.notes ? `${member.notes ? member.notes + "\n" : ""}${input.notes}` : member.notes,
    };

    if (newStatus === MemberStatus.REMOVED) {
      updateData.removedAt = new Date();
    } else if ((currentStatus as MemberStatus) === MemberStatus.REMOVED) {
      updateData.removedAt = null;
    }

    const updatedMember = await this.membersRepository.update(memberId, updateData);
    return sanitizeMemberDetailResponse(updatedMember);
  }

  /**
   * Administrative rank assignment with rank change audit history.
   */
  public async updateRank(
    memberId: string,
    input: UpdateMemberRankInput,
    actor: { userId: string; accountType?: string }
  ): Promise<MemberDetailResponse> {
    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new NotFoundError("Member not found", ERROR_CODES.MEMBER_NOT_FOUND);
    }

    const targetRank = await this.membersRepository.findRankById(input.rankId);
    if (!targetRank) {
      throw new NotFoundError("Target rank does not exist", ERROR_CODES.MEMBER_RANK_NOT_FOUND);
    }

    if (member.rankId === input.rankId) {
      return sanitizeMemberDetailResponse(member);
    }

    const oldRankId = member.rankId;

    const updatedMember = await this.membersRepository.withTransaction(async (tx) => {
      await this.membersRepository.createRankHistory(
        {
          memberId,
          oldRankId,
          newRankId: input.rankId,
          changedById: actor.userId,
          reason: input.reason,
          notes: input.notes,
        },
        tx
      );

      return this.membersRepository.update(
        memberId,
        {
          rank: {
            connect: { id: input.rankId },
          },
        },
        tx
      );
    });

    return sanitizeMemberDetailResponse(updatedMember);
  }

  /**
   * Safe deactivation / soft deletion of member.
   */
  public async deactivateMember(
    memberId: string,
    actor: { userId: string; accountType?: string }
  ): Promise<MemberDetailResponse> {
    return this.updateStatus(
      memberId,
      {
        status: MemberStatus.REMOVED,
        notes: "Member deactivated by administrative action",
      },
      actor
    );
  }

  /**
   * Computes high-level statistics for member management dashboard.
   */
  public async getStatistics(): Promise<MemberStatistics> {
    return this.membersRepository.getStatistics();
  }
}

export const membersService = new MembersService();
