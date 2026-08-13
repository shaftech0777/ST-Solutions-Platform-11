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
} from "lucide-react";
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
  const { currentOrganization, currentWorkspace, currentUser } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projRes, payRes, cliRes, appRes] = await Promise.all([
        projectsService.getAll({ limit: 5 }),
        paymentsService.getAll({ limit: 5 }),
        clientsService.getAll({ limit: 5 }),
        applicantsService.getAll({ limit: 5 }),
      ]);

      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      setPayments(Array.isArray(payRes.data) ? payRes.data : []);
      setClients(Array.isArray(cliRes.data) ? cliRes.data : []);
      setApplicants(Array.isArray(appRes.data) ? appRes.data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard operational metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentOrganization?.id, currentWorkspace?.id]);

  // Metric aggregates
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalCollected = payments
    .filter((p) => p.paymentStatus === "COMPLETED")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Executive Operations Dashboard"
        description={`Real-time telemetry and management controls for ${
          currentOrganization?.name || "Shaf Tech Solutions"
        }${currentWorkspace ? ` / ${currentWorkspace.name}` : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Bot className="w-4 h-4" />}
              onClick={() => navigate("/ai")}
            >
              Ask ST-AI
            </Button>
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate("/projects")}
            >
              New Project
            </Button>
          </div>
        }
      />

      {error && <ErrorState message={error} onRetry={loadDashboardData} />}

      {/* KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Projects"
          value={projects.length}
          subtitle={`Total Budget: ${formatCurrency(totalBudget)}`}
          icon={FolderKanban}
          isLoading={isLoading}
          onClick={() => navigate("/projects")}
        />
        <StatCard
          title="Total Invoiced / Collected"
          value={formatCurrency(totalCollected)}
          subtitle={`${payments.length} transactions processed`}
          icon={DollarSign}
          isLoading={isLoading}
          onClick={() => navigate("/payments")}
        />
        <StatCard
          title="Managed Clients"
          value={clients.length}
          subtitle="Active enterprise accounts"
          icon={Users}
          isLoading={isLoading}
          onClick={() => navigate("/clients")}
        />
        <StatCard
          title="Talent Pipeline"
          value={applicants.length}
          subtitle="Applicants under review"
          icon={Activity}
          isLoading={isLoading}
          onClick={() => navigate("/applicants")}
        />
      </div>

      {/* Quick Launcher & AI Assistant Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-[#D4AF37] pointer-events-none">
            <Bot className="w-40 h-40" />
          </div>

          <div className="space-y-2 max-w-lg z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-mono font-bold">
              <Bot className="w-3.5 h-3.5" />
              <span>ST-SOLUTIONS Intelligence Engine</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Enterprise AI Insights & Workflow Automation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Query tenant metrics, draft project proposals, analyze pipeline performance, or summarize audit logs using real backend Gemini integration.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 z-10">
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Bot className="w-4 h-4" />}
              onClick={() => navigate("/ai")}
            >
              Launch AI Assistant
            </Button>
            <Button
              variant="dark"
              size="sm"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={() => navigate("/audit")}
            >
              View Audit Trails
            </Button>
          </div>
        </Card>

        {/* Tenant Architecture Status */}
        <Card className="p-6 bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Tenant Architecture Status
            </h3>
            <Badge variant="success" dot>
              Secure
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-400 font-mono">Authentication</span>
              <span className="font-bold text-emerald-400">JWT Token Active</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-400 font-mono">Active Scope</span>
              <span className="font-bold text-amber-300 truncate max-w-[120px]">
                {currentOrganization?.name || "Default Org"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-400 font-mono">Permission Authority</span>
              <span className="font-bold text-white">{currentUser?.accountType || "MEMBER"}</span>
            </div>
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
              Recent Projects Pipeline
            </h3>
            <Link
              to="/projects"
              className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Fetching projects..." />
          ) : projects.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">
              No active projects in this workspace context.
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
                {projects.map((p) => (
                  <TableRow key={p.id} onClick={() => navigate("/projects")}>
                    <TableCell className="font-bold">{p.title}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(p.budget || 0)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.projectStatus === "COMPLETED"
                            ? "success"
                            : p.projectStatus === "IN_PROGRESS"
                            ? "gold"
                            : p.projectStatus === "CANCELLED"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {p.projectStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
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
              className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Fetching payments..." />
          ) : payments.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">
              No recent payments recorded.
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
                {payments.map((p) => (
                  <TableRow key={p.id} onClick={() => navigate("/payments")}>
                    <TableCell className="font-bold font-mono">
                      {formatCurrency(p.amount || 0)}
                    </TableCell>
                    <TableCell className="text-slate-400 font-mono text-[11px]">
                      {p.paymentMethod || "WIRE"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.paymentStatus === "COMPLETED"
                            ? "success"
                            : p.paymentStatus === "FAILED"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {p.paymentStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};
