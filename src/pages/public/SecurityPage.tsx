import React from "react";
import { LegalLayout, TocItem } from "../../components/public/LegalLayout.js";
import { Lock, Key, ShieldCheck, FileCheck, Eye, Terminal, Server } from "lucide-react";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

const tocItems: TocItem[] = [
  { id: "security-philosophy", title: "Security Architecture Overview" },
  { id: "authentication-rbac", title: "Authentication & Role-Based Access" },
  { id: "data-protection", title: "Data Protection & Input Validation" },
  { id: "audit-logging", title: "Audit Logging & Monitoring" },
  { id: "secret-isolation", title: "Configuration & Key Isolation" },
  { id: "vulnerability-reporting", title: "Responsible Vulnerability Reporting" },
];

export const SecurityPage: React.FC = () => {
  const companyConfig = usePublicCMS();

  return (
    <LegalLayout
      title="Security Overview"
      subtitle="An overview of the software engineering security practices, authentication protocols, and access controls implemented across the ST-SOLUTIONS enterprise platform."
      badgeText="Platform Security Architecture"
      icon={<Lock className="w-3.5 h-3.5" />}
      toc={tocItems}
    >
      {/* Section 1 */}
      <section id="security-philosophy" className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <ShieldCheck className="w-5 h-5 text-[#B88E20]" />
          <span>1. Security Architecture Overview</span>
        </h2>
        <p>
          At ST-SOLUTIONS, security is an integral component of our software engineering lifecycle. We design multi-tenant web applications, APIs, and business platforms around defense-in-depth principles, strict type safety, and authorization boundaries.
        </p>
      </section>

      {/* Section 2 */}
      <section id="authentication-rbac" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Key className="w-5 h-5 text-[#B88E20]" />
          <span>2. Authentication & Role-Based Access Control (RBAC)</span>
        </h2>
        <p>
          Platform access control is governed by multi-tier authorization mechanisms:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>
            <strong className="text-slate-900">Secure Password Hashing:</strong> User account passwords are salted and hashed using standard bcrypt cryptographic hashing algorithms before write persistence in PostgreSQL databases. Raw passwords are never logged or stored in plain text.
          </li>
          <li>
            <strong className="text-slate-900">JSON Web Token (JWT) Authentication:</strong> Authenticated sessions rely on digitally signed JWT access tokens passed via standard <code className="font-mono text-slate-800">Authorization: Bearer</code> HTTP headers.
          </li>
          <li>
            <strong className="text-slate-900">Granular Role-Based Access Control (RBAC):</strong> Every platform endpoint and UI route is strictly guarded by module-level permission checks (System Admin, Organization Admin, Staff, Member, and Client roles).
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="data-protection" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <FileCheck className="w-5 h-5 text-[#B88E20]" />
          <span>3. Data Protection & Input Validation</span>
        </h2>
        <p>
          We employ strict data sanitization and database access protections:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>
            <strong className="text-slate-900">Transport Layer Encryption:</strong> All communications between web browsers, public contact forms, and backend APIs are encrypted in transit using HTTPS (TLS 1.2+).
          </li>
          <li>
            <strong className="text-slate-900">Parameterized Database Queries:</strong> Data queries are constructed using Drizzle ORM parameterized abstraction layers, neutralizing SQL injection vectors.
          </li>
          <li>
            <strong className="text-slate-900">Strict Schema Input Validation:</strong> All incoming HTTP requests, contact submissions, and administrative payload objects are validated against Zod schemas prior to controller processing.
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section id="audit-logging" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Eye className="w-5 h-5 text-[#B88E20]" />
          <span>4. Audit Logging & System Tracking</span>
        </h2>
        <p>
          To maintain administrative accountability and security visibility:
        </p>
        <p className="text-sm text-slate-700">
          The ST-SOLUTIONS backend includes a dedicated Audit Log subsystem (<code className="font-mono text-slate-800">AuditLogsModule</code>) that records administrative user actions, setting updates, organization changes, and authentication events with timestamps and user identifiers.
        </p>
      </section>

      {/* Section 5 */}
      <section id="secret-isolation" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Server className="w-5 h-5 text-[#B88E20]" />
          <span>5. Configuration & Key Isolation</span>
        </h2>
        <p>
          All sensitive server credentials, database connection strings, and backend API keys are isolated exclusively within server-side environment configurations.
        </p>
        <p className="text-sm text-slate-700">
          API keys are never exposed inside public client-side browser JavaScript bundles, ensuring third-party services and backend integration keys remain protected.
        </p>
      </section>

      {/* Section 6 */}
      <section id="vulnerability-reporting" className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Terminal className="w-5 h-5 text-[#B88E20]" />
          <span>6. Responsible Vulnerability Reporting</span>
        </h2>
        <p>
          We welcome feedback from security researchers and developers. If you discover a potential vulnerability within our website or platform, please disclose it responsibly by contacting our engineering team directly at:
        </p>
        <p className="text-sm">
          <a href={`mailto:${companyConfig.contact.email}`} className="text-[#B88E20] font-bold underline font-mono">
            {companyConfig.contact.email}
          </a>
        </p>
        <p className="text-xs text-slate-500">
          Please provide clear reproduction steps and refrain from disruptive automated security testing against production databases or services.
        </p>
      </section>
    </LegalLayout>
  );
};
