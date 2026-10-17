/**
 * Application des traductions côté client.
 *
 * Le HTML est généré en anglais ; ce module remplace les textes marqués
 * `data-i18n` après chargement. Aucune page n'est dupliquée, aucune URL ne
 * change : les 722 pages restent uniques.
 */

import { dicts, LANGS, type Lang } from './dict';

const STORAGE_KEY = 'spindown-codex:lang';

let current: Lang = 'en';

export function normalizeLang(value: string | null | undefined): Lang | null {
  if (!value) return null;
  const base = value.toLowerCase().split(/[-_]/)[0];
  return (LANGS as readonly string[]).includes(base) ? (base as Lang) : null;
}

/** Choix mémorisé > langue du navigateur > anglais. */
export function detectLang(): Lang {
  try {
    const stored = normalizeLang(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
  } catch {
    /* localStorage indisponible (mode privé strict) : on continue. */
  }

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const lang = normalizeLang(candidate);
    if (lang) return lang;
  }
  return 'en';
}

export function getLang(): Lang {
  return current;
}

/** Traduit une clé. Les variables s'écrivent `{nom}`. */
export function t(key: string, vars?: Record<string, string | number>): string {
  const dict = dicts[current] ?? dicts.en;
  const raw = dict[key] ?? dicts.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

function applyElement(el: Element): void {
  const htmlKey = el.getAttribute('data-i18n-html');
  if (htmlKey) {
    // Dictionnaires internes uniquement : ce n'est jamais une entrée utilisateur.
    el.innerHTML = t(htmlKey);
  }

  const key = el.getAttribute('data-i18n');
  if (key) {
    let vars: Record<string, string | number> | undefined;
    const args = el.getAttribute('data-i18n-args');
    if (args) {
      try {
        vars = JSON.parse(args) as Record<string, string | number>;
      } catch {
        vars = undefined;
      }
    }
    el.textContent = t(key, vars);
  }

  const placeholder = el.getAttribute('data-i18n-placeholder');
  if (placeholder) el.setAttribute('placeholder', t(placeholder));

  const aria = el.getAttribute('data-i18n-aria');
  if (aria) el.setAttribute('aria-label', t(aria));
}

export function applyI18n(root: ParentNode = document): void {
  for (const el of root.querySelectorAll(
    '[data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-aria]'
  )) {
    applyElement(el);
  }
}

export function setLang(lang: Lang, { persist = true } = {}): void {
  current = lang;
  document.documentElement.lang = lang;

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* sans importance */
    }
  }

  applyI18n();

  const select = document.querySelector<HTMLSelectElement>('[data-lang-select]');
  if (select) select.value = lang;

  document.dispatchEvent(new CustomEvent<string>('langchange', { detail: lang }));
}

/** Langue forcee par l'URL : `?lang=fr` (lien partageable). Priorite maximale. */
export function langFromUrl(): Lang | null {
  try {
    return normalizeLang(new URLSearchParams(location.search).get('lang'));
  } catch {
    return null;
  }
}

/** À appeler une fois, au chargement. */
export function initI18n(): void {
  const forced = langFromUrl();
  current = forced ?? detectLang();
  document.documentElement.lang = current;

  const select = document.querySelector<HTMLSelectElement>('[data-lang-select]');
  if (select) {
    select.value = current;
    select.addEventListener('change', () => {
      const lang = normalizeLang(select.value);
      if (!lang) return;
      // Un choix manuel doit l'emporter sur un ?lang= resté dans l'URL.
      try {
        const url = new URL(location.href);
        if (url.searchParams.has('lang')) {
          url.searchParams.delete('lang');
          history.replaceState(null, '', url);
        }
      } catch {
        /* sans importance */
      }
      setLang(lang);
    });
  }

  setLang(current, { persist: forced !== null });
}
