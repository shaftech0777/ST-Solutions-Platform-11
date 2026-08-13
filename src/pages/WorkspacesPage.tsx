import React, { useEffect, useState } from "react";
import { Briefcase, Plus, Check, Trash2 } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal } from "../components/ui/Modal.js";
import { Input, Textarea } from "../components/ui/Input.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { workspacesService } from "../api/services/workspaces.service.js";
import { Workspace } from "../types/index.js";

export const WorkspacesPage: React.FC = () => {
  const { currentOrganization, currentWorkspace, switchWorkspace, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await workspacesService.getAll(currentOrganization?.id);
      setWorkspaces(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load workspaces");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, [currentOrganization?.id]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await workspacesService.create({
        name: newWsName,
        description: newWsDesc || undefined,
        organizationId: currentOrganization?.id,
      });

      if (res.success && res.data) {
        addToast({ type: "success", title: "Workspace Created", message: `Workspace "${res.data.name}" created` });
        setIsModalOpen(false);
        setNewWsName("");
        setNewWsDesc("");
        await loadWorkspaces();
        await refreshUser();
      }
    } catch (err: any) {
      addToast({ type: "danger", title: "Creation Failed", message: err.message || "Failed to create workspace" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Operations"
        description={`Workspaces under ${currentOrganization?.name || "active organization"}`}
        actions={
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Workspace
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadWorkspaces} />}

      {isLoading ? (
        <LoadingSpinner text="Loading workspaces..." />
      ) : workspaces.length === 0 ? (
        <EmptyState
          title="No Workspaces Found"
          description="Create your first workspace to organize client projects, talent, and billing streams."
          actionLabel="Create Workspace"
          onAction={() => setIsModalOpen(true)}
          icon={<Briefcase className="w-8 h-8" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => {
            const isCurrent = ws.id === currentWorkspace?.id;
            return (
              <Card
                key={ws.id}
                className={`flex flex-col justify-between p-6 relative overflow-hidden transition-all ${
                  isCurrent ? "border-[#D4AF37] bg-slate-900/90 ring-1 ring-[#D4AF37]/30" : "hover:border-slate-700"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold flex items-center justify-center text-base shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    {isCurrent && (
                      <Badge variant="gold" dot>
                        Active Workspace
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{ws.name}</h3>
                    {ws.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {ws.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Role: <strong className="text-white">{ws.role || "MEMBER"}</strong>
                  </span>

                  {!isCurrent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => switchWorkspace(ws.id)}
                    >
                      Switch
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1">
                      <Check className="w-4 h-4" /> Active
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Workspace"
        description="Sub-tenant workspace partition for project management and team permissions."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleCreateWorkspace}
            >
              Create Workspace
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <Input
            label="Workspace Name"
            required
            placeholder="e.g. Core Engineering"
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
          />
          <Textarea
            label="Description (Optional)"
            placeholder="e.g. Strategic client delivery and backend integrations"
            value={newWsDesc}
            onChange={(e) => setNewWsDesc(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
