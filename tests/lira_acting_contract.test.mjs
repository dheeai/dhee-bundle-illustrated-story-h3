import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const Ajv = require('/Users/ganaraj/Projects/dhee-core/node_modules/ajv');
const root = new URL('..', import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));

function validProfile() {
  return {
    characterId: 'maya',
    masterProfile: Array(150).fill('observable').join(' '),
    voicePrompt: 'A woman in her thirties with a warm mid-range voice; measured and clear under pressure.',
    objectiveEngine: 'Turn guarded questions into an admission from the person in front of her.',
    physicalBaseline: 'Low center of gravity, economical hands, and breath held briefly before difficult choices.',
    eyeLife: 'Micro-saccades target the partner, blinks tighten under pressure, and catchlights stay wet and alive.',
    signatureTics: [
      { tic: 'rubs the edge of her thumb', trigger: 'when she is buying time before a risky question' },
    ],
    mask: 'Composed attention with a small courteous smile.',
    crackTrigger: 'The partner denies a fact she has already verified.',
    softeningTarget: 'her younger brother',
  };
}

function validScene() {
  return {
    spokenLines: ['Exact words.'],
    summary: '[reference generation] Maya presses the dockside witness before the boat departs.',
    references: [
      { id: 'maya', type: 'character', appearsAs: 'young woman in a blue coat', job: 'hold her identity' },
      { id: 'dock', type: 'location', appearsAs: 'misty harbor dock', job: 'hold the location' },
    ],
    shots: [
      {
        id: 'shot-1', startTime: 0, endTime: 4,
        composition: 'Medium two-shot at the dock.', subjectIds: ['maya', 'dock'],
        action: 'Maya raises one hand.', cameraMotion: 'Push In', sound: 'Rope creaks.',
        dialogue: [{ speakerId: 'S1', subjectId: 'maya', language: 'English', exactWords: 'Exact words.', delivery: 'quietly' }],
        acting: [{
          subjectId: 'maya', tactic: 'press', observableBehavior: 'She keeps counting the witness\'s breaths while her thumb rubs the coat seam.',
          beatChange: 'Her polite smile stops when the witness looks away.', reaction: 'She answers the look before the line ends.',
          assessmentMoment: 'A brief stillness as she decides whether to accuse him.', interruptedAction: 'Her hand stops halfway to the departing rope.',
        }],
      },
      {
        id: 'shot-2', startTime: 4, endTime: 8,
        composition: 'Wide view from the departing boat.', subjectIds: ['maya', 'dock'],
        action: 'The boat clears the pier.', cameraMotion: 'Tracking Shot', sound: 'Water churns.',
        acting: [{
          subjectId: 'maya', tactic: 'withhold', observableBehavior: 'She lowers her hand and watches the empty space where the witness stood.',
          beatChange: 'Her shoulders settle after the boat pulls away.',
        }],
      },
    ],
    overallSoundscape: 'Water laps against the pilings.', nonDiegeticMusic: 'N/A',
    negatives: ['no subtitles'], duration: 8, purpose: 'Maya lets the boat leave.', shotStructure: 'multi_cut',
    performance: {
      objective: 'Make the witness admit what he saw.',
      obstacle: 'He protects himself by looking past her.',
      stakes: 'If he leaves silent, the evidence disappears with him.',
      physicalBusiness: 'She folds and refolds a wet rope while questioning him.',
      bodyState: 'Low center of gravity, controlled breath, shoulders held square until the denial lands.',
      eyeLife: 'Her gaze tracks his eyes with small saccades; one slow blink marks the decision to press harder.',
      subtext: 'She is asking for truth while testing whether he can be trusted.',
      statusDynamic: 'She starts deferential and quietly takes the higher position.',
      proxemics: 'She closes from social distance to the edge of personal distance, then lets him retreat.',
      voiceProfiles: [{
        subjectId: 'maya',
        voicePrompt: 'A woman in her thirties with a warm mid-range voice; measured and clear under pressure.',
      }],
    },
  };
}

test('bundle declares a strict character_acting_profile collection contract', () => {
  const bundle = json('bundle.json');
  const node = bundle.nodes.find((candidate) => candidate.id === 'character_acting_profile');
  assert.ok(node, 'character_acting_profile node is required');
  assert.equal(node.kind, 'collection');
  assert.equal(node.itemSource, 'story_bible');
  assert.equal(node.itemKey, 'characters');
  assert.equal(node.outputs.pattern, 'plans/acting_profiles/{{item_id}}.json');
  assert.deepEqual(node.inputs, [
    { from: 'story_bible', usage: 'input', scope: 'matching' },
    { from: 'director_screenplay', usage: 'context' },
  ]);
  assert.equal(node.runner.tool, 'llm.generate');
  assert.equal(node.runner.config.promptTemplate, 'prompts/character_acting_profile.md');
  assert.equal(node.runner.config.outputSchema, 'schemas/character_acting_profile.schema.json');
  assert.equal(node.runner.config.outputFormat, 'json');
  assert.ok(bundle.dependencies.runners['llm.generate']);
});

