import React, { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  Plus,
  Lock,
  CheckCircle2,
  ShieldAlert,
  Search,
  Users,
  Key,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Crown,
  Layers,
  CheckSquare,
  Square,
  AlertCircle,
  ChevronRight,
  Shield,
  FileCode } from "lucide-react";
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
import { rolesService, RoleItem, PermissionItem } from "../api/services/roles.service.js";

export const RolesPage: React.FC = () => {
  const { addToast } = useToast();
  const { currentUser, isLoading: isAuthLoading } = useAuth();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab & search
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [roleToManagePermissions, setRoleToManagePermissions] = useState<RoleItem | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);

  // Form State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const [rRes, pRes] = await Promise.allSettled([
        rolesService.getRoles({ limit: 100 }),
        rolesService.getPermissions({ limit: 200 }),
      ]);

      if (rRes.status === "fulfilled") {
        const data = rRes.value.data;
        setRoles(Array.isArray(data) ? data : Array.isArray(rRes.value) ? (rRes.value as any) : []);
      } else {
        throw rRes.reason;
      }

      if (pRes.status === "fulfilled") {
        const pData = pRes.value.data;
        setPermissions(Array.isArray(pData) ? pData : Array.isArray(pRes.value) ? (pRes.value as any) : []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load roles and security permissions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadData();
  }, [currentUser?.id, isAuthLoading]);

  // Extract unique permission categories
  const permissionCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of permissions) {
      const cat = p.category || (p.name.includes(".") ? p.name.split(".")[0] : p.name.includes(":") ? p.name.split(":")[0] : "general");
      if (cat) cats.add(cat.toUpperCase());
    }
    return ["ALL", ...Array.from(cats).sort()];
  }, [permissions]);

  // Group permissions by module/category
  const permissionsByCategory = useMemo(() => {
    const map: Record<string, PermissionItem[]> = {};
    for (const p of permissions) {
      const cat = (p.category || (p.name.includes(".") ? p.name.split(".")[0] : p.name.includes(":") ? p.name.split(":")[0] : "general")).toUpperCase();
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    }
    return map;
  }, [permissions]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
      );
    });
  }, [roles, search]);

  // Filtered Permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const cat = (p.category || (p.name.includes(".") ? p.name.split(".")[0] : p.name.includes(":") ? p.name.split(":")[0] : "general")).toUpperCase();
      if (categoryFilter !== "ALL" && cat !== categoryFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [permissions, categoryFilter, search]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setModalError("Please enter a role name");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      await rolesService.createRole({
        name: newRoleName.trim().toUpperCase().replace(/\s+/g, "_"),
        description: newRoleDesc.trim() || undefined,
        permissionIds: selectedPermissionIds });

      addToast({
        type: "success",
        title: "Role Created",
        message: `Security role ${newRoleName.toUpperCase()} has been created.` });

      setIsCreateModalOpen(false);
      setNewRoleName("");
      setNewRoleDesc("");
      setSelectedPermissionIds([]);
      loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to create security role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openManagePermissions = async (role: RoleItem) => {
    setRoleToManagePermissions(role);
    // Determine existing permission IDs
    const existingPermIds: string[] = [];
    if (Array.isArray(role.permissions)) {
      for (const p of role.permissions) {
        if (typeof p === "string") existingPermIds.push(p);
        else if ((p as any).id) existingPermIds.push((p as any).id);
        else if ((p as any).permissionId) existingPermIds.push((p as any).permissionId);
        else if ((p as any).permission?.id) existingPermIds.push((p as any).permission.id);
      }
    }
    setSelectedPermissionIds(existingPermIds);
  };

  const handleSavePermissions = async () => {
    if (!roleToManagePermissions) return;
    setIsSubmitting(true);
    try {
      await rolesService.assignPermissions(roleToManagePermissions.id, selectedPermissionIds);
      addToast({
        type: "success",
        title: "Permissions Updated",
        message: `Assigned ${selectedPermissionIds.length} permissions to ${roleToManagePermissions.name}.` });
      setRoleToManagePermissions(null);
      loadData();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Update Failed",
        message: err.message || "Failed to assign permissions." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoleConfirm = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await rolesService.deleteRole(roleToDelete.id);
      addToast({
        type: "info",
        title: "Role Deleted",
        message: `Security role ${roleToDelete.name} has been removed.` });
      setRoleToDelete(null);
      loadData();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Deletion Prohibited",
        message: err.message || "Cannot delete this system role." });
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleCategoryPermissions = (categoryPerms: PermissionItem[]) => {
    const catIds = categoryPerms.map((p) => p.id);
    const allSelected = catIds.every((id) => selectedPermissionIds.includes(id));

    if (allSelected) {
      setSelectedPermissionIds((prev) => prev.filter((id) => !catIds.includes(id)));
    } else {
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...catIds])));
    }
  };

  return (
    <div className="space-y-6" id="roles-page-root">
      <PageHeader
        title="Roles & Security Governance"
        description="Role-Based Access Control (RBAC), fine-grained granular permissions, and tenant isolation policies."
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
              onClick={() => {
                setNewRoleName("");
                setNewRoleDesc("");
                setSelectedPermissionIds([]);
                setModalError(null);
                setIsCreateModalOpen(true);
              }}
            >
              Create Role
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "roles"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security Roles ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "permissions"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Permissions Registry ({permissions.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 border-border/60 bg-surface">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={activeTab === "roles" ? "Search roles by name, description..." : "Search permissions by key, module, action..."}
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

          {activeTab === "permissions" && (
            <div className="w-56">
              <Select
                options={permissionCategories.map((c) => ({
                  value: c,
                  label: c === "ALL" ? "All Categories" : c }))}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>
          )}
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
          </div>
        </Card>
      )}

      {/* ROLES TAB */}
      {!isLoading && !error && activeTab === "roles" && (
        <>
          {filteredRoles.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="w-10 h-10 text-gold/60" />}
              title={search ? "No matching roles found" : "No security roles configured"}
              description={search ? "Try adjusting your search criteria." : "Create custom roles to assign granular capabilities to users."}
              action={
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create First Role
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map((role) => {
                const isSystem = role.isSystem || ["OWNER", "ADMIN", "MEMBER"].includes(role.name.toUpperCase());
                const permCount = Array.isArray(role.permissions) ? role.permissions.length : 0;

                return (
                  <Card
                    key={role.id}
                    className="p-5 border-border/60 bg-surface flex flex-col justify-between hover:border-gold/40 transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-text flex items-center gap-1.5">
                              <span>{role.name}</span>
                              {isSystem && (
                                <Badge variant="neutral" className="text-sm">
                                  System
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-text-muted">
                              {role.userCount ?? role.usersCount ?? 0} assigned users
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
                        {role.description || "Custom enterprise organizational access role."}
                      </p>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-sm">
                        <Key className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="font-medium text-text">
                          {permCount > 0 ? `${permCount} Granular Permissions` : "Full Root Access / Configured via RBAC"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedRole(role)}
                      >
                        Inspect
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<Key className="w-3.5 h-3.5 text-gold" />}
                          onClick={() => openManagePermissions(role)}
                        >
                          Permissions
                        </Button>

                        {!isSystem && (
                          <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                            title="Delete Role"
                            onClick={() => setRoleToDelete(role)}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PERMISSIONS TAB */}
      {!isLoading && !error && activeTab === "permissions" && (
        <Card className="border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission Key</TableHead>
                <TableHead>Category / Module</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>System Protected</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredPermissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-sm text-text-muted">
                    No matching permissions found in registry.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPermissions.map((perm) => {
                  const cat = (perm.category || (perm.name.includes(".") ? perm.name.split(".")[0] : perm.name.includes(":") ? perm.name.split(":")[0] : "general")).toUpperCase();

                  return (
                    <TableRow key={perm.id} className="hover:bg-surface-hover/50 transition-colors">
                      <TableCell>
                        <div className="font-mono text-sm font-semibold text-gold flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 shrink-0" />
                          <span>{perm.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">{cat}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-text">{perm.description || "System authority grant."}</span>
                      </TableCell>
                      <TableCell>
                        {perm.isSystem ? (
                          <Badge variant="neutral">Core Guard</Badge>
                        ) : (
                          <span className="text-sm text-text-muted">Dynamic</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Create Role Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Custom Security Role"
        size="lg"
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-sm text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="space-y-3">
            <Input
              label="Role Identifier Name *"
              required
              placeholder="e.g. AUDIT_OFFICER, PROJECT_LEAD"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
            />

            <Textarea
              label="Role Description & Purpose"
              placeholder="Describe access privileges and scope of operational responsibility..."
              rows={2}
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text uppercase tracking-wider">
                Assign Granular Permissions ({selectedPermissionIds.length} selected)
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedPermissionIds.length === permissions.length) {
                    setSelectedPermissionIds([]);
                  } else {
                    setSelectedPermissionIds(permissions.map((p) => p.id));
                  }
                }}
                className="text-sm text-gold hover:underline"
              >
                {selectedPermissionIds.length === permissions.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-4 p-3 bg-surface-hover/40 rounded-xl border border-border/60">
              {(Object.entries(permissionsByCategory) as [string, PermissionItem[]][]).map(([category, perms]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-muted">{category}</span>
                    <button
                      type="button"
                      onClick={() => toggleCategoryPermissions(perms)}
                      className="text-sm text-gold hover:underline"
                    >
                      Toggle Group
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((p) => {
                      const isSelected = selectedPermissionIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => togglePermission(p.id)}
                          className={`p-2 rounded-lg border text-sm cursor-pointer flex items-start gap-2 transition-all ${
                            isSelected
                              ? "bg-gold/10 border-gold/40 text-text"
                              : "bg-surface border-border/60 text-text-muted hover:border-border"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-gold" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-text-muted" />
                            )}
                          </div>
                          <div>
                            <div className="font-mono text-sm font-semibold text-text">{p.name}</div>
                            {p.description && (
                              <div className="text-sm text-text-muted line-clamp-1">{p.description}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              Create Security Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Permissions Modal */}
      <Modal
        isOpen={!!roleToManagePermissions}
        onClose={() => setRoleToManagePermissions(null)}
        title={`Assign Permissions to ${roleToManagePermissions?.name}`}
        size="lg"
      >
        {roleToManagePermissions && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Configure fine-grained system capabilities granted to users holding the{" "}
              <span className="font-semibold text-gold">{roleToManagePermissions.name}</span> role.
            </p>

            <div className="max-h-80 overflow-y-auto space-y-4 p-3 bg-surface-hover/40 rounded-xl border border-border/60">
              {(Object.entries(permissionsByCategory) as [string, PermissionItem[]][]).map(([category, perms]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-muted">{category}</span>
                    <button
                      type="button"
                      onClick={() => toggleCategoryPermissions(perms)}
                      className="text-sm text-gold hover:underline"
                    >
                      Toggle Group
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((p) => {
                      const isSelected = selectedPermissionIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => togglePermission(p.id)}
                          className={`p-2 rounded-lg border text-sm cursor-pointer flex items-start gap-2 transition-all ${
                            isSelected
                              ? "bg-gold/10 border-gold/40 text-text"
                              : "bg-surface border-border/60 text-text-muted hover:border-border"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-gold" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-text-muted" />
                            )}
                          </div>
                          <div>
                            <div className="font-mono text-sm font-semibold text-text">{p.name}</div>
                            {p.description && (
                              <div className="text-sm text-text-muted line-clamp-1">{p.description}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRoleToManagePermissions(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleSavePermissions}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Save Assigned Permissions
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Role Inspection Modal */}
      <Modal
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title="Role Inspection & RBAC Policy"
        size="md"
      >
        {selectedRole && (
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-surface-hover/60 rounded-xl border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-base text-text">{selectedRole.name}</div>
                  <div className="text-sm text-text-muted">
                    {selectedRole.userCount ?? selectedRole.usersCount ?? 0} assigned accounts
                  </div>
                </div>
              </div>
              <Badge variant="gold">RBAC Guard</Badge>
            </div>

            <div className="space-y-1">
              <span className="text-text-muted font-semibold">Description:</span>
              <p className="text-text leading-relaxed">
                {selectedRole.description || "Standard organization security role."}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-text-muted font-semibold block">Attached Permissions:</span>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-surface rounded-lg border border-border/60">
                {Array.isArray(selectedRole.permissions) && selectedRole.permissions.length > 0 ? (
                  selectedRole.permissions.map((p: any, idx: number) => {
                    const name = typeof p === "string" ? p : p.name || p.permission?.name || `perm-${idx}`;
                    return (
                      <span key={idx} className="font-mono text-sm bg-surface-hover px-2 py-0.5 rounded text-gold">
                        {name}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-text-muted">No explicit granular grants attached.</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedRole(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Role Confirmation */}
      <ConfirmModal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleDeleteRoleConfirm}
        title="Delete Custom Security Role"
        message={`Are you sure you want to remove role ${roleToDelete?.name}? Users currently assigned to this role will need to be reassigned.`}
        confirmText="Delete Role"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
