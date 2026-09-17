const fs = require('fs');
const file = 'src/components/shell/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /text-slate-600 dark:text-slate-600 dark:text-slate-400/g,
  'text-slate-600 dark:text-slate-400'
);

content = content.replace(
  /hover:bg-slate-50 dark:hover:bg-slate-50 dark:hover:bg-slate-900\/90/g,
  'hover:bg-slate-50 dark:hover:bg-slate-900/90'
);

fs.writeFileSync(file, content);
console.log("Fixed Sidebar NavLinks");
