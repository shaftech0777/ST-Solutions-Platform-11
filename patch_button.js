const fs = require('fs');
const file = 'src/components/ui/Button.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix dark and secondary variants
content = content.replace(
  /dark: "bg-white dark:bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700\/60 focus:ring-slate-500",/g,
  'dark: "bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 focus:ring-slate-500 shadow-sm",'
);
content = content.replace(
  /secondary: "bg-white dark:bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700\/60 focus:ring-slate-500",/g,
  'secondary: "bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 focus:ring-slate-500 shadow-sm",'
);

// Fix outline variant text
content = content.replace(
  /outline: "border border-\[#D4AF37\]\/40 text-\[#D4AF37\] hover:bg-\[#D4AF37\]\/10 dark:hover:bg-\[#D4AF37\]\/15 focus:ring-\[#D4AF37\]",/g,
  'outline: "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-500",'
);

// Fix ghost variant text hover to just standard text
content = content.replace(
  /ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800\/80 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400",/g,
  'ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400",'
);

fs.writeFileSync(file, content);
console.log("Patched Button.tsx");
