import { memoryDb, MemoryStore } from "./in-memory-db.js";

function matchesFilter(item: any, where: any): boolean {
  if (!where || Object.keys(where).length === 0) return true;

  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;

    if (key === "AND") {
      if (Array.isArray(val)) {
        if (!val.every((clause) => matchesFilter(item, clause))) return false;
      } else if (!matchesFilter(item, val)) {
        return false;
      }
      continue;
    }

    if (key === "OR") {
      if (Array.isArray(val)) {
        if (!val.some((clause) => matchesFilter(item, clause))) return false;
      }
      continue;
    }

    if (key === "NOT") {
      if (matchesFilter(item, val)) return false;
      continue;
    }

    const itemVal = item[key];

    if (val === null) {
      if (itemVal !== null && itemVal !== undefined) return false;
      continue;
    }

    if (typeof val === "object" && val !== null && !(val instanceof Date)) {
      if ("equals" in val && val.equals !== undefined) {
        if (itemVal !== val.equals) return false;
      }
      if ("in" in val && Array.isArray(val.in)) {
        if (!val.in.includes(itemVal)) return false;
      }
      if ("notIn" in val && Array.isArray(val.notIn)) {
        if (val.notIn.includes(itemVal)) return false;
      }
      if ("not" in val) {
        if (val.not === null) {
          if (itemVal === null || itemVal === undefined) return false;
        } else if (itemVal === val.not) {
          return false;
        }
      }
      if ("contains" in val && typeof val.contains === "string") {
        const needle = val.mode === "insensitive" ? val.contains.toLowerCase() : val.contains;
        const haystack = val.mode === "insensitive" ? String(itemVal || "").toLowerCase() : String(itemVal || "");
        if (!haystack.includes(needle)) return false;
      }
      if ("gte" in val) {
        if (!(itemVal >= val.gte)) return false;
      }
      if ("lte" in val) {
        if (!(itemVal <= val.lte)) return false;
      }
      if ("gt" in val) {
        if (!(itemVal > val.gt)) return false;
      }
      if ("lt" in val) {
        if (!(itemVal < val.lt)) return false;
      }
      continue;
    }

    if (itemVal !== val) {
      return false;
    }
  }

  return true;
}

