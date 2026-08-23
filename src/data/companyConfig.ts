export interface SocialPlatformConfig {
  id: string;
  name: string;
  icon: string;
  url: string;
  enabled: boolean;
  handle?: string;
}

export interface CompanyConfig {
  name: string;
  legalName: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  
  // Official Contact Channels
  contact: {
    whatsappNumber: string;
    whatsappDisplay: string;
    whatsappUrl: string;
    phoneNumber: string;
    phoneDisplay: string;
    phoneTel: string;
    email: string;
    weChatId: string;
    weChatDisplayName: string;
    address: string;
    workingHours: string;
  };

  // Founder / Leadership Profile
  founder: {
    name: string;
    role: string;
    title: string;
    bio: string;
    portfolioUrl: string;
    avatarUrl?: string;
  };

  // Social & Platform Presence
  socials: SocialPlatformConfig[];
}

export const companyConfig: CompanyConfig = {
  name: "ST-Solutions",
  legalName: "ST-Solutions Enterprise Platform",
  tagline: "Technology that moves your business forward.",
  shortDescription:
    "ST-Solutions builds modern websites, software, AI systems, and business automation solutions designed around real business needs.",
  longDescription:
    "We partner with businesses to architect, engineer, and deploy high-performance digital systems. From bespoke web applications and custom software to enterprise AI integrations and automated workflows, ST-Solutions delivers robust, scalable technology built for measurable outcomes.",

  contact: {
    whatsappNumber: "+923257263417",
    whatsappDisplay: "03257263417",
    whatsappUrl: "https://wa.me/923257263417?text=Hello%20ST-Solutions%2C%20I%20would%20like%20to%20discuss%20a%20project.",
    phoneNumber: "03257263417",
    phoneDisplay: "0325-7263417",
    phoneTel: "tel:+923257263417",
    email: "stsolutionsofficial@gmail.com",
    weChatId: "",
    weChatDisplayName: "Official WeChat",
    address: "Islamabad / Global Remote Operations",
    workingHours: "Monday – Saturday: 9:00 AM – 7:00 PM (PKT / UTC+5)",
  },

  founder: {
    name: "Muhammad Shaf",
    role: "Founder / Admin",
    title: "Lead Systems Architect & Founder",
    bio: "Systems architect and software engineer specializing in scalable full-stack applications, resilient multi-tenant architectures, and enterprise business automation.",
    portfolioUrl: "https://muhammadshaf.work.gd",
  },

  socials: [
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: "MessageCircle",
      url: "https://wa.me/923257263417",
      handle: "+92 325 7263417",
      enabled: true,
    },
    {
      id: "email",
      name: "Official Email",
      icon: "Mail",
      url: "mailto:stsolutionsofficial@gmail.com",
      handle: "stsolutionsofficial@gmail.com",
      enabled: true,
    },
    {
      id: "wechat",
      name: "WeChat",
      icon: "QrCode",
      url: "#wechat",
      handle: "Official WeChat",
      enabled: true,
    },
    {
      id: "portfolio",
      name: "Founder Portfolio",
      icon: "Globe",
      url: "https://muhammadshaf.work.gd",
      handle: "muhammadshaf.work.gd",
      enabled: true,
    },
  ],
};

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  builds: string[];
  benefits: string[];
  technologies: string[];
}

