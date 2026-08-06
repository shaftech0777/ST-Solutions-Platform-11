import { config } from "./config.js";

export const databaseConfig = {
  url: config.database.url,
  logQueries: config.database.logQueries,
};