function resolveIncludes(table: keyof MemoryStore, item: any, include: any, store: MemoryStore): any {
  if (!include || !item) return { ...item };
  const res = { ...item };

  if (table === "users") {
    if (include.profile) {
      res.profile = store.profiles.find((p) => p.userId === item.id) || null;
    }
    if (include.role) {
      const role = store.roles.find((r) => r.id === item.roleId) || null;
      if (role && include.role.include?.permissions) {
        const rps = store.rolePermissions.filter((rp) => rp.roleId === role.id);
        res.role = {
          ...role,
          permissions: rps.map((rp) => ({
            ...rp,
            permission: store.permissions.find((p) => p.id === rp.permissionId),
          })),
        };
      } else {
        res.role = role;
      }
    }
    if (include.organizationMemberships) {
      const memberships = store.organizationMembers.filter((om) => om.userId === item.id);
      res.organizationMemberships = memberships.map((om) => ({
        ...om,
        organization: store.organizations.find((o) => o.id === om.organizationId) || null,
      }));
    }
  }

  if (table === "organizations") {
    if (include.members) {
      res.members = store.organizationMembers
        .filter((om) => om.organizationId === item.id)
        .map((om) => ({
          ...om,
          user: resolveIncludes("users", store.users.find((u) => u.id === om.userId), { profile: true, role: true }, store),
        }));
    }
    if (include.workspaces) {
      res.workspaces = store.workspaces.filter((w) => w.organizationId === item.id);
    }
    if (include._count) {
      res._count = {
        members: store.organizationMembers.filter((om) => om.organizationId === item.id).length,
        workspaces: store.workspaces.filter((w) => w.organizationId === item.id).length,
        projects: store.projects.filter((p) => p.organizationId === item.id).length,
        clients: store.clients.filter((c) => c.organizationId === item.id).length,
      };
    }
  }

  if (table === "workspaces") {
    if (include.members) {
      res.members = store.workspaceMembers
        .filter((wm) => wm.workspaceId === item.id)
        .map((wm) => ({
          ...wm,
          user: resolveIncludes("users", store.users.find((u) => u.id === wm.userId), { profile: true }, store),
        }));
    }
    if (include.organization) {
      res.organization = store.organizations.find((o) => o.id === item.organizationId) || null;
    }
    if (include._count) {
      res._count = {
        members: store.workspaceMembers.filter((wm) => wm.workspaceId === item.id).length,
        projects: store.projects.filter((p) => p.workspaceId === item.id).length,
        clients: store.clients.filter((c) => c.workspaceId === item.id).length,
      };
    }
  }

  if (table === "projects") {
    if (include.client) {
      res.client = store.clients.find((c) => c.id === item.clientId) || null;
    }
    if (include.createdBy) {
      const u = store.users.find((u) => u.id === item.createdById);
      res.createdBy = u ? { ...u, profile: store.profiles.find((p) => p.userId === u.id) } : null;
    }
    if (include.manager) {
      const u = store.users.find((u) => u.id === item.assignedManagerId);
      res.manager = u ? { ...u, profile: store.profiles.find((p) => p.userId === u.id) } : null;
    }
    if (include.member) {
      const u = store.users.find((u) => u.id === item.assignedMemberId);
      res.member = u ? { ...u, profile: store.profiles.find((p) => p.userId === u.id) } : null;
    }
    if (include.updates) {
      res.updates = store.projectUpdates
        .filter((pu) => pu.projectId === item.id)
        .map((pu) => ({
          ...pu,
          createdBy: resolveIncludes("users", store.users.find((u) => u.id === pu.createdById), { profile: true }, store),
        }));
    }
    if (include._count) {
      res._count = {
        updates: store.projectUpdates.filter((pu) => pu.projectId === item.id).length,
        payments: store.payments.filter((p) => p.projectId === item.id).length,
      };
    }
  }

  if (table === "payments") {
    if (include.project) {
      res.project = store.projects.find((p) => p.id === item.projectId) || null;
    }
    if (include.client) {
      res.client = store.clients.find((c) => c.id === item.clientId) || null;
    }
  }

  if (table === "auditLogs") {
    if (include.user) {
      res.user = resolveIncludes("users", store.users.find((u) => u.id === item.userId), { profile: true }, store);
    }
  }

  return res;
}

