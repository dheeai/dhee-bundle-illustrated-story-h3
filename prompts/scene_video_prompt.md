# Structured MiniMax H3 scene authoring

Return one JSON object matching `schemas/scene_video_prompt.schema.json` exactly.
The runner, not this authoring pass, owns the final six-section H3 prose. Your
job is to author a small, typed scene plan that can be compiled deterministically.

Do not return Markdown, a prose blob, `detailedDescription`,
`subject_definitions`, `retention_analysis`, `<Picture N>` numbering, or any
field not named by the schema. Do not put subject-definition paragraphs inside
any string. The runner creates `<Subject N>` definitions from `references[]` in
their final routed order and remaps those labels if routing changes the order.

## Authoritative scene-reference guard

The section you are authoring is supplied below as `scene_detail`, and it is the
ONLY section you can see. Its `section.entities[]` IS your reference allowlist
and its `shots[]` are your cuts.

**Ids appear in exactly ONE place: `references[].id`.** Every id there must be
copied verbatim from the current section's entities. Never borrow an id from an
example, from the story bible generally, from another section, or from your own
invention.

**Everywhere else you point at a reference by its POSITION, not its name.**
`references` is an ordered list; `references[0]` is the first entry. A shot says
which of them it stages with a 0-based integer:

```jsonc
"references": [
  { "id": "sereth_vale", "type": "character", ... },   // 0
  { "id": "kael",        "type": "character", ... },   // 1
  { "id": "the_forge",   "type": "location",  ... }    // 2
],
"shots": [{
  "acting":      [{ "subjectRef": 0, ... }, { "subjectRef": 1, ... }],
  "sceneryRefs": [2],
  "dialogue":    [{ "subjectRef": 0, "exactWords": "Hold it steady.", ... }]
}]
```

This is not a stylistic preference — it removes whole classes of mistake that
have killed finished films. A position cannot be a misspelling, cannot belong to
a different section, and cannot name something you forgot to declare. An index
must be **less than the number of entries you actually wrote**: if you declare
three references, the only legal values anywhere are 0, 1 and 2.

**`entities[]` wins over the section's prose.** If the section's `text` mentions
something that is NOT in `entities` — a lantern the Courier holds, a knife on a
table — you may not stage it: no reference, no `sceneryRefs` entry, no dialogue
subject, and do not describe it in a shot. Write the beat without it. That thing
has no reference plate, so staging it is rejected before the render and costs the
whole run; leaving it out costs one prop. If an entity from the current section
is visible or takes effect in the scene, declare it in `references` and point at
it by position from the relevant shot.

**Characters go in `acting`, objects and locations in `sceneryRefs`.** Pointing
at a character's position from `sceneryRefs`, or a location's from `acting`, is
rejected. `S1`-style values remain `speakerId` values only — never a reference.

## Output fields

Write the fields in this order:

1. `spokenLines`
2. `style`
3. `summary`
3. `references`
4. `shots`
5. `overallSoundscape`
6. `nonDiegeticMusic`
7. `negatives`
8. `duration`
9. `speechSeconds`
10. `purpose`
11. `shotStructure`
12. `renderComplexity`
13. `performance`
14. `continuationAnchor`
15. `continuationFrom` — omit ONLY on the first scene of the film

`duration` is the length of this one H3 call, between 5 and 15.08 seconds. Set
it to the SUM of this section's planned shot durations (`scene_detail.shots[].duration`)
— that budget is what the film's pacing was built on, and inflating it makes the
finished film overrun. Every shot must fit inside it.

`spokenLines` contains ONLY the lines carried by this section's own shots
(`scene_detail.shots[].dialogue`). If those shots carry no dialogue, it is `[]`
and nobody speaks. Never pull in a line because it belongs to the story — a line
staged twice is spoken twice in the finished film.

`style` is one or two sentences of VISUAL STYLE taken from the supplied art
style — medium, palette, light quality, finish. The runner emits it immediately
before `[Shot 1]`, the one place the official guide allows a style opening. Put
no action, no character and no camera in it.

`speechSeconds` is your estimate of how long the SPOKEN audio takes, end to end
— every word at the pace this character's `voicePrompt` and your own `delivery`
imply, plus the pauses you intend between sentences. Leave out lead-in and tail;
the renderer adds those.

