import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  MessageCircle,
  Mail,
  Copy,
  Check,
  Shield,
  Clock,
  DollarSign,
  UserCheck,
  FileText,
  Smartphone,
  Database,
  Lock,
  Bell,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";
import { apiClient } from "../../api/client.js";
import { companyConfig } from "../../data/companyConfig.js";
import { generateProjectInquiryMessage, ProjectInquiryData } from "../../utils/inquiryMessage.js";

// STEP 1 OPTIONS: What are you looking to build?
const buildTypeOptions = [
  { id: "Website", label: "Website", desc: "Corporate site, landing page, or high-conversion portfolio", icon: Globe },
  { id: "Web Application", label: "Web Application", desc: "Interactive customer portal, SaaS, or web tool", icon: Code2 },
  { id: "E-Commerce Store", label: "E-Commerce Store", desc: "Digital storefront, product catalog & online checkout", icon: ShoppingBag },
  { id: "Business Software", label: "Business Software", desc: "Custom internal ERP, CRM, or management system", icon: Layers },
  { id: "AI System", label: "AI System", desc: "Autonomous agent, vector RAG, LLM or document AI", icon: Brain },
  { id: "Automation", label: "Automation", desc: "Webhook workflows, notification pipelines, sync bridges", icon: Workflow },
  { id: "Mobile/Custom Application", label: "Mobile / Custom App", desc: "PWA, cross-platform mobile or dedicated tool", icon: Smartphone },
  { id: "Custom System", label: "Custom System", desc: "Bespoke proprietary infrastructure & algorithms", icon: Sparkles },
  { id: "Not Sure", label: "Not Sure", desc: "Explore options with an ST-Solutions systems engineer", icon: HelpCircle },
];

// STEP 2 OPTIONS: Industries
const industryOptions = [
  "Retail",
  "E-Commerce",
  "Healthcare",
  "Pharmacy",
  "Education",
  "Professional Services",
  "Startup",
  "SMB",
  "Other",
];

// STEP 3 OPTIONS: Goals
const goalOptions = [
  { id: "Grow Sales", label: "Grow Sales", icon: TrendingUp },
  { id: "Build Online Presence", label: "Build Online Presence", icon: Globe },
  { id: "Automate Work", label: "Automate Work", icon: Zap },
  { id: "Reduce Manual Tasks", label: "Reduce Manual Tasks", icon: SlidersHorizontal },
  { id: "Create Internal Software", label: "Create Internal Software", icon: Layers },
  { id: "Add AI", label: "Add AI Capabilities", icon: Brain },
  { id: "Improve Customer Experience", label: "Improve Customer Experience", icon: UserCheck },
  { id: "Manage Products/Inventory", label: "Manage Products / Inventory", icon: ShoppingBag },
  { id: "Other", label: "Other Objective", icon: Sparkles },
];

// STEP 4 OPTIONS: Features
const featureOptions = [
  { id: "Authentication", label: "Authentication & User Accounts", icon: Lock },
  { id: "Admin Panel", label: "Admin Panel & Management Hub", icon: SlidersHorizontal },
  { id: "Payments", label: "Payments & Invoicing", icon: DollarSign },
  { id: "E-Commerce", label: "E-Commerce & Storefront", icon: ShoppingBag },
  { id: "Inventory", label: "Inventory & Stock Tracking", icon: Layers },
  { id: "Orders", label: "Orders & Fulfillment Pipeline", icon: CheckCircle2 },
  { id: "Dashboard", label: "Analytics Dashboard & Telemetry", icon: BarChart3 },
  { id: "AI", label: "AI Integration & Agents", icon: Brain },
  { id: "Automation", label: "Automated Triggers & Webhooks", icon: Workflow },
  { id: "Notifications", label: "System & Push Notifications", icon: Bell },
  { id: "Email", label: "Email Notifications & Templates", icon: Mail },
  { id: "WhatsApp", label: "WhatsApp Alerts & Integration", icon: MessageCircle },
  { id: "API Integration", label: "REST / Third-Party API Sync", icon: Code2 },
  { id: "Custom Database", label: "Custom Relational Database", icon: Database },
  { id: "Reports", label: "Automated Reports & Exports", icon: FileText },
  { id: "Other", label: "Other Custom Feature", icon: Sparkles },
];

