import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { LANGS, dicts } from '../src/i18n/dict.ts';

const en = dicts.en;
const placeholder = /\{(\w+)\}/g;

const placeholders = (s) => [...s.matchAll(placeholder)].map((m) => m[1]).sort();

function astroFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) astroFiles(full, out);
    else if (full.endsWith('.astro')) out.push(full);
  }
  return out;
}

test('les 5 langues existent et sont non vides', () => {
  assert.deepEqual([...LANGS], ['en', 'fr', 'de', 'es', 'it']);
  for (const lang of LANGS) assert.ok(Object.keys(dicts[lang]).length > 50, `${lang} trop petite`);
});

test('parité stricte des clés entre langues', () => {
  const base = Object.keys(en).sort();
  for (const lang of LANGS) {
    const keys = Object.keys(dicts[lang]).sort();
    assert.deepEqual(keys, base, `clés différentes pour ${lang}`);
  }
});

test('aucune traduction vide', () => {
  for (const lang of LANGS) {
    for (const [key, value] of Object.entries(dicts[lang])) {
      assert.ok(value.trim().length > 0, `${lang} / ${key} est vide`);
    }
  }
});

test('les variables de chaque clé sont identiques dans toutes les langues', () => {
  for (const [key, value] of Object.entries(en)) {
    const ref = placeholders(value);
    for (const lang of LANGS) {
      const vars = placeholders(dicts[lang][key]);
      assert.deepEqual(vars, ref, `${lang} / ${key} : variables ${vars} au lieu de ${ref}`);
    }
  }
});

test('toutes les clés utilisées dans les .astro existent', () => {
  const files = astroFiles('src');
  const used = new Set();
  const re = /data-i18n(?:-html|-placeholder|-aria)?="([a-z][A-Za-z0-9]*\.[A-Za-z0-9]+)"/g;

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    let m;
    while ((m = re.exec(src))) used.add(m[1]);
  }

  assert.ok(used.size > 40, `seulement ${used.size} clés trouvées dans les pages`);
  const missing = [...used].filter((key) => !(key in en));
  assert.deepEqual(missing, [], `clés absentes du dictionnaire : ${missing.join(', ')}`);
});

test('les clés dynamiques par type existent', () => {
  for (const type of ['passive', 'active', 'familiar']) {
    assert.ok(`type.${type}` in en, `type.${type} manquant`);
  }
});

test('aucune variable orpheline dans les traductions', () => {
  for (const key of Object.keys(en)) {
    for (const lang of LANGS) {
      const value = dicts[lang][key];
      if (!/\{\w+\}/.test(value)) continue;
      // une variable sans équivalent dans la clé anglaise serait imprimée telle quelle
      const extra = placeholders(value).filter((v) => !placeholders(en[key]).includes(v));
      assert.deepEqual(extra, [], `${lang} / ${key} utilise une variable inconnue`);
    }
  }
});
