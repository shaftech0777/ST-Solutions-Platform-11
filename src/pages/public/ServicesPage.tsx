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
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-semibold uppercase tracking-wider font-mono">
          <span>Engineering & Solutions</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight max-w-3xl mx-auto">
          Tailored Technology for{" "}
          <span className="text-[#B88E20]">Every Operational Need</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
          From custom web platforms and core business software to AI integrations and automated event pipelines, explore our comprehensive technical capabilities.
        </p>
      </section>

      {/* Services List Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        {servicesData.map((service, index) => {
          return (
            <div
              key={service.id}
              id={service.id}
              className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E2E5E0] shadow-md scroll-mt-28 transition-all hover:border-[#D4AF37]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Header Column */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#F1F2EE] text-slate-950 flex items-center justify-center shadow-inner border border-[#E2E5E0]">
                      {iconMap[service.icon] || <Code2 className="w-6 h-6" />}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#B88E20] font-bold">
                        {service.category}
                      </span>
                      <h2 className="text-2xl font-bold text-slate-950">
                        {service.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {service.fullDesc}
                  </p>

                  {/* Tech stack pills */}
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                      Core Technologies
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {service.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#F1F2EE] text-slate-800 text-xs font-mono border border-[#E2E5E0]"
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
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#111827] text-white font-semibold text-xs shadow-md hover:bg-[#1F2937] hover:scale-[1.02] active:scale-[0.98] transition-all border border-[#111827]"
                    >
                      <span>Discuss Your {service.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </Link>
                  </div>
                </div>

                {/* Right Details Column: What we build & Benefits */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F1F2EE] p-6 sm:p-8 rounded-2xl border border-[#E2E5E0]">
                  {/* What We Build */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#B88E20] font-mono">
                      What We Build
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-800 font-medium">
                      {service.builds.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Enterprise Benefits */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
                      Key Outcomes
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-800 font-medium">
                      {service.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <Zap className="w-3.5 h-3.5 text-[#B88E20] flex-shrink-0 mt-0.5" />
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

      {/* Bottom Consultation Box (Intentional Dark Contrast Section) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#111827] text-white border border-[#1F2937] shadow-2xl space-y-4 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold tracking-tight text-white">
            Not sure which service fits best?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Our engineers can review your current technical setup or business goals and recommend the optimal solution architecture.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <span>Schedule a Consultation</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </Link>
            <a
              href={companyConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
            >
              Chat on WhatsApp ({companyConfig.contact.whatsappDisplay})
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
