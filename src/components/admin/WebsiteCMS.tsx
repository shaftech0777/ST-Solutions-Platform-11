import React, { useState, useEffect } from "react";
import {
  Globe,
  Save,
  MessageCircle,
  Phone,
  Mail,
  QrCode,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Shield,
  Clock,
  MapPin,
  Sparkles } from "lucide-react";
import { Button } from "../ui/Button.js";
import { Input, Textarea } from "../ui/Input.js";
import { Card } from "../ui/Card.js";
import { Badge } from "../ui/Badge.js";
import { Modal, ConfirmModal } from "../ui/Modal.js";
import { useToast } from "../../context/ToastContext.js";
import { companyConfig, CompanyConfig, SocialPlatformConfig } from "../../data/companyConfig.js";
import { settingsService } from "../../api/services/settings.service.js";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "What types of software systems does ST-Solutions build?",
    answer: "We build custom web platforms, e-commerce stores with mobile checkout, retail & pharmacy POS systems, business operations dashboards, customer CRMs, 24/7 AI assistants, and automated scheduling workflows.",
    category: "Services" },
  {
    id: "faq-2",
    question: "Do I own 100% of the source code and database?",
    answer: "Yes, completely. Unlike SaaS products that charge monthly per-user licensing fees, any custom system we engineer for you is 100% your property, including database schemas and deployment credentials.",
    category: "Ownership" },
  {
    id: "faq-3",
    question: "How long does a typical software project take to deliver?",
    answer: "Standard web platforms and specialized systems are typically delivered within 2 to 6 weeks depending on scope, with milestone demos every week so you can test features in real time.",
    category: "Timeline" },
  {
    id: "faq-4",
    question: "How do we get started or receive a project quote?",
    answer: "You can click 'Start a Project' to use our interactive requirement planner, or message us directly on WhatsApp at 0325-7263417 for an immediate architectural consultation.",
    category: "Getting Started" },
];

