// Windows CI smoke test: prove a fresh checkout can start the studio and render a film, not just pass unit tests.
// Runs on windows-latest (and locally on any platform) after `pnpm build`.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(ROOT, 'apps', 'cli', 'dist', 'cli.js');
const PORT = 5409;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, ms, what) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const v = await fn();
    if (v) return v;
    await sleep(250);
  }
  throw new Error(`timed out waiting for ${what}`);
}

async function studio() {
  const child = spawn(process.execPath, [CLI, 'serve', '--no-open', '--port', String(PORT)], {
    cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
  });
  let out = '', err = '';
  child.stdout.on('data', (d) => { out += d.toString(); });
  child.stderr.on('data', (d) => { err += d.toString(); });
  try {
    const url = await waitFor(() => {
      if (child.exitCode !== null) throw new Error(`the studio exited before it was ready (${child.exitCode}): ${err || out}`);
      const m = /http:\/\/127\.0\.0\.1:\d+\/\?token=[a-f0-9]+/.exec(out);
      return m?.[0];
    }, 60_000, 'the studio to print its URL');
    const res = await waitFor(async () => {
      try { return await fetch(url); } catch { return undefined; }
    }, 30_000, 'the studio to answer');
    if (res.status !== 200) throw new Error(`the studio answered ${res.status}`);
    const html = await res.text();
    if (!/<title>Promptreel<\/title>/.test(html)) throw new Error('the studio did not serve the panel');
    console.log(`studio: ${res.status} ${url}`);
  } finally {
    child.kill('SIGTERM');
    await Promise.race([new Promise((r) => child.once('exit', r)), sleep(10_000)]);
  }
}

async function render() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'promptreel-smoke-'));
  try {
    const { createProject } = await import(pathToFileURL(path.join(ROOT, 'packages', 'engine', 'tools', 'project.mjs')).href);
    createProject(dir, { title: 'Smoke', style: 'study', lang: 'en' });
    fs.writeFileSync(path.join(dir, 'script.js'), `(function (root) {
  const META = { title: 'Smoke', name: 'Smoke', style: 'study', libs: [], gap: 0.5, extras: [], publish: { titles: {}, description: '', tags: [] } };
  const PAGES = [{ id: 'p01', section: 'Opening', title: 'Smoke', cues: ['This is a smoke test', 'The style loads and draws'] }];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
`);
    fs.writeFileSync(path.join(dir, 'pages', 'p01.js'), `ENGINE.visual('p01', (P) => {
  P.text('Smoke', { x: 960, y: 380, size: 120, weight: 700, align: 'c', w: 1600, at: P.c(0, -0.4), cps: 9 });
  P.icon('clock', 960, 720, 140, { at: P.c(1, 0.2) });
});
`);
    const r = spawnSync(process.execPath, [path.join(ROOT, 'packages', 'engine', 'tools', 'render.mjs'), '--fps', '24', '--workers', '1'], {
      cwd: dir, encoding: 'utf8', timeout: 10 * 60_000,
    });
    if (r.status !== 0) throw new Error(`render failed (${r.status}):\n${(r.stdout || '').slice(-4000)}\n${(r.stderr || '').slice(-4000)}`);
    const out = path.join(dir, 'out');
    const film = fs.existsSync(out) ? fs.readdirSync(out).find((f) => /-(无字幕|no-subtitles)\.mp4$/.test(f)) : undefined;
    if (!film) throw new Error(`render printed success but wrote no film:\n${(r.stdout || '').slice(-4000)}`);
    const size = fs.statSync(path.join(out, film)).size;
    if (size < 10_000) throw new Error(`the film is too small (${size} bytes)`);
    console.log(`render: ${film} (${size} bytes)`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

try {
  await studio();
  await render();
  console.log('windows smoke: OK');
} catch (e) {
  console.error(e instanceof Error ? e.stack || e.message : e);
  process.exitCode = 1;
}
