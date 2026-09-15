import React, { useState } from "react";
import {
  Globe,
  ShoppingBag,
  Code2,
  Brain,
  Workflow,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Zap,
  Building2,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageCircle } from "lucide-react";
import { apiClient } from "../../api/client.js";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

interface WizardData {
  buildType: string;
  businessName: string;
  industry: string;
  mainGoal: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  message: string;
}

const initialWizardData: WizardData = {
  buildType: "",
  businessName: "",
  industry: "",
  mainGoal: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  whatsappNumber: "",
  message: "" };

const buildTypeOptions = [
  { id: "website", label: "Website / Web Portal", desc: "Corporate site, landing page, or portal", icon: Globe },
  { id: "ecommerce", label: "E-Commerce Store", desc: "Online shop, checkout & inventory", icon: ShoppingBag },
  { id: "software", label: "Business Software", desc: "Custom ERP, CRM, or team software", icon: Code2 },
  { id: "ai", label: "AI System / Assistant", desc: "LLM integration, document AI, smart bots", icon: Brain },
  { id: "automation", label: "Automation / Integration", desc: "Workflow, emails, webhook bridges", icon: Workflow },
  { id: "custom", label: "Custom Digital System", desc: "Bespoke proprietary technology", icon: Sparkles },
  { id: "unsure", label: "I'm Not Sure Yet", desc: "Guide me to the right solution", icon: HelpCircle },
];

const goalOptions = [
  { id: "grow-sales", label: "Grow Sales & Revenue", icon: TrendingUp },
  { id: "automate-work", label: "Automate Repetitive Work", icon: Zap },
  { id: "online-presence", label: "Build Strong Online Presence", icon: Globe },
  { id: "internal-system", label: "Create Internal Team System", icon: Layers },
  { id: "use-ai", label: "Integrate AI Capabilities", icon: Brain },
  { id: "improve-existing", label: "Modernize Existing System", icon: Building2 },
  { id: "other", label: "Other Business Objective", icon: Sparkles },
];

const industryOptions = [
  "Healthcare & Pharmacy",
  "Retail & E-Commerce",
  "Professional Services",
  "Education & Training",
  "Logistics & Supply Chain",
  "Tech Startup & SaaS",
  "Small & Medium Business",
  "Other Industry",
];

