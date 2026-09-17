import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Search,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  X,
  MessageCircle,
  Sparkles,
  Phone,
  ShieldCheck,
  Zap,
  Users,
  Target } from "lucide-react";
import { ProjectShowcaseItem } from "../../data/companyConfig.js";
import { usePublicCMS } from "../../context/PublicCMSContext.js";
import { ProjectCardVisual } from "../../components/public/ProjectCardVisual.js";
import { ProjectInquiryModal } from "../../components/public/ProjectInquiryModal.js";
import { showcaseService, ShowcaseProject } from "../../api/services/showcase.service.js";

const categories = ["All", "E-Commerce", "Software", "Web", "AI", "Automation"] as const;

export const ProjectsPage: React.FC = () => {
  const companyConfig = usePublicCMS();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<ProjectShowcaseItem | null>(null);
  const [inquiryTarget, setInquiryTarget] = useState<ProjectShowcaseItem | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [projectsList, setProjectsList] = useState<ProjectShowcaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Authoritative Database Loading via Showcase API
  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await showcaseService.getPublicProjects({
          category: selectedCategory === "All" ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined });

        if (isMounted) {
          if (Array.isArray(res)) {
            // Adapt authoritative database records to ProjectShowcaseItem format
            const adapted: ProjectShowcaseItem[] = res.map((p: ShowcaseProject) => ({
              id: p.id,
              title: p.title,
              slug: p.slug || p.id,
              category: (p.category?.name as any) || (p.projectType as any) || "Software",
              tagline: p.tagline || p.title,
              description: p.description,
              fullDescription: p.fullDescription || p.description,
              clientType: p.targetAudience || "Business & Commercial Organizations",
              targetAudience: p.targetAudience || "Businesses & Commercial Organizations",
              problemSolved: p.benefits?.[0] || "Engineered to eliminate operational friction and scale productivity.",
              status: p.featured ? "Featured Showcase" : "Capability Showcase",
              technologies: p.technologies || ["TypeScript", "React", "PostgreSQL"],
              features: p.features || [],
              benefits: p.benefits || [],
              metrics: [
                { label: "Execution", value: "Demonstration Ready" },
                { label: "Ownership", value: "100% Client" },
                { label: "Deployment", value: "Fast Track" },
              ],
              liveUrl: p.liveUrl || undefined }));
            setProjectsList(adapted);
          } else {
            setProjectsList([]);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to load showcase systems from database.");
          setProjectsList([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery, refreshTrigger]);

  const handleOpenInquiry = (project?: ProjectShowcaseItem) => {
    setInquiryTarget(project || null);
    setIsInquiryModalOpen(true);
  };

  return (
    <div className="space-y-12 sm:space-y-20 pb-20 font-sans text-slate-900">
      {/* Header Section */}
      <section className="pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-sm font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>PROJECT SHOWCASE: WHAT WE CAN BUILD</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight max-w-4xl mx-auto leading-tight">
          Selected Systems &amp; Showcases.{" "}
          <span className="text-[#B88E20]">Demonstrating Real Capabilities.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          These showcase projects illustrate the type of digital systems, online storefronts, operations dashboards, and AI tools ST-Solutions designs and builds for businesses of all sizes.
        </p>

        {/* Quick Capabilities Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-sm font-medium text-slate-600">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>100% Source Code Ownership</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tailored to Your Exact Workflow</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero Recurring Tool Licensing</span>
          </span>
        </div>
      </section>

      {/* Search & Filter Controls */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-[#E2E5E0] shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#111827] text-white shadow-sm"
                    : "bg-[#F1F2EE] text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by system or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-xl bg-[#F8F9F5] border border-[#E2E5E0] focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-[#E2E5E0]" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-rose-200 space-y-4">
            <Layers className="w-10 h-10 mx-auto text-rose-400" />
            <h3 className="text-base font-bold text-slate-900">Showcase Systems Temporarily Unavailable</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#111827] rounded-xl hover:bg-[#1F2937] transition-all shadow-sm"
            >
              Retry Loading Showcase
            </button>
          </div>
        ) : projectsList.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#E2E5E0] space-y-4">
            <Layers className="w-10 h-10 mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-900">No showcase projects match your filter</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Try adjusting your search keywords or switch back to All Categories to browse our entire portfolio.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-4 py-2 text-sm font-bold text-white bg-[#111827] rounded-xl hover:bg-[#1F2937]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {projectsList.map((project) => (
              <div
                key={project.id}
                className="rounded-3xl bg-white border border-[#E2E5E0] shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-5">
                  {/* Visual Card Header */}
                  <ProjectCardVisual projectId={project.id} category={project.category} />

                  {/* Category & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F1F2EE] text-sm font-mono font-bold text-slate-800 border border-[#E2E5E0]">
                      {project.category}
                    </span>
                    <span className="flex items-center space-x-1.5 text-sm font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{project.status}</span>
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-950 group-hover:text-amber-700 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-amber-700 font-medium mt-1">
                      {project.tagline}
                    </p>
                    <p className="text-sm text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Target Audience / Solves */}
                  <div className="p-3 rounded-2xl bg-[#F8F9F5] border border-[#E2E5E0] space-y-1.5 text-sm">
                    <div className="flex items-start space-x-1.5 text-slate-700">
                      <Target className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900">For: </span>
                        <span>{project.targetAudience || project.clientType}</span>
                      </div>
                    </div>
                    {project.problemSolved && (
                      <div className="flex items-start space-x-1.5 text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{project.problemSolved}</span>
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {project.metrics.map((m, idx) => (
                      <div key={idx} className="bg-[#F1F2EE] p-2 rounded-xl text-center border border-[#E2E5E0]">
                        <div className="text-sm font-bold text-slate-900 font-mono">{m.value}</div>
                        <div className="text-[9px] text-slate-500 truncate font-medium mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-1 pt-1">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Key Capabilities</div>
                    <div className="space-y-1">
                      {project.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 sm:p-6 bg-[#FAFAF8] border-t border-[#E2E5E0] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/projects/${project.slug || project.id}`}
                      className="text-sm font-bold text-slate-700 hover:text-slate-950 transition-colors underline-offset-2 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>View Full Details</span>
                      <ArrowRight className="w-3 h-3 text-amber-600" />
                    </Link>

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                      >
                        <span>Demo Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenInquiry(project)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#111827] hover:bg-[#1F2937] text-white font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <span>Request Similar Project</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl border border-[#E2E5E0] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 text-sm font-mono font-bold border border-amber-500/30">
                  {selectedProject.category}
                </span>
                <span className="text-sm text-emerald-700 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{selectedProject.status}</span>
                </span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Tagline */}
            <div>
              <h2 className="text-2xl font-bold text-slate-950">{selectedProject.title}</h2>
              <p className="text-sm font-semibold text-amber-700 mt-1">{selectedProject.tagline}</p>
              <p className="text-sm sm:text-sm text-slate-600 mt-3 leading-relaxed">
                {selectedProject.fullDescription || selectedProject.description}
              </p>
            </div>

            {/* Target Audience & Problem Solved */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F8F9F5] border border-[#E2E5E0] text-sm">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Who It Is For</span>
                </span>
                <p className="text-slate-600">{selectedProject.targetAudience || selectedProject.clientType}</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Problem It Solves</span>
                </span>
                <p className="text-slate-600">{selectedProject.problemSolved || "Eliminates operational inefficiency."}</p>
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Features &amp; Functional Modules</h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedProject.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm text-slate-700 bg-[#F1F2EE] p-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Benefits */}
            {selectedProject.benefits && selectedProject.benefits.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Business Benefits</h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {selectedProject.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technology Stack */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Technologies Used</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.technologies.map((t, idx) => (
                  <span key={idx} className="text-sm font-mono bg-[#F1F2EE] text-slate-800 px-2.5 py-1 rounded-lg border border-[#E2E5E0]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal CTAs */}
            <div className="pt-4 border-t border-[#E2E5E0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={companyConfig.contact.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-emerald-600/30 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-sm font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Discuss on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setSelectedProject(null);
                  handleOpenInquiry(selectedProject);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1F2937] text-white text-sm font-bold transition-all shadow-md"
              >
                <span>Request a Quote for this Project</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Intake Modal */}
      {isInquiryModalOpen && (
        <ProjectInquiryModal
          isOpen={isInquiryModalOpen}
          onClose={() => setIsInquiryModalOpen(false)}
          defaultProjectName={inquiryTarget?.title}
        />
      )}
    </div>
  );
};
