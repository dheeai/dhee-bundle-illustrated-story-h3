/**
 * THE CLASS, not another instance.
 *
 * #6, #17 and #18 are the same defect three times: a field was optional in
 * `scene_video_prompt.schema.json` but mandatory in dhee-runner-minimax-h3, so
 * grammar-constrained decoding legally omitted it, `llm.generate` accepted the
 * document, the walker cached it — and the run died hours later at
 * `comfy.minimax_h3_r2v`, where nothing can repair it because the node that
 * could is finished and its output is on disk. #18's title says it out loud:
 * "recurrence of #6".
 *
 * Each of those got its own regression test (dialogue_subject_required,
 * references_distinct, scoped_ids). Instance tests cannot converge: every new
 * field the runner learns to require is a fresh instance.
 *
 * This test asserts the INVARIANT behind all of them:
 *
 *     a document the SCHEMA accepts must be a document the RUNNER accepts.
 *
 * It works by ablation, not fuzzing. Fuzzing a schema-valid document produces
 * false positives, because the runner enforces cross-field rules JSON Schema
 * cannot express (shot times strictly increasing, endTime <= duration,
 * multi_cut => >=2 shots). So instead we start from documents that are known
 * good on BOTH sides, delete one schema-OPTIONAL field at a time, and require
 * the runner to still accept. A throw names a field the schema must start
 * requiring — or, when the rule is genuinely cross-field, one that needs an
 * authoring-time check rather than a schema change.
 *
 * The fixtures are real authored scenes (tests/fixtures/scenes/*.json), not
 * hand-written ones, so the baseline is a document the pipeline actually
 * produced.
 *
 * NO GPU. Runs in about a second. This is the check that should fail in CI
 * instead of at render time.
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const RUNNER_DIST = join(process.env.HOME, '.kshana/runners/dhee-runner-minimax-h3/dist');

// The whole point is to run the RUNNER's real validators, so a missing build is
// a hard failure, never a silent skip — a skipped contract test is the same as
// no contract test.
if (!existsSync(join(RUNNER_DIST, 'officialFormat.js'))) {
  throw new Error(
    `dhee-runner-minimax-h3 is not built at ${RUNNER_DIST}. ` +
      'Run `npm install` in ~/.kshana/runners/dhee-runner-minimax-h3 first.',
  );
}
const officialFormat = await import(join(RUNNER_DIST, 'officialFormat.js'));
const runnerIndex = await import(join(RUNNER_DIST, 'index.js'));
const schema = JSON.parse(readFileSync(join(root, 'schemas/scene_video_prompt.schema.json'), 'utf8'));

const FIXTURE_DIR = join(root, 'tests/fixtures/scenes');

/**
 * The runner's real pre-render pipeline, in the order `runH3` runs it
 * (dhee-runner-minimax-h3/src/index.ts, the `useStructuredPrompt` block).
 * Every step here is pure — the GPU only enters after all of them pass.
 * Returns null on success, the failure message otherwise.
 */
function renderTimeVerdict(doc) {
  try {
    officialFormat.dedupeSceneReferences(doc);
    officialFormat.normalizeIndexedRefs(doc);
    const expectedIds = (doc.references ?? []).map((r) => r.id);
    runnerIndex.validateStructuredSceneReferences(doc, expectedIds);
    officialFormat.validateStructuredScenePerformance(doc, expectedIds, true);
    officialFormat.compileStructuredScenePrompt(doc, {
      strictPerformance: true,
      expectedReferenceIds: expectedIds,
    });
    return null;
  } catch (error) {
    return error.message;
  }
}

/** Walk schema and document together, yielding every present field and whether the schema requires it. */
function* fieldsOf(subSchema, doc, pointer = '') {
  if (!subSchema || typeof subSchema !== 'object' || doc === null || doc === undefined) return;
  if (subSchema.properties) {
    const required = new Set(subSchema.required ?? []);
    for (const [key, child] of Object.entries(subSchema.properties)) {
      if (!(key in doc)) continue;
      yield { pointer: `${pointer}/${key}`, required: required.has(key) };
      yield* fieldsOf(child, doc[key], `${pointer}/${key}`);
    }
  } else if (subSchema.items) {
    if (!Array.isArray(doc)) return;
    for (let i = 0; i < doc.length; i++) yield* fieldsOf(subSchema.items, doc[i], `${pointer}/${i}`);
  }
}

