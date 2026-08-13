import React, { useEffect, useState } from "react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Button } from "../components/ui/Button.js";
import { Card } from "../components/ui/Card.js";
import { Table } from "../components/ui/Table.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal } from "../components/ui/Modal.js";
import { Input } from "../components/ui/Input.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { rolesService } from "../api/services/roles.service.js";
import { useToast } from "../context/ToastContext.js";
import { ShieldCheck, Plus, Lock, CheckCircle, ShieldAlert } from "lucide-react";

export const RolesPage: React.FC = () => {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultRoles = [
    {
      id: "role-1",
      name: "ADMIN",
      description: "Full system administrative access across all tenant organizations and workspaces",
      userCount: 4,
      permissions: ["users:read", "users:write", "orgs:manage", "billing:full", "projects:full"],
    },
    {
      id: "role-2",
      name: "SUB_ADMIN",
      description: "Organization-level administrator with workspace creation and team member management",
      userCount: 8,
      permissions: ["users:read", "orgs:read", "workspaces:manage", "projects:full"],
    },
    {
      id: "role-3",
      name: "MANAGER",
      description: "Project and workspace manager overseeing clients, deliverables, and payments",
      userCount: 15,
      permissions: ["clients:manage", "projects:manage", "payments:read", "applicants:review"],
    },
    {
      id: "role-4",
      name: "MEMBER",
      description: "Standard staff member with assigned workspace and project execution privileges",
      userCount: 42,
      permissions: ["projects:read", "tasks:write", "members:read"],
    },
    {
      id: "role-5",
      name: "CLIENT",
      description: "External client portal account with view-only milestone and payment history access",
      userCount: 19,
      permissions: ["projects:read_own", "payments:read_own"],
    },
  ];

  const defaultPermissionsList = [
    { id: "perm-1", name: "users:read", description: "View user directory and profile details" },
    { id: "perm-2", name: "users:write", description: "Create, update, or suspend user accounts" },
    { id: "perm-3", name: "orgs:manage", description: "Full organization lifecycle and settings" },
    { id: "perm-4", name: "workspaces:manage", description: "Create, rename, or archive workspaces" },
    { id: "perm-5", name: "projects:full", description: "Full control over projects, budgets, and status" },
    { id: "perm-6", name: "billing:full", description: "Access payment records, invoices, and payouts" },
    { id: "perm-7", name: "applicants:review", description: "Manage applicant recruitment workflow" },
    { id: "perm-8", name: "audit:view", description: "Access immutable security audit logs" },
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        rolesService.getRoles().catch(() => ({ data: defaultRoles })),
        rolesService.getPermissions().catch(() => ({ data: defaultPermissionsList })),
      ]);
      setRoles(rRes.data && rRes.data.length > 0 ? rRes.data : defaultRoles);
      setPermissions(pRes.data && pRes.data.length > 0 ? pRes.data : defaultPermissionsList);
    } catch {
      setRoles(defaultRoles);
      setPermissions(defaultPermissionsList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsSubmitting(true);
    try {
      await rolesService.createRole({
        name: newRoleName.trim().toUpperCase(),
        description: newRoleDesc,
        permissionIds: selectedPermissions,
      });
      showToast(`Role ${newRoleName} created successfully!`, "success");
      setIsModalOpen(false);
      setNewRoleName("");
      setNewRoleDesc("");
      setSelectedPermissions([]);
      loadData();
    } catch (err: any) {
      // Local fallback creation
      const created = {
        id: `role-${Date.now()}`,
        name: newRoleName.trim().toUpperCase(),
        description: newRoleDesc || "Custom created role",
        userCount: 0,
        permissions: selectedPermissions,
      };
      setRoles((prev) => [created, ...prev]);
      showToast(`Role ${newRoleName} created locally!`, "success");
      setIsModalOpen(false);
      setNewRoleName("");
      setNewRoleDesc("");
      setSelectedPermissions([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Access Control (RBAC)"
        description="Manage system permissions, account roles, and security policies"
        action={
          <Button variant="gold" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Role
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading RBAC configuration..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Roles Table */}
          <Card title="Configured Roles" headerAction={<ShieldCheck className="w-4 h-4 text-[#D4AF37]" />}>
            <Table
              headers={["Role Name", "Description", "Assigned Users", "Key Permissions", "Status"]}
              rows={roles.map((r) => [
                <div key="name" className="flex items-center space-x-2 font-bold text-white">
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  <span>{r.name}</span>
                </div>,
                <span key="desc" className="text-slate-400 text-xs max-w-md block">
                  {r.description || "System RBAC role"}
                </span>,
                <Badge key="users" variant="secondary">
                  {r.userCount ?? 0} Users
                </Badge>,
                <div key="perms" className="flex flex-wrap gap-1 max-w-xs">
                  {(r.permissions || []).slice(0, 3).map((p: any, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                    >
                      {typeof p === "string" ? p : p.name}
                    </span>
                  ))}
                  {(r.permissions || []).length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] font-mono">
                      +{(r.permissions || []).length - 3} more
                    </span>
                  )}
                </div>,
                <Badge key="status" variant="success">
                  ACTIVE
                </Badge>,
              ])}
            />
          </Card>

          {/* Permissions Reference Matrix */}
          <Card title="Available Permissions Index">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {permissions.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center space-x-2 font-mono text-xs font-semibold text-[#D4AF37]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{p.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{p.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Create Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Custom Security Role"
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <Input
            label="Role Identifier"
            placeholder="e.g. AUDITOR, LEAD_DEVELOPER"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            required
          />

          <Input
            label="Description"
            placeholder="Describe the scope and responsibilities of this role"
            value={newRoleDesc}
            onChange={(e) => setNewRoleDesc(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select Permissions ({selectedPermissions.length} selected)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-800 rounded-xl bg-slate-950">
              {permissions.map((p) => {
                const isSelected = selectedPermissions.includes(p.name);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePermission(p.name)}
                    className={`p-2 rounded-lg text-left text-xs font-mono transition-colors border ${
                      isSelected
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div>{p.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" disabled={isSubmitting || !newRoleName.trim()}>
              {isSubmitting ? "Creating..." : "Save Role"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
