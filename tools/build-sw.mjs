// Regenerates sw.js with the precache list. Run: node tools/build-sw.mjs <version>
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
const root = new URL('..', import.meta.url).pathname;
const version = process.argv[2] || 'dev';
const walk = d => readdirSync(join(root, d)).flatMap(f => { const p = d ? `${d}/${f}` : f; return statSync(join(root, p)).isDirectory() ? walk(p) : [p]; });
const files = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'css/style.css',
  ...walk('js'), 'assets/art/manifest.json',
  ...walk('assets/art').filter(f => f.endsWith('.svg') || /backgrounds\/webp\/.*1920x1080\.webp$/.test(f))];
const tpl = readFileSync(join(root, 'tools/sw.template.js'), 'utf8');
writeFileSync(join(root, 'sw.js'), tpl.replace('__VERSION__', version).replace('__FILES__', JSON.stringify(files, null, 0)));
console.log(`sw.js: ${files.length} precached files, version ${version}`);
