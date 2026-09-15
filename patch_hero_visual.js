const fs = require('fs');
const file = 'src/components/public/HeroArchitectureVisual.tsx';
let content = fs.readFileSync(file, 'utf8');

// Import Link if not imported
if (!content.includes('import { Link } from "react-router-dom"')) {
  content = content.replace(
    /import React, \{ useState \} from "react";/,
    'import React, { useState } from "react";\nimport { Link } from "react-router-dom";'
  );
}

// Add aria-pressed to buttons
content = content.replace(
  /onClick=\{\(\) => setActiveNode\(pillar\.id\)\}/g,
  'onClick={() => setActiveNode(pillar.id)}\n                aria-pressed={isSelected}\n                aria-label={`Select ${pillar.name} capability`}'
);

// Replace RESULTS span with Link
content = content.replace(
  /<span className="text-\[11px\] font-mono font-bold text-slate-900 bg-\[#D4AF37\]\/20 px-2\.5 py-0\.5 rounded-md border border-\[#D4AF37\]\/40">\s*RESULTS\s*<\/span>/,
  '<Link to="/projects" className="text-[11px] font-mono font-bold text-slate-900 bg-[#D4AF37]/20 px-2.5 py-1 rounded-md border border-[#D4AF37]/40 hover:bg-[#D4AF37]/30 transition-colors flex items-center shadow-sm">\n            View Case Studies\n          </Link>'
);

// We should also replace the Gemini / Agents / RAG technical terms with business-friendly context.
// Let's check where they are. Wait, they might not be in this file. Let's see.

fs.writeFileSync(file, content);
console.log("Patched HeroArchitectureVisual.tsx");
