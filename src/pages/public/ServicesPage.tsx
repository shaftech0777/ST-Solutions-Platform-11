import React from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Code2,
  Brain,
  Workflow,
  ShoppingBag,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { servicesData, companyConfig } from "../../data/companyConfig.js";

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="w-6 h-6" />,
  Code2: <Code2 className="w-6 h-6" />,
  Brain: <Brain className="w-6 h-6" />,
  Workflow: <Workflow className="w-6 h-6" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
  Layers: <Layers className="w-6 h-6" />,
};

export const ServicesPage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16 font-sans">
      {/* Header Banner */}
      <section className="pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
          <span>Engineering & Solutions</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-3xl mx-auto">
          Tailored Technology for{" "}
          <span className="text-[#D4AF37]">Every Operational Need</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From custom web platforms and core business software to AI integrations and automated event pipelines, explore our comprehensive technical capabilities.
        </p>
      </section>

      {/* Services List Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        {servicesData.map((service, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={service.id}
              id={service.id}
              className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-md scroll-mt-28 transition-all hover:border-[#D4AF37]/50"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Header Column */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-[#D4AF37] flex items-center justify-center shadow-inner">
                      {iconMap[service.icon] || <Code2 className="w-6 h-6" />}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        {service.category}
                      </span>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {service.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {service.fullDesc}
                  </p>

                  {/* Tech stack pills */}
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Core Technologies
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {service.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Service CTA */}
                  <div className="pt-4">
                    <Link
                      to={`/contact?service=${encodeURIComponent(service.title)}`}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-950 text-white dark:bg-[#D4AF37] dark:text-black font-semibold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span>Discuss Your {service.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Right Details Column: What we build & Benefits */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                  {/* What We Build */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-mono">
                      What We Build
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      {service.builds.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Enterprise Benefits */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                      Key Outcomes
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      {service.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <Zap className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom Consultation Box */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-4 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold tracking-tight">
            Not sure which service fits best?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Our engineers can review your current technical setup or business goals and recommend the optimal solution architecture.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all"
            >
              <span>Schedule a Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href={companyConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
            >
              Chat on WhatsApp ({companyConfig.contact.whatsappDisplay})
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
