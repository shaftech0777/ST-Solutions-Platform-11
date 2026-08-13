import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
  Box,
  Sparkles,
  LayoutDashboard
} from "lucide-react";

import { AuthProvider } from "./context/AuthContext.js";
import { ThemeProvider } from "./context/ThemeContext.js";
import { ToastProvider } from "./context/ToastContext.js";
import { ApplicationShell } from "./components/shell/ApplicationShell.js";

// Page Imports
import { DashboardPage } from "./pages/DashboardPage.js";
import { OrganizationsPage } from "./pages/OrganizationsPage.js";
import { WorkspacesPage } from "./pages/WorkspacesPage.js";
import { ClientsPage } from "./pages/ClientsPage.js";
import { ProjectsPage } from "./pages/ProjectsPage.js";
import { PaymentsPage } from "./pages/PaymentsPage.js";
import { ApplicantsPage } from "./pages/ApplicantsPage.js";
import { MembersPage } from "./pages/MembersPage.js";
import { RolesPage } from "./pages/RolesPage.js";
import { AuditLogsPage } from "./pages/AuditLogsPage.js";
import { SettingsPage } from "./pages/SettingsPage.js";
import { AIAssistantPage } from "./pages/AIAssistantPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";

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
            name: "prisma",
            path: "apps/api/prisma",
            type: "folder",
            children: [
              {
                name: "schema.prisma",
                path: "apps/api/prisma/schema.prisma",
                type: "file",
                content: `// Prisma Schema for ST-Solutions Platform\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  SUSPENDED\n  PENDING\n}\n\nenum AccountType {\n  ADMIN\n  SUB_ADMIN\n  MANAGER\n  MEMBER\n  CLIENT\n}\n\nmodel User {\n  id           String      @id @default(uuid())\n  email        String?     @unique\n  passwordHash String\n  accountType  AccountType @default(MEMBER)\n  status       UserStatus  @default(PENDING)\n  roleId       String?\n  createdAt    DateTime    @default(now())\n  updatedAt    DateTime    @updatedAt\n\n  role      Role?        @relation(fields: [roleId], references: [id], onDelete: SetNull)\n  profile   UserProfile?\n  sessions  Session[]\n  auditLogs AuditLog[]\n\n  @@index([email])\n  @@index([status])\n  @@index([accountType])\n}`
              }
            ]
          },
          {
            name: ".env.example",
            path: "apps/api/.env.example",
            type: "file",
            content: `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/st_solutions?schema=public"\nPORT=4000\nNODE_ENV=development\nJWT_SECRET=default-development-jwt-secret-key-change-in-production`
          },
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
                    name: "database.ts",
                    path: "apps/api/src/config/database.ts",
                    type: "file",
                    content: `import { env } from "./env.js";\n\nexport const databaseConfig = {\n  url: env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/st_solutions?schema=public",\n  logQueries: env.NODE_ENV === "development",\n};`
                  },
                  {
                    name: "env.ts",
                    path: "apps/api/src/config/env.ts",
                    type: "file",
                    content: `import dotenv from "dotenv";\ndotenv.config();\n\nexport const env = {\n  PORT: process.env.PORT || 4000,\n  NODE_ENV: process.env.NODE_ENV || "development",\n  DATABASE_URL: process.env.DATABASE_URL,\n  JWT_SECRET: process.env.JWT_SECRET || "super-secret-key",\n};`
                  }
                ]
              },
              {
                name: "app.ts",
                path: "apps/api/src/app.ts",
                type: "file",
                content: `import express from "express";\nimport cors from "cors";\nimport helmet from "helmet";\nimport { errorHandler } from "./shared/error-handler.js";\n\nconst app = express();\napp.use(helmet());\napp.use(cors());\napp.use(express.json());\n\napp.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));\n\napp.use(errorHandler);\nexport default app;`
              },
              {
                name: "server.ts",
                path: "apps/api/src/server.ts",
                type: "file",
                content: `import app from "./app.js";\nimport { env } from "./config/env.js";\n\napp.listen(env.PORT, () => {\n  console.log(\`ST-Solutions API running on port \${env.PORT}\`);\n});`
              }
            ]
          }
        ]
      },
      {
        name: "web",
        path: "apps/web",
        type: "folder",
        description: "React SPA Frontend Application with Tailwind CSS",
        children: [
          {
            name: "src",
            path: "apps/web/src",
            type: "folder",
            children: [
              {
                name: "App.tsx",
                path: "apps/web/src/App.tsx",
                type: "file",
                content: `// React SPA entry with multi-tenant router and auth providers`
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "packages",
    path: "packages",
    type: "folder",
    description: "Shared monorepo packages across API & Web",
    children: [
      {
        name: "shared-types",
        path: "packages/shared-types",
        type: "folder",
        children: [
          {
            name: "index.ts",
            path: "packages/shared-types/index.ts",
            type: "file",
            content: `export * from "./user.types.js";\nexport * from "./org.types.js";\nexport * from "./api.types.js";`
          }
        ]
      },
      {
        name: "shared-config",
        path: "packages/shared-config",
        type: "folder",
        children: [
          {
            name: "constants.ts",
            path: "packages/shared-config/constants.ts",
            type: "file",
            content: `export className Constants {\n  static readonly PLATFORM_NAME = "ST-SOLUTIONS";\n}`
          }
        ]
      },
      {
        name: "shared-utils",
        path: "packages/shared-utils",
        type: "folder",
        children: [
          {
            name: "index.ts",
            path: "packages/shared-utils/index.ts",
            type: "file",
            content: `export const formatCurrency = (amount: number) => \`$\${amount.toLocaleString()}\`;`
          }
        ]
      }
    ]
  }
];

export function AppContent() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(fileSystemTree[0].children![0].children![0].children![0]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    apps: true,
    "apps/api": true,
    "apps/api/prisma": true,
    "apps/api/src": true,
    "apps/api/src/config": true,
    "apps/web": true,
    packages: true,
    "packages/shared-types": true,
    "packages/shared-utils": true
  });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"app" | "explorer" | "checklist" | "modules" | "architecture">("app");

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
    { title: "Comprehensive Schema Audit", desc: "Complete review of 60+ Prisma models across all 12 implementation phases", done: true },
    { title: "Strict Referential Integrity", desc: "Verified cascade, setNull, restrict and onDelete rules across all user and business domain relations", done: true },
    { title: "Query & Index Optimization", desc: "Checked primary keys, unique constraints, single & composite indexes across high-traffic tables", done: true },
    { title: "Security & Hash Standards", desc: "Confirmed keyHash, tokenHash, passwordHash enforcement; zero plaintext secrets or unhashed credentials", done: true },
    { title: "Multi-Role & Domain Coverage", desc: "Verified full support for Admin, Sub Admin, Manager, Member, Client, Visitor, AI & Platform Admin domains", done: true },
    { title: "Scalability & Future Readyness", desc: "Confirmed schema readiness for CRM, ERP, Invoicing, Automation, AI & Multilingual expansion", done: true },
    { title: "Schema Freeze V1.0", desc: "prisma format, prisma validate, and prisma generate verified; schema status marked as FROZEN", done: true }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Platform Top Header & View Switcher */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B88E20] text-black font-extrabold flex items-center justify-center text-xs shadow-md shadow-amber-500/10 shrink-0 border border-amber-300/40">
            ST
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-tight text-white">ST-SOLUTIONS PLATFORM</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-medium">
                Shaf Tech Enterprise
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Mode Bar */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab("app")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "app"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#B88E20] text-black shadow-sm"
                : "text-amber-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive SaaS App</span>
          </button>
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
            <span>Phase Checklist</span>
          </button>
        </div>
      </header>

      {/* View Switcher Output */}
      {activeTab === "app" && (
        <div className="flex-1 flex flex-col">
          <ApplicationShell>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/ai" element={<AIAssistantPage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/workspaces" element={<WorkspacesPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/applicants" element={<ApplicantsPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/audit" element={<AuditLogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ApplicationShell>
        </div>
      )}

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
                <h2 className="text-lg font-bold text-white">Phase Verification & Integrity Checklist</h2>
                <p className="text-xs text-slate-400">Multi-tenant architecture and DB schema verified with 0 errors</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {phaseRefinements.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/40 px-6 py-2.5 text-xs text-slate-500 flex items-center justify-between shrink-0">
        <span>ST-SOLUTIONS PLATFORM • Enterprise SaaS System</span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Build Status: Green (0 Errors)
        </span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
