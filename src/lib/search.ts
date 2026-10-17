/**
 * Recherche multilingue — logique pure, testable sans DOM.
 *
 * L'index est une liste `[id, nom anglais, "alias1|alias2|..."]` produite par
 * `scripts/build-data.mjs` (public/search.json). Les alias sont les noms dans
 * les 20 langues du mod EID.
 *
 * Pas de tokenisation : la recherche est en sous-chaîne après normalisation,
 * ce qui fonctionne aussi bien pour le latin que pour le cyrillique ou le CJK
 * (où la segmentation en mots n'a pas de sens).
 */

export type Row = [number, string, string];

export interface SearchEntry {
  id: number;
  name: string;
  keys: string[];
}

export interface SearchHit {
  id: number;
  name: string;
  score: number;
}

/** Minuscules, sans diacritiques, espaces normalisés. Léo → leo, Ё → е. */
export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildIndex(rows: Row[]): SearchEntry[] {
  return rows.map(([id, name, aliases]) => ({
    id,
    name,
    keys: [normalize(name), ...aliases.split('|').filter(Boolean).map(normalize)],
  }));
}

/**
 * Score : correspondance exacte (100) > préfixe (60) > sous-chaîne
 * (30, dégressif selon la position).
 */
export function search(index: SearchEntry[], query: string, limit = 8): SearchHit[] {
  const q = normalize(query);
  if (!q) return [];

  const hits: SearchHit[] = [];

  for (const entry of index) {
    let best = 0;
    for (const key of entry.keys) {
      if (key === q) {
        best = 100;
        break;
      }
      if (key.startsWith(q)) {
        best = Math.max(best, 60);
        continue;
      }
      const at = key.indexOf(q);
      if (at >= 0) best = Math.max(best, 30 - Math.min(at, 20) / 10);
    }
    if (best > 0) hits.push({ id: entry.id, name: entry.name, score: best });
  }

  return hits.sort((a, b) => b.score - a.score || a.id - b.id).slice(0, limit);
}
