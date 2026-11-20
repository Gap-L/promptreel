import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lengthBudget } from './director.js';
import { scriptPrompt, storyboardPrompt, type Brief } from './prompts.js';

const brief: Brief = { durationSec: 15, topic: '潮汐', lang: 'zh', replyLang: 'zh' };

test('a 15-second film is held to two pages at most', () => {
  assert.equal(lengthBudget(15).pages, 2);
  assert.equal(lengthBudget(60).pages, 5);
});

test('a short film is planned in seconds, on one page, with no kit', () => {
  const p = storyboardPrompt(brief, 'warm-story', []);
  assert.match(p, /explainer film of about 15 seconds/);
  assert.match(p, /very short film \(15 seconds\)/);
  assert.match(p, /one page, two at most/);
  assert.match(p, /leave `look\.kit` out/);
  assert.doesNotMatch(p, /Also list in/);
});

test('a short film gets 2–4 cues and an estimate near its length', () => {
  const p = scriptPrompt(undefined, brief);
  assert.match(p, /15 seconds/);
  assert.match(p, /2–4 short cues on one page/);
  assert.match(p, /about 18 seconds/);
});
