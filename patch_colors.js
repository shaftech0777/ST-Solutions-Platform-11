const fs = require('fs');

const replaceInFile = (file, search, replacement) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(search, replacement);
    fs.writeFileSync(file, content);
  }
};

// HomePage.tsx
replaceInFile('src/pages/public/HomePage.tsx', /text-\[#B88E20\]/g, 'text-[#8D6D19]');

// SolutionsPage.tsx
replaceInFile('src/pages/public/SolutionsPage.tsx', /text-\[#B88E20\]/g, 'text-[#8D6D19]');

// Any other public pages
replaceInFile('src/pages/public/ServicesPage.tsx', /text-\[#B88E20\]/g, 'text-[#8D6D19]');
replaceInFile('src/pages/public/ProjectDetailPage.tsx', /text-\[#B88E20\]/g, 'text-[#8D6D19]');

console.log("Patched text colors");
