export interface ProjectInquiryData {
  // Step 1: Project Type (array or string)
  projectTypes: string[];
  // Step 2: Business details
  businessName?: string;
  industry?: string;
  // Step 3: Goals (array)
  goals: string[];
  // Step 4: Features & Requirements (array + textarea)
  features: string[];
  additionalRequirements?: string;
  // Step 5: Project Quality Level
  qualityLevel?: string;
  // Step 6: Timeline & Budget
  timeline?: string;
  budgetKnown?: boolean;
  budgetAmount?: string;
  budgetCurrency?: string;
  budget?: string;
  // Step 7: Contact Info
  fullName: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
}

/**
 * Generates the unified, professional ST-Solutions project inquiry brief.
 * The output is standardized across WhatsApp, Email (mailto), and Copy to Clipboard.
 */
export function generateProjectInquiryMessage(data: ProjectInquiryData): string {
  const parts: string[] = [
    "ST-SOLUTIONS — PROJECT INQUIRY",
    "",
    "Hello ST-Solutions,",
    "",
    "I would like to discuss a new project.",
    "",
    "PROJECT",
    `Project Type: ${data.projectTypes && data.projectTypes.length > 0 ? data.projectTypes.join(", ") : "Custom Solution"}`,
  ];

  if (data.businessName && data.businessName.trim()) {
    parts.push(`Business Name: ${data.businessName.trim()}`);
  }

  // Industry
  if (data.industry && data.industry.trim()) {
    parts.push("");
    parts.push("INDUSTRY");
    parts.push(data.industry.trim());
  }

  // Goals
  if (data.goals && data.goals.length > 0) {
    parts.push("");
    parts.push("GOALS");
    data.goals.forEach((g) => {
      parts.push(`- ${g}`);
    });
  }

  // Features
  if (data.features && data.features.length > 0) {
    parts.push("");
    parts.push("REQUIRED FEATURES");
    data.features.forEach((f) => {
      parts.push(`- ${f}`);
    });
  }

  if (data.additionalRequirements && data.additionalRequirements.trim()) {
    parts.push("");
    parts.push("ADDITIONAL SPECIFICATIONS");
    parts.push(data.additionalRequirements.trim());
  }

  // Quality Level
  if (data.qualityLevel && data.qualityLevel.trim()) {
    parts.push("");
    parts.push("PROJECT QUALITY");
    parts.push(data.qualityLevel.trim());
  }

  // Timeline
  if (data.timeline && data.timeline.trim()) {
    parts.push("");
    parts.push("TIMELINE");
    parts.push(data.timeline.trim());
  }

  // Budget & Pricing
  parts.push("");
  parts.push("BUDGET");
  if (data.budget && data.budget.trim()) {
    parts.push(data.budget.trim());
  } else if (data.budgetAmount && data.budgetAmount.trim()) {
    parts.push(`${data.budgetCurrency || "PKR"} ${data.budgetAmount.trim()}`);
  } else {
    parts.push("Not decided yet");
  }

  parts.push("");
  parts.push("PRICING");
  parts.push("Negotiable (will be discussed after reviewing requirements)");

  // Contact Details
  parts.push("");
  parts.push("CONTACT");
  if (data.fullName && data.fullName.trim()) {
    parts.push(`Name: ${data.fullName.trim()}`);
  }
  if (data.email && data.email.trim()) {
    parts.push(`Email: ${data.email.trim()}`);
  }
  if (data.phoneNumber && data.phoneNumber.trim()) {
    parts.push(`Phone: ${data.phoneNumber.trim()}`);
  }
  if (data.companyName && data.companyName.trim()) {
    parts.push(`Company: ${data.companyName.trim()}`);
  }

  parts.push("");
  parts.push("Thank you.");

  return parts.join("\n");
}

