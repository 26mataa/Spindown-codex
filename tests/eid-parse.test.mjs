import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { parseEidDescriptions, sameItemName } from '../scripts/lib/eid.mjs';

/**
 * Les fichiers EID contiennent plusieurs tables indexées de 1 à N. Ce test
 * verrouille la régression qui a fait afficher des descriptions de trinkets sur
 * les items 1 à 188 : le parseur doit ignorer tout ce qui n'est pas un
 * collectible.
 */
const fixture = `
local languageCode = "en_us"

---------- Collectibles ----------

local repCollectibles={
	[5] = {"5", "My Reflection", "Tears boomerang#↑ +1.5 Damage"}, -- My Reflection
	[105] = {"105", "The D6", "Rerolls pedestal items in the room"},
}

---------- Trinkets ----------

local repTrinkets={
	[5] = {"5", "Champion Belt", "2x chance for champion enemies"},
	[105] = {"105", "Tonsil", "Blocks enemy projectiles"},
}

---------- Cards ----------

local repCards={
	[5] = {"5", "The Hierophant", "Grants 2 soul hearts"},
}

local repCarBattery = {
	[5] = {"5", "Car Battery", "Double activation"},
}
`;

test('ne garde que la table des collectibles', () => {
  const map = parseEidDescriptions(fixture);

  assert.equal(map.size, 2);
  assert.equal(map.get(5).name, 'My Reflection');
  assert.equal(map.get(5).desc, 'Tears boomerang#↑ +1.5 Damage');
  assert.equal(map.get(105).name, 'The D6');
  assert.ok(!map.get(5).desc.includes('champion'));
});

test('accepte la forme sans clé (ab+)', () => {
  const map = parseEidDescriptions(`
EID.descriptions[languageCode].collectibles={
	{"1", "The Sad Onion", "↑ +0.7 Tears"}, -- The Sad Onion
	{"118", "Brimstone", "Blood beam"},
}
`);
  assert.equal(map.get(1).desc, '↑ +0.7 Tears');
  assert.equal(map.get(118).name, 'Brimstone');
});

test('accepte un commentaire en fin de ligne', () => {
  const map = parseEidDescriptions(`
local collectibles = {
	[7] = {"7", "Blood of the Martyr", "↑ +1 Damage"}, -- Blood of the Martyr
}
`);
  assert.equal(map.get(7).desc, '↑ +1 Damage');
});

test('les noms se comparent de façon permissive', () => {
  assert.ok(sameItemName('The Sad Onion', 'Sad Onion'));
  assert.ok(sameItemName("Mom's Knife", 'Moms Knife'));
  assert.ok(sameItemName('1up!', '1up!'));
  assert.equal(sameItemName('My Reflection', 'Champion Belt'), false);
});

test('les données générées sont cohérentes avec le jeu', () => {
  const items = JSON.parse(readFileSync('src/data/items.json', 'utf8'));
  const byId = new Map(items.map((i) => [i.id, i]));

  const expected = [
    [105, 'Rerolls pedestal items'],
    [118, 'blood beam'],
    [723, 'Rerolls all items in the room'],
    [668, 'Ascent'],
    [45, 'Heals 1 heart'],
    [68, 'shoots lasers'],
    [331, 'Homing tears'],
    [706, 'pedestals'],
  ];

  for (const [id, needle] of expected) {
    const item = byId.get(id);
    assert.ok(item, `item ${id} absent`);
    assert.ok(
      item.description?.includes(needle),
      `item ${id} (${item.name}) : description inattendue → ${item.description?.slice(0, 80)}`
    );
  }
});

test('tous les items ont une description issue de la bonne table', () => {
  const items = JSON.parse(readFileSync('src/data/items.json', 'utf8'));
  const withDesc = items.filter((i) => i.description);
  assert.equal(withDesc.length, items.length, 'chaque item doit avoir une description');
});

const hasRawSources = existsSync('sources/eid/desc');

// Les fichiers EID bruts ne sont pas versionnés (npm run fetch:assets les
// récupère) : en intégration continue, ce test n'a rien à lire et se saute.
test('chaque description provient d’une entrée au bon nom', { skip: !hasRawSources && 'sources EID absentes' }, () => {
  // Le vrai garde-fou : chaque item doit avoir, dans au moins un fichier EID,
  // une entrée dont le nom correspond. C'est ce qui manquait quand les
  // descriptions de trinkets écrasaient celles des collectibles.
  const items = JSON.parse(readFileSync('src/data/items.json', 'utf8'));

  const entriesById = new Map();
  for (const dir of ['rep+', 'rep', 'ab+', 'rgon']) {
    let text;
    try {
      text = readFileSync(`sources/eid/desc/${dir}/en_us.lua`, 'utf8');
    } catch {
      continue;
    }
    for (const [id, entry] of parseEidDescriptions(text)) {
      const list = entriesById.get(id) ?? [];
      list.push(entry);
      entriesById.set(id, list);
    }
  }

  const orphans = [];
  for (const item of items) {
    if (!item.description) continue;
    const entries = entriesById.get(item.id) ?? [];
    if (!entries.some((entry) => sameItemName(item.name, entry.name))) {
      orphans.push(`#${item.id} ${item.name}`);
    }
  }

  assert.deepEqual(orphans, [], `description sans entrée à son nom : ${orphans.join(', ')}`);
});
