import React, { useEffect, useState, useMemo } from "react";
import {
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Linkedin,
  Github,
  ChevronRight,
  Filter,
  UserPlus,
  RefreshCw,
  ExternalLink,
  Kanban,
  List,
  Sparkles,
  Award,
} from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../components/ui/Table.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge, Avatar } from "../components/ui/Badge.js";
import { Card } from "../components/ui/Card.js";
import { Modal, ConfirmModal } from "../components/ui/Modal.js";
import { Input, Textarea } from "../components/ui/Input.js";
import { Select } from "../components/ui/Select.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { Skeleton } from "../components/ui/LoadingSpinner.js";
import { useToast } from "../context/ToastContext.js";
import { useAuth } from "../context/AuthContext.js";
import { applicantsService } from "../api/services/applicants.service.js";
import { Applicant, ApplicantStatus } from "../types/index.js";

const APPLICANT_STATUS_OPTIONS = [
  { value: "ALL", label: "All Application Stages" },
  { value: "RECEIVED", label: "Received / New" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "INTERVIEWED", label: "Interviewed" },
  { value: "ACCEPTED", label: "Accepted / Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export const ApplicantsPage: React.FC = () => {
  const { addToast } = useToast();
  const { currentUser, currentOrganization, currentWorkspace, isLoading: isAuthLoading } = useAuth();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Views
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "pipeline">("table");

  // Modals & Action states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [reviewingApplicant, setReviewingApplicant] = useState<Applicant | null>(null);
  const [onboardingApplicant, setOnboardingApplicant] = useState<Applicant | null>(null);
  const [rejectingApplicant, setRejectingApplicant] = useState<Applicant | null>(null);

  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [createFormData, setCreateFormData] = useState({
    fullName: "",
    fatherName: "",
    email: "",
    phoneNumber: "",
    whatsappNumber: "",
    country: "Pakistan",
    city: "",
    address: "",
    positionApplied: "Full Stack Software Engineer",
    currentProfession: "",
    currentQualification: "",
    skillsDescription: "",
    joiningPurpose: "",
    heardAboutSTSolutions: "LinkedIn",
    linkedinUrl: "",
    githubUrl: "",
    notes: "",
  });

  const [reviewData, setReviewData] = useState({
    status: "UNDER_REVIEW",
    reviewNotes: "",
    approvalNotes: "",
    rejectionReason: "",
  });

  const [onboardData, setOnboardData] = useState({
    roleId: "",
    accountType: "MEMBER",
    temporaryPassword: "TempPassword123!",
  });

  const loadApplicants = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await applicantsService.getAll({
        search: search.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        limit: 100,
      });

      let items: Applicant[] = [];
      if (Array.isArray(res.data)) {
        items = res.data;
      } else if (Array.isArray(res)) {
        items = res as any;
      } else if (Array.isArray((res as any)?.items)) {
        items = (res as any).items;
      }
      setApplicants(items);
    } catch (err: any) {
      setError(err.message || "Failed to load candidate applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadApplicants();
  }, [search, statusFilter, currentOrganization?.id, currentWorkspace?.id, currentUser?.id, isAuthLoading]);

  // Statistics computed from real fetched records
  const stats = useMemo(() => {
    let total = applicants.length;
    let received = 0;
    let underReview = 0;
    let accepted = 0;
    let rejected = 0;

    for (const a of applicants) {
      const s = ((a.applicationStatus || a.status || "") as string).toUpperCase();
      if (s === "RECEIVED" || s === "PENDING") received++;
      else if (s === "UNDER_REVIEW" || s === "INTERVIEWED") underReview++;
      else if (s === "ACCEPTED" || s === "APPROVED") accepted++;
      else if (s === "REJECTED") rejected++;
    }

    return { total, received, underReview, accepted, rejected };
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const s = ((a.applicationStatus || a.status || "") as string).toUpperCase();
      if (statusFilter !== "ALL") {
        if (statusFilter === "RECEIVED" && s !== "RECEIVED" && s !== "PENDING") return false;
        if (statusFilter === "ACCEPTED" && s !== "ACCEPTED" && s !== "APPROVED") return false;
        if (statusFilter !== "RECEIVED" && statusFilter !== "ACCEPTED" && s !== statusFilter) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const name = (a.fullName || "").toLowerCase();
        const email = (a.email || "").toLowerCase();
        const phone = (a.phoneNumber || a.phone || "").toLowerCase();
        const city = (a.city || "").toLowerCase();
        const country = (a.country || "").toLowerCase();
        const pos = (a.positionApplied || "").toLowerCase();
        const skills = (a.skillsDescription || "").toLowerCase();

        if (
          !name.includes(q) &&
          !email.includes(q) &&
          !phone.includes(q) &&
          !city.includes(q) &&
          !country.includes(q) &&
          !pos.includes(q) &&
          !skills.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [applicants, statusFilter, search]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.fullName.trim() || !createFormData.email.trim()) {
      setModalError("Please provide candidate full name and valid email address.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      await applicantsService.create({
        fullName: createFormData.fullName,
        fatherName: createFormData.fatherName || undefined,
        email: createFormData.email,
        phoneNumber: createFormData.phoneNumber || "N/A",
        whatsappNumber: createFormData.whatsappNumber || createFormData.phoneNumber || "N/A",
        country: createFormData.country || "Pakistan",
        city: createFormData.city || "Islamabad",
        address: createFormData.address || "N/A",
        positionApplied: createFormData.positionApplied,
        currentProfession: createFormData.currentProfession || undefined,
        currentQualification: createFormData.currentQualification || undefined,
        skillsDescription: createFormData.skillsDescription || undefined,
        joiningPurpose: createFormData.joiningPurpose || undefined,
        heardAboutSTSolutions: createFormData.heardAboutSTSolutions || undefined,
        linkedinUrl: createFormData.linkedinUrl || undefined,
        githubUrl: createFormData.githubUrl || undefined,
        notes: createFormData.notes || undefined,
      });

      addToast({
        type: "success",
        title: "Candidate Registered",
        message: `${createFormData.fullName} application record created successfully.`,
      });
      setIsCreateModalOpen(false);
      loadApplicants();
    } catch (err: any) {
      setModalError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async (newStatus: string) => {
    if (!reviewingApplicant) return;
    setIsSubmitting(true);
    try {
      if (newStatus === "ACCEPTED") {
        await applicantsService.approve(reviewingApplicant.id, {
          approvalNotes: reviewData.approvalNotes || reviewData.reviewNotes || "Approved by recruitment committee",
        });
        addToast({
          type: "success",
          title: "Application Approved",
          message: `${reviewingApplicant.fullName} has been accepted. You can now onboard them.`,
        });
      } else if (newStatus === "REJECTED") {
        await applicantsService.reject(reviewingApplicant.id, {
          rejectionReason: reviewData.rejectionReason || "Candidate does not meet technical requirements at this time.",
        });
        addToast({
          type: "info",
          title: "Application Rejected",
          message: `${reviewingApplicant.fullName} application marked as rejected.`,
        });
      } else {
        await applicantsService.review(reviewingApplicant.id, {
          status: newStatus,
          reviewNotes: reviewData.reviewNotes,
        });
        addToast({
          type: "success",
          title: "Review Updated",
          message: `Stage updated to ${newStatus.replace(/_/g, " ")}.`,
        });
      }

      setReviewingApplicant(null);
      loadApplicants();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Stage Transition Failed",
        message: err.message || "Could not update application status.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardSubmit = async () => {
    if (!onboardingApplicant) return;
    setIsSubmitting(true);
    try {
      await applicantsService.onboard(onboardingApplicant.id, {
        organizationId: currentOrganization?.id,
        workspaceId: currentWorkspace?.id,
        accountType: onboardData.accountType,
      });

      addToast({
        type: "success",
        title: "Candidate Onboarded",
        message: `${onboardingApplicant.fullName} has been created as an active member in ${currentOrganization?.name || "your organization"}.`,
      });
      setOnboardingApplicant(null);
      loadApplicants();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Onboarding Failed",
        message: err.message || "Failed to convert applicant to member.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "ACCEPTED":
      case "APPROVED":
        return <Badge variant="success">Accepted / Ready to Onboard</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="warning">Under Review</Badge>;
      case "INTERVIEWED":
        return <Badge variant="info">Interviewed</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Rejected</Badge>;
      case "RECEIVED":
      case "PENDING":
      default:
        return <Badge variant="neutral">Received</Badge>;
    }
  };

  return (
    <div className="space-y-6" id="applicants-page-root">
      <PageHeader
        title="Talent & Applicant Operations"
        description="Candidate review pipelines, qualification screening, interviewer feedback, and member onboarding."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={loadApplicants}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="gold"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => {
                setModalError(null);
                setIsCreateModalOpen(true);
              }}
            >
              Register Candidate
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="applicants-kpi-summary">
        <Card className="p-5 border-border/60 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-text">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.total}</div>
            <p className="text-xs text-text-muted mt-1">Active talent acquisition pool</p>
          </div>
        </Card>

        <Card className="p-5 border-amber-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">In Review & Interview</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.underReview}</div>
            <p className="text-xs text-text-muted mt-1">Under active technical screening</p>
          </div>
        </Card>

        <Card className="p-5 border-emerald-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Accepted Candidates</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.accepted}</div>
            <p className="text-xs text-text-muted mt-1">Approved for team onboarding</p>
          </div>
        </Card>

        <Card className="p-5 border-rose-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.rejected}</div>
            <p className="text-xs text-text-muted mt-1">Declined applications</p>
          </div>
        </Card>
      </div>

      {/* Filter and View Bar */}
      <Card className="p-4 border-border/60 bg-surface">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by candidate name, email, skills, position, city..."
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

          <div className="flex items-center gap-3">
            <div className="w-48">
              <Select
                options={APPLICANT_STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>

            <div className="flex items-center border border-border rounded-lg p-0.5 bg-surface-hover/40">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "table" ? "bg-surface text-gold shadow-sm" : "text-text-muted hover:text-text"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("pipeline")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "pipeline" ? "bg-surface text-gold shadow-sm" : "text-text-muted hover:text-text"
                }`}
                title="Pipeline Kanban View"
              >
                <Kanban className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && <ErrorState message={error} onRetry={loadApplicants} />}

      {/* Loading Skeleton */}
      {isLoading && (
        <Card className="p-6 border-border/60">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredApplicants.length === 0 && (
        <EmptyState
          icon={<UserCheck className="w-10 h-10 text-gold/60" />}
          title={search || statusFilter !== "ALL" ? "No matching applicants" : "No candidate applications in database"}
          description={
            search || statusFilter !== "ALL"
              ? "Try adjusting your search criteria or stage filter."
              : "When prospective team members submit applications or are manually registered, they will appear in this pipeline."
          }
          action={
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Register First Candidate
            </Button>
          }
        />
      )}

      {/* Table View */}
      {!isLoading && !error && filteredApplicants.length > 0 && viewMode === "table" && (
        <>
          <div className="hidden md:block">
            <Card className="border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position & Skills</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {filteredApplicants.map((applicant) => {
                    const status = applicant.applicationStatus || applicant.status;
                    const isAccepted = status === "ACCEPTED" || status === "APPROVED";

                    return (
                      <TableRow key={applicant.id} className="hover:bg-surface-hover/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar name={applicant.fullName} size="sm" />
                            <div>
                              <div className="font-semibold text-sm text-text">{applicant.fullName}</div>
                              <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-gold/80" /> {applicant.email}
                                </span>
                                {(applicant.phoneNumber || applicant.phone) && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gold/80" />{" "}
                                    {applicant.phoneNumber || applicant.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-xs text-text">
                            {applicant.positionApplied || "Applicant"}
                          </div>
                          {applicant.skillsDescription && (
                            <div className="text-[11px] text-text-muted truncate max-w-[220px] mt-0.5" title={applicant.skillsDescription}>
                              {applicant.skillsDescription}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="text-xs text-text flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-text-muted shrink-0" />
                            <span>{applicant.city ? `${applicant.city}, ${applicant.country || ""}` : applicant.country || "Not specified"}</span>
                          </div>
                        </TableCell>

                        <TableCell>{getStatusBadge(status)}</TableCell>

                        <TableCell>
                          <div className="text-xs text-text">
                            {new Date(applicant.appliedDate || applicant.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="xs"
                              leftIcon={<Eye className="w-3.5 h-3.5" />}
                              onClick={() => setSelectedApplicant(applicant)}
                            >
                              Dossier
                            </Button>

                            <Button
                              variant="ghost"
                              size="xs"
                              leftIcon={<Edit2 className="w-3.5 h-3.5 text-gold" />}
                              onClick={() => {
                                setReviewingApplicant(applicant);
                                setReviewData({
                                  status: (status as string) || "UNDER_REVIEW",
                                  reviewNotes: applicant.reviewNotes || "",
                                  approvalNotes: applicant.approvalNotes || "",
                                  rejectionReason: applicant.rejectionReason || "",
                                });
                              }}
                            >
                              Review
                            </Button>

                            {isAccepted && (
                              <Button
                                variant="gold"
                                size="xs"
                                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                                onClick={() => setOnboardingApplicant(applicant)}
                              >
                                Onboard
                              </Button>
                            )}
                          </div>
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
            {filteredApplicants.map((applicant) => {
              const status = applicant.applicationStatus || applicant.status;
              const isAccepted = status === "ACCEPTED" || status === "APPROVED";

              return (
                <Card key={applicant.id} className="p-4 border-border/60 bg-surface space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={applicant.fullName} size="sm" />
                      <div>
                        <div className="font-semibold text-sm text-text">{applicant.fullName}</div>
                        <div className="text-xs text-text-muted">{applicant.positionApplied || "Applicant"}</div>
                      </div>
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  <div className="space-y-1 text-xs text-text-muted border-y border-border/40 py-2">
                    <div className="flex items-center gap-1.5 text-text">
                      <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{applicant.email}</span>
                    </div>
                    {(applicant.phoneNumber || applicant.phone) && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{applicant.phoneNumber || applicant.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{applicant.city ? `${applicant.city}, ${applicant.country || ""}` : applicant.country || "Not specified"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-text-muted">
                      {new Date(applicant.appliedDate || applicant.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedApplicant(applicant)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setReviewingApplicant(applicant);
                          setReviewData({
                            status: (status as string) || "UNDER_REVIEW",
                            reviewNotes: applicant.reviewNotes || "",
                            approvalNotes: applicant.approvalNotes || "",
                            rejectionReason: applicant.rejectionReason || "",
                          });
                        }}
                      >
                        Review
                      </Button>
                      {isAccepted && (
                        <Button
                          variant="gold"
                          size="xs"
                          onClick={() => setOnboardingApplicant(applicant)}
                        >
                          Onboard
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Pipeline Kanban View */}
      {!isLoading && !error && filteredApplicants.length > 0 && viewMode === "pipeline" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { key: "RECEIVED", label: "Received / New", color: "border-border" },
            { key: "UNDER_REVIEW", label: "Under Screening", color: "border-amber-500/30" },
            { key: "ACCEPTED", label: "Accepted / Offer", color: "border-emerald-500/30" },
            { key: "REJECTED", label: "Archived / Rejected", color: "border-rose-500/30" },
          ].map((col) => {
            const colApplicants = filteredApplicants.filter((a) => {
              const s = ((a.applicationStatus || a.status || "") as string).toUpperCase();
              if (col.key === "RECEIVED") return s === "RECEIVED" || s === "PENDING" || !s;
              if (col.key === "UNDER_REVIEW") return s === "UNDER_REVIEW" || s === "INTERVIEWED";
              if (col.key === "ACCEPTED") return s === "ACCEPTED" || s === "APPROVED";
              if (col.key === "REJECTED") return s === "REJECTED";
              return false;
            });

            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface border border-border/60 rounded-xl">
                  <span className="text-xs font-semibold text-text uppercase tracking-wider">{col.label}</span>
                  <span className="text-xs font-bold bg-surface-hover px-2 py-0.5 rounded-full text-gold">
                    {colApplicants.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[300px]">
                  {colApplicants.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-border/60 rounded-xl text-xs text-text-muted">
                      No candidates in this stage
                    </div>
                  ) : (
                    colApplicants.map((applicant) => (
                      <Card
                        key={applicant.id}
                        className="p-3.5 border-border/60 bg-surface hover:border-gold/50 transition-all cursor-pointer space-y-2.5"
                        onClick={() => setSelectedApplicant(applicant)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-xs text-text truncate max-w-[140px]">
                            {applicant.fullName}
                          </div>
                          <span className="text-[10px] text-text-muted">
                            {new Date(applicant.appliedDate || applicant.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="text-[11px] text-gold font-medium truncate">
                          {applicant.positionApplied || "Applicant"}
                        </div>

                        <div className="text-[11px] text-text-muted flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{applicant.city || applicant.country || "Not specified"}</span>
                        </div>

                        <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/40">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewingApplicant(applicant);
                              setReviewData({
                                status: ((applicant.applicationStatus || applicant.status) as string) || "UNDER_REVIEW",
                                reviewNotes: applicant.reviewNotes || "",
                                approvalNotes: applicant.approvalNotes || "",
                                rejectionReason: applicant.rejectionReason || "",
                              });
                            }}
                            className="text-[11px] text-gold hover:underline font-medium"
                          >
                            Review & Stage →
                          </button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Registration Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register Candidate Application"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Candidate Full Name *"
              required
              placeholder="e.g. Tariq Mehmood"
              value={createFormData.fullName}
              onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
            />

            <Input
              label="Father's Name"
              placeholder="e.g. Muhammad Mehmood"
              value={createFormData.fatherName}
              onChange={(e) => setCreateFormData({ ...createFormData, fatherName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              required
              placeholder="candidate@example.com"
              value={createFormData.email}
              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
            />

            <Input
              label="Phone / Mobile Number *"
              required
              placeholder="+92 300 1234567"
              value={createFormData.phoneNumber}
              onChange={(e) => setCreateFormData({ ...createFormData, phoneNumber: e.target.value, whatsappNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Country *"
              placeholder="Pakistan"
              value={createFormData.country}
              onChange={(e) => setCreateFormData({ ...createFormData, country: e.target.value })}
            />
            <Input
              label="City *"
              placeholder="Islamabad / Lahore"
              value={createFormData.city}
              onChange={(e) => setCreateFormData({ ...createFormData, city: e.target.value })}
            />
            <Input
              label="Target Position"
              placeholder="e.g. Senior Frontend Engineer"
              value={createFormData.positionApplied}
              onChange={(e) => setCreateFormData({ ...createFormData, positionApplied: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Profession / Role"
              placeholder="Software Engineer at Tech Corp"
              value={createFormData.currentProfession}
              onChange={(e) => setCreateFormData({ ...createFormData, currentProfession: e.target.value })}
            />
            <Input
              label="Highest Qualification"
              placeholder="BS Computer Science / MS Software"
              value={createFormData.currentQualification}
              onChange={(e) => setCreateFormData({ ...createFormData, currentQualification: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="LinkedIn Profile URL"
              placeholder="https://linkedin.com/in/username"
              value={createFormData.linkedinUrl}
              onChange={(e) => setCreateFormData({ ...createFormData, linkedinUrl: e.target.value })}
            />
            <Input
              label="GitHub Portfolio URL"
              placeholder="https://github.com/username"
              value={createFormData.githubUrl}
              onChange={(e) => setCreateFormData({ ...createFormData, githubUrl: e.target.value })}
            />
          </div>

          <Textarea
            label="Technical Skills & Experience Summary"
            placeholder="React, TypeScript, Node.js, Express, PostgreSQL, AWS..."
            rows={2}
            value={createFormData.skillsDescription}
            onChange={(e) => setCreateFormData({ ...createFormData, skillsDescription: e.target.value })}
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
              Register Candidate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Applicant Dossier / Inspection Modal */}
      <Modal
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        title="Candidate Dossier & Application File"
        size="lg"
      >
        {selectedApplicant && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface-hover/60 rounded-xl border border-border/60">
              <div className="flex items-center gap-3">
                <Avatar name={selectedApplicant.fullName} size="md" />
                <div>
                  <div className="text-lg font-bold text-text">{selectedApplicant.fullName}</div>
                  <div className="text-xs text-gold font-medium">{selectedApplicant.positionApplied || "Applicant"}</div>
                </div>
              </div>
              <div>{getStatusBadge(selectedApplicant.applicationStatus || selectedApplicant.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-text-muted">Email Address:</span>
                <div className="text-text font-medium flex items-center gap-1">
                  <Mail className="w-3 h-3 text-gold" /> {selectedApplicant.email}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Contact Phone:</span>
                <div className="text-text font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gold" /> {selectedApplicant.phoneNumber || selectedApplicant.phone || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Location:</span>
                <div className="text-text font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gold" /> {selectedApplicant.city || "N/A"}, {selectedApplicant.country || "Pakistan"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Father's Name:</span>
                <div className="text-text font-medium">{selectedApplicant.fatherName || "N/A"}</div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Qualification:</span>
                <div className="text-text font-medium flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-gold" /> {selectedApplicant.currentQualification || "Not specified"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Profession:</span>
                <div className="text-text font-medium flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-gold" /> {selectedApplicant.currentProfession || "Not specified"}
                </div>
              </div>
            </div>

            {/* Social & Portfolio Links */}
            {(selectedApplicant.linkedinUrl || selectedApplicant.githubUrl) && (
              <div className="flex items-center gap-3 pt-2">
                {selectedApplicant.linkedinUrl && (
                  <a
                    href={selectedApplicant.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline bg-surface-hover px-3 py-1.5 rounded-lg border border-border"
                  >
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
                  </a>
                )}
                {selectedApplicant.githubUrl && (
                  <a
                    href={selectedApplicant.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline bg-surface-hover px-3 py-1.5 rounded-lg border border-border"
                  >
                    <Github className="w-3.5 h-3.5" /> GitHub Portfolio
                  </a>
                )}
              </div>
            )}

            {/* Skills & Bio */}
            {selectedApplicant.skillsDescription && (
              <div className="p-3.5 bg-surface rounded-xl border border-border/60 space-y-1">
                <span className="text-xs font-semibold text-text-muted block">Skills & Expertise</span>
                <p className="text-xs text-text leading-relaxed">{selectedApplicant.skillsDescription}</p>
              </div>
            )}

            {/* Review Notes */}
            {(selectedApplicant.reviewNotes || selectedApplicant.approvalNotes || selectedApplicant.rejectionReason) && (
              <div className="p-3.5 bg-surface-hover/60 rounded-xl border border-border/60 space-y-2 text-xs">
                <span className="font-semibold text-text block">Recruitment Audit Notes</span>
                {selectedApplicant.reviewNotes && (
                  <div>
                    <span className="text-text-muted">Review Remarks: </span>
                    <span className="text-text">{selectedApplicant.reviewNotes}</span>
                  </div>
                )}
                {selectedApplicant.approvalNotes && (
                  <div>
                    <span className="text-emerald-500 font-medium">Approval Memo: </span>
                    <span className="text-text">{selectedApplicant.approvalNotes}</span>
                  </div>
                )}
                {selectedApplicant.rejectionReason && (
                  <div>
                    <span className="text-rose-500 font-medium">Rejection Rationale: </span>
                    <span className="text-text">{selectedApplicant.rejectionReason}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReviewingApplicant(selectedApplicant);
                  setReviewData({
                    status: ((selectedApplicant.applicationStatus || selectedApplicant.status) as string) || "UNDER_REVIEW",
                    reviewNotes: selectedApplicant.reviewNotes || "",
                    approvalNotes: selectedApplicant.approvalNotes || "",
                    rejectionReason: selectedApplicant.rejectionReason || "",
                  });
                  setSelectedApplicant(null);
                }}
              >
                Change Stage / Review
              </Button>

              <Button variant="outline" size="sm" onClick={() => setSelectedApplicant(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Review / Transition Stage Modal */}
      <Modal
        isOpen={!!reviewingApplicant}
        onClose={() => setReviewingApplicant(null)}
        title="Candidate Stage & Review Action"
        size="md"
      >
        {reviewingApplicant && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-hover/60 rounded-lg border border-border/60 flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-text">{reviewingApplicant.fullName}</div>
                <div className="text-[11px] text-text-muted">{reviewingApplicant.email}</div>
              </div>
              <div>{getStatusBadge(reviewingApplicant.applicationStatus || reviewingApplicant.status)}</div>
            </div>

            <Textarea
              label="Review Remarks & Technical Evaluation Notes"
              placeholder="Candidate passed algorithmic round with 90% score, strong system design knowledge..."
              rows={3}
              value={reviewData.reviewNotes}
              onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
            />

            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold text-text block">Apply Stage Decision</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                  onClick={() => handleReviewSubmit("UNDER_REVIEW")}
                  disabled={isSubmitting}
                >
                  Under Review
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                  onClick={() => handleReviewSubmit("ACCEPTED")}
                  disabled={isSubmitting}
                >
                  Accept / Approve
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-rose-500/40 text-rose-500 hover:bg-rose-500/10"
                  onClick={() => handleReviewSubmit("REJECTED")}
                  disabled={isSubmitting}
                >
                  Reject
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewingApplicant(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Onboarding Modal */}
      <Modal
        isOpen={!!onboardingApplicant}
        onClose={() => setOnboardingApplicant(null)}
        title="Onboard Candidate as Organization Member"
        size="md"
      >
        {onboardingApplicant && (
          <div className="space-y-4">
            <p className="text-xs text-text-muted">
              Convert candidate <span className="font-semibold text-text">{onboardingApplicant.fullName}</span> into an active team member with access credentials in{" "}
              <span className="font-semibold text-gold">{currentOrganization?.name || "your organization"}</span>.
            </p>

            <Select
              label="Account Access Type"
              options={[
                { value: "MEMBER", label: "Member (Standard Team Access)" },
                { value: "MANAGER", label: "Manager (Team & Project Lead)" },
                { value: "SUB_ADMIN", label: "Sub-Admin (Operational Supervisor)" },
              ]}
              value={onboardData.accountType}
              onChange={(e) => setOnboardData({ ...onboardData, accountType: e.target.value })}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOnboardingApplicant(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleOnboardSubmit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Confirm Onboarding
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
