const fs = require('fs');
const file = 'src/pages/public/HomePage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /className="inline-flex items-center space-x-2 px-3\.5 py-1\.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold tracking-wide"/,
  'className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-300 text-slate-900 text-xs font-bold tracking-wide"'
);

fs.writeFileSync(file, content);
console.log("Patched HomePage.tsx Subtitle");
