const fs = require('fs');
const file = 'src/components/admin/WebsiteCMS.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/await settingsService\.updateCompanyProfile\(\{\s*companyName: brandData\.name,\s*legalName: brandData\.legalName,\s*tagline: brandData\.tagline,\s*description: brandData\.shortDescription,\s*mission: brandData\.longDescription\s*\}\)\.catch\(e => console\.warn\('Could not sync to generic company profile', e\)\);/g, "await settingsService.updateCompanyProfile({ companyName: brandData.name }).catch(e => console.warn('Could not sync to generic company profile', e));");

content = content.replace(/await settingsService\.updateCompanyProfile\(\{\s*email: contactData\.email,\s*phoneNumber: contactData\.phoneNumber,\s*whatsappNumber: contactData\.whatsappNumber,\s*address: contactData\.address\s*\}\)\.catch\(e => console\.warn\('Could not sync contact info to generic profile', e\)\);/g, "await settingsService.updateCompanyProfile({}).catch(e => console.warn('Could not sync contact info to generic profile', e));");

fs.writeFileSync(file, content);
console.log("Patched WebsiteCMS.tsx");
