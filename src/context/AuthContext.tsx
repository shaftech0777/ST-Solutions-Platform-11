import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Organization, Workspace } from "../types/index.js";
import { authService } from "../api/services/auth.service.js";
import { organizationsService } from "../api/services/organizations.service.js";
import { workspacesService } from "../api/services/workspaces.service.js";
import {
  getStoredAccessToken,
  setStoredTokens,
  clearStoredTokens,
  getStoredOrgId,
  setStoredOrgId,
  getStoredWsId,
  setStoredWsId,
} from "../api/client.js";

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
  register: (data: { email: string; password: string; fullName?: string }) => Promise<void>;
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
      } else {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setStoredWsId(null);
      }
    } catch (err) {
      console.warn("Failed to load tenant scope:", err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setCurrentUser(null);
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    try {
      const meRes = await authService.getMe();
      const rawData = meRes.data as any;
      const user = rawData?.user || (rawData?.id ? rawData : null);

      if (meRes.success && user) {
        setCurrentUser(user);
        
        // Extract permissions array
        const userPerms = rawData?.permissions || user.permissions || [];
        if (user.role?.permissions && Array.isArray(user.role.permissions)) {
          const rolePerms = user.role.permissions.map((p: any) => p.permission?.name || p.name || String(p));
          setPermissions(Array.from(new Set([...userPerms, ...rolePerms])));
        } else {
          setPermissions(userPerms);
        }

        const savedOrgId = getStoredOrgId();
        const savedWsId = getStoredWsId();
        await fetchTenantScope(savedOrgId || undefined, savedWsId || undefined);
      } else {
        throw new Error("Invalid session response");
      }
    } catch (err) {
      clearStoredTokens();
      setCurrentUser(null);
      setPermissions([]);
      setCurrentOrganization(null);
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
      setCurrentOrganization(null);
      setCurrentWorkspace(null);
    };

    window.addEventListener("st_auth_logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("st_auth_logout", handleLogoutEvent);
    };
  }, [refreshUser]);

  const login = async (credentials: { email?: string; username?: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.data?.accessToken) {
        setStoredTokens(res.data.accessToken, res.data.refreshToken);
        setCurrentUser(res.data.user);

        if (res.data.organizations && res.data.organizations.length > 0) {
          setOrganizations(res.data.organizations);
          const firstOrg = res.data.organizations[0];
          setCurrentOrganization(firstOrg);
          setStoredOrgId(firstOrg.id);
        }

        if (res.data.workspaces && res.data.workspaces.length > 0) {
          setWorkspaces(res.data.workspaces);
          const firstWs = res.data.workspaces[0];
          setCurrentWorkspace(firstWs);
          setStoredWsId(firstWs.id);
        }

        await refreshUser();
      } else {
        throw new Error(res.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; fullName?: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      if (res.data?.accessToken) {
        setStoredTokens(res.data.accessToken, res.data.refreshToken);
        setCurrentUser(res.data.user);
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
      // Ignore network failure on logout
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
        refreshUser,
      }}
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
