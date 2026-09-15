const fs = require('fs');
const file = 'src/components/shell/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useFeatures')) {
  content = content.replace(
    /import \{ useAuth \} from "\.\.\/\.\.\/context\/AuthContext\.js";/,
    'import { useAuth } from "../../context/AuthContext.js";\nimport { useFeatures } from "../../context/FeatureContext.js";'
  );

  content = content.replace(
    /const \{ currentUser, logout \} = useAuth\(\);/,
    'const { currentUser, logout } = useAuth();\n  const features = useFeatures();'
  );

  content = content.replace(
    /\{ label: "AI Assistant", path: "\/ai", icon: Bot, badge: "AI", module: "ai" \},/,
    '...(features.ai_copilot ? [{ label: "AI Assistant", path: "/ai", icon: Bot, badge: "AI", module: "ai" }] : []),//'
  );

  content = content.replace(
    /\{ label: "Applicants", path: "\/applicants", icon: UserCheck, module: "applicants" \},/,
    '...(features.applicant_onboarding_pipeline ? [{ label: "Applicants", path: "/applicants", icon: UserCheck, module: "applicants" }] : []),//'
  );

  fs.writeFileSync(file, content);
  console.log("Patched Sidebar.tsx with Feature toggles");
}
