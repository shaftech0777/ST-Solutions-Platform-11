const fs = require('fs');
const file = 'src/api/services/settings.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /return response\?\.content \? JSON\.parse\(response\.content\) : null;/,
  'return response?.data?.content ? (typeof response.data.content === "string" ? JSON.parse(response.data.content) : response.data.content) : null;'
);

fs.writeFileSync(file, content);
console.log("Patched settings.service.ts");
