/**
 * check-links.mjs — verifie que chaque lien interne du site genere pointe
 * vers un fichier existant dans dist/. Aucune dependance.
 */

import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist');

/** Base du site : '' a la racine, '/<depot>' pour un GitHub Pages de projet. */
const BASE = (process.env.BASE_PATH ?? '/').replace(/\/$/, '');

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

async function resolveTarget(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return path.join(DIST, 'index.html');
  const base = path.join(DIST, clean);
  if (clean.endsWith('/')) return path.join(base, 'index.html');
  if (path.extname(clean)) return base; // asset
  // route Astro en mode directory
  return path.join(base, 'index.html');
}

const files = (await walk(DIST)).filter((f) => f.endsWith('.html'));
const broken = new Map();
const seen = new Set();

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const re = /(?:href|src)="(\/[^"#?]*?)(?:[?#][^"]*)?"/g;
  let m;
  while ((m = re.exec(html))) {
    let href = m[1];
    // Les scripts inline contiennent des gabarits JS (`/icons/${id}.png`).
    if (href.includes('${')) continue;
    // On ramene les liens sous la base a des chemins de dist/.
    if (BASE && (href === BASE || href.startsWith(`${BASE}/`))) {
      href = href.slice(BASE.length) || '/';
    }
    if (seen.has(href)) continue;
    seen.add(href);
    if (!(await exists(await resolveTarget(href)))) {
      const list = broken.get(href) ?? [];
      list.push(path.relative(DIST, file));
      broken.set(href, list);
    }
  }
}

console.log(`pages analysees : ${files.length}`);
console.log(`liens uniques   : ${seen.size}`);

if (broken.size === 0) {
  console.log('aucun lien casse.');
} else {
  console.error(`\n${broken.size} cible(s) manquante(s) :`);
  for (const [href, pages] of [...broken].slice(0, 40)) {
    console.error(`  ${href}  (ex. ${pages[0]}${pages.length > 1 ? ` +${pages.length - 1}` : ''})`);
  }
  process.exit(1);
}
