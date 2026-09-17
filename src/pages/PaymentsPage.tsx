import React, { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  Briefcase,
  Eye,
  Edit2,
  Trash2,
  Filter,
  ArrowUpDown,
  Download,
  Calendar,
  UserCheck,
  FileText,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell, Pagination } from "../components/ui/Table.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Card } from "../components/ui/Card.js";
import { Modal, ConfirmModal } from "../components/ui/Modal.js";
import { Input, Textarea } from "../components/ui/Input.js";
import { Select } from "../components/ui/Select.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { Skeleton } from "../components/ui/LoadingSpinner.js";
import { useToast } from "../context/ToastContext.js";
import { useAuth } from "../context/AuthContext.js";
import { paymentsService, PaymentStatisticsData } from "../api/services/payments.service.js";
import { clientsService } from "../api/services/clients.service.js";
import { projectsService } from "../api/services/projects.service.js";
import { Payment, Client, Project, PaymentStatus } from "../types/index.js";

const PAYMENT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PAID", label: "Paid / Approved" },
  { value: "PENDING", label: "Pending Verification" },
  { value: "PROCESSING", label: "Processing" },
  { value: "FAILED", label: "Failed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "REFUNDED", label: "Refunded" },
];

const PAYMENT_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Methods" },
  { value: "WIRE_TRANSFER", label: "Wire Transfer / SWIFT" },
  { value: "BANK_TRANSFER", label: "ACH / Direct Bank" },
  { value: "CREDIT_CARD", label: "Credit Card / Stripe" },
  { value: "STRIPE", label: "Stripe Checkout" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "CRYPTO", label: "Crypto / USDT" },
  { value: "CASH", label: "Cash / Cheque" },
  { value: "OTHER", label: "Other" },
];

const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "GBP", label: "GBP (£) - British Pound" },
  { value: "CAD", label: "CAD ($) - Canadian Dollar" },
  { value: "AUD", label: "AUD ($) - Australian Dollar" },
  { value: "PKR", label: "PKR (Rs) - Pakistani Rupee" },
  { value: "AED", label: "AED (د.إ) - UAE Dirham" },
];

