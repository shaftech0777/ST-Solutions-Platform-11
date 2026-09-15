const fs = require('fs');
const file = 'src/components/public/HeroArchitectureVisual.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /accent: string;/,
  'accent: string;\n  description?: string;'
);

fs.writeFileSync(file, content);
console.log("Patched interface");
