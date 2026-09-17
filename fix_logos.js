const fs = require('fs');

function patch(file, regex, replacement) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    content = content.replace(regex, replacement);
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`Patched ${file}`);
    }
  }
}

// LoginPage desktop sidebar logo
patch('src/pages/LoginPage.tsx', 
  /<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-\[#D4AF37\] to-\[#B88E20\] text-black font-black text-xl flex items-center justify-center shadow-xl shadow-amber-500\/10 border border-amber-300\/40 select-none">\s*ST\s*<\/div>/g, 
  '<img src="/favicon.svg" alt="ST-Solutions Logo" className="w-12 h-12 shrink-0 drop-shadow-md" />'
);

// LoginPage mobile header logo
patch('src/pages/LoginPage.tsx', 
  /<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-\[#D4AF37\] to-\[#B88E20\] text-black font-black text-xl shadow-xl shadow-amber-500\/10 border border-amber-300\/40 mb-2">\s*ST\s*<\/div>/g, 
  '<img src="/favicon.svg" alt="ST-Solutions Logo" className="w-14 h-14 mx-auto mb-2 drop-shadow-md" />'
);

// RegisterPage logo
patch('src/pages/RegisterPage.tsx', 
  /<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-\[#D4AF37\] to-\[#B88E20\] text-black font-black text-xl shadow-xl shadow-amber-500\/10 border border-amber-300\/40 mb-2">\s*ST\s*<\/div>/g, 
  '<img src="/favicon.svg" alt="ST-Solutions Logo" className="w-14 h-14 mx-auto mb-2 drop-shadow-md" />'
);

// PublicNavbar logo
patch('src/components/public/PublicNavbar.tsx',
  /<div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-\[#876F23\]_PRESERVE font-extrabold text-sm tracking-wider shadow-sm group-hover:border-\[#876F23\] transition-all">\s*ST\s*<\/div>\s*<div className="flex flex-col">\s*<span className="font-extrabold text-base tracking-tight text-slate-950 font-mono">\s*ST-SOLUTIONS\s*<\/span>\s*<span className="text-xs tracking-wider font-semibold text-slate-600 font-sans mt-0\.5">\s*Enterprise Technology\s*<\/span>\s*<\/div>/g,
  '<img src="/favicon.svg" alt="ST-Solutions Logo" className="w-9 h-9 shrink-0" /><img src="/st-solutions-logo.svg" alt="ST-Solutions" className="h-6 hidden sm:block dark:hidden" /><img src="/st-solutions-logo-dark.svg" alt="ST-Solutions" className="h-6 hidden sm:dark:block" />'
);

// Organizations Page logo placeholders
patch('src/pages/OrganizationsPage.tsx',
  /<div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-\[#D4AF37\]\/20 to-\[#B88E20\]\/10 text-\[#D4AF37\] border border-\[#D4AF37\]\/30 font-bold flex items-center justify-center text-base shrink-0 shadow-xs">\s*(.*?)\s*<\/div>/g,
  '<div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 font-bold flex items-center justify-center text-slate-600 dark:text-slate-300 text-base shrink-0 shadow-sm">$1</div>'
);

patch('src/pages/OrganizationsPage.tsx',
  /<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-\[#D4AF37\]\/20 to-\[#B88E20\]\/10 text-\[#D4AF37\] border border-\[#D4AF37\]\/30 font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">\s*(.*?)\s*<\/div>/g,
  '<div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 font-bold flex items-center justify-center text-slate-600 dark:text-slate-300 text-sm shrink-0 shadow-sm">$1</div>'
);

// Workspaces Page logo placeholders
patch('src/pages/WorkspacesPage.tsx',
  /<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-\[#D4AF37\]\/20 to-\[#B88E20\]\/10 text-\[#D4AF37\] border border-\[#D4AF37\]\/30 font-bold flex items-center justify-center text-sm shrink-0">\s*(.*?)\s*<\/div>/g,
  '<div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 font-bold flex items-center justify-center text-slate-600 dark:text-slate-300 text-sm shrink-0 shadow-sm">$1</div>'
);
