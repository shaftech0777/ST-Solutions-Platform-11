import { apiClient } from "../client.js";

export const aiService = {
  async queryAi(prompt: string, context?: Record<string, any>) {
    return apiClient<{ reply: string; data?: any }>("/ai/query", {
      method: "POST",
      body: { prompt, context },
    });
  },
};
