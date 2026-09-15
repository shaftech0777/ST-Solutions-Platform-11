import React, { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Search,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Activity,
  User,
  Clock,
  Globe,
  Filter,
  Eye,
  ShieldAlert,
  Lock,
  Download,
  AlertCircle,
  Database,
  Building2,
  Briefcase,
  CreditCard,
  Key } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../components/ui/Table.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge, Avatar } from "../components/ui/Badge.js";
import { Card } from "../components/ui/Card.js";
import { Modal } from "../components/ui/Modal.js";
import { Input } from "../components/ui/Input.js";
import { Select } from "../components/ui/Select.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { Skeleton } from "../components/ui/LoadingSpinner.js";
import { auditService, AuditStatisticsData } from "../api/services/audit.service.js";
import { useAuth } from "../context/AuthContext.js";
import { AuditLogItem } from "../types/index.js";
import { useToast } from "../context/ToastContext.js";

const AUDIT_ACTION_CATEGORIES = [
  { value: "ALL", label: "All Audit Actions" },
  { value: "AUTH", label: "Authentication & Sessions" },
  { value: "ORGANIZATION", label: "Organizations" },
  { value: "WORKSPACE", label: "Workspaces" },
  { value: "CLIENT", label: "Clients & Accounts" },
  { value: "PROJECT", label: "Projects & Milestones" },
  { value: "PAYMENT", label: "Payments & Ledger" },
  { value: "APPLICANT", label: "Talent & Applicants" },
  { value: "ROLE", label: "Roles & RBAC" },
  { value: "SETTINGS", label: "Platform Settings" },
];

