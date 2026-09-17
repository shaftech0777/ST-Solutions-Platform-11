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
  Phone,
  CheckCheck,
  ChevronDown,
  Award } from "lucide-react";
import { apiClient } from "../../api/client.js";
import { usePublicCMS } from "../../context/PublicCMSContext.js";
import { generateProjectInquiryMessage, ProjectInquiryData } from "../../utils/inquiryMessage.js";

// STEP 1 OPTIONS: Technology Scope
const buildTypeOptions = [
  { id: "Website", label: "Website", desc: "Corporate site, landing page, or high-conversion portfolio", icon: Globe },
  { id: "Web Application", label: "Web Application", desc: "Interactive customer portal, SaaS, or web tool", icon: Code2 },
  { id: "E-Commerce Store", label: "E-Commerce Store", desc: "Digital storefront, product catalog & online checkout", icon: ShoppingBag },
  { id: "Business Software", label: "Business Software", desc: "Custom internal ERP, CRM, or management system", icon: Layers },
  { id: "AI System", label: "AI System", desc: "Autonomous agent, vector RAG, LLM or document AI", icon: Brain },
  { id: "Automation", label: "Automation", desc: "Webhook workflows, notification pipelines, sync bridges", icon: Workflow },
  { id: "Mobile / Custom App", label: "Mobile / Custom App", desc: "PWA, cross-platform mobile or dedicated tool", icon: Smartphone },
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
  "Manufacturing",
  "Logistics",
  "Real Estate",
  "Other",
];

// STEP 3 OPTIONS: Goals
const goalOptions = [
  { id: "Grow Sales", label: "Grow Sales", icon: TrendingUp, desc: "Increase revenue, conversions, and market reach" },
  { id: "Build Online Presence", label: "Build Online Presence", icon: Globe, desc: "Modern brand authority and customer trust" },
  { id: "Automate Work", label: "Automate Work", icon: Zap, desc: "Eliminate repetitive manual tasks and human errors" },
  { id: "Reduce Manual Tasks", label: "Reduce Manual Tasks", icon: SlidersHorizontal, desc: "Streamline daily operational workflows" },
  { id: "Create Internal Software", label: "Create Internal Software", icon: Layers, desc: "Bespoke tools for team coordination and data" },
  { id: "Add AI Capabilities", label: "Add AI Capabilities", icon: Brain, desc: "Smart search, automated insights, or assistants" },
  { id: "Improve Customer Experience", label: "Improve Customer Experience", icon: UserCheck, desc: "Fast, delightful user journeys and support" },
  { id: "Manage Products / Inventory", label: "Manage Products / Inventory", icon: ShoppingBag, desc: "Real-time stock, orders, and catalog sync" },
  { id: "Other Objective", label: "Other Custom Objective", icon: Sparkles, desc: "Specific domain goals and custom milestones" },
];

// STEP 4 OPTIONS: Features
const featureOptions = [
  { id: "Authentication", label: "User Accounts & Authentication", icon: Lock },
  { id: "Admin Panel", label: "Admin Management Hub", icon: SlidersHorizontal },
  { id: "Payments", label: "Payments & Invoicing", icon: DollarSign },
  { id: "E-Commerce", label: "Product Catalog & Storefront", icon: ShoppingBag },
  { id: "Inventory", label: "Inventory & Stock Tracking", icon: Layers },
  { id: "Orders", label: "Orders & Fulfillment Pipeline", icon: CheckCircle2 },
  { id: "Dashboard", label: "Analytics Dashboard & Telemetry", icon: BarChart3 },
  { id: "AI Integration", label: "AI Integration & Agents", icon: Brain },
  { id: "Automation", label: "Automated Triggers & Webhooks", icon: Workflow },
  { id: "Push Notifications", label: "Push & System Notifications", icon: Bell },
  { id: "Email Integration", label: "Email Notifications & Templates", icon: Mail },
  { id: "WhatsApp Alerts", label: "WhatsApp Alerts & Sync", icon: MessageCircle },
  { id: "API Integration", label: "REST / Third-Party API Sync", icon: Code2 },
  { id: "Custom Database", label: "Custom Relational Database", icon: Database },
  { id: "Reports", label: "Automated Reports & Exports", icon: FileText },
  { id: "Other", label: "Other Custom Feature", icon: Sparkles },
];

