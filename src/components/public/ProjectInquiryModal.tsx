import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  MessageCircle,
  Mail,
  Phone,
  CheckCircle2,
  Building,
  Globe2,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
  AlertCircle } from "lucide-react";
import { inquiriesService } from "../../api/services/inquiries.service.js";
import { usePublicCMS } from "../../context/PublicCMSContext.js";
import { InquiryContactMethod } from "../../types/index.js";

interface ProjectInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: {
    id?: string;
    title: string;
    category?: string;
  } | null;
  initialService?: string | null;
  defaultProjectName?: string;
}

export const ProjectInquiryModal: React.FC<ProjectInquiryModalProps> = ({
  isOpen,
  onClose,
  initialProject,
  initialService,
  defaultProjectName }) => {
  const companyConfig = usePublicCMS();
  const [formData, setFormData] = useState({
    visitorName: "",
    email: "",
    phone: "",
    companyName: "",
    country: "",
    projectId: "",
    projectNameSnapshot: "",
    category: "",
    message: "",
    preferredContactMethod: "WHATSAPP" as InquiryContactMethod,
    budget: "$10,000 - $25,000",
    preferredContactTime: "Anytime" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setErrorMessage(null);
      if (initialProject) {
        setFormData((prev) => ({
          ...prev,
          projectId: initialProject.id || "",
          projectNameSnapshot: initialProject.title,
          category: initialProject.category || "Custom Solution" }));
      } else if (defaultProjectName) {
        setFormData((prev) => ({
          ...prev,
          projectId: "",
          projectNameSnapshot: defaultProjectName,
          category: "Showcase Solution Inquiry" }));
      } else if (initialService) {
        setFormData((prev) => ({
          ...prev,
          projectId: "",
          projectNameSnapshot: initialService,
          category: "Service Consultation" }));
      } else {
        setFormData((prev) => ({
          ...prev,
          projectNameSnapshot: "Custom Engineering Solution",
          category: "Custom Architecture" }));
      }
    }
  }, [isOpen, initialProject, initialService, defaultProjectName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.visitorName.trim()) {
      setErrorMessage("Please enter your full name");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      setErrorMessage("Please enter a valid phone or WhatsApp number");
      return;
    }
    if (!formData.projectNameSnapshot.trim()) {
      setErrorMessage("Please specify the project or service of interest");
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMessage("Please describe your project requirements in a bit more detail (min 10 characters)");
      return;
    }

    try {
      setIsSubmitting(true);
      await inquiriesService.submitPublicInquiry({
        visitorName: formData.visitorName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim() || undefined,
        country: formData.country.trim() || undefined,
        projectId: formData.projectId.trim() || undefined,
        projectNameSnapshot: formData.projectNameSnapshot.trim(),
        category: formData.category.trim() || undefined,
        message: formData.message.trim(),
        preferredContactMethod: formData.preferredContactMethod,
        budget: formData.budget || undefined,
        preferredContactTime: formData.preferredContactTime || undefined });

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Unable to submit inquiry at this moment. Please reach us directly via WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-[#E2E5E0] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E5C158] text-[10px] font-mono uppercase tracking-wider font-bold">
                Project Inquiry
              </span>
              <span className="text-xs text-slate-400 font-medium">Direct Engineering Consult</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {isSubmitted ? "Inquiry Dispatched" : `Request Consult on "${formData.projectNameSnapshot}"`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 font-sans">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-2xl font-bold text-slate-950">
                  Thank You, {formData.visitorName.split(" ")[0]}!
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your inquiry regarding <strong className="text-slate-900">{formData.projectNameSnapshot}</strong> has
                  been transmitted to our core engineering lead. We will review your requirements and reach out via{" "}
                  <strong className="text-emerald-700 font-semibold">{formData.preferredContactMethod}</strong>.
                </p>
              </div>

              {/* Direct WhatsApp Prompt */}
              <div className="p-5 rounded-2xl bg-[#F1F2EE] border border-[#E2E5E0] max-w-md mx-auto space-y-3 text-left">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Prefer immediate discussion?</span>
                </div>
                <p className="text-xs text-slate-600">
                  Our WhatsApp desk is active for rapid architectural Q&A.
                </p>
                <a
                  href={`https://wa.me/94740733877?text=${encodeURIComponent(
                    `Hello ST-Solutions! I just submitted an inquiry for "${formData.projectNameSnapshot}". My name is ${formData.visitorName}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Direct Chat</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Snapshot Info Banner */}
              <div className="p-4 rounded-2xl bg-[#F8F9F7] border border-[#E2E5E0] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#B88E20]" />
                  <span className="text-xs font-semibold text-slate-700">Target Solution:</span>
                  <span className="text-xs font-bold text-slate-950">{formData.projectNameSnapshot}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-[#E2E5E0] text-slate-700">
                  {formData.category || "Custom System"}
                </span>
              </div>

              {/* 2-Column Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                    <span>Full Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                    <span>Business Email</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                    <span>Phone / WhatsApp Number</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555 123 4567 or +94 7X XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                    <span>Company / Organization</span>
                    <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Preferred Contact Method */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900">
                  Preferred Contact Channel
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "WHATSAPP", label: "WhatsApp", icon: MessageCircle, color: "text-emerald-600" },
                    { id: "EMAIL", label: "Email", icon: Mail, color: "text-blue-600" },
                    { id: "PHONE_CALL", label: "Phone Call", icon: Phone, color: "text-amber-600" },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = formData.preferredContactMethod === method.id;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            preferredContactMethod: method.id as InquiryContactMethod })
                        }
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                          isSelected
                            ? "bg-slate-950 text-white border-slate-950 shadow-md"
                            : "bg-white text-slate-700 border-[#E2E5E0] hover:bg-[#F1F2EE]"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? "text-[#D4AF37]" : method.color}`} />
                        <span>{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project Requirements / Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span>Project Goals & Specific Requirements</span>
                    <span className="text-rose-500">*</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">Min 10 characters</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you'd like to achieve, target user volume, special integrations (e.g. AI, payments, real-time sync), or desired launch timeline..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] leading-relaxed"
                />
              </div>

              {/* Budget & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#B88E20]" />
                    <span>Estimated Budget Range</span>
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <option value="Under $5,000">Under $5,000 (MVP / Prototype)</option>
                    <option value="$5,000 - $15,000">$5,000 - $15,000 (Standard System)</option>
                    <option value="$15,000 - $35,000">$15,000 - $35,000 (Production Platform)</option>
                    <option value="$35,000 - $75,000">$35,000 - $75,000 (Enterprise Infrastructure)</option>
                    <option value="$75,000+">$75,000+ (Multi-Year / High-Scale)</option>
                    <option value="Flexible / To Be Estimated">Flexible / To Be Estimated</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[#B88E20]" />
                    <span>Preferred Contact Window</span>
                  </label>
                  <select
                    value={formData.preferredContactTime}
                    onChange={(e) => setFormData({ ...formData, preferredContactTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E5E0] text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <option value="Anytime">Anytime / Fastest Available</option>
                    <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                    <option value="Afternoon (12:00 - 17:00)">Afternoon (12:00 - 17:00)</option>
                    <option value="Evening (17:00 - 21:00)">Evening (17:00 - 21:00)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E2E5E0] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#E2E5E0] text-xs font-bold text-slate-700 hover:bg-[#F1F2EE] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#111827] text-white text-xs font-bold hover:bg-[#1F2937] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-md border border-[#111827] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Submit Project Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
