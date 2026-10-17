import { defineConfig } from 'astro/config';

/**
 * Le site est 100 % statique.
 *
 * `site` et `base` sont deduits de l'environnement pour fonctionner aussi bien
 * en local que sur GitHub Pages, y compris pour un depot de projet servi sous
 * /<depot>/ (et non a la racine). Voir .github/workflows/deploy.yml.
 */
const repo = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const owner = process.env.GITHUB_REPOSITORY_OWNER ?? repo[0];
const name = repo[1];

const isUserSite = Boolean(name && name.toLowerCase().endsWith('.github.io'));

const base = process.env.BASE_PATH ?? (name && !isUserSite ? `/${name}/` : '/');
const site =
  process.env.SITE_URL ?? (name ? `https://${owner}.github.io` : 'https://spindown-codex.example');

export default defineConfig({
  output: 'static',
  site,
  base,
  trailingSlash: 'ignore',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
