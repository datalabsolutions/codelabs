#!/usr/bin/env node
/**
 * Inject GA4 tag into all index.html & 404.html files under public/ that do NOT already have it.
 */
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const GA_ID = 'G-02FDYMQBCN';
const SNIPPET = `<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', '${GA_ID}');\n</script>`;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return walk(full);
    return [full];
  });
}

function needsInjection(html) {
  if (html.includes(`gtag/js?id=${GA_ID}`)) return false;
  if (html.includes('<google-codelab ')) {
    // For codelab pages we still want global gtag (in head) even if component analytics present
    // so allow injection unless already there.
    return true;
  }
  return true; // generic page
}

function inject(html) {
  if (!needsInjection(html)) return html;
  return html.replace(/<head>/i, `<head>\n${SNIPPET}`);
}

function main() {
  const files = walk(PUBLIC_DIR).filter(f => /index\.html$/.test(f) || /404\.html$/.test(f));
  let updated = 0;
  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    const modified = inject(original);
    if (modified !== original) {
      fs.writeFileSync(file, modified, 'utf8');
      updated++;
      console.log('Injected GA tag ->', path.relative(PUBLIC_DIR, file));
    }
  }
  console.log(`Done. Updated ${updated} file(s).`);
}

if (require.main === module) main();
