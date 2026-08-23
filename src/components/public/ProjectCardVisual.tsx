import React from "react";

interface ProjectCardVisualProps {
  projectId: string;
  category?: string;
}

export const ProjectCardVisual: React.FC<ProjectCardVisualProps> = ({ projectId, category }) => {
  if (projectId === "nexora") {
    // NEXORA Enterprise Core: Multi-tenant RBAC, Cryptographic Tokens, DB Nodes
    return (
      <div className="w-full h-48 sm:h-52 bg-slate-950 rounded-2xl relative overflow-hidden flex items-center justify-center p-4 border border-slate-800 group-hover:border-[#D4AF37]/50 transition-colors">
        {/* Subtle background tech grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#d4af37 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
          }}
        />

        {/* Floating Architecture Nodes */}
        <div className="relative z-10 w-full max-w-xs flex flex-col space-y-2.5">
          {/* Top Tenant Header */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-300">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">NEXORA RBAC CORE</span>
            </span>
            <span className="text-[#D4AF37] font-semibold">ISOLATED TENANTS</span>
          </div>

          {/* Core Central Process */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg text-center">
              <div className="text-[9px] font-mono text-slate-400">AUTH</div>
              <div className="text-[11px] font-bold text-amber-400">SHA-256</div>
            </div>
            <div className="bg-slate-900/80 border border-blue-500/30 p-2 rounded-lg text-center">
              <div className="text-[9px] font-mono text-blue-400">DB SCHEMA</div>
              <div className="text-[11px] font-bold text-blue-300">Postgres</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg text-center">
              <div className="text-[9px] font-mono text-slate-400">AUDIT</div>
              <div className="text-[11px] font-bold text-emerald-400">Real-time</div>
            </div>
          </div>

          {/* Lower Stream */}
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 bg-black/40 px-2.5 py-1 rounded border border-slate-800/60">
            <span>&gt; session.verify(token)</span>
            <span className="text-emerald-400 font-bold">200 OK</span>
          </div>
        </div>
      </div>
    );
  }

  if (projectId === "quantum-trading") {
    // Quantum Trading: Low-latency telemetry, order routing graph
    return (
      <div className="w-full h-48 sm:h-52 bg-slate-950 rounded-2xl relative overflow-hidden flex items-center justify-center p-4 border border-slate-800 group-hover:border-[#D4AF37]/50 transition-colors">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative z-10 w-full max-w-xs space-y-2.5">
          {/* Signal Stream Bar */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono">
            <span className="text-blue-400 font-bold">QUANTUM ORDER ENGINE</span>
            <span className="text-emerald-400 font-mono text-[9px]">&lt; 1ms latency</span>
          </div>

          {/* Live Waveform SVG */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 h-16 flex items-center justify-center relative">
            <svg viewBox="0 0 200 40" className="w-full h-full text-blue-500 overflow-visible">
              <path
                d="M 0 25 L 30 20 L 60 30 L 90 10 L 120 18 L 150 8 L 180 22 L 200 12"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 0 30 L 30 28 L 60 35 L 90 20 L 120 26 L 150 15 L 180 30 L 200 22"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle cx="150" cy="8" r="3.5" fill="#38BDF8" />
              <circle cx="90" cy="10" r="3" fill="#D4AF37" />
            </svg>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
            <div className="bg-black/50 border border-slate-800/80 px-2 py-1 rounded text-slate-400 flex justify-between">
              <span>PIPELINE</span>
              <span className="text-white font-bold">ACTIVE</span>
            </div>
            <div className="bg-black/50 border border-slate-800/80 px-2 py-1 rounded text-slate-400 flex justify-between">
              <span>SETTLEMENT</span>
              <span className="text-emerald-400 font-bold">IMMUTABLE</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-Agent LLM Orchestration
  return (
    <div className="w-full h-48 sm:h-52 bg-slate-950 rounded-2xl relative overflow-hidden flex items-center justify-center p-4 border border-slate-800 group-hover:border-[#D4AF37]/50 transition-colors">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#818cf8 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative z-10 w-full max-w-xs space-y-2">
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-300">
          <span className="text-purple-400 font-bold">MULTI-AGENT LLM</span>
          <span className="text-[#D4AF37] text-[9px]">VECTOR RAG</span>
        </div>

        {/* Visual Multi-Agent Nodes */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="bg-purple-950/60 border border-purple-500/40 px-2 py-1 rounded text-[9px] font-mono text-purple-300 text-center">
            Analyst Agent
          </div>
          <span className="text-slate-600 text-xs">→</span>
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/40 px-2.5 py-1 rounded text-[9px] font-mono text-[#D4AF37] font-bold text-center">
            Coordinator
          </div>
          <span className="text-slate-600 text-xs">→</span>
          <div className="bg-blue-950/60 border border-blue-500/40 px-2 py-1 rounded text-[9px] font-mono text-blue-300 text-center">
            Executor
          </div>
        </div>

        {/* Vector Grounding Index */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-[9px] font-mono flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Semantic Vector Index</span>
          </span>
          <span className="text-emerald-400 font-semibold">Schema Verified</span>
        </div>
      </div>
    </div>
  );
};
