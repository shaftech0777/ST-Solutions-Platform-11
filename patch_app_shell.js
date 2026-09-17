const fs = require('fs');
const file = 'src/components/shell/ApplicationShell.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update Auth Loading Splash
content = content.replace(
  /<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-\[#D4AF37\] to-\[#B88E20\] text-black font-extrabold flex items-center justify-center text-lg shadow-xl shadow-amber-500\/20 border border-amber-300\/40 animate-pulse">\s*ST\s*<\/div>/,
  '<img src="/favicon.svg" alt="ST-Solutions Loading" className="w-16 h-16 animate-pulse" />'
);

content = content.replace(/bg-\[#090A0F\] text-slate-100/g, 'bg-[#F7F8FA] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100');

// Update Auth Required screen
content = content.replace(
  /<div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-2xl">\s*<ShieldAlert className="w-8 h-8" \/>\s*<\/div>/,
  '<div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-[#D4AF37] shadow-xl"><ShieldAlert className="w-8 h-8" /></div>'
);
content = content.replace(
  /<h2 className="text-xl font-bold text-white">/,
  '<h2 className="text-xl font-bold text-slate-900 dark:text-white">'
);
content = content.replace(
  /<p className="text-sm text-slate-400">/g,
  '<p className="text-sm text-slate-500 dark:text-slate-400">'
);

fs.writeFileSync(file, content);
console.log("Patched ApplicationShell.tsx");
