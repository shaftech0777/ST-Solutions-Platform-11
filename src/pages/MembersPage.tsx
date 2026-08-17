import React, { useEffect, useState } from "react";
import { Users, UserPlus, Mail, Shield, Trash2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../components/ui/Table.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge, Avatar } from "../components/ui/Badge.js";
import { Modal, ConfirmModal } from "../components/ui/Modal.js";
import { Input } from "../components/ui/Input.js";
import { Select } from "../components/ui/Select.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { organizationsService } from "../api/services/organizations.service.js";

export const MembersPage: React.FC = () => {
  const { currentOrganization, currentUser, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState<{ id: string; email: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const loadMembers = async () => {
    if (!currentUser || !currentOrganization) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await organizationsService.getMembers(currentOrganization.id);
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load organization members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadMembers();
  }, [currentOrganization?.id, currentUser?.id, isAuthLoading]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentOrganization) return;

    setIsSubmitting(true);
    try {
      const res = await organizationsService.inviteMember(currentOrganization.id, {
        email: inviteEmail,
        role: inviteRole,
      });

      if (res.success) {
        addToast({
          type: "success",
          title: "Invitation Sent",
          message: `Invited ${inviteEmail} to ${currentOrganization.name}`,
        });
        setIsModalOpen(false);
        setInviteEmail("");
        setInviteRole("MEMBER");
        loadMembers();
      }
    } catch (err: any) {
      addToast({ type: "danger", title: "Invitation Failed", message: err.message || "Failed to send invitation" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!currentOrganization) return;
    try {
      await organizationsService.updateMemberRole(currentOrganization.id, userId, newRole);
      addToast({ type: "success", title: "Role Updated", message: `Updated member role to ${newRole}` });
      loadMembers();
    } catch (err: any) {
      addToast({ type: "danger", title: "Update Failed", message: err.message || "Failed to change member role" });
    }
  };

  const confirmRemoveMember = async () => {
    if (!currentOrganization || !memberToRemove) return;
    setIsRemoving(true);
    try {
      await organizationsService.removeMember(currentOrganization.id, memberToRemove.id);
      addToast({ type: "info", title: "Member Removed", message: `Member removed from ${currentOrganization.name}` });
      setMemberToRemove(null);
      loadMembers();
    } catch (err: any) {
      addToast({ type: "danger", title: "Removal Failed", message: err.message || "Failed to remove member" });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Members & Access Controls"
        description={`Active team members and invitations inside ${currentOrganization?.name || "Organization"}`}
        actions={
          <Button
            variant="gold"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Invite Member
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadMembers} />}

      {isLoading ? (
        <LoadingSpinner text="Fetching organization members..." />
      ) : members.length === 0 ? (
        <EmptyState
          title="No Members Found"
          description="Invite team members to assign project tasks and grant tenant permissions."
          actionLabel="Invite Member"
          onAction={() => setIsModalOpen(true)}
          icon={<Users className="w-8 h-8" />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Organization Role</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {members.map((m) => {
              const u = m.user || m;
              const isSelf = u.id === currentUser?.id;
              return (
                <TableRow key={m.id || u.id}>
                  <TableCell className="font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fullName || u.email} size="sm" />
                      <div>
                        <span>{u.fullName || "Member"}</span>
                        {isSelf && <span className="ml-2 text-[10px] font-mono text-[#D4AF37]">(You)</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{u.email}</TableCell>
                  <TableCell>
                    <select
                      disabled={isSelf}
                      value={m.role || "MEMBER"}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-50"
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                      <option value="GUEST">GUEST</option>
                    </select>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isSelf && (
                      <IconButton
                        label="Remove member"
                        variant="danger"
                        size="sm"
                        onClick={() => setMemberToRemove({ id: u.id, email: u.email })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Confirmation Modal for Member Removal */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={confirmRemoveMember}
        isLoading={isRemoving}
        title="Remove Organization Member"
        message={`Are you sure you want to remove ${memberToRemove?.email} from ${currentOrganization?.name}? Their access to workspaces and projects under this organization will be revoked.`}
        confirmLabel="Remove Member"
        variant="danger"
      />

      {/* Invite Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite Member to Organization"
        description={`Send a tenant access invitation to join ${currentOrganization?.name || "Organization"}.`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleInvite}
            >
              Send Invitation
            </Button>
          </>
        }
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Member Email"
            type="email"
            required
            placeholder="e.g. colleague@st-solutions.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select
            label="Assigned Role"
            options={[
              { value: "MEMBER", label: "Member (Standard Access)" },
              { value: "ADMIN", label: "Admin (Full Management)" },
              { value: "GUEST", label: "Guest (Read Only)" },
            ]}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
