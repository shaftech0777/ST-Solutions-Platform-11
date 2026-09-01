import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Code2,
  Brain,
  Workflow,
  ShoppingBag,
  Globe,
  ArrowRight,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  Database,
  Cpu,
  MessageCircle,
  FileText,
} from "lucide-react";
import { projectsData, ProjectShowcaseItem, companyConfig } from "../../data/companyConfig.js";
import { ProjectCardVisual } from "../../components/public/ProjectCardVisual.js";
import { ProjectInquiryModal } from "../../components/public/ProjectInquiryModal.js";

const categories = ["All", "Web", "Software", "AI", "Automation", "E-Commerce"] as const;

export const ProjectsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<ProjectShowcaseItem | null>(null);
  const [inquiryTarget, setInquiryTarget] = useState<ProjectShowcaseItem | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const handleOpenInquiry = (project?: ProjectShowcaseItem) => {
    setInquiryTarget(project || null);
    setIsInquiryModalOpen(true);
  };

  const filteredProjects =
    selectedCategory === "All"
      ? projectsData
      : projectsData.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 font-sans">
      {/* Header Banner */}
      <section className="pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-semibold uppercase tracking-wider font-mono">
          <Database className="w-3.5 h-3.5" />
          <span>Production Systems Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight max-w-3xl mx-auto">
          Proven Systems.{" "}
          <span className="text-[#B88E20]">Engineered for High Reliability.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
          Explore genuine platforms, algorithmic pipelines, and multi-agent reasoning engines architected and deployed by ST-Solutions.
        </p>
      </section>

      {/* Category Filter Navigation */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-[#111827] text-white shadow-md border border-[#111827]"
                  : "bg-white text-slate-800 border border-[#E2E5E0] hover:bg-[#F1F2EE]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#E2E5E0] space-y-3">
            <Layers className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-semibold text-slate-800">
              No showcased projects in this category currently.
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-xs font-bold text-[#B88E20] hover:underline"
            >
              View All Featured Systems
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm hover:shadow-xl hover:border-[#D4AF37] transition-all duration-200 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  {/* Visual SVG/CSS Architecture Graphic */}
                  <ProjectCardVisual projectId={project.id} category={project.category} />

                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F1F2EE] text-[10px] font-mono font-bold text-slate-800 border border-[#E2E5E0]">
                      {project.category}
                    </span>
                    <span className="flex items-center space-x-1.5 text-[10px] font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{project.status}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-950 group-hover:text-[#B88E20] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#B88E20] font-semibold mt-0.5">
                      {project.tagline}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E5E0]">
                    {project.metrics.map((m, idx) => (
                      <div key={idx} className="bg-[#F1F2EE] p-2 rounded-xl text-center border border-[#E2E5E0]">
                        <div className="text-xs font-bold text-[#B88E20] font-mono">{m.value}</div>
                        <div className="text-[9px] text-slate-600 truncate font-medium">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#E2E5E0]">
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-[#F1F2EE] text-slate-700 px-2 py-0.5 rounded-md border border-[#E2E5E0]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E5E0]">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="text-xs font-bold text-slate-950 hover:text-[#B88E20] transition-colors"
                    >
                      View Specs & Flow
                    </button>

                    <button
                      onClick={() => handleOpenInquiry(project)}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#B88E20] hover:underline"
                    >
                      <span>Inquire / Build</span>
                      <ArrowRight className="w-3 h-3 text-[#B88E20]" />
                    </button>
                  </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 text-xs font-mono font-bold border border-amber-500/30">
                  {selectedProject.category}
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
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

            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">
                {selectedProject.title}
              </h2>
              <div className="text-xs font-bold text-[#B88E20] mt-1">
                {selectedProject.tagline}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3">
                {selectedProject.description}
              </p>
            </div>

            {/* Architectural Highlights & Features */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-slate-950 tracking-wider font-mono">
                Engineering Highlights & Capabilities
              </div>
              <div className="space-y-2">
                {selectedProject.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 p-3 rounded-xl bg-[#F1F2EE] border border-[#E2E5E0] text-xs text-slate-800 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#B88E20] flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack Chips */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-slate-950 tracking-wider font-mono">
                Technology Stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-[#F1F2EE] text-xs font-mono text-slate-800 border border-[#E2E5E0]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-[#E2E5E0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  const p = selectedProject;
                  setSelectedProject(null);
                  handleOpenInquiry(p);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#111827] text-white font-bold text-xs shadow-md text-center hover:bg-[#1F2937] transition-all border border-[#111827] flex items-center justify-center space-x-2"
              >
                <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Submit Inquiry For This System →</span>
              </button>
              <a
                href={companyConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Lead Architect</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Public Project Inquiry Modal */}
      <ProjectInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        initialProject={inquiryTarget}
      />

      {/* CTA Bottom Banner (Intentional Dark Contrast Section) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#111827] text-white border border-[#1F2937] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">Have a custom software or AI vision?</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              We design and engineer systems around your proprietary business requirements.
            </p>
          </div>
          <Link
            to="/start-project"
            className="px-6 py-3.5 rounded-2xl bg-[#D4AF37] hover:bg-[#E5C158] text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition-transform hover:scale-[1.02]"
          >
            <span>Start a Project</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
