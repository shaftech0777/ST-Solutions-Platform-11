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

export function isTokenExpired(token: string | null, bufferSeconds = 30): boolean {
  if (!token || typeof token !== "string") return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 <= Date.now() + bufferSeconds * 1000;
  } catch {
    return true;
  }
}

let refreshPromise: Promise<string | null> | null = null;

export async function performTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken || isTokenExpired(refreshToken, 10)) {
        clearStoredTokens();
        return null;
      }

      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) {
        clearStoredTokens();
        return null;
      }

      const refreshText = await refreshRes.text();
      let refreshData: any = {};
      if (refreshText && refreshText.trim().length > 0) {
        try {
          refreshData = JSON.parse(refreshText);
        } catch {
          refreshData = { message: refreshText };
        }
      }

      const newAccessToken = refreshData?.data?.accessToken;
      const newRefreshToken = refreshData?.data?.refreshToken;

      if (newAccessToken) {
        setStoredTokens(newAccessToken, newRefreshToken || refreshToken);
        return newAccessToken;
      } else {
        clearStoredTokens();
        return null;
      }
    } catch {
      clearStoredTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
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

  let token = getStoredAccessToken();
  const isAuthEndpoint = endpoint.includes("/auth/login") || endpoint.includes("/auth/refresh");

  // Proactively refresh access token if expired before sending request
  if (token && isTokenExpired(token) && !isAuthEndpoint) {
    const refreshedToken = await performTokenRefresh();
    if (refreshedToken) {
      token = refreshedToken;
    }
  }

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
    let response = await fetch(url, config);

    // Handle Token Expiration (401) and seamless automatic refresh
    if (response.status === 401 && !isAuthEndpoint) {
      const newAccessToken = await performTokenRefresh();

      if (newAccessToken) {
        // Retry the request with the refreshed access token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        response = await fetch(url, { ...config, headers: retryHeaders });
      } else {
        clearStoredTokens();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("st_auth_logout"));
        }
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
