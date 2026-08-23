import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { AuthProvider } from "./context/AuthContext.js";
import { ThemeProvider } from "./context/ThemeContext.js";
import { ToastProvider } from "./context/ToastContext.js";
import { ApplicationShell } from "./components/shell/ApplicationShell.js";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.js";

// Lazy-loaded page components for optimal bundle performance and fast page load
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage.js").then((m) => ({ default: m.DashboardPage }))
);
const AIAssistantPage = lazy(() =>
  import("./pages/AIAssistantPage.js").then((m) => ({ default: m.AIAssistantPage }))
);
const OrganizationsPage = lazy(() =>
  import("./pages/OrganizationsPage.js").then((m) => ({ default: m.OrganizationsPage }))
);
const WorkspacesPage = lazy(() =>
  import("./pages/WorkspacesPage.js").then((m) => ({ default: m.WorkspacesPage }))
);
const ClientsPage = lazy(() =>
  import("./pages/ClientsPage.js").then((m) => ({ default: m.ClientsPage }))
);
const ProjectsPage = lazy(() =>
  import("./pages/ProjectsPage.js").then((m) => ({ default: m.ProjectsPage }))
);
const PaymentsPage = lazy(() =>
  import("./pages/PaymentsPage.js").then((m) => ({ default: m.PaymentsPage }))
);
const ApplicantsPage = lazy(() =>
  import("./pages/ApplicantsPage.js").then((m) => ({ default: m.ApplicantsPage }))
);
const MembersPage = lazy(() =>
  import("./pages/MembersPage.js").then((m) => ({ default: m.MembersPage }))
);
const RolesPage = lazy(() =>
  import("./pages/RolesPage.js").then((m) => ({ default: m.RolesPage }))
);
const AuditLogsPage = lazy(() =>
  import("./pages/AuditLogsPage.js").then((m) => ({ default: m.AuditLogsPage }))
);
const NotificationsPage = lazy(() =>
  import("./pages/NotificationsPage.js").then((m) => ({ default: m.NotificationsPage }))
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage.js").then((m) => ({ default: m.SettingsPage }))
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage.js").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage.js").then((m) => ({ default: m.RegisterPage }))
);
const AccessDeniedPage = lazy(() =>
  import("./pages/AccessDeniedPage.js").then((m) => ({ default: m.AccessDeniedPage }))
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage.js").then((m) => ({ default: m.NotFoundPage }))
);

const PageSuspenseLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 py-12">
    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading module...</p>
  </div>
);

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ApplicationShell>
              <Suspense fallback={<PageSuspenseLoader />}>
                <Routes>
                  {/* Public Authentication Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Core SaaS Platform Routes with Role-Aware Protection */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute module="dashboard">
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai"
                    element={
                      <ProtectedRoute module="ai">
                        <AIAssistantPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/organizations"
                    element={
                      <ProtectedRoute module="organizations">
                        <OrganizationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/workspaces"
                    element={
                      <ProtectedRoute module="workspaces">
                        <WorkspacesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clients"
                    element={
                      <ProtectedRoute module="clients">
                        <ClientsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/projects"
                    element={
                      <ProtectedRoute module="projects">
                        <ProjectsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payments"
                    element={
                      <ProtectedRoute module="payments">
                        <PaymentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/applicants"
                    element={
                      <ProtectedRoute module="applicants">
                        <ApplicantsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/members"
                    element={
                      <ProtectedRoute module="members">
                        <MembersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/roles"
                    element={
                      <ProtectedRoute module="roles">
                        <RolesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audit"
                    element={
                      <ProtectedRoute module="audit">
                        <AuditLogsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute module="notifications">
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute module="settings">
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Error and Fallback Routes */}
                  <Route path="/403" element={<AccessDeniedPage />} />
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ApplicationShell>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

