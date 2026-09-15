const fs = require('fs');
const file = 'src/index.css';
let content = fs.readFileSync(file, 'utf8');

// The gold #D4AF37 does not have 3:1 contrast on white. Let's use slate-900 (#0f172a) for high contrast.
content = content.replace(
  /outline: 2px solid #D4AF37;/,
  'outline: 2px solid #0f172a; /* WCAG 2.1 Non-text contrast 3:1 minimum */'
);

fs.writeFileSync(file, content);
console.log("Patched index.css");
