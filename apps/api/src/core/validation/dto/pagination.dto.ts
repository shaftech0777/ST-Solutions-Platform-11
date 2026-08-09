import { z } from "zod";
import { paginationQuerySchema } from "../validation.schema.js";
import { InferDto } from "./base.dto.js";

/**
 * Zod Schema for input HTTP pagination and sorting request parameters.
 */
export const paginationQueryDtoSchema = paginationQuerySchema;

/**
 * Inferred TypeScript DTO for input pagination and sorting request query.
 */
export type PaginationQueryDto = InferDto<typeof paginationQueryDtoSchema>;

/**
 * Input Pagination Request DTO class representation.
 */
export class PaginationRequestDto implements PaginationQueryDto {
  public readonly page: number;
  public readonly limit: number;
  public readonly sort?: string;
  public readonly order: "asc" | "desc";

  constructor(query: Partial<PaginationQueryDto>) {
    const parsed = paginationQueryDtoSchema.parse(query);
    this.page = parsed.page;
    this.limit = parsed.limit;
    this.sort = parsed.sort;
    this.order = parsed.order;
  }
}
