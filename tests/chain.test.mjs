import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const items = JSON.parse(readFileSync('src/data/items.json', 'utf8'));
const visible = items.filter((i) => !i.hidden);
const chain = new Map(visible.map((i) => [i.id, i.spindown.target]));

const byId = new Map(items.map((i) => [i.id, i]));
const target = (id) => byId.get(id).spindown.target;

/** Copies locales de la logique, pour valider les donnees sans bundler. */
function distance(from, to, carBattery = false) {
  const steps = carBattery ? 2 : 1;
  if (to > from) return { possible: false, reason: 'up', uses: 0 };
  let cur = from;
  let uses = 0;
  while (cur > to) {
    for (let k = 0; k < steps; k++) {
      const next = chain.get(cur);
      if (next === null || next === undefined) {
        return { possible: false, reason: 'floor', uses, stoppedAt: cur };
      }
      if (next < to) return { possible: false, reason: 'overshoot', uses: uses + 1 };
      cur = next;
    }
    uses++;
  }
  return cur === to ? { possible: true, uses } : { possible: false, reason: 'overshoot', uses };
}

test("nombre d'items et bornes", () => {
  assert.equal(items.length, 721);
  assert.equal(visible.length, 717);
  assert.equal(Math.min(...visible.map((i) => i.id)), 1);
  assert.equal(Math.max(...visible.map((i) => i.id)), 732);
});

test('les 4 items hidden sont marques et hors chaine', () => {
  const hidden = items.filter((i) => i.hidden).map((i) => i.id).sort((a, b) => a - b);
  assert.deepEqual(hidden, [59, 656, 714, 715]);
  for (const id of hidden) assert.equal(chain.has(id), false);
});

test('la chaine saute les IDs hidden et vides', () => {
  assert.equal(target(60), 58, '60 saute 59 (hidden)');
  assert.equal(target(657), 655, '657 saute 656 (hidden)');
  assert.equal(target(716), 713, '716 saute 715 et 714 (hidden)');
  assert.equal(target(719), 717, '719 saute 718 (ID vide)');
});

test('Dad\u2019s Note est un mur', () => {
  assert.equal(target(669), 668, 'Sausage tombe sur Dad\u2019s Note');
  assert.equal(target(668), null, 'Dad\u2019s Note ne peut pas etre reroll');
  assert.equal(typeof byId.get(668).spindown.blocked, 'string');
});

test('Strawman est inatteignable', () => {
  // Seul predecesseur possible : Dad's Note, incapable de reroll.
  assert.equal(target(668), null);
  assert.equal(distance(732, 667).possible, false);
});

test("Mom's Ring est inatteignable", () => {
  assert.equal(distance(731, 732).possible, false);
  assert.equal(distance(732, 731).possible, true);
});

test('distance de bout en bout : 732 -> 668', () => {
  const r = distance(732, 668);
  assert.equal(r.possible, true);
  // 65 IDs de 732 a 668, moins 2 hidden (714, 715) et 1 vide (718) = 62 items,
  // donc 61 utilisations.
  assert.equal(r.uses, 61);
});

test('Sad Onion est le fond de la chaine', () => {
  assert.equal(target(1), null);
  assert.equal(distance(2, 1).possible, true);
  assert.equal(distance(2, 1).uses, 1);
});

test('coherence globale de la chaine', () => {
  const seen = new Set();
  for (const item of visible) {
    const t = item.spindown.target;
    if (t === null) continue;
    assert.ok(!seen.has(t), `l'ID ${t} a deux successeurs`);
    seen.add(t);
    assert.ok(byId.has(t), `la cible ${t} existe`);
    assert.equal(byId.get(t).hidden, false, `la cible ${t} n'est pas hidden`);
    assert.ok(t < item.id, `la cible ${t} est plus basse que ${item.id}`);
  }
});

test('une seule destination inaccessible', () => {
  const unreachable = visible
    .filter((i) => {
      if (i.id === 732) return true;
      const src = visible.find((s) => s.spindown.target === i.id);
      return !src || src.spindown.target === null;
    })
    .map((i) => i.id);
  assert.deepEqual(unreachable.sort((a, b) => a - b), [667, 732]);
});
