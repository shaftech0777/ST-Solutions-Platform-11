import bcrypt from "bcrypt";
import { config } from "../config/index.js";

// Types
export interface MemoryStore {
  users: any[];
  profiles: any[];
  sessions: any[];
  roles: any[];
  permissions: any[];
  rolePermissions: any[];
  organizations: any[];
  workspaces: any[];
  organizationMembers: any[];
  workspaceMembers: any[];
  clients: any[];
  projects: any[];
  projectUpdates: any[];
  payments: any[];
  applicants: any[];
  auditLogs: any[];
  notifications: any[];
  systemSettings: any[];
  administrativeNotices: any[];
  userPerformances: any[];
  themeSettings: any[];
  cmsSections: any[];
  members: any[];
  ranks: any[];
}

function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export function createInitialData(): MemoryStore {
  const adminEmail = (config?.auth?.adminEmail || process.env.ADMIN_EMAIL || "admin@st-solutions.com").toLowerCase().trim();
  const adminPassword = config?.auth?.adminPassword || process.env.ADMIN_PASSWORD || "Admin@123456";
  const subAdminEmail = (config?.auth?.subAdminEmail || process.env.SUB_ADMIN_EMAIL || "subadmin@st-solutions.com").toLowerCase().trim();
  const subAdminPassword = config?.auth?.subAdminPassword || process.env.SUB_ADMIN_PASSWORD || "SubAdmin@123456";

  const adminPasswordHash = bcrypt.hashSync(adminPassword, 10);
  const subAdminPasswordHash = bcrypt.hashSync(subAdminPassword, 10);
  const now = new Date();

  const permissions = [
    { id: "perm-1", name: "projects.create", description: "Create projects", module: "PROJECTS" },
    { id: "perm-2", name: "projects.read", description: "View projects", module: "PROJECTS" },
    { id: "perm-3", name: "projects.update", description: "Update projects", module: "PROJECTS" },
    { id: "perm-4", name: "projects.delete", description: "Delete projects", module: "PROJECTS" },
    { id: "perm-5", name: "clients.create", description: "Create clients", module: "CLIENTS" },
    { id: "perm-6", name: "clients.read", description: "View clients", module: "CLIENTS" },
    { id: "perm-7", name: "clients.update", description: "Update clients", module: "CLIENTS" },
    { id: "perm-8", name: "clients.delete", description: "Delete clients", module: "CLIENTS" },
    { id: "perm-9", name: "payments.create", description: "Create payments", module: "PAYMENTS" },
    { id: "perm-10", name: "payments.read", description: "View payments", module: "PAYMENTS" },
    { id: "perm-11", name: "payments.update", description: "Update payments", module: "PAYMENTS" },
    { id: "perm-12", name: "payments.delete", description: "Delete payments", module: "PAYMENTS" },
    { id: "perm-13", name: "applicants.create", description: "Create applicants", module: "APPLICANTS" },
    { id: "perm-14", name: "applicants.read", description: "View applicants", module: "APPLICANTS" },
    { id: "perm-15", name: "applicants.update", description: "Update applicants", module: "APPLICANTS" },
    { id: "perm-16", name: "applicants.delete", description: "Delete applicants", module: "APPLICANTS" },
    { id: "perm-17", name: "members.invite", description: "Invite members", module: "MEMBERS" },
    { id: "perm-18", name: "members.read", description: "View members", module: "MEMBERS" },
    { id: "perm-19", name: "members.update", description: "Update member roles", module: "MEMBERS" },
    { id: "perm-20", name: "members.delete", description: "Remove members", module: "MEMBERS" },
    { id: "perm-21", name: "organizations.update", description: "Manage organization", module: "ORGANIZATIONS" },
    { id: "perm-22", name: "audit.read", description: "View audit logs", module: "AUDIT" },
    { id: "perm-23", name: "ai.query", description: "Access AI Assistant", module: "AI" },
    { id: "perm-24", name: "users.create", description: "Create user accounts", module: "USERS" },
    { id: "perm-25", name: "users.read", description: "View user accounts", module: "USERS" },
    { id: "perm-26", name: "users.update", description: "Update user accounts", module: "USERS" },
    { id: "perm-27", name: "users.delete", description: "Delete user accounts", module: "USERS" },
  ];

  const roles = [
    { id: "role-admin", name: "ADMIN", description: "Full system administration access", isSystem: true },
    { id: "role-subadmin", name: "SUB_ADMIN", description: "Administrative access with user restrictions", isSystem: true },
    { id: "role-manager", name: "MANAGER", description: "Project & Operations Manager", isSystem: true },
    { id: "role-member", name: "MEMBER", description: "Standard Organization Contributor", isSystem: true },
    { id: "role-client", name: "CLIENT", description: "Client Portal Access", isSystem: true },
  ];

  const rolePermissions = permissions.map((p, idx) => ({
    id: `rp-admin-${idx + 1}`,
    roleId: "role-admin",
    permissionId: p.id,
  }));

  const userAdmin = {
    id: "user-admin-1",
    email: adminEmail,
    passwordHash: adminPasswordHash,
    accountType: "ADMIN",
    status: "ACTIVE",
    roleId: "role-admin",
    createdAt: now,
    updatedAt: now,
  };

  const userSubAdmin = {
    id: "user-subadmin-1",
    email: subAdminEmail,
    passwordHash: subAdminPasswordHash,
    accountType: "SUB_ADMIN",
    status: "ACTIVE",
    roleId: "role-subadmin",
    createdAt: now,
    updatedAt: now,
  };

  const profileAdmin = {
    id: "profile-admin-1",
    userId: "user-admin-1",
    fullName: "Shaf Tech Admin",
    title: "Executive Director",
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
  };

  const profileSubAdmin = {
    id: "profile-subadmin-1",
    userId: "user-subadmin-1",
    fullName: "Jordan Lee (Sub-Admin)",
    title: "Deputy Operations Lead",
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
  };

  const org = {
    id: "org-default-1",
    name: "Shaf Tech Solutions",
    slug: "shaf-tech-solutions",
    status: "ACTIVE",
    ownerId: "user-admin-1",
    createdAt: now,
    updatedAt: now,
  };

  const ws = {
    id: "ws-default-1",
    organizationId: "org-default-1",
    name: "Main Operations",
    slug: "main-operations",
    description: "Primary workspace for ST-Solutions projects and services",
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  const orgMember = {
    id: "om-admin-1",
    organizationId: "org-default-1",
    userId: "user-admin-1",
    role: "OWNER",
    createdAt: now,
    updatedAt: now,
  };

  const wsMember = {
    id: "wm-admin-1",
    workspaceId: "ws-default-1",
    userId: "user-admin-1",
    role: "ADMIN",
    createdAt: now,
    updatedAt: now,
  };

  const auditLog1 = {
    id: "aud-1",
    organizationId: "org-default-1",
    workspaceId: "ws-default-1",
    userId: "user-admin-1",
    action: "SYSTEM_INITIALIZED",
    entityType: "System",
    entityId: "system-root",
    description: "ST-Solutions Enterprise Platform initialized with Multi-Tenant Architecture.",
    ipAddress: "127.0.0.1",
    metadata: { version: "1.0.0" },
    createdAt: new Date(Date.now() - 24 * 3600000),
  };

  const notification1 = {
    id: "notif-1",
    userId: "user-admin-1",
    title: "Platform Ready",
    message: "ST-Solutions Enterprise Operations Dashboard is active and connected.",
    isRead: false,
    link: "/dashboard",
    type: "SYSTEM",
    createdAt: now,
  };

  const systemSettings = [
    { id: "set-1", key: "platform_name", value: "ST-Solutions Enterprise", category: "GENERAL" },
    { id: "set-2", key: "default_currency", value: "USD", category: "FINANCE" },
    { id: "set-3", key: "ai_model", value: "gemini-3.7-flash", category: "AI" },
    { id: "set-4", key: "maintenance_mode", value: "false", category: "SECURITY" },
  ];

  const defaultTheme = {
    id: "theme-default-1",
    primaryColor: "#D4AF37",
    secondaryColor: "#1E293B",
    accentColor: "#3B82F6",
    backgroundColor: "#F8FAFC",
    textColor: "#0F172A",
    borderColor: "#E2E8F0",
    buttonRadius: "12px",
    fontFamily: "sans",
    darkMode: false,
    logoUrl: "/brand-logo.png",
    faviconUrl: "/favicon.ico",
    createdAt: now,
    updatedAt: now,
  };

  const defaultCMSSections = [
    {
      id: "cms-hero-1",
      sectionKey: "HERO",
      title: "Pioneering Software, Cloud & AI Engineering",
      subtitle: "Enterprise-grade digital solutions tailored for exponential scalability and mission-critical execution.",
      content: "Shaf Tech Solutions delivers bespoke software engineering, AI automation, cloud architectures, and digital security solutions.",
      badgeText: "ST-SOLUTIONS PLATFORM 11",
      isVisible: true,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "cms-about-1",
      sectionKey: "ABOUT",
      title: "Engineering Excellence with Global Impact",
      subtitle: "A trusted technology partner for global enterprises and ambitious startups.",
      content: "We blend deep technical capability with strategic execution to build software that scales globally.",
      badgeText: "ABOUT US",
      isVisible: true,
      displayOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "cms-services-1",
      sectionKey: "SERVICES",
      title: "Specialized Technology Capabilities",
      subtitle: "End-to-end technical execution across modern cloud, web, mobile, and AI stacks.",
      content: "From custom full-stack web platforms to autonomous AI workflows, our engineers build robust solutions.",
      badgeText: "OUR EXPERTISE",
      isVisible: true,
      displayOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    users: [userAdmin, userSubAdmin],
    profiles: [profileAdmin, profileSubAdmin],
    sessions: [],
    roles,
    permissions,
    rolePermissions,
    organizations: [org],
    workspaces: [ws],
    organizationMembers: [orgMember],
    workspaceMembers: [wsMember],
    clients: [],
    projects: [],
    projectUpdates: [],
    payments: [],
    applicants: [],
    auditLogs: [auditLog1],
    notifications: [notification1],
    systemSettings,
    administrativeNotices: [],
    userPerformances: [],
    themeSettings: [defaultTheme],
    cmsSections: defaultCMSSections,
    members: [],
    ranks: [
      { id: "rank-1", name: "Specialist", level: 1, colorCode: "#3B82F6" },
      { id: "rank-2", name: "Lead Manager", level: 2, colorCode: "#D4AF37" },
    ],
  };
}

export class InMemoryDatabase {
  public data: MemoryStore;

  constructor() {
    this.data = createInitialData();
  }

  public reset() {
    const fresh = createInitialData();
    if (this.data) {
      for (const key of Object.keys(this.data) as (keyof MemoryStore)[]) {
        (this.data as any)[key] = (fresh as any)[key];
      }
    } else {
      this.data = fresh;
    }
  }
}

export const memoryDb = new InMemoryDatabase();