export const servicesData: ServiceItem[] = [
  {
    id: "web-development",
    title: "Web Development",
    slug: "web-development",
    category: "Digital Platforms",
    shortDesc: "High-performance websites and bespoke web applications built for speed, conversion, and reliability.",
    fullDesc:
      "We design and build modern digital experiences for growth-oriented businesses. From responsive corporate portals to high-throughput client dashboards, our web platforms deliver seamless usability across all device form factors.",
    icon: "Globe",
    builds: [
      "Modern Corporate & Business Websites",
      "High-Conversion Landing Pages",
      "Customer & Client Portals",
      "Internal Business Dashboards",
      "Progressive Web Apps (PWAs)",
      "Custom Content Management Systems",
    ],
    benefits: [
      "Sub-second page load times with modern SSR and SPA architectures",
      "Mobile-first responsive UX optimized for all screen sizes",
      "Enterprise security headers and hardened API integrations",
      "Technical SEO foundations for organic visibility",
    ],
    technologies: ["React", "TypeScript", "Tailwind CSS", "Next.js / Vite", "Node.js", "PostgreSQL"],
  },
  {
    id: "software-development",
    title: "Software Development",
    slug: "software-development",
    category: "Engineering",
    shortDesc: "Custom software solutions engineered to streamline operations and power mission-critical processes.",
    fullDesc:
      "Off-the-shelf software often fails to match your exact business logic. ST-Solutions designs custom software systems from the ground up, providing reliable architecture, secure data persistence, and tailored operational workflows.",
    icon: "Code2",
    builds: [
      "Enterprise Resource & ERP Systems",
      "Custom CRM & Lead Intake Pipelines",
      "Inventory & Order Management Engines",
      "Multi-Tenant SaaS Products",
      "Role-Based Access Control Platforms",
      "Relational & Document Database Architectures",
    ],
    benefits: [
      "Built strictly around your specific workflows and business rules",
      "Eliminates recurring per-seat licensing costs of generic tools",
      "Direct database control and ownership of your intellectual property",
      "Scales cleanly from single teams to multi-regional operations",
    ],
    technologies: ["TypeScript", "Node.js", "Prisma ORM", "PostgreSQL", "Express", "Docker"],
  },
  {
    id: "ai-solutions",
    title: "AI Solutions",
    slug: "ai-solutions",
    category: "Intelligent Systems",
    shortDesc: "Pragmatic artificial intelligence and LLM integration to automate knowledge work and enhance user experience.",
    fullDesc:
      "We help businesses leverage artificial intelligence practically. We build contextual LLM assistants, automated document processing pipelines, intelligent data extraction, and decision-support systems that deliver real ROI.",
    icon: "Brain",
    builds: [
      "Enterprise AI Knowledge Bases & Assistants",
      "Automated Document Processing & Extraction",
      "Intelligent Customer Service Systems",
      "Semantic Search & Retrieval (RAG)",
      "Smart Content Generation & Review Workflows",
      "Predictive Analytics & Categorization Engines",
    ],
    benefits: [
      "Drastically reduces manual data entry and repetitive document handling",
      "24/7 intelligent query resolution for clients and internal staff",
      "Grounds AI responses securely in your private business data",
      "Strict data privacy with zero model training on confidential assets",
    ],
    technologies: ["Gemini API", "OpenAI / Claude SDKs", "LangChain", "Vector Embeddings", "Python / Node.js"],
  },
  {
    id: "business-automation",
    title: "Business Automation",
    slug: "business-automation",
    category: "Operations",
    shortDesc: "End-to-end workflow automation connecting your databases, communications, and business tools.",
    fullDesc:
      "Eliminate repetitive manual tasks, reduce human error, and accelerate turnaround times. We connect your software tools, automated notification channels (Email, SMS, WhatsApp), and transaction workflows into unified, self-running pipelines.",
    icon: "Workflow",
    builds: [
      "Automated Lead Capture & Follow-Up Workflows",
      "Transactional Email & Notification Triggers",
      "Cross-Platform Database Synchronization",
      "Automated Invoice & Payment Tracking",
      "Webhook & Third-Party API Bridges",
      "Audit Trail & Compliance Logging Systems",
    ],
    benefits: [
      "Saves dozens of operational hours every week per department",
      "Guarantees instant response to customer inquiries and transactions",
      "Prevents dropped leads through automated multi-channel routing",
      "Provides transparent telemetry on every automated event",
    ],
    technologies: ["Brevo API", "Stripe / Webhooks", "Cron Jobs", "Message Queues", "REST APIs"],
  },
  {
    id: "e-commerce",
    title: "E-Commerce Systems",
    slug: "e-commerce",
    category: "Commerce",
    shortDesc: "Scalable online stores and merchant platforms built for seamless checkout and inventory control.",
    fullDesc:
      "From specialized merchant storefronts to multi-vendor marketplaces, ST-Solutions develops high-converting e-commerce platforms with integrated payment gateways, live inventory tracking, and robust order fulfillment systems.",
    icon: "ShoppingBag",
    builds: [
      "Custom E-Commerce Storefronts",
      "Merchant Inventory & SKU Management",
      "Secure Multi-Currency Payment Gateways",
      "Order Fulfillment & Dispatch Pipelines",
      "Discount, Coupon & Loyalty Engines",
      "B2B Wholesale & Distributor Portals",
    ],
    benefits: [
      "Fast, frictionless checkout designed to maximize cart completion",
      "Real-time stock synchronization across sales channels",
      "Automated customer receipts, order tracking, and status emails",
      "Full ownership of customer relationships and data without marketplace fees",
    ],
    technologies: ["React", "Stripe Checkout", "PostgreSQL", "Redis", "Cloud CDN"],
  },
  {
    id: "digital-transformation",
    title: "Digital Transformation",
    slug: "digital-transformation",
    category: "Strategy & Upgrades",
    shortDesc: "Modernizing legacy tools, migrating to the cloud, and structuring your digital architecture for scale.",
    fullDesc:
      "Transform outdated spreadsheets, manual paper records, or aging legacy software into modern, cloud-hosted applications. We audit your existing processes and deliver smooth, zero-downtime data migrations.",
    icon: "Cpu",
    builds: [
      "Spreadsheet-to-Database Application Migrations",
      "Legacy Codebase Refactoring & Modernization",
      "Cloud Infrastructure Provisioning & Optimization",
      "Unified API Architecture & Integration",
      "Data Backup, Redundancy & Disaster Recovery",
      "Staff System Training & Technical Documentation",
    ],
    benefits: [
      "Eliminates data corruption and versioning conflicts of manual sheets",
      "Enables secure remote access from any authorized device",
      "Improves system security, uptime, and performance metrics",
      "Future-proofs your digital infrastructure for long-term growth",
    ],
    technologies: ["Neon PostgreSQL", "Prisma", "Express", "Vite", "Docker", "Cloud Run"],
  },
  {
    id: "custom-solutions",
    title: "Custom Technology Solutions",
    slug: "custom-solutions",
    category: "Custom Engineering",
    shortDesc: "Tailored technological systems designed to solve unique, non-standard enterprise challenges.",
    fullDesc:
      "Have a unique business requirement that doesn't fit standard categories? Our engineering team analyzes your operational bottlenecks and architects custom technological solutions tailored precisely to your goals.",
    icon: "Layers",
    builds: [
      "Proprietary Business Logic Engines",
      "Hardware-Software Integration Bridges",
      "Real-Time Telemetry & Tracking Dashboards",
      "Internal Team Collaboration Workspaces",
      "Bespoke Client Verification & Onboarding Hubs",
      "Secure Multi-Level Governance Platforms",
    ],
    benefits: [
      "Exact architectural alignment with your competitive advantage",
      "No compromises on functionality, user experience, or data models",
      "Direct communication with dedicated engineering architects",
      "Comprehensive warranty, SLA support, and continuous enhancement",
    ],
    technologies: ["Full-Stack TypeScript", "PostgreSQL", "REST APIs", "Modern Cloud Architecture"],
  },
];

