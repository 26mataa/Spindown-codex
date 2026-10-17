/**
 * Combobox d'item : un champ qui cherche dans les 20 langues, comme l'accueil,
 * au lieu d'un <select> de 717 options.
 *
 * Accessible : motif ARIA combobox + listbox, flèches, Entrée, Échap.
 */

import { buildIndex, search, type Row, type SearchEntry } from './search';
import { url } from './urls';

let indexPromise: Promise<SearchEntry[]> | null = null;

function loadIndex(): Promise<SearchEntry[]> {
  indexPromise ??= fetch(url('/search.json'))
    .then((r) => r.json())
    .then((rows: Row[]) => buildIndex(rows));
  return indexPromise;
}

const LIMIT = 8;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'
  );
}

export function initPicker(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>('[data-picker-input]');
  const list = root.querySelector<HTMLUListElement>('[data-picker-list]');
  const valueEl = root.querySelector<HTMLInputElement>('[data-picker-value]');
  const icon = root.querySelector<HTMLImageElement>('[data-picker-icon]');
  const idEl = root.querySelector<HTMLElement>('[data-picker-id]');

  if (!input || !list || !valueEl) return;

  const known = new Map<number, string>();
  let index: SearchEntry[] = [];
  let results: { id: number; name: string }[] = [];
  let active = -1;
  let chosenName = input.value;

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };

  const paint = () => {
    list.innerHTML = results
      .map(
        (r, i) => `<li role="option" id="${root.id}-opt-${i}" data-id="${r.id}"
            aria-selected="${i === active}">
            <img src="${url(`/icons/${r.id}.png`)}" alt="" width="26" height="26" loading="lazy">
            <span>${escapeHtml(r.name)}</span>
            <span class="mono">#${String(r.id).padStart(3, '0')}</span>
          </li>`
      )
      .join('');

    list.hidden = results.length === 0;
    input.setAttribute('aria-expanded', String(results.length > 0));

    const activeId = active >= 0 ? `${root.id}-opt-${active}` : null;
    if (activeId) input.setAttribute('aria-activedescendant', activeId);
    else input.removeAttribute('aria-activedescendant');
  };

  const refresh = async () => {
    index = await loadIndex();
    const query = input.value.trim();

    if (!query) {
      results = [];
      paint();
      return;
    }

    results = search(index, query, LIMIT).map((hit) => {
      known.set(hit.id, hit.name);
      return { id: hit.id, name: hit.name };
    });
    active = results.length ? 0 : -1;
    paint();
  };

  const choose = (id: number, name: string) => {
    valueEl.value = String(id);
    input.value = name;
    chosenName = name;
    known.set(id, name);
    if (idEl) idEl.textContent = `#${String(id).padStart(3, '0')}`;
    if (icon) icon.src = url(`/icons/${id}.png`);
    close();
    root.dispatchEvent(new CustomEvent('picker:change', { bubbles: true, detail: { id } }));
  };

  const move = (delta: number) => {
    if (!results.length) return;
    active = (active + delta + results.length) % results.length;
    paint();
    list
      .querySelector<HTMLElement>('[role="option"][aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  };

  input.addEventListener('focus', () => {
    input.select();
    void refresh();
  });

  input.addEventListener('input', () => {
    void refresh();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      if (list.hidden) return;
      e.preventDefault();
      const pick = results[active >= 0 ? active : 0];
      if (pick) choose(pick.id, pick.name);
    } else if (e.key === 'Escape') {
      if (!list.hidden) {
        e.preventDefault();
        close();
      }
      input.value = chosenName;
    }
  });

  input.addEventListener('blur', () => {
    // Laisse le clic sur une option aboutir avant de refermer.
    window.setTimeout(() => {
      close();
      input.value = chosenName;
    }, 120);
  });

  list.addEventListener('mousedown', (e) => {
    const option = (e.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (!option) return;
    e.preventDefault();
    const id = Number(option.dataset.id);
    choose(id, known.get(id) ?? '');
  });

  known.set(Number(valueEl.value), chosenName);

  // Lien partageable : /calculator?from=671&to=669. Le picker se cale tout seul,
  // ce qui évite toute course entre les scripts de la page et du composant.
  const side = root.dataset.side;
  if (side) {
    const raw = new URLSearchParams(location.search).get(side);
    const wanted = Number(raw);
    if (Number.isFinite(wanted) && wanted > 0 && String(wanted) !== valueEl.value) {
      void loadIndex().then((idx) => {
        const hit = idx.find((entry) => entry.id === wanted);
        choose(wanted, hit?.name ?? `#${wanted}`);
      });
    }
  }
}
