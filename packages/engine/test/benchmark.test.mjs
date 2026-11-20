// Style benchmarks are regression tests: every style's example project must stay clean under lint and storyboard-lint.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { ENGINE_DIR } from '../tools/project.mjs';
import { withLinkedCopy } from './linked-copy.mjs';

// Cloud style packs restored to PromptReel: the packs themselves draw, but these example projects came with them and
// are not maintained against this engine (a missing storyboard, an older layout). Their packs are smoke-tested with a
// plain page; only examples that stay clean join the regression suite.
const STALE_EXAMPLES = new Set(['blueprint', 'engraving', 'exploded', 'isometric', 'math', 'old-map', 'one-line']);
// 3D styles draw with WebGL. A CI runner has no GPU, so Chrome falls back to software rendering and one example can take
// minutes (diorama and molecule hit the 180 s lint timeout on Linux). macOS CI has a GPU and keeps them; the packs stay
// usable everywhere, and their examples run on a machine with one.
const SKIP_WEBGL_CI = !!process.env.CI && process.platform !== 'darwin';

for (const style of fs.readdirSync(path.join(ENGINE_DIR, 'styles'))) {
  const dir = path.join(ENGINE_DIR, 'styles', style, 'example');
  const scriptFile = path.join(dir, 'script.js');
  if (STALE_EXAMPLES.has(style) || !fs.existsSync(scriptFile)) continue;
  if (SKIP_WEBGL_CI && /webgl:\s*true/.test(fs.readFileSync(scriptFile, 'utf8'))) continue;
  test(`${style} benchmark: storyboard and layout are clean`, () => withLinkedCopy(dir, (dir) => {
    const sb = spawnSync(process.execPath, [path.join(ENGINE_DIR, 'tools/storyboard-lint.mjs'), 'storyboard.json', '--source', 'materials', '--json'], { cwd: dir, encoding: 'utf8' });
    assert.deepEqual(JSON.parse(sb.stdout).filter((i) => i.level === 'red'), []);
    const lint = spawnSync(process.execPath, [path.join(ENGINE_DIR, 'tools/lint.mjs'), '--json', '--determinism'], { cwd: dir, encoding: 'utf8', timeout: 180000 });
    assert.deepEqual(JSON.parse(lint.stdout.trim().split('\n').pop()), []);
  }));
}
