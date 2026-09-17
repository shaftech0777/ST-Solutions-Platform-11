const fs = require('fs');
const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

// replace generic favicon or add it if missing
if (!content.includes('rel="icon"')) {
  content = content.replace('</title>', '</title>\n    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
} else {
  content = content.replace(/<link rel="icon" [^>]+>/, '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
}

fs.writeFileSync(file, content);
console.log("Favicon updated");
