import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  RefreshCw,
  MessageCircle,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronDown,
  Layers,
  Building,
  Globe2,
  UserCheck,
  Send,
  Plus,
  X,
  FileText,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { inquiriesService } from "../api/services/inquiries.service.js";
import { useAuth } from "../context/AuthContext.js";
import {
  InquiryContactMethod,
  InquiryPriority,
  InquiryStatus,
  ProjectInquiry,
  ProjectInquiryStats,
} from "../types/index.js";

const STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  NEW: { label: "New Lead", bg: "bg-blue-500/10", text: "text-blue-700", border: "border-blue-500/30" },
  CONTACTED: { label: "Contacted", bg: "bg-purple-500/10", text: "text-purple-700", border: "border-purple-500/30" },
  IN_PROGRESS: { label: "In Discussion", bg: "bg-amber-500/10", text: "text-amber-800", border: "border-amber-500/30" },
  CONVERTED: { label: "Converted", bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-500/30" },
  CLOSED: { label: "Closed", bg: "bg-slate-500/10", text: "text-slate-700", border: "border-slate-500/30" },
  SPAM: { label: "Spam / Invalid", bg: "bg-rose-500/10", text: "text-rose-700", border: "border-rose-500/30" },
};

const PRIORITY_CONFIG: Record<
  InquiryPriority,
  { label: string; bg: string; text: string }
> = {
  LOW: { label: "Low", bg: "bg-slate-100", text: "text-slate-600" },
  NORMAL: { label: "Normal", bg: "bg-blue-100", text: "text-blue-700" },
  HIGH: { label: "High", bg: "bg-amber-100", text: "text-amber-800" },
  URGENT: { label: "Urgent", bg: "bg-rose-100", text: "text-rose-700" },
};

