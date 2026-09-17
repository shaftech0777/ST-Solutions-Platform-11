import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, ShieldCheck, Mail, MessageCircle, FileText } from "lucide-react";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

export interface TocItem {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  badgeText?: string;
  icon?: React.ReactNode;
  toc?: TocItem[];
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  lastUpdated = "March 17, 2026",
  badgeText = "Legal & Compliance",
  icon,
  toc = [],
  children,
}) => {
  const companyConfig = usePublicCMS();

  useEffect(() => {
    document.title = `ST-SOLUTIONS | ${title}`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", subtitle);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [title, subtitle]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90; // offset for fixed navbar
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans bg-[#F7F7F3] text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Breadcrumb & Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-slate-600 hover:text-[#B88E20] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Overview</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
            <Clock className="w-3.5 h-3.5 text-[#B88E20]" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Hero Banner Header */}
        <div className="rounded-2xl bg-[#111827] text-white p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#D4AF37] text-xs font-mono font-semibold uppercase tracking-wider flex items-center space-x-1.5">
              {icon || <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{badgeText}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Main Content Layout with Sidebar TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-2">
          
          {/* Sidebar Table of Contents (Desktop) */}
          {toc.length > 0 && (
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-24 space-y-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
                <div className="font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#B88E20]" />
                  <span>On This Page</span>
                </div>
                <nav className="space-y-1.5">
                  {toc.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="block w-full text-left py-1 px-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors truncate"
                    >
                      {idx + 1}. {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Policy Document Body */}
          <main className={toc.length > 0 ? "lg:col-span-3 space-y-8" : "lg:col-span-4 space-y-8"}>
            {/* Quick TOC Pills for Mobile */}
            {toc.length > 0 && (
              <div className="lg:hidden p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 block">
                  Quick Navigation
                </span>
                <div className="flex flex-wrap gap-2">
                  {toc.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-xs py-1 px-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#D4AF37]/10 hover:text-[#B88E20] font-medium transition-colors"
                    >
                      {idx + 1}. {item.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Document Content */}
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-sm text-slate-800 space-y-8 leading-relaxed font-sans text-sm sm:text-base">
              {children}
            </div>

            {/* General Legal Disclaimer Note */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-600 space-y-1">
              <span className="font-bold font-mono text-amber-800 uppercase block">Policy & Operational Notice</span>
              <p>
                This document accurately outlines the technical, data processing, and operational practices of the ST-SOLUTIONS platform and website. It is provided for user guidance and transparency, and may be updated as platform capabilities evolve.
              </p>
            </div>

            {/* Contact & Inquiry Footer Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111827] text-white border border-slate-800 space-y-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1 max-w-md">
                <h3 className="text-base font-bold text-white font-sans">Have questions about our policies?</h3>
                <p className="text-xs text-slate-400">
                  Contact our administrative team directly regarding data rights, platform security, or service inquiries.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:${companyConfig.contact.email}`}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B88E20] text-slate-950 font-bold text-xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Official Channel</span>
                </a>
                <a
                  href={companyConfig.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </main>
        </div>

      </div>
    </div>
  );
};
