import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MessageCircle,
  Phone,
  Mail,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  Send,
  Sparkles,
} from "lucide-react";
import { companyConfig } from "../../data/companyConfig.js";
import { apiClient } from "../../api/client.js";
import { WeChatModal } from "../../components/public/WeChatModal.js";

const projectTypes = [
  "Web Development / Web Portal",
  "Custom Business Software / ERP",
  "AI Solution / LLM Integration",
  "Business Automation & Pipelines",
  "E-Commerce Storefront & Engine",
  "Digital Transformation / Cloud Migration",
  "Custom Digital System",
  "General Consultation / Other",
];

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isWeChatOpen, setIsWeChatOpen] = useState(false);

  const initialService = searchParams.get("service") || "";
  const initialProjectRef = searchParams.get("projectRef") || "";
  const initialGoal = searchParams.get("goal") || "";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    whatsappNumber: "",
    projectType: initialService || projectTypes[0],
    message: initialProjectRef
      ? `Inquiry regarding similar architecture to ${initialProjectRef}. ${initialGoal ? `Our goal is to: ${initialGoal}.` : ""}`
      : initialGoal
      ? `Our goal is to: ${initialGoal}.`
      : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialService) {
      const matched = projectTypes.find((t) => t.toLowerCase().includes(initialService.toLowerCase()));
      if (matched) {
        setFormData((prev) => ({ ...prev, projectType: matched }));
      }
    }
  }, [initialService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill in your name, email, and project details.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const compiledMessage = `[PUBLIC CONTACT INTAKE]
• Requested Service / Domain: ${formData.projectType}
• Message & Requirements:
${formData.message.trim()}
• Provided Phone: ${formData.phoneNumber || "Not provided"}
• Provided WhatsApp: ${formData.whatsappNumber || "Not provided"}`;

    try {
      await apiClient("/client-requests", {
        method: "POST",
        body: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
          whatsappNumber: formData.whatsappNumber.trim() || formData.phoneNumber.trim() || undefined,
          message: compiledMessage,
        },
      });

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "Unable to send message directly. Please contact us directly via WhatsApp or Email."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 font-sans">
      {/* Header Banner */}
      <section className="pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
          <span>Direct Communications</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-3xl mx-auto">
          Start your project with{" "}
          <span className="text-[#D4AF37]">ST-Solutions.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Reach our engineering team directly via WhatsApp, Phone, Email, or through the inquiry form below. We review all technical requirements within 24 hours.
        </p>

        {/* Guided Wizard Recommendation Banner */}
        <div className="pt-2 max-w-2xl mx-auto">
          <Link
            to="/start-project"
            className="p-4 rounded-2xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-between text-slate-900 dark:text-white transition-all group shadow-sm"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold">
                  Prefer a step-by-step guided experience?
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Try our 7-Step Project Wizard for instant brief generation
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-[#D4AF37] flex items-center space-x-1">
              <span>Start Wizard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Main Grid: Left Direct Channels, Right Form */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Direct Contact Hub */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Direct Channels
              </h2>

              <div className="space-y-4">
                {/* WhatsApp */}
                <a
                  href={companyConfig.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 hover:scale-[1.01] transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                      WhatsApp (Fastest Response)
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                      {companyConfig.contact.whatsappDisplay}
                    </div>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href={companyConfig.contact.phoneTel}
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 hover:scale-[1.01] transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400">
                      Direct Phone
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                      {companyConfig.contact.phoneDisplay}
                    </div>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${companyConfig.contact.email}`}
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 hover:scale-[1.01] transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold uppercase text-amber-800 dark:text-amber-400">
                      Official Email
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {companyConfig.contact.email}
                    </div>
                  </div>
                </a>

                {/* WeChat */}
                <button
                  onClick={() => setIsWeChatOpen(true)}
                  className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:scale-[1.01] transition-all group text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-800 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-500">
                      Official WeChat
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Scan to connect
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Operating Response SLA */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Response Guarantee</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All client requests submitted through the form or WhatsApp receive technical assessment and scoping follow-up within 24 hours.
              </p>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Message Dispatched!
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Thank you for contacting ST-Solutions. Our engineering lead has received your specifications and will respond via email/WhatsApp promptly.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={companyConfig.contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Instant Chat on WhatsApp</span>
                    </a>
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({
                          fullName: "",
                          email: "",
                          phoneNumber: "",
                          whatsappNumber: "",
                          projectType: projectTypes[0],
                          message: "",
                        });
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Project Inquiry Form
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Share your business objectives and project requirements with our engineering team.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sarah@company.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        WhatsApp Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        placeholder="+92 325 7263417"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Project Domain / Service
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                    >
                      {projectTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Project Details & Objectives *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your current business challenge, target platform features, desired timeline, or existing software tools..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-950 text-white dark:bg-[#D4AF37] dark:text-black font-bold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Project Request</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WeChat Modal */}
      <WeChatModal isOpen={isWeChatOpen} onClose={() => setIsWeChatOpen(false)} />
    </div>
  );
};
