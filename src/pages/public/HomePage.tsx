import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe,
  Code2,
  Brain,
  Workflow,
  ShoppingBag,
  Cpu,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Phone,
  Mail,
  QrCode,
  ChevronRight,
  Database,
  Sparkles,
  Layers,
  Shield,
  Clock,
  Terminal,
} from "lucide-react";
import { companyConfig, servicesData, projectsData, processSteps } from "../../data/companyConfig.js";
import { HeroArchitectureVisual } from "../../components/public/HeroArchitectureVisual.js";
import { ProjectCardVisual } from "../../components/public/ProjectCardVisual.js";
import { WeChatModal } from "../../components/public/WeChatModal.js";

export const HomePage: React.FC = () => {
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 font-sans">
      {/* 1. HERO SECTION (Light-First, Crisp, Yellow+Black Brand Identity with Subtle Tech Accents) */}
      <section className="relative pt-6 sm:pt-12 pb-8 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle Tech Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline, Description & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Enterprise Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-semibold tracking-wide font-mono">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span>ST-SOLUTIONS • ENGINEERING • AI • AUTOMATION</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
              Technology that moves your{" "}
              <span className="relative inline-block text-slate-950">
                business forward.
                <span className="absolute bottom-1 left-0 right-0 h-2 bg-[#D4AF37]/40 -z-10 rounded-full" />
              </span>
            </h1>

            {/* Brand Subtitle */}
            <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              ST-Solutions engineers custom web applications, mission-critical business software, multi-agent AI systems, and automated pipelines designed around real enterprise workflows.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to="/start-project"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-[#111827] text-white font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-[#1F2937] hover:scale-[1.02] active:scale-[0.98] transition-all border border-[#111827]"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </Link>

              <Link
                to="/solutions"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm border border-[#E2E5E0] transition-all shadow-sm"
              >
                <span>Explore Solutions</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            </div>

            {/* Quick Trust Checks */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-700 font-medium">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero bloated templates</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#B88E20] flex-shrink-0" />
                <span>Direct lead architect oversight</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>100% Source code ownership</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Architecture Topology Visual */}
          <div className="lg:col-span-5 relative">
            <HeroArchitectureVisual />
          </div>
        </div>

        {/* Structured Engineering Metrics Ribbon */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-7xl mx-auto">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E5E0] shadow-sm flex flex-col justify-between space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">SLA Guarantee</span>
              <Clock className="w-3.5 h-3.5 text-[#B88E20]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-950 font-mono">24h</div>
            <div className="text-[11px] text-slate-600 font-medium">Technical scoping response</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E5E0] shadow-sm flex flex-col justify-between space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Stack Standard</span>
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-950 font-mono">100%</div>
            <div className="text-[11px] text-slate-600 font-medium">Full-stack TypeScript & SQL</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E5E0] shadow-sm flex flex-col justify-between space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Security</span>
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-950 font-mono">RBAC</div>
            <div className="text-[11px] text-slate-600 font-medium">Isolated multi-tenant data</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E5E0] shadow-sm flex flex-col justify-between space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Code Rights</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-950 font-mono">Direct</div>
            <div className="text-[11px] text-slate-600 font-medium">Zero vendor lock-in</div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION ("What can we build for your business?") */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#B88E20] uppercase tracking-wider font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight">
            What can we build for your business?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Choose an area below to explore how ST-Solutions engineers technology tailored to your operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {servicesData.slice(0, 6).map((service, index) => {
            const stepNum = `0${index + 1}`;
            return (
              <Link
                key={service.id}
                to={`/services#${service.id}`}
                className="group p-6 sm:p-7 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm hover:shadow-xl hover:border-[#D4AF37] transition-all duration-200 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#F1F2EE] text-slate-900 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors shadow-sm">
                      {service.id === "web-development" && <Globe className="w-5 h-5" />}
                      {service.id === "software-development" && <Code2 className="w-5 h-5" />}
                      {service.id === "ai-solutions" && <Brain className="w-5 h-5" />}
                      {service.id === "business-automation" && <Workflow className="w-5 h-5" />}
                      {service.id === "e-commerce" && <ShoppingBag className="w-5 h-5" />}
                      {service.id === "digital-transformation" && <Cpu className="w-5 h-5" />}
                    </div>
                    <span className="text-xl font-black font-mono text-slate-300 group-hover:text-[#B88E20] transition-colors">
                      {stepNum}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-950 group-hover:text-slate-950 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5 line-clamp-2">
                      {service.shortDesc}
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E2E5E0]/60">
                    {service.builds.slice(0, 2).map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B88E20] flex-shrink-0" />
                        <span className="truncate">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">
                  <span>Explore Engineering Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#B88E20]" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. REAL GENUINE PROJECT SHOWCASE */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>CAPABILITIES &amp; SHOWCASES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              What We Build for Growing Businesses
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              From custom e-commerce and retail POS platforms to operational CRM dashboards and 24/7 AI customer assistants, explore real systems we can build and deploy for your organization.
            </p>
          </div>

          <Link
            to="/projects"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-900 hover:text-amber-700 transition-colors"
          >
            <span>Explore all showcase systems</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {projectsData.slice(0, 3).map((project) => (
            <div
              key={project.id}
              className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm hover:shadow-xl transition-all space-y-5 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Visual Architectural Card */}
                <ProjectCardVisual projectId={project.id} category={project.category} />

                <div className="flex items-center justify-between pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F1F2EE] text-[10px] font-semibold text-slate-800 font-mono">
                    {project.category}
                  </span>
                  <span className="flex items-center space-x-1.5 text-[10px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{project.status}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950 group-hover:text-slate-950 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  {project.metrics.map((m, idx) => (
                    <div key={idx} className="bg-[#F1F2EE] p-2 rounded-xl text-center border border-[#E2E5E0]">
                      <div className="text-xs font-bold text-slate-950 font-mono">{m.value}</div>
                      <div className="text-[9px] text-slate-600 truncate font-medium">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 2).map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono bg-[#F1F2EE] text-slate-700 px-2 py-0.5 rounded-md border border-[#E2E5E0]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <Link
                  to="/projects"
                  className="text-xs font-semibold text-amber-700 hover:underline inline-flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. GUIDED PROJECT INQUIRY CTA BANNER (Intentional Dark Contrast Section) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#111827] text-white border border-[#1F2937] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailored Technical Scoping</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ready to architect your custom solution?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Use our 7-step interactive project architect to specify your business requirements, timeline, and goals. Generate an instant brief for WhatsApp or Email.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/start-project"
              className="px-6 py-3.5 rounded-2xl bg-[#D4AF37] hover:bg-[#E5C158] text-slate-950 font-bold text-sm shadow-xl flex items-center space-x-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>
            <a
              href={companyConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center space-x-2 border border-slate-700"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Direct WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. PROCESS SECTION (01 Discover -> 06 Support) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-10 sm:mb-14">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#B88E20] uppercase tracking-wider font-mono">
            <span>Engineering Discipline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Our 6-Step Delivery Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            From initial problem discovery to ongoing post-launch SLA maintenance, we keep every milestone transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processSteps.map((step) => (
            <div
              key={step.step}
              className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3 relative group hover:border-[#D4AF37] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-[#B88E20] transition-colors">
                  {step.step}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#F1F2EE] text-slate-900 flex items-center justify-center text-xs font-bold font-mono">
                  {step.step}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-950">{step.title}</h3>
              <div className="text-[11px] font-semibold text-[#B88E20] font-mono">{step.tagline}</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FOUNDER / ADMIN PROFILE (Intentional Dark Contrast Section) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#111827] text-white border border-[#1F2937] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-mono">
                <span>Leadership & Systems Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Meet the Founder — {companyConfig.founder.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {companyConfig.founder.bio} Under his leadership, ST-Solutions focuses strictly on pragmatic software craftsmanship, rock-solid database architectures, and business automation that delivers tangible bottom-line results.
              </p>

              <div className="pt-2">
                <a
                  href={companyConfig.founder.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-slate-950 font-bold text-xs shadow-md transition-all group"
                >
                  <span>View Official Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-slate-800 border-2 border-[#D4AF37]/50 flex flex-col items-center justify-center p-6 text-center shadow-2xl space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-[#D4AF37] text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
                  MS
                </div>
                <div className="text-sm font-bold text-white">{companyConfig.founder.name}</div>
                <div className="text-[10px] text-amber-300 font-mono">Founder / Admin</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DIRECT CONTACT & ACTION BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E2E5E0] shadow-xl space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Ready to build or modernize your technology?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Connect directly with our engineering team through your preferred channel. We respond promptly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* WhatsApp Card */}
            <a
              href={companyConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono">
                  Direct
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-950">Chat on WhatsApp</div>
                <div className="text-xs text-slate-600 font-mono mt-0.5">
                  {companyConfig.contact.whatsappDisplay}
                </div>
              </div>
              <div className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
                <span>Start chat</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </a>

            {/* Phone Call Card */}
            <a
              href={companyConfig.contact.phoneTel}
              className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-800 uppercase font-mono">
                  Call
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-950">Call Direct</div>
                <div className="text-xs text-slate-600 font-mono mt-0.5">
                  {companyConfig.contact.phoneDisplay}
                </div>
              </div>
              <div className="text-xs font-semibold text-blue-700 flex items-center space-x-1">
                <span>Call now</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </a>

            {/* Email Card */}
            <a
              href={`mailto:${companyConfig.contact.email}`}
              className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-amber-900 uppercase font-mono">
                  Email
                </span>
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-slate-950">Email Us</div>
                <div className="text-xs text-slate-600 truncate mt-0.5">
                  {companyConfig.contact.email}
                </div>
              </div>
              <div className="text-xs font-semibold text-amber-800 flex items-center space-x-1">
                <span>Send message</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </a>

            {/* WeChat Card */}
            <button
              onClick={() => setIsWeChatModalOpen(true)}
              className="p-5 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] hover:shadow-md transition-all group flex flex-col justify-between space-y-3 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase font-mono">WeChat</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-950">Official WeChat</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Scan to connect
                </div>
              </div>
              <div className="text-xs font-semibold text-slate-900 flex items-center space-x-1">
                <span>Connect</span>
                <ArrowRight className="w-3 h-3 text-[#B88E20]" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* WeChat Modal */}
      <WeChatModal isOpen={isWeChatModalOpen} onClose={() => setIsWeChatModalOpen(false)} />
    </div>
  );
};

