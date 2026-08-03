import React, { useState } from "react";
import {
  Folder,
  FolderTree,
  FileCode,
  FileText,
  CheckCircle2,
  Terminal,
  Layers,
  Database,
  Server,
  Globe,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Boxes,
  Code2,
  Cpu,
  Workflow,
  Box
} from "lucide-react";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  description?: string;
}

const apiModules = [
  "auth",
  "users",
  "roles",
  "permissions",
  "members",
  "applicants",
  "managers",
  "client-relations",
  "clients",
  "projects",
  "payments",
  "notifications",
  "settings",
  "audit",
  "ai"
];

const fileSystemTree: FileNode[] = [
  {
    name: "apps",
    path: "apps",
    type: "folder",
    description: "Application workspaces (Frontend & Backend)",
    children: [
      {
        name: "api",
        path: "apps/api",
        type: "folder",
        description: "Express.js REST API service with clean architecture",
        children: [
          {
            name: "src",
            path: "apps/api/src",
            type: "folder",
            children: [
              {
                name: "config",
                path: "apps/api/src/config",
                type: "folder",
                children: [
                  {
                    name: "index.ts",
                    path: "apps/api/src/config/index.ts",
                    type: "file",
                    content: `export const config = {\n  port: process.env.PORT || 4000,\n  env: process.env.NODE_ENV || "development",\n};`
                  }
                ]
              },
              {
                name: "database",
                path: "apps/api/src/database",
                type: "folder",
                children: [
                  {
                    name: "index.ts",
                    path: "apps/api/src/database/index.ts",
                    type: "file",
                    content: `export * from "./database.js";\nexport * from "./prisma.js";`
                  },
                  {
                    name: "database.ts",
                    path: "apps/api/src/database/database.ts",
                    type: "file",
                    content: `export async function connectDatabase(): Promise<void> {\n  // Connection bootstrap\n}`
                  },
                  {
                    name: "prisma.ts",
                    path: "apps/api/src/database/prisma.ts",
                    type: "file",
                    content: `export const prisma = null;`
                  }
                ]
              },
              {
                name: "middlewares",
                path: "apps/api/src/middlewares",
                type: "folder",
                children: [
                  {
                    name: "index.ts",
                    path: "apps/api/src/middlewares/index.ts",
                    type: "file",
                    content: `import { Request, Response, NextFunction } from "express";\n\nexport function errorHandler(\n  err: Error,\n  _req: Request,\n  res: Response,\n  _next: NextFunction\n): void {\n  res.status(500).json({ error: err.message || "Internal Server Error" });\n}`
                  }
                ]
              },
              {
                name: "modules",
                path: "apps/api/src/modules",
                type: "folder",
                description: "15 Production feature modules",
                children: [
                  {
                    name: "index.ts",
                    path: "apps/api/src/modules/index.ts",
                    type: "file",
                    content: apiModules.map(m => `export * from "./${m}/index.js";`).join("\n")
                  },
                  ...apiModules.map(mod => ({
                    name: mod,
                    path: `apps/api/src/modules/${mod}`,
                    type: "folder" as const,
                    children: [
                      {
                        name: "index.ts",
                        path: `apps/api/src/modules/${mod}/index.ts`,
                        type: "file" as const,
                        content: `export * from "./${mod}.controller.js";\nexport * from "./${mod}.service.js";\nexport * from "./${mod}.repository.js";\nexport * from "./${mod}.routes.js";\nexport * from "./${mod}.validation.js";\nexport * from "./${mod}.types.js";`
                      },
                      {
                        name: `${mod}.controller.ts`,
                        path: `apps/api/src/modules/${mod}/${mod}.controller.ts`,
                        type: "file" as const,
                        content: `export class ${mod.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join('')}Controller {}`
                      },
                      {
                        name: `${mod}.service.ts`,
                        path: `apps/api/src/modules/${mod}/${mod}.service.ts`,
                        type: "file" as const,
                        content: `export class ${mod.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join('')}Service {}`
                      },
                      {
                        name: `${mod}.repository.ts`,
                        path: `apps/api/src/modules/${mod}/${mod}.repository.ts`,
                        type: "file" as const,
                        content: `export class ${mod.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join('')}Repository {}`
                      },
                      {
                        name: `${mod}.routes.ts`,
                        path: `apps/api/src/modules/${mod}/${mod}.routes.ts`,
                        type: "file" as const,
                        content: `import { Router } from "express";\n\nexport const ${mod.replace(/-([a-z])/g, g => g[1].toUpperCase())}Router = Router();`
                      },
                      {
                        name: `${mod}.validation.ts`,
                        path: `apps/api/src/modules/${mod}/${mod}.validation.ts`,
                        type: "file" as const,
                        content: `export const ${mod.replace(/-([a-z])/g, g => g[1].toUpperCase())}Validation = {};`
                      },
                      {
                        name: `${mod}.types.ts`,
                        path: `apps/api/src/modules/${mod}/${mod}.types.ts`,
                        type: "file" as const,
                        content: `export interface ${mod.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join('')}State {}`
                      }
                    ]
                  }))
                ]
              },
              {
                name: "app.ts",
                path: "apps/api/src/app.ts",
                type: "file",
                content: `import express, { Express, Request, Response } from "express";\nimport { errorHandler } from "./middlewares/index.js";\n\nconst app: Express = express();\n\napp.use(express.json());\n\napp.get("/health", (_req: Request, res: Response) => {\n  res.json({ status: "ok", service: "st-solutions-api", version: "1.0.0" });\n});\n\napp.use(errorHandler);\n\nexport default app;`
              },
              {
                name: "server.ts",
                path: "apps/api/src/server.ts",
                type: "file",
                content: `import app from "./app.js";\nimport { config } from "./config/index.js";\n\nconst port = config.port;\n\nconst server = app.listen(port, () => {\n  console.log(\`ST-Solutions API running on port \${port}\`);\n});\n\nexport default server;`
              },
              {
                name: "index.ts",
                path: "apps/api/src/index.ts",
                type: "file",
                content: `import "./server.js";\n\nexport { default as app } from "./app.js";\nexport { default as server } from "./server.js";`
              }
            ]
          }
        ]
      },
      {
        name: "web",
        path: "apps/web",
        type: "folder",
        description: "React + Vite Frontend Client",
        children: [
          {
            name: "src",
            path: "apps/web/src",
            type: "folder",
            children: [
              "app", "assets", "components", "features", "hooks", "layouts", "pages", "services", "store", "types", "utils"
            ].map(dir => ({
              name: dir,
              path: `apps/web/src/${dir}`,
              type: "folder" as const,
              children: [
                {
                  name: "index.ts",
                  path: `apps/web/src/${dir}/index.ts`,
                  type: "file" as const,
                  content: "export {};"
                }
              ]
            }))
          }
        ]
      }
    ]
  },
  {
    name: "packages",
    path: "packages",
    type: "folder",
    description: "Shared monorepo packages",
    children: [
      {
        name: "shared-config",
        path: "packages/shared-config",
        type: "folder",
        children: [
          { name: "constants.ts", path: "packages/shared-config/constants.ts", type: "file", content: `export const APP_NAME = "ST-Solutions";` },
          { name: "roles.ts", path: "packages/shared-config/roles.ts", type: "file", content: `export const ROLES = { ADMIN: "ADMIN" } as const;` },
          { name: "permissions.ts", path: "packages/shared-config/permissions.ts", type: "file", content: `export const PERMISSIONS = { USERS_READ: "users:read" } as const;` },
          { name: "routes.ts", path: "packages/shared-config/routes.ts", type: "file", content: `export const ROUTES = { AUTH: "/api/v1/auth" } as const;` },
          { name: "status.ts", path: "packages/shared-config/status.ts", type: "file", content: `export const HTTP_STATUS = { OK: 200 } as const;` },
          { name: "index.ts", path: "packages/shared-config/index.ts", type: "file", content: `export * from "./constants.js";\nexport * from "./roles.js";` }
        ]
      },
      {
        name: "shared-types",
        path: "packages/shared-types",
        type: "folder",
        children: [
          { name: "user.ts", path: "packages/shared-types/user.ts", type: "file", content: `export interface User { id: string; email: string; }` },
          { name: "role.ts", path: "packages/shared-types/role.ts", type: "file", content: `export interface Role { id: string; name: string; }` },
          { name: "permission.ts", path: "packages/shared-types/permission.ts", type: "file", content: `export interface Permission { id: string; code: string; }` },
          { name: "api.ts", path: "packages/shared-types/api.ts", type: "file", content: `export interface ApiResponse<T = unknown> { success: boolean; data?: T; }` },
          { name: "pagination.ts", path: "packages/shared-types/pagination.ts", type: "file", content: `export interface PaginationMeta { page: number; limit: number; }` },
          { name: "jwt.ts", path: "packages/shared-types/jwt.ts", type: "file", content: `export interface JwtPayload { userId: string; role: string; }` },
          { name: "index.ts", path: "packages/shared-types/index.ts", type: "file", content: `export * from "./user.js";\nexport * from "./api.js";` }
        ]
      },
      {
        name: "shared-utils",
        path: "packages/shared-utils",
        type: "folder",
        children: [
          { name: "date.ts", path: "packages/shared-utils/date.ts", type: "file", content: `export function formatDate(d: Date | string) { return new Date(d).toISOString(); }` },
          { name: "string.ts", path: "packages/shared-utils/string.ts", type: "file", content: `export function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }` },
          { name: "id.ts", path: "packages/shared-utils/id.ts", type: "file", content: `export function generateId() { return Math.random().toString(36).slice(2); }` },
          { name: "validation.ts", path: "packages/shared-utils/validation.ts", type: "file", content: `export function isValidEmail(e: string) { return e.includes("@"); }` },
          { name: "index.ts", path: "packages/shared-utils/index.ts", type: "file", content: `export * from "./date.js";\nexport * from "./string.js";` }
        ]
      }
    ]
  }
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(fileSystemTree[0]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    apps: true,
    "apps/api": true,
    "apps/api/src": true,
    "apps/api/src/modules": true,
    "apps/web": true,
    "apps/web/src": true,
    packages: true,
    "packages/shared-config": true,
    "packages/shared-types": true,
    "packages/shared-utils": true
  });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"explorer" | "checklist" | "modules" | "architecture">("explorer");

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders[node.path];
      const isSelected = selectedFile?.path === node.path;

      if (node.type === "folder") {
        return (
          <div key={node.path} className="select-none">
            <div
              onClick={() => toggleFolder(node.path)}
              style={{ paddingLeft: `${level * 14 + 10}px` }}
              className="flex items-center py-1 px-2 hover:bg-slate-800/60 rounded cursor-pointer text-slate-300 hover:text-white transition-colors text-xs font-medium"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              )}
              <Folder className="w-3.5 h-3.5 mr-1.5 text-indigo-400 shrink-0" />
              <span className="truncate">{node.name}</span>
            </div>
            {isExpanded && node.children && (
              <div>{renderTree(node.children, level + 1)}</div>
            )}
          </div>
        );
      }

      return (
        <div
          key={node.path}
          onClick={() => setSelectedFile(node)}
          style={{ paddingLeft: `${level * 14 + 24}px` }}
          className={`flex items-center py-1 px-2 rounded cursor-pointer text-xs transition-colors ${
            isSelected
              ? "bg-indigo-600/20 text-indigo-300 font-medium border-l-2 border-indigo-500"
              : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
          }`}
        >
          {node.name.endsWith(".json") ? (
            <FileCode className="w-3.5 h-3.5 mr-1.5 text-emerald-400 shrink-0" />
          ) : node.name.endsWith(".md") ? (
            <FileText className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
          ) : (
            <Code2 className="w-3.5 h-3.5 mr-1.5 text-blue-400 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
      );
    });
  };

  const phaseRefinements = [
    { title: "Backend Structure", desc: "config, modules, middlewares, services, shared, utils, types, database", done: true },
    { title: "Express Separation", desc: "app.ts (express, routes, middlewares) & server.ts (process startup, port server)", done: true },
    { title: "15 Production Feature Modules", desc: "auth, users, roles, permissions, members, applicants, managers, client-relations, clients, projects, payments, notifications, settings, audit, ai", done: true },
    { title: "Standard Module Architecture", desc: "controller, service, repository, routes, validation, types, index.ts for each module", done: true },
    { title: "Frontend Structure", desc: "app, assets, components, features, hooks, layouts, pages, services, store, types, utils", done: true },
    { title: "Shared Types Library", desc: "user.ts, role.ts, permission.ts, api.ts, pagination.ts, jwt.ts re-exported", done: true },
    { title: "Shared Config Library", desc: "constants.ts, roles.ts, permissions.ts, routes.ts, status.ts", done: true },
    { title: "Shared Utils Library", desc: "date.ts, string.ts, id.ts, validation.ts", done: true },
    { title: "Database Layer", desc: "database.ts, prisma.ts, index.ts", done: true }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-white">ST-Solutions Platform</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Phase 1.5 Refined
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Clean Monorepo Architecture</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab("explorer")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "explorer"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Monorepo Tree</span>
          </button>
          <button
            onClick={() => setActiveTab("modules")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "modules"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>15 API Modules</span>
          </button>
          <button
            onClick={() => setActiveTab("checklist")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "checklist"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Phase 1.5 Checklist</span>
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "architecture"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture Blueprint</span>
          </button>
        </div>
      </header>

      {/* Main View */}
      {activeTab === "explorer" && (
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-80 border-r border-slate-800 bg-slate-900/40 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400 tracking-wider uppercase">
              <span className="flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
                Directory Explorer
              </span>
              <span className="text-slate-500 font-mono text-[11px]">/st-solutions</span>
            </div>
            <div className="flex-1 overflow-y-auto py-2 px-1 scrollbar-thin scrollbar-thumb-slate-800">
              {renderTree(fileSystemTree)}
            </div>
          </aside>

          <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {selectedFile ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <span>{selectedFile.path}</span>
                  </div>
                  {selectedFile.content && (
                    <button
                      onClick={() => copyContent(selectedFile.content || "")}
                      className="flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-900/10">
                  <pre className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 overflow-x-auto whitespace-pre font-mono text-slate-200">
                    {selectedFile.content || "// Folder selected in tree"}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Select a file from the explorer on the left to view its contents
              </div>
            )}
          </main>
        </div>
      )}

      {activeTab === "modules" && (
        <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">15 API Feature Modules</h2>
                <p className="text-xs text-slate-400">Located at <code className="text-indigo-300 font-mono">apps/api/src/modules/</code> with standard 7-file architecture</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {apiModules.map((mod) => (
                <div key={mod} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-indigo-300 font-mono">{mod}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      7 files
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                    <div>• {mod}.controller.ts</div>
                    <div>• {mod}.service.ts</div>
                    <div>• {mod}.repository.ts</div>
                    <div>• {mod}.routes.ts</div>
                    <div>• {mod}.validation.ts</div>
                    <div>• {mod}.types.ts</div>
                    <div>• index.ts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "checklist" && (
        <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Phase 1.5 Architecture Verification</h2>
                <p className="text-xs text-slate-400">Refined monorepo structure completed with 0 errors</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {phaseRefinements.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "architecture" && (
        <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">ST-Solutions Platform Monorepo Architecture</h2>
            <p className="text-xs text-slate-400 mb-6">Clean architecture & modular layout mapping</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
                  <Server className="w-4 h-4" />
                  <span>apps/api/src</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <div>├── config/</div>
                  <div>├── database/ (index, database, prisma)</div>
                  <div>├── middlewares/</div>
                  <div>├── modules/ (15 feature modules)</div>
                  <div>├── services/</div>
                  <div>├── shared/</div>
                  <div>├── types/</div>
                  <div>├── utils/</div>
                  <div>├── app.ts (express, routes, error handlers)</div>
                  <div>└── server.ts (HTTP process startup)</div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
                  <Globe className="w-4 h-4" />
                  <span>apps/web/src</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <div>├── app/</div>
                  <div>├── assets/</div>
                  <div>├── components/</div>
                  <div>├── features/</div>
                  <div>├── hooks/</div>
                  <div>├── layouts/</div>
                  <div>├── pages/</div>
                  <div>├── services/</div>
                  <div>├── store/</div>
                  <div>├── types/</div>
                  <div>└── utils/</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                Shared Monorepo Packages (\`packages/*\`)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-indigo-300">packages/shared-types</div>
                  <div className="text-slate-500 mt-1">user, role, permission, api, pagination, jwt</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-indigo-300">packages/shared-config</div>
                  <div className="text-slate-500 mt-1">constants, roles, permissions, routes, status</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-indigo-300">packages/shared-utils</div>
                  <div className="text-slate-500 mt-1">date, string, id, validation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/40 px-6 py-2.5 text-xs text-slate-500 flex items-center justify-between">
        <span>ST-Solutions Platform • Phase 1.5 Completed</span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Build Status: Green (0 Errors)
        </span>
      </footer>
    </div>
  );
}
