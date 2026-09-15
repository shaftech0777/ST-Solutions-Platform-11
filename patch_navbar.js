const fs = require('fs');
const file = 'src/components/public/PublicNavbar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Desktop Header CTA
content = content.replace(
  /className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-950 text-white font-semibold text-xs shadow-sm hover:opacity-90 hover:scale-\[1\.02\] active:scale-\[0\.98\] transition-all border border-slate-800"/g,
  'className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-transparent text-slate-900 font-semibold text-xs shadow-sm hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all border border-slate-300"'
);

// Mobile Header CTA
content = content.replace(
  /className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-slate-950 text-white font-semibold text-sm shadow-md"/g,
  'className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-transparent text-slate-900 font-semibold text-sm shadow-sm border border-slate-300 hover:bg-slate-50"'
);

// Change arrow color to slate-900 so it matches the outline button
content = content.replace(
  /<ArrowRight className="w-3\.5 h-3\.5 text-\[#D4AF37\]" \/>/g,
  '<ArrowRight className="w-3.5 h-3.5 text-slate-700" />'
);
content = content.replace(
  /<ArrowRight className="w-4 h-4 text-\[#D4AF37\]" \/>/g,
  '<ArrowRight className="w-4 h-4 text-slate-700" />'
);

fs.writeFileSync(file, content);
console.log("Patched PublicNavbar.tsx");
