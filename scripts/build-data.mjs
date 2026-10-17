/**
 * build-data.mjs
 *
 * Construit src/data/items.json et src/data/names.json a partir des fichiers
 * du jeu (sources/items.xml, items_metadata.xml, itempools.xml) et des noms
 * traduits du mod External Item Descriptions (sources/eid/names/*.lua).
 *
 * Regles du Spindown Dice (verifiees, cf. README) :
 *  - on soustrait 1 a l'ID tant qu'on ne tombe pas sur un item "valide" ;
 *  - les items `hidden="true"` sont toujours sautes ;
 *  - Dad's Note (668) ne peut pas etre reroll ;
 *  - Mom's Ring (732) a l'ID maximal, donc ne peut jamais etre atteinte.
 *
 * Mode --check : valide la coherence et sort en erreur si KO.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parseEidDescriptions, sameItemName, unescapeLua } from './lib/eid.mjs';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'sources');
const OUT = path.join(ROOT, 'src', 'data');
const ICONS = path.join(ROOT, 'public', 'icons');

/** Items qui ne peuvent pas etre reroll (regle du jeu, hardcodee cote moteur). */
const NO_REROLL = new Map([[668, "Dad's Note cannot be rerolled by any effect."]]);

const CHECK = process.argv.includes('--check');

/* ------------------------------------------------------------------ utils */

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseAttrs(chunk) {
  const out = {};
  const re = /([\w-]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(chunk))) out[m[1]] = decodeEntities(m[2]);
  return out;
}

/** Extrait tous les elements auto-fermants d'un fichier XML du jeu. */
function parseSelfClosingXml(text) {
  // Les entrees commentees (slots de placeholder, ex. `<!-- <active id="43" ...> -->`)
  // ne sont pas des items : on les retire avant analyse.
  const clean = text.replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  const re = /<([\w:-]+)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*\/>/g;
  let m;
  while ((m = re.exec(clean))) out.push({ tag: m[1], attrs: parseAttrs(m[2] ?? '') });
  return out;
}

/** Parse un fichier de noms EID. Les collectibles sont indexes par C_ID .. n. */
function parseEidNames(text) {
  const out = new Map();
  const re = /\[\s*C_ID\s*\.\.\s*(\d+)\s*\]\s*=\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(text))) out.set(Number(m[1]), unescapeLua(m[2]));
  return out;
}

