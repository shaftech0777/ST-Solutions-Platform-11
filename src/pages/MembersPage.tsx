import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Building2,
  Edit2,
  Eye,
  AlertCircle,
  RefreshCw,
  Award,
  Crown,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  Phone,
  MapPin,
} from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../components/ui/Table.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge, Avatar } from "../components/ui/Badge.js";
import { Card } from "../components/ui/Card.js";
import { Modal, ConfirmModal } from "../components/ui/Modal.js";
import { Input } from "../components/ui/Input.js";
import { Select } from "../components/ui/Select.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { Skeleton } from "../components/ui/LoadingSpinner.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { membersService, MemberItem } from "../api/services/members.service.js";
import { organizationsService } from "../api/services/organizations.service.js";

const ROLE_FILTER_OPTIONS = [
  { value: "ALL", label: "All Account Roles" },
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Platform Admin" },
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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [memberToEditRole, setMemberToEditRole] = useState<any | null>(null);
  const [memberToEditStatus, setMemberToEditStatus] = useState<any | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);

  // Form States
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [newRole, setNewRole] = useState("MEMBER");
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [statusReason, setStatusReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadMembers = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      // First try fetching via membersService or organization members
      let items: any[] = [];
      if (currentOrganization?.id) {
        try {
          const orgRes = await organizationsService.getMembers(currentOrganization.id);
          if (Array.isArray(orgRes.data)) {
            items = orgRes.data;
          } else if (Array.isArray(orgRes)) {
            items = orgRes as any;
          }
        } catch {
          // fallback to membersService.getAll
        }
      }

      if (items.length === 0) {
        const memRes = await membersService.getAll({ limit: 100 });
        if (Array.isArray(memRes.data)) {
          items = memRes.data;
        } else if (Array.isArray(memRes)) {
          items = memRes as any;
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
      const role = (m.role?.name || m.user?.accountType || m.role || "MEMBER").toUpperCase();

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
      const role = (m.role?.name || m.user?.accountType || m.role || "MEMBER").toUpperCase();
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
        role: inviteRole,
      });

      addToast({
        type: "success",
        title: "Invitation Dispatched",
        message: `An invitation to join ${currentOrganization.name} has been sent to ${inviteEmail}.`,
      });

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
      if (currentOrganization?.id) {
        await organizationsService.updateMemberRole(currentOrganization.id, targetUserId, newRole);
      } else {
        await membersService.updateRank(memberToEditRole.id, newRole);
      }

      addToast({
        type: "success",
        title: "Role Updated",
        message: `Account role transitioned to ${newRole}.`,
      });
      setMemberToEditRole(null);
      loadMembers();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Role Update Failed",
        message: err.message || "Could not update user role.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdateSubmit = async () => {
    if (!memberToEditStatus) return;
    setIsSubmitting(true);
    try {
      await membersService.updateStatus(memberToEditStatus.id, newStatus, statusReason.trim() || undefined);
      addToast({
        type: "success",
        title: "Status Updated",
        message: `Member status updated to ${newStatus}.`,
      });
      setMemberToEditStatus(null);
      setStatusReason("");
      loadMembers();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Status Update Failed",
        message: err.message || "Could not update member status.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove || !currentOrganization) return;
    setIsRemoving(true);
    try {
      const targetUserId = memberToRemove.user?.id || memberToRemove.userId || memberToRemove.id;
      await organizationsService.removeMember(currentOrganization.id, targetUserId);
      addToast({
        type: "info",
        title: "Member Removed",
        message: "User was removed from organization workspace context.",
      });
      setMemberToRemove(null);
      loadMembers();
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Removal Failed",
        message: err.message || "Failed to remove member from organization.",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = (role || "").toUpperCase();
    switch (r) {
      case "OWNER":
        return <Badge variant="gold"><Crown className="w-3 h-3 mr-1" /> Owner</Badge>;
      case "ADMIN":
        return <Badge variant="gold"><Shield className="w-3 h-3 mr-1" /> Platform Admin</Badge>;
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
        title="Members & Workforce Management"
        description="Team organization rosters, security roles, workspace permissions, and invitation lifecycle."
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
            <Button
              variant="gold"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
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
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Members</span>
            <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-text">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-text">{stats.total}</div>
            <p className="text-xs text-text-muted mt-1">Total active team roster</p>
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
            <p className="text-xs text-text-muted mt-1">Operating with full system access</p>
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
          title={search || roleFilter !== "ALL" || statusFilter !== "ALL" ? "No matching members found" : "No members found in organization"}
          description={
            search || roleFilter !== "ALL" || statusFilter !== "ALL"
              ? "Try adjusting your search criteria, role, or status filter."
              : "Invite collaborators and administrators to begin co-managing workflows."
          }
          action={
            <Button
              variant="gold"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite First Member
            </Button>
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
                    <TableHead>Member</TableHead>
                    <TableHead>Account Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {filteredMembers.map((member) => {
                    const name = member.user?.profile?.fullName || member.fullName || member.name || "Unnamed User";
                    const email = member.user?.email || member.email || "No email";
                    const role = member.role?.name || member.user?.accountType || member.role || "MEMBER";
                    const status = member.status || member.user?.status || "ACTIVE";
                    const isSelf = member.user?.id === currentUser?.id || member.userId === currentUser?.id || member.id === currentUser?.id;

                    return (
                      <TableRow key={member.id} className="hover:bg-surface-hover/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar name={name} size="sm" />
                            <div>
                              <div className="font-semibold text-sm text-text flex items-center gap-1.5">
                                <span>{name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-mono">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-gold/80" /> {email}
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

                            {!isSelf && (
                              <IconButton
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                                title="Remove Member"
                                onClick={() => setMemberToRemove(member)}
                              />
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
              const name = member.user?.profile?.fullName || member.fullName || member.name || "Unnamed User";
              const email = member.user?.email || member.email || "No email";
              const role = member.role?.name || member.user?.accountType || member.role || "MEMBER";
              const status = member.status || member.user?.status || "ACTIVE";
              const isSelf = member.user?.id === currentUser?.id || member.userId === currentUser?.id || member.id === currentUser?.id;

              return (
                <Card key={member.id} className="p-4 border-border/60 bg-surface space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={name} size="sm" />
                      <div>
                        <div className="font-semibold text-sm text-text flex items-center gap-1.5">
                          <span>{name}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-mono">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted">{email}</div>
                      </div>
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>{getRoleBadge(role)}</div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedMember(member)}
                      >
                        Details
                      </Button>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Shield className="w-3.5 h-3.5 text-gold" />}
                        onClick={() => {
                          setMemberToEditRole(member);
                          setNewRole(role);
                        }}
                      />
                      {!isSelf && (
                        <IconButton
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                          onClick={() => setMemberToRemove(member)}
                        />
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

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
            options={[
              { value: "MEMBER", label: "Member (Standard Team Role)" },
              { value: "MANAGER", label: "Manager (Project & Staff Lead)" },
              { value: "SUB_ADMIN", label: "Sub-Admin (Operational Supervisor)" },
              { value: "ADMIN", label: "Admin (Full System Privilege)" },
              { value: "CLIENT", label: "Client (Portal Viewer)" },
            ]}
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
        title="Member Profile Inspection"
        size="md"
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
              <div className="space-y-1">
                <span className="text-text-muted">Assigned Role:</span>
                <div>
                  {getRoleBadge(selectedMember.role?.name || selectedMember.user?.accountType || selectedMember.role || "MEMBER")}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Contact Phone:</span>
                <div className="text-text font-medium">
                  {selectedMember.user?.profile?.phoneNumber || selectedMember.phoneNumber || "Not provided"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Location:</span>
                <div className="text-text font-medium">
                  {selectedMember.user?.profile?.city ? `${selectedMember.user.profile.city}, ${selectedMember.user.profile.country || ""}` : "Not specified"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-text-muted">Roster Registration:</span>
                <div className="text-text font-medium">
                  {new Date(selectedMember.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          </div>
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
              Adjust organizational privileges for{" "}
              <span className="font-semibold text-text">
                {memberToEditRole.user?.profile?.fullName || memberToEditRole.fullName || memberToEditRole.name || "this user"}
              </span>.
            </p>

            <Select
              label="New Role"
              options={[
                { value: "MEMBER", label: "Member (Standard Team Role)" },
                { value: "MANAGER", label: "Manager (Project & Staff Lead)" },
                { value: "SUB_ADMIN", label: "Sub-Admin (Operational Supervisor)" },
                { value: "ADMIN", label: "Admin (Platform Administrator)" },
                { value: "CLIENT", label: "Client (Portal Access)" },
              ]}
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

            <Input
              label="Reason / Audit Note (Optional)"
              placeholder="e.g. Temporary leave of absence..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
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

      {/* Remove Member Confirmation Modal */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove Member from Organization"
        message={`Are you sure you want to remove ${memberToRemove?.user?.profile?.fullName || memberToRemove?.fullName || memberToRemove?.email || "this member"} from ${currentOrganization?.name || "the organization"}? They will immediately lose workspace access.`}
        confirmText="Remove Member"
        confirmVariant="danger"
        isLoading={isRemoving}
      />
    </div>
  );
};
