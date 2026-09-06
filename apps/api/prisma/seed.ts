import { prisma } from "../src/database/index.js";

async function main() {
  console.log("Seeding authoritative showcase database records...");

  // 1. Seed Categories
  const categoriesData = [
    { name: "E-Commerce", description: "Online stores, shopping carts, and retail POS solutions", displayOrder: 1 },
    { name: "Software", description: "Enterprise operations, pharmacy POS, and CRM management platforms", displayOrder: 2 },
    { name: "Web", description: "Modern web applications, portals, and digital ordering hubs", displayOrder: 3 },
    { name: "AI", description: "Conversational assistants, vector search, and business intelligence", displayOrder: 4 },
    { name: "Automation", description: "Workflow automation, notification webhooks, and data synchronization", displayOrder: 5 },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    let existing = await prisma.portfolioCategory.findFirst({
      where: { name: cat.name },
    });
    if (!existing) {
      existing = await prisma.portfolioCategory.create({
        data: cat,
      });
    } else {
      existing = await prisma.portfolioCategory.update({
        where: { id: existing.id },
        data: { description: cat.description, displayOrder: cat.displayOrder },
      });
    }
    categoryMap.set(cat.name, existing.id);
  }

  // 2. Seed Initial Authoritative Showcase Projects
  const showcaseProjects = [
    {
      title: "Apex E-Commerce & Retail Platform",
      slug: "apex-ecommerce-platform",
      categoryName: "E-Commerce",
      tagline: "High-converting online store with seamless mobile checkout & inventory control.",
      description: "A comprehensive digital storefront engineered for fast product discovery, frictionless checkout, automated order confirmation, and real-time inventory synchronization.",
      fullDescription: "Built for modern retail businesses and brands needing an independent online sales channel without high marketplace fees. Includes barcode SKU search, automated WhatsApp order alerts, customer account dashboards, and multi-currency payment gateway integrations.",
      projectType: "E-Commerce",
      liveUrl: "https://demo.st-solutions.cloud/ecommerce",
      targetAudience: "Retailers, Brand Owners, Wholesale Distributors",
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
      technologies: ["React", "Tailwind CSS", "Node.js", "PostgreSQL", "Stripe Checkout", "WhatsApp Webhook"],
      featured: true,
      displayOrder: 1,
      status: "PUBLISHED" as const,
    },
    {
      title: "Medix Pharmacy Management Platform",
      slug: "medix-pharmacy-platform",
      categoryName: "Software",
      tagline: "Prescription intake, batch inventory tracking, and POS invoicing.",
      description: "An intuitive operational system designed for retail pharmacies and medical suppliers to track batch expiration dates, manage daily counter sales, and maintain secure customer medication histories.",
      fullDescription: "Streamlines the daily operations of pharmacies from wholesale supplier purchase orders to retail counter checkout. Automatic alerts warn dispensers of near-expiry medicine batches and maintain compliant inventory records.",
      projectType: "Software",
      liveUrl: "https://demo.st-solutions.cloud/pharmacy",
      targetAudience: "Retail Pharmacies, Medical Distributors, Health Clinics",
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
      technologies: ["TypeScript", "React", "Node.js", "PostgreSQL", "Barcode Scanner API", "Offline Cache"],
      featured: true,
      displayOrder: 2,
      status: "PUBLISHED" as const,
    },
    {
      title: "BistroOrder Restaurant & Delivery Hub",
      slug: "bistro-ordering-system",
      categoryName: "Web",
      tagline: "Contactless QR table ordering, live kitchen display, and online delivery.",
      description: "An all-in-one digital ordering suite for cafes and restaurants featuring QR digital menus, kitchen order ticketing, and direct customer delivery tracking without third-party commission fees.",
      fullDescription: "Empowers food establishments to accept orders directly at dining tables via QR codes or online for delivery. Features real-time kitchen status displays, item modifier options (spiciness, sides, drinks), and automated WhatsApp delivery updates.",
      projectType: "Web",
      liveUrl: "https://demo.st-solutions.cloud/restaurant",
      targetAudience: "Restaurants, Cafes, Cloud Kitchens, Food Chains",
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
      technologies: ["React", "Express", "PostgreSQL", "WebSockets", "WhatsApp API", "Thermal Printer Support"],
      featured: true,
      displayOrder: 3,
      status: "PUBLISHED" as const,
    },
    {
      title: "Pulse Business Operations & CRM Hub",
      slug: "pulse-operations-crm",
      categoryName: "Software",
      tagline: "Unified client tracking, team milestones, and financial reporting.",
      description: "A centralized command dashboard replacing fragmented spreadsheets with real-time lead pipelines, task assignments, automated client invoicing, and management analytics.",
      fullDescription: "Consolidates all business workflows under one unified, secure platform. Allows business owners and managers to track active projects, monitor team workload, generate client invoices, and see cash flow trends in real time.",
      projectType: "Software",
      liveUrl: "https://demo.st-solutions.cloud/operations",
      targetAudience: "Service Agencies, Consultancies, SMBs, Project Teams",
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
      technologies: ["TypeScript", "Prisma ORM", "PostgreSQL", "React", "Tailwind CSS", "PDF Generation"],
      featured: false,
      displayOrder: 4,
      status: "PUBLISHED" as const,
    },
    {
      title: "OmniBot Business AI Assistant",
      slug: "omnibot-ai-assistant",
      categoryName: "AI",
      tagline: "Smart 24/7 customer inquiry assistant trained on your business data.",
      description: "A custom-trained conversational assistant that answers customer questions, qualifies inbound leads, schedules appointments, and escalates complex issues to human staff.",
      fullDescription: "Integrates directly into client websites and WhatsApp channels. Grounded specifically in your service catalogue, pricing policies, and FAQs to deliver accurate, helpful answers around the clock.",
      projectType: "AI",
      liveUrl: "https://demo.st-solutions.cloud/ai-assistant",
      targetAudience: "E-Commerce Stores, Real Estate, Professional Services, Clinics",
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
      technologies: ["Gemini 2.5 API", "Node.js", "Vector Knowledge Search", "WhatsApp Business API", "React Widget"],
      featured: false,
      displayOrder: 5,
      status: "PUBLISHED" as const,
    },
    {
      title: "EduSphere School & Academy Portal",
      slug: "edusphere-academic-portal",
      categoryName: "Web",
      tagline: "Student enrollment, fee management, and parent communication.",
      description: "A modern educational portal coordinating student admissions, attendance logging, grade reporting, and automated fee voucher delivery to parents via SMS and WhatsApp.",
      fullDescription: "Brings modern digital prestige and operational sanity to schools and academies. Provides parents with a mobile portal to view test scores and attendance, while automating fee billing and reconciliation for administrators.",
      projectType: "Web",
      liveUrl: "https://demo.st-solutions.cloud/education",
      targetAudience: "Schools, Colleges, Training Academies, Tutoring Centers",
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
      technologies: ["React", "Node.js", "PostgreSQL", "SMS Gateway", "WhatsApp Webhook", "PDF Report Engine"],
      featured: false,
      displayOrder: 6,
      status: "PUBLISHED" as const,
    },
  ];

  for (const proj of showcaseProjects) {
    const categoryId = categoryMap.get(proj.categoryName) || null;
    const existing = await prisma.portfolioProject.findUnique({
      where: { slug: proj.slug },
    });

    if (!existing) {
      await prisma.portfolioProject.create({
        data: {
          title: proj.title,
          slug: proj.slug,
          categoryId,
          tagline: proj.tagline,
          description: proj.description,
          fullDescription: proj.fullDescription,
          projectType: proj.projectType,
          liveUrl: proj.liveUrl,
          targetAudience: proj.targetAudience,
          features: proj.features,
          benefits: proj.benefits,
          technologies: proj.technologies,
          featured: proj.featured,
          displayOrder: proj.displayOrder,
          status: proj.status,
        },
      });
      console.log(`Created showcase project: ${proj.title}`);
    } else {
      console.log(`Showcase project already exists: ${proj.title}`);
    }
  }

  console.log("Showcase database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
