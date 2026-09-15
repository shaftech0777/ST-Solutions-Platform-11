import { settingsRepository } from "./settings.repository.js";

const DEFAULT_BRAND = {
  name: "ST-Solutions",
  legalName: "ST-Solutions Enterprise Platform",
  tagline: "Technology that moves your business forward.",
  shortDescription: "ST-Solutions builds modern websites, software, AI systems, and business automation solutions designed around real business needs.",
  longDescription: "We partner with businesses to architect, engineer, and deploy high-performance digital systems. From bespoke web applications and custom software to enterprise AI integrations and automated workflows, ST-Solutions delivers robust, scalable technology built for measurable outcomes.",
};

const DEFAULT_CONTACT = {
  whatsappNumber: "+923257263417",
  whatsappDisplay: "03257263417",
  whatsappUrl: "https://wa.me/923257263417?text=Hello%20ST-Solutions%2C%20I%20would%20like%20to%20discuss%20a%20project.",
  phoneNumber: "03257263417",
  phoneDisplay: "0325-7263417",
  phoneTel: "tel:+923257263417",
  email: "stsolutionsofficial@gmail.com",
  weChatId: "",
  weChatDisplayName: "Official WeChat",
  address: "Islamabad / Global Remote Operations",
  workingHours: "Monday – Saturday: 9:00 AM – 7:00 PM (PKT / UTC+5)",
};

const DEFAULT_SOCIALS = [
  { id: "whatsapp", name: "WhatsApp", icon: "whatsapp", url: "https://wa.me/923257263417", enabled: true, handle: "03257263417" },
  { id: "linkedin", name: "LinkedIn", icon: "linkedin", url: "https://linkedin.com/company/st-solutions", enabled: false, handle: "@st-solutions" },
  { id: "instagram", name: "Instagram", icon: "instagram", url: "https://instagram.com/stsolutions", enabled: false, handle: "@stsolutions" },
];

const DEFAULT_FAQS = [
  {
    id: "faq-1",
    question: "Do you build custom software or use templates?",
    answer: "We engineer bespoke software and web platforms from the ground up tailored perfectly to your specific business logic. We do not rely on brittle drag-and-drop template builders.",
    category: "Services",
  },
  {
    id: "faq-2",
    question: "Who owns the final source code and intellectual property?",
    answer: "You do. Upon project completion and final settlement, 100% of the intellectual property, source code, and deployment assets are transferred to your legal ownership.",
    category: "Legal & Ownership",
  },
  {
    id: "faq-3",
    question: "How do you handle project payments and milestones?",
    answer: "We structure engagements around transparent milestones. A standard project includes a kickoff deposit, a mid-point delivery phase, and final deployment settlement. All milestones are tied to tangible deliverables.",
    category: "Billing & Process",
  },
  {
    id: "faq-4",
    question: "Do you provide long-term support and maintenance?",
    answer: "Yes. Technology requires continuous security monitoring and library updates. We offer strict Service Level Agreements (SLAs) to guarantee uptime, perform regular security patching, and build iterative new features as you scale.",
    category: "Post-Launch",
  },
];

export async function initializeCMSSections() {
  try {
    const brand = await settingsRepository.getCMSSectionByKey("brand");
    if (!brand) {
      await settingsRepository.upsertCMSSection("brand", {
        title: "Brand Configuration",
        content: JSON.stringify(DEFAULT_BRAND),
      });
    }

    const contact = await settingsRepository.getCMSSectionByKey("contact");
    if (!contact) {
      await settingsRepository.upsertCMSSection("contact", {
        title: "Contact Configuration",
        content: JSON.stringify(DEFAULT_CONTACT),
      });
    }

    const socials = await settingsRepository.getCMSSectionByKey("socials");
    if (!socials) {
      await settingsRepository.upsertCMSSection("socials", {
        title: "Social Platforms",
        content: JSON.stringify(DEFAULT_SOCIALS),
      });
    }

    const faqs = await settingsRepository.getCMSSectionByKey("faqs");
    if (!faqs) {
      await settingsRepository.upsertCMSSection("faqs", {
        title: "FAQ Items",
        content: JSON.stringify(DEFAULT_FAQS),
      });
    }
  } catch (error) {
    console.error("Failed to initialize CMS sections:", error);
  }
}