// STEP 5 OPTIONS: Project Quality / Level (5 choices - NO FIXED PRICES)
const qualityLevels = [
  {
    id: "Starter",
    badge: "Core Essentials",
    title: "Starter",
    desc: "A clean and focused solution for getting started with fundamental capabilities.",
    features: ["Clean UI architecture", "Essential functionality", "Mobile responsive", "Production ready"] },
  {
    id: "Professional",
    badge: "Business Ready",
    title: "Professional",
    desc: "A polished business-grade solution with essential features and robust integrations.",
    features: ["Custom business workflows", "Role access control", "Optimized performance", "Standard third-party sync"] },
  {
    id: "Advanced",
    badge: "Extended Scope",
    title: "Advanced",
    desc: "A more powerful system with advanced functionality, custom data flows, and deep logic.",
    features: ["Advanced automated pipelines", "Multi-role dashboard", "Relational database", "Telemetry & analytics"] },
  {
    id: "Premium",
    badge: "High Craftsmanship",
    title: "Premium",
    desc: "A highly refined, feature-rich solution with advanced UX, top-tier reliability, and architecture.",
    features: ["Bespoke micro-interactions", "High-throughput APIs", "AI / Automation synergy", "Dedicated QA auditing"] },
  {
    id: "Enterprise",
    badge: "Mission Critical",
    title: "Enterprise",
    desc: "A large-scale, highly customized solution designed for complex business requirements and scaling.",
    features: ["Multi-tenant isolation", "Comprehensive audit trails", "Maximum resilience", "Bespoke SLA support"] },
];

// STEP 6 OPTIONS: Timeline
const timelineOptions = [
  { id: "ASAP", label: "ASAP (High Priority)", desc: "Immediate kickoff and rapid turnaround sprint" },
  { id: "1–2 Weeks", label: "1–2 Weeks", desc: "Fast-track delivery cycle" },
  { id: "1 Month", label: "1 Month", desc: "Standard structured production timeline" },
  { id: "2–3 Months", label: "2–3 Months", desc: "Deep multi-phase engineering and testing" },
  { id: "Flexible", label: "Flexible", desc: "Quality, iteration, and precision focused" },
];

const currencyOptions = ["PKR", "USD", "EUR", "GBP", "AED", "CNY", "Other"];

