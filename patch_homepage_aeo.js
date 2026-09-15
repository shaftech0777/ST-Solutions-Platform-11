const fs = require('fs');
const file = 'src/pages/public/HomePage.tsx';
let content = fs.readFileSync(file, 'utf8');

const aeoSection = `
      {/* AEO / Entity Clarity Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-8 sm:pb-16" aria-labelledby="about-st-solutions">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="md:w-1/3">
            <h2 id="about-st-solutions" className="text-xl sm:text-2xl font-bold text-slate-950 mb-2">
              What is ST-SOLUTIONS?
            </h2>
            <div className="w-12 h-1.5 bg-[#D4AF37] rounded-full"></div>
          </div>
          <div className="md:w-2/3 space-y-4 text-sm sm:text-base text-slate-700">
            <p>
              <strong>ST-SOLUTIONS</strong> is a digital solutions company that helps modern businesses build custom websites, scalable software systems, AI solutions, business automation workflows, and tailored e-commerce platforms.
            </p>
            <p>
              We solve operational friction by engineering technology around the way your business actually works, providing end-to-end digital transformation. From retail POS platforms to operational CRM dashboards and 24/7 AI assistants, our solutions deliver clear business value, efficiency, and growth.
            </p>
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION ("What can we build for your business?") */}
`;

if (!content.includes('AEO / Entity Clarity Section')) {
  content = content.replace(
    /\{\/\* 2\. SERVICES SECTION \("What can we build for your business\?"\) \*\/\}/,
    aeoSection
  );
  fs.writeFileSync(file, content);
  console.log("Patched HomePage.tsx with AEO content");
}
