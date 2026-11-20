import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ENGINE_DIR } from '@promptreel/engine/tools/project.mjs';
import { STYLES } from './styles.js';

test('every style pack with a meta.json card is offered, once', () => {
  const ids = STYLES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  const dir = path.join(ENGINE_DIR, 'styles');
  const packs = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory() && fs.existsSync(path.join(dir, d.name, 'meta.json')));
  assert.ok(STYLES.length >= 5);
  for (const pack of packs) {
    const style = STYLES.find((s) => s.id === pack.name);
    assert.ok(style, `${pack.name} is missing from the picker`);
    assert.ok(style.name && style.summary, `${pack.name} has a name and a summary`);
  }
});

test('the built-ins stay first, and an installed pack keeps both languages, its colours and its tier', () => {
  assert.deepEqual(STYLES.slice(0, 5).map((s) => s.id), ['warm-story', 'study', 'whiteboard', 'chalkboard', 'tech-dark']);
  // the open-source repo ships the built-ins only; a Cloud pack installed here is checked
  const pack = STYLES.find((s) => s.i18n);
  if (!pack) return;
  assert.ok(pack.name && pack.summary);
  assert.ok(pack.i18n?.zh?.name && pack.i18n?.en?.name);
  if (pack.swatch) assert.ok(pack.swatch.length > 0);
  if (pack.tier) assert.ok(pack.tier === 'free' || pack.tier === 'member');
});
