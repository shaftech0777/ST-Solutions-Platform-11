const fs = require('fs');
const file = 'vercel.json';
let content = JSON.parse(fs.readFileSync(file, 'utf8'));

// Find the generic headers rule
const allRule = content.headers.find(h => h.source === "/(.*)");
if (allRule) {
  // Add Referrer-Policy
  if (!allRule.headers.find(h => h.key === "Referrer-Policy")) {
    allRule.headers.push({
      "key": "Referrer-Policy",
      "value": "strict-origin-when-cross-origin"
    });
  }
  // Add CSP
  if (!allRule.headers.find(h => h.key === "Content-Security-Policy")) {
    allRule.headers.push({
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self' https:; object-src 'none'; base-uri 'self';"
    });
  }
}

fs.writeFileSync(file, JSON.stringify(content, null, 2));
console.log("Patched vercel.json");
