const fs = require('fs');
const file = 'apps/api/src/modules/settings/settings.repository.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /email: \(data\.email as string\) \|\| "contact@st-solutions\.dev",/,
  'email: (data.email as string) || "",'
);
content = content.replace(
  /phoneNumber: \(data\.phoneNumber as string\) \|\| "\+10000000000",/,
  'phoneNumber: (data.phoneNumber as string) || "",'
);
content = content.replace(
  /whatsappNumber: \(data\.whatsappNumber as string\) \|\| "\+10000000000",/,
  'whatsappNumber: (data.whatsappNumber as string) || "",'
);
content = content.replace(
  /website: \(data\.website as string\) \|\| "https:\/\/st-solutions\.dev",/,
  'website: (data.website as string) || "",'
);
content = content.replace(
  /country: \(data\.country as string\) \|\| "United States",/,
  'country: (data.country as string) || "",'
);
content = content.replace(
  /city: \(data\.city as string\) \|\| "San Francisco",/,
  'city: (data.city as string) || "",'
);
content = content.replace(
  /address: \(data\.address as string\) \|\| "Market St, Suite 100",/,
  'address: (data.address as string) || "",'
);
content = content.replace(
  /description: \(data\.description as string\) \|\| "Leading software development and technology solutions provider\.",/,
  'description: (data.description as string) || "",'
);
content = content.replace(
  /tagline: \(data\.tagline as string\) \|\| "Innovating Digital Future",/,
  'tagline: (data.tagline as string) || "",'
);

fs.writeFileSync(file, content);
console.log("Patched CompanyProfile defaults");
