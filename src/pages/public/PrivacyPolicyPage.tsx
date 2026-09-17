import React from "react";
import { LegalLayout, TocItem } from "../../components/public/LegalLayout.js";
import { ShieldCheck, Database, Lock, Eye, Server, UserCheck, FileText } from "lucide-react";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

const tocItems: TocItem[] = [
  { id: "overview", title: "Overview & Scope" },
  { id: "information-collected", title: "Information We Collect" },
  { id: "cookies-storage", title: "Cookies & Local Storage" },
  { id: "use-of-information", title: "How Information Is Used" },
  { id: "infrastructure-security", title: "Data Storage & Security" },
  { id: "user-rights-retention", title: "Data Retention & Your Rights" },
  { id: "third-parties", title: "Third-Party Services" },
  { id: "childrens-privacy", title: "Children's Privacy" },
  { id: "contact-policy", title: "Policy Updates & Contact" },
];

export const PrivacyPolicyPage: React.FC = () => {
  const companyConfig = usePublicCMS();

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="This Privacy Policy outlines how ST-SOLUTIONS collects, protects, uses, and manages information provided across our website, project discovery tools, and enterprise platform."
      badgeText="Data Protection & Privacy"
      icon={<ShieldCheck className="w-3.5 h-3.5" />}
      toc={tocItems}
    >
      {/* Section 1 */}
      <section id="overview" className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Eye className="w-5 h-5 text-[#B88E20]" />
          <span>1. Overview & Scope</span>
        </h2>
        <p>
          ST-SOLUTIONS ("we", "us", or "our") is committed to protecting the privacy and security of individuals who visit our website, submit inquiries, apply for membership, or interact with our enterprise platform.
        </p>
        <p>
          This Privacy Policy applies to information collected through our public website (including contact forms, project inquiry forms, and career/membership applications) and our authenticated platform services.
        </p>
      </section>

      {/* Section 2 */}
      <section id="information-collected" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <FileText className="w-5 h-5 text-[#B88E20]" />
          <span>2. Information We Collect</span>
        </h2>
        <p>
          We only collect information necessary to respond to business inquiries, evaluate applications, manage client projects, and maintain platform security:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>
            <strong className="text-slate-900">Contact & Inquiry Information:</strong> Name, email address, phone/WhatsApp number, subject, and project details submitted through our contact forms or Project Discovery Wizard.
          </li>
          <li>
            <strong className="text-slate-900">Member & Career Applications:</strong> Full name, contact details, technical experience level, portfolio or LinkedIn links, and cover notes provided via our application portal.
          </li>
          <li>
            <strong className="text-slate-900">Platform Account Credentials:</strong> Full name, email address, organization affiliation, and securely hashed passwords when register or log into the ST-SOLUTIONS enterprise platform.
          </li>
          <li>
            <strong className="text-slate-900">Technical & Audit Logs:</strong> IP addresses, browser types, HTTP request headers, endpoint timestamps, and system action logs stored to maintain administrative security and operational auditability.
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="cookies-storage" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Database className="w-5 h-5 text-[#B88E20]" />
          <span>3. Cookies & Local Browser Storage</span>
        </h2>
        <p>
          ST-SOLUTIONS maintains a strict privacy posture regarding web tracking:
        </p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="font-semibold text-slate-900 block text-xs font-mono uppercase tracking-wider">
            Essential Local Storage Technologies Used:
          </span>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
            <li>
              <code className="text-[#B88E20] font-mono font-bold">accessToken</code>: Encrypted JSON Web Token (JWT) stored in browser storage to preserve authenticated staff/client dashboard sessions.
            </li>
            <li>
              <code className="text-[#B88E20] font-mono font-bold">st_theme</code>: Stores user dark/light mode UI preferences.
            </li>
          </ul>
        </div>
        <p className="text-sm text-slate-600">
          <strong>No Third-Party Advertising Trackers:</strong> We do not deploy third-party advertising cookies, cross-site behavioral tracking scripts, or marketing pixels on our public website.
        </p>
      </section>

      {/* Section 4 */}
      <section id="use-of-information" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <UserCheck className="w-5 h-5 text-[#B88E20]" />
          <span>4. How Information Is Used</span>
        </h2>
        <p>We process collected data exclusively for valid business and legal purposes:</p>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>Evaluating project scope requirements and preparing tailored engineering proposals.</li>
          <li>Communicating regarding inquiries, ongoing development milestones, and client updates.</li>
          <li>Processing member and partner applications for engineering roles or collaboration.</li>
          <li>Authenticating user sessions and enforcing Role-Based Access Control (RBAC) across platform modules.</li>
          <li>Detecting, preventing, and auditing security threats or unauthorized access attempts.</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section id="infrastructure-security" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Server className="w-5 h-5 text-[#B88E20]" />
          <span>5. Data Storage & Security</span>
        </h2>
        <p>
          All submitted data is stored securely in PostgreSQL relational databases backed by enterprise-grade cloud container infrastructure.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>
            <strong className="text-slate-900">Transport Security:</strong> All data transmitted between your browser and our servers is encrypted in transit using HTTPS (TLS 1.2+).
          </li>
          <li>
            <strong className="text-slate-900">Credential Protection:</strong> Account passwords are salted and hashed using standard bcrypt algorithms before database write operations.
          </li>
          <li>
            <strong className="text-slate-900">Access Isolation:</strong> Database access is strictly restricted to authenticated API services with environment variable key protection.
          </li>
        </ul>
      </section>

      {/* Section 6 */}
      <section id="user-rights-retention" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Lock className="w-5 h-5 text-[#B88E20]" />
          <span>6. Data Retention & Your Rights</span>
        </h2>
        <p>
          We retain inquiry and project information for as long as necessary to fulfill business engagements or satisfy legal record-keeping obligations.
        </p>
        <p>Depending on your jurisdiction, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>Request a summary of personal information held about you.</li>
          <li>Request corrections or updates to inaccurate contact information.</li>
          <li>Request deletion of your submitted inquiry or application data where legally permissible.</li>
        </ul>
      </section>

      {/* Section 7 */}
      <section id="third-parties" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <ShieldCheck className="w-5 h-5 text-[#B88E20]" />
          <span>7. Third-Party Services</span>
        </h2>
        <p>
          Our public website provides optional links to official messaging channels (e.g., WhatsApp and WeChat) and external portfolios. Clicking these links transfers you to those third-party platforms, which operate under their respective privacy policies.
        </p>
      </section>

      {/* Section 8 */}
      <section id="childrens-privacy" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <ShieldCheck className="w-5 h-5 text-[#B88E20]" />
          <span>8. Children's Privacy</span>
        </h2>
        <p>
          Our website and platform services are designed for enterprise organizations and adult business professionals. We do not knowingly collect personal information from individuals under 18 years of age.
        </p>
      </section>

      {/* Section 9 */}
      <section id="contact-policy" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <ShieldCheck className="w-5 h-5 text-[#B88E20]" />
          <span>9. Policy Updates & Contact</span>
        </h2>
        <p>
          We may update this Privacy Policy periodically to reflect changes in platform technology or operational procedures.
        </p>
        <p>
          For privacy inquiries or data requests, contact us at:{" "}
          <a href={`mailto:${companyConfig.contact.email}`} className="text-[#B88E20] font-bold underline">
            {companyConfig.contact.email}
          </a>
        </p>
      </section>
    </LegalLayout>
  );
};
