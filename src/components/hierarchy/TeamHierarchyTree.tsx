import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  ChevronDown,
  ChevronRight,
  Shield,
  Briefcase,
  UserCheck,
  FolderKanban,
  Search,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink } from "lucide-react";
import { usersService } from "../../api/services/users.service.js";
import { Card } from "../ui/Card.js";
import { Button, IconButton } from "../ui/Button.js";
import { Badge, Avatar } from "../ui/Badge.js";
import { Modal } from "../ui/Modal.js";
import { Skeleton } from "../ui/LoadingSpinner.js";
import { ErrorState, EmptyState } from "../ui/EmptyState.js";
import { useAuth } from "../../context/AuthContext.js";

interface ProjectSummary {
  id: string;
  title: string;
  status: string;
  progress: number;
  budget: number | null;
  currency: string;
}

export interface HierarchyNode {
  id: string;
  type: "ADMIN" | "SUB_ADMIN" | "MANAGER" | "MEMBER" | "CLIENT";
  name: string;
  email: string | null;
  loginId: string;
  avatar: string | null;
  status: string;
  phoneNumber?: string | null;
  roleName?: string | null;
  directReportsCount: number;
  clientsCount: number;
  projectsCount: number;
  children: HierarchyNode[];
  metadata?: {
    supervisorId?: string | null;
    supervisorName?: string | null;
    managerId?: string | null;
    managerName?: string | null;
    memberId?: string | null;
    memberName?: string | null;
    companyName?: string | null;
    createdAt?: string;
    projects?: ProjectSummary[];
  };
}

interface TeamHierarchyTreeProps {
  onSelectUser?: (user: any) => void;
}

