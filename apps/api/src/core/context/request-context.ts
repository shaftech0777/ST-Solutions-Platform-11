import { AsyncLocalStorage } from "node:async_hooks";
import { generateRequestId } from "./request-id.js";
import { CreateRequestContextOptions, RequestContextData } from "./request-context.types.js";

const asyncLocalStorage = new AsyncLocalStorage<RequestContextData>();

/**
 * Enterprise Request Context Store powered by Node.js AsyncLocalStorage.
 * Manages request-scoped metadata across asynchronous execution boundaries without parameter drilling.
 */
export class RequestContext {
  /**
   * Runs an asynchronous function within a scoped RequestContext.
   *
   * @param options Request context parameters
   * @param fn Function to execute within context scope
   * @returns Result of execution function
   */
  public static run<R>(options: CreateRequestContextOptions, fn: () => R): R {
    const contextData: RequestContextData = {
      requestId: options.requestId || generateRequestId(),
      userId: options.userId,
      sessionId: options.sessionId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      startTime: Date.now(),
      metadata: options.metadata ? { ...options.metadata } : {},
    };

    return asyncLocalStorage.run(contextData, fn);
  }

  /**
   * Retrieves current request context store.
   *
   * @returns Current RequestContextData or undefined if called outside context scope
   */
  public static get(): RequestContextData | undefined {
    return asyncLocalStorage.getStore();
  }

  /**
   * Gets current request ID from active context.
   *
   * @returns Current requestId or undefined
   */
  public static getRequestId(): string | undefined {
    return asyncLocalStorage.getStore()?.requestId;
  }

  /**
   * Gets current user ID from active context.
   *
   * @returns Current userId or undefined
   */
  public static getUserId(): string | undefined {
    return asyncLocalStorage.getStore()?.userId;
  }

  /**
   * Sets or updates authenticated user ID in current context store.
   *
   * @param userId Authenticated user identifier
   */
  public static setUserId(userId: string): void {
    const store = asyncLocalStorage.getStore();
    if (store !== undefined) {
      store.userId = userId;
    }
  }

  /**
   * Sets or updates active session ID in current context store.
   *
   * @param sessionId Session identifier
   */
  public static setSessionId(sessionId: string): void {
    const store = asyncLocalStorage.getStore();
    if (store !== undefined) {
      store.sessionId = sessionId;
    }
  }

  /**
   * Attaches custom key-value metadata to active context store.
   *
   * @param key Metadata key
   * @param value Metadata value
   */
  public static setMetadata(key: string, value: unknown): void {
    const store = asyncLocalStorage.getStore();
    if (store !== undefined) {
      if (store.metadata === undefined) {
        store.metadata = {};
      }
      store.metadata[key] = value;
    }
  }

  /**
   * Returns total elapsed execution time in milliseconds since context creation.
   *
   * @returns Elapsed time in milliseconds or 0 if outside context
   */
  public static getElapsedTime(): number {
    const store = asyncLocalStorage.getStore();
    if (store === undefined) {
      return 0;
    }
    return Date.now() - store.startTime;
  }
}
