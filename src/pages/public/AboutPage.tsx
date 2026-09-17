import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Cpu,
  Layers,
  Code2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Compass,
  CheckCircle2,
  Workflow,
  Lock,
  HeartHandshake } from "lucide-react";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

export const AboutPage: React.FC = () => {
  const companyConfig = usePublicCMS();
  return (
    <div className="space-y-16 sm:space-y-24 pb-16 font-sans">
      {/* Header Banner */}
      <section className="pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-sm font-semibold uppercase tracking-wider font-mono">
          <span>Our Story & Philosophy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight max-w-3xl mx-auto">
          Technology should solve problems,{" "}
          <span className="text-[#B88E20]">not create them.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
          ST-Solutions is a technology partner committed to engineering modern, dependable web applications, custom software, and automation systems tailored strictly around real business workflows.
        </p>
      </section>

      {/* Mission & Vision Bento Cards */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Mission Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#111827] text-white border border-[#1F2937] shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#B88E20] flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              To empower modern enterprises and growing businesses with robust, high-performance software systems that eliminate operational bottlenecks, reduce manual friction, and accelerate measurable business growth.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-300 pt-2 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Zero bloated dependencies or fragile templates</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Direct architectural alignment with business logic</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Transparent, milestone-based engineering sprints</span>
              </li>
            </ul>
          </div>

          {/* Vision Card (Intentional Dark Contrast Card) */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#111827] text-white border border-[#1F2937] shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Vision</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              To establish ST-Solutions as the premier technology partner for businesses seeking dependable, scalable, and secure digital infrastructure built with absolute craftsmanship.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-300 pt-2 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Enterprise reliability accessible to growing ventures</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Continuous modernization and cloud resiliency</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Lasting partnerships built on trust and engineering integrity</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Engineering Principles */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            Our Architectural Principles
          </h2>
          <p className="text-sm sm:text-sm text-slate-600 max-w-xl mx-auto">
            How we approach every system, database schema, and user interface.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Strict Type Safety</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We leverage full-stack TypeScript across client and backend systems to eliminate runtime defects and guarantee predictability.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Relational Integrity</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              PostgreSQL and Prisma ORM ensure your critical financial and operational records maintain strict foreign key integrity and ACID guarantees.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Cryptographic Security</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Hashed refresh tokens, multi-tenant workspace isolation, and zero secret leakage in browser bundles.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#B88E20] flex items-center justify-center">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Pragmatic Automation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We automate repetitive human tasks through robust webhook queues, Brevo email triggers, and WhatsApp integrations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Practical AI Utility</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We ground LLMs in your private operational context to build actionable assistants without theoretical hype.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Long-Term Ownership</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              You own your source code, data schemas, and cloud accounts entirely—no proprietary lock-ins.
            </p>
          </div>
        </div>
      </section>

      {/* Founder & Admin Profile (Intentional Dark Contrast Section) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#111827] text-white border border-[#1F2937] shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 text-sm font-bold text-[#D4AF37] uppercase tracking-wider font-mono">
                <span>Founder & Technical Lead</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {companyConfig.founder.name}
              </h2>
              <div className="text-sm text-amber-300 font-mono font-semibold">
                {companyConfig.founder.title}
              </div>
              <p className="text-sm sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {companyConfig.founder.bio} With deep experience across distributed systems, enterprise data pipelines, and responsive client architectures, Muhammad Shaf oversees system design and quality control across every project delivered by ST-Solutions.
              </p>

              <div className="pt-3">
                <a
                  href={companyConfig.founder.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm shadow-md transition-all group hover:bg-slate-100 active:scale-[0.98]"
                >
                  <span>View Official Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-slate-950" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="w-48 h-48 rounded-3xl bg-slate-800 border-2 border-[#D4AF37]/40 flex flex-col items-center justify-center p-6 text-center shadow-xl space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-[#D4AF37] text-slate-950 font-black text-2xl flex items-center justify-center shadow-md">
                  MS
                </div>
                <div className="text-sm font-bold text-white">{companyConfig.founder.name}</div>
                <div className="text-sm text-slate-400 font-mono">ST-Solutions Founder</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E2E5E0] shadow-xl space-y-4 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-950">
            Have a project in mind?
          </h3>
          <p className="text-sm sm:text-sm text-slate-600 max-w-xl mx-auto">
            Schedule a technical consultation to explore the best architecture, timeline, and investment for your requirements.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#111827] text-white font-bold text-sm shadow-md hover:bg-[#1F2937] hover:scale-[1.02] active:scale-[0.98] transition-all border border-[#111827]"
            >
              <span>Contact ST-Solutions</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </Link>
            <Link
              to="/projects"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#E2E5E0] hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-colors shadow-sm"
            >
              Explore Real Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
