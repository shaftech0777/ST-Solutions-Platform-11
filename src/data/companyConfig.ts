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
  fullDescription?: string;
  clientType: string;
  targetAudience?: string;
  problemSolved?: string;
  status: "Live in Production" | "Demonstration Ready" | "Enterprise Active";
  technologies: string[];
  features: string[];
  benefits?: string[];
  metrics: { label: string; value: string }[];
  liveUrl?: string;
}

export const projectsData: ProjectShowcaseItem[] = [
  {
    id: "apex-ecommerce",
    title: "Apex E-Commerce & Retail Platform",
    slug: "apex-ecommerce-platform",
    category: "E-Commerce",
    tagline: "High-converting online store with seamless mobile checkout & inventory control.",
    description:
      "A comprehensive digital storefront engineered for fast product discovery, frictionless checkout, automated order confirmation, and real-time inventory synchronization.",
    fullDescription:
      "Built for modern retail businesses and brands needing an independent online sales channel without high marketplace fees. Includes barcode SKU search, automated WhatsApp order alerts, customer account dashboards, and multi-currency payment gateway integrations.",
    clientType: "Retailers & Online Brands",
    targetAudience: "Retailers, Brand Owners, Wholesale Distributors",
    problemSolved: "Eliminates high third-party marketplace commissions and keeps inventory synchronized between physical store and website.",
    status: "Demonstration Ready",
    technologies: ["React", "Tailwind CSS", "Node.js", "PostgreSQL", "Stripe Checkout", "WhatsApp Webhook"],
    features: [
      "Instant product search, category filtering & variant selection",
      "Frictionless 3-step checkout optimized for mobile shoppers",
      "Automated WhatsApp and email order receipts with live tracking",
      "Multi-currency support with secure credit card and local payment gateways",
      "Merchant dashboard for stock management, orders, and sales analytics",
    ],
    benefits: [
      "Increases online checkout conversion rates by up to 28%",
      "Eliminates out-of-stock complaints through real-time stock sync",
      "Gives full direct ownership of your customer list and repeat buyers",
    ],
    metrics: [
      { label: "Checkout Flow", value: "3 Steps" },
      { label: "Speed Score", value: "98/100" },
      { label: "Order Alerts", value: "Instant WhatsApp" },
    ],
    liveUrl: "https://demo.st-solutions.cloud/ecommerce",
  },
  {
    id: "medix-pharmacy",
    title: "Medix Pharmacy Management Platform",
    slug: "medix-pharmacy-platform",
    category: "Software",
    tagline: "Prescription intake, batch inventory tracking, and POS invoicing.",
    description:
      "An intuitive operational system designed for retail pharmacies and medical suppliers to track batch expiration dates, manage daily counter sales, and maintain secure customer medication histories.",
    fullDescription:
      "Streamlines the daily operations of pharmacies from wholesale supplier purchase orders to retail counter checkout. Automatic alerts warn dispensers of near-expiry medicine batches and maintain compliant inventory records.",
    clientType: "Healthcare & Pharmacy Chains",
    targetAudience: "Retail Pharmacies, Medical Distributors, Health Clinics",
    problemSolved: "Prevents losses from expired medications and accelerates counter sales during peak customer rush hours.",
    status: "Demonstration Ready",
    technologies: ["TypeScript", "React", "Node.js", "PostgreSQL", "Barcode Scanner API", "Offline Cache"],
    features: [
      "Automated batch number tracking with 30/60/90-day expiry alerts",
      "High-speed Point-of-Sale (POS) barcode scanner billing in under 15 seconds",
      "Customer prescription records with refill reminders",
      "Wholesale supplier purchase orders and automated stock reordering levels",
      "Daily profit, sales volume, and tax compliance accounting reports",
    ],
    benefits: [
      "Reduces medicine expiration losses by up to 85%",
      "Cuts customer counter wait times in half",
      "Maintains flawless audit records for pharmaceutical compliance",
    ],
    metrics: [
      { label: "Checkout Time", value: "< 15 Sec" },
      { label: "Expiry Alerts", value: "Automated" },
      { label: "Offline Mode", value: "Supported" },
    ],
    liveUrl: "https://demo.st-solutions.cloud/pharmacy",
  },
  {
    id: "bistro-ordering",
    title: "BistroOrder Restaurant & Delivery Hub",
    slug: "bistro-ordering-system",
    category: "Web",
    tagline: "Contactless QR table ordering, live kitchen display, and online delivery.",
    description:
      "An all-in-one digital ordering suite for cafes and restaurants featuring QR digital menus, kitchen order ticketing, and direct customer delivery tracking without third-party commission fees.",
    fullDescription:
      "Empowers food establishments to accept orders directly at dining tables via QR codes or online for delivery. Features real-time kitchen status displays, item modifier options (spiciness, sides, drinks), and automated WhatsApp delivery updates.",
    clientType: "Food & Hospitality",
    targetAudience: "Restaurants, Cafes, Cloud Kitchens, Food Chains",
    problemSolved: "Avoids 15–30% delivery app marketplace fees and ends order confusion between dining floor and kitchen.",
    status: "Demonstration Ready",
    technologies: ["React", "Express", "PostgreSQL", "WebSockets", "WhatsApp API", "Thermal Printer Support"],
    features: [
      "Table QR code menus with high-resolution photos and dish modifiers",
      "Real-time Kitchen Display System (KDS) showing ticket timers and status",
      "Direct online delivery and pickup ordering with zero commission per order",
      "WhatsApp customer notifications for order confirmation and rider dispatch",
      "Integrated loyalty points, discount codes, and happy hour specials",
    ],
    benefits: [
      "Saves thousands of dollars annually in marketplace commissions",
      "Increases average spend through visual food recommendations and upsells",
      "Keeps kitchen and waitstaff coordinated during peak dinner rush",
    ],
    metrics: [
      { label: "Commission Fee", value: "0%" },
      { label: "Order Sync", value: "Real-Time KDS" },
      { label: "Table Ordering", value: "Instant QR" },
    ],
    liveUrl: "https://demo.st-solutions.cloud/restaurant",
  },
  {
    id: "pulse-operations",
    title: "Pulse Business Operations & CRM Hub",
    slug: "pulse-operations-crm",
    category: "Software",
    tagline: "Unified client tracking, team milestones, and financial reporting.",
    description:
      "A centralized command dashboard replacing fragmented spreadsheets with real-time lead pipelines, task assignments, automated client invoicing, and management analytics.",
    fullDescription:
      "Consolidates all business workflows under one unified, secure platform. Allows business owners and managers to track active projects, monitor team workload, generate client invoices, and see cash flow trends in real time.",
    clientType: "Service Companies & SMBs",
    targetAudience: "Service Agencies, Consultancies, SMBs, Project Teams",
    problemSolved: "Ends spreadsheet chaos, lost client follow-ups, and delayed payment collections.",
    status: "Live in Production",
    technologies: ["TypeScript", "Prisma ORM", "PostgreSQL", "React", "Tailwind CSS", "PDF Generation"],
    features: [
      "Visual sales pipeline with lead status, deal size, and follow-up alerts",
      "Client profile vaults containing contracts, project deliverables, and payment receipts",
      "Milestone-based project management with task delegation and time tracking",
      "Automated professional PDF invoice generation with payment tracking",
      "Executive analytics dashboard displaying monthly revenue and team capacity",
    ],
    benefits: [
      "Saves 12+ hours per week previously wasted on manual spreadsheet updates",
      "Speeds up invoice payment cycles with automated polite payment reminders",
      "Gives business owners instant visibility into company performance from anywhere",
    ],
    metrics: [
      { label: "Pipeline Visibility", value: "100%" },
      { label: "Time Saved", value: "12+ Hrs/Wk" },
      { label: "Invoicing", value: "Automated PDF" },
    ],
    liveUrl: "https://demo.st-solutions.cloud/operations",
  },
  {
    id: "omnibot-ai",
    title: "OmniBot Business AI Assistant",
    slug: "omnibot-ai-assistant",
    category: "AI",
    tagline: "Smart 24/7 customer inquiry assistant trained on your business data.",
    description:
      "A custom-trained conversational assistant that answers customer questions, qualifies inbound leads, schedules appointments, and escalates complex issues to human staff.",
    fullDescription:
      "Integrates directly into client websites and WhatsApp channels. Unlike generic bots that give random answers, OmniBot is grounded specifically in your service catalogue, pricing policies, and FAQs to deliver accurate, helpful answers around the clock.",
    clientType: "Customer Support & Lead Gen",
    targetAudience: "E-Commerce Stores, Real Estate, Professional Services, Clinics",
    problemSolved: "Stops lost sales opportunities when prospective customers reach out after business hours.",
    status: "Demonstration Ready",
    technologies: ["Gemini 2.5 API", "Node.js", "Vector Knowledge Search", "WhatsApp Business API", "React Widget"],
    features: [
      "Trained strictly on your website content, product specs, and business policies",
      "Instant response on website live chat and official WhatsApp 24 hours a day",
      "Intelligent lead qualification collecting customer name, phone, and requirements",
      "Seamless escalation to human agents with full conversation context summary",
      "Analytics dashboard highlighting top customer questions and content gaps",
    ],
    benefits: [
      "Captures high-intent leads while your competitors are asleep",
      "Resolves over 65% of repetitive customer questions instantly without human effort",
      "Ensures consistent, polite, and accurate brand communication every time",
    ],
    metrics: [
      { label: "Response Time", value: "< 2 Seconds" },
      { label: "Resolution Rate", value: "65%+" },
      { label: "Availability", value: "24/7/365" },
    ],
    liveUrl: "https://demo.st-solutions.cloud/ai-assistant",
  },
  {
    id: "edusphere-academic",
    title: "EduSphere School & Academy Portal",
    slug: "edusphere-academic-portal",
    category: "Web",
    tagline: "Student enrollment, fee management, and parent communication.",
    description:
      "A modern educational portal coordinating student admissions, attendance logging, grade reporting, and automated fee voucher delivery to parents via SMS and WhatsApp.",
    fullDescription:
      "Brings modern digital prestige and operational sanity to schools and academies. Provides parents with a mobile portal to view test scores and attendance, while automating fee billing and reconciliation for administrators.",
    clientType: "Schools & Educational Institutes",
    targetAudience: "Schools, Colleges, Training Academies, Tutoring Centers",
    problemSolved: "Eliminates overdue fee collection headaches and paper report card printing costs.",
    status: "Demonstration Ready",
    technologies: ["React", "Node.js", "PostgreSQL", "SMS Gateway", "WhatsApp Webhook", "PDF Report Engine"],
    features: [
      "Student digital profile vault with academic history, attendance, and health notes",
      "Automated monthly fee voucher generation with online payment link delivery",
      "Parent mobile portal for homework notifications, exam schedules, and grades",
      "Teacher gradebook and digital attendance marking in under 2 minutes per class",
      "Automated SMS/WhatsApp alerts for absences, announcements, and emergency notices",
    ],
    benefits: [
      "Reduces overdue fee delays by 40% with automated reminder messages",
      "Eliminates hours of manual paper ledger bookkeeping for school staff",
      "Significantly enhances the institution's reputation among modern parents",
    ],
    metrics: [
      { label: "Fee Recovery", value: "+40% Faster" },
      { label: "Paper Saved", value: "10,000+ Pages" },
      { label: "Parent Portal", value: "Mobile Ready" },
    ],
    liveUrl: "https://demo.st-solutions.cloud/edusphere",
  },
  {
    id: "stockflow-inventory",
    title: "StockFlow Warehouse & SKU Inventory System",
    slug: "stockflow-warehouse-inventory",
    category: "Software",
    tagline: "Real-time stock tracking, multi-location transfers, and purchase orders.",
    description:
      "An industrial-grade inventory management system designed for distributors, warehouses, and wholesalers to track stock across multiple branches with barcode scanning.",
    fullDescription:
      "Provides granular visibility into warehouse stock levels, supplier lead times, and dispatch logistics. Features low-stock reorder triggers, inter-branch transfer logging, and serial number tracking.",
    clientType: "Wholesale & Logistics",
    targetAudience: "Wholesalers, Importers, Warehouses, Multi-Branch Retailers",
    problemSolved: "Eliminates phantom inventory, lost items, and duplicate manual stock counting.",
    status: "Demonstration Ready",
    technologies: ["TypeScript", "React", "PostgreSQL", "Barcode & QR Scanner", "Export to Excel/PDF"],
    features: [
      "Multi-branch and multi-warehouse stock visibility from a single screen",
      "Mobile barcode scanning for goods receipt, picking, and dispatch verification",
      "Automated low-stock alerts with supplier purchase order generation",
      "Stock valuation reports using FIFO/Average Costing methods",
      "Role-based worker permissions preventing unauthorized stock adjustments",
    ],
    benefits: [
      "Prevents costly stockouts during peak seasonal demand",
      "Slashes stock audit and inventory counting time by up to 70%",
      "Provides exact gross margin and inventory asset value calculations",
    ],
    metrics: [
      { label: "Stock Accuracy", value: "99.4%" },
      { label: "Audit Speed", value: "3x Faster" },
      { label: "Multi-Location", value: "Unlimited" },
    ],
    liveUrl: "https://demo.st-solutions.cloud/inventory",
  },
  {
    id: "appointease-booking",
    title: "AppointEase Scheduling & Booking System",
    slug: "appointease-scheduling-system",
    category: "Automation",
    tagline: "Automated client appointment booking, calendar sync, and SMS reminders.",
    description:
      "A frictionless booking system for clinics, consultancies, salons, and professional services that automates scheduling and virtually eliminates no-shows.",
    fullDescription:
      "Allows clients to view real-time availability, select a service or practitioner, and book online in seconds. Automatically syncs with Google Calendar, takes optional deposits, and sends WhatsApp/SMS reminders before the appointment.",
    clientType: "Clinics & Service Providers",
    targetAudience: "Medical Clinics, Law Firms, Consultancies, Salons, Instructors",
    problemSolved: "Ends phone tag scheduling and reduces costly client appointment no-shows.",
    status: "Demonstration Ready",
    technologies: ["React", "Node.js", "Google Calendar API", "Twilio / WhatsApp API", "Stripe"],
    features: [
      "Self-service 24/7 client booking page branded with your company identity",
      "Two-way calendar synchronization preventing double-booking across staff",
      "Automated WhatsApp and SMS confirmation and reminder sequence (24h and 2h prior)",
      "Optional upfront deposit or full service fee collection upon booking",
      "Staff scheduling dashboard with buffer time and custom working hours control",
    ],
    benefits: [
      "Reduces costly client no-shows by up to 75%",
      "Eliminates hours spent daily answering phone calls just to check calendar availability",
      "Enables smooth advance cash flow through automated booking deposits",
    ],
    metrics: [
      { label: "No-Show Drop", value: "-75%" },
      { label: "Client Self-Book", value: "85%" },
      { label: "Calendar Sync", value: "2-Way Realtime" },
    ],
    liveUrl: "https://demo.st-solutions.cloud/booking",
  },
  {
    id: "clienttrack-crm",
    title: "ClientTrack Enterprise CRM & Pipeline",
    slug: "clienttrack-enterprise-crm",
    category: "Software",
    tagline: "Lead qualification, deal stages, and automated client communication history.",
    description:
      "A tailored customer relationship management system designed for B2B firms to track inbound leads, deal stages, client communications, and sales representative quotas.",
    fullDescription:
      "Built without the bloat and confusing menus of generic enterprise CRMs. Gives your sales team a clear, fast interface to log call notes, set follow-up tasks, track proposal statuses, and forecast monthly revenue.",
    clientType: "B2B Companies & Sales Teams",
    targetAudience: "B2B Sales Teams, Real Estate Agencies, Tech Providers, Consultancies",
    problemSolved: "Prevents high-value leads from falling through the cracks due to disorganized sales tracking.",
    status: "Demonstration Ready",
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Email Sync", "Activity Timeline"],
    features: [
      "Kanban deal pipeline with customizable stages and probability weighting",
      "Automated lead capture from website forms, WhatsApp, and email inquiries",
      "Contact timeline storing all past emails, meeting notes, proposals, and invoices",
      "Team task assignments with daily priority agendas and follow-up reminders",
      "Sales performance reports tracking conversion rates by channel and representative",
    ],
    benefits: [
      "Increases proposal win rate by ensuring disciplined, timely follow-up",
      "Provides a permanent record of client interactions when staff change roles",
      "Gives leadership accurate sales forecasting for hiring and inventory planning",
    ],
    metrics: [
      { label: "Follow-Up Rate", value: "100%" },
      { label: "Deal Velocity", value: "+32%" },
      { label: "Data Ownership", value: "100% Private" },
    ],
    liveUrl: "https://demo.st-solutions.cloud/crm",
  },
  {
    id: "vanguard-corporate",
    title: "Vanguard Corporate & Investor Digital Presence",
    slug: "vanguard-corporate-presence",
    category: "Web",
    tagline: "High-trust corporate website engineered for credibility, speed, and lead conversion.",
    description:
      "A prestigious, high-speed corporate web platform built to establish executive authority, showcase company milestones, and attract high-tier commercial clients.",
    fullDescription:
      "Crafted with immaculate typography, high-performance responsive layouts, and interactive case study visualizers. Designed to communicate stability, professionalism, and industry leadership to institutional clients and partners.",
    clientType: "Corporate & Enterprise",
    targetAudience: "Corporations, Investment Firms, Industrial Groups, Enterprise Services",
    problemSolved: "Replaces outdated, slow company websites with a modern, high-trust digital flagship.",
    status: "Live in Production",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Vite", "Fast Cloud CDN", "Technical SEO"],
    features: [
      "Executive aesthetic with clean typography, generous whitespace, and branded layouts",
      "Interactive case study cards with measurable client outcome statistics",
      "Technical SEO architecture ensuring top rankings for core business keywords",
      "Direct leadership contact intake with secure document upload capability",
      "100/100 Google PageSpeed optimization across mobile and desktop devices",
    ],
    benefits: [
      "Builds immediate trust with high-value prospects and enterprise decision-makers",
      "Loads in under 1 second on mobile devices globally",
      "Provides an effortless content management flow for press releases and updates",
    ],
    metrics: [
      { label: "Mobile Speed", value: "99/100" },
      { label: "Load Time", value: "< 0.8 Sec" },
      { label: "SEO Score", value: "100/100" },
    ],
    liveUrl: "https://demo.st-solutions.cloud/corporate",
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
