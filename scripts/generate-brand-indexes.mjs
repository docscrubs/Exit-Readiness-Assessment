import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const brandingPath = path.join(projectRoot, 'public', 'brands', 'branding.json');
const distDir = path.join(projectRoot, 'dist', 'exit-readiness-assessment', 'browser');
const sourceIndex = path.join(distDir, 'index.html');

if (!fs.existsSync(sourceIndex)) {
  console.error(`[generate-brand-indexes] Source index not found: ${sourceIndex}`);
  console.error('Did you run `ng build` first?');
  process.exit(1);
}

const branding = JSON.parse(fs.readFileSync(brandingPath, 'utf-8'));
const baseHtml = fs.readFileSync(sourceIndex, 'utf-8');

const hostnameForBrand = (brandId) =>
  Object.entries(branding.hostnameMap).find(([, id]) => id === brandId)?.[0];

const absoluteLogoUrl = (brand) => {
  if (brand.logoUrl.startsWith('http')) return brand.logoUrl;
  const host = hostnameForBrand(brand.id);
  return host ? `https://${host}${brand.logoUrl}` : brand.logoUrl;
};

const description =
  "Assess your business's readiness for exit across 6 critical domains. Get instant feedback on gaps and timeline to transaction readiness.";

for (const [brandId, brand] of Object.entries(branding.brands)) {
  let html = baseHtml;

  // Title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${brand.displayName} — SME Exit Readiness Assessment</title>`,
  );

  // Theme color (mobile address bar)
  html = html.replace(
    /<meta name="theme-color" content="[^"]*">/,
    `<meta name="theme-color" content="${brand.colours.primary}">`,
  );

  // Favicon paths
  html = html
    .replace(/href="favicon\.ico"/g, `href="${brand.faviconBasePath}/favicon.ico"`)
    .replace(/href="favicon-(\d+x\d+)\.png"/g, `href="${brand.faviconBasePath}/favicon-$1.png"`)
    .replace(/href="apple-touch-icon\.png"/g, `href="${brand.faviconBasePath}/apple-touch-icon.png"`);

  // Open Graph / social preview tags (inserted before </head>)
  const logoAbs = absoluteLogoUrl(brand);
  const ogTags = [
    `<meta property="og:title" content="${brand.displayName} — SME Exit Readiness Assessment">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:image" content="${logoAbs}">`,
    `<meta property="og:type" content="website">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${brand.displayName} — SME Exit Readiness Assessment">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${logoAbs}">`,
  ].join('\n  ');
  html = html.replace('</head>', `  ${ogTags}\n</head>`);

  const outPath = path.join(distDir, `index.${brandId}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`[generate-brand-indexes] Wrote ${path.relative(projectRoot, outPath)}`);
}
