const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('FeatureProvider')) {
  content = content.replace(
    /import \{ AuthProvider \} from "\.\/context\/AuthContext\.js";/,
    'import { AuthProvider } from "./context/AuthContext.js";\nimport { FeatureProvider } from "./context/FeatureContext.js";'
  );

  content = content.replace(
    /<PublicCMSProvider>/,
    '<FeatureProvider>\n          <PublicCMSProvider>'
  );

  content = content.replace(
    /<\/PublicCMSProvider>/,
    '</PublicCMSProvider>\n          </FeatureProvider>'
  );

  fs.writeFileSync(file, content);
  console.log("Patched App.tsx with FeatureProvider");
}
