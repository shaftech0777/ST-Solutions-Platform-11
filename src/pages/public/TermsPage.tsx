import React from "react";
import { LegalLayout, TocItem } from "../../components/public/LegalLayout.js";
import { FileText, Shield, CheckCircle2, Lock, AlertTriangle, Scale, Cpu } from "lucide-react";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

const tocItems: TocItem[] = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "services", title: "ST-SOLUTIONS Services" },
  { id: "inquiries", title: "Inquiries & Statements of Work" },
  { id: "client-responsibilities", title: "Client Responsibilities" },
  { id: "platform-access", title: "Accounts & Platform Access" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "confidentiality", title: "Confidentiality" },
  { id: "disclaimers", title: "Service Availability & Disclaimers" },
  { id: "limitation-liability", title: "Limitation of Liability" },
  { id: "termination", title: "Termination & Suspension" },
  { id: "changes-contact", title: "Changes & Contact Information" },
];

export const TermsPage: React.FC = () => {
  const companyConfig = usePublicCMS();

  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="These Terms & Conditions govern your access to and use of the ST-SOLUTIONS website, project discovery tools, consulting services, and platform."
      badgeText="Platform & Service Terms"
      icon={<FileText className="w-3.5 h-3.5" />}
      toc={tocItems}
    >
      {/* Section 1 */}
      <section id="acceptance" className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <CheckCircle2 className="w-5 h-5 text-[#B88E20]" />
          <span>1. Acceptance of Terms</span>
        </h2>
        <p>
          By accessing or using the ST-SOLUTIONS website, submitting a project inquiry, applying for platform membership, or logging into our platform dashboards, you agree to be bound by these Terms & Conditions ("Terms").
        </p>
        <p>
          If you are accessing or using our services on behalf of a company or organizational entity, you represent and warrant that you have full legal authority to bind that entity to these Terms.
        </p>
      </section>

      {/* Section 2 */}
      <section id="services" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Cpu className="w-5 h-5 text-[#B88E20]" />
          <span>2. ST-SOLUTIONS Services</span>
        </h2>
        <p>
          ST-SOLUTIONS provides technology engineering, custom software development, web application design, enterprise AI system integration, and business workflow automation solutions.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>Custom Web Applications & Multi-Tenant SaaS Systems</li>
          <li>Enterprise Backend Software & API Engineering</li>
          <li>AI Systems Integration & Enterprise Search Pipelines</li>
          <li>Database Architecture & Workflow Automation Engine Setup</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="inquiries" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <FileText className="w-5 h-5 text-[#B88E20]" />
          <span>3. Project Inquiries & Statements of Work</span>
        </h2>
        <p>
          Submitting an inquiry through our contact form or Project Discovery Wizard does not constitute a binding contract for services.
        </p>
        <p>
          Formal software engineering engagements are governed by specific project contracts, Statements of Work (SOW), or Service Agreements executed directly between ST-SOLUTIONS and the client specifying scope, deliverables, pricing, and project timelines.
        </p>
      </section>

      {/* Section 4 */}
      <section id="client-responsibilities" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Shield className="w-5 h-5 text-[#B88E20]" />
          <span>4. Client Responsibilities</span>
        </h2>
        <p>Clients engaging ST-SOLUTIONS for development work agree to:</p>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>Provide accurate business requirements, technical context, and feedback in a timely manner.</li>
          <li>Ensure that all content, logos, branding assets, or datasets provided to ST-SOLUTIONS do not infringe upon any third-party intellectual property or copyright laws.</li>
          <li>Maintain reasonable security controls over their internal systems when integrating with ST-SOLUTIONS platforms or APIs.</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section id="platform-access" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Lock className="w-5 h-5 text-[#B88E20]" />
          <span>5. Accounts & Platform Access</span>
        </h2>
        <p>
          Access to authenticated dashboard modules (including management, client, and developer tools) is restricted to authorized credentials.
        </p>
        <p>
          Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their logged-in session. Promptly notify our team if you suspect unauthorized account access.
        </p>
      </section>

      {/* Section 6 */}
      <section id="intellectual-property" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Scale className="w-5 h-5 text-[#B88E20]" />
          <span>6. Intellectual Property</span>
        </h2>
        <p>
          The ST-SOLUTIONS website, brand, logo, design system, core codebase, and underlying platform architectures remain the exclusive property of ST-SOLUTIONS.
        </p>
        <p>
          Ownership of custom client deliverables, bespoke application code, and project assets created under formal Statements of Work transfers to the client upon full payment according to project contract terms.
        </p>
      </section>

      {/* Section 7 */}
      <section id="confidentiality" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Lock className="w-5 h-5 text-[#B88E20]" />
          <span>7. Confidentiality</span>
        </h2>
        <p>
          Both parties agree to treat non-public business information, source code, data schemas, and technical documentation shared during project discovery and execution as strictly confidential.
        </p>
      </section>

      {/* Section 8 */}
      <section id="disclaimers" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <AlertTriangle className="w-5 h-5 text-[#B88E20]" />
          <span>8. Service Availability & Disclaimers</span>
        </h2>
        <p>
          Our public website and platform tools are provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for continuous uptime and optimal performance, we do not guarantee uninterrupted access or error-free web operations.
        </p>
      </section>

      {/* Section 9 */}
      <section id="limitation-liability" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Scale className="w-5 h-5 text-[#B88E20]" />
          <span>9. Limitation of Liability</span>
        </h2>
        <p>
          To the maximum extent permitted by applicable law, ST-SOLUTIONS shall not be liable for indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to access the website or platform.
        </p>
      </section>

      {/* Section 10 */}
      <section id="termination" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <AlertTriangle className="w-5 h-5 text-[#B88E20]" />
          <span>10. Termination & Suspension</span>
        </h2>
        <p>
          We reserve the right to suspend or terminate platform account access or refuse service to any individual or organization that violates these Terms, attempts unauthorized security breaches, or engages in abusive activities.
        </p>
      </section>

      {/* Section 11 */}
      <section id="changes-contact" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <FileText className="w-5 h-5 text-[#B88E20]" />
          <span>11. Changes & Contact Information</span>
        </h2>
        <p>
          ST-SOLUTIONS may revise these Terms from time to time. Continued use of our website or platform following published updates constitutes acceptance of the modified Terms.
        </p>
        <p>
          Direct all inquiries regarding these Terms to:{" "}
          <a href={`mailto:${companyConfig.contact.email}`} className="text-[#B88E20] font-bold underline">
            {companyConfig.contact.email}
          </a>
        </p>
      </section>
    </LegalLayout>
  );
};
