const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{src/pages/**/*.tsx,src/components/**/*.tsx}');

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix hover:border-slate-200 dark:border-slate-800 -> hover:border-slate-200 dark:hover:border-slate-800
  content = content.replace(/hover:border-slate-(\d+)\s+dark:border-slate-(\d+)/g, 'hover:border-slate-$1 dark:hover:border-slate-$2');
  
  // Fix hover:bg-slate-50 dark:bg-slate-900 -> hover:bg-slate-50 dark:hover:bg-slate-900
  content = content.replace(/hover:bg-slate-(\d+)\s+dark:bg-slate-(\d+)/g, 'hover:bg-slate-$1 dark:hover:bg-slate-$2');

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
  }
});

console.log(`Fixed hovers in ${changedFiles} files.`);