Take the voice seriously when you estimate. A profile reading "slow pace,
gravelly, deliberate pauses mid-sentence" is far slower than the ~2.8 words per
second a plain reading assumes, and the renderer's own fallback estimate assumes
the plain reading. This number can only LENGTHEN the clip, never shorten it — a
generous estimate costs a little dead air, a mean one cuts the last words off
mid-sentence. Use `0` when nobody speaks.

`purpose` is one sentence naming the single story beat this scene lands.
`summary` is a short English paragraph beginning with a task-type prefix such as
`[reference generation]`; refer only to the subjects that the runner will
number, never to image slots.

## Exact dialogue contract

`spokenLines` is the scene's complete exact-word ledger. Find only the lines
owned by this scene in the supplied plan. Copy each line once, with its original
words, punctuation and native script. Use `[]` when nobody speaks. Store bare
words only: no `<d>` tags, no language labels, no speaker names.

Each spoken line must appear in exactly one shot's `dialogue` array. A dialogue
object has:

- `speakerId`: a stable id such as `S1`; the same voice keeps the same id across
  all shots.
- `subjectRef`: REQUIRED on every line, on screen or not — the POSITION in
  `references[]` of the character who owns the voice. Every id you declare in
  `references[]` already has an anchor plate on disk, so there is no legitimate
  speaker with nothing to point at. An off-screen speaker still points at their
  own plate here; set `offScreen: true` alongside it rather than omitting this
  field.
- `language`: the language name for the H3 tag.
- `exactWords`: an exact character-for-character copy of one `spokenLines`
  entry. Never paraphrase, summarize, translate or add punctuation.
- `delivery`: the vocal delivery written outside the words, such as quietly,
  urgently or with a strained breath.
- `voicePrompt`: that character's fixed vocal identity, copied VERBATIM from
  their `character_acting_profile`. Put it on every line of theirs; the runner
  emits it once, before their first line. Do not paraphrase, shorten or invent
  it.
- `offScreen`: REQUIRED on every line — state `true` or `false` explicitly, do
  not leave it to be inferred. `true` when the line is heard but the speaker is
  not seen in this shot. A speaker who has no `acting` entry in this shot is
  not on screen, so their line MUST set this to `true` — otherwise the scene is
  rejected. The runner then writes the official off-screen voiceover phrasing
  for you.

The runner emits the canonical form
`<Subject N> (Sx) says [delivery]: <d>[Language] exact words</d>`.
Do not author that markup yourself. A line that is not owned by one shot, a
speaker id that changes subject, or an exact-word mismatch is invalid.

For a non-Latin language, preserve the native script supplied by the plan. Do
not romanize it. Do not put dialogue, singing, voices, crowd calls or score in
`overallSoundscape`.

### Never write a speech verb without words — not even to deny it

H3 builds its audio from this text, so ANY speech verb in ANY field commits it
to synthesising a voice. If no `<d>` line accompanies that verb, it synthesises
a voice saying nothing — voice-shaped noise that sounds like a corrupted file,
and the render is rejected before it starts.

This includes DENIALS. "He does not speak", "she says nothing", "silent, without
a word" all trip it: the word `speak` is present either way, and H3 does not
read the negation. Never write one. Describe the silence as physical fact
instead:

- NOT "He does not speak." → "His mask stays closed and still."
- NOT "She says nothing."  → "Her lips stay closed; only her breath moves."

Applies to every string you write — `action`, `composition`, `sound`,
`observableBehavior`, `beatChange`, `overallSoundscape`, all of them. When
`spokenLines` is `[]`, no field may contain speak / says / said / voice /
murmur / whisper / shout / call out / reply / answer in any form.

## ACTING contract

The supplied `character_acting_profile` collection contains one permanent
master profile per recurring character. Adapt those profiles into this scene;
never paste a whole master profile verbatim. For the root `performance`, state
the immediate objective as a verb aimed at a partner or concrete target, the
obstacle, the cost of failure, the physical business, the starting body state
and continuous eye life. Add subtext, status change and motivated distance when
they are present. Write behavior under pressure, not emotion labels.

