import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShoppingBag,
  Zap,
  LayoutDashboard,
  Brain,
  Users,
  Boxes,
  Layers,
  Cpu,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Building2,
  Activity,
  Store,
  Pill,
  GraduationCap,
  Briefcase,
  Sparkles,
  ChevronRight } from "lucide-react";
import { solutionOptions, industryOptions } from "../../data/companyConfig.js";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

const iconMap: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Boxes: <Boxes className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" /> };

const industryIconMap: Record<string, React.ReactNode> = {
  Activity: <Activity className="w-5 h-5" />,
  Store: <Store className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Pill: <Pill className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Building2: <Building2 className="w-5 h-5" /> };

export const SolutionsPage: React.FC = () => {
  const companyConfig = usePublicCMS();
  const [searchParams] = useSearchParams();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(searchParams.get("goal"));

  useEffect(() => {
    const goalParam = searchParams.get("goal");
    if (goalParam) {
      setSelectedGoal(goalParam);
    }
  }, [searchParams]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 font-sans">
      {/* Header Banner */}
      <section className="pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-sm font-semibold uppercase tracking-wider font-mono">
          <span>Problem-Oriented Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight max-w-3xl mx-auto">
          Technology built around{" "}
          <span className="text-[#8D6D19]">your business.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
          Every business challenges software differently. Tell us what you want to achieve, and we'll show you the exact technological path forward.
        </p>
      </section>

      {/* Problem Options ("I want to...") */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-8 sm:mb-12">
          <div className="text-sm font-mono font-bold text-[#8D6D19] uppercase tracking-wider">
            Discovery Matrix
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            I want to...
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {solutionOptions.map((sol) => {
            const isSelected = selectedGoal === sol.id;
            return (
              <div
                key={sol.id}
                onClick={() => setSelectedGoal(isSelected ? null : sol.id)}
                className={`p-6 rounded-3xl cursor-pointer border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "bg-amber-500/10 border-[#D4AF37] shadow-lg ring-2 ring-[#D4AF37]"
                    : "bg-white border-[#E2E5E0] shadow-sm hover:border-[#D4AF37] hover:shadow-md"
                }`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F1F2EE] text-slate-950 flex items-center justify-center border border-[#E2E5E0]">
                    {iconMap[sol.icon] || <Zap className="w-5 h-5" />}
                  </div>

                  <h3 className="text-base font-bold text-slate-950 leading-snug">
                    {sol.goal}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed flex-grow">
                    {sol.shortDesc}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#E2E5E0] mt-auto">
                  <div className="flex flex-wrap gap-1">
                    {sol.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-sm font-mono bg-[#F1F2EE] text-slate-700 px-2 py-0.5 rounded-md border border-[#E2E5E0]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/contact?service=${encodeURIComponent(sol.recommendedService)}&goal=${encodeURIComponent(sol.goal)}`}
                    className="inline-flex items-center justify-center space-x-1 px-4 py-2 rounded-xl bg-[#111827] text-white text-sm font-bold shadow-sm hover:bg-[#1F2937] transition-all border border-[#111827] w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Request Solution</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Industry Discovery Options */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E2E5E0] shadow-lg space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-sm font-mono font-bold text-[#8D6D19] uppercase tracking-wider">
              Sectors & Environments
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Solutions by Industry
            </h2>
            <p className="text-sm sm:text-sm text-slate-600">
              We design specialized workflows adapted to the regulatory, data, and usability patterns of distinct industries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industryOptions.map((ind, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] space-y-2 hover:border-[#D4AF37] transition-colors"
              >
                <div className="flex items-center space-x-2 text-slate-950 font-bold text-sm sm:text-sm">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#8D6D19] flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                    {industryIconMap[ind.icon] || <Building2 className="w-4 h-4" />}
                  </div>
                  <span>{ind.name}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {ind.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-0 sm:pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#111827] text-white font-bold text-sm shadow-md hover:bg-[#1F2937] hover:scale-[1.02] active:scale-[0.98] transition-all border border-[#111827]"
            >
              <span>Consult with an Industry Architect</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
