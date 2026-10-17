/**
 * fetch-fonts.mjs
 *
 * Recupere les polices du design system et les heberge localement :
 * le site ne fait AUCUNE requete vers un tiers au chargement (cf. credits).
 *
 * L'appel a Google Fonts a lieu ici, au moment du build, une seule fois.
 */

import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'public', 'fonts');
const FORCE = process.argv.includes('--force');

// Un UA moderne est necessaire pour obtenir du woff2.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const WANTED = [
  { query: 'family=Pixelify+Sans:wght@400..700', file: 'pixelify-sans.woff2' },
  { query: 'family=IBM+Plex+Sans:wght@400', file: 'ibm-plex-sans-400.woff2' },
  { query: 'family=IBM+Plex+Sans:wght@600', file: 'ibm-plex-sans-600.woff2' },
];

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Extrait l'URL woff2 du bloc @font-face latin. */
function pickLatinUrl(css) {
  const blocks = css.split('@font-face').slice(1);
  const latin = blocks.find((b) => /unicode-range:\s*U\+0000-00FF/i.test(b)) ?? blocks.at(-1);
  const m = /url\((https:[^)]+\.woff2)\)/.exec(latin ?? '');
  if (!m) throw new Error('URL woff2 introuvable dans la reponse Google Fonts');
  return m[1];
}

async function main() {
  await mkdir(OUT, { recursive: true });

  for (const { query, file } of WANTED) {
    const dest = path.join(OUT, file);
    if (!FORCE && (await exists(dest))) {
      console.log(`  ${file.padEnd(26)} deja present`);
      continue;
    }
    const cssUrl = `https://fonts.googleapis.com/css2?${query}&display=swap`;
    const css = await (await fetch(cssUrl, { headers: { 'user-agent': UA } })).text();
    const url = pickLatinUrl(css);
    const buf = Buffer.from(await (await fetch(url, { headers: { 'user-agent': UA } })).arrayBuffer());
    await writeFile(dest, buf);
    console.log(`  ${file.padEnd(26)} ${buf.length} octets`);
  }
}

main().catch((e) => {
  console.error('ECHEC :', e.message);
  process.exit(1);
});