export function createMockPrismaClient(): any {
  const store = memoryDb.data;

  const createDelegate = (table: keyof MemoryStore, defaultIdPrefix: string) => {
    return {
      findUnique: async (args: { where: any; include?: any }) => {
        const list = store[table];
        const found = list.find((item) => matchesFilter(item, args.where));
        if (!found) return null;
        return resolveIncludes(table, found, args.include, store);
      },
      findUniqueOrThrow: async (args: { where: any; include?: any }) => {
        const list = store[table];
        const found = list.find((item) => matchesFilter(item, args.where));
        if (!found) throw new Error(`Record not found in ${String(table)}`);
        return resolveIncludes(table, found, args.include, store);
      },
      findFirst: async (args: { where?: any; include?: any; orderBy?: any }) => {
        let list = store[table];
        if (args.where) {
          list = list.filter((item) => matchesFilter(item, args.where));
        }
        if (list.length === 0) return null;
        return resolveIncludes(table, list[0], args.include, store);
      },
      findMany: async (args: { where?: any; include?: any; skip?: number; take?: number; orderBy?: any }) => {
        let list = store[table];
        if (args.where) {
          list = list.filter((item) => matchesFilter(item, args.where));
        }
        if (args.orderBy) {
          const [field, order] = Object.entries(args.orderBy)[0] as [string, string];
          list = [...list].sort((a, b) => {
            const valA = a[field];
            const valB = b[field];
            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;
            return 0;
          });
        }
        const skip = args.skip || 0;
        const take = args.take !== undefined ? args.take : list.length;
        const sliced = list.slice(skip, skip + take);
        return sliced.map((item) => resolveIncludes(table, item, args.include, store));
      },
      create: async (args: { data: any; include?: any }) => {
        const id = args.data.id || `${defaultIdPrefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
        const newItem: any = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...args.data,
        };

        // Handle nested creates
        if (table === "users" && args.data.profile?.create) {
          const prof = {
            id: `prof-${Date.now().toString(36)}`,
            userId: id,
            fullName: args.data.profile.create.fullName,
            title: args.data.profile.create.title || null,
            avatarUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          store.profiles.push(prof);
          delete newItem.profile;
        }

        if (table === "organizations") {
          if (args.data.members?.create) {
            const om = {
              id: `om-${Date.now().toString(36)}`,
              organizationId: id,
              userId: args.data.members.create.userId,
              role: args.data.members.create.role || "MEMBER",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            store.organizationMembers.push(om);
            delete newItem.members;
          }
          if (args.data.workspaces?.create) {
            const ws = {
              id: `ws-${Date.now().toString(36)}`,
              organizationId: id,
              name: args.data.workspaces.create.name,
              slug: args.data.workspaces.create.slug || "default",
              description: args.data.workspaces.create.description || "Default Workspace",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            store.workspaces.push(ws);
            delete newItem.workspaces;
          }
        }

        store[table].push(newItem);
        return resolveIncludes(table, newItem, args.include, store);
      },
      update: async (args: { where: any; data: any; include?: any }) => {
        const index = store[table].findIndex((item) => matchesFilter(item, args.where));
        if (index === -1) throw new Error(`Record to update not found in ${String(table)}`);
        
        const existing = store[table][index];
        const updated = {
          ...existing,
          ...args.data,
          updatedAt: new Date(),
        };
        store[table][index] = updated;
        return resolveIncludes(table, updated, args.include, store);
      },
      delete: async (args: { where: any }) => {
        const index = store[table].findIndex((item) => matchesFilter(item, args.where));
        if (index === -1) throw new Error(`Record to delete not found in ${String(table)}`);
        const [deleted] = store[table].splice(index, 1);
        return deleted;
      },
      deleteMany: async (args: { where?: any }) => {
        const initialLen = store[table].length;
        if (!args.where) {
          store[table] = [];
          return { count: initialLen };
        }
        store[table] = store[table].filter((item) => !matchesFilter(item, args.where));
        return { count: initialLen - store[table].length };
      },
      count: async (args?: { where?: any }) => {
        if (!args?.where) return store[table].length;
        return store[table].filter((item) => matchesFilter(item, args.where)).length;
      },
      groupBy: async (args: { by: string[]; _count?: any; where?: any }) => {
        let list = store[table];
        if (args.where) {
          list = list.filter((item) => matchesFilter(item, args.where));
        }
        const field = args.by[0];
        const groups: Record<string, number> = {};
        list.forEach((item) => {
          const val = item[field] || "UNKNOWN";
          groups[val] = (groups[val] || 0) + 1;
        });
        return Object.entries(groups).map(([k, count]) => ({
          [field]: k,
          _count: { [field]: count },
        }));
      },
      aggregate: async (args: { where?: any; _sum?: any }) => {
        let list = store[table];
        if (args.where) {
          list = list.filter((item) => matchesFilter(item, args.where));
        }
        const sumResult: Record<string, number> = {};
        if (args._sum) {
          Object.keys(args._sum).forEach((k) => {
            sumResult[k] = list.reduce((acc, item) => acc + (Number(item[k]) || 0), 0);
          });
        }
        return { _sum: sumResult };
      },
    };
  };

  const tableAliases: Record<string, keyof MemoryStore | string> = {
    user: "users",
    userProfile: "profiles",
    profile: "profiles",
    session: "sessions",
    role: "roles",
    permission: "permissions",
    rolePermission: "rolePermissions",
    organization: "organizations",
    workspace: "workspaces",
    organizationMember: "organizationMembers",
    workspaceMember: "workspaceMembers",
    client: "clients",
    project: "projects",
    projectUpdate: "projectUpdates",
    payment: "payments",
    memberApplication: "applicants",
    applicant: "applicants",
    applicationQuestion: "applicationQuestions",
    applicationAnswer: "applicationAnswers",
    memberVerification: "memberVerifications",
    memberProfile: "memberProfiles",
    clientRequest: "clientRequests",
    member: "members",
    rank: "ranks",
    memberRankHistory: "rankHistories",
    memberReward: "memberRewards",
    clientOwnership: "clientOwnerships",
    promotionActivity: "promotionActivities",
    companyProfile: "companyProfiles",
    officeLocation: "officeLocations",
    bankAccount: "bankAccounts",
    serviceCategory: "serviceCategories",
    service: "services",
    portfolioCategory: "portfolioCategories",
    portfolioProject: "portfolioProjects",
    fAQ: "faqs",
    faq: "faqs",
    socialLink: "socialLinks",
    sEOSettings: "seoSettings",
    seoSettings: "seoSettings",
    websiteSettings: "websiteSettings",
    contactMessage: "contactMessages",
    emailTemplate: "emailTemplates",
    whatsAppTemplate: "whatsAppTemplates",
    notification: "notifications",
    announcement: "announcements",
    communicationLog: "communicationLogs",
    notificationPreference: "notificationPreferences",
    aIKnowledgeCategory: "aiKnowledgeCategories",
    aIKnowledge: "aiKnowledge",
    aIConversation: "aiConversations",
    aIConversationMessage: "aiConversationMessages",
    aIIntent: "aiIntents",
    aIRecommendation: "aiRecommendations",
    aIQuickReply: "aiQuickReplies",
    aIKnowledgeFeedback: "aiKnowledgeFeedback",
    aITrainingNote: "aiTrainingNotes",
    supportedLanguage: "supportedLanguages",
    visitorSession: "visitorSessions",
    websiteAnalytics: "websiteAnalytics",
    aIAnalytics: "aiAnalytics",
    clientAnalytics: "clientAnalytics",
    memberAnalytics: "memberAnalytics",
    managerAnalytics: "managerAnalytics",
    revenueAnalytics: "revenueAnalytics",
    dashboardMetric: "dashboardMetrics",
    systemConfiguration: "systemConfigurations",
    featureFlag: "featureFlags",
    maintenanceWindow: "maintenanceWindows",
    backupHistory: "backupHistories",
    apiKey: "apiKeys",
    webhookEndpoint: "webhookEndpoints",
    scheduledTask: "scheduledTasks",
    maintenanceLog: "maintenanceLogs",
    platformVersion: "platformVersions",
    changelog: "changelogs",
    auditLog: "auditLogs",
    systemSettings: "systemSettings",
  };

  const delegatesCache: Record<string, any> = {};

  const client: any = {
    $connect: async () => {
      return true;
    },
    $disconnect: async () => {
      return true;
    },
    $queryRaw: async () => {
      return [{ 1: 1 }];
    },
    $transaction: async (fnOrArray: any) => {
      if (typeof fnOrArray === "function") {
        return fnOrArray(clientProxy);
      }
      if (Array.isArray(fnOrArray)) {
        return Promise.all(fnOrArray);
      }
      return fnOrArray;
    },
  };

  const clientProxy = new Proxy(client, {
    get(target, prop: string | symbol) {
      if (typeof prop !== "string") return target[prop];
      if (prop in target) return target[prop];

      if (delegatesCache[prop]) return delegatesCache[prop];

      const tableName = (tableAliases[prop] || prop) as keyof MemoryStore;
      if (!(tableName in store)) {
        (store as any)[tableName] = [];
      }

      delegatesCache[prop] = createDelegate(tableName, prop.slice(0, 4));
      return delegatesCache[prop];
    },
  });

  return clientProxy;
}
