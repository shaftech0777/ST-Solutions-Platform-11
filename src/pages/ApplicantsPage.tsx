import React, { useEffect, useState } from "react";
import { Users, Plus, Search, Mail, Phone, FileText, Briefcase } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell, Pagination } from "../components/ui/Table.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal } from "../components/ui/Modal.js";
import { Input, Textarea } from "../components/ui/Input.js";
import { Select } from "../components/ui/Select.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { useToast } from "../context/ToastContext.js";
import { useAuth } from "../context/AuthContext.js";
import { applicantsService } from "../api/services/applicants.service.js";
import { Applicant, ApplicantStatus } from "../types/index.js";

export const ApplicantsPage: React.FC = () => {
  const { addToast } = useToast();
  const { currentUser, isLoading: isAuthLoading } = useAuth();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    positionApplied: "",
    resumeUrl: "",
    notes: "",
  });

  const loadApplicants = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await applicantsService.getAll({
        status: statusFilter ? (statusFilter as ApplicantStatus) : undefined,
        search,
        page,
        limit: 10,
      });
      setApplicants(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load talent pipeline");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadApplicants();
  }, [statusFilter, search, page, currentUser?.id, isAuthLoading]);

  const handleCreateApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.positionApplied.trim()) {
      addToast({ type: "warning", title: "Validation Error", message: "Name, email, and position required" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await applicantsService.create(formData);
      if (res.success) {
        addToast({ type: "success", title: "Applicant Added", message: `Applicant "${formData.fullName}" added to pipeline` });
        setIsModalOpen(false);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          positionApplied: "",
          resumeUrl: "",
          notes: "",
        });
        loadApplicants();
      }
    } catch (err: any) {
      addToast({ type: "danger", title: "Operation Failed", message: err.message || "Failed to save applicant" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ApplicantStatus) => {
    try {
      await applicantsService.updateStatus(id, newStatus);
      addToast({ type: "success", title: "Status Updated", message: `Applicant status set to ${newStatus}` });
      loadApplicants();
    } catch (err: any) {
      addToast({ type: "danger", title: "Update Failed", message: err.message || "Failed to update applicant status" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talent & Candidate Pipeline"
        description="Recruitment funnel, technical vetting, engineering candidates, and hiring status"
        actions={
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Candidate
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Input
            placeholder="Search candidate name or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <Select
          options={[
            { value: "", label: "All Recruitment Statuses" },
            { value: "NEW", label: "New Application" },
            { value: "SCREENING", label: "Screening / Vetting" },
            { value: "INTERVIEWED", label: "Interviewed" },
            { value: "OFFERED", label: "Offer Extended" },
            { value: "HIRED", label: "Hired / Onboarded" },
            { value: "REJECTED", label: "Rejected" },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {error && <ErrorState message={error} onRetry={loadApplicants} />}

      {isLoading ? (
        <LoadingSpinner text="Fetching candidate applications..." />
      ) : applicants.length === 0 ? (
        <EmptyState
          title="No Applicants Found"
          description="Track incoming engineering and leadership candidates in your hiring pipeline."
          actionLabel="Add Candidate"
          onAction={() => setIsModalOpen(true)}
          icon={<Users className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate Name</TableHead>
                <TableHead>Position Applied</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {applicants.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-bold text-slate-900 dark:text-white">{a.fullName}</TableCell>
                  <TableCell className="font-mono text-xs">{a.positionApplied}</TableCell>
                  <TableCell className="font-mono text-xs">{a.email}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        a.status === "HIRED"
                          ? "success"
                          : a.status === "REJECTED"
                          ? "danger"
                          : a.status === "OFFERED"
                          ? "gold"
                          : "warning"
                      }
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <select
                      value={a.status}
                      onChange={(e) => handleUpdateStatus(a.id, e.target.value as ApplicantStatus)}
                      className="text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    >
                      <option value="NEW">NEW</option>
                      <option value="SCREENING">SCREENING</option>
                      <option value="INTERVIEWED">INTERVIEWED</option>
                      <option value="OFFERED">OFFERED</option>
                      <option value="HIRED">HIRED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(applicants.length / 10) || 1}
            onPageChange={(p) => setPage(p)}
            totalRecords={applicants.length}
          />
        </div>
      )}

      {/* Add Candidate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Talent Candidate"
        description="Insert candidate into candidate pipeline and trigger assessment flow."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleCreateApplicant}
            >
              Save Candidate
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateApplicant} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Elena Rostova"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="e.g. elena@techstudio.io"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Position Applied For"
            required
            placeholder="e.g. Senior Principal Architect"
            value={formData.positionApplied}
            onChange={(e) => setFormData({ ...formData, positionApplied: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="e.g. +1 (555) 902-1823"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Resume URL / Portfolio"
            placeholder="e.g. https://linkedin.com/in/elena-rostova"
            value={formData.resumeUrl}
            onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
          />
          <Textarea
            label="Assessment Notes"
            placeholder="Initial technical evaluation comments..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
