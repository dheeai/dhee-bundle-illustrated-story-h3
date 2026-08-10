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
const pie = cfg.perItemEnums ?? {};

/** Same walk the runner does: slash-separated, every step must exist. */
function resolvePointer(pointer) {
  let cursor = schema;
  for (const step of pointer.split('/').filter(Boolean)) {
    if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) return undefined;
    cursor = cursor[step];
  }
  return cursor;
}

test('the node binds its ids per item, through the ENGINE not an external runner', () => {
  // v0.31.0 moved this into dhee-core: cfg.outputSchema is one static path for
  // the whole fan-out, which is a hole in llm.generate's own structured-output
  // contract over collections, not something specific to this bundle.
  assert.equal(node.runner.tool, 'llm.generate');
  assert.equal(bundle.dependencies.runners['llm.generate_scoped'], undefined);
  assert.ok(cfg.perItemEnums, 'scene_video_prompt must declare perItemEnums');
});

test('the allowlist is read from the SAME artifact the render gate reads', () => {
  // scenes_plan.sections[].entities is what expectedSceneReferenceIds resolves
  // downstream. Reading a different list would let the two drift apart.
  assert.deepEqual({ from: pie.from, itemsKey: pie.itemsKey, matchField: pie.matchField, valuesField: pie.valuesField }, {
    from: 'scenes_plan',
    itemsKey: 'sections',
    matchField: 'id',
    valuesField: 'entities',
  });
  assert.ok(node.inputs.some((i) => i.from === 'scenes_plan'), 'scenes_plan must be a declared input');
});

test('every enum path resolves to a string field in the real schema', () => {
  // One path now, not four: indexed refs left references[].id as the only
  // id-valued field an author writes.
  assert.ok(pie.enumSchemaPaths.length >= 1);
  for (const pointer of pie.enumSchemaPaths) {
    const slot = resolvePointer(pointer);
    assert.ok(slot && typeof slot === 'object', `enumSchemaPaths '${pointer}' does not resolve`);
    assert.equal(slot.type, 'string', `enumSchemaPaths '${pointer}' is not a string field`);
  }
});

test('ids live in ONE field, so that is the only one to constrain', () => {
  // v0.35.0: shots point at positions. references[].id is the only id-valued
  // field an author writes, so it is the only path left to enum-bind or check.
  assert.deepEqual(pie.idPaths, ['references[].id']);
  assert.deepEqual(pie.enumSchemaPaths, ['properties/references/items/properties/id']);
  // These are gone deliberately: with no id-valued shot fields they would have
  // inspected nothing, and a silent no-op is worse than an absent check.
  for (const dead of ['characterPaths', 'sceneryPaths', 'requireDeclared']) {
    assert.equal(pie[dead], undefined, `${dead} should be gone under indexed refs`);
  }
});

test('shots address references by POSITION, and the schema bounds the index', () => {
  const shot = schema.properties.shots.items.properties;
  assert.equal(shot.sceneryIds, undefined, 'sceneryIds must be gone');
  assert.equal(shot.sceneryRefs.items.type, 'integer');
  assert.equal(shot.acting.items.properties.subjectId, undefined, 'subjectId must be gone');
  assert.equal(shot.acting.items.properties.subjectRef.type, 'integer');
  // maxItems on references is 9, so the schema can bound an index to 0..8 —
  // but NOT to the actual length of this document's array. That residue is a
  // bounds check at resolution, not a schema guarantee.
  assert.equal(shot.acting.items.properties.subjectRef.maximum, schema.properties.references.maxItems - 1);
});

test('a dialogue speaker always points at a plate — subjectRef is mandatory (#18)', () => {
  // #18: subjectRef was optional in the schema (grammar-constrained decoding
  // never emits an optional field) but mandatory in the runner, so 100% of
  // dialogue lines died at render time. Every id in references[] already has
  // an anchor image on disk (perItemEnums.requireAssetIn below), so there is
  // no legitimate speaker with nothing to point at — including an off-screen
  // one, which still names its own plate and sets offScreen:true instead. The
  // runner's genuinely-unplated-speaker path (417bfe4) stays available for
  // OTHER bundles that still author subjectId as a free string; this bundle's
  // schema just never emits that shape.
  const dialogue = schema.properties.shots.items.properties.dialogue.items;
  assert.equal(dialogue.properties.subjectRef.type, 'integer');
  assert.ok(dialogue.required.includes('subjectRef'), 'subjectRef must be mandatory, not silently omittable');
  assert.ok(dialogue.required.includes('offScreen'), 'offScreen must be mandatory too, or it is the next field a model silently drops');
});

test('a boundary ledger is not this scene’s cast — continuationFrom and offStage stay free', () => {
  const constrained = [...pie.enumSchemaPaths, ...pie.idPaths];
  for (const forbidden of ['continuationFrom', 'offStage']) {
    assert.equal(
      constrained.some((p) => p.includes(forbidden)),
      false,
      `${forbidden} must not be constrained — the render gate does not check it either`,
    );
  }
});

test('wrong-slot is still possible with one references array — and the runner catches it', () => {
  // An index CAN point at the wrong type while references[] is a single array,
  // so this class is reduced but not deleted. It is caught downstream by
  // validateStructuredScenePerformance, which names only the character ids as
  // the legal options. Splitting references into characters[]/scenery[] with
  // separate index spaces would make it unrepresentable.
  assert.equal(schema.properties.characters, undefined);
  assert.ok(schema.properties.references, 'still one array — the residue is deliberate');
});

test('continuationAnchor points at this scene\u2019s own references, by position', () => {
  const ca = schema.properties.continuationAnchor.properties.characterPositions.items;
  assert.equal(ca.properties.subjectRef.type, 'integer');
  assert.equal(ca.properties.subjectId, undefined);
});