export const WebsiteCMS: React.FC = () => {
  const { addToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<"brand" | "contact" | "socials" | "faqs">("brand");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Brand Copy State
  const [brandData, setBrandData] = useState({
    name: "",
    legalName: "",
    tagline: "",
    shortDescription: "",
    longDescription: "" });

  // Contact Channels State
  const [contactData, setContactData] = useState({
    whatsappNumber: "",
    whatsappDisplay: "",
    whatsappUrl: "",
    phoneNumber: "",
    phoneDisplay: "",
    email: "",
    weChatId: "",
    weChatDisplayName: "",
    address: "",
    workingHours: "" });

  // Social Links State
  const [socials, setSocials] = useState<SocialPlatformConfig[]>([]);

  // FAQs State
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "General" });
  const [deletingFaq, setDeletingFaq] = useState<FAQItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Brand Data
      const brandRes = await settingsService.getCMSSection<any>("brand");
      if (brandRes) {
        setBrandData(brandRes);
      } else {
        setBrandData({
          name: companyConfig.name,
          legalName: companyConfig.legalName,
          tagline: companyConfig.tagline,
          shortDescription: companyConfig.shortDescription,
          longDescription: companyConfig.longDescription });
      }

      // Fetch Contact Data
      const contactRes = await settingsService.getCMSSection<any>("contact");
      if (contactRes) {
        setContactData(contactRes);
      } else {
        setContactData({
          whatsappNumber: companyConfig.contact.whatsappNumber,
          whatsappDisplay: companyConfig.contact.whatsappDisplay,
          whatsappUrl: companyConfig.contact.whatsappUrl,
          phoneNumber: companyConfig.contact.phoneNumber,
          phoneDisplay: companyConfig.contact.phoneDisplay,
          email: companyConfig.contact.email,
          weChatId: companyConfig.contact.weChatId,
          weChatDisplayName: companyConfig.contact.weChatDisplayName,
          address: companyConfig.contact.address,
          workingHours: companyConfig.contact.workingHours });
      }

      // Fetch Socials
      const socialsRes = await settingsService.getCMSSection<SocialPlatformConfig[]>("socials");
      if (socialsRes && Array.isArray(socialsRes)) {
        setSocials(socialsRes);
      } else {
        setSocials(companyConfig.socials);
      }

      // Fetch FAQs
      const faqsRes = await settingsService.getCMSSection<FAQItem[]>("faqs");
      if (faqsRes && Array.isArray(faqsRes)) {
        setFaqs(faqsRes);
      } else {
        setFaqs(DEFAULT_FAQS);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: "error", message: "Failed to load website settings." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await settingsService.updateCMSSection("brand", brandData);
      if (res && res.success === false) {
        throw new Error(res.message || "Failed to save brand content to database.");
      }
      
      // Sync basic profile data backward for generic settings endpoints
      await settingsService.updateCompanyProfile({ companyName: brandData.name }).catch(e => console.warn('Could not sync to generic company profile', e));

      addToast({ type: "success", message: "Brand & Hero settings updated in database." });
    } catch (err: any) {
      addToast({ type: "error", message: err?.message || "Failed to save brand content." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await settingsService.updateCMSSection("contact", contactData);
      if (res && res.success === false) {
        throw new Error(res.message || "Failed to save contact info to database.");
      }
      
      await settingsService.updateCompanyProfile({}).catch(e => console.warn('Could not sync contact info to generic profile', e));

      addToast({ type: "success", message: "Official contact channels updated in database." });
    } catch (err: any) {
      addToast({ type: "error", message: err?.message || "Failed to update contact info." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSocial = async (id: string) => {
    const updated = socials.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSocials(updated);
    try {
      const res = await settingsService.updateCMSSection("socials", updated);
      if (res && res.success === false) {
        throw new Error(res.message || "Failed to update social channels in database.");
      }
      addToast({ type: "info", message: "Social channel visibility updated in database." });
    } catch (err: any) {
      setSocials(socials); // revert
      addToast({ type: "error", message: err?.message || "Failed to save social changes." });
    }
  };

  const handleOpenFaqModal = (faq?: FAQItem) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category || "General" });
    } else {
      setEditingFaq(null);
      setFaqForm({ question: "", answer: "", category: "General" });
    }
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      addToast({ type: "error", message: "Question and answer are required." });
      return;
    }

    const prevFaqs = [...faqs];
    let newFaqs = [];

    if (editingFaq) {
      newFaqs = faqs.map((f) => (f.id === editingFaq.id ? { ...f, ...faqForm } : f));
    } else {
      const newFaq: FAQItem = {
        id: `faq-${Date.now()}`,
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        category: faqForm.category.trim() };
      newFaqs = [...faqs, newFaq];
    }
    
    setFaqs(newFaqs);
    setIsFaqModalOpen(false);

    try {
      const res = await settingsService.updateCMSSection("faqs", newFaqs);
      if (res && res.success === false) {
        throw new Error(res.message || "Failed to update FAQs in database.");
      }
      addToast({ type: "success", message: editingFaq ? "FAQ item updated in database." : "New FAQ item added to database." });
    } catch (err: any) {
      setFaqs(prevFaqs); // revert
      addToast({ type: "error", message: err?.message || "Failed to save FAQ." });
    }
  };

  const handleDeleteFaq = async () => {
    if (!deletingFaq) return;
    const prevFaqs = [...faqs];
    const newFaqs = faqs.filter((f) => f.id !== deletingFaq.id);
    setFaqs(newFaqs);
    setDeletingFaq(null);

    try {
      const res = await settingsService.updateCMSSection("faqs", newFaqs);
      if (res && res.success === false) {
        throw new Error(res.message || "Failed to delete FAQ from database.");
      }
      addToast({ type: "success", message: "FAQ item removed from database." });
    } catch (err: any) {
      setFaqs(prevFaqs); // revert
      addToast({ type: "error", message: err?.message || "Failed to delete FAQ." });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab("brand")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "brand"
              ? "bg-white dark:bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Brand &amp; Hero Copy
        </button>
        <button
          onClick={() => setActiveSubTab("contact")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "contact"
              ? "bg-white dark:bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Contact &amp; WhatsApp
        </button>
        <button
          onClick={() => setActiveSubTab("socials")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "socials"
              ? "bg-white dark:bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Social Channels
        </button>
        <button
          onClick={() => setActiveSubTab("faqs")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "faqs"
              ? "bg-white dark:bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Frequently Asked Questions
        </button>
      </div>

      {/* 1. Brand & Hero Copy Tab */}
      {activeSubTab === "brand" && (
        <form onSubmit={handleSaveBrand} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand Display Name"
              value={brandData.name}
              onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
              required
            />
            <Input
              label="Legal Name / Entity"
              value={brandData.legalName}
              onChange={(e) => setBrandData({ ...brandData, legalName: e.target.value })}
            />
          </div>

          <Input
            label="Hero Tagline"
            value={brandData.tagline}
            onChange={(e) => setBrandData({ ...brandData, tagline: e.target.value })}
            required
          />

          <Textarea
            label="Short Brand Summary (Navbar &amp; Footers)"
            value={brandData.shortDescription}
            onChange={(e) => setBrandData({ ...brandData, shortDescription: e.target.value })}
            rows={2}
          />

          <Textarea
            label="Long Brand Mission (About Page &amp; Overview)"
            value={brandData.longDescription}
            onChange={(e) => setBrandData({ ...brandData, longDescription: e.target.value })}
            rows={4}
          />

          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit" disabled={isSaving}>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>Save Brand Content</span>
            </Button>
          </div>
        </form>
      )}

      {/* 2. Contact & Communication Channels Tab */}
      {activeSubTab === "contact" && (
        <form onSubmit={handleSaveContact} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official WhatsApp Number (E.164 with country code)"
              placeholder="+923257263417"
              value={contactData.whatsappNumber}
              onChange={(e) => setContactData({ ...contactData, whatsappNumber: e.target.value })}
              required
            />
            <Input
              label="WhatsApp Display Format"
              placeholder="03257263417"
              value={contactData.whatsappDisplay}
              onChange={(e) => setContactData({ ...contactData, whatsappDisplay: e.target.value })}
              required
            />
          </div>

          <Input
            label="WhatsApp Direct Chat URL"
            placeholder="https://wa.me/923257263417?text=..."
            value={contactData.whatsappUrl}
            onChange={(e) => setContactData({ ...contactData, whatsappUrl: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number (Display)"
              placeholder="0325-7263417"
              value={contactData.phoneDisplay}
              onChange={(e) => setContactData({ ...contactData, phoneDisplay: e.target.value })}
            />
            <Input
              label="Official Contact Email"
              type="email"
              placeholder="stsolutionsofficial@gmail.com"
              value={contactData.email}
              onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="WeChat ID"
              placeholder="e.g. ST-Solutions"
              value={contactData.weChatId}
              onChange={(e) => setContactData({ ...contactData, weChatId: e.target.value })}
            />
            <Input
              label="WeChat Display Label"
              placeholder="Official WeChat"
              value={contactData.weChatDisplayName}
              onChange={(e) => setContactData({ ...contactData, weChatDisplayName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Operations Location"
              value={contactData.address}
              onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
            />
            <Input
              label="Support / Working Hours"
              value={contactData.workingHours}
              onChange={(e) => setContactData({ ...contactData, workingHours: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit" disabled={isSaving}>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>Save Contact Info</span>
            </Button>
          </div>
        </form>
      )}

      {/* 3. Social Channels Tab */}
      {activeSubTab === "socials" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Configure the direct contact methods and social platforms displayed on the public footer and contact page.
          </p>

          <div className="space-y-2">
            {socials.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{s.handle || s.url}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant={s.enabled ? "success" : "default"}>
                    {s.enabled ? "Active" : "Disabled"}
                  </Badge>
                  <button
                    onClick={() => handleToggleSocial(s.id)}
                    className="text-xs font-semibold text-amber-600 hover:underline"
                  >
                    {s.enabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FAQs Tab */}
      {activeSubTab === "faqs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Manage questions and answers displayed in customer inquiries and information pages.
            </p>
            <Button variant="primary" size="sm" onClick={() => handleOpenFaqModal()}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Add FAQ</span>
            </Button>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{f.question}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {f.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{f.answer}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenFaqModal(f)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingFaq(f)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Add/Edit Modal */}
      {isFaqModalOpen && (
        <Modal
          isOpen={isFaqModalOpen}
          onClose={() => setIsFaqModalOpen(false)}
          title={editingFaq ? "Edit FAQ" : "Add FAQ Question"}
          size="md"
        >
          <form onSubmit={handleSaveFaq} className="space-y-3 text-xs">
            <Input
              label="Question"
              placeholder="e.g. Do I own 100% of the source code?"
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              required
            />
            <Input
              label="Category"
              placeholder="e.g. Services, Ownership, Billing, Process"
              value={faqForm.category}
              onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
            />
            <Textarea
              label="Answer"
              placeholder="Provide a clear, reassuring answer for prospective clients..."
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              rows={4}
              required
            />
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setIsFaqModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save FAQ
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete FAQ Confirm */}
      {deletingFaq && (
        <ConfirmModal
          isOpen={Boolean(deletingFaq)}
          onClose={() => setDeletingFaq(null)}
          onConfirm={handleDeleteFaq}
          title="Delete FAQ"
          message={`Are you sure you want to delete "${deletingFaq.question}"?`}
          confirmLabel="Delete FAQ"
          variant="danger"
        />
      )}
    </div>
  );
};