`shots[].acting` IS the shot's cast list, and each entry points at a character by POSITION (`subjectRef`). A character is in the shot if and only
if they have an entry here — there is no separate list of who is present, so
"who is in this shot" and "how they play it" are one decision and cannot
disagree. Give each character in the shot exactly one entry. A shot with no
character in it takes `"acting": []`.

Only characters go here. Objects and locations go in `sceneryRefs`; pointing at a character from
`sceneryRefs`, or at a location from `acting`, is rejected.

Each acting object names a concrete `tactic`, observable behavior and visible
beat change; include listening or assessment behavior when another character
acts or speaks. Use `interruptedAction` when a physical task stops or changes at
the beat. Keep the master voice identity fixed; scene adaptation changes
behavior, not the character's voice.

There is no scene-level voice-profile list. A speaker's fixed vocal identity
travels on their dialogue line as `voicePrompt`, so a profile can never be
attached to a silent character and can never be missing for a speaking one.

## References

`references` contains 1–9 visible plates for this scene, ordered by importance:
subjects first and the single location last when a location is present. Include
only references visible or taking effect in a shot. Every reference must be
used by at least one shot.

**Every id must be DISTINCT — declare each subject exactly once.** `maxItems: 9`
is a CEILING for a crowded scene, not a target to fill. If this scene has two
characters and a location, `references` has 3 entries, not 9. Repeating an id
to fill unused slots burns H3's reference budget on duplicates of a cast you
already declared, and — because shots point at references by POSITION — makes
one character describable under two different `<Subject N>` numbers, which is
the exact contradictory-numbering failure this format exists to prevent.

Each reference has:

- `id`: the exact plain story-bible id; never invent a state id.
- `type`: exactly `character`, `object` or `location`.
- `appearsAs`: a concise visual description of the current visible state.
- `job`: what this plate must HOLD VISUALLY — the concrete features to preserve,
  as a lower-case noun phrase — "her face, the line of her jaw and the way the
  pallu sits on her shoulder", or "the cracked bronze plate and the copper wire
  at the jaw". NOT a narrative role: "the defiant smith refusing to surrender
  the Ember" is a character note, not a visual job, and gives the renderer
  nothing to hold.
- optional `retention`: one official marker: `fully_preserved`,
  `partially_preserved`, `attribute_transfer` or `weak_reference`.

Do not write `<Subject N>`, `<Picture N>`, `Image 1`, or any slot number in
`appearsAs`, `job`, `summary`, or any other field. The runner assigns those
labels after reference routing.

## Shots

`shots` is an ordered list of time-bounded beats. Use one entry per meaningful
shot, not one entry per reference and not one entry per spoken line.

Every shot requires:

- `id`: stable shot id from the scene plan.
- `startTime`: seconds from scene start. The first shot is exactly `0`; later
  values are strictly increasing. The runner formats later values as
  `[Shot N] At MM:SS.mmm`.
