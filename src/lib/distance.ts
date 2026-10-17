/**
 * Logique pure du Spindown Dice — sans dependance aux donnees.
 *
 * Un "chainage" est une Map<id, cible> ou la cible est l'ID obtenu en utilisant
 * un Spindown Dice sur cet item (null = rien ne sort, l'item ne peut pas etre
 * reroll). Les items `hidden` sont deja absents de la Map : ils ne sont donc
 * jamais traverses.
 */

export type ChainMap = ReadonlyMap<number, number | null>;

export type DistanceReason = 'up' | 'blocked' | 'floor' | 'overshoot' | 'unknown-item';

export interface DistanceResult {
  possible: boolean;
  uses: number;
  /** IDs traverses, du depart a l'arrivee (ou jusqu'au point de blocage). */
  path: number[];
  reason?: DistanceReason;
  /** ID sur lequel la descente s'est arretee. */
  stoppedAt?: number;
}

/**
 * Nombre d'utilisations de Spindown Dice pour transformer `fromId` en `toId`.
 *
 * - on descend d'ID en ID, en sautant les items qui ne sont pas des cibles
 *   valides (ils n'ont simplement pas d'entree dans la Map) ;
 * - `carBattery` fait deux rerolls par utilisation ;
 * - une cible superieure (ou egale) est impossible ;
 * - si un saut depasse la cible, le resultat est `overshoot` (typiquement avec
 *   Car Battery sur une distance impaire).
 */
export function distanceWithMap(
  chain: ChainMap,
  fromId: number,
  toId: number,
  { carBattery = false }: { carBattery?: boolean } = {}
): DistanceResult {
  const path = [fromId];

  if (!chain.has(fromId) || !chain.has(toId)) {
    return { possible: false, uses: 0, path, reason: 'unknown-item' };
  }
  if (toId === fromId) return { possible: true, uses: 0, path };
  if (toId > fromId) return { possible: false, uses: 0, path, reason: 'up' };

  const steps = carBattery ? 2 : 1;
  let current = fromId;
  let uses = 0;
  let guard = 0;

  while (current > toId) {
    if (++guard > 10_000) {
      return { possible: false, uses, path, reason: 'unknown-item' };
    }

    for (let k = 0; k < steps; k++) {
      const next = chain.get(current);

      if (next === undefined) {
        return { possible: false, uses, path, reason: 'unknown-item' };
      }
      if (next === null) {
        return { possible: false, uses, path, reason: 'floor', stoppedAt: current };
      }
      if (next < toId) {
        path.push(next);
        return { possible: false, uses: uses + 1, path, reason: 'overshoot', stoppedAt: next };
      }

      current = next;
      path.push(current);
    }

    uses++;
  }

  return { possible: true, uses, path };
}
