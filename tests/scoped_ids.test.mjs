/**
 * The scene author's ids are bound to the section's allowlist — and bound in
 * the RIGHT places.
 *
 * `enumSchemaPaths` is walked against the schema at run time and a path that
 * does not resolve is a hard config error. That protects the run, but only once
 * it starts; a field renamed in the schema would otherwise be found by the
 * first render of the day. This test finds it at commit time instead.
 *
 * It also pins the three id fields that must NOT be constrained, because
 * constraining them would make this bundle stricter than the render gate it is
 * feeding — the mistake that failed a real film three times.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bundle = JSON.parse(readFileSync(join(root, 'bundle.json'), 'utf-8'));
const schema = JSON.parse(readFileSync(join(root, 'schemas/scene_video_prompt.schema.json'), 'utf-8'));
const node = bundle.nodes.find((n) => n.id === 'scene_video_prompt');
const cfg = node.runner.config;

/** Same walk the runner does: slash-separated, every step must exist. */
function resolvePointer(pointer) {
  let cursor = schema;
  for (const step of pointer.split('/').filter(Boolean)) {
    if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) return undefined;
    cursor = cursor[step];
  }
  return cursor;
}

test('the node authors through the scoped runner, not plain llm.generate', () => {
  assert.equal(node.runner.tool, 'llm.generate_scoped');
  assert.equal(bundle.dependencies.runners['llm.generate_scoped'] !== undefined, true);
  assert.equal(bundle.dependencies.runnerPackages['llm.generate_scoped'], 'dhee-runner-scene-author');
});

test('the allowlist is read from the SAME artifact the render gate reads', () => {
  // scenes_plan.sections[].entities is what expectedSceneReferenceIds resolves
  // downstream. Reading a different list would let the two drift apart.
  assert.deepEqual(cfg.allowlist, {
    from: 'scenes_plan',
    itemsKey: 'sections',
    matchField: 'id',
    valuesField: 'entities',
  });
  assert.ok(node.inputs.some((i) => i.from === 'scenes_plan'), 'scenes_plan must be a declared input');
});

test('every enum path resolves to a string field in the real schema', () => {
  assert.ok(cfg.enumSchemaPaths.length >= 4);
  for (const pointer of cfg.enumSchemaPaths) {
    const slot = resolvePointer(pointer);
    assert.ok(slot && typeof slot === 'object', `enumSchemaPaths '${pointer}' does not resolve`);
    assert.equal(slot.type, 'string', `enumSchemaPaths '${pointer}' is not a string field`);
  }
});

test('an off-screen speaker is CHECKED with an exemption, never enum-bound', () => {
  // A grammar cannot express "unless offScreen is true", so enum-ing this field
  // would make a legitimate off-screen line undecodable — stricter than the
  // render gate, which exempts it outright.
  const dialogue = cfg.idPaths.find((p) => typeof p === 'object' && p.path === 'shots[].dialogue[].subjectId');
  assert.ok(dialogue, 'dialogue subjectId must still be checked');
  assert.deepEqual(dialogue.exemptWhen, { field: 'offScreen', equals: true });
  assert.equal(
    cfg.enumSchemaPaths.some((p) => p.includes('dialogue')),
    false,
    'dialogue subjectId must not be enum-bound',
  );
});

test('a boundary ledger is not this scene’s cast — continuationFrom and offStage stay free', () => {
  const constrained = [...cfg.enumSchemaPaths, ...cfg.idPaths.map((p) => (typeof p === 'string' ? p : p.path))];
  for (const forbidden of ['continuationFrom', 'offStage']) {
    assert.equal(
      constrained.some((p) => p.includes(forbidden)),
      false,
      `${forbidden} must not be constrained — the render gate does not check it either`,
    );
  }
});

test('continuationAnchor IS constrained — the gate hard-fails on it', () => {
  const paths = cfg.idPaths.map((p) => (typeof p === 'string' ? p : p.path));
  assert.ok(paths.includes('continuationAnchor.characterPositions[].subjectId'));
});
