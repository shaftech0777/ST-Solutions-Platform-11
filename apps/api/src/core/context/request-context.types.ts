/**
 * Interface defining request-scoped contextual data stored within AsyncLocalStorage.
 */
export interface RequestContextData {
  readonly requestId: string;
  userId?: string;
  sessionId?: string;
  organizationId?: string;
  workspaceId?: string;
  organizationRole?: string;
  workspaceRole?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly startTime: number;
  metadata?: Record<string, unknown>;
}

/**
 * Options required when initializing a new Request Context execution scope.
 */
export interface CreateRequestContextOptions {
  readonly requestId?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly organizationId?: string;
  readonly workspaceId?: string;
  readonly organizationRole?: string;
  readonly workspaceRole?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly metadata?: Record<string, unknown>;
}
