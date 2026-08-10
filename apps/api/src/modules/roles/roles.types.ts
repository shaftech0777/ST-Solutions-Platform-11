export interface RoleQueryFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly sortBy?: "createdAt" | "name" | "updatedAt";
  readonly sortOrder?: "asc" | "desc";
}

export interface PermissionSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt?: Date;
}

export interface RoleResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly permissions: readonly PermissionSummary[];
  readonly userCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
