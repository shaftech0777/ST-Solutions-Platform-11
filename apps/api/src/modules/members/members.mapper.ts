import { MemberDetailResponse, MemberProfileResponse, MemberSummaryResponse } from "./members.types.js";

/**
 * Sanitizes a member record into a clean summary response structure.
 */
export function sanitizeMemberResponse(member: any): MemberSummaryResponse {
  const user = member.user || {};
  const profile = user.profile || {};
  const rank = member.rank || {};

  return {
    id: member.id,
    userId: member.userId,
    email: user.email || null,
    status: member.status,
    trustScore: member.trustScore ?? 0,
    joinedAt: member.joinedAt,
    rank: {
      id: rank.id,
      name: rank.name,
      description: rank.description || null,
      priority: rank.priority,
    },
    profile: sanitizeMemberProfileResponse(profile, user.memberProfiles?.[0]?.application),
  };
}

/**
 * Sanitizes user profile / member profile information.
 */
export function sanitizeMemberProfileResponse(userProfile: any, application?: any): MemberProfileResponse {
  const profile = userProfile || {};
  const app = application || {};

  return {
    id: profile.id,
    fullName: profile.fullName || app.fullName || null,
    profileImage: profile.profileImage || app.profileImageUrl || null,
    phoneNumber: profile.phoneNumber || app.phoneNumber || null,
    country: profile.country || app.country || null,
    city: profile.city || app.city || null,
    address: profile.address || app.address || null,
    socialLinks: {
      linkedin: app.linkedinUrl || null,
      instagram: app.instagramUrl || null,
      facebook: app.facebookUrl || null,
      tiktok: app.tiktokUrl || null,
      github: app.githubUrl || null,
    },
  };
}

/**
 * Sanitizes detailed member record including relations and metadata.
 */
export function sanitizeMemberDetailResponse(member: any): MemberDetailResponse {
  const summary = sanitizeMemberResponse(member);
  const managerUser = member.manager?.user || {};
  const managerProfile = managerUser.profile || {};
  const memberProfileRelation = member.user?.memberProfiles?.[0];
  const app = memberProfileRelation?.application;

  return {
    ...summary,
    managerId: member.managerId || null,
    manager: member.manager
      ? {
          id: member.manager.id,
          userId: member.manager.userId,
          fullName: managerProfile.fullName || null,
          email: managerUser.email || null,
        }
      : null,
    notes: member.notes || null,
    removedAt: member.removedAt || null,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    applicationInfo: app
      ? {
          applicationId: app.id,
          whatsappNumber: app.whatsappNumber || null,
          cnicNumber: app.cnicNumber || null,
          currentProfession: app.currentProfession || null,
          currentQualification: app.currentQualification || null,
          skillsDescription: app.skillsDescription || null,
          joiningPurpose: app.joiningPurpose || null,
        }
      : null,
    verificationStatus: app?.verificationStatus || null,
  };
}
