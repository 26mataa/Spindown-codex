import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildIndex, normalize, search } from '../src/lib/search.ts';

const rows = JSON.parse(readFileSync('public/search.json', 'utf8'));
const index = buildIndex(rows);

const first = (q) => search(index, q, 1)[0];
const nameOf = (id) => rows.find((r) => r[0] === id)?.[1];

test('index complet', () => {
  assert.equal(index.length, 717);
  assert.ok(index.every((e) => e.keys.length >= 2), 'chaque item a au moins 1 alias traduit');
});

test('normalisation : diacritiques et casse', () => {
  assert.equal(normalize('  Cuillère   Tordue '), 'cuillere tordue');
  assert.equal(normalize('Ёлка'), 'елка');
});

test('nom anglais exact', () => {
  const hit = first('brimstone');
  assert.equal(hit.id, 118);
  assert.equal(nameOf(hit.id), 'Brimstone');
});

test('préfixe court', () => {
  const hit = first('brim');
  assert.equal(hit.id, 118);
});

test('nom français → fiche anglaise', () => {
  const hit = first('Oignon Triste');
  assert.equal(hit.id, 1);
  assert.equal(nameOf(hit.id), 'The Sad Onion');
});

test('français sans accents', () => {
  const hit = first('cuillere tordue');
  assert.equal(hit.id, 3);
});

test('japonais', () => {
  const hit = first('悲しみオニオン');
  assert.equal(hit.id, 1);
});

test('coréen', () => {
  const hit = first('슬픈 양파');
  assert.equal(hit.id, 1);
});

test('chinois', () => {
  const hit = first('悲伤洋葱');
  assert.equal(hit.id, 1);
});

test('cyrillique', () => {
  const hit = first('Кубик с вычетом');
  assert.equal(hit.id, 723);
});

test('allemand', () => {
  const hit = first('Die traurige Zwiebel');
  assert.equal(hit.id, 1);
});

test('aucun résultat', () => {
  assert.deepEqual(search(index, 'zzzzz'), []);
  assert.deepEqual(search(index, '   '), []);
});

test('limite respectée et tri par pertinence', () => {
  const hits = search(index, 'the', 5);
  assert.equal(hits.length, 5);
  for (let i = 1; i < hits.length; i++) assert.ok(hits[i - 1].score >= hits[i].score);
});
