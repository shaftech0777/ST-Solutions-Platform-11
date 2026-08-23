import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { Button } from "../components/ui/Button.js";

export const AccessDeniedPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/5">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-slate-400">
          <Lock className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#D4AF37] text-xs font-mono font-semibold uppercase">
          403 Access Restricted
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Permission Required
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          You do not have the required operational or governance privileges to access this module.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-left w-full max-w-sm space-y-2 font-mono">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Active Identity:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-200">{currentUser?.profile?.fullName || currentUser?.email || "Unknown"}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Operational Role:</span>
          <span className="font-bold text-[#D4AF37]">{currentUser?.accountType || "MEMBER"}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          variant="ghost"
          size="md"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Go Back
        </Button>
        <Link to="/">
          <Button
            variant="gold"
            size="md"
            leftIcon={<LayoutDashboard className="w-4 h-4" />}
          >
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
