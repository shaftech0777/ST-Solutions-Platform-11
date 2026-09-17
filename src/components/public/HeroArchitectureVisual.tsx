import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Code2, Brain, Workflow, ShoppingBag, Sparkles, Check, ArrowDown } from "lucide-react";

interface NodeInfo {
  id: string;
  name: string;
  category: string;
  tag: string;
  icon: React.ElementType;
  color: string;
  accent: string;
  description?: string;
}

const pillars: NodeInfo[] = [
  {
    id: "web",
    name: "Web Platforms",
    category: "High-Performance",
    tag: "React / Vite / SSR",
    icon: Globe,
    color: "from-blue-500/10 to-blue-600/5",
    accent: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  {
    id: "software",
    name: "Custom Software",
    category: "Scalable Logic",
    tag: "Node / Postgres / RBAC",
    icon: Code2,
    color: "from-emerald-500/10 to-emerald-600/5",
    accent: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  {
    id: "ai",
    name: "AI Solutions",
    category: "Intelligence",
    tag: "Gemini / AI Agents / RAG",
    description: "AI systems that understand your business knowledge and automate workflows.",
    icon: Brain,
    color: "from-purple-500/10 to-purple-600/5",
    accent: "text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  {
    id: "automation",
    name: "Automation",
    category: "Streamlined",
    tag: "Webhooks / Queues / Sync",
    description: "Seamlessly connect your tools and eliminate manual data entry.",
    icon: Workflow,
    color: "from-amber-500/10 to-amber-600/5",
    accent: "text-amber-600 dark:text-[#D4AF37] border-amber-200 dark:border-amber-800" },
  {
    id: "ecommerce",
    name: "E-Commerce",
    category: "Transactions",
    tag: "Storefronts & POS",
    description: "Secure, high-converting digital commerce experiences.",
    icon: ShoppingBag,
    color: "from-rose-500/10 to-rose-600/5",
    accent: "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800" },
];

export const HeroArchitectureVisual: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>("ai");

  const selectedPillar = pillars.find((p) => p.id === activeNode) || pillars[2];

  return (
    <div className="relative w-full max-w-lg mx-auto bg-white rounded-3xl border border-[#E2E5E0] shadow-xl p-6 sm:p-7 overflow-hidden font-sans">
      {/* Background Engineering Matrix Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)`,
          backgroundSize: "24px 24px" }}
      />

      {/* Top Architecture Status Bar */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[#E2E5E0]">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-slate-900">
            Our Capabilities
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-mono text-blue-700 font-semibold">
            Secure & Reliable
          </span>
        </div>
      </div>

      {/* Central Interactive Topology */}
      <div className="relative z-10 py-5 space-y-4">
        {/* Top Input Pillars Ribbon */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = activeNode === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActiveNode(pillar.id)}
                aria-pressed={isSelected}
                aria-label={`Select ${pillar.name} capability`}
                className={`flex-1 min-w-[70px] p-2 rounded-xl border text-center transition-all flex flex-col items-center space-y-1 ${
                  isSelected
                    ? "bg-[#111827] text-white border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]"
                    : "bg-[#F1F2EE] border-[#E2E5E0] text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isSelected ? "text-[#D4AF37]" : "text-slate-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold tracking-tight truncate w-full">
                  {pillar.id.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Vector Convergence Routing Lines */}
        <div className="h-10 flex items-center justify-center relative">
          <svg className="w-full h-full text-blue-500" viewBox="0 0 400 40">
            {/* Ambient Connection Pathways */}
            <path
              d="M 50 5 C 100 25, 150 35, 200 35"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-50"
            />
            <path
              d="M 125 5 C 150 20, 175 35, 200 35"
              fill="none"
              stroke="#2563EB"
              strokeWidth="1.5"
              className="opacity-70"
            />
            <path
              d="M 275 5 C 250 20, 225 35, 200 35"
              fill="none"
              stroke="#2563EB"
              strokeWidth="1.5"
              className="opacity-70"
            />
            <path
              d="M 350 5 C 300 25, 250 35, 200 35"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-50"
            />
            {/* Active Highlighted Stream */}
            <path
              d="M 200 5 L 200 35"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="200" cy="20" r="3" fill="#D4AF37" />
          </svg>
        </div>

        {/* The Central ST-SOLUTIONS Enterprise Engine Card (Intentional Dark Contrast Surface) */}
        <div className="p-4 rounded-2xl bg-[#111827] text-white border border-[#1F2937] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-black text-xs font-mono">
                ST
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-tight text-white flex items-center space-x-2">
                  <span>The ST-Solutions Method</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-medium">
                    ACTIVE
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  Custom-built for your business needs
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right text-[10px] font-mono text-slate-300">
              <div>Enterprise Grade</div>
              <div className="text-[#D4AF37] font-semibold">Data Privacy</div>
            </div>
          </div>

          {/* Active Process Spec Preview */}
          <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700 flex justify-between items-center">
              <span className="text-slate-400">SELECTED:</span>
              <span className="text-[#D4AF37] font-bold">{selectedPillar.name}</span>
            </div>
            <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700 flex justify-between items-center">
              <span className="text-slate-400">STACK:</span>
              <span className="text-blue-400 font-bold truncate ml-1" title={selectedPillar.tag}>{selectedPillar.tag}</span>
            </div>
          </div>
          <div className="bg-slate-900/80 mt-2 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-sans leading-snug">
            {selectedPillar.description}
          </div>
        </div>

        {/* Downward Vector Stream to Business Outcome */}
        <div className="flex flex-col items-center py-1">
          <div className="w-0.5 h-6 bg-gradient-to-b from-[#D4AF37] to-blue-600" />
          <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 border border-blue-300 flex items-center justify-center -mt-1 shadow-sm">
            <ArrowDown className="w-3 h-3" />
          </div>
        </div>

        {/* Target: Business Value Output */}
        <div className="p-3.5 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-950">
                Business Value Delivered
              </div>
              <div className="text-[10px] text-slate-600">
                Growth, efficiency, and automated workflows.
              </div>
            </div>
          </div>
          <Link to="/projects" className="text-[11px] font-mono font-bold text-slate-900 bg-[#D4AF37]/20 px-2.5 py-1 rounded-md border border-[#D4AF37]/40 hover:bg-[#D4AF37]/30 transition-colors flex items-center shadow-sm">
            View Case Studies
          </Link>
        </div>
      </div>
    </div>
  );
};
