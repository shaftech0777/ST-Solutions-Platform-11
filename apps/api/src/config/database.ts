import { env } from "./env.js";

export const databaseConfig = {
  url: env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/st_solutions?schema=public",
  logQueries: env.NODE_ENV === "development",
};