// STEP 5 OPTIONS: Budget
const budgetOptions = [
  { id: "Under $500", label: "Under $500", desc: "Starter website or single workflow automation" },
  { id: "$500–$1,000", label: "$500 – $1,000", desc: "Comprehensive business site or specialized portal" },
  { id: "$1,000–$2,500", label: "$1,000 – $2,500", desc: "Custom business software, SaaS MVP, or AI system" },
  { id: "$2,500+", label: "$2,500+", desc: "Enterprise architecture, multi-tenant system, or large project" },
  { id: "Not Sure", label: "Not Sure", desc: "To be determined following technical scoping" },
];

// STEP 6 OPTIONS: Timeline
const timelineOptions = [
  { id: "ASAP", label: "ASAP (High Priority)", desc: "Immediate kickoff and rapid turnaround" },
  { id: "1–2 Weeks", label: "1–2 Weeks", desc: "Fast-track delivery sprint" },
  { id: "1 Month", label: "1 Month", desc: "Standard production timeline" },
  { id: "1–3 Months", label: "1–3 Months", desc: "Deep multi-phase engineering" },
  { id: "Flexible", label: "Flexible", desc: "Quality and precision focused" },
];

export const StartProjectPage: React.FC = () => {
  // Wizard state (1 through 7, plus 8 for Summary/Confirm)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<ProjectInquiryData>({
    projectTypes: [],
    businessName: "",
    industry: "",
    goals: [],
    features: [],
    additionalRequirements: "",
    budget: "",
    timeline: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
  });

  // Toggle multi-select items
  const toggleSelection = (key: "projectTypes" | "goals" | "features", val: string) => {
    setFormData((prev) => {
      const exists = prev[key].includes(val);
      const updated = exists ? prev[key].filter((item) => item !== val) : [...prev[key], val];
      return { ...prev, [key]: updated };
    });
    setErrorMessage(null);
  };

  const handleStepNext = () => {
    setErrorMessage(null);

    // Validation per step
    if (currentStep === 1) {
      if (formData.projectTypes.length === 0) {
        setErrorMessage("Please select at least one technology or project type.");
        return;
      }
    } else if (currentStep === 7) {
      if (!formData.fullName.trim()) {
        setErrorMessage("Please enter your full name.");
        return;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 8));
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleStepBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Generate standardized message
  const generatedMessage = generateProjectInquiryMessage(formData);

  // Handle Copy to clipboard
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Link
  const whatsappUrl = `https://wa.me/923257263417?text=${encodeURIComponent(generatedMessage)}`;

  // Email Mailto Link
  const mailtoUrl = `mailto:${companyConfig.contact.email}?subject=${encodeURIComponent(
    "New Project Inquiry — ST-Solutions"
  )}&body=${encodeURIComponent(generatedMessage)}`;

  // Submit via API Client in background
  const handleDirectApiSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await apiClient("/client-requests", {
        method: "POST",
        body: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber?.trim() || undefined,
          whatsappNumber: formData.phoneNumber?.trim() || undefined,
          message: generatedMessage,
        },
      });
      setSubmitSuccess(true);
    } catch (err: any) {
      // Gracefully handle - allow direct communication still
      setErrorMessage(
        err.message ||
          "Unable to record submission online. Please use direct WhatsApp or Email buttons below."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F3] dark:bg-[#090A0F] py-10 sm:py-16 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono font-bold uppercase tracking-wider">
            <span>Project Inquiry Builder</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Start a Project with ST-Solutions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Follow this progressive project architect to define your technical requirements, goals, and timeline. Receive a structured project brief ready for WhatsApp, Email, or instant consultation.
          </p>
        </div>

        {/* Step Indicator Ribbon */}
        {currentStep <= 7 && (
          <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Step 0{currentStep} of 07
              </span>
              <span className="text-[#D4AF37] font-semibold">
                {currentStep === 1 && "Technology Scope"}
                {currentStep === 2 && "Business & Industry"}
                {currentStep === 3 && "Primary Objectives"}
                {currentStep === 4 && "Features & Logic"}
                {currentStep === 5 && "Budget Estimation"}
                {currentStep === 6 && "Timeline"}
                {currentStep === 7 && "Contact Details"}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center space-x-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Step Card Container */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-6 sm:p-10 space-y-8">
          {/* STEP 1: What are you looking to build? */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">Step 01</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  What are you looking to build?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Select one or more technologies that match your project vision.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {buildTypeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.projectTypes.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleSelection("projectTypes", opt.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 group ${
                        isSelected
                          ? "bg-[#D4AF37]/10 border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-sm"
                          : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[#D4AF37] text-black font-bold"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:text-[#D4AF37]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-black flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-950 dark:text-white">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
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
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in max-w-xl">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">Step 02</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  Tell us about your business
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Help us understand your organization and domain context.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Business / Project Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.businessName || ""}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Apex Health Clinic / Nexora Retail"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Industry Sector
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {industryOptions.map((ind) => {
                      const isSelected = formData.industry === ind;
                      return (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => setFormData({ ...formData, industry: ind })}
                          className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                            isSelected
                              ? "bg-[#D4AF37] text-black font-bold border-[#D4AF37] shadow-sm"
                              : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {ind}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: What do you want to achieve? */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">Step 03</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  What do you want to achieve?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Select the primary business outcomes driving this project.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {goalOptions.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = formData.goals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleSelection("goals", goal.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[#D4AF37]/10 border-[#D4AF37] ring-1 ring-[#D4AF37]"
                          : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-[#D4AF37] text-black" : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {goal.label}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#D4AF37] stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Features & Requirements */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">Step 04</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  Features & Requirements
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Select key components and provide any custom requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {featureOptions.map((feat) => {
                  const isSelected = formData.features.includes(feat.id);
                  const Icon = feat.icon;
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => toggleSelection("features", feat.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                        isSelected
                          ? "bg-[#D4AF37]/10 border-[#D4AF37] ring-1 ring-[#D4AF37]"
                          : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          isSelected ? "text-[#D4AF37]" : "text-slate-400"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {feat.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Large Textarea for Additional Requirements */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Additional Requirements & Specifications
                </label>
                <textarea
                  rows={4}
                  value={formData.additionalRequirements || ""}
                  onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                  placeholder="Detail any specific workflows, third-party APIs (e.g. Stripe, WhatsApp, Brevo), existing databases, or reference sites..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Estimated Budget */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">Step 05</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  Estimated Budget
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Select a realistic budget range to help us recommend appropriate architecture.
                </p>
              </div>

              <div className="space-y-3">
                {budgetOptions.map((b) => {
                  const isSelected = formData.budget === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, budget: b.id })}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[#D4AF37]/10 border-[#D4AF37] ring-1 ring-[#D4AF37]"
                          : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-950 dark:text-white">
                          {b.label}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {b.desc}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Expected Timeline */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">Step 06</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  Expected Timeline
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  When do you need this system or project completed?
                </p>
              </div>

              <div className="space-y-3">
                {timelineOptions.map((t) => {
                  const isSelected = formData.timeline === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeline: t.id })}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[#D4AF37]/10 border-[#D4AF37] ring-1 ring-[#D4AF37]"
                          : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-950 dark:text-white">
                          {t.label}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t.desc}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Your Contact Details */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-fade-in max-w-xl">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">Step 07</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  Your Contact Details
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Provide your primary contact information for project scoping.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber || ""}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+92 325 7263417"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ""}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Global Ltd"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Project Brief Summary & Direct Dispatch Channels */}
          {currentStep === 8 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase">
                  <span>Project Brief Ready</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  Your Project Brief
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Review your specifications below. Choose your preferred dispatch channel to begin technical consultation with ST-Solutions.
                </p>
              </div>

              {/* Formatted Project Brief Card */}
              <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 font-mono text-xs sm:text-sm leading-relaxed border border-slate-800 shadow-inner relative group">
                <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-slate-300">
                  {generatedMessage}
                </pre>
              </div>

              {/* Three Primary Dispatch Action Buttons */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Send Project Brief
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* WhatsApp Button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Send via WhatsApp →</span>
                  </a>

                  {/* Email Button */}
                  <a
                    href={mailtoUrl}
                    onClick={() => {
                      // Also auto-save in background
                      handleDirectApiSubmit();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-800 dark:border-slate-700 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <span>Send via Email →</span>
                  </a>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-2 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-500 stroke-[3]" />
                        <span className="text-emerald-500">✓ Project brief copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 text-slate-500" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>

                {submitSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Project brief also recorded securely in ST-Solutions client queue.</span>
                  </div>
                )}
              </div>

              {/* Edit Brief Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Project Choices</span>
                </button>
                <span className="text-[11px] text-slate-500">
                  Official WhatsApp: +92 325 7263417
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls (Steps 1 through 7) */}
          {currentStep <= 7 && (
            <div className="pt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleStepBack}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleStepNext}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-950 text-white dark:bg-[#D4AF37] dark:text-black font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>{currentStep === 7 ? "Review Project Brief" : "Continue"}</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] dark:text-black" />
              </button>
            </div>
          )}
        </div>

        {/* Direct Contact Alternative Footer */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="text-xs font-bold uppercase text-slate-500">Direct Engineering Intake</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              Prefer a direct consultation without the wizard?
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={companyConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <Link
              to="/contact"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
            >
              Contact Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
