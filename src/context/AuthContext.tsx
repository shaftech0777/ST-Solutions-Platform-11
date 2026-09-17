import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Organization, Workspace } from "../types/index.js";
import { authService } from "../api/services/auth.service.js";
import { organizationsService } from "../api/services/organizations.service.js";
import { workspacesService } from "../api/services/workspaces.service.js";
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  getStoredOrgId,
  setStoredOrgId,
  getStoredWsId,
  setStoredWsId,
  isTokenExpired,
  performTokenRefresh } from "../api/client.js";

interface AuthContextType {
  currentUser: User | null;
  permissions: string[];
  organizations: Organization[];
  currentOrganization: Organization | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email?: string; username?: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    accountType?: "ADMIN" | "SUB_ADMIN" | "MANAGER" | "MEMBER" | "CLIENT";
    organizationName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  switchWorkspace: (wsId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTenantScope = useCallback(async (selectedOrgId?: string, selectedWsId?: string) => {
    try {
      const orgsRes = await organizationsService.getAll();
      const orgList = Array.isArray(orgsRes.data) ? orgsRes.data : [];
      setOrganizations(orgList);

      let activeOrg = orgList.find((o) => o.id === selectedOrgId) || orgList[0] || null;
      setCurrentOrganization(activeOrg);
      if (activeOrg) {
        setStoredOrgId(activeOrg.id);
      } else {
        setStoredOrgId(null);
      }

      if (activeOrg) {
        try {
          const wsRes = await workspacesService.getAll(activeOrg.id);
          const wsList = Array.isArray(wsRes.data) ? wsRes.data : [];
          setWorkspaces(wsList);

          let activeWs = wsList.find((w) => w.id === selectedWsId) || wsList[0] || null;
          setCurrentWorkspace(activeWs);
          if (activeWs) {
            setStoredWsId(activeWs.id);
          } else {
            setStoredWsId(null);
          }
        } catch (wsErr) {
          console.warn("Could not load workspaces for active organization:", wsErr);
          setWorkspaces([]);
          setCurrentWorkspace(null);
          setStoredWsId(null);
        }
      } else {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setStoredWsId(null);
      }
    } catch (err) {
      console.warn("Failed to load tenant scope:", err);
      setOrganizations([]);
      setCurrentOrganization(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    let token = getStoredAccessToken();
    const refreshToken = getStoredRefreshToken();

    // Proactively check if existing access token is expired, and attempt refresh if refreshToken exists
    if ((!token || isTokenExpired(token)) && refreshToken) {
      const refreshedToken = await performTokenRefresh();
      if (refreshedToken) {
        token = refreshedToken;
      } else {
        token = null;
      }
    }

    if (!token) {
      clearStoredTokens();
      setCurrentUser(null);
      setPermissions([]);
      setOrganizations([]);
      setCurrentOrganization(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setIsLoading(false);
      return;
    }

    // Step 1: Verify authenticated user with /auth/me
    let userObj: User | null = null;
    let userPerms: string[] = [];

    try {
      const meRes = await authService.getMe();
      const rawData = (meRes as any)?.data || meRes;

      if ((meRes.success || rawData?.id || rawData?.user?.id) && rawData) {
        userObj = {
          id: rawData.id || rawData.user?.id,
          email: rawData.email || rawData.user?.email,
          accountType: rawData.accountType || rawData.user?.accountType || "MEMBER",
          status: rawData.status || rawData.user?.status || "ACTIVE",
          roleId: rawData.roleId || rawData.user?.roleId || null,
          createdAt: rawData.createdAt || rawData.user?.createdAt || new Date().toISOString(),
          updatedAt: rawData.updatedAt || rawData.user?.updatedAt || new Date().toISOString(),
          profile: rawData.profile || rawData.user?.profile || null,
          role: rawData.roleName
            ? {
                id: rawData.roleId || "",
                name: rawData.roleName,
                permissions: (rawData.permissions || []).map((p: string) => ({
                  permission: { id: p, name: p } })) }
            : rawData.role || rawData.user?.role || null };

        userPerms = Array.isArray(rawData?.permissions)
          ? rawData.permissions
          : Array.isArray(userObj.role?.permissions)
          ? userObj.role.permissions.map((p: any) => p.permission?.name || p.name || String(p))
          : [];

        setCurrentUser(userObj);
        setPermissions(userPerms);
      } else {
        throw new Error("Invalid session response from /auth/me");
      }
    } catch (authErr: any) {
      console.error("Authentication session check failed:", authErr);
      clearStoredTokens();
      setCurrentUser(null);
      setPermissions([]);
      setOrganizations([]);
      setCurrentOrganization(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setIsLoading(false);
      return;
    }

    // Step 2: Tenant Scope Loading - COMPLETELY SEPARATED FROM AUTH!
    // Even if tenant data is empty or errors, the valid authenticated admin session is preserved!
    try {
      const savedOrgId = getStoredOrgId();
      const savedWsId = getStoredWsId();
      await fetchTenantScope(savedOrgId || undefined, savedWsId || undefined);
    } catch (tenantErr) {
      console.warn("Tenant scope loading encountered an issue (authenticated session preserved):", tenantErr);
      setOrganizations([]);
      setCurrentOrganization(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTenantScope]);

  useEffect(() => {
    refreshUser();

    const handleLogoutEvent = () => {
      setCurrentUser(null);
      setPermissions([]);
      setOrganizations([]);
      setCurrentOrganization(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
    };

    window.addEventListener("st_auth_logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("st_auth_logout", handleLogoutEvent);
    };
  }, [refreshUser]);

  const login = async (credentials: { email?: string; username?: string; password: string; identifier?: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.data?.accessToken) {
        setStoredTokens(res.data.accessToken, res.data.refreshToken);

        // Populate user immediately from login response payload to eliminate intermediate null state
        if (res.data.user) {
          const u = res.data.user as any;
          setCurrentUser({
            id: u.id,
            email: u.email,
            accountType: u.accountType || "MEMBER",
            status: u.status || "ACTIVE",
            roleId: u.roleId || null,
            createdAt: u.createdAt || new Date().toISOString(),
            updatedAt: u.updatedAt || new Date().toISOString(),
            profile: u.profile || null,
            role: u.role || null,
          });
          if (Array.isArray(u.permissions)) {
            setPermissions(u.permissions);
          }
        }

        await refreshUser();
      } else {
        throw new Error(res.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    accountType?: "ADMIN" | "SUB_ADMIN" | "MANAGER" | "MEMBER" | "CLIENT";
    organizationName?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      if (res.data?.accessToken) {
        setStoredTokens(res.data.accessToken, res.data.refreshToken);
        await refreshUser();
      } else {
        throw new Error(res.message || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Clean up client state regardless of server reachability
    } finally {
      clearStoredTokens();
      setCurrentUser(null);
      setPermissions([]);
      setOrganizations([]);
      setCurrentOrganization(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
    }
  };

  const switchOrganization = async (orgId: string) => {
    const found = organizations.find((o) => o.id === orgId);
    if (found) {
      setCurrentOrganization(found);
      setStoredOrgId(found.id);
      
      // Fetch workspaces for new org
      const wsRes = await workspacesService.getAll(found.id);
      const wsList = Array.isArray(wsRes.data) ? wsRes.data : [];
      setWorkspaces(wsList);
      const firstWs = wsList[0] || null;
      setCurrentWorkspace(firstWs);
      setStoredWsId(firstWs ? firstWs.id : null);
    }
  };

  const switchWorkspace = async (wsId: string) => {
    const found = workspaces.find((w) => w.id === wsId);
    if (found) {
      setCurrentWorkspace(found);
      setStoredWsId(found.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        permissions,
        organizations,
        currentOrganization,
        workspaces,
        currentWorkspace,
        isLoading,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        switchOrganization,
        switchWorkspace,
        refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
