import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { Input, PasswordInput } from "../components/ui/Input.js";
import { Button } from "../components/ui/Button.js";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Invalid credentials or unauthorized account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickAccount = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Emblem */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B88E20] text-black font-black text-xl shadow-xl shadow-amber-500/10 border border-amber-300/40 mb-2">
            ST
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ST-SOLUTIONS</h1>
          <p className="text-xs text-amber-400 font-mono uppercase tracking-widest font-semibold">
            Shaf Tech Enterprise Gateway
          </p>
        </div>

        {/* Card Form Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37]" />

          <h2 className="text-lg font-bold text-white mb-1">Account Authentication</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter your credentials to access your tenant workspace
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="admin@st-solutions.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <PasswordInput
              label="Password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            />

            <Button
              type="submit"
              variant="gold"
              fullWidth
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Platform
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/register" className="text-xs text-slate-400 hover:text-[#D4AF37] transition-colors">
              Don't have an account yet? <span className="font-semibold text-[#D4AF37]">Sign Up</span>
            </Link>
          </div>

          {/* Quick Demo Login Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => fillQuickAccount("admin@st-solutions.com", "AdminPass123!")}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 hover:text-white transition-colors"
              >
                <span className="block font-bold text-[#D4AF37]">Super Admin</span>
                <span className="text-[10px] text-slate-500">admin@st-solutions.com</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount("user@st-solutions.com", "UserPass123!")}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 hover:text-white transition-colors"
              >
                <span className="block font-bold text-amber-200">Standard User</span>
                <span className="text-[10px] text-slate-500">user@st-solutions.com</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Encrypted Tenant JWT Authentication Engine</span>
        </div>
      </div>
    </div>
  );
};