export const AuditLogsPage: React.FC = () => {
  const { currentUser, currentOrganization, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [statsData, setStatsData] = useState<AuditStatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [actionCategory, setActionCategory] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const loadAuditLogs = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const [logsRes, statsRes] = await Promise.allSettled([
        auditService.getAll({
          search: search.trim() || undefined,
          action: actionCategory !== "ALL" ? actionCategory : undefined,
          limit: 100 }),
        auditService.getStatistics(),
      ]);

      if (logsRes.status === "fulfilled") {
        const data = logsRes.value.data;
        setLogs(Array.isArray(data) ? data : Array.isArray(logsRes.value) ? (logsRes.value as any) : []);
      } else {
        throw logsRes.reason;
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        setStatsData(statsRes.value.data);
      } else {
        setStatsData(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load security audit trail");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadAuditLogs();
  }, [actionCategory, currentOrganization?.id, currentUser?.id, isAuthLoading]);

  // Derive audit statistics from real logs
  const stats = useMemo(() => {
    let total = logs.length;
    let authEvents = 0;
    let entityChanges = 0;
    let securityModifications = 0;

    for (const log of logs) {
      const a = (log.action || "").toUpperCase();
      if (a.includes("AUTH") || a.includes("LOGIN") || a.includes("LOGOUT") || a.includes("REFRESH") || a.includes("SESSION")) {
        authEvents++;
      } else if (a.includes("ROLE") || a.includes("PERMISSION") || a.includes("PASSWORD") || a.includes("SUSPEND")) {
        securityModifications++;
      } else {
        entityChanges++;
      }
    }

    return {
      total: statsData?.totalLogs ?? total,
      authEvents,
      entityChanges,
      securityModifications };
  }, [logs, statsData]);

  // Filtered audit entries
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const action = (log.action || "").toUpperCase();
      if (actionCategory !== "ALL" && !action.includes(actionCategory)) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const desc = (log.description || "").toLowerCase();
        const userEmail = (log.user?.email || "").toLowerCase();
        const userName = (log.user?.profile?.fullName || "").toLowerCase();
        const ip = (log.ipAddress || "").toLowerCase();
        const actionStr = action.toLowerCase();

        if (
          !desc.includes(q) &&
          !userEmail.includes(q) &&
          !userName.includes(q) &&
          !ip.includes(q) &&
          !actionStr.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [logs, actionCategory, search]);

  const getActionBadge = (action: string) => {
    const a = (action || "").toUpperCase();
    if (a.includes("AUTH") || a.includes("LOGIN") || a.includes("LOGOUT")) {
      return <Badge variant="info">{action}</Badge>;
    }
    if (a.includes("CREATE") || a.includes("ADD") || a.includes("ONBOARD") || a.includes("APPROVE")) {
      return <Badge variant="success">{action}</Badge>;
    }
    if (a.includes("DELETE") || a.includes("REMOVE") || a.includes("REJECT") || a.includes("SUSPEND")) {
      return <Badge variant="danger">{action}</Badge>;
    }
    if (a.includes("UPDATE") || a.includes("PATCH") || a.includes("CHANGE") || a.includes("ROLE")) {
      return <Badge variant="gold">{action}</Badge>;
    }
    return <Badge variant="neutral">{action}</Badge>;
  };

  return (
    <div className="space-y-6" id="audit-logs-page-root">
      <PageHeader
        title="Security & Compliance Audit Trail"
        description="Immutable system event ledger tracking tenant context switches, RBAC adjustments, authorization decisions, and critical business mutations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={loadAuditLogs}
              disabled={isLoading}
            >
              Refresh Logs
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="audit-kpi-summary">
        <Card className="p-5 border-border/60 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Audit Records</span>
            <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-text">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.total}</div>
            <p className="text-xs text-text-muted mt-1">Immutable journal events</p>
          </div>
        </Card>

        <Card className="p-5 border-blue-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Auth & Session Events</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.authEvents}</div>
            <p className="text-xs text-text-muted mt-1">Logins, token refreshes, switches</p>
          </div>
        </Card>

        <Card className="p-5 border-emerald-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Business Mutations</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.entityChanges}</div>
            <p className="text-xs text-text-muted mt-1">Client, project & ledger updates</p>
          </div>
        </Card>

        <Card className="p-5 border-amber-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Security & RBAC Actions</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.securityModifications}</div>
            <p className="text-xs text-text-muted mt-1">Role assignments & status locks</p>
          </div>
        </Card>
      </div>

      {/* Compliance Notice */}
      <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl flex items-center gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
        <div className="text-text-muted">
          <strong className="text-text">Enterprise Compliance Guarantee:</strong> All logged operations are write-once and cryptographically tied to tenant isolation boundaries. No audit logs may be modified or deleted by user requests.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-border/60 bg-surface">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by action, actor email, description, IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface-hover/60 border border-border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                ×
              </button>
            )}
          </div>

          <div className="w-full sm:w-60">
            <Select
              options={AUDIT_ACTION_CATEGORIES}
              value={actionCategory}
              onChange={(e) => setActionCategory(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && <ErrorState message={error} onRetry={loadAuditLogs} />}

      {/* Loading state */}
      {isLoading && (
        <Card className="p-6 border-border/60">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredLogs.length === 0 && (
        <EmptyState
          icon={<Terminal className="w-10 h-10 text-gold/60" />}
          title={search || actionCategory !== "ALL" ? "No matching audit records" : "Audit trail is clean"}
          description={
            search || actionCategory !== "ALL"
              ? "Try adjusting your search criteria or action category filter."
              : "Security events and operational transactions will be automatically registered here as users interact with the system."
          }
          action={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={loadAuditLogs}
            >
              Refresh Trail
            </Button>
          }
        />
      )}

      {/* Desktop Table View */}
      {!isLoading && !error && filteredLogs.length > 0 && (
        <>
          <div className="hidden md:block">
            <Card className="border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor / User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description / Resource</TableHead>
                    <TableHead>Origin IP</TableHead>
                    <TableHead className="text-right">Inspection</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {filteredLogs.map((log) => {
                    const actorName = log.user?.profile?.fullName || log.user?.email || (log.userId ? `User #${log.userId.slice(0, 8)}` : "System Service");
                    const actorEmail = log.user?.email || (log.userId ? log.userId : "system@internal");

                    return (
                      <TableRow key={log.id} className="hover:bg-surface-hover/50 transition-colors">
                        <TableCell>
                          <div className="text-xs font-mono text-text font-medium">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-[11px] text-text-muted font-mono">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-xs text-text">{actorName}</div>
                          <div className="text-[11px] text-text-muted truncate max-w-[180px]">{actorEmail}</div>
                        </TableCell>

                        <TableCell>{getActionBadge(log.action)}</TableCell>

                        <TableCell>
                          <div className="text-xs text-text max-w-xs truncate" title={log.description || ""}>
                            {log.description || "System operation executed"}
                          </div>
                          {log.entityType && (
                            <div className="text-[10px] text-gold/80 font-mono mt-0.5">
                              {log.entityType} {log.entityId ? `[${log.entityId.slice(0, 8)}]` : ""}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="font-mono text-xs text-text-muted flex items-center gap-1">
                            <Globe className="w-3 h-3 text-gold/60" />
                            <span>{log.ipAddress || "Internal / 127.0.0.1"}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="xs"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedLog(log)}
                          >
                            Inspect
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          </div>

          {/* Mobile Card List */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredLogs.map((log) => {
              const actorName = log.user?.profile?.fullName || log.user?.email || (log.userId ? `User #${log.userId.slice(0, 8)}` : "System Service");

              return (
                <Card key={log.id} className="p-4 border-border/60 bg-surface space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-text">{actorName}</div>
                      <div className="text-[11px] text-text-muted font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {getActionBadge(log.action)}
                  </div>

                  <p className="text-xs text-text-muted">{log.description || "Operational event logged."}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <div className="font-mono text-[11px] text-text-muted flex items-center gap-1">
                      <Globe className="w-3 h-3 text-gold/60" />
                      <span>{log.ipAddress || "127.0.0.1"}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="xs"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedLog(log)}
                    >
                      Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Audit Log Inspection Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Deep Inspection"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-surface-hover/60 rounded-xl border border-border/60 flex items-center justify-between">
              <div>
                <span className="text-text-muted uppercase tracking-wider text-[10px] block">Audit Event Action</span>
                <div className="text-base font-mono font-bold text-text mt-0.5">{selectedLog.action}</div>
              </div>
              <div>{getActionBadge(selectedLog.action)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-text-muted font-semibold">Event ID:</span>
                <div className="font-mono text-text">{selectedLog.id}</div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted font-semibold">Timestamp:</span>
                <div className="text-text font-mono">{new Date(selectedLog.createdAt).toISOString()}</div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted font-semibold">Actor / User ID:</span>
                <div className="text-text font-mono">
                  {selectedLog.user?.email || selectedLog.userId || "System Service"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted font-semibold">Origin IP Address:</span>
                <div className="text-text font-mono">{selectedLog.ipAddress || "Internal Network"}</div>
              </div>

              {selectedLog.entityType && (
                <div className="space-y-1">
                  <span className="text-text-muted font-semibold">Target Entity Type:</span>
                  <div className="text-text font-mono">{selectedLog.entityType}</div>
                </div>
              )}

              {selectedLog.entityId && (
                <div className="space-y-1">
                  <span className="text-text-muted font-semibold">Target Entity ID:</span>
                  <div className="text-text font-mono">{selectedLog.entityId}</div>
                </div>
              )}
            </div>

            <div className="space-y-1 pt-2 border-t border-border/60">
              <span className="text-text-muted font-semibold block">Audit Memo Description:</span>
              <p className="text-text bg-surface p-3 rounded-lg border border-border/60 leading-relaxed">
                {selectedLog.description || "Standard operation executed without custom telemetry notes."}
              </p>
            </div>

            {selectedLog.details && (
              <div className="space-y-1">
                <span className="text-text-muted font-semibold block">Event Payload / JSON Context:</span>
                <pre className="p-3 bg-black/40 text-gold rounded-lg border border-border/60 font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
