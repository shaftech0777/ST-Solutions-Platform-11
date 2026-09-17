import React from "react";
import { LegalLayout, TocItem } from "../../components/public/LegalLayout.js";
import { ShieldAlert, AlertOctagon, Terminal, Lock, CheckCircle2, Shield } from "lucide-react";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

const tocItems: TocItem[] = [
  { id: "purpose-scope", title: "Purpose & Scope" },
  { id: "lawful-use", title: "Lawful Use Requirement" },
  { id: "prohibited-activities", title: "Prohibited Activities" },
  { id: "security-integrity", title: "System & API Security Integrity" },
  { id: "enforcement", title: "Enforcement & Account Suspension" },
  { id: "reporting-contact", title: "Reporting Violations & Contact" },
];

export const AcceptableUsePage: React.FC = () => {
  const companyConfig = usePublicCMS();

  return (
    <LegalLayout
      title="Acceptable Use Policy"
      subtitle="This Acceptable Use Policy defines permitted operational behaviors and strictly prohibited activities across the ST-SOLUTIONS website, public APIs, and platform services."
      badgeText="Security & Compliance"
      icon={<ShieldAlert className="w-3.5 h-3.5" />}
      toc={tocItems}
    >
      {/* Section 1 */}
      <section id="purpose-scope" className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Shield className="w-5 h-5 text-[#B88E20]" />
          <span>1. Purpose & Scope</span>
        </h2>
        <p>
          ST-SOLUTIONS engineered this Acceptable Use Policy ("AUP") to safeguard our infrastructure, platform users, API endpoints, and client data against security threats, misuse, and malicious activities.
        </p>
        <p>
          This policy applies to all visitors, registered members, platform users, and automated systems interacting with the ST-SOLUTIONS domain, public forms, or backend services.
        </p>
      </section>

      {/* Section 2 */}
      <section id="lawful-use" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <CheckCircle2 className="w-5 h-5 text-[#B88E20]" />
          <span>2. Lawful Use Requirement</span>
        </h2>
        <p>
          You agree to access and use ST-SOLUTIONS web applications and platform services strictly for lawful business, consulting, engineering, and career application purposes in compliance with all applicable local and international laws.
        </p>
      </section>

      {/* Section 3 */}
      <section id="prohibited-activities" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <AlertOctagon className="w-5 h-5 text-red-600" />
          <span>3. Prohibited Activities</span>
        </h2>
        <p>The following activities are strictly prohibited across all ST-SOLUTIONS endpoints:</p>

        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>
            <strong className="text-slate-900">Form & API Abuse:</strong> Submitting fake contact inquiries, spamming project discovery forms, or executing automated scripts targeting public submission forms.
          </li>
          <li>
            <strong className="text-slate-900">Unauthorized Security Exploitation:</strong> Attempting SQL injection, Cross-Site Scripting (XSS), credential harvesting, or automated brute-force attacks against authentication endpoints (<code className="font-mono text-slate-800">/auth/login</code>, <code className="font-mono text-slate-800">/auth/register</code>).
          </li>
          <li>
            <strong className="text-slate-900">Scanning & Probing:</strong> Performing unauthorized automated vulnerability scans or port probes against ST-SOLUTIONS servers without prior explicit written permission.
          </li>
          <li>
            <strong className="text-slate-900">Rate Limit Circumvention:</strong> Using IP spoofing, proxies, or botnets to bypass backend API rate limiters or firewall protections.
          </li>
          <li>
            <strong className="text-slate-900">Malicious Payloads:</strong> Uploading or transmitting files containing viruses, trojans, ransomware, or corrupted scripts through application attachment forms.
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section id="security-integrity" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Terminal className="w-5 h-5 text-[#B88E20]" />
          <span>4. System & API Security Integrity</span>
        </h2>
        <p>
          You must not attempt to compromise the integrity, availability, or confidentiality of ST-SOLUTIONS platform services or database clusters.
        </p>
        <p>
          Our backend continuously logs administrative actions, authentication attempts, and API endpoints to detect anomalous traffic patterns and enforce security compliance.
        </p>
      </section>

      {/* Section 5 */}
      <section id="enforcement" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Lock className="w-5 h-5 text-[#B88E20]" />
          <span>5. Enforcement & Account Suspension</span>
        </h2>
        <p>
          ST-SOLUTIONS reserves the right to take immediate action upon detecting violations of this AUP, including:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>Blocking offensive IP addresses at the firewall layer.</li>
          <li>Revoking platform account permissions and terminating JWT access tokens.</li>
          <li>Reporting malicious activities to network providers and legal authorities where warranted.</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section id="reporting-contact" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <ShieldAlert className="w-5 h-5 text-[#B88E20]" />
          <span>6. Reporting Violations & Contact</span>
        </h2>
        <p>
          To report suspected misuse, security threats, or spam originating from our domain, please notify our team immediately at:{" "}
          <a href={`mailto:${companyConfig.contact.email}`} className="text-[#B88E20] font-bold underline">
            {companyConfig.contact.email}
          </a>
        </p>
      </section>
    </LegalLayout>
  );
};
