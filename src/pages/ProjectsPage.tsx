import React, { useEffect, useState, useMemo } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Building2,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  X,
  LayoutGrid,
  List,
  ArrowRight,
  TrendingUp,
  Tag,
  ChevronRight,
  CheckSquare,
  Square } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../components/ui/Table.js";
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
import { projectsService } from "../api/services/projects.service.js";
import { clientsService } from "../api/services/clients.service.js";
import { Project, ProjectStatus, Client } from "../types/index.js";

// Stage 6 Authoritative Status Transitions Matrix
const ALLOWED_PROJECT_STATUS_TRANSITIONS: Record<string, ProjectStatus[]> = {
  PENDING: ["DISCUSSION", "CONFIRMED", "CANCELLED"],
  DISCUSSION: ["CONFIRMED", "PENDING", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "DISCUSSION", "CANCELLED"],
  IN_PROGRESS: ["REVIEW", "COMPLETED", "CANCELLED"],
  REVIEW: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
  COMPLETED: ["IN_PROGRESS"],
  CANCELLED: ["PENDING", "DISCUSSION", "CONFIRMED"],
  ON_HOLD: ["IN_PROGRESS", "CANCELLED"] };

const PROJECT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "DISCUSSION", label: "Discussion" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "ON_HOLD", label: "On Hold" },
];