/** Delete the value at a JSON pointer. Array elements splice, object keys delete. */
function deleteAt(doc, pointer) {
  const parts = pointer.split('/').filter(Boolean);
  const last = parts.pop();
  let node = doc;
  for (const part of parts) {
    node = Array.isArray(node) ? node[Number(part)] : node[part];
    if (node === null || node === undefined) return false;
  }
  if (Array.isArray(node)) {
    node.splice(Number(last), 1);
    return true;
  }
  if (!(last in node)) return false;
  delete node[last];
  return true;
}

/**
 * Divergences that are known, filed, and NOT fixable in the schema.
 *
 * Keep this list SHORT and keep every entry pointing at an issue. An entry here
 * is debt, not an exemption: it means the rule is cross-field, JSON Schema
 * cannot state it, and the real fix is an authoring-time check that lets
 * `llm.generate`'s retry loop repair the document instead of the renderer dying
 * on it. Adding a new entry instead of fixing the schema is how #6 became #18.
 */
const KNOWN_DIVERGENCES = new Map([
  [
    '/shots[]/dialogue',
    'dheeai/dhee-bundle-illustrated-story-h3#20 — spokenLines is required and independently ' +
      'authored, but nothing forces a shot to own those lines. Cross-field: needs an ' +
      'authoring-time check, not a schema `required`.',
  ],
]);

function loadFixtures() {
  return readdirSync(FIXTURE_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ name: f, doc: JSON.parse(readFileSync(join(FIXTURE_DIR, f), 'utf8')) }));
}

test('the fixtures are a valid baseline: the runner accepts every one unmodified', () => {
  const fixtures = loadFixtures();
  assert.ok(fixtures.length > 0, `no fixtures in ${FIXTURE_DIR}`);
  const broken = fixtures
    .map(({ name, doc }) => ({ name, verdict: renderTimeVerdict(structuredClone(doc)) }))
    .filter((r) => r.verdict);
  assert.deepEqual(
    broken.map((b) => `${b.name}: ${b.verdict}`),
    [],
    'a fixture no longer renders — re-capture it, or the runner gained a requirement nothing satisfies',
  );
});

test('every field the runner requires is a field the schema requires', () => {
  const findings = new Map();

  for (const { name, doc: baseline } of loadFixtures()) {
    for (const { pointer, required } of fieldsOf(schema, baseline)) {
      if (required) continue; // the schema already guarantees it
      const candidate = structuredClone(baseline);
      if (!deleteAt(candidate, pointer)) continue;
      const verdict = renderTimeVerdict(candidate);
      if (!verdict) continue; // optional on both sides — correct

      // Collapse array indices: shots/0/dialogue and shots/1/dialogue are one bug.
      const generic = pointer.replace(/\/\d+/g, '[]');
      if (!findings.has(generic)) findings.set(generic, { verdict, sites: new Set() });
      findings.get(generic).sites.add(name);
    }
  }

  // A known divergence that has since been FIXED should be deleted from the
  // allowlist, not left to rot — a stale entry hides the next recurrence.
  const stale = [...KNOWN_DIVERGENCES.keys()].filter((pointer) => !findings.has(pointer));
  assert.deepEqual(stale, [], 'these divergences no longer reproduce — delete them from KNOWN_DIVERGENCES');

  const report = [...findings]
    .filter(([pointer]) => !KNOWN_DIVERGENCES.has(pointer))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pointer, { verdict, sites }]) =>
      `${pointer} — optional in the schema, but removing it makes the renderer fail with:\n` +
      `      "${verdict}"\n` +
      `      (reproduced from ${sites.size} fixture(s))`,
    );

  assert.deepEqual(
    report,
    [],
    'schema/runner divergence — a document the schema accepts dies at render time.\n' +
      'Fix by adding the field to the schema\'s `required`, OR — when the rule is cross-field and\n' +
      'JSON Schema cannot express it — by moving the check to authoring time so the retry loop\n' +
      'can repair it. Do NOT fix it by relaxing the runner.\n\n' +
      report.join('\n\n'),
  );
});
