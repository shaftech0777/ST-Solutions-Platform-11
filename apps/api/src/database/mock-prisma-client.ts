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

    // Handle composite unique keys (e.g. organizationId_userId: { organizationId, userId })
    if (key.includes("_") && typeof val === "object" && val !== null && !(val instanceof Date)) {
      const isCompositeMatch = Object.entries(val).every(([subKey, subVal]) => item[subKey] === subVal);
      if (!isCompositeMatch) return false;
      continue;
    }

    const itemVal = item[key];

    if (val === null) {
      if (itemVal !== null && itemVal !== undefined) return false;
      continue;
    }

    if (typeof val === "object" && val !== null && !(val instanceof Date)) {
      // Prisma relation filter: { some: ... }
      if ("some" in val && typeof val.some === "object") {
        const store = memoryDb.data;
        let relatedItems: any[] = [];
        if (key === "members") {
          relatedItems = (store.organizationMembers || []).filter((om) => om.organizationId === item.id);
          if (relatedItems.length === 0) {
            relatedItems = (store.workspaceMembers || []).filter((wm) => wm.workspaceId === item.id);
          }
        } else if (Array.isArray(itemVal)) {
          relatedItems = itemVal;
        }
        if (!relatedItems.some((relItem) => matchesFilter(relItem, val.some))) {
          return false;
        }
        continue;
      }

      if ("equals" in val && val.equals !== undefined) {
        const filterObj = val as { equals: any; mode?: string };
        if (filterObj.mode === "insensitive" && typeof filterObj.equals === "string") {
          if (String(itemVal || "").toLowerCase() !== filterObj.equals.toLowerCase()) return false;
        } else {
          if (itemVal !== val.equals) return false;
        }
      }
      if ("startsWith" in val && typeof (val as any).startsWith === "string") {
        const filterObj = val as { startsWith: string; mode?: string };
        const needle = filterObj.mode === "insensitive" ? filterObj.startsWith.toLowerCase() : filterObj.startsWith;
        const haystack = filterObj.mode === "insensitive" ? String(itemVal || "").toLowerCase() : String(itemVal || "");
        if (!haystack.startsWith(needle)) return false;
      }
      if ("endsWith" in val && typeof (val as any).endsWith === "string") {
        const filterObj = val as { endsWith: string; mode?: string };
        const needle = filterObj.mode === "insensitive" ? filterObj.endsWith.toLowerCase() : filterObj.endsWith;
        const haystack = filterObj.mode === "insensitive" ? String(itemVal || "").toLowerCase() : String(itemVal || "");
        if (!haystack.endsWith(needle)) return false;
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
      if ("contains" in val && typeof (val as any).contains === "string") {
        const filterObj = val as { contains: string; mode?: string };
        const needle = filterObj.mode === "insensitive" ? filterObj.contains.toLowerCase() : filterObj.contains;
        const haystack = filterObj.mode === "insensitive" ? String(itemVal || "").toLowerCase() : String(itemVal || "");
        if (!haystack.includes(needle)) return false;
      }
      if ("gte" in val) {
        const filterObj = val as { gte?: any };
        if (!(itemVal >= filterObj.gte)) return false;
      }
      if ("lte" in val) {
        const filterObj = val as { lte?: any };
        if (!(itemVal <= filterObj.lte)) return false;
      }
      if ("gt" in val) {
        const filterObj = val as { gt?: any };
        if (!(itemVal > filterObj.gt)) return false;
      }
      if ("lt" in val) {
        const filterObj = val as { lt?: any };
        if (!(itemVal < filterObj.lt)) return false;
      }
      continue;
    }

    if (val === false) {
      if (itemVal !== false && itemVal !== undefined && itemVal !== null) {
        return false;
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
        if (!args || !args.where) return null;
        const list = store[table] || [];
        const found = list.find((item) => matchesFilter(item, args.where));
        if (!found) return null;
        return resolveIncludes(table, found, args.include, store);
      },
      findUniqueOrThrow: async (args: { where: any; include?: any }) => {
        if (!args || !args.where) throw new Error(`Record not found in ${String(table)}`);
        const list = store[table] || [];
        const found = list.find((item) => matchesFilter(item, args.where));
        if (!found) throw new Error(`Record not found in ${String(table)}`);
        return resolveIncludes(table, found, args.include, store);
      },
      findFirst: async (args?: { where?: any; include?: any; orderBy?: any }) => {
        let list = store[table] || [];
        if (args?.where) {
          list = list.filter((item) => matchesFilter(item, args.where));
        }
        if (list.length === 0) return null;
        return resolveIncludes(table, list[0], args?.include, store);
      },
      findMany: async (args?: { where?: any; include?: any; skip?: number; take?: number; orderBy?: any }) => {
        let list = store[table] || [];
        if (args?.where) {
          list = list.filter((item) => matchesFilter(item, args.where));
        }
        if (args?.orderBy) {
          const [field, order] = Object.entries(args.orderBy)[0] as [string, string];
          list = [...list].sort((a, b) => {
            const valA = a[field];
            const valB = b[field];
            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;
            return 0;
          });
        }
        const skip = args?.skip || 0;
        const take = args?.take !== undefined ? args.take : list.length;
        const sliced = list.slice(skip, skip + take);
        return sliced.map((item) => resolveIncludes(table, item, args?.include, store));
      },
      create: async (args: { data: any; include?: any }) => {
        if (args.data.id && store[table].some((item: any) => item.id === args.data.id)) {
          const err: any = new Error(`Unique constraint failed on the fields: (id)`);
          err.code = "P2002";
          throw err;
        }
        if (table === "users" && args.data.email && store.users.some((u: any) => u.email?.toLowerCase() === args.data.email?.toLowerCase())) {
          const err: any = new Error(`Unique constraint failed on the fields: (email)`);
          err.code = "P2002";
          throw err;
        }

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
          let creatorUserId = "";
          if (args.data.members?.create) {
            creatorUserId = args.data.members.create.userId;
            const om = {
              id: `om-${Date.now().toString(36)}`,
              organizationId: id,
              userId: creatorUserId,
              role: args.data.members.create.role || "MEMBER",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            store.organizationMembers.push(om);
            delete newItem.members;
          }
          if (args.data.workspaces?.create) {
            const wsId = `ws-${Date.now().toString(36)}`;
            const ws = {
              id: wsId,
              organizationId: id,
              name: args.data.workspaces.create.name,
              slug: args.data.workspaces.create.slug || "default",
              description: args.data.workspaces.create.description || "Default Workspace",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            store.workspaces.push(ws);
            if (creatorUserId) {
              store.workspaceMembers.push({
                id: `wm-${Date.now().toString(36)}`,
                workspaceId: wsId,
                userId: creatorUserId,
                role: "ADMIN",
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
            delete newItem.workspaces;
          }
        }

        if (table === "workspaces" && args.data.members?.create) {
          const wm = {
            id: `wm-${Date.now().toString(36)}`,
            workspaceId: id,
            userId: args.data.members.create.userId,
            role: args.data.members.create.role || "MEMBER",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          store.workspaceMembers.push(wm);
          delete newItem.members;
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
      upsert: async (args: { where: any; update: any; create: any; include?: any }) => {
        const index = store[table].findIndex((item) => matchesFilter(item, args.where));
        if (index >= 0) {
          const existing = store[table][index];
          const updated = {
            ...existing,
            ...args.update,
            updatedAt: new Date(),
          };
          store[table][index] = updated;
          return resolveIncludes(table, updated, args.include, store);
        } else {
          const id = args.create.id || `${defaultIdPrefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
          const newItem: any = {
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...args.create,
          };
          store[table].push(newItem);
          return resolveIncludes(table, newItem, args.include, store);
        }
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
        let list = store[table] || [];
        if (args?.where) {
          list = list.filter((item) => matchesFilter(item, args.where));
        }
        const field = args?.by?.[0] || "id";
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
      aggregate: async (args?: { where?: any; _sum?: any }) => {
        let list = store[table] || [];
        if (args?.where) {
          list = list.filter((item) => matchesFilter(item, args.where));
        }
        const sumResult: Record<string, number> = {};
        if (args?._sum) {
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
    administrativeNotice: "administrativeNotices",
    userPerformance: "userPerformances",
    themeSettings: "themeSettings",
    cMSSection: "cmsSections",
    cmsSection: "cmsSections",
    projectInquiry: "projectInquiries",
    inquiryActivity: "inquiryActivities",
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