export const ProjectDiscoveryWizard: React.FC = () => {
  const companyConfig = usePublicCMS();
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<WizardData>(initialWizardData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectBuildType = (val: string) => {
    setData((prev) => ({ ...prev, buildType: val }));
    setErrorMessage(null);
  };

  const handleSelectGoal = (val: string) => {
    setData((prev) => ({ ...prev, mainGoal: val }));
    setErrorMessage(null);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!data.buildType) {
        setErrorMessage("Please select what you are looking to build.");
        return;
      }
    } else if (step === 2) {
      if (!data.businessName.trim()) {
        setErrorMessage("Please enter your business or project name.");
        return;
      }
    } else if (step === 3) {
      if (!data.mainGoal) {
        setErrorMessage("Please select your primary business goal.");
        return;
      }
    }
    setErrorMessage(null);
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setErrorMessage(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.fullName.trim() || !data.email.trim()) {
      setErrorMessage("Please provide your full name and valid email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const compiledMessage = `[PROJECT WIZARD DISCOVERY INTAKE]
• Looking to Build: ${data.buildType}
• Business Name: ${data.businessName}
• Industry: ${data.industry || "Not specified"}
• Main Business Goal: ${data.mainGoal}
• Additional Notes: ${data.message || "None provided"}
• WhatsApp Provided: ${data.whatsappNumber || data.phoneNumber || "None"}`;

    try {
      await apiClient("/client-requests", {
        method: "POST",
        body: {
          fullName: data.fullName.trim(),
          email: data.email.trim(),
          phoneNumber: data.phoneNumber.trim() || undefined,
          whatsappNumber: data.whatsappNumber.trim() || data.phoneNumber.trim() || undefined,
          message: compiledMessage } });

      setIsSuccess(true);
    } catch (err: any) {
      // Do not expose raw backend internals to visitors
      setErrorMessage(
        err.message ||
          "Unable to submit project request at this moment. Please reach us directly on WhatsApp or Email."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setData(initialWizardData);
    setStep(1);
    setIsSuccess(false);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-[#E2E5E0] shadow-xl overflow-hidden font-sans">
      {/* Top Header & Progress Indicator */}
      <div className="p-6 sm:p-8 bg-[#F7F7F3] border-b border-[#E2E5E0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2 font-mono">
              <span>Guided Project Discovery</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-950">
              What do you need to build?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Complete this 4-step wizard to receive a tailored technical recommendation and consultation.
            </p>
          </div>

          {/* Steps Progress */}
          {!isSuccess && (
            <div className="flex items-center space-x-2 self-start sm:self-center font-mono text-xs">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-all ${
                      step === s
                        ? "bg-[#D4AF37] text-black shadow-md scale-105"
                        : step > s
                        ? "bg-[#111827] text-white"
                        : "bg-[#F1F2EE] text-slate-500 border border-[#E2E5E0]"
                    }`}
                  >
                    0{s}
                  </div>
                  {s < 4 && <div className="w-3 h-0.5 bg-[#E2E5E0]" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Wizard Content Area */}
      <div className="p-6 sm:p-8 min-h-[360px] flex flex-col justify-between">
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h4 className="text-2xl font-bold text-slate-950">
                Project Request Dispatched!
              </h4>
              <p className="text-sm text-slate-600">
                Thank you, <strong className="text-slate-950">{data.fullName}</strong>. Our engineering team at ST-Solutions has received your specifications and will follow up with you within 24 hours.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={companyConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Instant Follow-Up on WhatsApp</span>
              </a>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F1F2EE] hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-[#E2E5E0]"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center space-x-2 animate-fade-in font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: What are you looking to build? */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-sm font-bold text-slate-900">
                  Step 1: Choose the type of technology you want to build
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {buildTypeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = data.buildType === opt.label;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectBuildType(opt.label)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 group ${
                          isSelected
                            ? "bg-amber-500/10 border-[#D4AF37] shadow-sm ring-2 ring-[#D4AF37]"
                            : "bg-white border-[#E2E5E0] hover:border-slate-300 hover:bg-[#F7F7F3]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? "bg-[#D4AF37] text-slate-950 font-bold"
                                : "bg-[#F1F2EE] text-slate-700 group-hover:text-[#B88E20]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#B88E20]" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-950">
                            {opt.label}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {opt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Tell us about your business */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in max-w-xl">
                <div className="text-sm font-bold text-slate-900">
                  Step 2: Tell us about your business or project name
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Business or Project Name *
                    </label>
                    <input
                      type="text"
                      value={data.businessName}
                      onChange={(e) => setData({ ...data, businessName: e.target.value })}
                      placeholder="e.g. Apex Health Clinic / Nexora Retail"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={data.industry}
                      onChange={(e) => setData({ ...data, industry: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                    >
                      <option value="">Select an industry...</option>
                      {industryOptions.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: What is your main goal? */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-sm font-bold text-slate-900">
                  Step 3: What is your primary business objective?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goalOptions.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = data.mainGoal === goal.label;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleSelectGoal(goal.label)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-amber-500/10 border-[#D4AF37] ring-2 ring-[#D4AF37]"
                            : "bg-white border-[#E2E5E0] hover:border-slate-300 hover:bg-[#F7F7F3]"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? "bg-[#D4AF37] text-slate-950 font-bold"
                                : "bg-[#F1F2EE] text-slate-700"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-xs sm:text-sm text-slate-950">
                            {goal.label}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#B88E20]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Contact info and final request */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                <div className="text-sm font-bold text-slate-900">
                  Step 4: Where should we send the technical plan and estimate?
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={data.fullName}
                      onChange={(e) => setData({ ...data, fullName: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs focus:border-[#D4AF37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      placeholder="alex@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs focus:border-[#D4AF37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={data.phoneNumber}
                      onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs focus:border-[#D4AF37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      WhatsApp Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={data.whatsappNumber}
                      onChange={(e) => setData({ ...data, whatsappNumber: e.target.value })}
                      placeholder="+92 325 7263417"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs focus:border-[#D4AF37] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Specific requirements or notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={data.message}
                    onChange={(e) => setData({ ...data, message: e.target.value })}
                    placeholder="Describe any existing tools, timelines, or key features you want included..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs focus:border-[#D4AF37] outline-none resize-none"
                  />
                </div>
              </form>
            )}

            {/* Bottom Controls */}
            <div className="pt-4 flex items-center justify-between border-t border-[#E2E5E0]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-[#E2E5E0] hover:bg-[#F1F2EE] text-xs font-semibold text-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#111827] text-white font-semibold text-xs shadow-md hover:bg-[#1F2937] active:scale-[0.98] transition-all border border-[#111827]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#111827] text-white font-bold text-xs shadow-md hover:bg-[#1F2937] active:scale-[0.98] transition-all disabled:opacity-50 border border-[#111827]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Project Request</span>
                      <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
