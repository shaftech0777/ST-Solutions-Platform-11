import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Phone,
  Mail,
  QrCode,
  Globe,
  ExternalLink,
  ArrowUpRight,
  Shield,
  Layers } from "lucide-react";
import { usePublicCMS } from "../../context/PublicCMSContext.js";
import { WeChatModal } from "./WeChatModal.js";

export const PublicFooter: React.FC = () => {
  const companyConfig = usePublicCMS();
  const [isWeChatOpen, setIsWeChatOpen] = useState(false);

  return (
    <footer className="bg-[#111827] text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 font-sans relative overflow-hidden">
      {/* Subtle background tech grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-extrabold text-sm tracking-wider shadow-sm group-hover:border-[#D4AF37] transition-all">
                ST
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white font-mono">
                  ST-SOLUTIONS
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Enterprise Technology Partner
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-sm leading-relaxed">
              {companyConfig.shortDescription}
            </p>

            {/* Founder Note & Link */}
            <div className="pt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-2 max-w-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-[10px] font-bold">
                      MS
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{companyConfig.founder.name}</div>
                      <div className="text-[10px] text-slate-700 dark:text-slate-300">{companyConfig.founder.role}</div>
                    </div>
                  </div>
                </div>
                <a
                  href={companyConfig.founder.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-sm text-[#D4AF37] hover:underline font-semibold group"
                >
                  <span>View Official Portfolio</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation & Services */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">Services</h2>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li>
                <Link to="/services#web-development" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/services#software-development" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  Software Development
                </Link>
              </li>
              <li>
                <Link to="/services#ai-solutions" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  AI Solutions
                </Link>
              </li>
              <li>
                <Link to="/services#business-automation" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  Business Automation
                </Link>
              </li>
              <li>
                <Link to="/services#e-commerce" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  E-Commerce Systems
                </Link>
              </li>
              <li>
                <Link to="/services#digital-transformation" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  Digital Transformation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions & Platform */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">Solutions</h2>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li>
                <Link to="/solutions" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  Business Platforms
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  AI & Automation
                </Link>
              </li>
              <li>
                <Link to="/projects" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  Project Showcase
                </Link>
              </li>
              <li>
                <Link to="/about" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  About ST-Solutions
                </Link>
              </li>
              <li>
                <Link to="/apply" className="flex items-center space-x-1 py-1 hover:text-[#D4AF37] transition-colors">
                  <span>Member Application</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="block py-1 hover:text-[#D4AF37] transition-colors">
                  Staff Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Direct Channels */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">Direct Contact</h2>
            <div className="space-y-1 text-sm">
              <a
                href={companyConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-[#D4AF37] transition-colors py-1"
              >
                <MessageCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>WhatsApp: {companyConfig.contact.whatsappDisplay}</span>
              </a>

              <a
                href={companyConfig.contact.phoneTel}
                className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-[#D4AF37] transition-colors py-1"
              >
                <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Call: {companyConfig.contact.phoneDisplay}</span>
              </a>

              <a
                href={`mailto:${companyConfig.contact.email}`}
                className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-[#D4AF37] transition-colors py-1"
              >
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span className="break-all">{companyConfig.contact.email}</span>
              </a>

              <button
                onClick={() => setIsWeChatOpen(true)}
                className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-white transition-colors text-left py-1"
              >
                <QrCode className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>WeChat: Official Channel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <span>© 2026 ST-Solutions. All rights reserved.</span>
            <span>•</span>
            <span className="text-slate-700 dark:text-slate-300">Enterprise Technology Partner</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/contact" className="hover:text-slate-200 transition-colors">
              Contact Center
            </Link>
            <Link to="/apply" className="hover:text-slate-200 transition-colors">
              Careers / Apply
            </Link>
            <a
              href={companyConfig.founder.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-[#D4AF37] transition-colors"
            >
              <span>Founder Portfolio</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <WeChatModal isOpen={isWeChatOpen} onClose={() => setIsWeChatOpen(false)} />
    </footer>
  );
};
