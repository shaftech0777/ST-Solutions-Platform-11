import bcrypt from "bcrypt";
import { config } from "../config/index.js";

// Types
export interface MemoryStore {
  users: any[];
  profiles: any[];
  sessions: any[];
  roles: any[];
  permissions: any[];
  rolePermissions: any[];
  organizations: any[];
  workspaces: any[];
  organizationMembers: any[];
  workspaceMembers: any[];
  clients: any[];
  projects: any[];
  projectUpdates: any[];
  payments: any[];
  applicants: any[];
  auditLogs: any[];
  notifications: any[];
  systemSettings: any[];
  administrativeNotices: any[];
  userPerformances: any[];
  themeSettings: any[];
  cmsSections: any[];
  members: any[];
  ranks: any[];
  projectInquiries: any[];
  inquiryActivities: any[];
  featureFlags: any[];
  portfolioProjects: any[];
  portfolioCategories: any[];
  faqs: any[];
  socialLinks: any[];
  services: any[];
  serviceCategories: any[];
  applicationQuestions: any[];
  contactMessages: any[];
  communicationLogs: any[];
  automationLogs: any[];
  newsletterSubscribers: any[];
  clientRequests: any[];
}

function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export function createInitialData(): MemoryStore {
  const adminEmail = (config?.auth?.adminEmail || process.env.ADMIN_EMAIL || "admin@st-solutions.com").toLowerCase().trim();
  const adminPassword = config?.auth?.adminPassword || process.env.ADMIN_PASSWORD || "Admin@123456";
  const subAdminEmail = (config?.auth?.subAdminEmail || process.env.SUB_ADMIN_EMAIL || "subadmin@st-solutions.com").toLowerCase().trim();
  const subAdminPassword = config?.auth?.subAdminPassword || process.env.SUB_ADMIN_PASSWORD || "SubAdmin@123456";

  const adminPasswordHash = bcrypt.hashSync(adminPassword, 10);
  const subAdminPasswordHash = bcrypt.hashSync(subAdminPassword, 10);
  const now = new Date();

  const permissions = [
    { id: "perm-1", name: "projects.create", description: "Create projects", module: "PROJECTS" },
    { id: "perm-2", name: "projects.read", description: "View projects", module: "PROJECTS" },
    { id: "perm-3", name: "projects.update", description: "Update projects", module: "PROJECTS" },
    { id: "perm-4", name: "projects.delete", description: "Delete projects", module: "PROJECTS" },
    { id: "perm-5", name: "clients.create", description: "Create clients", module: "CLIENTS" },
    { id: "perm-6", name: "clients.read", description: "View clients", module: "CLIENTS" },
    { id: "perm-7", name: "clients.update", description: "Update clients", module: "CLIENTS" },
    { id: "perm-8", name: "clients.delete", description: "Delete clients", module: "CLIENTS" },
    { id: "perm-9", name: "payments.create", description: "Create payments", module: "PAYMENTS" },
    { id: "perm-10", name: "payments.read", description: "View payments", module: "PAYMENTS" },
    { id: "perm-11", name: "payments.update", description: "Update payments", module: "PAYMENTS" },
    { id: "perm-12", name: "payments.delete", description: "Delete payments", module: "PAYMENTS" },
    { id: "perm-13", name: "applicants.create", description: "Create applicants", module: "APPLICANTS" },
    { id: "perm-14", name: "applicants.read", description: "View applicants", module: "APPLICANTS" },
    { id: "perm-15", name: "applicants.update", description: "Update applicants", module: "APPLICANTS" },
    { id: "perm-16", name: "applicants.delete", description: "Delete applicants", module: "APPLICANTS" },
    { id: "perm-17", name: "members.invite", description: "Invite members", module: "MEMBERS" },
    { id: "perm-18", name: "members.read", description: "View members", module: "MEMBERS" },
    { id: "perm-19", name: "members.update", description: "Update member roles", module: "MEMBERS" },
    { id: "perm-20", name: "members.delete", description: "Remove members", module: "MEMBERS" },
    { id: "perm-21", name: "organizations.update", description: "Manage organization", module: "ORGANIZATIONS" },
    { id: "perm-22", name: "audit.read", description: "View audit logs", module: "AUDIT" },
    { id: "perm-23", name: "ai.query", description: "Access AI Assistant", module: "AI" },
    { id: "perm-24", name: "users.create", description: "Create user accounts", module: "USERS" },
    { id: "perm-25", name: "users.read", description: "View user accounts", module: "USERS" },
    { id: "perm-26", name: "users.update", description: "Update user accounts", module: "USERS" },
    { id: "perm-27", name: "users.delete", description: "Delete user accounts", module: "USERS" },
  ];

  const roles = [
    { id: "role-admin", name: "ADMIN", description: "Full system administration access", isSystem: true },
    { id: "role-subadmin", name: "SUB_ADMIN", description: "Administrative access with user restrictions", isSystem: true },
    { id: "role-manager", name: "MANAGER", description: "Project & Operations Manager", isSystem: true },
    { id: "role-member", name: "MEMBER", description: "Standard Organization Contributor", isSystem: true },
    { id: "role-client", name: "CLIENT", description: "Client Portal Access", isSystem: true },
  ];

  const rolePermissions = permissions.map((p, idx) => ({
    id: `rp-admin-${idx + 1}`,
    roleId: "role-admin",
    permissionId: p.id,
  }));

  const userAdmin = {
    id: "user-admin-1",
    email: adminEmail,
    passwordHash: adminPasswordHash,
    accountType: "ADMIN",
    status: "ACTIVE",
    roleId: "role-admin",
    createdAt: now,
    updatedAt: now,
  };

  const userSubAdmin = {
    id: "user-subadmin-1",
    email: subAdminEmail,
    passwordHash: subAdminPasswordHash,
    accountType: "SUB_ADMIN",
    status: "ACTIVE",
    roleId: "role-subadmin",
    createdAt: now,
    updatedAt: now,
  };

  const profileAdmin = {
    id: "profile-admin-1",
    userId: "user-admin-1",
    fullName: "Shaf Tech Admin",
    title: "Executive Director",
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
  };

  const profileSubAdmin = {
    id: "profile-subadmin-1",
    userId: "user-subadmin-1",
    fullName: "Jordan Lee (Sub-Admin)",
    title: "Deputy Operations Lead",
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
  };

  const org = {
    id: "org-default-1",
    name: "Shaf Tech Solutions",
    slug: "shaf-tech-solutions",
    status: "ACTIVE",
    ownerId: "user-admin-1",
    createdAt: now,
    updatedAt: now,
  };

  const ws = {
    id: "ws-default-1",
    organizationId: "org-default-1",
    name: "Main Operations",
    slug: "main-operations",
    description: "Primary workspace for ST-Solutions projects and services",
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  const orgMember = {
    id: "om-admin-1",
    organizationId: "org-default-1",
    userId: "user-admin-1",
    role: "OWNER",
    createdAt: now,
    updatedAt: now,
  };

  const wsMember = {
    id: "wm-admin-1",
    workspaceId: "ws-default-1",
    userId: "user-admin-1",
    role: "ADMIN",
    createdAt: now,
    updatedAt: now,
  };

  const auditLog1 = {
    id: "aud-1",
    organizationId: "org-default-1",
    workspaceId: "ws-default-1",
    userId: "user-admin-1",
    action: "SYSTEM_INITIALIZED",
    entityType: "System",
    entityId: "system-root",
    description: "ST-Solutions Enterprise Platform initialized with Multi-Tenant Architecture.",
    ipAddress: "127.0.0.1",
    metadata: { version: "1.0.0" },
    createdAt: new Date(Date.now() - 24 * 3600000),
  };

  const notification1 = {
    id: "notif-1",
    userId: "user-admin-1",
    title: "Platform Ready",
    message: "ST-Solutions Enterprise Operations Dashboard is active and connected.",
    isRead: false,
    link: "/dashboard",
    type: "SYSTEM",
    createdAt: now,
  };

  const systemSettings = [
    { id: "set-1", key: "platform_name", value: "ST-Solutions Enterprise", category: "GENERAL" },
    { id: "set-2", key: "default_currency", value: "USD", category: "FINANCE" },
    { id: "set-3", key: "ai_model", value: "gemini-3.7-flash", category: "AI" },
    { id: "set-4", key: "maintenance_mode", value: "false", category: "SECURITY" },
  ];

  const defaultTheme = {
    id: "theme-default-1",
    primaryColor: "#D4AF37",
    secondaryColor: "#1E293B",
    accentColor: "#3B82F6",
    backgroundColor: "#F8FAFC",
    textColor: "#0F172A",
    borderColor: "#E2E8F0",
    buttonRadius: "12px",
    fontFamily: "sans",
    darkMode: false,
    logoUrl: "/brand-logo.png",
    faviconUrl: "/favicon.ico",
    createdAt: now,
    updatedAt: now,
  };

  const defaultCMSSections = [
    {
      id: "cms-hero-1",
      sectionKey: "HERO",
      title: "Pioneering Software, Cloud & AI Engineering",
      subtitle: "Enterprise-grade digital solutions tailored for exponential scalability and mission-critical execution.",
      content: "Shaf Tech Solutions delivers bespoke software engineering, AI automation, cloud architectures, and digital security solutions.",
      badgeText: "ST-SOLUTIONS PLATFORM 11",
      isVisible: true,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "cms-about-1",
      sectionKey: "ABOUT",
      title: "Engineering Excellence with Global Impact",
      subtitle: "A trusted technology partner for global enterprises and ambitious startups.",
      content: "We blend deep technical capability with strategic execution to build software that scales globally.",
      badgeText: "ABOUT US",
      isVisible: true,
      displayOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "cms-services-1",
      sectionKey: "SERVICES",
      title: "Specialized Technology Capabilities",
      subtitle: "End-to-end technical execution across modern cloud, web, mobile, and AI stacks.",
      content: "From custom full-stack web platforms to autonomous AI workflows, our engineers build robust solutions.",
      badgeText: "OUR EXPERTISE",
      isVisible: true,
      displayOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    users: [userAdmin, userSubAdmin],
    profiles: [profileAdmin, profileSubAdmin],
    sessions: [],
    roles,
    permissions,
    rolePermissions,
    organizations: [org],
    workspaces: [ws],
    organizationMembers: [orgMember],
    workspaceMembers: [wsMember],
    clients: [],
    projects: [],
    projectUpdates: [],
    payments: [],
    applicants: [],
    auditLogs: [auditLog1],
    notifications: [notification1],
    systemSettings,
    administrativeNotices: [],
    userPerformances: [],
    themeSettings: [defaultTheme],
    cmsSections: defaultCMSSections,
    members: [],
    ranks: [
      { id: "rank-1", name: "Specialist", level: 1, colorCode: "#3B82F6" },
      { id: "rank-2", name: "Lead Manager", level: 2, colorCode: "#D4AF37" },
    ],
    projectInquiries: [],
    inquiryActivities: [],
    featureFlags: [
      { id: "flag-1", featureKey: "ai_copilot", displayName: "AI Copilot & Smart Assistant", description: "Enable generative AI summaries and candidate screening aids", status: "ENABLED", createdAt: now, updatedAt: now },
      { id: "flag-2", featureKey: "applicant_onboarding_pipeline", displayName: "Applicant Onboarding Pipeline", description: "Direct single-click conversion of approved applicants to team members", status: "ENABLED", createdAt: now, updatedAt: now },
      { id: "flag-3", featureKey: "realtime_audit_streaming", displayName: "Real-Time Audit Telemetry", description: "Capture and index all user mutations in the security audit ledger", status: "ENABLED", createdAt: now, updatedAt: now },
      { id: "flag-4", featureKey: "automated_invoice_generation", displayName: "Automated Invoice Generation", description: "Auto-generate PDF invoices upon payment milestone completions", status: "ENABLED", createdAt: now, updatedAt: now },
      { id: "flag-5", featureKey: "two_factor_enforcement", displayName: "Mandatory 2FA for Administrators", description: "Enforce OTP authentication for all users holding ADMIN or OWNER roles", status: "DISABLED", createdAt: now, updatedAt: now },
    ],
    portfolioCategories: [
      { id: "cat-1", name: "E-Commerce", description: "Digital storefronts, product catalogs, and online payment solutions", displayOrder: 1, createdAt: now, updatedAt: now },
      { id: "cat-2", name: "Business Software", description: "Custom internal ERPs, CRMs, inventory, and operational dashboards", displayOrder: 2, createdAt: now, updatedAt: now },
      { id: "cat-3", name: "Web Applications", description: "Interactive client portals, SaaS applications, and booking systems", displayOrder: 3, createdAt: now, updatedAt: now },
      { id: "cat-4", name: "AI & Automation", description: "Intelligent customer assistants, workflow pipelines, and webhook triggers", displayOrder: 4, createdAt: now, updatedAt: now },
    ],
    portfolioProjects: [
      {
        id: "proj-showcase-1",
        title: "Apex E-Commerce & Retail Platform",
        slug: "apex-ecommerce-platform",
        categoryId: "cat-1",
        projectType: "E-Commerce Storefront",
        tagline: "High-converting online store with seamless mobile checkout & inventory control",
        description: "A comprehensive digital storefront engineered for fast product discovery, frictionless checkout, automated order confirmation, and real-time inventory synchronization.",
        fullDescription: "Built for modern retail businesses needing a reliable online sales channel without expensive marketplace commissions. Includes barcode SKU search, automated WhatsApp order alerts, customer account dashboards, and multi-currency payment gateway integrations.",
        liveUrl: "https://demo.st-solutions.cloud/ecommerce",
        githubUrl: null,
        thumbnailUrl: "/showcase/ecommerce.png",
        coverImage: "/showcase/ecommerce.png",
        features: ["Instant Product Search & Filtering", "Mobile-Optimized Checkout Flow", "Automated WhatsApp & Email Order Receipts", "Multi-Currency & Payment Gateway Integration", "Merchant Stock Management Dashboard"],
        benefits: ["Increases online order conversion rates", "Eliminates stock discrepancies between store and warehouse", "Delivers professional automated buyer communication"],
        targetAudience: "Retailers, Brand Owners, Wholesale Distributors",
        technologies: ["React", "Tailwind CSS", "Node.js", "PostgreSQL", "Stripe"],
        status: "PUBLISHED",
        featured: true,
        displayOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "proj-showcase-2",
        title: "Medix Pharmacy Management Platform",
        slug: "medix-pharmacy-platform",
        categoryId: "cat-2",
        projectType: "Business Software",
        tagline: "Prescription intake, batch inventory tracking, and POS invoicing",
        description: "An intuitive operational system designed for retail pharmacies and medical suppliers to track batch expiration dates, manage daily sales, and maintain secure prescription records.",
        fullDescription: "Streamlines the entire pharmacy workflow from wholesale supplier procurement to customer counter checkout. Built-in alerts warn dispensers of near-expiry medicine batches and maintain strict inventory records.",
        liveUrl: "https://demo.st-solutions.cloud/pharmacy",
        githubUrl: null,
        thumbnailUrl: "/showcase/pharmacy.png",
        coverImage: "/showcase/pharmacy.png",
        features: ["Batch Number & Expiry Date Alert Engine", "Fast Point-of-Sale (POS) Barcode Billing", "Prescription Intake & Customer History", "Supplier Purchase Order Tracking", "Automated Daily Profit & Loss Summary"],
        benefits: ["Prevents expired medication wastage", "Speeds up counter checkout to under 30 seconds", "Guarantees clear inventory audit trails"],
        targetAudience: "Pharmacies, Medical Distributors, Health Clinics",
        technologies: ["TypeScript", "React", "PostgreSQL", "Offline-Ready Cache"],
        status: "PUBLISHED",
        featured: true,
        displayOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "proj-showcase-3",
        title: "BistroOrder Restaurant & Delivery Hub",
        slug: "bistro-ordering-system",
        categoryId: "cat-3",
        projectType: "Web Application",
        tagline: "Contactless QR ordering, live kitchen display, and direct delivery",
        description: "An all-in-one digital ordering suite for cafes and restaurants featuring QR digital menus, kitchen order ticketing, and direct customer delivery tracking without third-party commission fees.",
        fullDescription: "Empowers food establishments to accept orders directly at dining tables via QR codes or online for delivery. Features real-time kitchen status displays, modifier options (spiciness, extra cheese, drinks), and automated WhatsApp delivery updates.",
        liveUrl: "https://demo.st-solutions.cloud/restaurant",
        githubUrl: null,
        thumbnailUrl: "/showcase/restaurant.png",
        coverImage: "/showcase/restaurant.png",
        features: ["Instant QR Table Ordering", "Real-Time Kitchen Display System (KDS)", "WhatsApp Order Notifications", "Dynamic Modifier & Add-on Pricing", "Customer Loyalty & Discount Engine"],
        benefits: ["Saves 15-30% in third-party delivery marketplace commissions", "Eliminates order miscommunication between floor and kitchen", "Increases average order value through visual upselling"],
        targetAudience: "Restaurants, Cafes, Cloud Kitchens, Food Chains",
        technologies: ["React", "Express", "PostgreSQL", "WebSockets"],
        status: "PUBLISHED",
        featured: true,
        displayOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "proj-showcase-4",
        title: "Pulse Business Operations & CRM Hub",
        slug: "pulse-operations-crm",
        categoryId: "cat-2",
        projectType: "Business Software",
        tagline: "Unified client tracking, team milestones, and financial reporting",
        description: "A centralized command dashboard replacing fragmented spreadsheets with real-time lead pipelines, task assignments, automated client invoicing, and management analytics.",
        fullDescription: "Consolidates all business workflows under one unified, secure platform. Allows managers to track active projects, monitor team workload, generate client invoices, and see cash flow trends in real time.",
        liveUrl: "https://demo.st-solutions.cloud/operations",
        githubUrl: null,
        thumbnailUrl: "/showcase/operations.png",
        coverImage: "/showcase/operations.png",
        features: ["Lead Capture & Customer Relationship Pipeline", "Milestone Tracking & Team Task Delegation", "Automated Client Invoicing & Payment Status", "Executive Key Metric Dashboards", "Role-Based Staff Access Control"],
        benefits: ["Saves 10+ hours per week spent updating disconnected spreadsheets", "Keeps the entire company aligned on client deliverables", "Gives business owners instant visibility into revenue"],
        targetAudience: "Service Agencies, Consultancies, SMBs, Project Teams",
        technologies: ["Full-Stack TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS"],
        status: "PUBLISHED",
        featured: true,
        displayOrder: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "proj-showcase-5",
        title: "OmniBot Business AI Assistant",
        slug: "omnibot-ai-assistant",
        categoryId: "cat-4",
        projectType: "AI & Automation",
        tagline: "Smart 24/7 customer inquiry assistant trained on your business data",
        description: "A custom-trained conversational assistant that answers customer questions, qualifies inbound leads, schedules appointments, and escalates complex issues to human staff.",
        fullDescription: "Integrates directly into client websites and WhatsApp channels. Unlike generic bots, OmniBot is trained on your exact service catalogue, pricing policies, and FAQs to deliver accurate, helpful answers around the clock.",
        liveUrl: "https://demo.st-solutions.cloud/ai-assistant",
        githubUrl: null,
        thumbnailUrl: "/showcase/ai-assistant.png",
        coverImage: "/showcase/ai-assistant.png",
        features: ["Trained Specifically on Your Products & Services", "Instant 24/7 First-Response via Web & WhatsApp", "Lead Qualification & Contact Capture", "Seamless Human Hand-off for Complex Queries", "Interaction Analytics & FAQ Gap Detection"],
        benefits: ["Captures after-hours leads that competitors miss", "Resolves 60%+ of repetitive support queries immediately", "Frees up human team members for high-value sales calls"],
        targetAudience: "E-Commerce Stores, Real Estate, Professional Services, Clinics",
        technologies: ["Gemini 2.5 API", "Python / Node.js", "Vector Knowledge Search"],
        status: "PUBLISHED",
        featured: true,
        displayOrder: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "proj-showcase-6",
        title: "EduSphere School & Academy Portal",
        slug: "edusphere-academic-portal",
        categoryId: "cat-3",
        projectType: "Web Application",
        tagline: "Student enrollment, fee management, and parent communication",
        description: "A modern educational portal coordinating student admissions, attendance logging, grade reporting, and automated fee voucher delivery to parents via SMS and WhatsApp.",
        fullDescription: "Brings modern digital prestige and operational sanity to educational institutions. Provides parents with a mobile portal to view test scores, attendance, and pay term fees conveniently.",
        liveUrl: "https://demo.st-solutions.cloud/edusphere",
        githubUrl: null,
        thumbnailUrl: "/showcase/edusphere.png",
        coverImage: "/showcase/edusphere.png",
        features: ["Student Profile & Academic Record Vault", "Automated Fee Invoicing & Payment Reconciliation", "Parent Notification Bridge (SMS & WhatsApp)", "Teacher Attendance & Class Scheduling", "Report Card & Exam Results Generator"],
        benefits: ["Reduces overdue fee collections through automated reminders", "Builds modern institutional prestige with parents and students", "Eliminates manual paper ledger tracking"],
        targetAudience: "Schools, Colleges, Training Academies, Tutoring Centers",
        technologies: ["React", "Node.js", "PostgreSQL", "Report PDF Engine"],
        status: "PUBLISHED",
        featured: false,
        displayOrder: 6,
        createdAt: now,
        updatedAt: now,
      },
    ],
    faqs: [
      {
        id: "faq-1",
        question: "What kind of projects does ST-Solutions build?",
        answer: "We build modern websites, custom business software, client portals, e-commerce storefronts, internal tools, business automation pipelines, and practical AI assistants designed around your specific business operations.",
        status: "ACTIVE",
        displayOrder: 1,
      },
      {
        id: "faq-2",
        question: "Who owns the code and data once the project is finished?",
        answer: "You do. You receive 100% full ownership of the source code, databases, design assets, and deployment infrastructure. There are no proprietary lock-ins or hidden licensing fees.",
        status: "ACTIVE",
        displayOrder: 2,
      },
      {
        id: "faq-3",
        question: "How do we get started on a project?",
        answer: "You can start by contacting us via WhatsApp, email, or using our interactive Start Project wizard. We will review your goals, clarify your requirements, and provide a clear scope, timeline, and proposal within 24 hours.",
        status: "ACTIVE",
        displayOrder: 3,
      },
      {
        id: "faq-4",
        question: "Do you offer ongoing support and maintenance after launch?",
        answer: "Yes! Every project includes a post-launch warranty and verification period. We also provide ongoing maintenance, feature expansion, and SLA support plans to keep your systems running smoothly as your business grows.",
        status: "ACTIVE",
        displayOrder: 4,
      },
    ],
    socialLinks: [
      { id: "soc-1", platform: "WhatsApp", url: "https://wa.me/923257263417", isVisible: true, displayOrder: 1 },
      { id: "soc-2", platform: "Email", url: "mailto:stsolutionsofficial@gmail.com", isVisible: true, displayOrder: 2 },
      { id: "soc-3", platform: "Founder Portfolio", url: "https://muhammadshaf.work.gd", isVisible: true, displayOrder: 3 },
    ],
    services: [],
    serviceCategories: [],
    applicationQuestions: [
      {
        id: "q-1",
        question: "What is your primary skill or area of interest?",
        fieldType: "DROPDOWN",
        isRequired: true,
        options: [
          "Software / Web / Mobile Development",
          "UI / UX & Graphic Design",
          "Video Editing & Motion Graphics",
          "Content Creation & Social Media",
          "Digital Marketing & SEO",
          "Sales & Business Development",
          "QA & Software Testing",
          "Project Management & Operations",
          "Student / Fresher / Skilled Beginner",
          "Other Professional Skill",
        ],
        placeholder: "Select your primary discipline",
        helpText: "Choose the area where you have the strongest interest or ability",
        category: "GENERAL",
        orderNumber: 1,
        isActive: true,
      },
      {
        id: "q-2",
        question: "Tell us briefly about what you have built, designed, or created.",
        fieldType: "LONG_TEXT",
        isRequired: true,
        options: null,
        placeholder: "Projects, designs, videos, code repositories, or work you are proud of...",
        helpText: "We value actual work and potential over formal degrees",
        category: "EXPERIENCE",
        orderNumber: 2,
        isActive: true,
      },
      {
        id: "q-3",
        question: "Links to your portfolio, GitHub, Behance, YouTube, or work samples",
        fieldType: "URL",
        isRequired: false,
        options: null,
        placeholder: "https://yourportfolio.com or drive/github link",
        helpText: "Optional, but highly recommended so we can review your work directly",
        category: "EXPERIENCE",
        orderNumber: 3,
        isActive: true,
      },
      {
        id: "q-4",
        question: "What is your current availability?",
        fieldType: "DROPDOWN",
        isRequired: true,
        options: ["Full-Time (Remote)", "Part-Time (Remote)", "Freelance / Project-based", "Internship / Learning while contributing"],
        placeholder: "Select your availability",
        helpText: "Let us know how much time you can dedicate",
        category: "AVAILABILITY",
        orderNumber: 4,
        isActive: true,
      },
    ],
    contactMessages: [],
    communicationLogs: [],
    automationLogs: [],
    newsletterSubscribers: [],
    clientRequests: [],
  };
}

export class InMemoryDatabase {
  public data: MemoryStore;

  constructor() {
    this.data = createInitialData();
  }

  public reset() {
    const fresh = createInitialData();
    if (this.data) {
      for (const key of Object.keys(this.data) as (keyof MemoryStore)[]) {
        (this.data as any)[key] = (fresh as any)[key];
      }
    } else {
      this.data = fresh;
    }
  }
}

export const memoryDb = new InMemoryDatabase();