export interface ProjectShowcaseItem {
  id: string;
  title: string;
  slug: string;
  category: "Web" | "Software" | "AI" | "Automation" | "E-Commerce";
  tagline: string;
  description: string;
  clientType: string;
  status: "Live in Production" | "Delivered" | "Enterprise Active";
  technologies: string[];
  features: string[];
  metrics: { label: string; value: string }[];
}

export const projectsData: ProjectShowcaseItem[] = [
  {
    id: "nexora",
    title: "NEXORA Enterprise Core",
    slug: "nexora-enterprise-core",
    category: "Software",
    tagline: "Multi-tenant cloud operations, telemetry, and RBAC governance engine.",
    description:
      "A comprehensive multi-tenant SaaS foundation architected with strict workspace isolation, cryptographic session management, granular permission matrices, and real-time audit event logging.",
    clientType: "Enterprise Platform",
    status: "Live in Production",
    technologies: ["TypeScript", "Express 5", "Neon PostgreSQL", "Prisma ORM", "React", "Tailwind CSS"],
    features: [
      "Strict multi-tenant organization and workspace data segregation",
      "Cryptographically hashed session tokens with automated rotation",
      "Multi-level RBAC hierarchy (Admin, Sub-Admin, Manager, Member, Client)",
      "Audit trail capturing all sensitive authentication and system events",
      "Automated transactional notification triggers via Brevo REST integration",
    ],
    metrics: [
      { label: "Tenant Isolation", value: "Strict" },
      { label: "Architecture", value: "Multi-Tenant" },
      { label: "Database", value: "PostgreSQL" },
    ],
  },
  {
    id: "quantum-trading",
    title: "Quantum Trading Core Infrastructure",
    slug: "quantum-trading-core",
    category: "Software",
    tagline: "High-frequency algorithmic execution platform and telemetry pipeline.",
    description:
      "High-throughput transactional pipeline and execution engine with real-time risk assessment, automated order routing, and low-latency data ingestion.",
    clientType: "Financial Technology",
    status: "Enterprise Active",
    technologies: ["TypeScript", "Node.js", "PostgreSQL", "Prisma ORM", "WebSocket", "Docker"],
    features: [
      "Low-latency algorithmic trade execution pipelines",
      "Real-time market data ingestion and position monitoring",
      "Multi-account risk parameter validation and execution guardrails",
      "Immutable audit logs and transactional settlement ledgers",
    ],
    metrics: [
      { label: "Latency Profile", value: "Sub-millisecond" },
      { label: "Execution", value: "Automated" },
      { label: "Reliability", value: "Fault-tolerant" },
    ],
  },
  {
    id: "multi-agent-llm",
    title: "Enterprise Multi-Agent LLM Orchestration",
    slug: "multi-agent-llm-orchestration",
    category: "AI",
    tagline: "Real-time decision intelligence engine with vector search integration.",
    description:
      "A multi-agent LLM reasoning pipeline engineered to coordinate specialized autonomous agents across document analysis, knowledge synthesis, and operational decision support.",
    clientType: "Enterprise AI Infrastructure",
    status: "Live in Production",
    technologies: ["TypeScript", "Node.js", "Gemini API", "Vector Embeddings", "REST APIs"],
    features: [
      "Autonomous multi-agent orchestration for complex business workflows",
      "Semantic vector retrieval grounded in private enterprise documentation",
      "Structured output validation with schema conformance enforcement",
      "Role-gated operational tool execution and audit logging",
    ],
    metrics: [
      { label: "Intelligence", value: "Multi-Agent" },
      { label: "Grounding", value: "Vector RAG" },
      { label: "Security", value: "Role-Gated" },
    ],
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Discover",
    tagline: "Understand the Core Problem",
    description:
      "We begin by listening closely to your business objectives, operational bottlenecks, and user requirements. We map out what needs to be solved before writing a single line of code.",
    icon: "Compass",
  },
  {
    step: "02",
    title: "Plan",
    tagline: "Architect the Right Solution",
    description:
      "We design the system architecture, database schema, user flows, and technical stack. You receive a clear, milestone-driven roadmap with transparent deliverables.",
    icon: "FileCode2",
  },
  {
    step: "03",
    title: "Build",
    tagline: "Engineer with Precision",
    description:
      "Our engineers craft clean, type-safe, and modular code following strict enterprise standards. We iterate rapidly while maintaining rigorous security and database integrity.",
    icon: "Hammer",
  },
  {
    step: "04",
    title: "Test",
    tagline: "Verify & Pressure-Test",
    description:
      "Every module undergoes comprehensive testing across responsiveness, cross-browser compatibility, security boundaries, and edge-case validation.",
    icon: "ShieldCheck",
  },
  {
    step: "05",
    title: "Launch",
    tagline: "Seamless Zero-Downtime Deployment",
    description:
      "We orchestrate production deployment on hardened cloud infrastructure with SSL certificates, database migrations, and telemetry monitoring.",
    icon: "Rocket",
  },
  {
    step: "06",
    title: "Support",
    tagline: "Continuous Reliability & Growth",
    description:
      "Technology evolves as your business grows. We provide ongoing maintenance, security updates, SLA support, and feature enhancements for long-term success.",
    icon: "LifeBuoy",
  },
];