export const ProjectsPage: React.FC = () => {
  const { addToast } = useToast();
  const { currentUser, currentOrganization, currentWorkspace, isLoading: isAuthLoading } = useAuth();

  const userAccountType = (currentUser?.accountType || "").toUpperCase();
  const userRoleName = (currentUser?.role?.name || "").toUpperCase();
  const canManageProjects =
    userAccountType === "ADMIN" ||
    userAccountType === "SUB_ADMIN" ||
    userAccountType === "MANAGER" ||
    userRoleName === "ADMIN" ||
    userRoleName === "SUB_ADMIN" ||
    userRoleName === "MANAGER";
  const canManage = canManageProjects;

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & View Mode
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [clientFilter, setClientFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Details Inspection Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [isAddingReq, setIsAddingReq] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState("");
  const [newReqPriority, setNewReqPriority] = useState("MEDIUM");

  // Delete State
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status transition updating state
  const [transitioningProjectId, setTransitioningProjectId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    category: "",
    description: "",
    budget: "",
    startDate: "",
    expectedCompletionDate: "",
    projectStatus: "IN_PROGRESS" as ProjectStatus });

  const loadData = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [projRes, cliRes] = await Promise.all([
        projectsService.getAll({
          search: search.trim() || undefined,
          status: statusFilter !== "ALL" ? (statusFilter as ProjectStatus) : undefined,
          limit: 100 }),
        clientsService.getAll({ limit: 100 }),
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
      setClients(extractArray(cliRes));
    } catch (err: any) {
      setError(err.message || "Failed to load project pipeline data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadData();
  }, [search, statusFilter, currentOrganization?.id, currentWorkspace?.id, currentUser?.id, isAuthLoading]);

  // Client filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (clientFilter !== "ALL" && p.clientId !== clientFilter) {
        return false;
      }
      return true;
    });
  }, [projects, clientFilter]);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      clientId: clients[0]?.id || "",
      title: "",
      category: "",
      description: "",
      budget: "",
      startDate: "",
      expectedCompletionDate: "",
      projectStatus: "IN_PROGRESS" });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      clientId: project.clientId || "",
      title: project.title || "",
      category: project.category || "",
      description: project.description || "",
      budget: project.budget ? String(project.budget) : "",
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      expectedCompletionDate: project.expectedCompletionDate
        ? project.expectedCompletionDate.split("T")[0]
        : "",
      projectStatus: project.projectStatus });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalError("Project title is required");
      return;
    }
    if (!formData.clientId) {
      setModalError("Please select an enterprise client account");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const payload: any = {
      clientId: formData.clientId,
      title: formData.title.trim(),
      category: formData.category.trim() || undefined,
      description: formData.description.trim() || undefined,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      startDate: formData.startDate || undefined,
      expectedCompletionDate: formData.expectedCompletionDate || undefined,
      projectStatus: formData.projectStatus };

    try {
      if (editingProject) {
        const res = await projectsService.update(editingProject.id, payload);
        if (res.success) {
          addToast({
            type: "success",
            title: "Project Updated",
            message: `Project "${formData.title}" updated successfully` });
          setIsModalOpen(false);
          await loadData();
        } else {
          setModalError(res.error || "Failed to update project");
        }
      } else {
        const res = await projectsService.create(payload);
        if (res.success) {
          addToast({
            type: "success",
            title: "Project Established",
            message: `Project "${formData.title}" added to pipeline` });
          setIsModalOpen(false);
          await loadData();
        } else {
          setModalError(res.error || "Failed to create project");
        }
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred while saving project";
      setModalError(msg);
      addToast({ type: "danger", title: "Operation Failed", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (projectId: string, currentStatus: string, newStatus: ProjectStatus) => {
    if (currentStatus === newStatus) return;

    setTransitioningProjectId(projectId);
    try {
      const res = await projectsService.updateStatus(projectId, newStatus);
      if (res.success) {
        addToast({
          type: "success",
          title: "Status Updated",
          message: `Project status transitioned to ${newStatus}` });
        await loadData();
        if (selectedProject?.id === projectId) {
          setSelectedProject((prev) => (prev ? { ...prev, projectStatus: newStatus } : null));
        }
      } else {
        addToast({
          type: "danger",
          title: "Transition Invalid",
          message: res.error || `Cannot transition project from ${currentStatus} to ${newStatus}` });
        await loadData(); // Resync UI to prevent stale state
      }
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Update Failed",
        message: err.message || "Failed to update project status" });
      await loadData(); // Resync UI
    } finally {
      setTransitioningProjectId(null);
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await projectsService.delete(projectToDelete.id);
      if (res.success) {
        addToast({
          type: "info",
          title: "Project Deleted",
          message: `Project "${projectToDelete.title}" removed from workspace` });
        setProjectToDelete(null);
        if (selectedProject?.id === projectToDelete.id) {
          setSelectedProject(null);
        }
        await loadData();
      } else {
        addToast({
          type: "danger",
          title: "Deletion Failed",
          message: res.error || "Failed to delete project" });
      }
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Deletion Error",
        message: err.message || "Failed to delete project" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Requirements Integration
  useEffect(() => {
    if (!selectedProject) {
      setRequirements([]);
      return;
    }
    const loadReqs = async () => {
      try {
        setIsLoadingRequirements(true);
        const res = await projectsService.getRequirements(selectedProject.id);
        const list = Array.isArray(res) ? res : (res as any)?.data || [];
        setRequirements(list);
      } catch (e) {
        setRequirements([]);
      } finally {
        setIsLoadingRequirements(false);
      }
    };
    loadReqs();
  }, [selectedProject?.id]);

  const handleToggleRequirement = async (reqId: string, currentCompleted: boolean) => {
    if (!selectedProject || !canManage) return;
    try {
      await projectsService.updateRequirement(selectedProject.id, reqId, {
        isCompleted: !currentCompleted,
        status: !currentCompleted ? "COMPLETED" : "IN_PROGRESS" });
      setRequirements((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? { ...r, isCompleted: !currentCompleted, status: !currentCompleted ? "COMPLETED" : "IN_PROGRESS" }
            : r
        )
      );
    } catch (e: any) {
      addToast({ type: "danger", title: "Update Failed", message: e.message || "Failed to update requirement" });
    }
  };

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newReqTitle.trim() || !canManage) return;
    try {
      setIsAddingReq(true);
      const created = await projectsService.createRequirement(selectedProject.id, {
        title: newReqTitle.trim(),
        priority: newReqPriority,
        status: "PENDING" });
      const newObj = (created as any)?.data || created;
      setRequirements((prev) => [...prev, newObj]);
      setNewReqTitle("");
      addToast({ type: "success", title: "Requirement Added", message: "Deliverable registered for project" });
    } catch (e: any) {
      addToast({ type: "danger", title: "Action Failed", message: e.message || "Failed to add requirement" });
    } finally {
      setIsAddingReq(false);
    }
  };

  const handleDeleteRequirement = async (reqId: string) => {
    if (!selectedProject || !canManage) return;
    try {
      await projectsService.deleteRequirement(selectedProject.id, reqId);
      setRequirements((prev) => prev.filter((r) => r.id !== reqId));
      addToast({ type: "success", title: "Requirement Removed", message: "Deliverable removed" });
    } catch (e: any) {
      addToast({ type: "danger", title: "Deletion Failed", message: e.message || "Failed to delete requirement" });
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "gold";
      case "CONFIRMED":
      case "DISCUSSION":
        return "info";
      case "CANCELLED":
        return "danger";
      case "REVIEW":
      case "ON_HOLD":
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  const getClientDisplayName = (p: Project) => {
    if (p.client) {
      return (
        p.client.companyName ||
        p.client.fullName ||
        p.client.contactName ||
        p.client.name ||
        p.client.email ||
        "Client"
      );
    }
    const matchedClient = clients.find((c) => c.id === p.clientId);
    if (matchedClient) {
      return matchedClient.companyName || matchedClient.fullName || matchedClient.name || matchedClient.email;
    }
    return `Client #${p.clientId.slice(0, 8)}`;
  };

  const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

  const hasActiveFilters = search.trim().length > 0 || statusFilter !== "ALL" || clientFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setClientFilter("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Projects Pipeline"
        description={
          projects.length > 0
            ? `Client contracts, budget allocations, and delivery tracking (${
                projects.length
              } project${projects.length !== 1 ? "s" : ""} • ${formatCurrency(totalBudget)} total pipeline)`
            : "Deliverables, budget milestones, client contracts, and status tracking"
        }
        actions={
          canManage ? (
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openCreateModal}
            >
              Create New Project
            </Button>
          ) : undefined
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Input
              placeholder="Search by title, description, or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="py-2 text-xs"
            />
          </div>

          <div className="w-40">
            <Select
              options={PROJECT_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 text-xs"
            />
          </div>

          {clients.length > 0 && (
            <div className="w-44">
              <Select
                options={[
                  { value: "ALL", label: "All Clients" },
                  ...clients.map((c) => ({
                    value: c.id,
                    label: c.companyName || c.fullName || c.name || c.email })),
                ]}
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="py-2 text-xs"
              />
            </div>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              leftIcon={<X className="w-3.5 h-3.5" />}
              className="text-xs text-slate-400 hover:text-slate-100"
            >
              Reset
            </Button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 self-end lg:self-center border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-[#D4AF37] shadow-xs"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-[#D4AF37] shadow-xs"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No Projects in Pipeline"
          description="Create client projects to establish delivery budgets, milestones, and status workflows."
          actionLabel="Create Project"
          onAction={openCreateModal}
          icon={<FolderKanban className="w-8 h-8" />}
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No Matching Projects"
          description="No projects match your current search query, status, or client criteria."
          actionLabel="Clear Filters"
          onAction={clearFilters}
          icon={<Filter className="w-8 h-8" />}
        />
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Title & Scope</TableHead>
                <TableHead>Enterprise Client</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Delivery Timeline</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Advance Workflow</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredProjects.map((p) => {
                const currentStatus = p.projectStatus || "PENDING";
                const allowedNextStatuses =
                  ALLOWED_PROJECT_STATUS_TRANSITIONS[currentStatus] || [];
                const isTransitioning = transitioningProjectId === p.id;

                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => setSelectedProject(p)}
                          className="font-bold text-slate-900 dark:text-white hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors text-left block"
                        >
                          {p.title}
                        </button>
                        {p.category && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                            <Tag className="w-3 h-3 text-[#D4AF37]" />
                            {p.category}
                          </span>
                        )}
                        {p.description && (
                          <p className="text-[11px] text-slate-500 font-normal line-clamp-1 max-w-xs">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{getClientDisplayName(p)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-amber-300">
                      {formatCurrency(p.budget)}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      <div>
                        {formatDate(p.startDate)} → {formatDate(p.expectedCompletionDate) || "TBD"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(currentStatus)}>
                        {currentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* Strictly enforce Stage 6 Authoritative Status Transition Matrix */}
                      {allowedNextStatuses.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <select
                            disabled={isTransitioning || !canManage}
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdateStatus(
                                  p.id,
                                  currentStatus,
                                  e.target.value as ProjectStatus
                                );
                              }
                            }}
                            className="text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer disabled:opacity-50"
                          >
                            <option value="" disabled>
                              Transition to...
                            </option>
                            {allowedNextStatuses.map((nxt) => (
                              <option key={nxt} value={nxt}>
                                → {nxt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Terminal State</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconButton
                          label="View project details"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProject(p)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </IconButton>
                        {canManage && (
                          <IconButton
                            label="Edit project"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(p)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </IconButton>
                        )}
                        {canManage && (
                          <IconButton
                            label="Delete project"
                            variant="danger"
                            size="sm"
                            onClick={() => setProjectToDelete(p)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        /* Pipeline Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const currentStatus = p.projectStatus || "PENDING";
            const allowedNextStatuses =
              ALLOWED_PROJECT_STATUS_TRANSITIONS[currentStatus] || [];
            const isTransitioning = transitioningProjectId === p.id;

            return (
              <Card
                key={p.id}
                className="flex flex-col justify-between p-6 relative overflow-hidden hover:border-slate-700 bg-white dark:bg-slate-900/60 transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                        <span className="text-[11px] font-mono text-slate-400">
                          {p.category || "Client Contract"}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedProject(p)}
                        className="font-bold text-base text-slate-900 dark:text-white hover:text-[#D4AF37] text-left block"
                      >
                        {p.title}
                      </button>
                    </div>
                    <Badge variant={getStatusBadgeVariant(currentStatus)}>
                      {currentStatus}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {getClientDisplayName(p)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-amber-300">
                      {formatCurrency(p.budget)}
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(p.startDate)} → {formatDate(p.expectedCompletionDate) || "TBD"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  {/* Status Transition Control */}
                  {allowedNextStatuses.length > 0 && canManage && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-400">Advance Status:</span>
                      <select
                        disabled={isTransitioning}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleUpdateStatus(
                              p.id,
                              currentStatus,
                              e.target.value as ProjectStatus
                            );
                          }
                        }}
                        className="text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                      >
                        <option value="" disabled>
                          Select transition...
                        </option>
                        {allowedNextStatuses.map((nxt) => (
                          <option key={nxt} value={nxt}>
                            → {nxt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProject(p)}
                      className="text-xs py-1 px-2.5"
                    >
                      Details
                    </Button>
                    <div className="flex items-center gap-1">
                      {canManage && (
                        <IconButton
                          label="Edit project"
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(p)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </IconButton>
                      )}
                      {canManage && (
                        <IconButton
                          label="Delete project"
                          variant="danger"
                          size="sm"
                          onClick={() => setProjectToDelete(p)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </IconButton>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Delete Project */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDeleteProject}
        isLoading={isDeleting}
        title="Delete Project Contract"
        message={`Are you sure you want to delete project "${projectToDelete?.title}"? All deliverables, budget milestones, and associated telemetry will be removed.`}
        confirmLabel="Delete Project"
        variant="danger"
      />

      {/* Project Details Inspection Modal */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title="Project Pipeline Overview"
          description={`Contract specifications and timeline for ${selectedProject.title}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-slate-500">
                Project ID: {selectedProject.id}
              </span>
              <div className="flex items-center gap-2">
                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      const p = selectedProject;
                      setSelectedProject(null);
                      openEditModal(p);
                    }}
                  >
                    Edit Project
                  </Button>
                )}
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedProject.title}
                  </h4>
                  <Badge variant={getStatusBadgeVariant(selectedProject.projectStatus)}>
                    {selectedProject.projectStatus}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Client: <strong className="text-slate-800 dark:text-slate-200">{getClientDisplayName(selectedProject)}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-400 block">Allocated Budget</span>
                <span className="text-lg font-mono font-bold text-[#D4AF37]">
                  {formatCurrency(selectedProject.budget)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">Project Category</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedProject.category || "Enterprise Software"}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">Delivery Timeline</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {formatDate(selectedProject.startDate)} → {formatDate(selectedProject.expectedCompletionDate) || "Open"}
                </span>
              </div>
            </div>

            {selectedProject.description && (
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-xs">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">Contract Scope & Deliverables</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>
            )}

            {/* Scope & Requirements Checklist */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider block">
                    Scope & Requirements Checklist ({requirements.filter((r) => r.isCompleted).length} / {requirements.length} Completed)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Client deliverables and acceptance criteria.
                  </span>
                </div>
                {requirements.length > 0 && (
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {Math.round((requirements.filter((r) => r.isCompleted).length / requirements.length) * 100)}% Complete
                  </span>
                )}
              </div>

              {requirements.length > 0 && (
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        (requirements.filter((r) => r.isCompleted).length / requirements.length) * 100
                      )}%` }}
                  />
                </div>
              )}

              {isLoadingRequirements ? (
                <div className="py-4 text-center text-xs text-slate-500">Loading deliverables...</div>
              ) : requirements.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No explicit deliverables documented yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      className={`p-2.5 rounded-lg border transition-colors flex items-start justify-between gap-3 text-xs ${
                        req.isCompleted
                          ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300"
                          : "bg-slate-900 border-slate-800 text-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {canManage ? (
                          <button
                            type="button"
                            onClick={() => handleToggleRequirement(req.id, req.isCompleted)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            {req.isCompleted ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <span className="mt-0.5">
                            {req.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-400" />
                            )}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className={`font-semibold block ${req.isCompleted ? "line-through text-slate-400" : "text-white"}`}>
                            {req.title}
                          </span>
                          {req.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{req.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                            req.priority === "HIGH"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : req.priority === "LOW"
                              ? "bg-slate-800 text-slate-400 border-slate-700"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {req.priority || "MEDIUM"}
                        </span>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRequirement(req.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Requirement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {canManage && (
                <form onSubmit={handleAddRequirement} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="+ Add deliverable requirement..."
                    value={newReqTitle}
                    onChange={(e) => setNewReqTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <select
                    value={newReqPriority}
                    onChange={(e) => setNewReqPriority(e.target.value)}
                    className="px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isAddingReq || !newReqTitle.trim()}
                  >
                    Add
                  </Button>
                </form>
              )}
            </div>

            {/* Allowed Transitions Preview */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider block">
                Workflow Transition Governance
              </span>
              <p className="text-xs text-slate-400">
                Current status is <strong className="text-white">{selectedProject.projectStatus}</strong>.
                {ALLOWED_PROJECT_STATUS_TRANSITIONS[selectedProject.projectStatus]?.length > 0 ? (
                  <> Allowed valid transitions: {ALLOWED_PROJECT_STATUS_TRANSITIONS[selectedProject.projectStatus].join(", ")}</>
                ) : (
                  <> This is a terminal state.</>
                )}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal for Create / Edit Project */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project Contract" : "Establish New Project"}
        description={
          editingProject
            ? "Modify project scope, budget allocation, and milestones."
            : "Register a new client deliverable in your workspace pipeline."
        }
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={isSubmitting}
              disabled={!formData.title.trim() || !formData.clientId}
              onClick={handleSubmit}
            >
              {editingProject ? "Save Changes" : "Create Project"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {modalError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium">
              {modalError}
            </div>
          )}

          <Select
            label="Client Account"
            required
            options={clients.map((c) => ({
              value: c.id,
              label: `${c.companyName || c.fullName || c.name || c.email} (${c.email})` }))}
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            placeholder={clients.length === 0 ? "No clients available. Add a client first." : "Select Client..."}
          />

          <Input
            label="Project Title"
            required
            placeholder="e.g. Multi-Cloud Microservices Modernization"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Category / Practice"
              placeholder="e.g. Cloud Infrastructure"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Budget Allocation ($ USD)"
              type="number"
              placeholder="e.g. 75000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="Expected Completion Date"
              type="date"
              value={formData.expectedCompletionDate}
              onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
            />
          </div>

          {!editingProject && (
            <Select
              label="Initial Status"
              options={[
                { value: "PLANNING", label: "Planning" },
                { value: "PENDING", label: "Pending" },
                { value: "DISCUSSION", label: "Discussion" },
                { value: "CONFIRMED", label: "Confirmed" },
                { value: "IN_PROGRESS", label: "In Progress" },
              ]}
              value={formData.projectStatus}
              onChange={(e) =>
                setFormData({ ...formData, projectStatus: e.target.value as ProjectStatus })
              }
            />
          )}

          <Textarea
            label="Scope & Deliverables Description"
            placeholder="e.g. Full-stack cloud modernization, backend security hardening, automated CI/CD pipelines, and multi-tenant telemetry..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
