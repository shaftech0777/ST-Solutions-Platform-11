import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Shield, AlertTriangle, Lock } from "lucide-react";
import { Button } from "../components/ui/Button.js";

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Subtle decorative gold glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Emblem */}
        <div className="text-center space-y-2 mb-4">
          <img src="/favicon.svg" alt="ST-Solutions Logo" className="w-14 h-14 mx-auto mb-2 drop-shadow-md" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">ST-SOLUTIONS</h1>
          <p className="text-sm text-amber-400 font-mono uppercase tracking-widest font-semibold">
            Shaf Tech Enterprise Gateway
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37]" />

          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#D4AF37] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Public Registration Disabled</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              ST-Solutions operates on a strict administrative provisioning model. Public account self-registration is closed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-left space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2 text-amber-400 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Administrative Provisioning Only</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              New team member, manager, and subordinate accounts can only be issued by an authorized <strong>Administrator</strong> or <strong>Sub-Administrator</strong> from within the system management console.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link to="/login" className="block">
              <Button variant="gold" fullWidth size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Sign In
              </Button>
            </Link>

            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors inline-block pt-2"
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Encrypted Tenant Identity & Access Control</span>
        </div>
      </div>
    </div>
  );
};


