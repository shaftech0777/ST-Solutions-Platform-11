import React from "react";
import { LegalLayout, TocItem } from "../../components/public/LegalLayout.js";
import { Database, ShieldCheck, HardDrive, CheckCircle2, Sliders, Globe } from "lucide-react";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

const tocItems: TocItem[] = [
  { id: "what-are-cookies", title: "What Are Cookies & Browser Storage" },
  { id: "technologies-used", title: "Technologies Used on ST-SOLUTIONS" },
  { id: "no-ad-trackers", title: "Absence of Advertising Trackers" },
  { id: "how-to-manage", title: "How to Control Browser Storage" },
  { id: "updates-contact", title: "Policy Updates & Contact" },
];

export const CookiePolicyPage: React.FC = () => {
  const companyConfig = usePublicCMS();

  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="This Cookie Policy explains how ST-SOLUTIONS uses local browser storage technologies to deliver essential authentication and UI preferences."
      badgeText="Browser Storage & Privacy"
      icon={<Database className="w-3.5 h-3.5" />}
      toc={tocItems}
    >
      {/* Section 1 */}
      <section id="what-are-cookies" className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <HardDrive className="w-5 h-5 text-[#B88E20]" />
          <span>1. What Are Cookies & Local Storage</span>
        </h2>
        <p>
          Cookies and local storage technologies are small text files or key-value data entries placed in your browser when you visit websites. They enable web applications to recognize your session, remember preferences, and maintain secure user logins.
        </p>
      </section>

      {/* Section 2 */}
      <section id="technologies-used" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <CheckCircle2 className="w-5 h-5 text-[#B88E20]" />
          <span>2. Technologies Used on ST-SOLUTIONS</span>
        </h2>
        <p>
          ST-SOLUTIONS utilizes client-side browser storage exclusively for essential operational and functional purposes:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm text-[#B88E20]">accessToken</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800">
                Essential / Security
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Stores a secure JSON Web Token (JWT) in client <code className="font-mono text-slate-800">localStorage</code> when staff or clients log into platform management dashboards. This token enables seamless API authentication across requests.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm text-[#B88E20]">st_theme</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-100 text-blue-800">
                Functional / Preferences
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Saves your preferred user interface color mode (Dark or Light mode) locally in your browser to maintain visual consistency across pages.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id="no-ad-trackers" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <ShieldCheck className="w-5 h-5 text-[#B88E20]" />
          <span>3. Absence of Advertising Trackers</span>
        </h2>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-800 space-y-2">
          <span className="font-bold font-mono text-amber-900 text-xs uppercase tracking-wider block">
            Zero Third-Party Ad Tracking Guarantee
          </span>
          <p className="text-sm">
            ST-SOLUTIONS does <strong>NOT</strong> embed advertising networks, cross-site behavioral tracking cookies, Meta Pixels, Google Ads remarketing pixels, or invasive third-party analytics scripts into our application repository.
          </p>
        </div>
      </section>

      {/* Section 4 */}
      <section id="how-to-manage" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Sliders className="w-5 h-5 text-[#B88E20]" />
          <span>4. How to Control Browser Storage</span>
        </h2>
        <p>
          You can inspect, clear, or restrict browser storage entries at any time through your web browser's Developer Tools or Settings menu:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>
            <strong className="text-slate-900">Chrome / Edge:</strong> Navigate to Developer Tools (F12) &gt; Application &gt; Local Storage / Cookies.
          </li>
          <li>
            <strong className="text-slate-900">Firefox:</strong> Navigate to Developer Tools (F12) &gt; Storage &gt; Local Storage / Cookies.
          </li>
          <li>
            <strong className="text-slate-900">Safari:</strong> Navigate to Preferences &gt; Privacy &gt; Manage Website Data.
          </li>
        </ul>
        <p className="text-xs text-slate-500">
          Note: Clearing <code className="font-mono text-slate-800">accessToken</code> will sign out active platform sessions, requiring re-authentication.
        </p>
      </section>

      {/* Section 5 */}
      <section id="updates-contact" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Globe className="w-5 h-5 text-[#B88E20]" />
          <span>5. Policy Updates & Contact</span>
        </h2>
        <p>
          We may update this Cookie Policy if new functional local storage mechanisms are implemented in future platform releases.
        </p>
        <p>
          Questions regarding browser storage or data handling can be directed to:{" "}
          <a href={`mailto:${companyConfig.contact.email}`} className="text-[#B88E20] font-bold underline">
            {companyConfig.contact.email}
          </a>
        </p>
      </section>
    </LegalLayout>
  );
};
