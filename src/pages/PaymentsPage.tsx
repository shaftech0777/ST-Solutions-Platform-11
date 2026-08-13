import React, { useEffect, useState } from "react";
import { CreditCard, Plus, Search, DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell, Pagination } from "../components/ui/Table.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal } from "../components/ui/Modal.js";
import { Input } from "../components/ui/Input.js";
import { Select } from "../components/ui/Select.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { useToast } from "../context/ToastContext.js";
import { paymentsService } from "../api/services/payments.service.js";
import { projectsService } from "../api/services/projects.service.js";
import { Payment, PaymentStatus, Project } from "../types/index.js";

export const PaymentsPage: React.FC = () => {
  const { addToast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    projectId: "",
    amount: "",
    currency: "USD",
    paymentMethod: "WIRE_TRANSFER",
    transactionReference: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [payRes, projRes] = await Promise.all([
        paymentsService.getAll({
          status: statusFilter ? (statusFilter as PaymentStatus) : undefined,
          page,
          limit: 10,
        }),
        projectsService.getAll({ limit: 100 }),
      ]);

      setPayments(Array.isArray(payRes.data) ? payRes.data : []);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load financial transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, page]);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.amount) {
      addToast({ type: "warning", title: "Validation Error", message: "Please select project and amount" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await paymentsService.create({
        projectId: formData.projectId,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        transactionReference: formData.transactionReference || undefined,
      });

      if (res.success) {
        addToast({ type: "success", title: "Payment Recorded", message: "Payment entry added successfully" });
        setIsModalOpen(false);
        setFormData({
          projectId: "",
          amount: "",
          currency: "USD",
          paymentMethod: "WIRE_TRANSFER",
          transactionReference: "",
        });
        loadData();
      }
    } catch (err: any) {
      addToast({ type: "danger", title: "Operation Failed", message: err.message || "Failed to record payment" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: PaymentStatus) => {
    try {
      await paymentsService.updateStatus(id, newStatus);
      addToast({ type: "success", title: "Payment Status Updated", message: `Transaction set to ${newStatus}` });
      loadData();
    } catch (err: any) {
      addToast({ type: "danger", title: "Update Failed", message: err.message || "Failed to update payment status" });
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Financial Accounting"
        description="Invoicing ledgers, wire transfers, transaction verifications, and project revenue streams"
        actions={
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Record Payment
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <Select
          options={[
            { value: "", label: "All Payment Statuses" },
            { value: "COMPLETED", label: "Completed" },
            { value: "PENDING", label: "Pending Verification" },
            { value: "FAILED", label: "Failed / Rejected" },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {isLoading ? (
        <LoadingSpinner text="Fetching financial records..." />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No Payment Records"
          description="Record incoming client payments or wire transfers linked to active project milestones."
          actionLabel="Record Payment"
          onAction={() => setIsModalOpen(true)}
          icon={<CreditCard className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction Amount</TableHead>
                <TableHead>Project Milestone</TableHead>
                <TableHead>Method & Ref</TableHead>
                <TableHead>Date Recorded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {formatCurrency(p.amount, p.currency)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.project?.title || p.projectId}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <div>
                      <span>{p.paymentMethod || "WIRE"}</span>
                      {p.transactionReference && (
                        <p className="text-[10px] text-slate-500">Ref: {p.transactionReference}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">
                    {new Date(p.createdAt).toLocaleDateString()}
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
                  <TableCell className="text-right">
                    <select
                      value={p.paymentStatus}
                      onChange={(e) => handleUpdateStatus(p.id, e.target.value as PaymentStatus)}
                      className="text-xs bg-slate-900 text-slate-200 border border-slate-800 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(payments.length / 10) || 1}
            onPageChange={(p) => setPage(p)}
            totalRecords={payments.length}
          />
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Financial Transaction"
        description="Log an incoming wire transfer or milestone invoice payment."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleCreatePayment}
            >
              Record Payment
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <Select
            label="Linked Project"
            required
            placeholder="Select Project..."
            options={projects.map((p) => ({ value: p.id, label: `${p.title} (${p.client?.name || "Client"})` }))}
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount"
              type="number"
              required
              placeholder="12500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            <Select
              label="Currency"
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
              ]}
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            />
          </div>

          <Select
            label="Payment Method"
            options={[
              { value: "WIRE_TRANSFER", label: "Bank Wire Transfer" },
              { value: "CREDIT_CARD", label: "Corporate Credit Card" },
              { value: "ACH", label: "ACH Direct Deposit" },
              { value: "ESCROW", label: "Milestone Escrow" },
            ]}
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          />

          <Input
            label="Transaction Reference / Invoice #"
            placeholder="e.g. TXN-882910-SHAF"
            value={formData.transactionReference}
            onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