function cleanEidText(s) {
  return s
    .replace(/\{\{[^}]*\}\}/g, ' ')
    .replace(/\s*#\s*/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

async function readIfExists(p) {
  try {
    return await readFile(p, 'utf8');
  } catch {
    return null;
  }
}

/* --------------------------------------------------------------- pipeline */

async function main() {
  const itemsXml = await readIfExists(path.join(SRC, 'items.xml'));
  if (!itemsXml) throw new Error('sources/items.xml absent : lance `npm run fetch:assets`.');

  const metaXml = (await readIfExists(path.join(SRC, 'items_metadata.xml'))) ?? '';
  const poolsXml = (await readIfExists(path.join(SRC, 'itempools.xml'))) ?? '';

  // --- items -------------------------------------------------------------
  const ITEM_TAGS = new Set(['passive', 'active', 'familiar']);
  const collectibles = parseSelfClosingXml(itemsXml)
    .filter((e) => ITEM_TAGS.has(e.tag) && e.attrs.id !== undefined)
    .map((e) => ({
      id: Number(e.attrs.id),
      type: e.tag,
      gfx: e.attrs.gfx ?? null,
      hidden: e.attrs.hidden === 'true',
      nameKey: e.attrs.name ?? null,
      descriptionKey: e.attrs.description ?? null,
    }));

  const byId = new Map();
  for (const c of collectibles) {
    if (byId.has(c.id)) fail(`ID en double dans items.xml : ${c.id}`);
    byId.set(c.id, c);
  }

  // --- qualite / tags ----------------------------------------------------
  const meta = new Map();
  for (const e of parseSelfClosingXml(metaXml)) {
    if (e.tag !== 'item' || e.attrs.id === undefined) continue;
    meta.set(Number(e.attrs.id), {
      quality: e.attrs.quality !== undefined ? Number(e.attrs.quality) : null,
      tags: (e.attrs.tags ?? '').split(/\s+/).filter(Boolean),
    });
  }

  // --- pools -------------------------------------------------------------
  const poolByItem = new Map();
  {
    const poolRe = /<Pool\s+Name="([^"]+)"[^>]*>([\s\S]*?)<\/Pool>/g;
    let pm;
    while ((pm = poolRe.exec(poolsXml))) {
      const poolName = pm[1];
      const itemRe = /<Item\s+Id="(\d+)"[^>]*\/>/g;
      let im;
      while ((im = itemRe.exec(pm[2]))) {
        const id = Number(im[1]);
        const entry = poolByItem.get(id) ?? { pools: [], weights: {} };
        if (!entry.pools.includes(poolName)) entry.pools.push(poolName);
        entry.weights[poolName] = Number((/<Item\s+Id="\d+"[^>]*Weight="([\d.]+)"/.exec(im[0]) ?? [])[1] ?? NaN) || null;
        poolByItem.set(id, entry);
      }
    }
  }

  // --- noms traduits -----------------------------------------------------
  const namesDir = path.join(SRC, 'eid', 'names');
  let langs = [];
  try {
    langs = (await readdir(namesDir))
      .filter((f) => f.endsWith('.lua'))
      .map((f) => f.replace(/\.lua$/, ''))
      .sort();
  } catch {
    warn('sources/eid/names absent : aucune traduction.');
  }

  const namesById = new Map();
  for (const lang of langs) {
    const text = await readIfExists(path.join(namesDir, `${lang}.lua`));
    if (!text) continue;
    for (const [id, name] of parseEidNames(text)) {
      const entry = namesById.get(id) ?? {};
      entry[lang] = name;
      namesById.set(id, entry);
    }
  }

  // --- descriptions anglaises -------------------------------------------
  const descEn = new Map();
  let descIgnored = 0;
  {
    const candidates = ['rep', 'ab+', 'rep+', 'rgon'];
    const perSet = [];
    for (const dir of candidates) {
      const text = await readIfExists(path.join(SRC, 'eid', 'desc', dir, 'en_us.lua'));
      if (text) perSet.push({ dir, map: parseEidDescriptions(text) });
    }
    // Priorite : rep+ > rep > ab+ (du plus recent au plus ancien)
    const order = ['rep+', 'rep', 'ab+', 'rgon'];
    for (const name of order) {
      const set = perSet.find((s) => s.dir === name);
      if (!set) continue;
      for (const [id, entry] of set.map) {
        if (descEn.has(id)) continue;
        const item = byId.get(id);
        if (!item) continue;

        // Garde-fou : le fichier EID donne le nom de l'item a cote de sa
        // description. S'ils ne concordent pas, la description vient d'une
        // autre table (trinket, carte, pilule) et on la jette.
        const itemName = namesById.get(id)?.en_us ?? humanizeKey(item.nameKey);
        if (!sameItemName(itemName, entry.name)) {
          descIgnored++;
          warn(
            `description ignorée pour #${id} : EID dit « ${entry.name} », le jeu dit « ${itemName} »`
          );
          continue;
        }

        descEn.set(id, cleanEidText(entry.desc));
      }
    }
  }

  // --- assemblage --------------------------------------------------------
  const ids = [...byId.keys()].sort((a, b) => a - b);
  const visibleIds = ids.filter((id) => !byId.get(id).hidden);

  // chaine : precedent / suivant parmi les items visibles
  const prevOf = new Map();
  const nextOf = new Map();
  for (let i = 0; i < visibleIds.length; i++) {
    const id = visibleIds[i];
    const prev = i > 0 ? visibleIds[i - 1] : null;
    prevOf.set(id, prev);
    if (prev !== null) nextOf.set(prev, id);
    nextOf.set(id, null);
  }

  const items = ids.map((id) => {
    const c = byId.get(id);
    const m = meta.get(id) ?? { quality: null, tags: [] };
    const p = poolByItem.get(id) ?? { pools: [], weights: {} };
    const names = namesById.get(id) ?? {};
    const noRerollReason = NO_REROLL.get(id) ?? null;

    return {
      id,
      name: names.en_us ?? humanizeKey(c.nameKey),
      type: c.type,
      hidden: c.hidden,
      quality: m.quality,
      tags: m.tags,
      pools: p.pools,
      icon: `/icons/${id}.png`,
      description: descEn.get(id) ?? null,
      names,
      spindown: {
        target: c.hidden || noRerollReason ? null : (prevOf.get(id) ?? null),
        blocked: noRerollReason,
      },
    };
  });

  await mkdir(OUT, { recursive: true });
  await writeFile(path.join(OUT, 'items.json'), JSON.stringify(items, null, 2) + '\n');
  await writeFile(
    path.join(OUT, 'names.json'),
    JSON.stringify(Object.fromEntries([...namesById.entries()].sort((a, b) => a[0] - b[0])), null, 2) + '\n'
  );

  // --- index de recherche client -----------------------------------------
  // Format compact : [id, "English name", "alias1|alias2|..."].
  // Charge a la demande par le site, jamais envoye avec les pages.
  const searchRows = items
    .filter((i) => !i.hidden)
    .map((i) => {
      const aliases = Object.values(i.names ?? {})
        .filter((n) => typeof n === 'string' && n.length > 0 && n !== i.name);
      const uniq = [...new Set(aliases)];
      return [i.id, i.name, uniq.join('|')];
    });
  await mkdir(path.join(ROOT, 'public'), { recursive: true });
  await writeFile(path.join(ROOT, 'public', 'search.json'), JSON.stringify(searchRows) + '\n');

  // --- rapports ----------------------------------------------------------
  const iconFiles = new Set(
    (await readdir(ICONS).catch(() => []))
      .filter((f) => /^\d+\.png$/.test(f))
      .map((f) => Number(f.replace(/\.png$/, '')))
  );
  const visibleItems = items.filter((i) => !i.hidden);

  const iconsReport = [
    'ICONS REPORT',
    '============',
    `Icônes présentes       : ${iconFiles.size}`,
    `Items visibles         : ${visibleItems.length}`,
    `Items visibles sans icône : ${visibleItems.filter((i) => !iconFiles.has(i.id)).length}`,
    `Icônes orphelines (id sans item visible) : ${[...iconFiles].filter((id) => !visibleItems.some((i) => i.id === id)).join(', ') || 'aucune'}`,
    '',
    'IDs sans icône :',
    ...visibleItems.filter((i) => !iconFiles.has(i.id)).map((i) => `  ${i.id} ${i.name}`),
    '',
  ].join('\n');

  const langRows = langs.map((lang) => {
    const n = items.filter((i) => i.names && i.names[lang]).length;
    return { lang, n, pct: ((n / items.length) * 100).toFixed(1) };
  });

  const transReport = [
    'TRANSLATIONS REPORT',
    '===================',
    `Langues : ${langs.length}`,
    '',
    ...langRows.map((r) => `${r.lang.padEnd(8)} ${String(r.n).padStart(4)}/${items.length}  (${r.pct} %)`),
    '',
    `Descriptions anglaises disponibles : ${items.filter((i) => i.description).length}/${items.length}`,
    `Descriptions rejetées (nom EID ≠ nom du jeu) : ${descIgnored}`,
    'IDs sans description :',
    ...items.filter((i) => !i.description).map((i) => `  ${i.id} ${i.name}`),
    '',
  ].join('\n');

  const hiddenItems = items.filter((i) => i.hidden);
  const maxId = Math.max(...ids);
  const gaps = [];
  for (let n = 1; n <= maxId; n++) if (!byId.has(n)) gaps.push(n);
  const jumps = [];
  for (let i = 1; i < visibleIds.length; i++) {
    if (visibleIds[i] - visibleIds[i - 1] > 1) jumps.push(`${visibleIds[i - 1]} -> ${visibleIds[i]}`);
  }

  const dataReport = [
    'DATA REPORT',
    '===========',
    `Items collectibles      : ${items.length}`,
    `  dont visibles         : ${visibleItems.length}`,
    `  dont hidden (sautés)  : ${hiddenItems.length} -> ${hiddenItems.map((i) => `${i.id} ${i.name}`).join(', ')}`,
    `IDs min/max             : ${Math.min(...ids)} / ${maxId}`,
    `Trous dans la séquence  : ${gaps.join(', ') || 'aucun'}`,
    `Qualité manquante       : ${items.filter((i) => i.quality === null).length}`,
    `Pool manquant           : ${items.filter((i) => i.pools.length === 0).length}`,
    `Sauts de chaîne (hidden) : ${jumps.join(', ') || 'aucun'}`,
    `Items non rerollables   : ${[...NO_REROLL.entries()].map(([id, r]) => `${id} ${r}`).join(', ')}`,
    '',
    'Avertissements :',
    ...(warnings.length ? warnings.map((w) => '  - ' + w) : ['  aucun']),
    'Erreurs :',
    ...(errors.length ? errors.map((e) => '  - ' + e) : ['  aucune']),
    '',
  ].join('\n');

  await writeFile(path.join(ROOT, 'icons-report.txt'), iconsReport);
  await writeFile(path.join(ROOT, 'translations-report.txt'), transReport);
  await writeFile(path.join(ROOT, 'data-report.txt'), dataReport);

  // --- validation --------------------------------------------------------
  validate(items, visibleIds, iconFiles);

  console.log(dataReport);
  console.log(iconsReport.split('\n').slice(0, 5).join('\n'));
  console.log(transReport.split('\n').slice(0, 6).join('\n'));

  if (errors.length) {
    console.error(`\n${errors.length} erreur(s) :`);
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }
  console.log(`\nOK : ${items.length} items (${visibleItems.length} visibles), ${langs.length} langues.`);
}

