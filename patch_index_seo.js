const fs = require('fs');
const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

// Add canonical and JSON-LD
const headInjection = `
    <link rel="canonical" href="https://st-solutions-official.vercel.app/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://st-solutions-official.vercel.app/" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://st-solutions-official.vercel.app/#organization",
          "name": "ST-SOLUTIONS",
          "url": "https://st-solutions-official.vercel.app/"
        },
        {
          "@type": "WebSite",
          "@id": "https://st-solutions-official.vercel.app/#website",
          "url": "https://st-solutions-official.vercel.app/",
          "name": "ST-SOLUTIONS",
          "publisher": {
            "@id": "https://st-solutions-official.vercel.app/#organization"
          }
        }
      ]
    }
    </script>
`;

if (!content.includes('<link rel="canonical"')) {
  content = content.replace('</head>', headInjection + '</head>');
  fs.writeFileSync(file, content);
  console.log("Patched index.html with SEO elements");
}
