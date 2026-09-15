const fs = require('fs');
const file = 'src/components/public/PublicNavbar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace active state text color and border
content = content.replace(/text-\[#D4AF37\]/g, (match, offset) => {
  // Only replace if it's in a text context or border context that needs contrast on light background
  // We can just replace all instances in this file to #876F23 except inside the Brand Logo (bg-slate-950)
  return match; // I'll do this more carefully
});

// Actually, replacing all text-[#D4AF37] with text-[#876F23] in PublicNavbar.tsx is mostly safe since the background is white, EXCEPT the logo which is on bg-slate-950.
content = content.replace(/bg-slate-950 border border-slate-800 flex items-center justify-center text-\[#D4AF37\]/g, 'bg-slate-950 border border-slate-800 flex items-center justify-center text-[#D4AF37]_PRESERVE');

content = content.replace(/text-\[#D4AF37\]/g, 'text-[#876F23]');
content = content.replace(/border-\[#D4AF37\]/g, 'border-[#876F23]');

content = content.replace(/text-\[#D4AF37\]_PRESERVE/g, 'text-[#D4AF37]');
content = content.replace(/border-\[#D4AF37\]_PRESERVE/g, 'border-[#D4AF37]');

fs.writeFileSync(file, content);
console.log("Patched PublicNavbar.tsx contrast");
