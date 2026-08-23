import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  MapPin,
  Briefcase,
  Filter,
  X,
  LayoutGrid,
  List,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell, Pagination } from "../components/ui/Table.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge, Avatar } from "../components/ui/Badge.js";
import { Card } from "../components/ui/Card.js";
import { Modal, ConfirmModal } from "../components/ui/Modal.js";
import { Input, Textarea } from "../components/ui/Input.js";
import { Select } from "../components/ui/Select.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { Skeleton } from "../components/ui/LoadingSpinner.js";
import { useToast } from "../context/ToastContext.js";
import { useAuth } from "../context/AuthContext.js";
import { clientsService } from "../api/services/clients.service.js";
import { Client, ClientStatus } from "../types/index.js";

const CLIENT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "LEAD", label: "Lead" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "CHURNED", label: "Churned" },
  { value: "ARCHIVED", label: "Archived" },
];

export const ClientsPage: React.FC = () => {
  const { addToast } = useToast();
  const { currentUser, currentOrganization, currentWorkspace, isLoading: isAuthLoading } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Client Details Inspection Modal
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Delete State
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    whatsappNumber: "",
    country: "",
    city: "",
    address: "",
    businessType: "",
    businessDescription: "",
    clientStatus: "ACTIVE" as ClientStatus,
  });

  const loadClients = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientsService.getAll({
        search: search.trim() || undefined,
        page,
        limit: 100, // Fetch directory list for high density client management
      });

      let items: Client[] = [];
      if (Array.isArray(res.data)) {
        items = res.data;
      } else if (Array.isArray(res)) {
        items = res as any;
      } else if (Array.isArray((res as any)?.items)) {
        items = (res as any).items;
      }
      setClients(items);
    } catch (err: any) {
      setError(err.message || "Failed to load clients directory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !currentUser) return;
    loadClients();
  }, [search, currentOrganization?.id, currentWorkspace?.id, currentUser?.id, isAuthLoading]);

  // Client side status filtering
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const status = (c.clientStatus || c.status || "ACTIVE").toUpperCase();
      if (statusFilter !== "ALL" && status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [clients, statusFilter]);

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      companyName: "",
      whatsappNumber: "",
      country: "",
      city: "",
      address: "",
      businessType: "",
      businessDescription: "",
      clientStatus: "ACTIVE",
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      fullName: client.fullName || client.name || client.contactName || "",
      email: client.email || "",
      phoneNumber: client.phoneNumber || client.phone || "",
      companyName: client.companyName || "",
      whatsappNumber: client.whatsappNumber || "",
      country: client.country || "",
      city: client.city || "",
      address: client.address || "",
      businessType: client.businessType || "",
      businessDescription: client.businessDescription || "",
      clientStatus: (client.clientStatus as ClientStatus) || "ACTIVE",
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setModalError("Client full name is required");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setModalError("A valid email address is required");
      return;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.trim().length < 5) {
      setModalError("Phone number must be at least 5 digits");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const payload: any = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: formData.phoneNumber.trim(),
      companyName: formData.companyName.trim() || undefined,
      whatsappNumber: formData.whatsappNumber.trim() || undefined,
      country: formData.country.trim() || undefined,
      city: formData.city.trim() || undefined,
      address: formData.address.trim() || undefined,
      businessType: formData.businessType.trim() || undefined,
      businessDescription: formData.businessDescription.trim() || undefined,
      clientStatus: formData.clientStatus,
    };

    try {
      if (editingClient) {
        const res = await clientsService.update(editingClient.id, payload);
        if (res.success) {
          addToast({
            type: "success",
            title: "Client Updated",
            message: `Client "${formData.fullName}" updated successfully`,
          });
          setIsModalOpen(false);
          await loadClients();
        } else {
          setModalError(res.error || "Failed to update client");
        }
      } else {
        const res = await clientsService.create(payload);
        if (res.success) {
          addToast({
            type: "success",
            title: "Client Registered",
            message: `Client "${formData.fullName}" registered in workspace directory`,
          });
          setIsModalOpen(false);
          await loadClients();
        } else {
          setModalError(res.error || "Failed to register client");
        }
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred while saving client";
      setModalError(msg);
      addToast({ type: "danger", title: "Operation Failed", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      const res = await clientsService.delete(clientToDelete.id);
      if (res.success) {
        addToast({
          type: "info",
          title: "Client Removed",
          message: `Client record deleted from workspace`,
        });
        setClientToDelete(null);
        if (selectedClient?.id === clientToDelete.id) {
          setSelectedClient(null);
        }
        await loadClients();
      } else {
        addToast({
          type: "danger",
          title: "Deletion Failed",
          message: res.error || "Could not delete client record",
        });
      }
    } catch (err: any) {
      addToast({
        type: "danger",
        title: "Deletion Error",
        message: err.message || "Failed to delete client",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "success";
      case "PROSPECT":
        return "gold";
      case "LEAD":
        return "info";
      case "CHURNED":
        return "danger";
      case "ARCHIVED":
      case "INACTIVE":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const hasActiveFilters = search.trim().length > 0 || statusFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPage(1);
  };

  const canManage =
    currentUser?.accountType === "ADMIN" ||
    currentUser?.accountType === "SUB_ADMIN" ||
    currentUser?.accountType === "MANAGER";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Clients Directory"
        description={
          clients.length > 0
            ? `Enterprise client accounts and key stakeholders (${clients.length} registered client${
                clients.length !== 1 ? "s" : ""
              })`
            : "Enterprise client accounts, key stakeholders, and organization contacts"
        }
        actions={
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Enterprise Client
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Input
              placeholder="Search by name, company, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="py-2 text-xs"
            />
          </div>

          <div className="w-40">
            <Select
              options={CLIENT_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 text-xs"
            />
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

      {error && <ErrorState message={error} onRetry={loadClients} />}

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          title="No Enterprise Clients Found"
          description="Register client entities in your workspace to manage deliverables, billings, and contracts."
          actionLabel="Add Client"
          onAction={openCreateModal}
          icon={<Users className="w-8 h-8" />}
        />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          title="No Matching Clients"
          description="No client records matched your current query or status filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
          icon={<Filter className="w-8 h-8" />}
        />
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client / Stakeholder</TableHead>
                <TableHead>Organization / Company</TableHead>
                <TableHead>Contact Channels</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredClients.map((c) => {
                const name = c.fullName || c.name || c.contactName || "Unnamed Client";
                const status = c.clientStatus || c.status || "ACTIVE";
                const phone = c.phoneNumber || c.phone;

                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={name} size="sm" />
                        <div>
                          <button
                            onClick={() => setSelectedClient(c)}
                            className="font-bold text-slate-900 dark:text-white hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors text-left block"
                          >
                            {name}
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {c.businessType || "Enterprise Account"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.companyName || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                        {phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {c.city || c.country ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{[c.city, c.country].filter(Boolean).join(", ")}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(status)}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconButton
                          label="View client details"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedClient(c)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </IconButton>
                        {canManage && (
                          <IconButton
                            label="Edit client"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(c)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </IconButton>
                        )}
                        {canManage && (
                          <IconButton
                            label="Delete client"
                            variant="danger"
                            size="sm"
                            onClick={() => setClientToDelete(c)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
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
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((c) => {
            const name = c.fullName || c.name || c.contactName || "Unnamed Client";
            const status = c.clientStatus || c.status || "ACTIVE";
            const phone = c.phoneNumber || c.phone;

            return (
              <Card
                key={c.id}
                className="flex flex-col justify-between p-6 relative overflow-hidden hover:border-slate-700 bg-white dark:bg-slate-900/60 transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} size="md" />
                      <div>
                        <button
                          onClick={() => setSelectedClient(c)}
                          className="font-bold text-base text-slate-900 dark:text-white hover:text-[#D4AF37] text-left block"
                        >
                          {name}
                        </button>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {c.companyName || "Independent Client"}
                        </span>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(status)}>
                      {status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                    {phone && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{phone}</span>
                      </div>
                    )}
                    {(c.city || c.country) && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{[c.city, c.country].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Added: {formatDate(c.createdAt)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClient(c)}
                      className="text-xs py-1 px-2.5"
                    >
                      Details
                    </Button>
                    {canManage && (
                      <IconButton
                        label="Edit client"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(c)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </IconButton>
                    )}
                    {canManage && (
                      <IconButton
                        label="Delete client"
                        variant="danger"
                        size="sm"
                        onClick={() => setClientToDelete(c)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Delete Client */}
      <ConfirmModal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={confirmDeleteClient}
        isLoading={isDeleting}
        title="Delete Enterprise Client"
        message={`Are you sure you want to delete client "${
          clientToDelete?.fullName || clientToDelete?.name || clientToDelete?.email
        }"? Associated project and payment scopes will be impacted.`}
        confirmLabel="Delete Client"
        variant="danger"
      />

      {/* Client Details Inspection Modal */}
      {selectedClient && (
        <Modal
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          title="Client Profile & Account Details"
          description={`Comprehensive directory profile for ${
            selectedClient.fullName || selectedClient.name || "Client"
          }`}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-slate-500">
                Client ID: {selectedClient.id}
              </span>
              <div className="flex items-center gap-2">
                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      const c = selectedClient;
                      setSelectedClient(null);
                      openEditModal(c);
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              <Avatar
                name={selectedClient.fullName || selectedClient.name || selectedClient.email}
                size="lg"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedClient.fullName || selectedClient.name || "Client Stakeholder"}
                  </h4>
                  <Badge variant={getStatusBadgeVariant(selectedClient.clientStatus || selectedClient.status)}>
                    {selectedClient.clientStatus || selectedClient.status || "ACTIVE"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {selectedClient.companyName || "Independent Corporate Entity"}
                </p>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">Email Address</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {selectedClient.email}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">Phone Number</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {selectedClient.phoneNumber || selectedClient.phone || "—"}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">WhatsApp Contact</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {selectedClient.whatsappNumber || "—"}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">Business Domain / Type</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedClient.businessType || "Enterprise Consulting"}
                </span>
              </div>
            </div>

            {/* Location & Address */}
            {(selectedClient.address || selectedClient.city || selectedClient.country) && (
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-xs">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">Physical Location</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {[selectedClient.address, selectedClient.city, selectedClient.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}

            {/* Business Description */}
            {selectedClient.businessDescription && (
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-xs">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">Business Scope / Notes</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedClient.businessDescription}
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Registered: {formatDate(selectedClient.createdAt)}</span>
              <span>Updated: {formatDate(selectedClient.updatedAt)}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal for Add / Edit Client */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? "Edit Client Profile" : "Register Enterprise Client"}
        description={
          editingClient
            ? "Update client contact information, status, and company profile."
            : "Add a new client account to assign deliverables, manage project pipelines, and track contracts."
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
              disabled={!formData.fullName.trim() || !formData.email.trim() || !formData.phoneNumber.trim()}
              onClick={handleSubmit}
            >
              {editingClient ? "Save Changes" : "Register Client"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {modalError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Client Full Name"
              required
              placeholder="e.g. Jonathan Vance"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. jvance@acmeglobal.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              required
              placeholder="e.g. +1 555-019-2834"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              helperText="Min 5 characters with country code"
            />
            <Input
              label="WhatsApp Number (Optional)"
              placeholder="e.g. +1 555-019-2834"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company Name"
              placeholder="e.g. Acme Corporation Worldwide"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <Select
              label="Client Status"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "PROSPECT", label: "Prospect" },
                { value: "LEAD", label: "Lead" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "CHURNED", label: "Churned" },
                { value: "ARCHIVED", label: "Archived" },
              ]}
              value={formData.clientStatus}
              onChange={(e) => setFormData({ ...formData, clientStatus: e.target.value as ClientStatus })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Country"
              placeholder="e.g. United States"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
            <Input
              label="City"
              placeholder="e.g. San Francisco"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <Input
            label="Street Address (Optional)"
            placeholder="e.g. 100 Montgomery St, Suite 400"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <Input
            label="Business Type / Industry"
            placeholder="e.g. Fintech / Cloud Infrastructure"
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
          />

          <Textarea
            label="Business Description / Notes (Optional)"
            placeholder="e.g. Key client contact for North American operations..."
            value={formData.businessDescription}
            onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
