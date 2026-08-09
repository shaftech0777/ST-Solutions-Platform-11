import { DatabaseOperationOptions, PaginatedResult, PaginationInput } from "../database.types.js";

/**
 * Core Repository Interface contract for domain repositories.
 */
export interface IBaseRepository<T, CreateInput, UpdateInput, WhereInput = Record<string, unknown>> {
  findById(id: string, options?: DatabaseOperationOptions): Promise<T | null>;
  findMany(
    where?: WhereInput,
    pagination?: PaginationInput,
    options?: DatabaseOperationOptions
  ): Promise<PaginatedResult<T>>;
  create(data: CreateInput, options?: DatabaseOperationOptions): Promise<T>;
  update(id: string, data: UpdateInput, options?: DatabaseOperationOptions): Promise<T>;
  delete(id: string, options?: DatabaseOperationOptions): Promise<boolean>;
  count(where?: WhereInput, options?: DatabaseOperationOptions): Promise<number>;
}