export const StartProjectPage: React.FC = () => {
  const companyConfig = usePublicCMS();
  // Wizard state (1 through 7, plus 8 for Review & Dispatch)
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
    qualityLevel: "Professional",
    timeline: "1 Month",
    budgetKnown: false,
    budgetAmount: "",
    budgetCurrency: "PKR",
    budget: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    whatsappNumber: "",
    companyName: "" });

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
        setErrorMessage("Please select at least one technology or project scope option.");
        return;
      }
    } else if (currentStep === 5) {
      if (!formData.qualityLevel) {
        setErrorMessage("Please select a project quality level.");
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
      if (!formData.whatsappNumber.trim()) {
        setErrorMessage("Please enter your WhatsApp number for direct project consultation.");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 8));
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  const handleStepBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  // Compile final budget string based on user inputs
  const resolvedBudget = formData.budgetKnown && formData.budgetAmount?.trim()
    ? `${formData.budgetCurrency || "PKR"} ${formData.budgetAmount.trim()}`
    : "Not decided yet";

  const consolidatedData: ProjectInquiryData = {
    ...formData,
    budget: resolvedBudget };

  // Generate standardized message
  const generatedMessage = generateProjectInquiryMessage(consolidatedData);

  // Handle Copy to clipboard
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // WhatsApp Link
  const whatsappUrl = `https://wa.me/923257263417?text=${encodeURIComponent(generatedMessage)}`;

  // Email Mailto Link
  const mailtoUrl = `mailto:stsolutionsofficial@gmail.com?subject=${encodeURIComponent(
    `ST-Solutions Project Inquiry — ${formData.projectTypes.join(", ") || "New Project"}`
  )}&body=${encodeURIComponent(generatedMessage)}`;

  // Direct Phone Link
  const phoneUrl = `tel:+923257263417`;

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
          whatsappNumber: formData.whatsappNumber?.trim() || undefined,
          message: generatedMessage } });
      setSubmitSuccess(true);
    } catch {
      // Gracefully silent - direct contact options are always functional
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F3] py-10 sm:py-16 text-slate-950 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-sm font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#B88E20]" />
            <span>Interactive Project Architect</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950">
            Start a Project with ST-Solutions
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Follow this progressive project architect to define your scope, features, and timeline. Get an instant structured brief ready for WhatsApp, Email, or direct consultation.
          </p>
        </div>

        {/* Step Indicator Ribbon */}
        {currentStep <= 7 && (
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E5E0] shadow-sm">
            <div className="flex items-center justify-between text-sm font-mono mb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span className="font-bold text-slate-950">
                  Step 0{currentStep} of 07
                </span>
              </div>
              <span className="text-[#B88E20] font-bold">
                {currentStep === 1 && "Technology Scope"}
                {currentStep === 2 && "Industry & Business"}
                {currentStep === 3 && "Business Goals"}
                {currentStep === 4 && "Features & Specifications"}
                {currentStep === 5 && "Project Quality Level"}
                {currentStep === 6 && "Timeline & Budget"}
                {currentStep === 7 && "Contact Details"}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-sm sm:text-sm flex items-center space-x-2.5 animate-fade-in font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Step Card Container */}
        <div className="bg-white rounded-3xl border border-[#E2E5E0] shadow-md p-6 sm:p-10 space-y-8">
          {/* STEP 1: What are you looking to build? */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-sm font-mono font-bold text-[#B88E20] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>Step 01 • Technology Scope</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  What are you looking to build?
                </h2>
                <p className="text-sm sm:text-sm text-slate-600">
                  Select one or more technologies and platforms matching your project vision.
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
                      className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 group ${
                        isSelected
                          ? "bg-amber-500/10 border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-sm"
                          : "bg-white border-[#E2E5E0] hover:border-slate-300 hover:bg-[#F1F2EE]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[#D4AF37] text-slate-950 font-bold"
                              : "bg-[#F1F2EE] text-slate-700 group-hover:text-[#B88E20]"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-slate-950 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-950">
                          {opt.label}
                        </div>
                        <div className="text-sm text-slate-600 mt-1 leading-snug">
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Business & Industry */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-sm font-mono font-bold text-[#B88E20] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>Step 02 • Business Context</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  Tell us about your business
                </h2>
                <p className="text-sm sm:text-sm text-slate-600">
                  Help us tailor the system architecture to your organization and industry regulations.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
                    Business / Brand Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.businessName || ""}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Apex Health Clinic / Nexora Retail"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
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
                          className={`p-3 rounded-xl border text-sm font-semibold text-center transition-all ${
                            isSelected
                              ? "bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37] shadow-sm"
                              : "bg-white border-[#E2E5E0] text-slate-800 hover:bg-[#F1F2EE]"
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

          {/* STEP 3: Business Goals */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-sm font-mono font-bold text-[#B88E20] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>Step 03 • Business Objectives</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  What do you want to achieve?
                </h2>
                <p className="text-sm sm:text-sm text-slate-600">
                  Select the primary measurable outcomes driving this technology initiative.
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
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2.5 ${
                        isSelected
                          ? "bg-amber-500/10 border-[#D4AF37] ring-1 ring-[#D4AF37] text-slate-950 shadow-sm"
                          : "bg-white border-[#E2E5E0] hover:bg-[#F1F2EE] text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected ? "bg-[#D4AF37] text-slate-950 font-bold" : "bg-[#F1F2EE] text-slate-700"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#B88E20] stroke-[3]" />}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-950 block">
                          {goal.label}
                        </span>
                        <span className="text-sm text-slate-600 mt-0.5 block leading-snug">
                          {goal.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Features & Specifications */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-sm font-mono font-bold text-[#B88E20] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>Step 04 • Features & Specifications</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  Required Modules & Capabilities
                </h2>
                <p className="text-sm sm:text-sm text-slate-600">
                  Select core modules and detail any custom integrations or database specifications.
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
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                        isSelected
                          ? "bg-amber-500/10 border-[#D4AF37] ring-1 ring-[#D4AF37]"
                          : "bg-white border-[#E2E5E0] hover:bg-[#F1F2EE]"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "bg-[#D4AF37] text-slate-950" : "bg-[#F1F2EE] text-slate-600"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-950 truncate">
                        {feat.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Textarea for Custom Specifications */}
              <div className="pt-3 border-t border-[#E2E5E0] space-y-2">
                <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Additional Specifications / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.additionalRequirements || ""}
                  onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                  placeholder="Detail any specific third-party APIs (e.g. Stripe, WhatsApp Cloud API, Brevo), existing databases, or reference platforms..."
                  className="w-full p-4 rounded-2xl border border-[#E2E5E0] bg-white text-slate-950 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Project Quality Level (5 Choices - NO PRICES) */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-sm font-mono font-bold text-[#B88E20] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>Step 05 • Project Quality & Scope Level</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  How ambitious should we make it?
                </h2>
                <p className="text-sm sm:text-sm text-slate-600">
                  Select the level of depth, customization, and engineering sophistication you are looking for.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qualityLevels.map((lvl) => {
                  const isSelected = formData.qualityLevel === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => setFormData({ ...formData, qualityLevel: lvl.id })}
                      className={`p-5 rounded-3xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? "bg-amber-500/10 border-[#D4AF37] ring-2 ring-[#D4AF37] shadow-md -translate-y-0.5"
                          : "bg-white border-[#E2E5E0] hover:border-slate-300 hover:bg-[#F1F2EE]"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-mono font-bold uppercase px-2.5 py-1 rounded-full ${
                              isSelected
                                ? "bg-[#D4AF37] text-slate-950"
                                : "bg-[#F1F2EE] text-slate-700 border border-[#E2E5E0]"
                            }`}
                          >
                            {lvl.badge}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-slate-950 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-slate-950">
                            {lvl.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {lvl.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E2E5E0]/70 space-y-1.5">
                        {lvl.features.map((f, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5 text-sm text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#B88E20] flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informational Callout */}
              <div className="p-4 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] flex items-center space-x-3 text-sm text-slate-700">
                <Shield className="w-4 h-4 text-[#B88E20] flex-shrink-0" />
                <span>
                  These levels reflect architectural depth and custom engineering. Every solution is delivered with 100% genuine code ownership.
                </span>
              </div>
            </div>
          )}

          {/* STEP 6: Timeline & User Budget */}
          {currentStep === 6 && (
            <div className="space-y-8 animate-fade-in max-w-2xl">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-sm font-mono font-bold text-[#B88E20] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>Step 06 • Timeline & Budget</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  Timeline & Budget Preferences
                </h2>
                <p className="text-sm sm:text-sm text-slate-600">
                  Provide your target schedule and optional budget estimate.
                </p>
              </div>

              {/* Timeline Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Expected Timeline
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {timelineOptions.map((t) => {
                    const isSelected = formData.timeline === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, timeline: t.id })}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-amber-500/10 border-[#D4AF37] ring-1 ring-[#D4AF37]"
                            : "bg-white border-[#E2E5E0] hover:bg-[#F1F2EE]"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm sm:text-sm text-slate-950">
                            {t.label}
                          </div>
                          <div className="text-sm text-slate-600 mt-0.5">
                            {t.desc}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#B88E20] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Budget Section */}
              <div className="space-y-4 pt-4 border-t border-[#E2E5E0]">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                    Do you already have a budget in mind?
                  </label>
                  <p className="text-sm text-slate-600">
                    You can specify your estimated budget in any currency, or choose to discuss it during technical review.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, budgetKnown: true })}
                    className={`p-4 rounded-2xl border text-center font-bold text-sm sm:text-sm transition-all ${
                      formData.budgetKnown
                        ? "bg-[#D4AF37] text-slate-950 border-[#D4AF37] shadow-sm"
                        : "bg-white border-[#E2E5E0] text-slate-700 hover:bg-[#F1F2EE]"
                    }`}
                  >
                    Yes, I'll provide it
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        budgetKnown: false,
                        budgetAmount: "",
                        budget: "Not decided yet" })
                    }
                    className={`p-4 rounded-2xl border text-center font-bold text-sm sm:text-sm transition-all ${
                      !formData.budgetKnown
                        ? "bg-[#111827] text-white border-[#111827] shadow-sm"
                        : "bg-white border-[#E2E5E0] text-slate-700 hover:bg-[#F1F2EE]"
                    }`}
                  >
                    I'm not sure yet
                  </button>
                </div>

                {/* If Yes: Show Amount Input & Currency Selector */}
                {formData.budgetKnown && (
                  <div className="p-4 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] space-y-3 animate-fade-in">
                    <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                      Approximate Budget Amount
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={formData.budgetCurrency || "PKR"}
                        onChange={(e) => setFormData({ ...formData, budgetCurrency: e.target.value })}
                        className="px-3 py-3 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 font-mono font-bold text-sm outline-none focus:border-[#D4AF37]"
                      >
                        {currencyOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={formData.budgetAmount || ""}
                        onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                        placeholder="e.g. 150,000"
                        className="flex-1 px-4 py-3 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-sm focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Pricing Notice */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-sm flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-[#B88E20] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Pricing is negotiable</span>
                    <span>
                      Final investment is discussed transparently after reviewing your technical scope, integrations, and milestones.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Your Contact Details */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-fade-in max-w-xl">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-sm font-mono font-bold text-[#B88E20] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>Step 07 • Contact Details</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  Your Contact Details
                </h2>
                <p className="text-sm sm:text-sm text-slate-600">
                  Provide your primary contact information for technical consultation.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-1.5 font-mono">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Muhammad / Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-1.5 font-mono">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-1.5 font-mono">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsappNumber || ""}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="+92 325 7263417"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-1.5 font-mono">
                    Direct Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber || ""}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-1.5 font-mono">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ""}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Global Enterprises"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Structured Project Summary & Contact Channels */}
          {currentStep === 8 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-sm font-mono font-bold uppercase">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Project Brief Generated</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  Project Brief & Review
                </h2>
                <p className="text-sm sm:text-sm text-slate-600">
                  Review your project specifications below. Everything is compiled and ready to dispatch to ST-Solutions.
                </p>
              </div>

              {/* Beautiful Two-Column Summary Card */}
              <div className="bg-white rounded-3xl border border-[#E2E5E0] shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#E2E5E0] pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                    <span className="font-mono font-bold text-sm uppercase tracking-wider text-slate-900">
                      ST-Solutions Intake Specification
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-sm font-bold text-[#B88E20] hover:underline flex items-center space-x-1"
                  >
                    <span>Edit Project</span>
                    <ArrowRight className="w-3 h-3 text-[#B88E20]" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] space-y-1">
                      <span className="text-sm font-mono font-bold uppercase text-slate-500">
                        Project Type
                      </span>
                      <div className="text-sm font-bold text-slate-950">
                        {formData.projectTypes.join(", ") || "Custom Solution"}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] space-y-1">
                      <span className="text-sm font-mono font-bold uppercase text-slate-500">
                        Industry & Brand
                      </span>
                      <div className="text-sm font-bold text-slate-950">
                        {formData.industry || "General Commercial"}
                        {formData.businessName ? ` • ${formData.businessName}` : ""}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] space-y-1">
                      <span className="text-sm font-mono font-bold uppercase text-slate-500">
                        Primary Goals
                      </span>
                      <div className="text-sm font-semibold text-slate-900">
                        {formData.goals.length > 0 ? formData.goals.join(", ") : "Standard business expansion"}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] space-y-1">
                      <span className="text-sm font-mono font-bold uppercase text-slate-500">
                        Required Features ({formData.features.length})
                      </span>
                      <div className="text-sm font-semibold text-slate-900">
                        {formData.features.length > 0 ? formData.features.join(", ") : "Core feature set"}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <span className="text-sm font-mono font-bold uppercase text-amber-900">
                        Quality Level
                      </span>
                      <div className="text-sm font-extrabold text-slate-950 flex items-center space-x-1.5">
                        <Award className="w-4 h-4 text-[#B88E20]" />
                        <span>{formData.qualityLevel?.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] space-y-1">
                      <span className="text-sm font-mono font-bold uppercase text-slate-500">
                        Timeline
                      </span>
                      <div className="text-sm font-bold text-slate-950">
                        {formData.timeline || "1 Month"}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] space-y-1">
                      <span className="text-sm font-mono font-bold uppercase text-slate-500">
                        Estimated Budget
                      </span>
                      <div className="text-sm font-bold text-slate-950">
                        {resolvedBudget}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">
                        Pricing: Negotiable (after technical review)
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] space-y-1">
                      <span className="text-sm font-mono font-bold uppercase text-slate-500">
                        Contact Person
                      </span>
                      <div className="text-sm font-bold text-slate-950">
                        {formData.fullName} ({formData.email})
                      </div>
                      {formData.phoneNumber && (
                        <div className="text-sm text-slate-600">
                          {formData.phoneNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Preview Box */}
              <div className="space-y-2">
                <div className="text-sm font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Structured Inquiry Message</span>
                  <span className="text-slate-500">Ready to send</span>
                </div>
                <div className="bg-[#111827] text-slate-100 rounded-2xl p-5 font-mono text-sm leading-relaxed border border-[#1F2937] shadow-inner max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                    {generatedMessage}
                  </pre>
                </div>
              </div>

              {/* Contact Method Cards (Part 18) */}
              <div className="space-y-3">
                <div className="text-sm font-mono font-bold uppercase tracking-wider text-slate-800">
                  Choose Your Preferred Contact Method
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* WhatsApp Card */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleDirectApiSubmit}
                    className="p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-sm shadow-md flex flex-col justify-between space-y-4 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <MessageCircle className="w-6 h-6 text-white" />
                        <span className="text-sm font-mono uppercase bg-white/20 px-2 py-0.5 rounded-full">
                          Fastest
                        </span>
                      </div>
                      <div className="text-base font-extrabold mt-3">WhatsApp</div>
                      <div className="text-sm text-emerald-100 font-normal mt-0.5">
                        Instant engineering chat
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-1.5 text-sm font-bold pt-2 border-t border-emerald-500/40">
                      <span>Continue with WhatsApp</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </a>

                  {/* Email Card */}
                  <a
                    href={mailtoUrl}
                    onClick={handleDirectApiSubmit}
                    className="p-5 rounded-2xl bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-sm sm:text-sm border border-[#111827] shadow-md flex flex-col justify-between space-y-4 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Mail className="w-6 h-6 text-[#D4AF37]" />
                        <span className="text-sm font-mono uppercase bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                          Formal
                        </span>
                      </div>
                      <div className="text-base font-extrabold mt-3">Email</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 font-normal mt-0.5">
                        Detailed project brief
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-1.5 text-sm font-bold pt-2 border-t border-slate-300 dark:border-slate-700 text-[#D4AF37]">
                      <span>Continue with Email</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                  </a>

                  {/* Copy Card */}
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="p-5 rounded-2xl bg-white hover:bg-[#F1F2EE] text-slate-950 font-bold text-sm sm:text-sm border border-[#E2E5E0] shadow-sm flex flex-col justify-between space-y-4 transition-all text-left group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Copy className="w-6 h-6 text-slate-700" />
                        <span className="text-sm font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Clipboard
                        </span>
                      </div>
                      <div className="text-base font-extrabold mt-3">Copy Brief</div>
                      <div className="text-sm text-slate-600 font-normal mt-0.5">
                        {copied ? "Project brief copied!" : "Copy complete text"}
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-1.5 text-sm font-bold pt-2 border-t border-[#E2E5E0] text-slate-900">
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span className="text-emerald-700">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <span>Copy Project Brief</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                        </>
                      )}
                    </div>
                  </button>

                  {/* Phone Call Card */}
                  <a
                    href={phoneUrl}
                    className="p-5 rounded-2xl bg-white hover:bg-[#F1F2EE] text-slate-950 font-bold text-sm sm:text-sm border border-[#E2E5E0] shadow-sm flex flex-col justify-between space-y-4 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Phone className="w-6 h-6 text-[#B88E20]" />
                        <span className="text-sm font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Direct
                        </span>
                      </div>
                      <div className="text-base font-extrabold mt-3">Phone</div>
                      <div className="text-sm text-slate-600 font-normal mt-0.5">
                        +92 325 7263417
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-1.5 text-sm font-bold pt-2 border-t border-[#E2E5E0] text-slate-900">
                      <span>Call ST-Solutions</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B88E20]" />
                    </div>
                  </a>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-[#E2E5E0]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-sm font-bold text-slate-700 hover:text-slate-950 flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Restart / Edit Choices</span>
                </button>
                <span className="text-sm text-slate-600 font-mono">
                  Official WhatsApp: +92 325 7263417
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls (Steps 1 through 7) */}
          {currentStep <= 7 && (
            <div className="pt-6 flex items-center justify-between border-t border-[#E2E5E0]">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleStepBack}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-[#E2E5E0] text-sm font-bold text-slate-700 hover:bg-[#F1F2EE] transition-colors"
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
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#111827] text-white font-bold text-sm sm:text-sm shadow-md hover:bg-[#1F2937] active:scale-[0.98] transition-all border border-[#111827]"
              >
                <span>{currentStep === 7 ? "Review Project Brief" : "Continue"}</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          )}
        </div>

        {/* Direct Contact Alternative Footer */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E5E0] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div>
            <div className="text-sm font-bold uppercase text-slate-500 font-mono">
              Direct Engineering Consultation
            </div>
            <div className="text-sm font-semibold text-slate-950 mt-0.5">
              Need immediate assistance or bespoke technical architecture?
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="https://wa.me/923257263417"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-[#E2E5E0] text-slate-800 hover:bg-[#F1F2EE] font-bold text-sm transition-colors"
            >
              <span>Contact Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
