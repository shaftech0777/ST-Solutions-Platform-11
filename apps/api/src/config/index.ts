export * from "./env.js";
export * from "./logger.js";
export * from "./security.js";
export * from "./database.js";

export const config = {
  port: process.env.PORT || 4000,
  env: process.env.NODE_ENV || "development",
};


