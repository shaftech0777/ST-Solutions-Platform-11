import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Users,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Layers,
  Clock,
  Code2,
  ChevronRight,
  Share2 } from "lucide-react";
import { showcaseService, ShowcaseProject } from "../../api/services/showcase.service.js";
import { ProjectCardVisual } from "../../components/public/ProjectCardVisual.js";
import { ProjectInquiryModal } from "../../components/public/ProjectInquiryModal.js";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

export const ProjectDetailPage: React.FC = () => {
  const companyConfig = usePublicCMS();
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ShowcaseProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProject = async () => {
      if (!idOrSlug) {
        setError("Project identifier is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const res = await showcaseService.getPublicProject(idOrSlug);
        if (isMounted) {
          const projectData = (res as any)?.data || res;
          if (projectData && (projectData as ShowcaseProject).id) {
            setProject(projectData as ShowcaseProject);
          } else {
            setError("Showcase project not found or no longer available.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Showcase project not found or no longer available.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProject();

    return () => {
      isMounted = false;
    };
  }, [idOrSlug]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-lg" />
        <div className="h-10 w-3/4 bg-slate-200 rounded-xl" />
        <div className="h-6 w-1/2 bg-slate-200 rounded-lg" />
        <div className="h-80 w-full bg-slate-100 rounded-3xl border border-slate-200" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-5">
        <Layers className="w-12 h-12 mx-auto text-slate-400" />
        <h2 className="text-2xl font-extrabold text-slate-950">Showcase Project Not Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {error || "The showcase project you requested could not be retrieved from the portfolio database."}
        </p>
        <div className="pt-4">
          <Link
            to="/projects"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1F2937] text-white text-sm font-bold transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse All Showcase Systems</span>
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = project.category?.name || project.projectType || "Software";

  return (
    <div className="font-sans text-slate-900 pb-20 space-y-12">
      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center space-x-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-950 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link to="/projects" className="hover:text-slate-950 transition-colors">
            Portfolio
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
            {project.title}
          </span>
        </nav>
      </div>

      {/* Main Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Title & Description */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#F1F2EE] text-slate-800 text-sm font-mono font-bold border border-[#E2E5E0]">
                {categoryName}
              </span>
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{project.featured ? "Featured Showcase" : "Capability Showcase"}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              {project.title}
            </h1>

            {project.tagline && (
              <p className="text-base sm:text-lg font-semibold text-amber-700 leading-snug">
                {project.tagline}
              </p>
            )}

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {project.fullDescription || project.description}
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#111827] hover:bg-[#1F2937] text-white text-sm font-bold transition-all shadow-md"
              >
                <span>Request Tailored Quote</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#F8F9F5] hover:bg-slate-200 text-slate-900 border border-[#E2E5E0] text-sm font-bold transition-all"
                >
                  <span>Launch Live Demo</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              )}

              <a
                href={companyConfig.contact.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-sm font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Discuss</span>
              </a>
            </div>
          </div>

          {/* Right Column: Architectural Visual */}
          <div className="lg:col-span-5">
            <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-lg space-y-4">
              <ProjectCardVisual projectId={project.id} category={categoryName} />

              <div className="p-4 rounded-2xl bg-[#F8F9F5] border border-[#E2E5E0] space-y-3">
                <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  System Architecture Summary
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E2E5E0]">
                    <div className="text-slate-500 text-sm">Code Ownership</div>
                    <div className="font-bold text-slate-900 font-mono mt-0.5">100% Client</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E2E5E0]">
                    <div className="text-slate-500 text-sm">Architecture</div>
                    <div className="font-bold text-slate-900 font-mono mt-0.5">Production-Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience & Problem Solved */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-amber-700 font-bold text-sm uppercase tracking-wider">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Target Audience &amp; Industry</span>
            </div>
            <h3 className="text-lg font-bold text-slate-950">Who This System Is Built For</h3>
            <p className="text-sm sm:text-sm text-slate-600 leading-relaxed">
              {project.targetAudience || "Designed for fast-growing businesses, enterprise operators, and independent brands seeking high-performance digital infrastructure."}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Business Bottleneck Eliminated</span>
            </div>
            <h3 className="text-lg font-bold text-slate-950">Core Operational Challenge Solved</h3>
            <p className="text-sm sm:text-sm text-slate-600 leading-relaxed">
              {project.benefits?.[0] || "Eliminates fragmented manual processes, prevents out-of-stock data discrepancies, and gives owners unified real-time visibility."}
            </p>
          </div>
        </div>
      </section>

      {/* Features & Functional Capabilities */}
      {project.features && project.features.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-6">
            <div>
              <div className="text-sm font-bold text-amber-700 uppercase tracking-wider font-mono">
                ENGINEERING SPECIFICATIONS
              </div>
              <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight mt-1">
                Core Modules &amp; Functional Capabilities
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-4 rounded-2xl bg-[#F8F9F5] border border-[#E2E5E0]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Business Benefits & ROI */}
      {project.benefits && project.benefits.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#111827] text-white border border-[#1F2937] shadow-xl space-y-6">
            <div>
              <div className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono">
                BUSINESS IMPACT
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                Measurable ROI &amp; Commercial Benefits
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <p className="text-sm sm:text-sm text-slate-200 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Technologies */}
      {project.technologies && project.technologies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-amber-600" />
              <span>Technology &amp; Architectural Stack</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F1F2EE] text-slate-800 border border-[#E2E5E0] font-mono text-sm font-semibold"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#B88E20] text-slate-950 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              Need a system tailored to your exact business requirements?
            </h3>
            <p className="text-sm sm:text-sm text-slate-900 max-w-xl">
              We design, build, and deploy turnkey operational platforms with complete source code ownership and guaranteed performance.
            </p>
          </div>
          <button
            onClick={() => setIsInquiryModalOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-sm transition-all shadow-md shrink-0"
          >
            Start Project Consultation
          </button>
        </div>
      </section>

      {/* Inquiry Modal */}
      {isInquiryModalOpen && (
        <ProjectInquiryModal
          isOpen={isInquiryModalOpen}
          onClose={() => setIsInquiryModalOpen(false)}
          initialProject={{
            id: project.id,
            title: project.title,
            category: categoryName }}
        />
      )}
    </div>
  );
};
