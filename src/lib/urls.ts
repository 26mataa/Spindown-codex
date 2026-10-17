/**
 * URLs internes sensibles au "base path".
 *
 * Un site GitHub Pages de projet est servi sous /<depot>/ et non a la racine.
 * Tous les liens et assets internes passent par `url()` pour rester valides
 * dans les deux cas (racine ou sous-dossier).
 *
 * En local, BASE_URL vaut '/' : `url('/icons/1.png')` renvoie '/icons/1.png'.
 */

const raw = import.meta.env.BASE_URL || '/';

/** Base sans slash final : '' a la racine, '/spindown-codex' en sous-dossier. */
export const BASE = raw.endsWith('/') ? raw.slice(0, -1) : raw;

export function url(path: string): string {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
