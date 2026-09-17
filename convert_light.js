const fs = require('fs');

const { execSync } = require('child_process');
const files = execSync('find src/pages src/components -name "*.tsx"').toString().split('\n').filter(Boolean);

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace hardcoded dark mode utility classes with responsive ones
  
  // Backgrounds
  content = content.replace(/(?<!dark:)(bg-slate-900\/(\d+))/g, 'bg-slate-50 dark:$1');
  content = content.replace(/(?<!dark:)(bg-slate-950\/(\d+))/g, 'bg-white dark:$1');
  content = content.replace(/(?<!dark:)(bg-slate-900)(?!\/)/g, 'bg-white dark:$1');
  content = content.replace(/(?<!dark:)(bg-slate-950)(?!\/)/g, 'bg-white dark:$1');
  
  // Borders
  content = content.replace(/(?<!dark:)(border-slate-800\/(\d+))/g, 'border-slate-200 dark:$1');
  content = content.replace(/(?<!dark:)(border-slate-800)(?!\/)/g, 'border-slate-200 dark:$1');
  content = content.replace(/(?<!dark:)(border-slate-700\/(\d+))/g, 'border-slate-300 dark:$1');
  content = content.replace(/(?<!dark:)(border-slate-700)(?!\/)/g, 'border-slate-300 dark:$1');
  
  // Text
  // Only replace if not preceded by hover:, focus: or dark:
  // Using a replacer function for text-slate
  content = content.replace(/(?<!(?:dark|hover|focus):)text-slate-300/g, 'text-slate-700 dark:text-slate-300');
  content = content.replace(/(?<!(?:dark|hover|focus):)text-slate-400/g, 'text-slate-500 dark:text-slate-400');
  content = content.replace(/(?<!(?:dark|hover|focus):)text-slate-200/g, 'text-slate-800 dark:text-slate-200');

  // Fix logo ST squares inside LoginPage and RegisterPage
  if (file.includes('LoginPage') || file.includes('RegisterPage')) {
    content = content.replace(
      /<div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-\[#D4AF37\] to-\[#B88E20\] text-black font-extrabold flex items-center justify-center text-2xl shadow-xl shadow-amber-500\/20 border border-amber-300\/40 mx-auto">\s*ST\s*<\/div>/g,
      '<img src="/favicon.svg" alt="ST-Solutions" className="w-20 h-20 mx-auto" />'
    );
    // Fix full-page background from #090A0F to light
    content = content.replace(
      /<div className="min-h-screen bg-\[#090A0F\]/g,
      '<div className="min-h-screen bg-slate-50 dark:bg-[#090A0F]'
    );
    content = content.replace(
      /text-slate-100 font-sans/g,
      'text-slate-900 dark:text-slate-100 font-sans'
    );
  }

  // Fix Tables
  content = content.replace(
    /bg-slate-900\/50/g,
    'bg-slate-50 dark:bg-slate-900/50'
  );
  
  // Fix text-white when used in normal text context
  content = content.replace(
    /<(h1|h2|h3|h4|p|span|div)([^>]*)className="([^"]*(?<!dark:)text-white[^"]*)"/g,
    (match, tag, attr1, cls) => {
      // Don't replace if it's inside a button, badge or primary action
      if (cls.includes('bg-') && !cls.includes('bg-white') && !cls.includes('bg-transparent')) return match;
      return `<${tag}${attr1}className="${cls.replace('text-white', 'text-slate-900 dark:text-white')}"`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
  }
});

console.log(`Updated ${changedFiles} files for light mode.`);
