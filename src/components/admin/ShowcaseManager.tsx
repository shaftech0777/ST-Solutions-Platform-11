import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Sparkles,
  Layers,
  ShoppingBag,
  Cpu,
  RefreshCw,
  Sliders,
  Globe,
  AlertCircle } from "lucide-react";
import { Button, IconButton } from "../ui/Button.js";
import { Badge } from "../ui/Badge.js";
import { Card } from "../ui/Card.js";
import { Modal, ConfirmModal } from "../ui/Modal.js";
import { Input, Textarea } from "../ui/Input.js";
import { Select } from "../ui/Select.js";
import { EmptyState } from "../ui/EmptyState.js";
import { Skeleton } from "../ui/LoadingSpinner.js";
import { useToast } from "../../context/ToastContext.js";
import { showcaseService, ShowcaseProject, ShowcaseCategory } from "../../api/services/showcase.service.js";

const DEFAULT_CATEGORY_OPTIONS = [
  { value: "E-Commerce", label: "E-Commerce & Retail" },
  { value: "Software", label: "Software & Operational Systems" },
  { value: "Web", label: "Web Applications & Portals" },
  { value: "AI", label: "AI & Intelligent Assistants" },
  { value: "Automation", label: "Business Automation & Scheduling" },
];

export const ShowcaseManager: React.FC = () => {
  const { addToast } = useToast();
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [categories, setCategories] = useState<ShowcaseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ShowcaseProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<ShowcaseProject | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    tagline: string;
    category: string;
    projectType: string;
    description: string;
    fullDescription: string;
    targetAudience: string;
    problemSolved: string;
    features: string;
    benefits: string;
    technologies: string;
    liveUrl: string;
    status: "PUBLISHED" | "DRAFT";
    featured: boolean;
  }>({
    title: "",
    tagline: "",
    category: "Software",
    projectType: "WEB",
    description: "",
    fullDescription: "",
    targetAudience: "",
    problemSolved: "",
    features: "",
    benefits: "",
    technologies: "React, TypeScript, PostgreSQL",
    liveUrl: "",
    status: "PUBLISHED",
    featured: true });

  const loadProjects = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [res, cats] = await Promise.all([
        showcaseService.getAdminProjects(),
        showcaseService.getCategories().catch(() => []),
      ]);

      if (Array.isArray(res)) {
        setProjects(res);
      } else {
        setProjects([]);
      }

      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to load showcase projects from database.";
      setLoadError(msg);
      setProjects([]);
      addToast({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      tagline: "",
      category: "Software",
      projectType: "WEB",
      description: "",
      fullDescription: "",
      targetAudience: "",
      problemSolved: "",
      features: "",
      benefits: "",
      technologies: "React, TypeScript, Tailwind CSS, PostgreSQL",
      liveUrl: "",
      status: "PUBLISHED",
      featured: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ShowcaseProject) => {
    setEditingProject(p);
    setFormData({
      title: p.title,
      tagline: p.tagline || "",
      category: p.category?.name || "Software",
      projectType: p.projectType || "WEB",
      description: p.description || "",
      fullDescription: p.fullDescription || "",
      targetAudience: p.targetAudience || "",
      problemSolved: p.benefits?.[0] || "",
      features: Array.isArray(p.features) ? p.features.join("\n") : "",
      benefits: Array.isArray(p.benefits) ? p.benefits.join("\n") : "",
      technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : "",
      liveUrl: p.liveUrl || "",
      status: p.status,
      featured: p.featured });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      addToast({ type: "error", message: "Title and description are required." });
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<ShowcaseProject> = {
        title: formData.title.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim(),
        targetAudience: formData.targetAudience.trim(),
        features: formData.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        benefits: formData.benefits
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean),
        technologies: formData.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        liveUrl: formData.liveUrl.trim() || null,
        status: formData.status,
        featured: formData.featured,
        projectType: formData.projectType };

      if (formData.category) {
        const matchedCat = categories.find(
          (c) => c.name.toLowerCase() === formData.category.toLowerCase()
        );
        if (matchedCat) {
          payload.categoryId = matchedCat.id;
        }
      }

      if (editingProject) {
        await showcaseService.updateProject(editingProject.id, payload);
        addToast({ type: "success", message: "Showcase project updated successfully." });
      } else {
        await showcaseService.createProject(payload);
        addToast({ type: "success", message: "New showcase project created." });
      }

      setIsModalOpen(false);
      loadProjects();
    } catch (err: any) {
      addToast({
        type: "error",
        message: err.message || "Failed to save project. Please verify inputs." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    try {
      await showcaseService.deleteProject(deletingProject.id);
      addToast({ type: "success", message: "Project deleted successfully." });
      setDeletingProject(null);
      loadProjects();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Failed to delete project." });
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.tagline && p.tagline.toLowerCase().includes(search.toLowerCase()));

    const matchCategory =
      categoryFilter === "ALL" ||
      (p.category?.name && p.category.name.toLowerCase() === categoryFilter.toLowerCase()) ||
      p.projectType?.toLowerCase() === categoryFilter.toLowerCase();

    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Showcase Projects CMS</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage the real capabilities, customer systems, and case studies displayed on the public website.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadProjects} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Showcase Project</span>
          </Button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Categories</option>
            {categories.length > 0
              ? categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))
              : DEFAULT_CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
          </select>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={loadProjects}>
            Retry
          </Button>
        </div>
      )}

      {/* Projects List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No showcase projects found"
          description="Create your first showcase project to display ST-Solutions capabilities on the public website."
          actionLabel="Add Showcase Project"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/40 transition-colors shadow-sm"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{p.title}</span>
                  <Badge variant={p.status === "PUBLISHED" ? "success" : "default"}>
                    {p.status}
                  </Badge>
                  {p.featured && (
                    <Badge variant="warning">
                      Featured
                    </Badge>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {p.category?.name || p.projectType}
                  </span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{p.tagline}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                {p.liveUrl && (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Visit Live Preview"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <IconButton
                  icon={<Edit2 className="w-4 h-4" />}
                  tooltip="Edit Showcase Project"
                  onClick={() => handleOpenEdit(p)}
                />
                <IconButton
                  icon={<Trash2 className="w-4 h-4 text-red-500" />}
                  tooltip="Delete Project"
                  onClick={() => setDeletingProject(p)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProject ? "Edit Showcase Project" : "Create New Showcase Project"}
          size="xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Project Title"
                placeholder="e.g. Apex E-Commerce & Retail Platform"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                label="Short Tagline"
                placeholder="e.g. High-converting online store with seamless mobile checkout"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Primary Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={
                  categories.length > 0
                    ? categories.map((c) => ({ value: c.name, label: c.name }))
                    : DEFAULT_CATEGORY_OPTIONS
                }
              />
              <Select
                label="Publish Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={[
                  { value: "PUBLISHED", label: "Published (Visible on site)" },
                  { value: "DRAFT", label: "Draft (Hidden)" },
                ]}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Featured Showcase</label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="featured-check" className="text-xs text-slate-600 dark:text-slate-400">
                    Feature prominently on home page
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Target Audience (Who It Is For)"
                placeholder="e.g. Retailers, Brand Owners, Wholesale Distributors"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
              <Input
                label="Live Demo Link (Optional)"
                placeholder="https://demo.st-solutions.cloud/..."
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              />
            </div>

            <Textarea
              label="Short Customer-Facing Description"
              placeholder="Explain clearly what this system is and what it does for the user..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />

            <Textarea
              label="Full Technical & Architectural Description"
              placeholder="Comprehensive details shown in the expanded details modal..."
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              rows={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Textarea
                label="Key Features (One per line)"
                placeholder="Instant product search&#10;Frictionless 3-step checkout&#10;Automated WhatsApp order alerts"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={4}
              />
              <Textarea
                label="Business Benefits (One per line)"
                placeholder="Increases online checkout conversion by 28%&#10;Eliminates out-of-stock complaints"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                rows={4}
              />
            </div>

            <Input
              label="Technology Tags (Comma-separated)"
              placeholder="React, TypeScript, Tailwind CSS, PostgreSQL, Stripe"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            />

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving Project..." : editingProject ? "Save Changes" : "Create Showcase Project"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <ConfirmModal
          isOpen={Boolean(deletingProject)}
          onClose={() => setDeletingProject(null)}
          onConfirm={handleDelete}
          title="Delete Showcase Project"
          message={`Are you sure you want to delete "${deletingProject.title}" from the public showcase? This cannot be undone.`}
          confirmLabel="Delete Project"
          variant="danger"
        />
      )}
    </div>
  );
};
