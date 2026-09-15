const fs = require('fs');
const file = 'src/index.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /outline-offset: 2px;\n  \}/,
  'outline-offset: 2px;\n  }\n\n  .dark :focus-visible {\n    outline-color: #f8fafc; /* slate-50 */\n  }'
);

fs.writeFileSync(file, content);
console.log("Patched index.css for dark mode focus");
