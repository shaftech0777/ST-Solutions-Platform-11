export interface AiQueryRequest {
  prompt: string;
  context?: {
    organizationId?: string;
    workspaceId?: string;
    [key: string]: any;
  };
}

export interface AiQueryResponse {
  reply: string;
  model: string;
  tokensUsed?: number;
  data?: Record<string, any>;
}
