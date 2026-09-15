const fs = require('fs');
let content = JSON.parse(fs.readFileSync('package.json', 'utf8'));
content.engines = content.engines || {};
content.engines.bun = "1.1.27"; // Wait, I should probably pin to "1.1.27" or whatever version is available here.
fs.writeFileSync('package.json', JSON.stringify(content, null, 2));
