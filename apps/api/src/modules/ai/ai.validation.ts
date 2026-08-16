import { z } from "zod";

export const aiQuerySchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty").max(4000, "Prompt is too long"),
  context: z.record(z.any()).optional(),
});
