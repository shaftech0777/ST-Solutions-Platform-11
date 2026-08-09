import { Logger } from "../logger/index.js";
import { normalizeError } from "../errors/index.js";

/**
 * Base abstract class for business services providing contextual error handling and execution logging.
 */
export abstract class BaseService {
  /**
   * Safely executes an async service operation function, wrapping execution with normalized
   * domain error handling and structured logging.
   *
   * @param operation Descriptive name of the service operation
   * @param fn Async work function
   * @param requestId Optional request correlation ID
   */
  protected async executeOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    requestId?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const normalized = normalizeError(error, requestId);
      Logger.error(
        {
          operation,
          errorName: normalized.name,
          errorCode: normalized.errorCode,
          statusCode: normalized.statusCode,
          requestId: normalized.requestId,
        },
        `Service Operation [${operation}] Failed: ${normalized.message}`
      );
      throw normalized;
    }
  }
}