export const InquiriesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const queryInquiryId = searchParams.get("id");
  const isAdmin =
    currentUser?.accountType === "ADMIN" ||
    currentUser?.accountType === "SUB_ADMIN" ||
    currentUser?.role?.name === "ADMIN" ||
    currentUser?.role?.name === "SUPER_ADMIN" ||
    currentUser?.role?.name === "SUB_ADMIN";

  const [inquiries, setInquiries] = useState<ProjectInquiry[]>([]);
  const [stats, setStats] = useState<ProjectInquiryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<any>({ total: 0, totalPages: 1 });

  // Detail Modal state
  const [selectedInquiry, setSelectedInquiry] = useState<ProjectInquiry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Auto-open inquiry if navigated with ?id=xxx
  useEffect(() => {
    if (queryInquiryId) {
      inquiriesService
        .getById(queryInquiryId)
        .then((res) => {
          const fresh = (res as any)?.data || res;
          if (fresh?.id) {
            setSelectedInquiry(fresh);
            setIsDetailModalOpen(true);
          }
        })
        .catch(() => {
          // If query param ID is not found, fallback silently
        });
    }
  }, [queryInquiryId]);

  const fetchInquiries = useCallback(
    async (showLoader = true) => {
      if (showLoader) setIsLoading(true);
      setError(null);

      try {
        const [inquiriesRes, statsRes] = await Promise.all([
          inquiriesService.getAll({
            search: searchTerm.trim() || undefined,
            status: statusFilter !== "ALL" ? statusFilter : undefined,
            priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
            page,
            limit: 15,
          }),
          inquiriesService.getStatistics().catch(() => null),
        ]);

        if (Array.isArray(inquiriesRes)) {
          setInquiries(inquiriesRes);
          setPaginationMeta({ total: inquiriesRes.length, totalPages: 1 });
        } else if (inquiriesRes && (inquiriesRes as any).data) {
          setInquiries((inquiriesRes as any).data);
          setPaginationMeta((inquiriesRes as any).meta || { total: (inquiriesRes as any).data.length, totalPages: 1 });
        }

        if (statsRes) {
          setStats(statsRes);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load project inquiries");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchTerm, statusFilter, priorityFilter, page]
  );

  useEffect(() => {
    fetchInquiries(true);
  }, [fetchInquiries]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInquiries(false);
  };

  const handleOpenDetail = async (inquiry: ProjectInquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailModalOpen(true);
    setNewNoteText("");
    setActionSuccessMessage(null);

    try {
      const freshRes = await inquiriesService.getById(inquiry.id);
      const fresh = (freshRes as any)?.data || freshRes;
      if (fresh?.id) {
        setSelectedInquiry(fresh);
      }
    } catch {
      // Keep existing
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await inquiriesService.update(inquiryId, { status: newStatus });
      const updated: ProjectInquiry = (res as any)?.data || res;
      setInquiries((prev) => prev.map((item) => (item.id === inquiryId ? updated : item)));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(updated);
      }
      setActionSuccessMessage(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
      fetchInquiries(false);
    } catch (err: any) {
      alert(err?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (inquiryId: string, newPriority: InquiryPriority) => {
    try {
      const res = await inquiriesService.update(inquiryId, { priority: newPriority });
      const updated: ProjectInquiry = (res as any)?.data || res;
      setInquiries((prev) => prev.map((item) => (item.id === inquiryId ? updated : item)));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(updated);
      }
      setActionSuccessMessage(`Priority updated to ${PRIORITY_CONFIG[newPriority].label}`);
      fetchInquiries(false);
    } catch (err: any) {
      alert(err?.message || "Failed to update priority");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !newNoteText.trim()) return;

    setIsSubmittingNote(true);
    try {
      const res = await inquiriesService.addNote(selectedInquiry.id, newNoteText.trim());
      const updated: ProjectInquiry = (res as any)?.data || res;
      setSelectedInquiry(updated);
      setInquiries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setNewNoteText("");
      setActionSuccessMessage("Note added successfully");
    } catch (err: any) {
      alert(err?.message || "Failed to save note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleRecordContactAttempt = async (
    inquiry: ProjectInquiry,
    method: InquiryContactMethod,
    autoOpen = true
  ) => {
    try {
      const res = await inquiriesService.recordContact(inquiry.id, {
        contactMethod: method,
        notes: `Initiated contact via ${method} from admin dashboard.`,
        updateStatusToContacted: inquiry.status === "NEW",
      });
      const updated: ProjectInquiry = (res as any)?.data || res;

      setInquiries((prev) => prev.map((item) => (item.id === inquiry.id ? updated : item)));
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry(updated);
      }
      fetchInquiries(false);

      if (autoOpen) {
        if (method === "WHATSAPP") {
          const cleanPhone = inquiry.phone.replace(/[^0-9]/g, "");
          const msg = encodeURIComponent(
            `Hello ${inquiry.visitorName}, this is ST-Solutions regarding your inquiry on "${inquiry.projectNameSnapshot}". We received your message and would love to assist you with your project requirements.`
          );
          window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
        } else if (method === "EMAIL") {
          const subject = encodeURIComponent(
            `ST-Solutions: Regarding Your Inquiry on ${inquiry.projectNameSnapshot}`
          );
          const body = encodeURIComponent(
            `Dear ${inquiry.visitorName},\n\nThank you for reaching out to ST-Solutions regarding "${inquiry.projectNameSnapshot}".\n\nWe would love to schedule a quick call to understand your specifications and guide you through our engineering roadmap.\n\nBest regards,\nST-Solutions Engineering Team`
          );
          window.location.href = `mailto:${inquiry.email}?subject=${subject}&body=${body}`;
        } else if (method === "PHONE_CALL") {
          window.location.href = `tel:${inquiry.phone}`;
        }
      }
    } catch (err: any) {
      alert(err?.message || "Failed to record contact attempt");
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this project inquiry?")) return;

    try {
      await inquiriesService.delete(id);
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry?.id === id) {
        setIsDetailModalOpen(false);
        setSelectedInquiry(null);
      }
      fetchInquiries(false);
    } catch (err: any) {
      alert(err?.message || "Failed to delete inquiry");
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-amber-900 text-xs font-mono font-bold uppercase tracking-wider">
              Lead Management
            </span>
            <span className="text-xs text-slate-500 font-medium">Public Portal Submissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
            Project Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Manage incoming visitor project requests, track outreach status, and connect via WhatsApp, Email, or Phone.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#E2E5E0] text-xs font-bold text-slate-800 hover:bg-[#F1F2EE] transition-all flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B88E20] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Refresh Feed"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          {
            label: "Total Inquiries",
            value: stats?.total ?? inquiries.length,
            color: "text-slate-950",
            bg: "bg-white",
            border: "border-[#E2E5E0]",
          },
          {
            label: "New Leads",
            value: stats?.newCount ?? inquiries.filter((i) => i.status === "NEW").length,
            color: "text-blue-700",
            bg: "bg-blue-50/60",
            border: "border-blue-200",
            badge: "Needs Action",
          },
          {
            label: "Contacted",
            value: stats?.contactedCount ?? inquiries.filter((i) => i.status === "CONTACTED").length,
            color: "text-purple-700",
            bg: "bg-purple-50/60",
            border: "border-purple-200",
          },
          {
            label: "In Discussion",
            value: stats?.inProgressCount ?? inquiries.filter((i) => i.status === "IN_PROGRESS").length,
            color: "text-amber-800",
            bg: "bg-amber-50/60",
            border: "border-amber-200",
          },
          {
            label: "Converted",
            value: stats?.convertedCount ?? inquiries.filter((i) => i.status === "CONVERTED").length,
            color: "text-emerald-700",
            bg: "bg-emerald-50/60",
            border: "border-emerald-200",
          },
          {
            label: "Urgent Priority",
            value: stats?.urgentCount ?? inquiries.filter((i) => i.priority === "URGENT").length,
            color: "text-rose-700",
            bg: "bg-rose-50/60",
            border: "border-rose-200",
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${kpi.border} ${kpi.bg} shadow-sm flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">
                {kpi.label}
              </span>
              {kpi.badge && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              )}
            </div>
            <div className={`text-2xl font-black ${kpi.color} mt-2 font-mono`}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E5E0] shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone, company, project snapshot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-900 bg-[#F8F9F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-800 bg-[#F8F9F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New Leads Only</option>
              <option value="CONTACTED">Contacted</option>
              <option value="IN_PROGRESS">In Discussion</option>
              <option value="CONVERTED">Converted</option>
              <option value="CLOSED">Closed</option>
              <option value="SPAM">Spam</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="sm:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-800 bg-[#F8F9F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content List / Table */}
      {isLoading ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E2E5E0] space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-[#B88E20] animate-spin" />
          <p className="text-xs font-bold text-slate-700">Loading project inquiries...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
          <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />
          <p className="text-xs font-bold">{error}</p>
          <button
            onClick={() => fetchInquiries(true)}
            className="text-xs font-bold text-[#B88E20] underline"
          >
            Retry
          </button>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E2E5E0] space-y-3">
          <Layers className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-900">No project inquiries found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When visitors submit requests through the public website or project showcases, they will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => {
            const statusStyle = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.NEW;
            const priorityStyle = PRIORITY_CONFIG[inquiry.priority] || PRIORITY_CONFIG.NORMAL;
            const isNew = inquiry.status === "NEW";

            return (
              <div
                key={inquiry.id}
                className={`p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-200 hover:shadow-md ${
                  isNew ? "border-blue-300 shadow-sm ring-1 ring-blue-100" : "border-[#E2E5E0]"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Visitor & Target Project */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {statusStyle.label}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${priorityStyle.bg} ${priorityStyle.text}`}
                      >
                        {priorityStyle.label} Priority
                      </span>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(inquiry.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-950">
                          {inquiry.visitorName}
                        </h3>
                        {inquiry.companyName && (
                          <span className="text-xs text-slate-600 font-medium flex items-center space-x-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>({inquiry.companyName})</span>
                          </span>
                        )}
                        {inquiry.country && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            • {inquiry.country}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs font-semibold text-slate-600">Interested in:</span>
                        <span className="text-xs font-bold text-[#B88E20] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {inquiry.projectNameSnapshot}
                        </span>
                        {inquiry.category && (
                          <span className="text-[10px] font-mono text-slate-500">
                            [{inquiry.category}]
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message Preview */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-[#F8F9F7] p-2.5 rounded-xl border border-[#E2E5E0]">
                      "{inquiry.message}"
                    </p>

                    {/* Meta tags: Budget & Contact info */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
                      <span className="font-mono">
                        📧 <strong>{inquiry.email}</strong>
                      </span>
                      <span className="font-mono">
                        📞 <strong>{inquiry.phone}</strong>
                      </span>
                      {inquiry.budget && (
                        <span className="bg-[#F1F2EE] px-2 py-0.5 rounded-md text-slate-800 font-semibold">
                          Budget: {inquiry.budget}
                        </span>
                      )}
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                        Prefers: {inquiry.preferredContactMethod}
                      </span>
                      {inquiry.contactedAt && (
                        <span className="text-purple-700 font-medium flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" />
                          <span>Contacted on {new Date(inquiry.contactedAt).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Direct Outreach & Detail Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E2E5E0]">
                    {/* Quick Direct Contact Buttons */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleRecordContactAttempt(inquiry, "WHATSAPP", true)}
                        title="Chat on WhatsApp (auto records outreach)"
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handleRecordContactAttempt(inquiry, "EMAIL", true)}
                        title="Send Email (auto records outreach)"
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Email</span>
                      </button>

                      <button
                        onClick={() => handleRecordContactAttempt(inquiry, "PHONE_CALL", true)}
                        title="Phone Call (auto records outreach)"
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Call</span>
                      </button>
                    </div>

                    {/* View Details / Management Button */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenDetail(inquiry)}
                        className="px-4 py-2 rounded-xl bg-[#F1F2EE] hover:bg-[#E2E5E0] text-slate-950 text-xs font-bold transition-all border border-[#E2E5E0] flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3 text-[#B88E20]" />
                        <span>Manage Lead</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                          title="Delete inquiry"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Lead Detail & Activity Drawer / Modal */}
      {isDetailModalOpen && selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-white rounded-3xl border border-[#E2E5E0] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E5C158] text-[10px] font-mono uppercase tracking-wider font-bold">
                    Lead File #{selectedInquiry.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-slate-400">
                    Submitted {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white">
                  {selectedInquiry.visitorName}
                </h2>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
              {actionSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{actionSuccessMessage}</span>
                </div>
              )}

              {/* Status & Priority Controls */}
              <div className="p-4 rounded-2xl bg-[#F8F9F7] border border-[#E2E5E0] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900">
                    Workflow Status
                  </label>
                  <select
                    value={selectedInquiry.status}
                    disabled={isUpdatingStatus}
                    onChange={(e) =>
                      handleStatusChange(selectedInquiry.id, e.target.value as InquiryStatus)
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E5E0] text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <option value="NEW">New Lead</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="IN_PROGRESS">In Discussion</option>
                    <option value="CONVERTED">Converted to Active Project</option>
                    <option value="CLOSED">Closed / Archived</option>
                    <option value="SPAM">Spam / Disqualified</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900">
                    Priority Level
                  </label>
                  <select
                    value={selectedInquiry.priority}
                    onChange={(e) =>
                      handlePriorityChange(selectedInquiry.id, e.target.value as InquiryPriority)
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E5E0] text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (Immediate Callback)</option>
                  </select>
                </div>
              </div>

              {/* Visitor & Snapshot Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-[#E2E5E0] bg-white space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Contact Details
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Email:</span>
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        {selectedInquiry.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phone / WA:</span>
                      <span className="font-bold text-slate-900">{selectedInquiry.phone}</span>
                    </div>
                    {selectedInquiry.companyName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Company:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedInquiry.companyName}
                        </span>
                      </div>
                    )}
                    {selectedInquiry.country && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedInquiry.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[#E2E5E0] bg-white space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Requirements Snapshot
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Target System:</span>
                      <span className="font-bold text-[#B88E20]">
                        {selectedInquiry.projectNameSnapshot}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Channel Preference:</span>
                      <span className="font-bold text-emerald-700">
                        {selectedInquiry.preferredContactMethod}
                      </span>
                    </div>
                    {selectedInquiry.budget && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Budget Range:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedInquiry.budget}
                        </span>
                      </div>
                    )}
                    {selectedInquiry.preferredContactTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Preferred Window:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedInquiry.preferredContactTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirements Message */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Full Message / Project Scope
                </div>
                <div className="p-4 rounded-2xl bg-[#F8F9F7] border border-[#E2E5E0] text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Outreach Trigger Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="text-xs font-bold text-white">Direct Outreach Channels</div>
                  <div className="text-[11px] text-slate-400">
                    Clicking automatically logs an outreach activity timestamp.
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      handleRecordContactAttempt(selectedInquiry, "WHATSAPP", true)
                    }
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() =>
                      handleRecordContactAttempt(selectedInquiry, "EMAIL", true)
                    }
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                  <button
                    onClick={() =>
                      handleRecordContactAttempt(selectedInquiry, "PHONE_CALL", true)
                    }
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Administrative Notes & History
                </div>

                {selectedInquiry.adminNotes ? (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {selectedInquiry.adminNotes}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No notes added yet.</div>
                )}

                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Append new note (e.g. Discussed wireframes on WhatsApp, promised quote by Thursday)..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingNote || !newNoteText.trim()}
                      className="px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isSubmittingNote ? "Saving..." : "Append Note"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Activity Timeline */}
              {Array.isArray(selectedInquiry.activities) && selectedInquiry.activities.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E2E5E0]">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Activity & Audit Trail
                  </div>
                  <div className="space-y-2">
                    {selectedInquiry.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 rounded-xl bg-[#F8F9F7] border border-[#E2E5E0] text-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">
                            {act.action.replace(/_/g, " ")}
                            {act.contactMethod && (
                              <span className="text-[#B88E20] font-normal">
                                {" "}
                                via {act.contactMethod}
                              </span>
                            )}
                          </div>
                          {act.details && (
                            <div className="text-slate-600">{act.details}</div>
                          )}
                          {act.userName && (
                            <div className="text-[10px] text-slate-400">
                              By: {act.userName}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
