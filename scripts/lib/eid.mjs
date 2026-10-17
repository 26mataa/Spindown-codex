/**
 * Lecture des fichiers de description du mod External Item Descriptions.
 *
 * Ces fichiers sont du Lua, avec plusieurs tables indexées de 1 à N :
 *
 *   local repCollectibles={ [1] = {"1", "The Sad Onion", "..."}, ... }
 *   local repTrinkets={     [1] = {"1", "Swallowed Penny", "..."}, ... }
 *   local repCards={ ... }  local repPills={ ... }
 *
 * Chaque table réutilise les mêmes petits IDs. Lire le fichier entier fait donc
 * écraser la description d'un collectible par celle du trinket de même ID —
 * c'est exactement le bug qui a fait afficher des descriptions de trinkets sur
 * les items 1 à 188. On ne lit donc que la table des collectibles.
 *
 * Deux formes d'entrée coexistent :
 *   [123] = {"123", "Nom", "Description"}   (rep, rep+, rgon)
 *   {"123", "Nom", "Description"}           (ab+, l'id est le premier champ)
 */

export function unescapeLua(value) {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

/** Fin d'entrée : virgule/point-virgule optionnels, puis un commentaire Lua. */
const TAIL = '\\s*[;,]?\\s*(?:--.*)?$';

const ENTRY_WITH_KEY = new RegExp(
  '^\\s*\\[(\\d{1,3})\\]\\s*=\\s*\\{\\s*"(?:\\d*)"\\s*,\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*,\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*\\}' +
    TAIL
);

const ENTRY_KEYLESS = new RegExp(
  '^\\s*\\{\\s*"(\\d{1,3})"\\s*,\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*,\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*\\}' +
    TAIL
);

/** Toute déclaration de table, quelle que soit sa forme. */
const DECLARATION = /(?:^|[.\s])(\w*collectibles?\w*)\s*=\s*\{/i;
const ANY_TABLE = /(?:^|[.\s])(\w+)\s*=\s*\{/;

/**
 * @returns {Map<number, {name: string, desc: string}>}
 */
export function parseEidDescriptions(text) {
  const out = new Map();
  let inCollectibles = false;

  for (const line of text.split(/\r?\n/)) {
    if (/^\s*--/.test(line)) continue;

    if (DECLARATION.test(line)) {
      inCollectibles = true;
      continue;
    }

    if (ANY_TABLE.test(line) || /^\}/.test(line)) {
      inCollectibles = false;
      continue;
    }

    if (!inCollectibles) continue;

    const withKey = ENTRY_WITH_KEY.exec(line);
    if (withKey) {
      out.set(Number(withKey[1]), {
        name: unescapeLua(withKey[2]),
        desc: unescapeLua(withKey[3]),
      });
      continue;
    }

    const keyless = ENTRY_KEYLESS.exec(line);
    if (keyless) {
      out.set(Number(keyless[1]), {
        name: unescapeLua(keyless[2]),
        desc: unescapeLua(keyless[3]),
      });
    }
  }

  return out;
}

/** Comparaison permissive de deux noms d'items ("The Sad Onion" / "Sad Onion"). */
export function sameItemName(a, b) {
  const norm = (s) =>
    String(s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return true;
  return x === y || x.includes(y) || y.includes(x);
}
