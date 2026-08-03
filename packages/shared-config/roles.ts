export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CLIENT: "CLIENT",
  MEMBER: "MEMBER",
  APPLICANT: "APPLICANT",
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];
