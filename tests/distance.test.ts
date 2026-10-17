import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanceWithMap } from '../src/lib/distance.ts';

/**
 * Chaine synthetique, avec un trou (6) et un cul-de-sac (9) :
 *   10 -> 9      (9 ne peut plus descendre)
 *    8 -> 7 -> 5 -> 4 -> 3 -> 2 -> 1   (l'ID 6 n'existe pas)
 */
const chain = new Map<number, number | null>([
  [10, 9],
  [9, null],
  [8, 7],
  [7, 5],
  [5, 4],
  [4, 3],
  [3, 2],
  [2, 1],
  [1, null],
]);

test('meme item : zero utilisation', () => {
  const r = distanceWithMap(chain, 7, 7);
  assert.equal(r.possible, true);
  assert.equal(r.uses, 0);
  assert.deepEqual(r.path, [7]);
});

test('cible superieure : impossible', () => {
  const r = distanceWithMap(chain, 4, 10);
  assert.equal(r.possible, false);
  assert.equal(r.reason, 'up');
});

test('chemin nominal', () => {
  const r = distanceWithMap(chain, 8, 5);
  assert.equal(r.possible, true);
  assert.equal(r.uses, 2);
  assert.deepEqual(r.path, [8, 7, 5]);
});

test('un saut (ID inexistant) ne coute qu une utilisation', () => {
  // 8 -> 7 -> 5 -> 4 -> 3 : quatre utilisations, dont une qui saute le 6.
  const r = distanceWithMap(chain, 8, 3);
  assert.equal(r.possible, true);
  assert.equal(r.uses, 4);
  assert.deepEqual(r.path, [8, 7, 5, 4, 3]);
});

test('Car Battery : deux rerolls par utilisation', () => {
  const r = distanceWithMap(chain, 8, 3, { carBattery: true });
  assert.equal(r.possible, true);
  assert.equal(r.uses, 2);
  assert.deepEqual(r.path, [8, 7, 5, 4, 3]);
});

test('Car Battery : la deuxieme utilisation depasse la cible', () => {
  // 8 -> 7 -> 5 puis 5 -> 4 -> 3 : on voulait 4, on atterrit sur 3.
  const r = distanceWithMap(chain, 8, 4, { carBattery: true });
  assert.equal(r.possible, false);
  assert.equal(r.reason, 'overshoot');
  assert.equal(r.stoppedAt, 3);
});

test('fond de chaine : impossible de descendre', () => {
  const r = distanceWithMap(chain, 9, 8);
  assert.equal(r.possible, false);
  assert.equal(r.reason, 'floor');
  assert.equal(r.stoppedAt, 9);
});

test('item inconnu de la chaine', () => {
  const r = distanceWithMap(chain, 99, 5);
  assert.equal(r.possible, false);
  assert.equal(r.reason, 'unknown-item');
});