export const solutionOptions = [
  {
    id: "sell-online",
    goal: "Sell Online & Scale Commerce",
    shortDesc: "Launch a custom digital storefront, manage products, and accept secure payments.",
    recommendedService: "E-Commerce Systems",
    icon: "ShoppingBag",
    tags: ["Payments", "Storefront", "Inventory"],
  },
  {
    id: "automate-business",
    goal: "Automate Repetitive Work",
    shortDesc: "Eliminate manual data entry, streamline lead intake, and trigger instant notifications.",
    recommendedService: "Business Automation",
    icon: "Zap",
    tags: ["Workflows", "Notifications", "Integrations"],
  },
  {
    id: "build-platform",
    goal: "Build a Business Platform / Portal",
    shortDesc: "Create custom web applications, client dashboards, or multi-user internal portals.",
    recommendedService: "Software Development",
    icon: "LayoutDashboard",
    tags: ["Dashboards", "RBAC", "Portals"],
  },
  {
    id: "add-ai",
    goal: "Integrate Artificial Intelligence",
    shortDesc: "Embed intelligent assistants, automated document analysis, and smart search.",
    recommendedService: "AI Solutions",
    icon: "Brain",
    tags: ["LLMs", "RAG", "Automation"],
  },
  {
    id: "manage-customers",
    goal: "Manage Leads & Customers",
    shortDesc: "Track client requests, organize communications, and streamline onboarding pipelines.",
    recommendedService: "Software Development",
    icon: "Users",
    tags: ["CRM", "Pipelines", "Client Hub"],
  },
  {
    id: "manage-inventory",
    goal: "Manage Inventory & Supply Chain",
    shortDesc: "Real-time stock tracking, expiration alerts, and supplier purchase orders.",
    recommendedService: "Software Development",
    icon: "Boxes",
    tags: ["Inventory", "POS", "Logistics"],
  },
  {
    id: "build-custom",
    goal: "Build a Bespoke Custom System",
    shortDesc: "Architect a custom software engine built precisely around unique business rules.",
    recommendedService: "Custom Technology Solutions",
    icon: "Layers",
    tags: ["Bespoke", "Enterprise", "Architecture"],
  },
  {
    id: "modernize-existing",
    goal: "Modernize an Existing System",
    shortDesc: "Migrate legacy spreadsheets or aging software to modern, secure cloud infrastructure.",
    recommendedService: "Digital Transformation",
    icon: "Cpu",
    tags: ["Migration", "Cloud", "Modernization"],
  },
];

export const industryOptions = [
  { name: "Healthcare & Clinics", icon: "Activity", desc: "Patient portals, appointment engines, and clinical data systems." },
  { name: "Retail & Commercial", icon: "Store", desc: "Point of sale, customer loyalty, and multi-channel inventory." },
  { name: "E-Commerce Brands", icon: "ShoppingBag", desc: "High-converting storefronts, cart recovery, and logistics sync." },
  { name: "Pharmacy Networks", icon: "Pill", desc: "Batch tracking, prescription validation, and supply chain management." },
  { name: "Education & Academies", icon: "GraduationCap", desc: "Student portals, digital courseware, and admission intake." },
  { name: "Professional Services", icon: "Briefcase", desc: "Consultancy portals, client document rooms, and billing engines." },
  { name: "Startups & Emerging Tech", icon: "Sparkles", desc: "Rapid MVP architecture, scalable SaaS foundations, and AI tooling." },
  { name: "Small & Medium Businesses", icon: "Building2", desc: "Custom operational software, automated invoicing, and digital presence." },
];
