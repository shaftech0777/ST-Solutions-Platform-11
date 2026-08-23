import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "../components/ui/Button.js";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center shadow-xl">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>

      <div className="space-y-2 max-w-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono font-semibold uppercase">
          404 Not Found
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Page Does Not Exist
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          The requested route or resource could not be found within the ST-Solutions workspace.
        </p>
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
