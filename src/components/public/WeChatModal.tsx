import React, { useState } from "react";
import { X, Check, Copy, QrCode, MessageCircle } from "lucide-react";
import { companyConfig } from "../../data/companyConfig.js";

interface WeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeChatModal: React.FC<WeChatModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const hasConfiguredWeChat = Boolean(companyConfig.contact.weChatId && companyConfig.contact.weChatId.trim());

  const handleCopyId = () => {
    if (companyConfig.contact.weChatId) {
      navigator.clipboard.writeText(companyConfig.contact.weChatId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] mx-auto flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Official WeChat</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Scan to connect
          </p>
        </div>

        {/* WeChat Content / Configurable State */}
        <div className="bg-slate-50 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-4 text-center">
          {hasConfiguredWeChat ? (
            <div className="space-y-3 w-full">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Official WeChat ID</span>
              <div className="flex items-center justify-center space-x-2">
                <span className="font-mono font-bold text-sm text-[#D4AF37] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {companyConfig.contact.weChatId}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-[#D4AF37] hover:text-black text-slate-700 dark:text-slate-200 transition-colors text-xs flex items-center space-x-1"
                  title="Copy WeChat ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-dashed border-slate-300 dark:border-slate-700">
                <QrCode className="w-8 h-8 opacity-40" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  WeChat Account Channel
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  Official WeChat direct connection is available upon request. Reach us via WhatsApp or Email for instant technical intake.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Direct Contact Note */}
        <div className="space-y-3 pt-1">
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            For immediate project scoping, reach us directly via{" "}
            <a
              href={companyConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:underline font-semibold"
            >
              WhatsApp
            </a>{" "}
            or{" "}
            <a href={companyConfig.contact.phoneTel} className="text-blue-500 hover:underline font-semibold">
              Phone Call
            </a>
            .
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold text-xs transition-colors border border-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
