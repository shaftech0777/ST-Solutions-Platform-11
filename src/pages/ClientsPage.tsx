import React, { useEffect, useState } from "react";
import { Users, Plus, Search, Mail, Phone, Building2, Trash2, Edit2 } from "lucide-react";
import { PageHeader } from "../components/shell/PageHeader.js";
import { Table, TableHeader, TableRow, TableHead, TableCell, Pagination } from "../components/ui/Table.js";
import { Button, IconButton } from "../components/ui/Button.js";
import { Badge } from "../components/ui/Badge.js";
import { Modal } from "../components/ui/Modal.js";
import { Input } from "../components/ui/Input.js";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.js";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.js";
import { useToast } from "../context/ToastContext.js";
import { clientsService } from "../api/services/clients.service.js";
import { Client } from "../types/index.js";

export const ClientsPage: React.FC = () => {
  const { addToast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    phone: "",
  });

  const loadClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientsService.getAll({ search, page, limit: 10 });
      setClients(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load clients directory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search, page]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await clientsService.create(formData);
      if (res.success) {
        addToast({ type: "success", title: "Client Added", message: `Client "${formData.name}" added to directory` });
        setIsModalOpen(false);
        setFormData({ name: "", email: "", companyName: "", phone: "" });
        loadClients();
      }
    } catch (err: any) {
      addToast({ type: "danger", title: "Operation Failed", message: err.message || "Failed to save client" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!window.confirm(`Delete client "${name}"?`)) return;
    try {
      await clientsService.delete(id);
      addToast({ type: "info", title: "Client Deleted", message: `Client removed from directory` });
      loadClients();
    } catch (err: any) {
      addToast({ type: "danger", title: "Deletion Failed", message: err.message || "Failed to delete client" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients Directory"
        description="Enterprise client accounts, key stakeholders, and organization contacts"
        actions={
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add New Client
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadClients} />}

      {isLoading ? (
        <LoadingSpinner text="Fetching clients directory..." />
      ) : clients.length === 0 ? (
        <EmptyState
          title="No Clients Found"
          description="Add enterprise clients to manage projects, generate invoices, and assign deliverables."
          actionLabel="Add Client"
          onAction={() => setIsModalOpen(true)}
          icon={<Users className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold text-slate-900 dark:text-white">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.companyName || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{c.email}</TableCell>
                  <TableCell className="font-mono text-xs">{c.phone || "—"}</TableCell>
                  <TableCell className="text-right">
                    <IconButton
                      label="Delete client"
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClient(c.id, c.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(clients.length / 10) || 1}
            onPageChange={(p) => setPage(p)}
            totalRecords={clients.length}
          />
        </div>
      )}

      {/* Modal for Add Client */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Enterprise Client"
        description="Register a new client entity in your workspace directory."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleCreateClient}
            >
              Save Client
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <Input
            label="Client Full Name"
            required
            placeholder="e.g. Johnathan Vance"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="e.g. jvance@acmecorp.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Company Name"
            placeholder="e.g. Acme Enterprise Global"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="e.g. +1 (555) 019-2834"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
