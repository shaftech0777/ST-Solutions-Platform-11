import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { AuthProvider } from "./context/AuthContext.js";
import { FeatureProvider } from "./context/FeatureContext.js";
import { ThemeProvider } from "./context/ThemeContext.js";
import { ToastProvider } from "./context/ToastContext.js";
import { PublicCMSProvider } from "./context/PublicCMSContext.js";
import { ApplicationShell } from "./components/shell/ApplicationShell.js";
import { PublicShell } from "./components/public/PublicShell.js";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.js";
import { ErrorBoundary } from "./components/ui/ErrorBoundary.js";

/**
 * Resilient lazy-loading helper with automatic retry for stale chunks, network hiccups, or module exceptions.
 */
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<any>,
  retries = 2,
  interval = 800
): React.LazyExoticComponent<T> {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (remaining: number) => {
        factory()
          .then((module) => {
            const component = module.default || module;
            resolve({ default: component });
          })
          .catch((error) => {
            if (remaining > 0) {
              setTimeout(() => attempt(remaining - 1), interval);
            } else {
              console.error("ST-Solutions: Dynamic chunk failed to load after retries:", error);
              reject(error);
            }
          });
      };
      attempt(retries);
    })
  );
}

// Public Visitor-Facing Pages
const HomePage = lazyWithRetry(() =>
  import("./pages/public/HomePage.js").then((m) => ({ default: m.HomePage }))
);
const AboutPage = lazyWithRetry(() =>
  import("./pages/public/AboutPage.js").then((m) => ({ default: m.AboutPage }))
);
const ServicesPage = lazyWithRetry(() =>
  import("./pages/public/ServicesPage.js").then((m) => ({ default: m.ServicesPage }))
);
const SolutionsPage = lazyWithRetry(() =>
  import("./pages/public/SolutionsPage.js").then((m) => ({ default: m.SolutionsPage }))
);
const PublicProjectsPage = lazyWithRetry(() =>
  import("./pages/public/ProjectsPage.js").then((m) => ({ default: m.ProjectsPage }))
);
const ProjectDetailPage = lazyWithRetry(() =>
  import("./pages/public/ProjectDetailPage.js").then((m) => ({ default: m.ProjectDetailPage }))
);
const ContactPage = lazyWithRetry(() =>
  import("./pages/public/ContactPage.js").then((m) => ({ default: m.ContactPage }))
);
const ApplyPage = lazyWithRetry(() =>
  import("./pages/public/ApplyPage.js").then((m) => ({ default: m.ApplyPage }))
);
const StartProjectPage = lazyWithRetry(() =>
  import("./pages/public/StartProjectPage.js").then((m) => ({ default: m.StartProjectPage }))
);
const PrivacyPolicyPage = lazyWithRetry(() =>
  import("./pages/public/PrivacyPolicyPage.js").then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsPage = lazyWithRetry(() =>
  import("./pages/public/TermsPage.js").then((m) => ({ default: m.TermsPage }))
);
const CookiePolicyPage = lazyWithRetry(() =>
  import("./pages/public/CookiePolicyPage.js").then((m) => ({ default: m.CookiePolicyPage }))
);
const AcceptableUsePage = lazyWithRetry(() =>
  import("./pages/public/AcceptableUsePage.js").then((m) => ({ default: m.AcceptableUsePage }))
);
const SecurityPage = lazyWithRetry(() =>
  import("./pages/public/SecurityPage.js").then((m) => ({ default: m.SecurityPage }))
);

// Platform Internal Management Pages
const DashboardPage = lazyWithRetry(() =>
  import("./pages/DashboardPage.js").then((m) => ({ default: m.DashboardPage }))
);
const AIAssistantPage = lazyWithRetry(() =>
  import("./pages/AIAssistantPage.js").then((m) => ({ default: m.AIAssistantPage }))
);
const OrganizationsPage = lazyWithRetry(() =>
  import("./pages/OrganizationsPage.js").then((m) => ({ default: m.OrganizationsPage }))
);
const WorkspacesPage = lazyWithRetry(() =>
  import("./pages/WorkspacesPage.js").then((m) => ({ default: m.WorkspacesPage }))
);
const ClientsPage = lazyWithRetry(() =>
  import("./pages/ClientsPage.js").then((m) => ({ default: m.ClientsPage }))
);
const InquiriesPage = lazyWithRetry(() =>
  import("./pages/InquiriesPage.js").then((m) => ({ default: m.InquiriesPage }))
);
const PlatformProjectsPage = lazyWithRetry(() =>
  import("./pages/ProjectsPage.js").then((m) => ({ default: m.ProjectsPage }))
);
const PaymentsPage = lazyWithRetry(() =>
  import("./pages/PaymentsPage.js").then((m) => ({ default: m.PaymentsPage }))
);
const ApplicantsPage = lazyWithRetry(() =>
  import("./pages/ApplicantsPage.js").then((m) => ({ default: m.ApplicantsPage }))
);
const MembersPage = lazyWithRetry(() =>
  import("./pages/MembersPage.js").then((m) => ({ default: m.MembersPage }))
);
const RolesPage = lazyWithRetry(() =>
  import("./pages/RolesPage.js").then((m) => ({ default: m.RolesPage }))
);
const AuditLogsPage = lazyWithRetry(() =>
  import("./pages/AuditLogsPage.js").then((m) => ({ default: m.AuditLogsPage }))
);
const NotificationsPage = lazyWithRetry(() =>
  import("./pages/NotificationsPage.js").then((m) => ({ default: m.NotificationsPage }))
);
const SettingsPage = lazyWithRetry(() =>
  import("./pages/SettingsPage.js").then((m) => ({ default: m.SettingsPage }))
);
const LoginPage = lazyWithRetry(() =>
  import("./pages/LoginPage.js").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazyWithRetry(() =>
  import("./pages/RegisterPage.js").then((m) => ({ default: m.RegisterPage }))
);
const AccessDeniedPage = lazyWithRetry(() =>
  import("./pages/AccessDeniedPage.js").then((m) => ({ default: m.AccessDeniedPage }))
);
const NotFoundPage = lazyWithRetry(() =>
  import("./pages/NotFoundPage.js").then((m) => ({ default: m.NotFoundPage }))
);

const PageSuspenseLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 py-16">
    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading ST-Solutions...</p>
  </div>
);

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FeatureProvider>
          <PublicCMSProvider>
            <BrowserRouter>
              <ErrorBoundary fallbackTitle="Application failed to load page">
                <Suspense fallback={<PageSuspenseLoader />}>
                  <Routes>
                {/* 1. Public Visitor-Facing Website Routes */}
                <Route
                  path="/"
                  element={
                    <PublicShell>
                      <HomePage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <PublicShell>
                      <AboutPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <PublicShell>
                      <ServicesPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/solutions"
                  element={
                    <PublicShell>
                      <SolutionsPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <PublicShell>
                      <PublicProjectsPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/projects/:idOrSlug"
                  element={
                    <PublicShell>
                      <ProjectDetailPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <PublicShell>
                      <ContactPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/apply"
                  element={
                    <PublicShell>
                      <ApplyPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/start-project"
                  element={
                    <PublicShell>
                      <StartProjectPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/privacy-policy"
                  element={
                    <PublicShell>
                      <PrivacyPolicyPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/terms"
                  element={
                    <PublicShell>
                      <TermsPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/cookie-policy"
                  element={
                    <PublicShell>
                      <CookiePolicyPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/acceptable-use"
                  element={
                    <PublicShell>
                      <AcceptableUsePage />
                    </PublicShell>
                  }
                />
                <Route
                  path="/security"
                  element={
                    <PublicShell>
                      <SecurityPage />
                    </PublicShell>
                  }
                />

                {/* 2. Public Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* 3. Authenticated Enterprise Platform Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="dashboard">
                        <DashboardPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/ai"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="ai">
                        <AIAssistantPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/organizations"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="organizations">
                        <OrganizationsPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/workspaces"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="workspaces">
                        <WorkspacesPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="clients">
                        <ClientsPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/inquiries"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="inquiries">
                        <InquiriesPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/platform/projects"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="projects">
                        <PlatformProjectsPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="payments">
                        <PaymentsPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/applicants"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="applicants">
                        <ApplicantsPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/members"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="members">
                        <MembersPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/roles"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="roles">
                        <RolesPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/audit"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="audit">
                        <AuditLogsPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="notifications">
                        <NotificationsPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ApplicationShell>
                      <ProtectedRoute module="settings">
                        <SettingsPage />
                      </ProtectedRoute>
                    </ApplicationShell>
                  }
                />

                {/* 4. Error and Fallback Routes */}
                <Route path="/403" element={<AccessDeniedPage />} />
                <Route
                  path="/404"
                  element={
                    <PublicShell>
                      <NotFoundPage />
                    </PublicShell>
                  }
                />
                <Route
                  path="*"
                  element={
                    <PublicShell>
                      <NotFoundPage />
                    </PublicShell>
                  }
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          </BrowserRouter>
          </PublicCMSProvider>
          </FeatureProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
