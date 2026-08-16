import { ApiResponse } from "../types/index.js";

const BASE_URL = "/api/v1";

const TOKEN_KEY = "st_solutions_access_token";
const REFRESH_TOKEN_KEY = "st_solutions_refresh_token";
const ORG_KEY = "st_solutions_current_org_id";
const WS_KEY = "st_solutions_current_ws_id";

export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearStoredTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ORG_KEY);
  localStorage.removeItem(WS_KEY);
}

export function getStoredOrgId(): string | null {
  return localStorage.getItem(ORG_KEY);
}

export function setStoredOrgId(orgId: string | null): void {
  if (orgId) localStorage.setItem(ORG_KEY, orgId);
  else localStorage.removeItem(ORG_KEY);
}

export function getStoredWsId(): string | null {
  return localStorage.getItem(WS_KEY);
}

export function setStoredWsId(wsId: string | null): void {
  if (wsId) localStorage.setItem(WS_KEY, wsId);
  else localStorage.removeItem(WS_KEY);
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined | null>;
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(newToken: string) {
  refreshSubscribers.map((cb) => cb(newToken));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, params, headers: customHeaders, ...customConfig } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const token = getStoredAccessToken();
  const orgId = getStoredOrgId();
  const wsId = getStoredWsId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(orgId ? { "x-organization-id": orgId } : {}),
    ...(wsId ? { "x-workspace-id": wsId } : {}),
    ...(customHeaders as Record<string, string>),
  };

  const config: RequestInit = {
    method: options.method || (body ? "POST" : "GET"),
    headers,
    ...customConfig,
  };

  if (body) {
    config.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Handle Token Expiration and Refresh
    if (response.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
      const refreshToken = getStoredRefreshToken();

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newAccessToken = refreshData.data?.accessToken;
              if (newAccessToken) {
                setStoredTokens(newAccessToken);
                onRefreshed(newAccessToken);
              } else {
                throw new Error("Invalid refresh payload");
              }
            } else {
              clearStoredTokens();
              window.dispatchEvent(new CustomEvent("st_auth_logout"));
              throw new ApiError("Session expired", 401);
            }
          } catch (err) {
            clearStoredTokens();
            window.dispatchEvent(new CustomEvent("st_auth_logout"));
            throw err;
          } finally {
            isRefreshing = false;
          }
        }

        // Retry original request with new token after refresh completes
        return new Promise<ApiResponse<T>>((resolve, reject) => {
          subscribeTokenRefresh(async (newToken: string) => {
            try {
              headers["Authorization"] = `Bearer ${newToken}`;
              const retryRes = await fetch(url, { ...config, headers });
              const retryData = await retryRes.json();
              resolve(retryData);
            } catch (retryErr) {
              reject(retryErr);
            }
          });
        });
      } else {
        clearStoredTokens();
        window.dispatchEvent(new CustomEvent("st_auth_logout"));
      }
    }

    const text = await response.text();
    let data: any = {};
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP error ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      (error as Error).message || "Network request failed",
      0
    );
  }
}
