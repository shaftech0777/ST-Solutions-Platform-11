const fs = require('fs');
const file = 'src/pages/public/HomePage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<span>CAPABILITIES &amp; SHOWCASES<\/span>/,
  '<span>COMMERCIAL PROOF</span>'
);

content = content.replace(
  /<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">\s*What We Build for Growing Businesses\s*<\/h2>/,
  '<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">\n              Explore Our Work & Selected Projects\n            </h2>'
);

fs.writeFileSync(file, content);
console.log("Patched HomePage.tsx showcase heading");
