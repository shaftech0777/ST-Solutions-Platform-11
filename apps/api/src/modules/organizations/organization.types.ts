import { OrganizationRole, OrganizationStatus, InvitationStatus } from "@prisma/client";

export interface OrganizationResponse {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string | null;
  readonly status: OrganizationStatus;
  readonly ownerId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface OrganizationMemberResponse {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly role: OrganizationRole;
  readonly joinedAt: Date;
  readonly user?: {
    readonly id: string;
    readonly email?: string | null;
    readonly fullName?: string | null;
  };
}

export interface InvitationResponse {
  readonly id: string;
  readonly organizationId: string;
  readonly email: string;
  readonly role: OrganizationRole;
  readonly token: string;
  readonly status: InvitationStatus;
  readonly expiresAt: Date;
  readonly createdAt: Date;
}
