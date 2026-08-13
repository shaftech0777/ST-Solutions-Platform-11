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
      organizationId: options.organizationId,
      workspaceId: options.workspaceId,
      organizationRole: options.organizationRole,
      workspaceRole: options.workspaceRole,
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
   * Gets active organization ID from request context.
   */
  public static getOrganizationId(): string | undefined {
    return asyncLocalStorage.getStore()?.organizationId;
  }

  /**
   * Gets active workspace ID from request context.
   */
  public static getWorkspaceId(): string | undefined {
    return asyncLocalStorage.getStore()?.workspaceId;
  }

  /**
   * Gets active organization role from request context.
   */
  public static getOrganizationRole(): string | undefined {
    return asyncLocalStorage.getStore()?.organizationRole;
  }

  /**
   * Gets active workspace role from request context.
   */
  public static getWorkspaceRole(): string | undefined {
    return asyncLocalStorage.getStore()?.workspaceRole;
  }

  /**
   * Sets tenant context in active store.
   */
  public static setTenantContext(scope: {
    organizationId?: string;
    workspaceId?: string;
    organizationRole?: string;
    workspaceRole?: string;
  }): void {
    const store = asyncLocalStorage.getStore();
    if (store !== undefined) {
      if (scope.organizationId !== undefined) store.organizationId = scope.organizationId;
      if (scope.workspaceId !== undefined) store.workspaceId = scope.workspaceId;
      if (scope.organizationRole !== undefined) store.organizationRole = scope.organizationRole;
      if (scope.workspaceRole !== undefined) store.workspaceRole = scope.workspaceRole;
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
