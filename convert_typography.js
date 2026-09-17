const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{src/pages/**/*.tsx,src/components/shell/**/*.tsx}');

let changedFiles = 0;

files.forEach(file => {
  if (file.includes('HomePage.tsx') || file.includes('Public')) return; // Do not touch public pages unless needed

  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace text-xs with text-sm for labels, p, div unless it's a badge or small explicitly
  // We'll just replace 'text-xs' with 'text-sm' broadly, and 'text-[10px]' or 'text-[11px]' with 'text-xs'
  
  content = content.replace(/text-\[10px\]/g, 'text-xs');
  content = content.replace(/text-\[11px\]/g, 'text-xs');
  
  // Broadly replace text-xs to text-sm in most places
  content = content.replace(/text-xs/g, 'text-sm');
  
  // However, we want to keep some badges small
  content = content.replace(/className="([^"]*)badge([^"]*)text-sm/g, 'className="$1badge$2text-xs');
  content = content.replace(/className="([^"]*)px-2 py-0.5([^"]*)text-sm/g, 'className="$1px-2 py-0.5$2text-xs');
  content = content.replace(/className="([^"]*)px-1.5 py-0.5([^"]*)text-sm/g, 'className="$1px-1.5 py-0.5$2text-xs');

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
  }
});

console.log(`Updated typography in ${changedFiles} files.`);