test('character acting profile schema is strict and requires triggered tics', () => {
  const schema = json('schemas/character_acting_profile.schema.json');
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required, [
    'characterId', 'masterProfile', 'voicePrompt', 'objectiveEngine',
    'physicalBaseline', 'eyeLife', 'signatureTics', 'mask', 'crackTrigger',
  ]);
  const validate = new Ajv({ allErrors: true }).compile(schema);
  assert.equal(validate(validProfile()), true);
  const bad = validProfile();
  delete bad.signatureTics[0].trigger;
  assert.equal(validate(bad), false);
  assert.match(validate.errors.map((error) => error.instancePath || error.dataPath).join(' '), /signatureTics/);
  assert.equal(validate({ ...validProfile(), invented: true }), false);
  const tooShort = validProfile();
  tooShort.masterProfile = 'too short';
  assert.equal(validate(tooShort), false);
  const tooLong = validProfile();
  tooLong.masterProfile = 'x'.repeat(1801);
  assert.equal(validate(tooLong), false);
  const tooManyWords = validProfile();
  tooManyWords.masterProfile = Array(221).fill('word').join(' ');
  assert.equal(validate(tooManyWords), false, 'masterProfile must enforce the documented 150–220 word contract');
});

test('scene schema requires strict root and per-shot ACTING structures', () => {
  const schema = json('schemas/scene_video_prompt.schema.json');
  assert.ok(schema.required.includes('performance'));
  assert.ok(schema.properties.performance.required.includes('voiceProfiles'));
  assert.deepEqual(schema.properties.performance.properties.voiceProfiles.items.required, ['subjectId', 'voicePrompt']);
  assert.equal(schema.additionalProperties, false);
  const validate = new Ajv({ allErrors: true }).compile(schema);
  assert.equal(validate(validScene()), true);
  assert.equal(validate({ ...validScene(), invented: true }), false);
  const missingRoot = validScene();
  delete missingRoot.performance;
  assert.equal(validate(missingRoot), false);
  const malformedActing = validScene();
  delete malformedActing.shots[0].acting[0].tactic;
  assert.equal(validate(malformedActing), false);
});

test('scene node receives acting profiles and enables strict performance validation', () => {
  const bundle = json('bundle.json');
  const promptNode = bundle.nodes.find((candidate) => candidate.id === 'scene_video_prompt');
  const clipNode = bundle.nodes.find((candidate) => candidate.id === 'scene_clip');
  assert.ok(promptNode.inputs.some((input) => input.from === 'character_acting_profile' && input.usage === 'context'));
  assert.equal(clipNode.runner.config.strictPerformance, true);
});

test('scene prompt carries the collection item id into every authoring request', () => {
  const prompt = read('prompts/scene_video_prompt.md');
  assert.match(
    prompt,
    /\{\{\s*item_id\s*\}\}/,
    'scene_video_prompt must render {{item_id}} so collection requests have distinct prompt/CAS identities',
  );
});

test('LIRA rules are distilled into all existing anchor authoring lanes', () => {
  for (const file of [
    'prompts/character_anchor_prompt.md',
    'prompts/object_anchor_prompt.md',
    'prompts/location_anchor_prompt.md',
    'prompts/character_state_prompt.md',
  ]) {
    const prompt = read(file);
    assert.match(prompt, /deconstruct/i, `${file} must diagnose inputs before authoring`);
    assert.match(prompt, /source-derived\s+palette/i, `${file} must derive palette from sources`);
    assert.match(prompt, /platform\s+(?:fields|parameters)/i, `${file} must keep geometry out of prose`);
    assert.match(prompt, /positive descriptions/i, `${file} must use positive generation language`);
    assert.match(prompt, /text, labels,?\s+and watermarks/i, `${file} must guard against accidental text`);
  }
  const editPrompt = read('prompts/character_state_prompt.md');
  assert.match(editPrompt, /PRESERVE EXACTLY/i);
  assert.match(editPrompt, /one (?:positive )?change at a time/i);
  const scenePrompt = read('prompts/scene_video_prompt.md');
  assert.match(scenePrompt, /voiceProfiles/i);
  assert.match(scenePrompt, /copy.*voicePrompt.*verbatim/i);
  assert.match(scenePrompt, /exactly once/i);
});
