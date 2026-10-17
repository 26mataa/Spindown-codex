import raw from '../data/items.json';
import { distanceWithMap } from './distance';
import { url } from './urls';

export type ItemType = 'passive' | 'active' | 'familiar';

export interface SpindownLink {
  /** ID de l'item obtenu avec un Spindown, ou null si rien ne peut sortir. */
  target: number | null;
  /** Raison pour laquelle l'item ne peut pas etre reroll. */
  blocked: string | null;
}

export interface Item {
  id: number;
  name: string;
  type: ItemType;
  hidden: boolean;
  quality: number | null;
  tags: string[];
  pools: string[];
  icon: string;
  description: string | null;
  names: Record<string, string>;
  spindown: SpindownLink;
}

/** Les icônes sont stockées en '/icons/{id}.png' et préfixées par la base. */
export const items: Item[] = (raw as Item[]).map((item) => ({ ...item, icon: url(item.icon) }));

export const byId: ReadonlyMap<number, Item> = new Map(items.map((i) => [i.id, i]));

/** Items reellement visibles en jeu (les 4 `hidden` sont des doublons internes). */
export const visibleItems: Item[] = items.filter((i) => !i.hidden);

export const MIN_ID = visibleItems[0]?.id ?? 1;

export const MAX_ID = 732;

export const HIDDEN_IDS = items.filter((i) => i.hidden).map((i) => i.id);

/** IDs qui n'existent pas du tout dans le jeu (slots vides). */
export const EMPTY_IDS: number[] = (() => {
  const present = new Set(items.map((i) => i.id));
  const out: number[] = [];
  for (let id = MIN_ID; id <= MAX_ID; id++) if (!present.has(id)) out.push(id);
  return out;
})();

export function getItem(id: number): Item | undefined {
  return byId.get(id);
}

/** Index inverse : pour un ID, l'item qui mene a lui (ID + 1 effectif). */
const sourceById: ReadonlyMap<number, number> = (() => {
  const m = new Map<number, number>();
  for (const it of visibleItems) {
    if (it.spindown.target !== null) m.set(it.spindown.target, it.id);
  }
  return m;
})();

/** L'item obtenu en utilisant un Spindown sur `id`, ou null. */
export function spindownTarget(id: number): number | null {
  return byId.get(id)?.spindown.target ?? null;
}

/** Les items qui, avec un Spindown, deviennent `id` (au plus un). */
export function spindownSources(id: number): number[] {
  const src = sourceById.get(id);
  return src === undefined ? [] : [src];
}

export function descendantsOf(id: number, count: number): number[] {
  const out: number[] = [];
  let cur: number | null = id;
  for (let i = 0; i < count; i++) {
    const next: number | null = cur === null ? null : spindownTarget(cur);
    if (next === null) break;
    out.push(next);
    cur = next;
  }
  return out;
}

/** Un item peut-il etre reroll ? Dad's Note est le seul cas bloquant. */
export function isRerollable(id: number): boolean {
  const it = byId.get(id);
  return !!it && !it.hidden && !it.spindown.blocked;
}

/**
 * Un item est-il atteignable par au moins un Spindown ?
 * Faux pour Strawman (667) — son seul predecesseur est Dad's Note, qui ne peut
 * pas etre reroll — et pour Mom's Ring (732), qui est l'ID maximal.
 */
export function isReachableBySpindown(id: number): boolean {
  if (id >= MAX_ID) return false;
  const [src] = spindownSources(id);
  if (src === undefined) return false;
  return isRerollable(src);
}

export interface DistanceResult {
  possible: boolean;
  uses: number;
  /** IDs traverses, du depart a l'arrivee. */
  path: number[];
  reason?: 'up' | 'blocked' | 'floor' | 'overshoot' | 'unknown-item';
  blockedAt?: number;
}

/** Map id -> cible Spindown, utilisee par le moteur de distance. */
export const CHAIN: ReadonlyMap<number, number | null> = new Map(
  visibleItems.map((it) => [it.id, it.spindown.target])
);

/**
 * Nombre d'utilisations de Spindown Dice pour aller de `fromId` a `toId`.
 *
 * Regles verifiees (wiki + fichiers du jeu) :
 *  - on descend d'ID en ID, en sautant les items `hidden` (59, 656, 714, 715) ;
 *  - Dad's Note (668) ne peut pas etre reroll : la descente s'arrete net ;
 *  - Car Battery fait deux rerolls par utilisation (donc -2, ou plus si sauts) ;
 *  - si la cible est plus haute que la source, c'est impossible.
 */
export function spindownDistance(
  fromId: number,
  toId: number,
  options: { carBattery?: boolean } = {}
): DistanceResult {
  const r = distanceWithMap(CHAIN, fromId, toId, options);
  const stopped = r.stoppedAt;
  const reason = r.reason === 'floor' && stopped !== undefined && byId.get(stopped)?.spindown.blocked
    ? ('blocked' as const)
    : r.reason;

  return {
    possible: r.possible,
    uses: r.uses,
    path: r.path,
    reason,
    blockedAt: r.possible ? undefined : stopped,
  };
}

/**
 * Le segment haut de la chaine : on part de Mom's Ring et on descend jusqu'au
 * premier item non rerollable (Dad's Note, #668). C'est tout ce qu'on peut
 * atteindre en partant du haut.
 */
export function topSegment(): number[] {
  const out: number[] = [];
  let id: number | null = visibleItems[visibleItems.length - 1]?.id ?? null;
  while (id !== null) {
    out.push(id);
    id = spindownTarget(id);
  }
  return out;
}

/** Les segments independants de la chaine (separes par les items non rerollables). */
export function chainSegments(): number[][] {
  const segments: number[][] = [];
  let current: number[] = [];
  for (let i = visibleItems.length - 1; i >= 0; i--) {
    const item = visibleItems[i];
    current.push(item.id);
    if (item.spindown.blocked) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

export function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export const QUALITY_LABELS: Record<number, string> = {
  0: '0 — awful',
  1: '1 — bad',
  2: '2 — ok',
  3: '3 — good',
  4: '4 — great',
};

export const QUALITY_COLORS: Record<number, string> = {
  0: 'var(--q0)',
  1: 'var(--q1)',
  2: 'var(--q2)',
  3: 'var(--q3)',
  4: 'var(--q4)',
};
