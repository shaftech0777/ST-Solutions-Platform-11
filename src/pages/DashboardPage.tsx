import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  CreditCard,
  Users,
  Building2,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  Bot,
  Bell,
  Activity,
  DollarSign,
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { StatCard, Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../components/ui/Table.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { ErrorState } from "../components/ui/EmptyState.js";
import { useAuth } from "../context/AuthContext.js";
import { projectsService } from "../api/services/projects.service.js";
import { paymentsService } from "../api/services/payments.service.js";
import { clientsService } from "../api/services/clients.service.js";
import { applicantsService } from "../api/services/applicants.service.js";
import { Project, Payment, Client, Applicant } from "../types/index.js";

export const DashboardPage: React.FC = () => {
  const { currentOrganization, currentWorkspace, currentUser, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const loadDashboardData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const [projRes, payRes, cliRes, appRes] = await Promise.all([
        projectsService.getAll({ limit: 6 }).catch(() => ({ data: [] })),
        paymentsService.getAll({ limit: 6 }).catch(() => ({ data: [] })),
        clientsService.getAll({ limit: 6 }).catch(() => ({ data: [] })),
        applicantsService.getAll({ limit: 6 }).catch(() => ({ data: [] })),
      ]);

      const extractArray = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.items)) return res.data.items;
        if (Array.isArray(res.items)) return res.items;
        return [];
      };

      setProjects(extractArray(projRes));
      setPayments(extractArray(payRes));
      setClients(extractArray(cliRes));
      setApplicants(extractArray(appRes));
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard operational metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadDashboardData();
  }, [currentOrganization?.id, currentWorkspace?.id, currentUser?.id, isAuthLoading]);

  // Metric aggregates
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalCollected = payments
    .filter((p) => p.paymentStatus === "COMPLETED" || (p as any).status === "PAID")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0 }).format(amount);
  };

  const activeProjectsCount = projects.filter(
    (p) => p.projectStatus === "IN_PROGRESS" || (p as any).status === "IN_PROGRESS"
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title={
          currentUser?.accountType === "ADMIN"
            ? "Executive Platform Command Center"
            : currentUser?.accountType === "SUB_ADMIN"
            ? "Operations & Management Dashboard"
            : currentUser?.accountType === "MANAGER"
            ? "Project Delivery & Team Lead Hub"
            : "Workspace & Contribution Hub"
        }
        description={`Real-time telemetry and management controls for ${
          currentOrganization?.name || "ST-Solutions Enterprise"
        }${currentWorkspace ? ` • ${currentWorkspace.name}` : ""} (${currentUser?.accountType || "MEMBER"} View)`}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Bot className="w-4 h-4 text-[#D4AF37]" />}
              onClick={() => navigate("/ai")}
            >
              Ask ST-AI
            </Button>
            {currentUser?.accountType !== "MEMBER" && (
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate("/platform/projects")}
              >
                New Project
              </Button>
            )}
          </div>
        }
      />

      {error && <ErrorState message={error} onRetry={loadDashboardData} />}

      {/* KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Projects Pipeline"
          value={projects.length}
          subtitle={`Pipeline Budget: ${formatCurrency(totalBudget)}`}
          icon={FolderKanban}
          isLoading={isLoading}
          onClick={() => navigate("/platform/projects")}
        />
        {currentUser?.accountType === "ADMIN" || currentUser?.accountType === "SUB_ADMIN" ? (
          <StatCard
            title="Revenue & Collected Funds"
            value={formatCurrency(totalCollected)}
            subtitle={`${payments.length} transactions processed`}
            icon={DollarSign}
            isLoading={isLoading}
            onClick={() => navigate("/payments")}
          />
        ) : (
          <StatCard
            title="Assigned Deliverables"
            value={activeProjectsCount}
            subtitle="Projects actively in progress"
            icon={Clock}
            isLoading={isLoading}
            onClick={() => navigate("/platform/projects")}
          />
        )}
        <StatCard
          title="Enterprise Clients"
          value={clients.length}
          subtitle="Active corporate accounts"
          icon={Users}
          isLoading={isLoading}
          onClick={() => navigate("/clients")}
        />
        <StatCard
          title={currentUser?.accountType === "MEMBER" ? "Candidate Pipeline" : "Talent & Candidate Pool"}
          value={applicants.length}
          subtitle={currentUser?.accountType === "MEMBER" ? "Active applicant submissions" : "Vetting & screening pipeline"}
          icon={UserCheck}
          isLoading={isLoading}
          onClick={() => navigate(currentUser?.accountType === "MEMBER" ? "/platform/projects" : "/applicants")}
        />
      </div>

      {/* Enterprise AI Intelligence Callout + Tenant Security Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800/90 p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-15 dark:opacity-10 text-[#D4AF37] pointer-events-none">
            <Bot className="w-48 h-48" />
          </div>

          <div className="space-y-3 max-w-lg z-10 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ST-SOLUTIONS Intelligence Suite</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Enterprise AI Insights & Workflow Automation
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Query tenant metrics, draft project milestones, summarize audit logs, or analyze candidate resumes with real backend Google Gemini models.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-3 z-10">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Bot className="w-4 h-4 text-[#D4AF37]" />}
              onClick={() => navigate("/ai")}
            >
              Launch AI Assistant
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={() => navigate("/audit")}
            >
              Security Audit Logs
            </Button>
          </div>
        </Card>

        {/* Tenant Architecture & Security Status */}
        <Card className="p-6 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              Tenant Security Scope
            </h2>
            <Badge variant="gold" dot>
              Active Context
            </Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-mono min-w-[110px]">Organization</span>
              <span className="font-bold text-slate-900 dark:text-amber-300 truncate">
                {currentOrganization?.name || "Shaf Tech Solutions"}
              </span>
            </div>
            <div className="flex items-center justify-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-mono min-w-[110px]">Access Role</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {currentUser?.accountType || "ADMIN"}
              </span>
            </div>
            <div className="flex items-center justify-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-mono min-w-[110px]">Workspace</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 truncate">
                {currentWorkspace?.name || "Global Workspace"}
              </span>
            </div>
          </div>

          <div className="pt-2 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span>Isolation: Strict PostgreSQL RBAC</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
        </Card>
      </div>

      {/* Main Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#D4AF37]" />
              Projects Pipeline
            </h3>
            <Link
              to="/platform/projects"
              className="text-sm font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 py-1.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Fetching projects..." />
          ) : projects.length === 0 ? (
            <Card className="p-8 text-center text-sm text-slate-500 border-dashed">
              No active projects in this tenant context.
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {projects.map((p) => {
                  const status = p.projectStatus || (p as any).status || "PLANNING";
                  return (
                    <TableRow
                      key={p.id}
                      onClick={() => navigate("/platform/projects")}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-bold text-slate-900 dark:text-white">
                        {p.title}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-300">
                        {formatCurrency(p.budget || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "COMPLETED"
                              ? "success"
                              : status === "IN_PROGRESS"
                              ? "gold"
                              : status === "CANCELLED"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>

        {/* Recent Payments Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#D4AF37]" />
              Recent Payments Stream
            </h3>
            <Link
              to="/payments"
              className="text-sm font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 py-1.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Fetching payments..." />
          ) : payments.length === 0 ? (
            <Card className="p-8 text-center text-sm text-slate-500 border-dashed">
              No recent payment transactions recorded.
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {payments.map((p) => {
                  const status = p.paymentStatus || (p as any).status || "PENDING";
                  return (
                    <TableRow
                      key={p.id}
                      onClick={() => navigate("/payments")}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-bold font-mono text-slate-900 dark:text-white">
                        {formatCurrency(p.amount || 0)}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 font-mono text-sm">
                        {p.paymentMethod || "WIRE"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "COMPLETED" || status === "PAID"
                              ? "success"
                              : status === "FAILED"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};