function humanizeKey(key) {
  if (!key) return null;
  return key
    .replace(/^#/, '')
    .replace(/_NAME$/, '')
    .toLowerCase()
    .replace(/(^|\s)\w/g, (c) => c.toUpperCase());
}

function validate(items, visibleIds, iconFiles) {
  const seen = new Set();
  for (const it of items) {
    if (seen.has(it.id)) fail(`ID dupliqué : ${it.id}`);
    seen.add(it.id);
  }

  for (let i = 1; i < visibleIds.length; i++) {
    const cur = items.find((x) => x.id === visibleIds[i]);
    const prev = visibleIds[i - 1];
    if (cur.spindown.blocked) continue;
    if (cur.spindown.target !== prev) {
      fail(`Chaîne cassée : ${cur.id} devrait pointer sur ${prev}, pointe sur ${cur.spindown.target}`);
    }
  }

  for (const it of items) {
    if (it.hidden && it.spindown.target !== null) fail(`Item hidden ${it.id} ne devrait pas avoir de cible.`);
  }

  const first = items.find((x) => x.id === visibleIds[0]);
  if (first && !first.spindown.blocked && first.spindown.target !== null) {
    fail(`Le premier item visible (${first.id}) doit avoir target = null.`);
  }

  for (const it of items.filter((x) => !x.hidden)) {
    if (!iconFiles.has(it.id)) fail(`Icône manquante pour ${it.id} ${it.name}`);
  }

  if (items.length !== 721) warn(`Nombre d'items inattendu : ${items.length} (attendu 721).`);
}

main().catch((err) => {
  console.error('ECHEC :', err.message);
  process.exit(1);
});
