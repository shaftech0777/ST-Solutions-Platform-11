import React, { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Search,
  Check,
  Edit2,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Filter,
  X,
  LayoutGrid,
  List } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Card } from "../components/ui/Card.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal } from "../components/ui/Modal.js";
import { Input } from "../components/ui/Input.js";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../components/ui/Table.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { Skeleton } from "../components/ui/LoadingSpinner.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { organizationsService } from "../api/services/organizations.service.js";
import { Organization } from "../types/index.js";

export const OrganizationsPage: React.FC = () => {
  const { organizations, currentOrganization, switchOrganization, refreshUser, currentUser, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered organizations
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        (org.slug && org.slug.toLowerCase().includes(search.toLowerCase()));

      const matchesRole =
        roleFilter === "ALL" || (org.role && org.role.toUpperCase() === roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [organizations, search, roleFilter]);

  const openCreateModal = () => {
    setEditingOrg(null);
    setFormName("");
    setFormSlug("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setFormName(org.name);
    setFormSlug(org.slug || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    if (!trimmedName) {
      setFormError("Organization name is required");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingOrg) {
        // Update existing organization
        const res = await organizationsService.update(editingOrg.id, {
          name: trimmedName,
          slug: formSlug.trim() || undefined });

        if (res.success) {
          addToast({
            type: "success",
            title: "Organization Updated",
            message: `Organization "${trimmedName}" updated successfully` });
          setIsModalOpen(false);
          await refreshUser();
        } else {
          setFormError(res.error || "Failed to update organization");
        }
      } else {
        // Create new organization
        const res = await organizationsService.create({
          name: trimmedName,
          slug: formSlug.trim() || undefined });

        if (res.success && res.data) {
          addToast({
            type: "success",
            title: "Organization Created",
            message: `Organization "${res.data.name}" established successfully` });
          setIsModalOpen(false);
          await refreshUser();
          if (res.data.id) {
            await switchOrganization(res.data.id);
          }
        } else {
          setFormError(res.error || "Failed to create organization");
        }
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred while saving";
      setFormError(msg);
      addToast({ type: "danger", title: "Operation Failed", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasActiveFilters = search.trim().length > 0 || roleFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Organizations Management"
        description={
          organizations.length > 0
            ? `Multi-tenant enterprise tenant roots (${organizations.length} total organization${
                organizations.length > 1 ? "s" : ""
              })`
            : "Multi-tenant enterprise organization roots and tenant boundaries"
        }
        actions={
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Create Organization
          </Button>
        }
      />

      {/* Toolbar */}
      {organizations.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-1 items-center gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search by organization name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="py-2 text-xs"
              />
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              {(["ALL", "OWNER", "ADMIN", "MEMBER"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    roleFilter === role
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-400 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                >
                  {role === "ALL" ? "All Roles" : role}
                </button>
              ))}
            </div>

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
          <div className="flex items-center gap-1 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
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
      )}

      {/* Main Content States */}
      {isAuthLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : organizations.length === 0 ? (
        <EmptyState
          title="No Organizations Found"
          description="Create your first organization to establish tenant boundary context, configure workspaces, and invite team members."
          actionLabel="Create Organization"
          onAction={openCreateModal}
          icon={<Building2 className="w-8 h-8" />}
        />
      ) : filteredOrganizations.length === 0 ? (
        <EmptyState
          title="No Matching Organizations"
          description="No organizations match your current search query or role filter criteria."
          actionLabel="Clear Filters"
          onAction={clearFilters}
          icon={<Filter className="w-8 h-8" />}
        />
      ) : viewMode === "table" ? (
        /* Desktop & Tablet Table View */
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Slug Identifier</TableHead>
                <TableHead>Your Role</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Context Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredOrganizations.map((org) => {
                const isCurrent = org.id === currentOrganization?.id;
                const canManage = org.role === "OWNER" || org.role === "ADMIN" || currentUser?.accountType === "ADMIN";

                return (
                  <TableRow key={org.id} className={isCurrent ? "bg-amber-500/[0.03]" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B88E20]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                          {org.name[0]?.toUpperCase() || "O"}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {org.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {org.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      {org.slug || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          org.role === "OWNER"
                            ? "gold"
                            : org.role === "ADMIN"
                            ? "info"
                            : "default"
                        }
                      >
                        {org.role || "MEMBER"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(org.createdAt)}
                    </TableCell>
                    <TableCell>
                      {isCurrent ? (
                        <Badge variant="gold" dot>
                          Active Context
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManage && (
                          <IconButton
                            label="Edit organization"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(org)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </IconButton>
                        )}
                        {!isCurrent ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => switchOrganization(org.id)}
                            className="text-xs py-1 px-2.5"
                          >
                            Switch
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1 px-2.5 py-1">
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
      ) : (
        /* Responsive Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => {
            const isCurrent = org.id === currentOrganization?.id;
            const canManage = org.role === "OWNER" || org.role === "ADMIN" || currentUser?.accountType === "ADMIN";

            return (
              <Card
                key={org.id}
                className={`flex flex-col justify-between p-6 relative overflow-hidden transition-all duration-200 ${
                  isCurrent
                    ? "border-[#D4AF37] bg-slate-900/90 ring-1 ring-[#D4AF37]/30 shadow-lg"
                    : "hover:border-slate-700 bg-white dark:bg-slate-900/60"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B88E20]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold flex items-center justify-center text-base shrink-0 shadow-xs">
                      {org.name[0]?.toUpperCase() || "O"}
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent ? (
                        <Badge variant="gold" dot>
                          Active Context
                        </Badge>
                      ) : (
                        <Badge
                          variant={
                            org.role === "OWNER"
                              ? "gold"
                              : org.role === "ADMIN"
                              ? "info"
                              : "default"
                          }
                        >
                          {org.role || "MEMBER"}
                        </Badge>
                      )}
                      {canManage && (
                        <IconButton
                          label="Edit organization"
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(org)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </IconButton>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      {org.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      slug: {org.slug || "n/a"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(org.createdAt)}
                    </span>
                    <span className="font-mono text-[11px]">
                      Role: <strong className="text-slate-800 dark:text-slate-200">{org.role || "MEMBER"}</strong>
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  {!isCurrent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => switchOrganization(org.id)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Switch Context
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1">
                      <Check className="w-4 h-4" /> Active Context
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Organization Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrg ? "Edit Organization" : "Create Enterprise Organization"}
        description={
          editingOrg
            ? "Update the tenant configuration and slug parameters."
            : "Establish a new isolated multi-tenant organization context for projects, workspaces, and RBAC governance."
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
              disabled={!formName.trim()}
              onClick={handleSubmit}
            >
              {editingOrg ? "Save Changes" : "Create Organization"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Organization Name"
            required
            placeholder="e.g. Shaf Tech Global Inc."
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <Input
            label="Organization Slug (Optional)"
            placeholder="e.g. shaf-tech-global"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            helperText="Unique alphanumeric identifier used for tenant path identification"
          />
        </form>
      </Modal>
    </div>
  );
};
