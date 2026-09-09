import React, { useEffect, useState, useCallback } from "react";
import {
  Workflow,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Send,
  ShieldCheck,
  Mail,
  Zap,
  Radio,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Copy,
  Check,
  Sparkles,
  Users,
} from "lucide-react";
import {
  automationService,
  AutomationSystemStatus,
  AutomationLogItem,
} from "../../api/services/automation.service.js";
import { Card } from "../ui/Card.js";
import { Button } from "../ui/Button.js";
import { Badge } from "../ui/Badge.js";
import { Modal } from "../ui/Modal.js";
import { Skeleton } from "../ui/LoadingSpinner.js";
import { EmptyState } from "../ui/EmptyState.js";
import { useToast } from "../../context/ToastContext.js";

export const AutomationManager: React.FC = () => {
  const { addToast } = useToast();

  const [status, setStatus] = useState<AutomationSystemStatus | null>(null);
  const [logs, setLogs] = useState<AutomationLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "marketing">("overview");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [eventFilter, setEventFilter] = useState<string>("ALL");
  const [recipientSearch, setRecipientSearch] = useState<string>("");

  // Test Event Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Selected Log Details Modal
  const [selectedLog, setSelectedLog] = useState<AutomationLogItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Marketing Campaign Modal / State
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignContent, setCampaignContent] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [statusRes, logsRes] = await Promise.allSettled([
        automationService.getStatus(),
        automationService.getLogs({
          status: statusFilter === "ALL" ? undefined : statusFilter,
          event: eventFilter === "ALL" ? undefined : eventFilter,
          recipient: recipientSearch.trim() || undefined,
          limit: 50,
        }),
      ]);

      if (statusRes.status === "fulfilled" && statusRes.value?.data) {
        setStatus(statusRes.value.data);
      }
      if (logsRes.status === "fulfilled" && logsRes.value?.data) {
        setLogs(logsRes.value.data);
      }
    } catch (err: any) {
      addToast(err?.message || "Failed to load automation engine state", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, eventFilter, recipientSearch, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    try {
      const res = await automationService.sendTestEvent(testEmail.trim() || undefined);
      addToast(res.message || "Test event dispatched to n8n outbox!", "success");
      setIsTestModalOpen(false);
      setTestEmail("");
      loadData();
    } catch (err: any) {
      addToast(err?.message || "Failed to dispatch test event", "error");
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject.trim() || !campaignContent.trim()) {
      addToast("Subject and content are required for broadcasts", "error");
      return;
    }
    setIsBroadcasting(true);
    try {
      const res = await automationService.broadcastNewsletter({
        title: campaignTitle.trim() || "Community Newsletter",
        subject: campaignSubject.trim(),
        content: campaignContent.trim(),
      });
      addToast(`Broadcast queued for ${res.data?.recipientCount || 0} active subscribers!`, "success");
      setCampaignTitle("");
      setCampaignSubject("");
      setCampaignContent("");
      loadData();
    } catch (err: any) {
      addToast(err?.message || "Failed to broadcast newsletter", "error");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (logStatus: string) => {
    switch (logStatus) {
      case "DELIVERED":
        return <Badge variant="success">DELIVERED</Badge>;
      case "ACCEPTED_BY_N8N":
        return <Badge variant="info">ACCEPTED BY N8N</Badge>;
      case "SENT":
        return <Badge variant="info">SENT</Badge>;
      case "PROCESSING":
        return <Badge variant="warning">PROCESSING</Badge>;
      case "PENDING":
        return <Badge variant="secondary">PENDING</Badge>;
      case "RETRYING":
        return <Badge variant="warning">RETRYING</Badge>;
      case "FAILED":
        return <Badge variant="error">FAILED</Badge>;
      case "BOUNCED":
        return <Badge variant="error">BOUNCED</Badge>;
      case "SKIPPED":
        return <Badge variant="secondary">LOCAL SKIPPED</Badge>;
      default:
        return <Badge variant="secondary">{logStatus}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  const isConfigured = status?.configured;
  const isEnabled = status?.enabled;

  return (
    <div className="space-y-6">
      {/* Top Controls & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "overview"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Engine Overview
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "logs"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Audit Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("marketing")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "marketing"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Marketing Broadcasts
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTestModalOpen(true)}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            Trigger Test Event
          </Button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Integration Status Banner */}
          <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isEnabled && isConfigured
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                  }`}
                >
                  <Workflow className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      n8n Enterprise Automation Engine
                    </h3>
                    {isEnabled && isConfigured ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected & Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Local Mode / Not Configured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                    Handles asynchronous outbound email dispatch, applicant status alerts, lead intake routing,
                    and marketing sequences with transactional PostgreSQL Outbox durability.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 text-right text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono">Timeout: {status?.timeoutMs || 5000}ms</span>
                <span>Last Delivered: {status?.lastDeliveredAt ? new Date(status.lastDeliveredAt).toLocaleString() : "Never"}</span>
              </div>
            </div>

            {/* Architecture Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-sm">
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-500 font-medium">Outbound Webhook Target</div>
                <div className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate mt-1">
                  {status?.baseUrl ? `${status.baseUrl}/webhook/<event>` : "Not Configured (N8N_BASE_URL)"}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-500 font-medium">Inbound Callback Verification</div>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {status?.webhookSecretConfigured ? "HMAC SHA-256 (Deterministic)" : "Secret Missing (Unverified)"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-500 font-medium">Admin Notification Target</div>
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  {status?.adminNotificationEmail || "admin@st-solutions.com"}
                </div>
              </div>
            </div>
          </Card>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="p-4 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Dispatches</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {status?.deliveryStats.total ?? 0}
              </div>
            </Card>

            <Card className="p-4 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Delivered</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {status?.deliveryStats.delivered ?? 0}
              </div>
            </Card>

            <Card className="p-4 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Accepted by n8n</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {status?.deliveryStats.accepted ?? 0}
              </div>
            </Card>

            <Card className="p-4 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending Outbox</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {status?.deliveryStats.pending ?? 0}
              </div>
            </Card>

            <Card className="p-4 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-orange-600 dark:text-orange-400">Retrying Queue</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {status?.deliveryStats.retrying ?? 0}
              </div>
            </Card>

            <Card className="p-4 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-rose-600 dark:text-rose-400">Failed / Deadletter</div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {status?.deliveryStats.failed ?? 0}
              </div>
            </Card>
          </div>

          {/* Quick Recent Activity Table */}
          <Card className="p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Recent Outbox Deliveries
              </h4>
              <button
                onClick={() => setActiveTab("logs")}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                View Full Audit Logs <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No automation events recorded yet. Try sending a test ping!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-medium">
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Event</th>
                      <th className="pb-3">Recipient</th>
                      <th className="pb-3">Attempts</th>
                      <th className="pb-3">Created</th>
                      <th className="pb-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3">{getStatusBadge(log.status)}</td>
                        <td className="py-3 font-mono text-xs text-slate-900 dark:text-white">{log.event}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-300 text-xs truncate max-w-[150px]">
                          {log.recipient || "Internal Admin"}
                        </td>
                        <td className="py-3 text-xs text-slate-500">
                          {log.attempts}/{log.maxAttempts}
                        </td>
                        <td className="py-3 text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4 border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ACCEPTED_BY_N8N">ACCEPTED BY N8N</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="RETRYING">RETRYING</option>
                  <option value="FAILED">FAILED</option>
                  <option value="BOUNCED">BOUNCED</option>
                  <option value="SKIPPED">SKIPPED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Filter by Domain Event
                </label>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Events</option>
                  <option value="contact.message.received">contact.message.received</option>
                  <option value="project_inquiry.created">project_inquiry.created</option>
                  <option value="member_application.submitted">member_application.submitted</option>
                  <option value="member_application.approved">member_application.approved</option>
                  <option value="member_application.rejected">member_application.rejected</option>
                  <option value="marketing.subscriber.added">marketing.subscriber.added</option>
                  <option value="system.test.dispatched">system.test.dispatched</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Search Recipient Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. user@client.com"
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </Card>

          {/* Logs Table */}
          <Card className="p-6 border border-slate-200 dark:border-slate-800">
            {logs.length === 0 ? (
              <EmptyState
                title="No logs found"
                description="No automation logs match your current filter criteria."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-medium">
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Event</th>
                      <th className="pb-3">Recipient</th>
                      <th className="pb-3">Delivery ID</th>
                      <th className="pb-3">Attempts</th>
                      <th className="pb-3">HTTP Code</th>
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3">{getStatusBadge(log.status)}</td>
                        <td className="py-3 font-mono text-xs text-slate-900 dark:text-white">{log.event}</td>
                        <td className="py-3 text-xs text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                          {log.recipient || "Internal Admin"}
                        </td>
                        <td className="py-3 font-mono text-xs text-slate-500">
                          <span title={log.deliveryId}>{log.deliveryId.slice(0, 8)}...</span>
                        </td>
                        <td className="py-3 text-xs text-slate-500">
                          {log.attempts}/{log.maxAttempts}
                        </td>
                        <td className="py-3 text-xs">
                          {log.responseCode ? (
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono text-xs ${
                                log.responseCode >= 200 && log.responseCode < 300
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                              }`}
                            >
                              {log.responseCode}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "marketing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
              Broadcast Newsletter Campaign
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Dispatches an automated email blast to all active newsletter subscribers via n8n's batch email workflow.
            </p>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Internal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Platform Product Updates"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exciting New Enterprise Capabilities in ST-Solutions"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Body (Markdown or HTML supported) *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write your announcement or newsletter content here..."
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white font-sans"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isBroadcasting}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Send Newsletter Broadcast
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Marketing Integration Details
            </h4>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">Automated Triggers</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Public footer sign-up triggers welcome email sequence.</li>
                  <li>Double opt-in verification supported.</li>
                  <li>One-click unsubscribe links handled securely.</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">Provider Telemetry</div>
                <p>
                  Delivery status callbacks are automatically ingested into the platform's audit trail to track open,
                  click, and bounce rates.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Trigger Test Event Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Trigger System Automation Ping"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Dispatches a test event (`system.test.dispatched`) with canonical HMAC SHA-256 signing to your configured
            n8n webhook. This verifies end-to-end network connectivity and signature verification.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Notification Recipient (Optional)
            </label>
            <input
              type="email"
              placeholder={status?.adminNotificationEmail || "admin@st-solutions.com"}
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendTest}
              isLoading={isSendingTest}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Dispatch Test Event
            </Button>
          </div>
        </div>
      </Modal>

      {/* Log Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Delivery Audit Inspection"
      >
        {selectedLog && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <span className="text-xs text-slate-500">Status</span>
                <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">HTTP Status</span>
                <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {selectedLog.responseCode || "N/A"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Event Name:</span>
                <div className="font-mono font-medium text-slate-900 dark:text-white mt-0.5">
                  {selectedLog.event}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Recipient:</span>
                <div className="font-medium text-slate-900 dark:text-white mt-0.5">
                  {selectedLog.recipient || "Internal Admin"}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Delivery ID:</span>
                <div className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                  {selectedLog.deliveryId}
                  <button
                    onClick={() => copyToClipboard(selectedLog.deliveryId, "deliveryId")}
                    className="p-1 hover:text-indigo-600"
                  >
                    {copiedId === "deliveryId" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-slate-500">Provider Message ID:</span>
                <div className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                  {selectedLog.providerMsgId || "None"}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Attempts / Max:</span>
                <div className="font-medium text-slate-900 dark:text-white mt-0.5">
                  {selectedLog.attempts} / {selectedLog.maxAttempts}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Next Scheduled Retry:</span>
                <div className="font-medium text-slate-900 dark:text-white mt-0.5">
                  {selectedLog.nextRetryAt ? new Date(selectedLog.nextRetryAt).toLocaleString() : "None"}
                </div>
              </div>
            </div>

            {selectedLog.failureReason && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-700 dark:text-rose-300">
                <span className="font-semibold block mb-1">Failure Reason / Error Diagnostic:</span>
                {selectedLog.failureReason}
              </div>
            )}

            {selectedLog.responseBody && (
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Response Body:</span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-40">
                  {selectedLog.responseBody}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
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
