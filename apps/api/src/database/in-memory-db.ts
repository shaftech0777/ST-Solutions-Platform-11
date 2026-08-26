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
  const managerPasswordHash = bcrypt.hashSync("Manager@123456", 10);
  const memberPasswordHash = bcrypt.hashSync("Member@123456", 10);
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

  const userManager = {
    id: "user-manager-1",
    email: "manager@st-solutions.com",
    passwordHash: managerPasswordHash,
    accountType: "MANAGER",
    status: "ACTIVE",
    roleId: "role-manager",
    createdAt: now,
    updatedAt: now,
  };

  const userMember = {
    id: "user-member-1",
    email: "member@st-solutions.com",
    passwordHash: memberPasswordHash,
    accountType: "MEMBER",
    status: "ACTIVE",
    roleId: "role-member",
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

  const profileManager = {
    id: "profile-manager-1",
    userId: "user-manager-1",
    fullName: "Morgan Taylor (Manager)",
    title: "Project Delivery Manager",
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
  };

  const profileMember = {
    id: "profile-member-1",
    userId: "user-member-1",
    fullName: "Alex Rivera (Member)",
    title: "Full-Stack Specialist",
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

  const client1 = {
    id: "cli-1",
    organizationId: "org-default-1",
    workspaceId: "ws-default-1",
    fullName: "Elena Rostova",
    companyName: "Apex Global Capital",
    email: "e.rostova@apexcap.io",
    phoneNumber: "+1 415 555 0192",
    clientStatus: "ACTIVE",
    clientType: "ENTERPRISE",
    portalAccess: true,
    totalBilled: 145000,
    totalPaid: 95000,
    createdAt: new Date(Date.now() - 30 * 24 * 3600000),
    updatedAt: now,
  };

  const client2 = {
    id: "cli-2",
    organizationId: "org-default-1",
    workspaceId: "ws-default-1",
    fullName: "Marcus Vance",
    companyName: "HyperScale Dynamics",
    email: "marcus@hyperscale.ai",
    phoneNumber: "+1 212 555 0834",
    clientStatus: "ACTIVE",
    clientType: "RETAINER",
    portalAccess: true,
    totalBilled: 85000,
    totalPaid: 85000,
    createdAt: new Date(Date.now() - 20 * 24 * 3600000),
    updatedAt: now,
  };

  const project1 = {
    id: "proj-1",
    organizationId: "org-default-1",
    workspaceId: "ws-default-1",
    clientId: "cli-1",
    createdById: "user-admin-1",
    assignedManagerId: "user-admin-1",
    assignedMemberId: null,
    title: "Quantum Trading Core Infrastructure",
    description: "High-frequency algorithmic execution platform and telemetry pipeline.",
    category: "Software Engineering",
    projectStatus: "IN_PROGRESS",
    budget: 95000,
    currency: "USD",
    startDate: new Date(Date.now() - 15 * 24 * 3600000),
    expectedCompletionDate: new Date(Date.now() + 45 * 24 * 3600000),
    actualCompletionDate: null,
    createdAt: new Date(Date.now() - 15 * 24 * 3600000),
    updatedAt: now,
  };

  const project2 = {
    id: "proj-2",
    organizationId: "org-default-1",
    workspaceId: "ws-default-1",
    clientId: "cli-2",
    createdById: "user-admin-1",
    assignedManagerId: "user-admin-1",
    assignedMemberId: null,
    title: "Enterprise Multi-Agent LLM Orchestration",
    description: "Real-time decision intelligence engine with vector search integration.",
    category: "AI / Machine Learning",
    projectStatus: "CONFIRMED",
    budget: 85000,
    currency: "USD",
    startDate: new Date(Date.now() - 5 * 24 * 3600000),
    expectedCompletionDate: new Date(Date.now() + 60 * 24 * 3600000),
    actualCompletionDate: null,
    createdAt: new Date(Date.now() - 5 * 24 * 3600000),
    updatedAt: now,
  };

  const payment1 = {
    id: "pay-1",
    organizationId: "org-default-1",
    workspaceId: "ws-default-1",
    projectId: "proj-1",
    clientId: "cli-1",
    amount: 45000,
    currency: "USD",
    paymentStatus: "COMPLETED",
    paymentMethod: "WIRE",
    referenceNumber: "WIRE-2026-08149-APX",
    invoiceNumber: "INV-2026-001",
    notes: "Milestone 1 execution fee",
    paidAt: new Date(Date.now() - 7 * 24 * 3600000),
    createdAt: new Date(Date.now() - 10 * 24 * 3600000),
    updatedAt: now,
  };

  const payment2 = {
    id: "pay-2",
    organizationId: "org-default-1",
    workspaceId: "ws-default-1",
    projectId: "proj-2",
    clientId: "cli-2",
    amount: 50000,
    currency: "USD",
    paymentStatus: "COMPLETED",
    paymentMethod: "STRIPE",
    referenceNumber: "ch_3Pz9XkLkd8901",
    invoiceNumber: "INV-2026-002",
    notes: "Initial deployment retainer",
    paidAt: new Date(Date.now() - 2 * 24 * 3600000),
    createdAt: new Date(Date.now() - 3 * 24 * 3600000),
    updatedAt: now,
  };

  const applicant1 = {
    id: "app-1",
    organizationId: "org-default-1",
    workspaceId: "ws-default-1",
    fullName: "Julian Vance",
    fatherName: "Arthur Vance",
    email: "julian.vance@techdev.net",
    phoneNumber: "+1 650 555 0177",
    whatsappNumber: "+1 650 555 0177",
    country: "United States",
    city: "San Francisco",
    address: "100 Market Street, Suite 400",
    currentProfession: "Senior Distributed Systems Engineer",
    currentQualification: "M.S. Computer Science, Stanford University",
    skillsDescription: "Distributed state, Raft consensus, Rust, Go, TypeScript, lockless event streams",
    heardAboutSTSolutions: "Executive Recommendation",
    joiningPurpose: "Architecting real-time enterprise AI and mission-critical cloud infrastructure.",
    appliedRole: "Senior Distributed Systems Engineer",
    resumeUrl: "https://documents.st-solutions.io/resumes/julian-vance.pdf",
    stage: "TECHNICAL_INTERVIEW",
    applicationStatus: "UNDER_REVIEW",
    verificationStatus: "NOT_VERIFIED",
    score: 94,
    notes: "Demonstrated exceptional mastery of distributed state, Raft consensus, and lockless architectures.",
    createdAt: new Date(Date.now() - 4 * 24 * 3600000),
    updatedAt: now,
    answers: [],
    verifications: [],
    profiles: [],
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

  return {
    users: [userAdmin, userSubAdmin, userManager, userMember],
    profiles: [profileAdmin, profileSubAdmin, profileManager, profileMember],
    sessions: [],
    roles,
    permissions,
    rolePermissions,
    organizations: [org],
    workspaces: [ws],
    organizationMembers: [orgMember],
    workspaceMembers: [wsMember],
    clients: [client1, client2],
    projects: [project1, project2],
    projectUpdates: [],
    payments: [payment1, payment2],
    applicants: [applicant1],
    auditLogs: [auditLog1],
    notifications: [notification1],
    systemSettings,
  };
}

export class InMemoryDatabase {
  public data: MemoryStore;

  constructor() {
    this.data = createInitialData();
  }

  public reset() {
    this.data = createInitialData();
  }
}

export const memoryDb = new InMemoryDatabase();
