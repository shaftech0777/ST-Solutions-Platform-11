import React, { useEffect, useState } from "react";
import { Building2, Plus, Users, Check, ArrowRight } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal } from "../components/ui/Modal.js";
import { Input } from "../components/ui/Input.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { organizationsService } from "../api/services/organizations.service.js";
import { Organization } from "../types/index.js";

export const OrganizationsPage: React.FC = () => {
  const { organizations, currentOrganization, switchOrganization, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await organizationsService.create({
        name: newOrgName,
        slug: newOrgSlug || undefined,
      });

      if (res.success && res.data) {
        addToast({ type: "success", title: "Organization Created", message: `Organization "${res.data.name}" created successfully` });
        setIsModalOpen(false);
        setNewOrgName("");
        setNewOrgSlug("");
        await refreshUser();
      }
    } catch (err: any) {
      addToast({ type: "danger", title: "Creation Failed", message: err.message || "Failed to create organization" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations Management"
        description="Multi-tenant enterprise organization nodes and tenant scope boundaries"
        actions={
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Organization
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => {
          const isCurrent = org.id === currentOrganization?.id;
          return (
            <Card
              key={org.id}
              className={`flex flex-col justify-between p-6 relative overflow-hidden transition-all ${
                isCurrent ? "border-[#D4AF37] bg-slate-900/90 ring-1 ring-[#D4AF37]/30" : "hover:border-slate-700"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold flex items-center justify-center text-base shrink-0">
                    {org.name[0]}
                  </div>
                  {isCurrent && (
                    <Badge variant="gold" dot>
                      Active Context
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{org.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Slug: {org.slug || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Role: <strong className="text-white">{org.role || "MEMBER"}</strong>
                </span>

                {!isCurrent ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => switchOrganization(org.id)}
                  >
                    Switch Context
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1">
                    <Check className="w-4 h-4" /> Selected
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal for Creating Organization */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Enterprise Organization"
        description="Establish a new isolated tenant context for team collaboration and data authorization."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleCreateOrg}
            >
              Create Organization
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <Input
            label="Organization Name"
            required
            placeholder="e.g. Shaf Tech Global"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
          />
          <Input
            label="Organization Slug (Optional)"
            placeholder="e.g. shaf-tech-global"
            value={newOrgSlug}
            onChange={(e) => setNewOrgSlug(e.target.value)}
            helperText="Unique identifier for subdomains or API paths"
          />
        </form>
      </Modal>
    </div>
  );
};
