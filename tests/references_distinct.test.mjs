/**
 * #19 — references[] ids were not required distinct anywhere (schema, prompt,
 * or runner), so a model reads maxItems: 9 as a quota and pads the array by
 * repeating the cast it already has (measured: scene_1 declared 9 slots for 2
 * subjects). `uniqueItems` cannot catch this in JSON Schema — the padded
 * entries differ in `appearsAs` — so the schema fix is layer 1 only (state the
 * rule); the hard guarantee is the runner-side dedupe in dhee-runner-minimax-h3.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));

test('the schema states references[] ids must be distinct and 9 is a ceiling, not a target', () => {
  const schema = json('schemas/scene_video_prompt.schema.json');
  const description = schema.properties.references.description;
  assert.match(description, /distinct/i);
  assert.match(description, /ceiling/i);
});

test('the prompt states the same rule where the model actually reads it', () => {
  const prompt = read('prompts/scene_video_prompt.md');
  assert.match(prompt, /distinct/i);
  assert.match(prompt, /ceiling.*not a target|not a target.*ceiling/is);
});