- `endTime`: greater than `startTime` and no greater than `duration`.
- `composition`: framing, viewpoint, scale and where each visible subject is —
  ONE definite answer. Never write alternatives ("in the background or
  periphery"); the renderer cannot choose between them.
- `acting`: the CHARACTERS in this shot — see below. A character is in the shot
  if and only if they have an entry here.
- `sceneryRefs`: the POSITIONS in `references[]` of the OBJECT and LOCATION entries visible in this shot. Never a
  character. Use `[]` when the shot shows none.

  Include an object here only when it MATTERS to this shot — handled, looked at,
  or the thing the beat is about. Do NOT list a fixture that is simply part of
  the room: it is already in the location plate, and citing it separately makes
  the renderer place it afresh in every shot, so it moves around the space
  between cuts.
- `action`: the state change, including what is true at the beginning and end.
- `cameraMotion`: exactly one controlled H3 term from the schema enum. Use
  `Static Shot` when the camera deliberately holds.
- optional `cameraAmplitude` (`small`/`large`) and `cameraSpeed` (`slow`/`fast`):
  the guide's other two camera dimensions. Omit them for medium amplitude and
  normal speed. The runner writes all three as natural English inside the shot.
- `sound`: physical, shot-synchronous sound for this beat.
- optional `transition`: for later shots, say what the cut reveals and why the
  new information is different. Omit it on the first shot unless needed.
- optional `dialogue`: typed dialogue objects owned by this shot.

Choose `shotStructure` from the beat, not from a planner's shot count:

- `continuous_moving`: exactly one unbroken take in which the camera travels.
- `locked_single`: exactly one unbroken, deliberately static take for one held
  beat.
- `multi_cut`: at least two shots joined by distinct cut events.

Two characters talking is `multi_cut` by default so both faces can be shown.
Use `continuous_moving` only when one camera move genuinely travels between
them. The runner rejects a structure/count mismatch and all non-increasing or
out-of-bounds shot times.

For every shot, cover the visible composition, subject placement, environment
and light, physical state change, controlled camera term and physical sound.
Keep those facts in their typed fields; do not assemble them into a prose
paragraph for another model to parse.

## Render complexity

`renderComplexity` is your judgement of how hard this scene is to RENDER, and it
sets the sampler step count directly — `simple` 4, `moderate` 6, `complex` 8,
`extreme` 10. You are the only one who can judge this: you wrote the shot list,
and nothing downstream can see from a shot count whether those shots contain one
woman at an anvil or forty skeletons overrunning a shield wall.

Judge it on what the renderer has to resolve, not on what the scene means:

- how many bodies are in motion at once, and how fast
- fire, smoke, dust, debris, sparks, water — anything with no fixed silhouette
- fine texture that has to survive being moved (embroidery, jewellery, hair,
  chainmail, feathers, filigree)
- how many surfaces a moving light source touches

`simple` — one or two figures, contained movement, stable light. A held beat, a
conversation across a table, a hand closing on an object.
`moderate` — several figures, or one demanding element: a fast camera move, a
single effect, a crowd held still in the background. A family argument in one
room; a character pushing through a doorway into a lit corridor.
`complex` — many moving figures AND a demanding element. A crowded wedding or
market with the camera moving through it; close combat; rain or fire lighting
the surfaces around it.
`extreme` — a mass of figures in motion with heavy effects and dynamic light: a
melee, a collapse, a firestorm, a procession in a downpour at night.

This costs real time, in both directions. A quiet scene marked `extreme` burns
GPU for nothing; a battle marked `simple` renders as mush. Do not inflate it
because the beat is dramatically important — importance is not difficulty.

## Audio sections and negatives

`overallSoundscape` is one short paragraph of scene-wide non-verbal ambience,
physical sounds and breathing. Use `N/A` only for genuine silence.

`nonDiegeticMusic` describes score the characters cannot hear: instrumentation,
speed, rhythm and dynamic change. Use `N/A` when there is no score.

**If this scene has NO spoken dialogue, `nonDiegeticMusic` MUST be `N/A`.** This
is not a taste rule. H3 synthesises one audio track for the whole clip, and with
no words anywhere in the prompt to anchor the vocal channel, a request for score
comes back as gibberish — sung or muttered voice-shaped noise over the music. It
is the same failure as describing someone speaking without giving their words.
A wordless scene with a score is ordinary cinema and H3 simply cannot do it: put
the mood in `overallSoundscape` as physical sound instead, and score it in the
edit if it needs scoring.

`negatives` is an explicit list of things H3 must not generate, such as
subtitles, extra people, anachronistic props, soft dissolves or a redesigned
reference. The graph has no negative-conditioning input, so the runner writes
these directions into the compiled positive prompt.

## The continuity chain — `continuationFrom` and `continuationAnchor`

A film is not a set of independent scenes. Every scene inherits a room from the
one before it, and every scene hands one on. These two fields ARE that chain,
and they are the difference between a film and four clips that happen to share
a cast.

The previous scene's finished prompt is supplied to you as
`{{scene_video_prompt}}`. It is an ARRAY holding the immediately preceding scene
and nothing else, so the previous scene's whole JSON is at `[0].content`, and
the ledger you need is `[0].content.continuationAnchor`. On the film's first
scene the array is EMPTY — that is the only case in which you omit
`continuationFrom`.

**`continuationFrom` is what you INHERIT.** Read the previous scene's
`continuationAnchor` and copy it into `continuationFrom`. Then OPEN YOUR FIRST
SHOT ON THAT STATE — the same landmarks in the same parts of the frame, the same
light, everyone standing where they were left. You do not need to write the
inherited state into your shot prose; the renderer states it for you, before
`[Shot 1]`. What you must do is not CONTRADICT it.

Three things follow from this, and each of them is a defect that shipped:

- **Someone in `offStage` is not in the room.** If they are in your scene, the
  audience must SEE THEM ARRIVE — walking in, opening a door, stepping out of
  the dark. A character who is simply present in your first frame after being
  off stage is the single most visible continuity break there is. Write the
  arrival as a beat with its own seconds.
- **A prop keeps the state it was left in.** If the previous scene poured the
  tea, the tea is poured. Do not reset it, do not re-pour it, and above all do
  not assert the opposite.
- **A landmark keeps its part of the frame.** If the stove was in the left
  third, it is in the left third. If your shot needs a different angle, MOVE THE
  CAMERA and say so — do not silently re-place the furniture.

If this scene genuinely does break from the previous one — a time skip, a new
location, a reset — that is legitimate, but you must DECLARE it: set
`continuationFrom.hardCut` to the break ("two hours later, the same kitchen")
and fill the other fields with the NEW opening state. Undeclared discontinuity
is the defect; declared discontinuity is editing.

**`continuationAnchor` is what you HAND ON.** It is required on every scene,
including the last. Describe the state at the moment your final frame ends:
every landmark and where it sits on screen, everyone visible and where they
stand, everyone off stage and why, the light in force, and the state of every
prop that was handled. Write it for a reader who has not seen your scene — the
next scene's author is exactly that reader, and this is all they get.

### `offStage` is the field that makes entrances happen — fill it

`characterPositions` lists who is VISIBLE, and those ids must be in your
`references[]`, because a visible character needs a plate.

**`offStage` is the opposite, and this is the part that is easy to get wrong.**
It lists characters who are NOT in this scene at all — and so are deliberately
NOT in your `references[]`, because no plate is passed for someone who is not on
screen. Do not leave it out because you cannot find the id in your references.
Look at the story: every named character in the film who is somewhere else right
now belongs here, with where they are and why.

A father alone on a terrace has a daughter one flight down in the stairwell. If
you do not say so, the next scene has no way to know she must be SEEN TO COME
UP, and it will simply open with her already standing there. That exact failure
is why this field exists, so an empty `offStage` in a scene where someone is
about to arrive is a defect, not a shortcut.

State only WHERE someone is and WHY. Never that they speak, call, whisper or
answer — a voice described with no words in `spokenLines` synthesises
speech-shaped noise, and this field is a common way to introduce one by
accident.

## Final checks before returning JSON

1. Every root field is allowed by the schema and there are no extra fields.
2. `spokenLines` contains only this scene's exact bare words.
3. Every spoken line is owned by exactly one typed shot dialogue object.
4. Every dialogue `exactWords` exactly matches its ledger entry.
5. Every `subjectRef` / `sceneryRefs` value is less than the number of entries you wrote in `references`, and every `references[].id` is distinct — no id repeated to fill slots.
6. Camera terms come directly from the enum.
7. The first shot starts at 0; later starts strictly increase; every end time
   fits inside `duration`.
8. `multi_cut` has at least two shots; either single-take value has exactly one.
9. No field contains subject-definition prose or reference slot numbering.
10. `renderComplexity` reflects RENDER difficulty, not story importance.
11. Every shot has both `acting` (its characters) and `sceneryRefs` (its objects
    and locations), each possibly `[]`. No character position appears in `sceneryRefs`
    and no object or location appears in `acting`.
12. Every dialogue line carries a `subjectRef`, an explicit `offScreen`
    (`true`/`false`) and a verbatim `voicePrompt`, and any line whose speaker
    has no `acting` entry in that same shot sets `offScreen: true`.

## Supplied context

Everything below is the material this scene must be authored FROM. The section
you are writing is the one whose `id` matches the collection item named at the
top of this prompt; find it in `scenes_plan.sections[]` and take its
`entities[]` as your reference allowlist, its shots as your cuts, and its
`spokenLines` as your exact dialogue ledger.

### Art style

{{art_style}}

### Story bible

{{story_bible}}

### Character state ledger

{{character_state}}

### Character acting profiles

{{character_acting_profile}}

### Narration

{{narration}}

### This section (`scene_detail`) — the ONLY section you author

{{scene_detail}}
