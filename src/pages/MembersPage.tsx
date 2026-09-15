import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Edit2,
  Eye,
  AlertCircle,
  RefreshCw,
  Award,
  Plus,
  KeyRound,
  Layers } from "lucide-react";
import { TeamHierarchyTree } from "../components/hierarchy/TeamHierarchyTree.js";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../components/ui/Table.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge, Avatar } from "../components/ui/Badge.js";
import { Card } from "../components/ui/Card.js";
import { Modal, ConfirmModal } from "../components/ui/Modal.js";
import { Input, PasswordInput } from "../components/ui/Input.js";
import { Select } from "../components/ui/Select.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { Skeleton } from "../components/ui/LoadingSpinner.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { membersService } from "../api/services/members.service.js";
import { usersService } from "../api/services/users.service.js";
import { organizationsService } from "../api/services/organizations.service.js";
import { AccountType, UserStatus } from "../types/index.js";

const ROLE_FILTER_OPTIONS = [
  { value: "ALL", label: "All Account Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUB_ADMIN", label: "Sub-Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "MEMBER", label: "Member" },
  { value: "CLIENT", label: "Client" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

export const MembersPage: React.FC = () => {
  const { currentOrganization, currentUser, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeView, setActiveView] = useState<"directory" | "hierarchy">(
    urlTab === "hierarchy" ? "hierarchy" : "directory"
  );

  useEffect(() => {
    if (urlTab === "hierarchy") {
      setActiveView("hierarchy");
    } else if (urlTab === "directory") {
      setActiveView("directory");
    }
  }, [urlTab]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [memberToEditRole, setMemberToEditRole] = useState<any | null>(null);
  const [memberToEditStatus, setMemberToEditStatus] = useState<any | null>(null);
  const [memberToResetPassword, setMemberToResetPassword] = useState<any | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);

  // Create User Form State
  const [createFullName, setCreateFullName] = useState("");
  const [createUserId, setCreateUserId] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<AccountType>("MEMBER");
  const [createStatus, setCreateStatus] = useState<UserStatus>("ACTIVE");

  // Invite & Update Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [newRole, setNewRole] = useState("MEMBER");
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [statusReason, setStatusReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const actorRole = (currentUser?.accountType || "MEMBER").toUpperCase();
  const isActorAdmin = actorRole === "ADMIN";
  const isActorSubAdmin = actorRole === "SUB_ADMIN";
  const canManageUsers = isActorAdmin || isActorSubAdmin;

  // Role options allowed for actor to assign:
  // Admin: SUB_ADMIN, MANAGER, MEMBER, CLIENT
  // Sub-Admin: MANAGER, MEMBER, CLIENT (cannot assign Admin or Sub-Admin)
  const assignableRoles = useMemo(() => {
    if (isActorAdmin) {
      return [
        { value: "MEMBER", label: "Member (Standard Team Role)" },
        { value: "MANAGER", label: "Manager (Project & Staff Lead)" },
        { value: "SUB_ADMIN", label: "Sub-Admin (Operational Supervisor)" },
        { value: "CLIENT", label: "Client (Portal Access)" },
      ];
    }
    if (isActorSubAdmin) {
      return [
        { value: "MEMBER", label: "Member (Standard Team Role)" },
        { value: "MANAGER", label: "Manager (Project & Staff Lead)" },
        { value: "CLIENT", label: "Client (Portal Access)" },
      ];
    }
    return [{ value: "MEMBER", label: "Member (Standard Team Role)" }];
  }, [isActorAdmin, isActorSubAdmin]);

  const canActorManageTarget = (targetRole: string, targetUserId: string) => {
    if (targetUserId === currentUser?.id) return false; // Self-protection
    const tr = (targetRole || "").toUpperCase();
    if (isActorAdmin) return true;
    if (isActorSubAdmin) {
      // Sub-admin can only manage MANAGER, MEMBER, CLIENT
      return tr === "MANAGER" || tr === "MEMBER" || tr === "CLIENT";
    }
    return false;
  };

  const loadMembers = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      // Try usersService first for complete database user roster
      let items: any[] = [];
      try {
        const usersRes = await usersService.getAll({ limit: 100 });
        if (Array.isArray(usersRes.data)) {
          items = usersRes.data.map((u: any) => ({
            id: u.id,
            userId: u.id,
            email: u.email,
            fullName: u.profile?.fullName || u.email.split("@")[0],
            accountType: u.accountType,
            status: u.status,
            role: { name: u.accountType },
            user: u,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt }));
        }
      } catch {
        // Fallback to org members
        if (currentOrganization?.id) {
          const orgRes = await organizationsService.getMembers(currentOrganization.id);
          if (Array.isArray(orgRes.data)) {
            items = orgRes.data;
          }
        }
      }

      if (items.length === 0) {
        const memRes = await membersService.getAll({ limit: 100 });
        if (Array.isArray(memRes.data)) {
          items = memRes.data;
        } else if (Array.isArray((memRes as any)?.items)) {
          items = (memRes as any).items;
        }
      }

      setMembers(items);
    } catch (err: any) {
      setError(err.message || "Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadMembers();
  }, [currentOrganization?.id, currentUser?.id, isAuthLoading]);

  // Statistics derived purely from real fetched records
  const stats = useMemo(() => {
    let total = members.length;
    let active = 0;
    let leadership = 0;
    let suspended = 0;

    for (const m of members) {
      const status = (m.status || m.user?.status || "ACTIVE").toUpperCase();
      const role = (m.role?.name || m.user?.accountType || m.accountType || "MEMBER").toUpperCase();

      if (status === "ACTIVE") active++;
      else if (status === "SUSPENDED" || status === "INACTIVE") suspended++;

      if (role === "OWNER" || role === "ADMIN" || role === "SUB_ADMIN" || role === "MANAGER") {
        leadership++;
      }
    }

    return { total, active, leadership, suspended };
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const email = (m.user?.email || m.email || "").toLowerCase();
      const name = (m.user?.profile?.fullName || m.fullName || m.name || "").toLowerCase();
      const role = (m.role?.name || m.user?.accountType || m.accountType || "MEMBER").toUpperCase();
      const status = (m.status || m.user?.status || "ACTIVE").toUpperCase();
      const phone = (m.user?.profile?.phoneNumber || m.phoneNumber || "").toLowerCase();
      const city = (m.user?.profile?.city || m.city || "").toLowerCase();

      if (roleFilter !== "ALL" && role !== roleFilter) return false;
      if (statusFilter !== "ALL" && status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !city.includes(q) && !role.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [members, roleFilter, statusFilter, search]);

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUserId = createUserId.trim();
    const cleanEmail = createEmail.trim();

    if (!cleanUserId && !cleanEmail) {
      setModalError("Please specify a User ID / Username or an Email address.");
      return;
    }
    if (!createPassword.trim()) {
      setModalError("Please specify an initial password.");
      return;
    }
    if (createPassword.length < 8) {
      setModalError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      await usersService.create({
        id: cleanUserId || undefined,
        userId: cleanUserId || undefined,
        email: cleanEmail || undefined,
        password: createPassword,
        accountType: createRole,
        status: createStatus,
        profile: {
          fullName: createFullName.trim() || undefined } });

      const identifierDisplay = cleanUserId ? `User ID ${cleanUserId}` : cleanEmail;
      addToast({
        type: "success",
        title: "User Account Provisioned",
        message: `Successfully created ${createRole} account for ${identifierDisplay}.` });

      setIsCreateUserModalOpen(false);
      setCreateFullName("");
      setCreateUserId("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("MEMBER");
      setCreateStatus("ACTIVE");
      loadMembers();
    } catch (err: any) {
      setModalError(err.data?.message || err.message || "Failed to create user account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentOrganization) {
      setModalError("Please specify a valid recipient email address.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      await organizationsService.inviteMember(currentOrganization.id, {
        email: inviteEmail.trim(),
        role: inviteRole });

      addToast({
        type: "success",
        title: "Invitation Dispatched",
        message: `An invitation to join ${currentOrganization.name} has been sent to ${inviteEmail}.` });

      setIsInviteModalOpen(false);
      setInviteEmail("");
      setInviteRole("MEMBER");
      loadMembers();
    } catch (err: any) {
      setModalError(err.message || "Failed to dispatch organization invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleUpdateSubmit = async () => {
    if (!memberToEditRole) return;
    setIsSubmitting(true);
    try {
      const targetUserId = memberToEditRole.user?.id || memberToEditRole.userId || memberToEditRole.id;
      
      try {
        await usersService.updateRole(targetUserId, { accountType: newRole as AccountType });
      } catch {
        if (currentOrganization?.id) {
          await organizationsService.updateMemberRole(currentOrganization.id, targetUserId, newRole);
        } else {
          await membersService.updateRank(memberToEditRole.id, newRole);
        }
      }

      addToast({
        type: "success",
        title: "Role Updated",
        message: `Account role transitioned to ${newRole}.` });
      setMemberToEditRole(null);
      loadMembers();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Role Update Failed",
        message: err.message || "Could not update user role." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdateSubmit = async () => {
    if (!memberToEditStatus) return;
    setIsSubmitting(true);
    try {
      const targetUserId = memberToEditStatus.user?.id || memberToEditStatus.userId || memberToEditStatus.id;
      
      try {
        await usersService.updateStatus(targetUserId, newStatus as UserStatus);
      } catch {
        await membersService.updateStatus(memberToEditStatus.id, newStatus, statusReason.trim() || undefined);
      }

      addToast({
        type: "success",
        title: "Status Updated",
        message: `Member status updated to ${newStatus}.` });
      setMemberToEditStatus(null);
      setStatusReason("");
      loadMembers();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Status Update Failed",
        message: err.message || "Could not update member status." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToResetPassword) return;
    if (!resetPasswordValue || resetPasswordValue.length < 8) {
      setModalError("New password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      const targetUserId = memberToResetPassword.user?.id || memberToResetPassword.userId || memberToResetPassword.id;
      await usersService.resetPassword(targetUserId, resetPasswordValue);

      addToast({
        type: "success",
        title: "Password Reset Complete",
        message: `Password has been reset for ${memberToResetPassword.user?.profile?.fullName || memberToResetPassword.fullName || memberToResetPassword.email || targetUserId}. Previous sessions have been revoked.` });

      setMemberToResetPassword(null);
      setResetPasswordValue("");
    } catch (err: any) {
      setModalError(err.data?.message || err.message || "Failed to reset user password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      const targetUserId = memberToRemove.user?.id || memberToRemove.userId || memberToRemove.id;
      
      try {
        await usersService.delete(targetUserId);
      } catch {
        if (currentOrganization?.id) {
          await organizationsService.removeMember(currentOrganization.id, targetUserId);
        }
      }

      addToast({
        type: "info",
        title: "Member Deleted",
        message: "User account was removed from the system." });
      setMemberToRemove(null);
      loadMembers();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Removal Failed",
        message: err.message || "Failed to remove user account." });
    } finally {
      setIsRemoving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = (role || "").toUpperCase();
    switch (r) {
      case "OWNER":
      case "ADMIN":
        return <Badge variant="gold"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
      case "SUB_ADMIN":
        return <Badge variant="info"><Shield className="w-3 h-3 mr-1" /> Sub-Admin</Badge>;
      case "MANAGER":
        return <Badge variant="info"><Award className="w-3 h-3 mr-1" /> Manager</Badge>;
      case "CLIENT":
        return <Badge variant="neutral">Client</Badge>;
      case "MEMBER":
      default:
        return <Badge variant="neutral">Member</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "SUSPENDED":
        return <Badge variant="danger">Suspended</Badge>;
      case "INACTIVE":
      default:
        return <Badge variant="neutral">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6" id="members-page-root">
      <PageHeader
        title="User & Workforce Governance"
        description="Enterprise user accounts, role hierarchy enforcement, security access controls, and organization rosters."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={loadMembers}
              disabled={isLoading}
            >
              Refresh
            </Button>
            {canManageUsers && (
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setModalError(null);
                  setIsCreateUserModalOpen(true);
                }}
              >
                Create User
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4 text-[#D4AF37]" />}
              onClick={() => {
                setModalError(null);
                setIsInviteModalOpen(true);
              }}
            >
              Invite Member
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="members-kpi-summary">
        <Card className="p-5 border-border/60 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-text">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.total}</div>
            <p className="text-xs text-text-muted mt-1">Platform user accounts</p>
          </div>
        </Card>

        <Card className="p-5 border-emerald-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Active Status</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.active}</div>
            <p className="text-xs text-text-muted mt-1">Full operational access</p>
          </div>
        </Card>

        <Card className="p-5 border-amber-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Leadership & Admins</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.leadership}</div>
            <p className="text-xs text-text-muted mt-1">Privileged role holders</p>
          </div>
        </Card>

        <Card className="p-5 border-rose-500/20 bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Suspended / Inactive</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.suspended}</div>
            <p className="text-xs text-text-muted mt-1">Access restricted</p>
          </div>
        </Card>
      </div>

      {/* View Switcher: Directory vs Team Hierarchy */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveView("directory");
            setSearchParams({});
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === "directory"
              ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm"
              : "text-text-muted hover:text-text hover:bg-surface-hover/70"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts Directory</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
            {filteredMembers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveView("hierarchy");
            setSearchParams({ tab: "hierarchy" });
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === "hierarchy"
              ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm"
              : "text-text-muted hover:text-text hover:bg-surface-hover/70"
          }`}
        >
          <Layers className="w-4 h-4 text-[#D4AF37]" />
          <span>Team Hierarchy Tree</span>
          <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] font-mono font-bold">
            Live DB
          </span>
        </button>
      </div>

      {activeView === "hierarchy" ? (
        <TeamHierarchyTree
          onSelectUser={(node) => {
            const found = members.find((m) => {
              const uId = m.user?.id || m.userId || m.id;
              return uId === node.id || m.id === node.id;
            });
            if (found) {
              setSelectedMember(found);
            } else {
              setSearch(node.loginId || node.name);
              setActiveView("directory");
            }
          }}
        />
      ) : (
        <>
          {/* Filter and Search Bar */}
      <Card className="p-4 border-border/60 bg-surface">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, phone, location..."
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
                options={ROLE_FILTER_OPTIONS}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              />
            </div>
            <div className="w-44">
              <Select
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && <ErrorState message={error} onRetry={loadMembers} />}

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

      {/* Empty State */}
      {!isLoading && !error && filteredMembers.length === 0 && (
        <EmptyState
          icon={<Users className="w-10 h-10 text-gold/60" />}
          title={search || roleFilter !== "ALL" || statusFilter !== "ALL" ? "No matching users found" : "No users registered in system"}
          description={
            search || roleFilter !== "ALL" || statusFilter !== "ALL"
              ? "Try adjusting your search criteria, role, or status filter."
              : "Create user accounts or invite collaborators to start managing permissions."
          }
          action={
            canManageUsers ? (
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCreateUserModalOpen(true)}
              >
                Create First User
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Desktop Table View */}
      {!isLoading && !error && filteredMembers.length > 0 && (
        <>
          <div className="hidden md:block">
            <Card className="border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Account Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {filteredMembers.map((member) => {
                    const targetUserId = member.user?.id || member.userId || member.id;
                    const name = member.user?.profile?.fullName || member.fullName || member.name || "Unnamed User";
                    const email = member.user?.email || member.email || "No email";
                    const role = member.role?.name || member.user?.accountType || member.accountType || "MEMBER";
                    const status = member.status || member.user?.status || "ACTIVE";
                    const isSelf = targetUserId === currentUser?.id;
                    const canEdit = canManageUsers && canActorManageTarget(role, targetUserId);

                    return (
                      <TableRow key={member.id} className="hover:bg-surface-hover/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar name={name} size="sm" />
                            <div>
                              <div className="font-semibold text-sm text-text flex items-center gap-1.5">
                                <span>{name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-mono font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="font-mono text-[11px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                                  ID: {targetUserId}
                                </span>
                                {email && !email.endsWith("@st-solutions.internal") && (
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <Mail className="w-3 h-3 text-gold/80" /> {email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{getRoleBadge(role)}</TableCell>
                        <TableCell>{getStatusBadge(status)}</TableCell>

                        <TableCell>
                          <div className="text-xs text-text">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-4 h-4" />}
                              title="Inspect Details"
                              onClick={() => setSelectedMember(member)}
                            />

                            {canEdit && (
                              <>
                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  icon={<Shield className="w-4 h-4 text-gold" />}
                                  title="Edit Role"
                                  onClick={() => {
                                    setMemberToEditRole(member);
                                    setNewRole(role);
                                  }}
                                />

                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  icon={<Edit2 className="w-4 h-4 text-blue-500" />}
                                  title="Edit Status"
                                  onClick={() => {
                                    setMemberToEditStatus(member);
                                    setNewStatus(status);
                                  }}
                                />

                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  icon={<KeyRound className="w-4 h-4 text-amber-500" />}
                                  title="Reset Password"
                                  onClick={() => {
                                    setModalError(null);
                                    setResetPasswordValue("");
                                    setMemberToResetPassword(member);
                                  }}
                                />

                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                                  title="Delete User"
                                  onClick={() => setMemberToRemove(member)}
                                />
                              </>
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

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredMembers.map((member) => {
              const targetUserId = member.user?.id || member.userId || member.id;
              const name = member.user?.profile?.fullName || member.fullName || member.name || "Unnamed User";
              const email = member.user?.email || member.email || "No email";
              const role = member.role?.name || member.user?.accountType || member.accountType || "MEMBER";
              const status = member.status || member.user?.status || "ACTIVE";
              const isSelf = targetUserId === currentUser?.id;
              const canEdit = canManageUsers && canActorManageTarget(role, targetUserId);

              return (
                <Card key={member.id} className="p-4 border-border/60 bg-surface space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={name} size="sm" />
                      <div>
                        <div className="font-semibold text-sm text-text flex items-center gap-1.5">
                          <span>{name}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-mono font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">{email}</div>
                      </div>
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <div>{getRoleBadge(role)}</div>
                    <div className="flex items-center gap-1">
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        title="Inspect Details"
                        onClick={() => setSelectedMember(member)}
                      />
                      {canEdit && (
                        <>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Shield className="w-4 h-4 text-gold" />}
                            title="Edit Role"
                            onClick={() => {
                              setMemberToEditRole(member);
                              setNewRole(role);
                            }}
                          />
                          <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Edit2 className="w-4 h-4" />}
                            title="Edit Status"
                            onClick={() => {
                              setMemberToEditStatus(member);
                              setNewStatus(status);
                            }}
                          />
                          <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<KeyRound className="w-4 h-4 text-amber-500" />}
                            title="Reset Password"
                            onClick={() => {
                              setModalError(null);
                              setResetPasswordValue("");
                              setMemberToResetPassword(member);
                            }}
                          />
                          <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                            title="Delete User"
                            onClick={() => setMemberToRemove(member)}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
        </>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        title="Provision Enterprise User Account"
        size="md"
      >
        <form onSubmit={handleCreateUserSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-[#D4AF37] block">Administrative Provisioning Policy:</span>
            <span>
              {isActorAdmin
                ? "As Root Administrator, you can provision Sub-Administrators, Managers, Members, and Clients."
                : "As Sub-Administrator, you can provision Managers, Members, and Clients."}
            </span>
          </div>

          <Input
            label="Full Name *"
            required
            placeholder="e.g. Alex Morgan"
            value={createFullName}
            onChange={(e) => {
              setCreateFullName(e.target.value);
              if (!createUserId) {
                const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 15);
                if (slug) setCreateUserId(`user-${slug}`);
              }
            }}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                User ID / Username <span className="text-amber-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const prefix = createRole.toLowerCase();
                  const rand = Math.random().toString(36).substring(2, 6);
                  setCreateUserId(`user-${prefix}-${rand}`);
                }}
                className="text-[11px] text-[#D4AF37] hover:underline font-mono"
              >
                + Auto-Generate ID
              </button>
            </div>
            <Input
              placeholder="e.g. user-manager-02 or alex.morgan"
              value={createUserId}
              onChange={(e) => setCreateUserId(e.target.value)}
              hint="Managers and Members can sign in using this User ID or their Email."
            />
          </div>

          <Input
            label="Email Address (Optional if User ID is set)"
            type="email"
            placeholder="alex.morgan@st-solutions.io"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            hint="Used for notifications and alternate login identifier."
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Initial Password <span className="text-amber-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
                  let pass = "ST@";
                  for (let i = 0; i < 8; i++) {
                    pass += chars.charAt(Math.floor(Math.random() * chars.length));
                  }
                  setCreatePassword(pass);
                }}
                className="text-[11px] text-[#D4AF37] hover:underline font-mono"
              >
                + Generate Strong Password
              </button>
            </div>
            <PasswordInput
              required
              placeholder="Minimum 8 characters"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Account Role *"
              options={assignableRoles}
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as AccountType)}
            />

            <Select
              label="Initial Status *"
              options={[
                { value: "ACTIVE", label: "Active (Immediate Access)" },
                { value: "INACTIVE", label: "Inactive (Dormant)" },
                { value: "SUSPENDED", label: "Suspended (Locked)" },
              ]}
              value={createStatus}
              onChange={(e) => setCreateStatus(e.target.value as UserStatus)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateUserModalOpen(false)}
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
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        size="md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <p className="text-xs text-text-muted">
            Send an invitation link to onboard a new collaborator into{" "}
            <span className="font-semibold text-text">{currentOrganization?.name || "your organization"}</span>.
          </p>

          <Input
            label="Recipient Email Address *"
            type="email"
            required
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />

          <Select
            label="Assigned Access Role *"
            options={assignableRoles}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
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
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Member Details Inspection Modal */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title="User Profile & Security Scope Inspection"
        size="lg"
      >
        {selectedMember && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface-hover/60 rounded-xl border border-border/60">
              <div className="flex items-center gap-3">
                <Avatar
                  name={selectedMember.user?.profile?.fullName || selectedMember.fullName || selectedMember.name || "Member"}
                  size="md"
                />
                <div>
                  <div className="text-base font-bold text-text">
                    {selectedMember.user?.profile?.fullName || selectedMember.fullName || selectedMember.name || "Unnamed User"}
                  </div>
                  <div className="text-xs text-text-muted">
                    {selectedMember.user?.email || selectedMember.email}
                  </div>
                </div>
              </div>
              <div>{getStatusBadge(selectedMember.status || selectedMember.user?.status || "ACTIVE")}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-surface border border-border/60 space-y-1">
                <span className="text-text-muted block">Account Type / Hierarchy:</span>
                <div>
                  {getRoleBadge(selectedMember.role?.name || selectedMember.user?.accountType || selectedMember.accountType || "MEMBER")}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border/60 space-y-1">
                <span className="text-text-muted block">Database User ID:</span>
                <div className="text-text font-mono text-[11px] select-all font-semibold">
                  {selectedMember.user?.id || selectedMember.userId || selectedMember.id}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border/60 space-y-1">
                <span className="text-text-muted block">Account Creation Timestamp:</span>
                <div className="text-text font-medium">
                  {new Date(selectedMember.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border/60 space-y-1">
                <span className="text-text-muted block">Last Record Update:</span>
                <div className="text-text font-medium">
                  {new Date(selectedMember.updatedAt || selectedMember.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border/60 space-y-1">
                <span className="text-text-muted block">Contact Phone:</span>
                <div className="text-text font-medium">
                  {selectedMember.user?.profile?.phoneNumber || selectedMember.phoneNumber || "Not registered"}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border/60 space-y-1">
                <span className="text-text-muted block">Location / City:</span>
                <div className="text-text font-medium">
                  {selectedMember.user?.profile?.city || selectedMember.city
                    ? `${selectedMember.user?.profile?.city || selectedMember.city}, ${selectedMember.user?.profile?.country || selectedMember.country || ""}`
                    : "Not specified"}
                </div>
              </div>
            </div>

            {/* Hierarchy & Supervisor Chain */}
            {(selectedMember.hierarchy || selectedMember.user?.hierarchy) && (
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Organizational Hierarchy & Line Management
                  </span>
                  <span className="text-[11px] text-[#B88E20] font-medium font-mono">
                    Live Structure
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Direct Supervisor / Manager</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {(selectedMember.hierarchy || selectedMember.user?.hierarchy)?.supervisor?.fullName ||
                        (selectedMember.hierarchy || selectedMember.user?.hierarchy)?.supervisor?.email ||
                        "Root / Executive Leadership"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Direct Subordinates</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {(selectedMember.hierarchy || selectedMember.user?.hierarchy)?.managedUsersCount || 0} Direct Report(s)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Work & Portfolio Metrics */}
            {(selectedMember.work || selectedMember.user?.work) && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Assigned Portfolio & Performance
                  </span>
                  <span className="text-[11px] text-emerald-500 font-medium font-mono">
                    Score: {(selectedMember.work || selectedMember.user?.work)?.performanceScore ?? 100}%
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Managed Clients</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {(selectedMember.work || selectedMember.user?.work)?.assignedClientsCount || 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Active Projects</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {(selectedMember.work || selectedMember.user?.work)?.activeProjectsCount || 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block">Member Rank</span>
                    <span className="text-xs font-bold text-[#D4AF37]">
                      {(selectedMember.hierarchy || selectedMember.user?.hierarchy)?.memberAccount?.rankName || "Standard Tier"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#D4AF37] block">Credential Protection & Hashing:</span>
                <span>User passwords are securely encrypted using bcrypt (12 rounds) in PostgreSQL. Plaintext passwords cannot be decrypted. To issue a new credential, use the Administrative Password Reset workflow below.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <div className="flex items-center gap-2">
                {canManageUsers && canActorManageTarget(selectedMember.role?.name || selectedMember.user?.accountType || selectedMember.accountType, selectedMember.user?.id || selectedMember.userId || selectedMember.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<KeyRound className="w-4 h-4 text-amber-500" />}
                    onClick={() => {
                      const m = selectedMember;
                      setSelectedMember(null);
                      setModalError(null);
                      setResetPasswordValue("");
                      setMemberToResetPassword(m);
                    }}
                  >
                    Reset Password
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Admin Reset Password Modal */}
      <Modal
        isOpen={!!memberToResetPassword}
        onClose={() => setMemberToResetPassword(null)}
        title="Administrative Password Reset"
        size="md"
      >
        {memberToResetPassword && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <p className="text-xs text-text-muted">
              Provisioning a new credential for{" "}
              <span className="font-semibold text-text">
                {memberToResetPassword.user?.profile?.fullName || memberToResetPassword.fullName || memberToResetPassword.email || "this user"}
              </span>. This will immediately invalidate all active sessions for this account in the database.
            </p>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  New Temporary Password <span className="text-amber-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
                    let pass = "ST@";
                    for (let i = 0; i < 8; i++) {
                      pass += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    setResetPasswordValue(pass);
                  }}
                  className="text-[11px] text-[#D4AF37] hover:underline font-mono"
                >
                  + Generate Strong Password
                </button>
              </div>
              <PasswordInput
                required
                placeholder="Minimum 8 characters"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMemberToResetPassword(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Set New Password
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!memberToEditRole}
        onClose={() => setMemberToEditRole(null)}
        title="Update Member Role & Hierarchy"
        size="sm"
      >
        {memberToEditRole && (
          <div className="space-y-4">
            <p className="text-xs text-text-muted">
              Adjust privileges for{" "}
              <span className="font-semibold text-text">
                {memberToEditRole.user?.profile?.fullName || memberToEditRole.fullName || memberToEditRole.name || "this user"}
              </span>.
            </p>

            <Select
              label="New Role"
              options={assignableRoles}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMemberToEditRole(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleRoleUpdateSubmit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Save Role
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal
        isOpen={!!memberToEditStatus}
        onClose={() => setMemberToEditStatus(null)}
        title="Update Account Access Status"
        size="sm"
      >
        {memberToEditStatus && (
          <div className="space-y-4">
            <Select
              label="Account Status"
              options={[
                { value: "ACTIVE", label: "Active (Full access)" },
                { value: "INACTIVE", label: "Inactive (Dormant)" },
                { value: "SUSPENDED", label: "Suspended (Locked out)" },
              ]}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMemberToEditStatus(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleStatusUpdateSubmit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Apply Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveConfirm}
        title="Delete User Account"
        message={`Are you sure you want to delete ${memberToRemove?.user?.profile?.fullName || memberToRemove?.fullName || memberToRemove?.email || "this user"}? This will revoke all database credentials and workspace access.`}
        confirmText="Delete Account"
        confirmVariant="danger"
        isLoading={isRemoving}
      />
    </div>
  );
};
