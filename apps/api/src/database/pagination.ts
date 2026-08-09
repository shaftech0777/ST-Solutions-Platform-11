import { NormalizedPagination, PaginatedResult, PaginationInput } from "./database.types.js";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * Normalizes input pagination parameters with safety bounds and defaults.
 *
 * @param input Optional page and limit parameters
 * @returns Normalized pagination containing page, limit, and database offset (skip)
 */
export function normalizePagination(input?: PaginationInput): NormalizedPagination {
  const rawPage = input?.page ?? DEFAULT_PAGE;
  const rawLimit = input?.limit ?? DEFAULT_LIMIT;

  const page = Math.max(1, Math.floor(Number.isFinite(rawPage) ? rawPage : DEFAULT_PAGE));
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(Number.isFinite(rawLimit) ? rawLimit : DEFAULT_LIMIT))
  );

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

/**
 * Formats data array and total count into a structured PaginatedResult object.
 *
 * @param items Array of retrieved records
 * @param totalRecords Total record count in database
 * @param page Current page number
 * @param limit Current page limit
 * @returns PaginatedResult structure
 */
export function buildPaginatedResult<T>(
  items: readonly T[],
  totalRecords: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const safeTotal = Math.max(0, totalRecords);
  const totalPages = safeTotal > 0 ? Math.ceil(safeTotal / limit) : 0;

  return {
    data: items,
    pagination: {
      page,
      limit,
      totalRecords: safeTotal,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && page <= totalPages + 1,
    },
  };
}
