import { randomUUID } from "node:crypto";

/**
 * Generates a collision-resistant, lightweight Request ID formatted as `req_<unique_id>`.
 *
 * @returns Standardized Request ID string
 */
export function generateRequestId(): string {
  const hex = randomUUID().replace(/-/g, "");
  return `req_${hex.slice(0, 16)}`;
}
