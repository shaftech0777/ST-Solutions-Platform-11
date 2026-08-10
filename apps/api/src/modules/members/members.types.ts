import { MemberStatus, RankChangeReason } from "@prisma/client";

export interface MemberQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: MemberStatus;
  rankId?: string;
  country?: string;
  city?: string;
  managerId?: string;
  sortBy?: "createdAt" | "joinedAt" | "trustScore" | "status";
  sortOrder?: "asc" | "desc";
}

export interface MemberProfileResponse {
  id?: string;
  fullName: string | null;
  profileImage: string | null;
  phoneNumber: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  bio?: string | null;
  website?: string | null;
  socialLinks?: {
    linkedin?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    github?: string | null;
  };
}

export interface RankSummaryResponse {
  id: string;
  name: string;
  description: string | null;
  priority: number;
}

export interface MemberSummaryResponse {
  id: string;
  userId: string;
  email: string | null;
  status: MemberStatus;
  trustScore: number;
  joinedAt: Date;
  rank: RankSummaryResponse;
  profile: MemberProfileResponse;
}

export interface MemberDetailResponse extends MemberSummaryResponse {
  managerId: string | null;
  manager?: {
    id: string;
    userId: string;
    fullName: string | null;
    email: string | null;
  } | null;
  notes: string | null;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  applicationInfo?: {
    applicationId: string;
    whatsappNumber: string | null;
    cnicNumber: string | null;
    currentProfession: string | null;
    currentQualification: string | null;
    skillsDescription: string | null;
    joiningPurpose: string | null;
  } | null;
  verificationStatus?: string | null;
}

export interface UpdateMemberProfileInput {
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string;
  country?: string;
  city?: string;
  address?: string;
  bio?: string;
  website?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  githubUrl?: string;
}

export interface UpdateMemberStatusInput {
  status: MemberStatus;
  notes?: string;
}

export interface UpdateMemberRankInput {
  rankId: string;
  reason: RankChangeReason;
  notes?: string;
}

export interface MemberStatistics {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  suspendedMembers: number;
  removedMembers: number;
  membersByRank: Array<{
    rankId: string;
    rankName: string;
    count: number;
  }>;
  recentlyJoinedCount: number;
}
