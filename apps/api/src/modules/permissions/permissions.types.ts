export interface PermissionQueryFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly sortBy?: "createdAt" | "name" | "updatedAt";
  readonly sortOrder?: "asc" | "desc";
}

export interface PermissionResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly roleCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