export const TeamHierarchyTree: React.FC<TeamHierarchyTreeProps> = ({ onSelectUser }) => {
  const { currentUser } = useAuth();
  const [treeData, setTreeData] = useState<HierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);

  const loadTree = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await usersService.getTeamTree();
      const nodes = (res.data || []) as HierarchyNode[];
      setTreeData(nodes);

      // Default expand the first 2 levels (Admins and Sub-Admins/Managers)
      const initialExpanded = new Set<string>();
      const addExpansions = (items: HierarchyNode[], depth: number) => {
        if (depth > 2) return;
        items.forEach((item) => {
          initialExpanded.add(item.id);
          if (item.children && item.children.length > 0) {
            addExpansions(item.children, depth + 1);
          }
        });
      };
      addExpansions(nodes, 1);
      setExpandedNodes(initialExpanded);
    } catch (err: any) {
      setError(err?.message || "Failed to load organizational team tree");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    const collectIds = (items: HierarchyNode[]) => {
      items.forEach((item) => {
        all.add(item.id);
        if (item.children && item.children.length > 0) {
          collectIds(item.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    let admins = 0;
    let subAdmins = 0;
    let managers = 0;
    let members = 0;
    let clients = 0;
    let projects = 0;

    const traverse = (nodes: HierarchyNode[]) => {
      nodes.forEach((n) => {
        if (n.type === "ADMIN") admins++;
        else if (n.type === "SUB_ADMIN") subAdmins++;
        else if (n.type === "MANAGER") managers++;
        else if (n.type === "MEMBER") members++;
        else if (n.type === "CLIENT") clients++;

        if (n.metadata?.projects) {
          projects += n.metadata.projects.length;
        }

        if (n.children && n.children.length > 0) {
          traverse(n.children);
        }
      });
    };

    traverse(treeData);
    return { admins, subAdmins, managers, members, clients, projects };
  }, [treeData]);

  const getNodeBadge = (type: string) => {
    switch (type) {
      case "ADMIN":
        return <Badge variant="gold">ADMIN</Badge>;
      case "SUB_ADMIN":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
            SUB-ADMIN
          </span>
        );
      case "MANAGER":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
            MANAGER
          </span>
        );
      case "MEMBER":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            STAFF MEMBER
          </span>
        );
      case "CLIENT":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
            CLIENT
          </span>
        );
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "ADMIN":
        return "border-[#D4AF37]/50 hover:border-[#D4AF37]";
      case "SUB_ADMIN":
        return "border-purple-500/40 hover:border-purple-400";
      case "MANAGER":
        return "border-blue-500/40 hover:border-blue-400";
      case "MEMBER":
        return "border-emerald-500/40 hover:border-emerald-400";
      case "CLIENT":
        return "border-amber-500/40 hover:border-amber-400";
      default:
        return "border-border/60 hover:border-border";
    }
  };

  // Check if node or any descendant matches search query
  const matchesSearch = (node: HierarchyNode, query: string): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    const selfMatch =
      node.name.toLowerCase().includes(q) ||
      (node.email && node.email.toLowerCase().includes(q)) ||
      node.loginId.toLowerCase().includes(q) ||
      node.type.toLowerCase().includes(q);

    if (selfMatch) return true;

    return node.children.some((child) => matchesSearch(child, query));
  };

  const renderNode = (node: HierarchyNode, depth = 0) => {
    if (searchQuery && !matchesSearch(node, searchQuery)) {
      return null;
    }

    const isExpanded = expandedNodes.has(node.id) || !!searchQuery;
    const hasChildren = node.children && node.children.length > 0;
    const isSelf = currentUser?.id === node.id;

    return (
      <div key={node.id} className="relative flex flex-col">
        {/* Node Card */}
        <div className="flex items-start gap-3 relative py-2">
          {/* Connecting Line Indent */}
          {depth > 0 && (
            <div
              className="absolute left-0 top-6 w-5 h-px bg-slate-700/60"
              style={{ left: `-${20}px` }}
            />
          )}

          {/* Expand / Collapse Button */}
          <div className="pt-2 shrink-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="w-6 h-6 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-colors"
                title={isExpanded ? "Collapse Branch" : "Expand Branch"}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>
            )}
          </div>

          {/* Node Summary Card */}
          <div
            onClick={() => setSelectedNode(node)}
            className={`flex-1 group cursor-pointer p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 dark:bg-slate-900/90 border transition-all duration-150 ${getBorderColor(
              node.type
            )} hover:shadow-lg hover:shadow-black/20`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <Avatar name={node.name} size="sm" src={node.avatar || undefined} />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{node.name}</span>
                    {isSelf && (
                      <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono font-bold">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      ID: {node.loginId}
                    </span>
                    {node.email && (
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Mail className="w-3 h-3 text-[#D4AF37]/70" /> {node.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getNodeBadge(node.type)}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    node.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : node.status === "SUSPENDED"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      : "bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {node.status}
                </span>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-[#D4AF37]" />}
                  title="View Profile Details"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                />
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
              {node.directReportsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-mono text-[11px] border border-blue-500/20">
                  <Users className="w-3 h-3" /> {node.directReportsCount} Direct Report
                  {node.directReportsCount !== 1 ? "s" : ""}
                </span>
              )}

              {node.clientsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-mono text-[11px] border border-amber-500/20">
                  <Briefcase className="w-3 h-3" /> {node.clientsCount} Client
                  {node.clientsCount !== 1 ? "s" : ""}
                </span>
              )}

              {node.projectsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-mono text-[11px] border border-emerald-500/20">
                  <FolderKanban className="w-3 h-3" /> {node.projectsCount} Project
                  {node.projectsCount !== 1 ? "s" : ""}
                </span>
              )}

              {node.metadata?.managerName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
                  Manager: <strong className="text-slate-800 dark:text-slate-200">{node.metadata.managerName}</strong>
                </span>
              )}

              {node.metadata?.supervisorName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
                  Supervisor: <strong className="text-slate-800 dark:text-slate-200">{node.metadata.supervisorName}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Children Sub-Tree with left branch line */}
        {hasChildren && isExpanded && (
          <div className="relative ml-6 pl-5 border-l-2 border-slate-300 dark:border-slate-700/60 flex flex-col space-y-2 py-1">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">Admins</span>
          <span className="text-xl font-bold text-[#D4AF37]">{metrics.admins}</span>
        </Card>
        <Card className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">Sub-Admins</span>
          <span className="text-xl font-bold text-purple-400">{metrics.subAdmins}</span>
        </Card>
        <Card className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">Managers</span>
          <span className="text-xl font-bold text-blue-400">{metrics.managers}</span>
        </Card>
        <Card className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">Staff Members</span>
          <span className="text-xl font-bold text-emerald-400">{metrics.members}</span>
        </Card>
        <Card className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">Clients</span>
          <span className="text-xl font-bold text-amber-400">{metrics.clients}</span>
        </Card>
        <Card className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">Active Projects</span>
          <span className="text-xl font-bold text-sky-400">{metrics.projects}</span>
        </Card>
      </div>

      {/* Control Bar: Search, Expand/Collapse, Refresh */}
      <Card className="p-4 bg-slate-50 dark:bg-slate-50 dark:bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search hierarchy by name, email, user ID, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
          <IconButton
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#D4AF37]" : ""}`} />}
            title="Refresh Hierarchy"
            onClick={loadTree}
          />
        </div>
      </Card>

      {/* Main Hierarchy Tree View */}
      {error && <ErrorState message={error} onRetry={loadTree} />}

      {isLoading && (
        <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </Card>
      )}

      {!isLoading && !error && treeData.length === 0 && (
        <EmptyState
          icon={<Layers className="w-10 h-10 text-[#D4AF37]/60" />}
          title="No Organizational Hierarchy Available"
          description="Provision staff members and assign reporting relationships to generate the visual organization chart."
        />
      )}

      {!isLoading && !error && treeData.length > 0 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-3">
            {treeData.map((rootNode) => renderNode(rootNode, 0))}
          </div>
        </div>
      )}

      {/* Selected Node Details Modal */}
      <Modal
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        title={selectedNode ? `${selectedNode.name} — Profile & Line Management` : "Node Details"}
        size="lg"
      >
        {selectedNode && (
          <div className="space-y-5">
            {/* Header Identity */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Avatar name={selectedNode.name} size="lg" src={selectedNode.avatar || undefined} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedNode.name}</h3>
                  {getNodeBadge(selectedNode.type)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                  <p className="font-mono text-slate-700 dark:text-slate-300">Database ID: {selectedNode.id}</p>
                  {selectedNode.email && (
                    <p className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37]" /> {selectedNode.email}
                    </p>
                  )}
                  {selectedNode.phoneNumber && (
                    <p className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> {selectedNode.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Hierarchy Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">
                  Reporting Line / Direct Supervisor
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedNode.metadata?.supervisorName ||
                    selectedNode.metadata?.managerName ||
                    "Root Leadership / Executive"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase block">
                  Subordinates / Direct Reports
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedNode.directReportsCount} Direct Report(s)
                </span>
              </div>
            </div>

            {/* Assigned Projects Section */}
            {selectedNode.metadata?.projects && selectedNode.metadata.projects.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono block">
                  Assigned Projects ({selectedNode.metadata.projects.length})
                </span>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedNode.metadata.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-white block truncate">{proj.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                            {proj.status}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                            {proj.progress}% completed
                          </span>
                        </div>
                      </div>
                      {proj.budget !== null && (
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#D4AF37]">
                            {proj.currency} {proj.budget.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              {onSelectUser && (
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={() => {
                    onSelectUser(selectedNode);
                    setSelectedNode(null);
                  }}
                >
                  Manage User Record
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedNode(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
