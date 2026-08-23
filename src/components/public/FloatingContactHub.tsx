import React, { useState } from "react";
import { MessageCircle, Phone, Mail, QrCode, X, ChevronUp, MessageSquare } from "lucide-react";
import { companyConfig } from "../../data/companyConfig.js";
import { WeChatModal } from "./WeChatModal.js";

export const FloatingContactHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWeChatOpen, setIsWeChatOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3 font-sans">
        {/* Expanded Contact Channels Menu */}
        {isOpen && (
          <div className="flex flex-col space-y-2 mb-2 animate-fade-in bg-white dark:bg-[#0B0F17] p-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-56">
            <div className="px-2 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 mb-1">
              Direct Channels
            </div>

            {/* WhatsApp */}
            <a
              href={companyConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-bold leading-tight">WhatsApp</div>
                <div className="text-[10px] text-slate-500">{companyConfig.contact.whatsappDisplay}</div>
              </div>
            </a>

            {/* Phone Call */}
            <a
              href={companyConfig.contact.phoneTel}
              className="flex items-center space-x-3 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-bold leading-tight">Phone Call</div>
                <div className="text-[10px] text-slate-500">{companyConfig.contact.phoneDisplay}</div>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${companyConfig.contact.email}`}
              className="flex items-center space-x-3 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-[#D4AF37] transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left truncate">
                <div className="text-xs font-bold leading-tight">Official Email</div>
                <div className="text-[10px] text-slate-500 truncate">stsolutions...</div>
              </div>
            </a>

            {/* WeChat */}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsWeChatOpen(true);
              }}
              className="flex items-center space-x-3 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors group text-left w-full"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-bold leading-tight">WeChat QR / ID</div>
                <div className="text-[10px] text-slate-500">{companyConfig.contact.weChatId}</div>
              </div>
            </button>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-3 rounded-full bg-slate-950 text-white dark:bg-[#D4AF37] dark:text-black font-semibold text-xs shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all duration-200 border border-slate-800 dark:border-amber-400/50 group"
          aria-label="Contact ST-Solutions"
        >
          {isOpen ? (
            <X className="w-4 h-4 text-white dark:text-black" />
          ) : (
            <MessageSquare className="w-4 h-4 text-[#D4AF37] dark:text-black group-hover:rotate-12 transition-transform" />
          )}
          <span className="hidden sm:inline">Contact ST-Solutions</span>
          <span className="sm:hidden">Contact</span>
        </button>
      </div>

      {/* WeChat Modal */}
      <WeChatModal isOpen={isWeChatOpen} onClose={() => setIsWeChatOpen(false)} />
    </>
  );
};
