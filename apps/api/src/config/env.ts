import dotenv from "dotenv";
import { envSchema, EnvSchemaType } from "./env.schema.js";

// Load environment variables from .env file
dotenv.config();

/**
 * Validates and parses environment variables.
 * Stops execution with a clear error report if validation fails.
 */
function validateEnv(): EnvSchemaType {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((err) => `  - ${err.path.join(".")}: ${err.message}`)
      .join("\n");

    // eslint-disable-next-line no-console
    console.error(
      `\n[FATAL] Environment Validation Failed:\n${formattedErrors}\n`
    );

    throw new Error(`Environment validation failed:\n${formattedErrors}`);
  }

  return result.data;
}

/**
 * Validated, strongly typed environment variables instance.
 */
export const env: EnvSchemaType = validateEnv();
