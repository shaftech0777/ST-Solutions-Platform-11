const fs = require('fs');
const file = 'src/components/shell/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Container
content = content.replace(
  /bg-slate-950 text-slate-200 border-r border-slate-800\/90/,
  'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800/90'
);

// Brand Header
content = content.replace(
  /border-slate-800\/80/,
  'border-slate-200 dark:border-slate-800/80'
);

// Replace the ST box with official logo
content = content.replace(
  /<div className="flex items-center gap-3 overflow-hidden">[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="flex items-center gap-3 overflow-hidden">
          <img src="/favicon.svg" alt="ST-Solutions Logo" className="w-8 h-8 shrink-0" />
          {!isCollapsed && (
            <img src="/st-solutions-logo.svg" alt="ST-Solutions" className="h-6 dark:hidden" />
          )}
          {!isCollapsed && (
            <img src="/st-solutions-logo-dark.svg" alt="ST-Solutions" className="h-6 hidden dark:block" />
          )}
        </div>`
);

// Collapse button
content = content.replace(
  /text-slate-400 hover:text-white hover:bg-slate-900/,
  'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
);

// Tenant context
content = content.replace(
  /bg-slate-900\/90 border border-slate-800\/80/,
  'bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80'
);
content = content.replace(
  /text-white truncate/g,
  'text-slate-900 dark:text-white truncate'
);

// Navigation group headings
content = content.replace(
  /text-slate-400 font-mono mb-1\.5/g,
  'text-slate-500 dark:text-slate-400 font-sans mb-1.5'
);

// NavLinks
content = content.replace(
  /isActive\s*\?\s*"bg-gradient-to-r from-\[#D4AF37\]\/20 via-\[#D4AF37\]\/10 to-transparent text-\[#D4AF37\] border-l-2 border-\[#D4AF37\] shadow-sm"\s*:\s*"text-slate-400 hover:text-slate-100 hover:bg-slate-900\/90"/g,
  'isActive ? "bg-[#D4AF37]/10 dark:bg-gradient-to-r dark:from-[#D4AF37]/20 dark:via-[#D4AF37]/10 dark:to-transparent text-[#B88E20] dark:text-[#D4AF37] border-l-2 border-[#D4AF37]" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/90"'
);

// Footer
content = content.replace(
  /border-t border-slate-800\/80 bg-slate-950\/90/,
  'border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/90'
);
content = content.replace(
  /text-slate-400 hover:text-red-400 hover:bg-slate-900/g,
  'text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-900'
);

// Logout modal
content = content.replace(
  /bg-slate-900 p-6/,
  'bg-white dark:bg-slate-900 p-6'
);
content = content.replace(
  /text-slate-400/g,
  'text-slate-600 dark:text-slate-400'
);
content = content.replace(
  /text-slate-300 hover:bg-slate-800/g,
  'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
);

fs.writeFileSync(file, content);
console.log("Patched Sidebar.tsx");
