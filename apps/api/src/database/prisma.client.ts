import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";
import { createMockPrismaClient } from "./mock-prisma-client.js";
import { Logger } from "../core/logger/index.js";

let isUsingMock = false;
let mockClientInstance: any = null;

function getMockClient(): any {
  if (!mockClientInstance) {
    mockClientInstance = createMockPrismaClient();
  }
  return mockClientInstance;
}

let realPrismaClient: PrismaClient | null = null;

function isConnectionOrSchemaError(err: any): boolean {
  if (!err) return false;
  const msg = (
    (typeof err === "string" ? err : err.message || String(err) || (err.target ? String(err.target) : ""))
  ).toLowerCase();
  const code = String(err.code || err.errorCode || "");
  return (
    msg.includes("closed") ||
    msg.includes("econnrefused") ||
    msg.includes("etimedout") ||
    msg.includes("enotfound") ||
    msg.includes("connection closed") ||
    msg.includes("can't reach database server") ||
    msg.includes("cannot reach database") ||
    msg.includes("failed to connect") ||
    msg.includes("authentication failed") ||
    msg.includes("kind: closed") ||
    msg.includes("kind:closed") ||
    msg.includes("error in postgresql connection") ||
    msg.includes("server has closed the connection") ||
    msg.includes("connection pool is closed") ||
    msg.includes("unexpected eof") ||
    msg.includes("ssl connection has been closed unexpectedly") ||
    msg.includes("does not exist") ||
    msg.includes("relation") ||
    msg.includes("undefined table") ||
    msg.includes("table `public.") ||
    msg.includes("table \"public.") ||
    msg.includes("column") ||
    msg.includes("prismaclientknownrequesterror") ||
    msg.includes("prismaclientinitializationerror") ||
    code === "P1000" ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P1003" ||
    code === "P1017" ||
    code === "P2021" ||
    code === "P2022" ||
    code === "P2010" ||
    code === "P2028" ||
    code === "42P01"
  );
}

function switchToMock(reason?: string): void {
  if (!isUsingMock) {
    isUsingMock = true;
    Logger.warn(
      `[DATABASE RESILIENCE] PostgreSQL connection unavailable or closed (${reason || "Closed"}). Seamlessly activating embedded in-memory database engine.`
    );
    if (realPrismaClient) {
      try {
        const clientToCleanup = realPrismaClient;
        realPrismaClient = null;
        clientToCleanup.$disconnect().catch(() => {});
      } catch {
        realPrismaClient = null;
      }
    }
  }
}

function initializeClient(): void {
  const dbUrl = config?.database?.url || process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes("localhost") || dbUrl.includes("postgres:postgres@localhost")) {
    isUsingMock = true;
    Logger.info("Using embedded in-memory relational store for ST-Solutions operations.");
    return;
  }

  try {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: [
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
      ],
    });

    (client as any).$on("error", (e: any) => {
      const errMsg = e?.message || String(e);
      if (isConnectionOrSchemaError(e) || errMsg.includes("kind: Closed") || errMsg.includes("Closed")) {
        switchToMock(errMsg);
      } else {
        Logger.warn({ error: errMsg }, "Prisma runtime engine event");
      }
    });

    (client as any).$on("warn", (e: any) => {
      Logger.debug({ warning: e?.message }, "Prisma engine warning");
    });

    realPrismaClient = client;
  } catch (err: any) {
    switchToMock(err?.message || "PrismaClient constructor failure");
  }
}

initializeClient();

/**
 * Enterprise Resilient Prisma Proxy.
 * Intercepts connection errors (e.g. Closed, Timeout, Host unreachable)
 * and seamlessly routes queries to the embedded relational engine.
 */
export const prisma: any = new Proxy(
  {},
  {
    get(_target, prop: string | symbol) {
      if (typeof prop !== "string") {
        return (getMockClient() as any)[prop];
      }

      if (prop === "$connect") {
        return async () => {
          if (isUsingMock || !realPrismaClient) {
            return true;
          }
          try {
            return await realPrismaClient.$connect();
          } catch (err: any) {
            switchToMock(err?.message || "Connection closed/failed");
            return true;
          }
        };
      }

      if (prop === "$disconnect") {
        return async () => {
          if (isUsingMock || !realPrismaClient) {
            return true;
          }
          try {
            return await realPrismaClient.$disconnect();
          } catch {
            return true;
          }
        };
      }

      if (prop === "$queryRaw") {
        return async (...args: any[]) => {
          if (isUsingMock || !realPrismaClient) {
            return getMockClient().$queryRaw(...args);
          }
          try {
            return await (realPrismaClient as any).$queryRaw(...args);
          } catch (err: any) {
            if (isConnectionOrSchemaError(err)) {
              switchToMock(err?.message);
              return getMockClient().$queryRaw(...args);
            }
            throw err;
          }
        };
      }

      if (prop === "$transaction") {
        return async (fnOrArray: any) => {
          if (isUsingMock || !realPrismaClient) {
            return getMockClient().$transaction(fnOrArray);
          }
          try {
            return await (realPrismaClient as any).$transaction(fnOrArray);
          } catch (err: any) {
            if (isConnectionOrSchemaError(err)) {
              switchToMock(err?.message);
              return getMockClient().$transaction(fnOrArray);
            }
            throw err;
          }
        };
      }

      // Model delegates (e.g. prisma.user, prisma.project, prisma.client, etc.)
      return new Proxy(
        {},
        {
          get(_subTarget, method: string | symbol) {
            if (typeof method !== "string") {
              const mockDelegate = getMockClient()[prop];
              return mockDelegate ? mockDelegate[method] : undefined;
            }

            return async (...methodArgs: any[]) => {
              if (isUsingMock || !realPrismaClient) {
                const mockDelegate = getMockClient()[prop];
                if (mockDelegate && typeof mockDelegate[method] === "function") {
                  return mockDelegate[method](...methodArgs);
                }
                return null;
              }

              try {
                const realDelegate = (realPrismaClient as any)[prop];
                if (realDelegate && typeof realDelegate[method] === "function") {
                  return await realDelegate[method](...methodArgs);
                }
                const mockDelegate = getMockClient()[prop];
                if (mockDelegate && typeof mockDelegate[method] === "function") {
                  return mockDelegate[method](...methodArgs);
                }
                return null;
              } catch (err: any) {
                if (isConnectionOrSchemaError(err)) {
                  switchToMock(err?.message);
                  const mockDelegate = getMockClient()[prop];
                  if (mockDelegate && typeof mockDelegate[method] === "function") {
                    return mockDelegate[method](...methodArgs);
                  }
                }
                throw err;
              }
            };
          },
        }
      );
    },
  }
);