export const PaymentsPage: React.FC = () => {
  const { addToast } = useToast();
  const { currentUser, currentOrganization, currentWorkspace, isLoading: isAuthLoading } = useAuth();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statsData, setStatsData] = useState<PaymentStatisticsData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [paymentToStatusUpdate, setPaymentToStatusUpdate] = useState<{
    payment: Payment;
    newStatus: string;
  } | null>(null);

  const [statusNotes, setStatusNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientId: "",
    projectId: "",
    amount: "",
    currency: "USD",
    paymentMethod: "WIRE_TRANSFER",
    transactionReference: "",
    approvalNotes: "",
    paymentStatus: "PENDING" });

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const [payRes, clientsRes, projectsRes, statsRes] = await Promise.allSettled([
        paymentsService.getAll({
          search: search.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          paymentMethod: methodFilter !== "ALL" ? methodFilter : undefined,
          page,
          limit: 100 }),
        clientsService.getAll({ limit: 100 }),
        projectsService.getAll({ limit: 100 }),
        paymentsService.getStatistics(),
      ]);

      let items: Payment[] = [];
      if (payRes.status === "fulfilled") {
        const data = payRes.value.data;
        if (Array.isArray(data)) {
          items = data;
        } else if (Array.isArray(payRes.value)) {
          items = payRes.value as any;
        } else if (Array.isArray((payRes.value as any)?.items)) {
          items = (payRes.value as any).items;
        }
        setPayments(items);
      } else {
        throw payRes.reason;
      }

      if (clientsRes.status === "fulfilled") {
        const cData = clientsRes.value.data;
        setClients(Array.isArray(cData) ? cData : Array.isArray(clientsRes.value) ? (clientsRes.value as any) : []);
      }

      if (projectsRes.status === "fulfilled") {
        const pData = projectsRes.value.data;
        setProjects(Array.isArray(pData) ? pData : Array.isArray(projectsRes.value) ? (projectsRes.value as any) : []);
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        setStatsData(statsRes.value.data);
      } else {
        setStatsData(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load financial records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadData();
  }, [search, statusFilter, methodFilter, currentOrganization?.id, currentWorkspace?.id, currentUser?.id, isAuthLoading]);

  // Filter projects when a client is selected in the form
  const clientProjects = useMemo(() => {
    if (!formData.clientId) return projects;
    return projects.filter((p) => p.clientId === formData.clientId);
  }, [formData.clientId, projects]);

  // Compute stats strictly from real fetched data
  const summary = useMemo(() => {
    if (statsData) {
      return {
        totalCount: statsData.totalPayments || payments.length,
        totalCollected: statsData.paidAmount ?? 0,
        pendingAmount: statsData.pendingAmount ?? 0,
        failedAmount: statsData.rejectedAmount ?? 0 };
    }

    let totalCount = payments.length;
    let totalCollected = 0;
    let pendingAmount = 0;
    let failedAmount = 0;

    for (const p of payments) {
      const amt = Number(p.amount) || 0;
      const status = (p.paymentStatus || "").toUpperCase();
      if (status === "PAID" || status === "APPROVED" || status === "COMPLETED") {
        totalCollected += amt;
      } else if (status === "PENDING" || status === "PROCESSING" || status === "SUBMITTED") {
        pendingAmount += amt;
      } else if (status === "FAILED" || status === "REJECTED" || status === "REFUNDED") {
        failedAmount += amt;
      }
    }

    return { totalCount, totalCollected, pendingAmount, failedAmount };
  }, [payments, statsData]);

  // Client side filtered list
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const status = (p.paymentStatus || "").toUpperCase();
      if (statusFilter !== "ALL") {
        if (statusFilter === "PAID" && status !== "PAID" && status !== "APPROVED" && status !== "COMPLETED") {
          return false;
        } else if (statusFilter === "PENDING" && status !== "PENDING" && status !== "SUBMITTED") {
          return false;
        } else if (statusFilter === "FAILED" && status !== "FAILED" && status !== "REJECTED") {
          return false;
        } else if (statusFilter !== "PAID" && statusFilter !== "PENDING" && statusFilter !== "FAILED" && status !== statusFilter) {
          return false;
        }
      }

      if (methodFilter !== "ALL") {
        const method = (p.paymentMethod || "").toUpperCase();
        if (method !== methodFilter) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const ref = (p.transactionReference || "").toLowerCase();
        const clientName = (p.client?.fullName || p.client?.companyName || "").toLowerCase();
        const projTitle = (p.project?.title || "").toLowerCase();
        const currency = (p.currency || "").toLowerCase();
        const notes = (p.approvalNotes || "").toLowerCase();
        if (
          !ref.includes(q) &&
          !clientName.includes(q) &&
          !projTitle.includes(q) &&
          !currency.includes(q) &&
          !notes.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [payments, statusFilter, methodFilter, search]);

  const openCreateModal = () => {
    setEditingPayment(null);
    setFormData({
      clientId: clients[0]?.id || "",
      projectId: "",
      amount: "",
      currency: "USD",
      paymentMethod: "WIRE_TRANSFER",
      transactionReference: "",
      approvalNotes: "",
      paymentStatus: "PENDING" });
    setModalError(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      clientId: payment.clientId || payment.client?.id || "",
      projectId: payment.projectId || payment.project?.id || "",
      amount: String(payment.amount || ""),
      currency: payment.currency || "USD",
      paymentMethod: payment.paymentMethod || "WIRE_TRANSFER",
      transactionReference: payment.transactionReference || "",
      approvalNotes: payment.approvalNotes || "",
      paymentStatus: payment.paymentStatus || "PENDING" });
    setModalError(null);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      setModalError("Please select an associated client for this transaction");
      return;
    }
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setModalError("Please enter a valid positive payment amount");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      if (editingPayment) {
        await paymentsService.update(editingPayment.id, {
          clientId: formData.clientId,
          projectId: formData.projectId || null,
          amount: numAmount,
          currency: formData.currency,
          paymentMethod: formData.paymentMethod,
          transactionReference: formData.transactionReference || null,
          approvalNotes: formData.approvalNotes || null });
        addToast({
          type: "success",
          title: "Payment Updated",
          message: "Financial ledger record updated successfully." });
      } else {
        await paymentsService.create({
          clientId: formData.clientId,
          projectId: formData.projectId || null,
          amount: numAmount,
          currency: formData.currency,
          paymentMethod: formData.paymentMethod,
          transactionReference: formData.transactionReference || undefined,
          approvalNotes: formData.approvalNotes || undefined,
          paymentStatus: formData.paymentStatus });
        addToast({
          type: "success",
          title: "Payment Recorded",
          message: "Payment entry successfully registered in the financial ledger." });
      }

      setIsCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to process payment record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChangeConfirm = async () => {
    if (!paymentToStatusUpdate) return;
    setIsSubmitting(true);
    try {
      await paymentsService.updateStatus(
        paymentToStatusUpdate.payment.id,
        paymentToStatusUpdate.newStatus,
        statusNotes.trim() || undefined
      );
      addToast({
        type: "success",
        title: "Status Updated",
        message: `Payment status transitioned to ${paymentToStatusUpdate.newStatus}.` });
      setPaymentToStatusUpdate(null);
      setStatusNotes("");
      loadData();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Status Update Failed",
        message: err.message || "Could not update payment status." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      await paymentsService.delete(paymentToDelete.id);
      addToast({
        type: "success",
        title: "Payment Deleted",
        message: "Payment ledger record removed." });
      setPaymentToDelete(null);
      loadData();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Deletion Failed",
        message: err.message || "Failed to remove payment record." });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PAID":
      case "APPROVED":
      case "COMPLETED":
        return <Badge variant="success">Paid / Approved</Badge>;
      case "PENDING":
      case "SUBMITTED":
        return <Badge variant="warning">Pending Verification</Badge>;
      case "PROCESSING":
        return <Badge variant="info">Processing</Badge>;
      case "FAILED":
      case "REJECTED":
        return <Badge variant="danger">Failed / Rejected</Badge>;
      case "REFUNDED":
        return <Badge variant="neutral">Refunded</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6" id="payments-page-root">
      <PageHeader
        title="Payments & Financial Operations"
        description="Enterprise invoice reconciliation, wire transfers, payment audit trails, and project financial ledgers."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={loadData}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openCreateModal}
            >
              Record Payment
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="payments-kpi-summary">
        <Card className="p-5 border-border/60 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Total Recorded</span>
            <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-text">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{summary.totalCount}</div>
            <p className="text-sm text-text-muted mt-1">Total transaction entries in ledger</p>
          </div>
        </Card>

        <Card className="p-5 border-emerald-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">
              {formatCurrency(summary.totalCollected, "USD")}
            </div>
            <p className="text-sm text-text-muted mt-1">Settled & approved payments</p>
          </div>
        </Card>

        <Card className="p-5 border-amber-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Pending Verification</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">
              {formatCurrency(summary.pendingAmount, "USD")}
            </div>
            <p className="text-sm text-text-muted mt-1">Awaiting compliance confirmation</p>
          </div>
        </Card>

        <Card className="p-5 border-rose-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-rose-500 uppercase tracking-wider">Failed / Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">
              {formatCurrency(summary.failedAmount, "USD")}
            </div>
            <p className="text-sm text-text-muted mt-1">Declined or refunded records</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-border/60 bg-surface">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by reference, client name, project title, notes..."
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

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="w-full sm:w-48">
              <Select
                options={PAYMENT_STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={PAYMENT_METHOD_OPTIONS}
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && <ErrorState message={error} onRetry={loadData} />}

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

      {/* Main Table / List View */}
      {!isLoading && !error && filteredPayments.length === 0 && (
        <EmptyState
          icon={<CreditCard className="w-10 h-10 text-gold/60" />}
          title={search || statusFilter !== "ALL" || methodFilter !== "ALL" ? "No matching payments found" : "No payments recorded yet"}
          description={
            search || statusFilter !== "ALL" || methodFilter !== "ALL"
              ? "Try adjusting your search criteria, status, or payment method filter."
              : "Financial transactions, invoices, and wire settlements will appear here once recorded."
          }
          action={
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openCreateModal}
            >
              Record First Payment
            </Button>
          }
        />
      )}

      {!isLoading && !error && filteredPayments.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card className="border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction / Ref</TableHead>
                    <TableHead>Client & Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const clientName = payment.client?.fullName || payment.client?.companyName || "Unassigned Client";
                    const projectTitle = payment.project?.title || "No linked project";

                    return (
                      <TableRow key={payment.id} className="hover:bg-surface-hover/50 transition-colors">
                        <TableCell>
                          <div className="font-mono text-sm font-semibold text-text">
                            {payment.transactionReference || payment.id.slice(0, 13)}
                          </div>
                          {payment.approvalNotes && (
                            <div className="text-sm text-text-muted truncate max-w-[200px] mt-0.5" title={payment.approvalNotes}>
                              {payment.approvalNotes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm text-text flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gold shrink-0" />
                            <span className="truncate max-w-[180px]">{clientName}</span>
                          </div>
                          <div className="text-sm text-text-muted flex items-center gap-1.5 mt-0.5">
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[180px]">{projectTitle}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm text-text">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                          <div className="text-sm text-text-muted uppercase tracking-wider">{payment.currency}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-text bg-surface-hover px-2 py-1 rounded inline-block">
                            {(payment.paymentMethod || "WIRE_TRANSFER").replace(/_/g, " ")}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
                        <TableCell>
                          <div className="text-sm text-text">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-text-muted">
                            {new Date(payment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-4 h-4" />}
                              title="Inspect Details"
                              onClick={() => setSelectedPayment(payment)}
                            />
                            <IconButton
                              variant="ghost"
                              size="sm"
                              icon={<Edit2 className="w-4 h-4" />}
                              title="Edit Payment"
                              onClick={() => openEditModal(payment)}
                            />
                            <IconButton
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                              title="Delete Record"
                              onClick={() => setPaymentToDelete(payment)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredPayments.map((payment) => {
              const clientName = payment.client?.fullName || payment.client?.companyName || "Unassigned Client";
              const projectTitle = payment.project?.title || "No linked project";

              return (
                <Card key={payment.id} className="p-4 border-border/60 bg-surface space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-sm font-semibold text-text">
                        {payment.transactionReference || payment.id.slice(0, 13)}
                      </div>
                      <div className="text-sm text-text-muted mt-0.5">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {getStatusBadge(payment.paymentStatus)}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-1.5 text-text">
                      <Building2 className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="font-medium">{clientName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span>{projectTitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                      <div className="text-base font-bold text-text">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      <div className="text-sm text-text-muted uppercase">
                        {(payment.paymentMethod || "WIRE_TRANSFER").replace(/_/g, " ")}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedPayment(payment)}
                      >
                        Details
                      </Button>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => openEditModal(payment)}
                      />
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                        onClick={() => setPaymentToDelete(payment)}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Record / Edit Payment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingPayment ? "Edit Payment Record" : "Record Financial Payment"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-sm text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Associated Client *"
              required
              options={[
                { value: "", label: "Select Client" },
                ...clients.map((c) => ({
                  value: c.id,
                  label: `${c.fullName || c.name || "Client"} (${c.companyName || c.email})` })),
              ]}
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value, projectId: "" })}
            />

            <Select
              label="Linked Project (Optional)"
              options={[
                { value: "", label: "None / Direct Client Account" },
                ...clientProjects.map((p) => ({
                  value: p.id,
                  label: `${p.title} (${p.projectStatus})` })),
              ]}
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Payment Amount *"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 5000.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />

            <Select
              label="Currency *"
              required
              options={CURRENCY_OPTIONS}
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Payment Method *"
              options={PAYMENT_METHOD_OPTIONS.filter((o) => o.value !== "ALL")}
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            />

            <Input
              label="Transaction Reference / Cheque #"
              placeholder="e.g. WIRE-2026-8891, TXN-9941"
              value={formData.transactionReference}
              onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
            />
          </div>

          {!editingPayment && (
            <Select
              label="Initial Status"
              options={[
                { value: "PENDING", label: "Pending Verification" },
                { value: "PAID", label: "Paid / Approved Directly" },
                { value: "PROCESSING", label: "Processing" },
              ]}
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
            />
          )}

          <Textarea
            label="Accounting Notes & Approval Memorandum"
            placeholder="Specify invoice number, bank reference remarks, or tax breakdown notes..."
            rows={3}
            value={formData.approvalNotes}
            onChange={(e) => setFormData({ ...formData, approvalNotes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {editingPayment ? "Save Changes" : "Register Payment"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payment Inspection Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Payment Record Inspection"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface-hover/60 rounded-xl border border-border/60">
              <div>
                <span className="text-sm text-text-muted uppercase tracking-wider">Amount Settled</span>
                <div className="text-2xl font-bold text-text mt-0.5">
                  {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                </div>
              </div>
              <div>{getStatusBadge(selectedPayment.paymentStatus)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-text-muted">Transaction ID:</span>
                <div className="font-mono text-text break-all font-medium">{selectedPayment.id}</div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Reference / SWIFT Code:</span>
                <div className="font-mono text-text font-medium">
                  {selectedPayment.transactionReference || "None provided"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Payment Method:</span>
                <div className="text-text font-medium">
                  {(selectedPayment.paymentMethod || "WIRE_TRANSFER").replace(/_/g, " ")}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Date Recorded:</span>
                <div className="text-text font-medium">
                  {new Date(selectedPayment.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Associated Client:</span>
                <div className="text-text font-medium">
                  {selectedPayment.client?.fullName || selectedPayment.client?.companyName || "Unassigned"}
                </div>
                {selectedPayment.client?.email && (
                  <div className="text-text-muted">{selectedPayment.client.email}</div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Linked Project:</span>
                <div className="text-text font-medium">
                  {selectedPayment.project?.title || "No linked project"}
                </div>
              </div>
            </div>

            {selectedPayment.approvalNotes && (
              <div className="p-3 bg-surface rounded-lg border border-border/60">
                <span className="text-sm font-semibold text-text-muted block mb-1">Approval / Accounting Notes</span>
                <p className="text-sm text-text whitespace-pre-wrap">{selectedPayment.approvalNotes}</p>
              </div>
            )}

            {/* Quick Status Transition Actions */}
            <div className="p-4 bg-surface-hover/40 rounded-xl border border-border/60 space-y-3">
              <span className="text-sm font-semibold text-text block">Transition Payment Status</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  className="border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                  onClick={() => {
                    setPaymentToStatusUpdate({ payment: selectedPayment, newStatus: "PAID" });
                    setSelectedPayment(null);
                  }}
                >
                  Mark as Paid / Approved
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                  onClick={() => {
                    setPaymentToStatusUpdate({ payment: selectedPayment, newStatus: "PENDING" });
                    setSelectedPayment(null);
                  }}
                >
                  Set to Pending
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  className="border-rose-500/40 text-rose-500 hover:bg-rose-500/10"
                  onClick={() => {
                    setPaymentToStatusUpdate({ payment: selectedPayment, newStatus: "FAILED" });
                    setSelectedPayment(null);
                  }}
                >
                  Mark as Failed / Rejected
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Confirmation Modal */}
      <Modal
        isOpen={!!paymentToStatusUpdate}
        onClose={() => setPaymentToStatusUpdate(null)}
        title={`Update Status to ${paymentToStatusUpdate?.newStatus}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to transition the status of payment{" "}
            <span className="font-mono text-text font-semibold">
              {paymentToStatusUpdate?.payment.transactionReference || paymentToStatusUpdate?.payment.id.slice(0, 8)}
            </span>{" "}
            to <span className="font-semibold text-gold">{paymentToStatusUpdate?.newStatus}</span>?
          </p>

          <Textarea
            label="Reason / Audit Remarks (Optional)"
            placeholder="e.g. Bank wire confirmed by finance team..."
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            rows={2}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaymentToStatusUpdate(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleStatusChangeConfirm}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Confirm Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment Ledger Entry"
        message={`Are you sure you want to permanently remove payment record for ${paymentToDelete?.amount} ${paymentToDelete?.currency}? This will update financial reconciliation reports.`}
        confirmText="Delete Record"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
