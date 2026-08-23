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
  // Step 5: Budget
  budget?: string;
  // Step 6: Timeline
  timeline?: string;
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
    "PROJECT REQUIREMENTS",
    "━━━━━━━━━━━━━━━━━━━━",
  ];

  // Project Types
  if (data.projectTypes && data.projectTypes.length > 0) {
    parts.push("");
    parts.push("Project Type:");
    parts.push(data.projectTypes.join(", "));
  }

  // Industry & Business
  if (data.industry && data.industry.trim()) {
    parts.push("");
    parts.push("Industry:");
    parts.push(data.industry.trim());
  }

  if (data.businessName && data.businessName.trim() && data.businessName.trim() !== data.companyName?.trim()) {
    parts.push("");
    parts.push("Business / Project Name:");
    parts.push(data.businessName.trim());
  }

  // Goals
  if (data.goals && data.goals.length > 0) {
    parts.push("");
    parts.push("Goals:");
    data.goals.forEach((g) => {
      parts.push(`• ${g}`);
    });
  }

  // Features
  if (data.features && data.features.length > 0) {
    parts.push("");
    parts.push("Features:");
    data.features.forEach((f) => {
      parts.push(`• ${f}`);
    });
  }

  // Additional Requirements
  if (data.additionalRequirements && data.additionalRequirements.trim()) {
    parts.push("");
    parts.push("Additional Requirements:");
    parts.push(data.additionalRequirements.trim());
  }

  // Budget
  if (data.budget && data.budget.trim()) {
    parts.push("");
    parts.push("Budget:");
    parts.push(data.budget.trim());
  }

  // Timeline
  if (data.timeline && data.timeline.trim()) {
    parts.push("");
    parts.push("Timeline:");
    parts.push(data.timeline.trim());
  }

  // Contact Details
  parts.push("");
  parts.push("CONTACT DETAILS");
  parts.push("━━━━━━━━━━━━━━━━━━━━");

  if (data.fullName && data.fullName.trim()) {
    parts.push("");
    parts.push("Name:");
    parts.push(data.fullName.trim());
  }

  if (data.email && data.email.trim()) {
    parts.push("");
    parts.push("Email:");
    parts.push(data.email.trim());
  }

  if (data.phoneNumber && data.phoneNumber.trim()) {
    parts.push("");
    parts.push("Phone:");
    parts.push(data.phoneNumber.trim());
  }

  if (data.companyName && data.companyName.trim()) {
    parts.push("");
    parts.push("Company:");
    parts.push(data.companyName.trim());
  }

  parts.push("");
  parts.push("Thank you.");

  return parts.join("\n");
}
