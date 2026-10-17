/**
 * fetch-assets.mjs
 *
 * Telecharge les sources brutes necessaires au projet Spindown Codex.
 * Idempotent : ne retelecharge pas un fichier deja present (sauf --force).
 *
 * Sources :
 *  - Derugon/TBoIR-resources (branche `latest`) : fichiers XML du jeu + sprites
 *    d'items collectibles.
 *  - wofsauge/External-Item-Descriptions : noms traduits + descriptions (mod
 *    communautaire, utilise comme source de contenu textuel).
 *
 * Aucun fichier n'est invente : si une source est indisponible, le script
 * echoue explicitement.
 */

import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'sources');
const ICONS = path.join(ROOT, 'public', 'icons');

const GAME_REPO = 'Derugon/TBoIR-resources';
const GAME_REF = 'latest';
const EID_REPO = 'wofsauge/External-Item-Descriptions';
const EID_REF = 'master';

const FORCE = process.argv.includes('--force');
const CONCURRENCY = 12;

const UA = { 'user-agent': 'spindown-codex (fan project, non-commercial)' };

const XML_FILES = ['items.xml', 'items_metadata.xml', 'itempools.xml', 'pocketitems.xml'];

function log(...a) {
  console.log(...a);
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchWithRetry(url, { text = false, attempts = 4 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
      if (text) return await res.text();
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

async function downloadTo(url, dest, { text = false } = {}) {
  if (!FORCE && (await exists(dest))) return { skipped: true };
  const data = await fetchWithRetry(url, { text });
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, data);
  return { skipped: false, bytes: text ? Buffer.byteLength(data) : data.length };
}

async function listDir(repo, ref, dir) {
  const url = `https://api.github.com/repos/${repo}/contents/${dir}?ref=${encodeURIComponent(ref)}`;
  const json = JSON.parse(await fetchWithRetry(url, { text: true }));
  return Array.isArray(json) ? json : [json];
}

const rawUrl = (repo, ref, p) =>
  `https://raw.githubusercontent.com/${repo}/${ref}/${p.split('/').map(encodeURIComponent).join('/')}`;

async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const idx = cursor++;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  await mkdir(SRC, { recursive: true });
  await mkdir(ICONS, { recursive: true });

  // ---- 1. XML du jeu -------------------------------------------------------
  log('== XML du jeu ==');
  for (const f of XML_FILES) {
    const dest = path.join(SRC, f);
    const r = await downloadTo(rawUrl(GAME_REPO, GAME_REF, `resources/${f}`), dest, { text: true });
    log(`  ${f.padEnd(20)} ${r.skipped ? 'deja present' : r.bytes + ' octets'}`);
  }

  // ---- 2. Sprites d'items --------------------------------------------------
  log('\n== Sprites collectibles ==');
  const spriteEntries = await listDir(GAME_REPO, GAME_REF, 'resources/gfx/items/collectibles');
  const named = [];
  const unnumbered = [];
  for (const e of spriteEntries) {
    const m = /^collectibles_(\d{3})_(.+)\.png$/i.exec(e.name);
    if (m) named.push({ id: Number(m[1]), file: e.name, slug: m[2] });
    else unnumbered.push(e.name);
  }
  log(`  ${spriteEntries.length} fichiers, ${named.length} nommes par ID, non numerotes : ${unnumbered.join(', ') || 'aucun'}`);

  let done = 0;
  await pool(named, CONCURRENCY, async (s) => {
    const dest = path.join(ICONS, `${s.id}.png`);
    await downloadTo(rawUrl(GAME_REPO, GAME_REF, `resources/gfx/items/collectibles/${s.file}`), dest);
    if (++done % 100 === 0) log(`  ... ${done}/${named.length}`);
  });
  log(`  ${named.length} icones -> public/icons/`);

  await writeFile(
    path.join(SRC, 'icons-manifest.json'),
    JSON.stringify(
      {
        source: `${GAME_REPO}@${GAME_REF}`,
        path: 'resources/gfx/items/collectibles',
        fetchedAt: new Date().toISOString(),
        totalFiles: spriteEntries.length,
        numbered: named,
        unnumbered,
      },
      null,
      2
    ) + '\n'
  );

  // ---- 3. Noms traduits (EID) ---------------------------------------------
  log('\n== Noms traduits (EID) ==');
  const nameFiles = await listDir(EID_REPO, EID_REF, 'descriptions/names');
  const langs = nameFiles
    .filter((e) => e.name.endsWith('.lua'))
    .map((e) => e.name.replace(/\.lua$/, ''));
  log(`  ${langs.length} langues : ${langs.join(', ')}`);

  await pool(langs, 6, async (lang) => {
    await downloadTo(rawUrl(EID_REPO, EID_REF, `descriptions/names/${lang}.lua`), path.join(SRC, 'eid', 'names', `${lang}.lua`), { text: true });
  });

  // ---- 4. Descriptions (EID, version Repentance+) --------------------------
  log('\n== Descriptions EID (rep+) ==');
  const descDirs = await listDir(EID_REPO, EID_REF, 'descriptions');
  log(`  dossiers : ${descDirs.map((d) => d.name).join(', ')}`);

  let descFiles = [];
  for (const dir of descDirs.filter((d) => d.type === 'dir' && d.name !== 'names')) {
    const entries = await listDir(EID_REPO, EID_REF, `descriptions/${dir.name}`);
    descFiles.push(...entries.filter((e) => e.name.endsWith('.lua')).map((e) => ({ dir: dir.name, file: e.name })));
  }
  log(`  ${descFiles.length} fichiers de description`);

  await pool(descFiles, 6, async ({ dir, file }) => {
    await downloadTo(
      rawUrl(EID_REPO, EID_REF, `descriptions/${dir}/${file}`),
      path.join(SRC, 'eid', 'desc', dir, file),
      { text: true }
    );
  });

  await writeFile(
    path.join(SRC, 'eid-manifest.json'),
    JSON.stringify({ source: `${EID_REPO}@${EID_REF}`, fetchedAt: new Date().toISOString(), langs, descFiles }, null, 2) + '\n'
  );

  log('\nTermine.');
}

main().catch((err) => {
  console.error('\nECHEC :', err.message);
  process.exit(1);
});
