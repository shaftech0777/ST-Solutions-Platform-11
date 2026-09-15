const fs = require('fs');
const file = 'src/pages/public/HomePage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Trust checks
content = content.replace(
  /className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-700 font-medium"/,
  'className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-slate-700 font-medium"'
);

// Engineering metrics descriptions
content = content.replace(/text-xs text-slate-600 font-medium/g, 'text-sm text-slate-600 font-medium');

// Core capabilities description
content = content.replace(/text-xs sm:text-sm text-slate-600 max-w-xl mx-auto/g, 'text-sm sm:text-base text-slate-600 max-w-xl mx-auto');

fs.writeFileSync(file, content);
console.log("Patched HomePage.tsx text sizes");
