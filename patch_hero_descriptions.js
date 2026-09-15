const fs = require('fs');
const file = 'src/components/public/HeroArchitectureVisual.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update AI tag
content = content.replace(
  /tag: "Gemini \/ Agents \/ RAG"/,
  'tag: "Gemini / AI Agents / RAG",\n    description: "AI systems that understand your business knowledge and automate workflows."'
);
content = content.replace(
  /tag: "React \/ Next\.js \/ Tailwind"/,
  'tag: "React / Next.js / Tailwind",\n    description: "Fast, responsive web applications optimized for modern users."'
);
content = content.replace(
  /tag: "Node\.js \/ PostgreSQL \/ AWS"/,
  'tag: "Node.js / PostgreSQL / AWS",\n    description: "Scalable backend systems and secure cloud infrastructure."'
);
content = content.replace(
  /tag: "Webhooks \/ Queues \/ Sync"/,
  'tag: "Webhooks / Queues / Sync",\n    description: "Seamlessly connect your tools and eliminate manual data entry."'
);
content = content.replace(
  /tag: "Storefronts & POS"/,
  'tag: "Storefronts & POS",\n    description: "Secure, high-converting digital commerce experiences."'
);

// Add the description display
content = content.replace(
  /<div className="bg-slate-900 px-2\.5 py-1\.5 rounded-lg border border-slate-700 flex justify-between items-center">\s*<span className="text-slate-400">STACK:<\/span>\s*<span className="text-blue-400 font-bold truncate ml-1">\{selectedPillar\.tag\}<\/span>\s*<\/div>\s*<\/div>/,
  '<div className="bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700 flex justify-between items-center">\n              <span className="text-slate-400">STACK:</span>\n              <span className="text-blue-400 font-bold truncate ml-1" title={selectedPillar.tag}>{selectedPillar.tag}</span>\n            </div>\n          </div>\n          <div className="bg-slate-900/50 mt-2 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-sans leading-snug">\n            {selectedPillar.description}\n          </div>'
);

fs.writeFileSync(file, content);
console.log("Patched HeroArchitectureVisual.tsx descriptions");
