import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default("default-development-secret-key"),
});

export const env = envSchema.parse(process.env);
