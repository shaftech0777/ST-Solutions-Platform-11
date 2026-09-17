const fs = require('fs');
const file = 'src/components/shell/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix group title text
content = content.replace(
  /text-slate-500 dark:text-slate-600 dark:text-slate-400 font-sans/g,
  'text-slate-500 dark:text-slate-400 font-sans'
);

// Fix logout hover
content = content.replace(
  /hover:bg-red-50 dark:hover:bg-white dark:bg-slate-900/g,
  'hover:bg-red-50 dark:hover:bg-slate-800'
);

// Fix modal background
content = content.replace(
  /bg-white dark:bg-slate-950\/60/g,
  'bg-slate-950/60'
);

fs.writeFileSync(file, content);
console.log("Fixed Sidebar.tsx");
