/**
 * #18 — dialogue[].subjectRef was optional in the schema but mandatory in the
 * runner, so grammar-constrained decoding omitted it on 100% of lines and every
 * scene with dialogue died at `comfy.minimax_h3_r2v`, hours into a render.
 *
 * This is the recurrence of #6, which fixed the identical split for `acting`.
 * The fix here is schema-only (subjectRef + offScreen both moved into
 * `dialogue.items.required`); this test proves it fails at AUTHORING time
 * (ajv, no GPU) rather than at render time.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const Ajv = require('/Users/ganaraj/Projects/dhee-core/node_modules/ajv');
const root = new URL('..', import.meta.url).pathname;
const schema = JSON.parse(readFileSync(join(root, 'schemas/scene_video_prompt.schema.json'), 'utf8'));

function validDialogueLine() {
  return {
    subjectRef: 0,
    offScreen: false,
    speakerId: 'S1',
    language: 'English',
    exactWords: 'Hold it steady.',
    delivery: 'quietly',
    voicePrompt: 'Middle-aged male, warm and steady tone, measured pace.',
  };
}

function validScene() {
  return {
    spokenLines: ['Hold it steady.'],
    style: 'Warm hand-painted gouache with soft directional light and visible brush texture.',
    summary: '[reference generation] Kael steadies the blade at the forge while Sereth watches.',
    references: [
      { id: 'kael', type: 'character', appearsAs: 'a soot-streaked smith in a leather apron', job: 'his face and the burn scar on his forearm' },
      { id: 'sereth_vale', type: 'character', appearsAs: 'a cloaked traveler', job: 'her face and cloak clasp' },
      { id: 'the_forge', type: 'location', appearsAs: 'a dim smithy lit by coals', job: 'the location and its ember light' },
    ],
    shots: [
      {
        id: 'shot-1',
        startTime: 0,
        endTime: 5,
        composition: 'Medium two-shot across the anvil.',
        acting: [
          { subjectRef: 0, tactic: 'steady', observableBehavior: 'His hand does not shake as he holds the blade to the coals.', beatChange: 'His jaw sets when she speaks.' },
          { subjectRef: 1, tactic: 'watch', observableBehavior: 'She leans in, arms crossed.', beatChange: 'Her eyes narrow at the blade.' },
        ],
        sceneryRefs: [2],
        action: 'The blade glows from dull red to bright orange.',
        cameraMotion: 'Static Shot',
        sound: 'Coals hiss and settle.',
        dialogue: [validDialogueLine()],
      },
    ],
    overallSoundscape: 'The forge bellows breathe steadily in the background.',
    nonDiegeticMusic: 'N/A',
    negatives: ['no subtitles'],
    duration: 5,
    speechSeconds: 1.5,
    purpose: 'Kael commits to finishing the blade.',
    shotStructure: 'locked_single',
    renderComplexity: 'simple',
    performance: {
      objective: 'Prove to Sereth the blade will hold.',
      obstacle: 'The metal is not yet ready.',
      stakes: 'A failed blade means the journey cannot continue.',
      physicalBusiness: 'He turns the blade slowly in the coals.',
      bodyState: 'Low, grounded stance; controlled breath.',
      eyeLife: 'His eyes stay fixed on the color of the metal.',
    },
    continuationAnchor: {
      fixedLandmarks: [{ name: 'the anvil', screenPosition: 'centre foreground' }],
      characterPositions: [
        { subjectRef: 0, screenPosition: 'centre, at the anvil', facing: 'toward the forge', pose: 'holding the blade in the coals' },
        { subjectRef: 1, screenPosition: 'left third, midground', facing: 'toward Kael', pose: 'arms crossed' },
      ],
      lightingBaseline: 'Warm ember light from the forge, cool shadow elsewhere.',
    },
  };
}

test('schema compiles and a fully valid scene passes', () => {
  const validate = new Ajv({ allErrors: true }).compile(schema);
  const ok = validate(validScene());
  assert.equal(ok, true, JSON.stringify(validate.errors));
});

test('a dialogue line with subjectRef omitted fails schema validation (the #18 defect)', () => {
  const validate = new Ajv({ allErrors: true }).compile(schema);
  const scene = validScene();
  delete scene.shots[0].dialogue[0].subjectRef;
  const ok = validate(scene);
  assert.equal(ok, false, 'a dialogue line missing subjectRef must be rejected at authoring time, not at render time');
  assert.ok(
    validate.errors.some((e) => (e.instancePath || e.dataPath || '').includes('dialogue') && e.keyword === 'required' && e.params?.missingProperty === 'subjectRef'),
    `expected a missing-subjectRef error, got: ${JSON.stringify(validate.errors)}`,
  );
});

test('a dialogue line with offScreen omitted also fails schema validation', () => {
  const validate = new Ajv({ allErrors: true }).compile(schema);
  const scene = validScene();
  delete scene.shots[0].dialogue[0].offScreen;
  const ok = validate(scene);
  assert.equal(ok, false, 'a dialogue line missing offScreen must be rejected at authoring time');
});

test('an off-screen speaker still supplies subjectRef pointing at their own plate', () => {
  const validate = new Ajv({ allErrors: true }).compile(schema);
  const scene = validScene();
  scene.shots[0].acting = [scene.shots[0].acting[0]]; // sereth_vale has no acting entry this shot
  scene.shots[0].dialogue = [{
    subjectRef: 1, // still points at sereth_vale's plate
    offScreen: true,
    speakerId: 'S2',
    language: 'English',
    exactWords: 'Hold it steady.',
    delivery: 'from the doorway',
    voicePrompt: 'Mid-20s female, warm and melodic timbre.',
  }];
  const ok = validate(scene);
  assert.equal(ok, true, JSON.stringify(validate.errors));
});
