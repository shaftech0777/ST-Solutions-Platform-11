import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, User, Building2, ArrowRight, AlertCircle, Sparkles, CheckCircle2, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { Input, PasswordInput } from "../components/ui/Input.js";
import { Button } from "../components/ui/Button.js";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedOrg = organizationName.trim();

    if (trimmedFullName.length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName: trimmedFullName,
        email: trimmedEmail,
        password,
        organizationName: trimmedOrg || undefined,
      });
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.data?.message || err.data?.error || err.message || "Registration failed. Please check your details.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Left Column: Brand Hero Banner (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-[#12131A] border-r border-slate-800/80 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B88E20] text-black font-black text-xl flex items-center justify-center shadow-xl shadow-amber-500/10 border border-amber-300/40 select-none">
            ST
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">ST-SOLUTIONS</span>
            <span className="text-[11px] text-[#D4AF37] font-mono tracking-widest uppercase block">
              Shaf Tech Solutions
            </span>
          </div>
        </div>

        <div className="space-y-6 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Join the Enterprise Ecosystem
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Provision your account with enterprise security.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Gain immediate access to provision isolated organizations, collaborate across workspaces, and govern enterprise systems.
          </p>

          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Instant organization and workspace provisioning</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Granular role assignments and tenant segregation</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Direct access to the AI intelligence engine</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-6 border-t border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <span>Encrypted Identity Vault</span>
          </div>
          <span>© 2026 Shaf Tech Solutions</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B88E20] text-black font-black text-xl shadow-xl shadow-amber-500/10 border border-amber-300/40 mb-2">
              ST
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">ST-SOLUTIONS</h1>
            <p className="text-xs text-amber-400 font-mono uppercase tracking-widest font-semibold">
              Account Provisioning
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37]" />

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-400 mt-1">
                Setup your credentials to join or create an enterprise organization
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                required
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="Email Address"
                type="email"
                required
                placeholder="jane@st-solutions.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="Organization / Company Name (Optional)"
                type="text"
                placeholder="Acme Corp"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
                hint="If specified, an isolated organization and workspace will be created for you."
              />

              <PasswordInput
                label="Password"
                required
                placeholder="•••••••••••• (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              />

              <Button
                type="submit"
                variant="gold"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-5 text-center space-y-2">
              <Link to="/login" className="text-xs text-slate-400 hover:text-[#D4AF37] transition-colors block">
                Already have an account? <span className="font-semibold text-[#D4AF37]">Sign In</span>
              </Link>
              <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1">
                <span>← Return to Public Website</span>
              </Link>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Encrypted Tenant JWT Authentication Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};


