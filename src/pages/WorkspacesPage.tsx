import React, { useEffect, useState, useMemo } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Check,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  ArrowRight,
  Filter,
  X,
  LayoutGrid,
  List,
  FolderKanban,
  ShieldCheck } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Card } from "../components/ui/Card.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal, ConfirmModal } from "../components/ui/Modal.js";
import { Input, Textarea } from "../components/ui/Input.js";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../components/ui/Table.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { Skeleton } from "../components/ui/LoadingSpinner.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { workspacesService } from "../api/services/workspaces.service.js";
import { Workspace } from "../types/index.js";

export const WorkspacesPage: React.FC = () => {
  const {
    currentOrganization,
    currentWorkspace,
    switchWorkspace,
    refreshUser,
    currentUser,
    isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & View Mode
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [wsName, setWsName] = useState("");
  const [wsDesc, setWsDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirmation State
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadWorkspaces = async () => {
    if (!currentUser || !currentOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await workspacesService.getAll(currentOrganization.id);
      const items = Array.isArray(res.data) ? res.data : [];
      setWorkspaces(items);
    } catch (err: any) {
      setError(err.message || "Failed to load workspaces for active organization");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadWorkspaces();
  }, [currentOrganization?.id, currentUser?.id, isAuthLoading]);

  // Filtered workspaces
  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((ws) => {
      const matchesSearch =
        ws.name.toLowerCase().includes(search.toLowerCase()) ||
        (ws.description && ws.description.toLowerCase().includes(search.toLowerCase())) ||
        (ws.slug && ws.slug.toLowerCase().includes(search.toLowerCase()));

      return matchesSearch;
    });
  }, [workspaces, search]);

  const openCreateModal = () => {
    setEditingWorkspace(null);
    setWsName("");
    setWsDesc("");
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ws: Workspace) => {
    setEditingWorkspace(ws);
    setWsName(ws.name);
    setWsDesc(ws.description || "");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = wsName.trim();
    if (!trimmedName) {
      setModalError("Workspace name is required");
      return;
    }

    if (!currentOrganization) {
      setModalError("Active organization context is required to create a workspace");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      if (editingWorkspace) {
        // Edit workspace
        const res = await workspacesService.update(editingWorkspace.id, {
          name: trimmedName,
          description: wsDesc.trim() || undefined });

        if (res.success) {
          addToast({
            type: "success",
            title: "Workspace Updated",
            message: `Workspace "${trimmedName}" updated successfully` });
          setIsModalOpen(false);
          await loadWorkspaces();
          await refreshUser();
        } else {
          setModalError(res.error || "Failed to update workspace");
        }
      } else {
        // Create workspace
        const res = await workspacesService.create({
          name: trimmedName,
          description: wsDesc.trim() || undefined,
          organizationId: currentOrganization.id });

        if (res.success && res.data) {
          addToast({
            type: "success",
            title: "Workspace Created",
            message: `Workspace "${res.data.name}" established under ${currentOrganization.name}` });
          setIsModalOpen(false);
          await loadWorkspaces();
          await refreshUser();
          if (res.data.id) {
            await switchWorkspace(res.data.id);
          }
        } else {
          setModalError(res.error || "Failed to create workspace");
        }
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred while saving";
      setModalError(msg);
      addToast({ type: "danger", title: "Operation Failed", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;
    setIsDeleting(true);
    try {
      const res = await workspacesService.delete(workspaceToDelete.id);
      if (res.success) {
        addToast({
          type: "info",
          title: "Workspace Deleted",
          message: `Workspace "${workspaceToDelete.name}" removed successfully` });
        setWorkspaceToDelete(null);
        await loadWorkspaces();
        await refreshUser();
      } else {
        addToast({
          type: "danger",
          title: "Deletion Failed",
          message: res.error || "Could not delete workspace" });
      }
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Deletion Error",
        message: err.message || "Failed to delete workspace" });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
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

  const canManage =
    currentUser?.accountType === "ADMIN" ||
    currentOrganization?.role === "OWNER" ||
    currentOrganization?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Workspace Operations"
        description={
          currentOrganization
            ? `Sub-tenant workspaces within ${currentOrganization.name} (${workspaces.length} workspace${
                workspaces.length !== 1 ? "s" : ""
              })`
            : "Sub-tenant workspace partition for project management and team permissions"
        }
        actions={
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Create Workspace
          </Button>
        }
      />

      {/* Organization Hierarchy Breadcrumb Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-200 dark:border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B88E20]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold flex items-center justify-center text-sm shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Organization Hierarchy
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
              <span>{currentOrganization?.name || "No Organization Selected"}</span>
              <span className="text-slate-500">/</span>
              <span className="text-[#D4AF37]">{currentWorkspace?.name || "Global Workspace"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="gold" dot>
            Tenant Scoped
          </Badge>
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
            {workspaces.length} Registered Workspace{workspaces.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      {workspaces.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-1 items-center gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search workspaces by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                className="py-2 text-sm"
              />
            </div>

            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearch("")}
                leftIcon={<X className="w-3.5 h-3.5" />}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-100"
              >
                Reset
              </Button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-[#D4AF37] shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-900 text-[#D4AF37] shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Table view"
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={loadWorkspaces} />}

      {/* Main Content States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : workspaces.length === 0 ? (
        <EmptyState
          title="No Workspaces in this Organization"
          description="Create your first workspace to organize project pipelines, manage client relations, and restrict team access."
          actionLabel="Create Workspace"
          onAction={openCreateModal}
          icon={<Briefcase className="w-8 h-8" />}
        />
      ) : filteredWorkspaces.length === 0 ? (
        <EmptyState
          title="No Matching Workspaces"
          description="No workspaces match your search criteria. Try modifying your search query."
          actionLabel="Clear Search"
          onAction={() => setSearch("")}
          icon={<Filter className="w-8 h-8" />}
        />
      ) : viewMode === "grid" ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces.map((ws) => {
            const isCurrent = ws.id === currentWorkspace?.id;

            return (
              <Card
                key={ws.id}
                className={`flex flex-col justify-between p-6 relative overflow-hidden transition-all duration-200 ${
                  isCurrent
                    ? "border-[#D4AF37] bg-slate-50 dark:bg-slate-900/90 ring-1 ring-[#D4AF37]/30 shadow-lg"
                    : "hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold flex items-center justify-center text-base shrink-0 shadow-xs">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isCurrent ? (
                        <Badge variant="gold" dot>
                          Active Context
                        </Badge>
                      ) : (
                        <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                          {ws.role || "MEMBER"}
                        </span>
                      )}
                      {canManage && (
                        <IconButton
                          label="Edit workspace"
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(ws)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </IconButton>
                      )}
                      {canManage && !isCurrent && (
                        <IconButton
                          label="Delete workspace"
                          variant="danger"
                          size="sm"
                          onClick={() => setWorkspaceToDelete(ws)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </IconButton>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      {ws.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                      {ws.description || "No specific workspace description provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1 font-mono text-sm">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      {formatDate(ws.createdAt)}
                    </span>
                    <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
                      slug: {ws.slug || "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  {!isCurrent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => switchWorkspace(ws.id)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Switch Workspace
                    </Button>
                  ) : (
                    <span className="text-sm font-semibold text-[#D4AF37] flex items-center gap-1">
                      <Check className="w-4 h-4" /> Current Workspace
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredWorkspaces.map((ws) => {
                const isCurrent = ws.id === currentWorkspace?.id;

                return (
                  <TableRow key={ws.id} className={isCurrent ? "bg-amber-500/[0.03]" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold flex items-center justify-center text-sm shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ws.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {ws.description || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-300">
                      {ws.slug || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(ws.createdAt)}
                    </TableCell>
                    <TableCell>
                      {isCurrent ? (
                        <Badge variant="gold" dot>
                          Active
                        </Badge>
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">Available</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canManage && (
                          <IconButton
                            label="Edit workspace"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(ws)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </IconButton>
                        )}
                        {canManage && !isCurrent && (
                          <IconButton
                            label="Delete workspace"
                            variant="danger"
                            size="sm"
                            onClick={() => setWorkspaceToDelete(ws)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        )}
                        {!isCurrent ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => switchWorkspace(ws.id)}
                            className="text-sm py-1 px-2.5"
                          >
                            Switch
                          </Button>
                        ) : (
                          <span className="text-sm font-semibold text-[#D4AF37] flex items-center gap-1 px-2 py-1">
                            <Check className="w-4 h-4" /> Selected
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={!!workspaceToDelete}
        onClose={() => setWorkspaceToDelete(null)}
        onConfirm={confirmDeleteWorkspace}
        isLoading={isDeleting}
        title="Delete Workspace Partition"
        message={`Are you sure you want to delete workspace "${workspaceToDelete?.name}"? All project associations, client scopes, and permissions assigned to this workspace may be permanently removed.`}
        confirmLabel="Delete Workspace"
        variant="danger"
      />

      {/* Create / Edit Workspace Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorkspace ? "Edit Workspace" : "Create Workspace"}
        description={
          editingWorkspace
            ? "Update workspace parameters and descriptions."
            : `Establish a new sub-tenant workspace partition under ${currentOrganization?.name || "active organization"}.`
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
              disabled={!wsName.trim()}
              onClick={handleSubmit}
            >
              {editingWorkspace ? "Save Changes" : "Create Workspace"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium">
              {modalError}
            </div>
          )}

          <Input
            label="Workspace Name"
            required
            placeholder="e.g. Core Engineering & Infrastructure"
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="e.g. Strategic client delivery, cloud architecture, and backend platform engineering"
            value={wsDesc}
            onChange={(e) => setWsDesc(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
