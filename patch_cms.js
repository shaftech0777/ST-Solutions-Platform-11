const fs = require('fs');
const path = require('path');

const files = [
  "src/pages/public/ApplyPage.tsx",
  "src/pages/public/ProjectsPage.tsx",
  "src/pages/public/StartProjectPage.tsx",
  "src/pages/public/AboutPage.tsx",
  "src/pages/public/SolutionsPage.tsx",
  "src/pages/public/ProjectDetailPage.tsx",
  "src/pages/public/HomePage.tsx",
  "src/pages/public/ContactPage.tsx",
  "src/pages/public/ServicesPage.tsx",
  "src/components/public/WeChatModal.tsx",
  "src/components/public/ProjectDiscoveryWizard.tsx",
  "src/components/public/PublicNavbar.tsx",
  "src/components/public/ProjectInquiryModal.tsx",
  "src/components/public/PublicFooter.tsx",
  "src/components/public/FloatingContactHub.tsx"
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('usePublicCMS')) {
    // Replace import
    content = content.replace(/import\s+\{([^}]*)companyConfig([^}]*)\}\s+from\s+["']\.\.\/\.\.\/data\/companyConfig\.js["'];?/, (match, p1, p2) => {
      const remainder = (p1 + p2).replace(/,\s*,/g, ',').replace(/(^,\s*|\s*,$)/g, '').trim();
      if (remainder.length > 0) {
        return `import { ${remainder} } from "../../data/companyConfig.js";\nimport { usePublicCMS } from "../../context/PublicCMSContext.js";`;
      } else {
        return `import { usePublicCMS } from "../../context/PublicCMSContext.js";`;
      }
    });

    content = content.replace(/import\s+\{([^}]*)companyConfig([^}]*)\}\s+from\s+["']\.\.\/\.\.\/\.\.\/data\/companyConfig\.js["'];?/, (match, p1, p2) => {
      const remainder = (p1 + p2).replace(/,\s*,/g, ',').replace(/(^,\s*|\s*,$)/g, '').trim();
      if (remainder.length > 0) {
        return `import { ${remainder} } from "../../../data/companyConfig.js";\nimport { usePublicCMS } from "../../../context/PublicCMSContext.js";`;
      } else {
        return `import { usePublicCMS } from "../../../context/PublicCMSContext.js";`;
      }
    });

    // Add hook to the start of the component
    content = content.replace(/export const ([a-zA-Z0-9_]+): React\.FC[a-zA-Z0-9_<>{}]* = \(([^)]*)\) => \{/, (match, compName, args) => {
      return `${match}\n  const companyConfig = usePublicCMS();`;
    });
    
    // Some might not have React.FC typing
    content = content.replace(/export function ([a-zA-Z0-9_]+)\(([^)]*)\) \{/, (match, compName, args) => {
      return `${match}\n  const companyConfig = usePublicCMS();`;
    });
  }
  
  fs.writeFileSync(file, content);
});
console.log("Patched");
