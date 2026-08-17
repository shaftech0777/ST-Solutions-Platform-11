import React, { useEffect, useState } from "react";
import { FolderKanban, Plus, Search, Calendar, DollarSign, Filter, CheckCircle2, Trash2 } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell, Pagination } from "../components/ui/Table.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal, ConfirmModal } from "../components/ui/Modal.js";
import { Input, Textarea } from "../components/ui/Input.js";
import { Select } from "../components/ui/Select.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { useToast } from "../context/ToastContext.js";
import { useAuth } from "../context/AuthContext.js";
import { projectsService } from "../api/services/projects.service.js";
import { clientsService } from "../api/services/clients.service.js";
import { Project, ProjectStatus, Client } from "../types/index.js";

export const ProjectsPage: React.FC = () => {
  const { addToast } = useToast();
  const { currentUser, isLoading: isAuthLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    budget: "",
    startDate: "",
    expectedCompletionDate: "",
    projectStatus: "IN_PROGRESS" as ProjectStatus,
  });

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const [projRes, cliRes] = await Promise.all([
        projectsService.getAll({
          status: statusFilter ? (statusFilter as ProjectStatus) : undefined,
          search,
          page,
          limit: 10,
        }),
        clientsService.getAll({ limit: 100 }),
      ]);

      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      setClients(Array.isArray(cliRes.data) ? cliRes.data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load projects pipeline");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadData();
  }, [statusFilter, search, page, currentUser?.id, isAuthLoading]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.clientId) {
      addToast({ type: "warning", title: "Validation Error", message: "Please select a client and project title" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await projectsService.create({
        clientId: formData.clientId,
        title: formData.title,
        description: formData.description || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        startDate: formData.startDate || undefined,
        expectedCompletionDate: formData.expectedCompletionDate || undefined,
        projectStatus: formData.projectStatus,
      });

      if (res.success) {
        addToast({ type: "success", title: "Project Created", message: `Project "${formData.title}" created successfully` });
        setIsModalOpen(false);
        setFormData({
          clientId: "",
          title: "",
          description: "",
          budget: "",
          startDate: "",
          expectedCompletionDate: "",
          projectStatus: "IN_PROGRESS",
        });
        loadData();
      }
    } catch (err: any) {
      addToast({ type: "danger", title: "Creation Failed", message: err.message || "Failed to create project" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ProjectStatus) => {
    try {
      await projectsService.updateStatus(id, newStatus);
      addToast({ type: "success", title: "Status Updated", message: `Project status set to ${newStatus}` });
      loadData();
    } catch (err: any) {
      addToast({ type: "danger", title: "Update Failed", message: err.message || "Failed to update project status" });
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await projectsService.delete(projectToDelete.id);
      addToast({ type: "info", title: "Project Deleted", message: `Project "${projectToDelete.title}" removed` });
      setProjectToDelete(null);
      loadData();
    } catch (err: any) {
      addToast({ type: "danger", title: "Deletion Failed", message: err.message || "Failed to delete project" });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects Pipeline"
        description="Deliverables, budget milestones, client contracts, and status tracking"
        actions={
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create New Project
          </Button>
        }
      />

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            options={[
              { value: "", label: "All Statuses" },
              { value: "PLANNING", label: "Planning" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "COMPLETED", label: "Completed" },
              { value: "ON_HOLD", label: "On Hold" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {isLoading ? (
        <LoadingSpinner text="Fetching projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No Projects Found"
          description="Create your first client project to assign budgets, start dates, and delivery milestones."
          actionLabel="Create Project"
          onAction={() => setIsModalOpen(true)}
          icon={<FolderKanban className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-slate-900 dark:text-white">
                    <div>
                      <span>{p.title}</span>
                      {p.description && <p className="text-[11px] text-slate-500 font-normal mt-0.5 line-clamp-1">{p.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.client?.name || p.clientId}</TableCell>
                  <TableCell className="font-mono font-bold text-xs">{formatCurrency(p.budget || 0)}</TableCell>
                  <TableCell className="font-mono text-[11px] text-slate-400">
                    {p.startDate ? new Date(p.startDate).toLocaleDateString() : "—"} →{" "}
                    {p.expectedCompletionDate ? new Date(p.expectedCompletionDate).toLocaleDateString() : "TBD"}
                  </TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={p.projectStatus}
                        onChange={(e) => handleUpdateStatus(p.id, e.target.value as ProjectStatus)}
                        className="text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      >
                        <option value="PLANNING">PLANNING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="ON_HOLD">ON_HOLD</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <IconButton
                        label="Delete project"
                        variant="danger"
                        size="sm"
                        onClick={() => setProjectToDelete({ id: p.id, title: p.title })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(projects.length / 10) || 1}
            onPageChange={(p) => setPage(p)}
            totalRecords={projects.length}
          />
        </div>
      )}

      {/* Confirm Delete Project Modal */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDeleteProject}
        isLoading={isDeleting}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.title}"? All deliverables and milestones associated with this project will be deleted.`}
        confirmLabel="Delete Project"
        variant="danger"
      />

      {/* Modal for Create Project */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Client Project"
        description="Establish a new project contract and milestone tracker."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleCreateProject}
            >
              Create Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Select
            label="Client Account"
            required
            placeholder="Select Client..."
            options={clients.map((c) => ({ value: c.id, label: `${c.name} (${c.companyName || c.email})` }))}
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          />

          <Input
            label="Project Title"
            required
            placeholder="e.g. Enterprise Cloud Modernization"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Textarea
            label="Description"
            placeholder="e.g. Full-stack microservices architecture migration and security overhaul"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Budget (USD)"
              type="number"
              placeholder="50000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
            <Select
              label="Initial Status"
              options={[
                { value: "PLANNING", label: "Planning" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "ON_HOLD", label: "On Hold" },
              ]}
              value={formData.projectStatus}
              onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value as ProjectStatus })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="Expected Completion"
              type="date"
              value={formData.expectedCompletionDate}
              onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
