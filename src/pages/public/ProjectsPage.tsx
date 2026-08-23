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
} from "lucide-react";
import { projectsData, ProjectShowcaseItem, companyConfig } from "../../data/companyConfig.js";
import { ProjectCardVisual } from "../../components/public/ProjectCardVisual.js";

const categories = ["All", "Web", "Software", "AI", "Automation", "E-Commerce"] as const;

export const ProjectsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<ProjectShowcaseItem | null>(null);

  const filteredProjects =
    selectedCategory === "All"
      ? projectsData
      : projectsData.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 font-sans">
      {/* Header Banner */}
      <section className="pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
          <Database className="w-3.5 h-3.5" />
          <span>Production Systems Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-3xl mx-auto">
          Proven Systems.{" "}
          <span className="text-[#D4AF37]">Engineered for High Reliability.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
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
                  ? "bg-slate-950 text-white dark:bg-[#D4AF37] dark:text-black shadow-md"
                  : "bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
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
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3">
            <Layers className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No showcased projects in this category currently.
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-xs font-bold text-[#D4AF37] hover:underline"
            >
              View All Featured Systems
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/60 transition-all duration-200 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  {/* Visual SVG/CSS Architecture Graphic */}
                  <ProjectCardVisual projectId={project.id} category={project.category} />

                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      {project.category}
                    </span>
                    <span className="flex items-center space-x-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{project.status}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-amber-600 dark:text-[#D4AF37] font-medium mt-0.5">
                      {project.tagline}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {project.metrics.map((m, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900/80 p-2 rounded-xl text-center">
                        <div className="text-xs font-bold text-[#D4AF37] font-mono">{m.value}</div>
                        <div className="text-[9px] text-slate-500 truncate">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="text-xs font-semibold text-slate-900 dark:text-white hover:text-[#D4AF37] transition-colors"
                    >
                      View Specs & Flow
                    </button>

                    <Link
                      to="/start-project"
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-[#D4AF37] hover:underline"
                    >
                      <span>Build Similar</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
            className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-mono font-bold">
                  {selectedProject.category}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{selectedProject.status}</span>
                </span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {selectedProject.title}
              </h2>
              <div className="text-xs font-semibold text-amber-600 dark:text-[#D4AF37] mt-1">
                {selectedProject.tagline}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                {selectedProject.description}
              </p>
            </div>

            {/* Architectural Highlights & Features */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-slate-900 dark:text-white tracking-wider">
                Engineering Highlights & Capabilities
              </div>
              <div className="space-y-2">
                {selectedProject.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack Chips */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-slate-900 dark:text-white tracking-wider">
                Technology Stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                to="/start-project"
                onClick={() => setSelectedProject(null)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 text-white dark:bg-[#D4AF37] dark:text-black font-bold text-xs shadow-md text-center"
              >
                Start a Similar Project →
              </Link>
              <a
                href={companyConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Discuss with Lead Architect</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CTA Bottom Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold">Have a custom software or AI vision?</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              We design and engineer systems around your proprietary business requirements.
            </p>
          </div>
          <Link
            to="/start-project"
            className="px-6 py-3.5 rounded-2xl bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition-transform hover:scale-[1.02]"
          >
            <span>Start a Project</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
