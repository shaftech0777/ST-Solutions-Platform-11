import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";
import { createMockPrismaClient } from "./mock-prisma-client.js";
import { Logger } from "../core/logger/index.js";

/**
 * Sanitizes and normalizes the PostgreSQL connection URL for Prisma.
 * Preserves the exact provider parameters (Render, Neon, Supabase, self-hosted)
 * without forcibly injecting incompatible SSL or timeout overrides.
 */
export function normalizePostgresDatabaseUrl(rawUrl?: string): string | undefined {
  if (!rawUrl || typeof rawUrl !== "string") {
    return undefined;
  }

  let dbUrl = rawUrl.trim();
  if (!dbUrl) return undefined;

  // Convert postgres:// to postgresql:// for standard PostgreSQL URI schema compatibility
  if (dbUrl.startsWith("postgres://")) {
    dbUrl = "postgresql://" + dbUrl.slice(11);
  }

  return dbUrl;
}

/**
 * Safely masks database credentials for logging without leaking passwords.
 */
export function maskDatabaseUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return "[UNSET]";
  try {
    const parsed = new URL(rawUrl.startsWith("postgres://") ? "postgresql://" + rawUrl.slice(11) : rawUrl);
    const host = parsed.hostname;
    const port = parsed.port || "5432";
    const database = parsed.pathname.replace(/^\//, "");
    const user = parsed.username ? `${parsed.username}@` : "";
    return `postgresql://${user}***:${port}/${database}`;
  } catch {
    return "[MALFORMED_URL]";
  }
}

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const rawDbUrl = config?.database?.url || process.env.DATABASE_URL;
const normalizedDbUrl = normalizePostgresDatabaseUrl(rawDbUrl);

let authoritativePrismaClient: PrismaClient | null = null;
let mockPrismaClient: any = null;

function getMockClient(): any {
  if (!mockPrismaClient) {
    mockPrismaClient = createMockPrismaClient();
  }
  return mockPrismaClient;
}

if (normalizedDbUrl) {
  try {
    authoritativePrismaClient = new PrismaClient({
      datasources: {
        db: {
          url: normalizedDbUrl,
        },
      },
      log: isProduction
        ? [
            { emit: "event", level: "error" },
            { emit: "event", level: "warn" },
          ]
        : [
            { emit: "event", level: "error" },
            { emit: "event", level: "warn" },
          ],
    });

    (authoritativePrismaClient as any).$on("error", (e: any) => {
      const msg = e?.message || "";
      // When hosted PostgreSQL providers (Render, Neon, Supabase, RDS) terminate idle sockets,
      // Prisma's connection pool detects the closed socket and safely re-establishes connections on subsequent queries.
      if (
        msg.includes("kind: Closed") ||
        msg.includes("Closed, cause: None") ||
        msg.includes("connection closed") ||
        msg.includes("socket closed")
      ) {
        Logger.debug({ message: msg, target: e?.target }, "Prisma PostgreSQL idle connection recycled by pool.");
        return;
      }
      Logger.error({ message: msg, target: e?.target }, "Prisma PostgreSQL engine error encountered.");
    });

    (authoritativePrismaClient as any).$on("warn", (e: any) => {
      Logger.warn({ message: e?.message }, "Prisma PostgreSQL warning encountered.");
    });

    Logger.info(
      { dbTarget: maskDatabaseUrl(normalizedDbUrl) },
      "Authoritative PostgreSQL PrismaClient initialized."
    );
  } catch (err: any) {
    Logger.error(
      { error: err?.message, dbTarget: maskDatabaseUrl(normalizedDbUrl) },
      "Failed to instantiate PrismaClient."
    );
    if (isProduction) {
      throw new Error(`FATAL: PostgreSQL PrismaClient initialization failed in production: ${err?.message}`);
    }
  }
} else if (isProduction) {
  throw new Error("FATAL: DATABASE_URL is missing or invalid in production environment. PostgreSQL is strictly required.");
}

/**
 * Authoritative Prisma Client Export.
 * IN PRODUCTION: Strictly routes all operations to the single authoritative PrismaClient connected to PostgreSQL.
 * IN TEST: Uses isolated test client for lightning-fast, zero-dependency unit and regression testing.
 * IN DEV: Uses authoritative PostgreSQL connection when DATABASE_URL is available, otherwise mock store for local dev.
 */
export const prisma: PrismaClient = (
  isProduction
    ? (authoritativePrismaClient ||
        (() => {
          throw new Error("FATAL: PostgreSQL PrismaClient is not initialized in production environment.");
        })())
    : isTest
    ? getMockClient()
    : authoritativePrismaClient || getMockClient()
) as PrismaClient;
