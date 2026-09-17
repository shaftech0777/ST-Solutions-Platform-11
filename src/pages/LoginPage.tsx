import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Building2, CheckCircle2, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { Input, PasswordInput } from "../components/ui/Input.js";
import { Button } from "../components/ui/Button.js";

export const LoginPage: React.FC = () => {
  const { login, currentUser, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && !isAuthLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, isAuthLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setError("Please enter your email address or User ID");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ identifier: trimmedIdentifier, email: trimmedIdentifier, password });
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.data?.message || err.data?.error || err.message || "Invalid credentials or unauthorized access";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Left Column: Brand Hero Banner (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-[#12131A] border-r border-slate-200 dark:border-slate-800/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative gold glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Emblem */}
        <div className="flex items-center gap-3 relative z-10">
          <img src="/favicon.svg" alt="ST-Solutions Logo" className="w-12 h-12 shrink-0 drop-shadow-md" />
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block">ST-SOLUTIONS</span>
            <span className="text-sm text-[#D4AF37] font-mono tracking-widest uppercase block">
              Shaf Tech Solutions
            </span>
          </div>
        </div>

        {/* Middle Brand Value Proposition */}
        <div className="space-y-6 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Enterprise Operations Platform
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Unified workspace telemetry & organizational governance.
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Manage multi-tenant organizations, project lifecycles, talent pipelines, and automated intelligence from one command center.
          </p>

          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Multi-tenant isolation with fine-grained RBAC authorization</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Enterprise financial ledger, client delivery, and recruitment pipeline</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Immutable security audit logging and automated AI assistant</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="flex items-center justify-between text-sm text-slate-500 font-mono pt-6 border-t border-slate-200 dark:border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <span>Secure SHA-256 Auth</span>
          </div>
          <span>© 2026 Shaf Tech Solutions</span>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Emblem */}
          <div className="lg:hidden text-center space-y-2 mb-6">
            <img src="/favicon.svg" alt="ST-Solutions Logo" className="w-14 h-14 mx-auto mb-2 drop-shadow-md" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">ST-SOLUTIONS</h1>
            <p className="text-sm text-amber-400 font-mono uppercase tracking-widest font-semibold">
              Shaf Tech Enterprise Gateway
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37]" />

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sign In</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your authorized credentials to access your organization workspace
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address or User ID"
                type="text"
                required
                placeholder="admin@st-solutions.com or user-manager-1"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                hint="Admins/Sub-Admins use Email. Managers/Members can use Email or assigned User ID."
              />

              <PasswordInput
                label="Password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
              />

              <Button
                type="submit"
                variant="gold"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Platform
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 text-center space-y-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-left space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-sm font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Administrative Access Only</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Sign in using your assigned administrator email or provisioned organizational User ID and password.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/" className="text-sm text-slate-500 hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1">
                  <span>← Return to Public Website</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-slate-500 flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Encrypted Tenant JWT Authentication Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

