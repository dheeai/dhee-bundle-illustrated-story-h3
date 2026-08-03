You are building THIS CHAPTER's contribution to the STORY BIBLE — the canonical
VISUAL identity of everything that recurs in this story. Only TWO entities in the
whole film get real reference-image anchors (the primary and secondary anchor);
every OTHER character exists on TEXT ALONE, yet ALL shots — anchored or not — are
rendered by the SAME identity-edit model, which is always holding those two
references. A non-anchored character who resembles an anchored one WILL get the
anchor's face pasted onto them unless this bible makes them impossible to
confuse. The merged bible (every chapter's contribution combined) is the single
source of truth that every later image prompt copies from to stay consistent.

**Hard rule — every character must be VISUALLY UNMISTAKABLE from every other
character.** Differ on at least THREE of: build, age, hair, facial hair,
complexion, wardrobe palette. For EACH character, END the description with one
explicit "Distinguishing contrast:" sentence naming how they differ from the
character they'd most easily be confused with (e.g. two middle-aged policemen in
khaki MUST diverge: one heavy, mustached, bifocals; one lean, clean-shaven,
graying).

THIS chapter's prose (extract only what appears in THIS chapter):
{{chapter_text}}

This chapter's own metadata (find `{{item_id}}` in this array — title/summary/
word range):
{{chapters}}

Shared art style (for palette/era cues only — do not repeat it here):
{{art_style}}

## The previous chapter's bible — carry forward, never re-describe from memory

`{{chapter_bible}}` is an array, newest-first, holding the IMMEDIATELY PRECEDING
chapter's own bible output (its `content` field is that chapter's full bible
JSON). It is EMPTY for chapter 1 — there is nothing to carry forward yet.

**Critical instruction:** any character/object/location already defined in that
previous bible MUST be re-emitted here with its **exact same `id` and its
description copied VERBATIM, character for character** — never re-described from
memory, never given a new id. The merge step downstream keeps the FIRST
definition of every id across the whole film and silently drops every later
duplicate, so a drifted re-description here is not an improvement, it is a loss:
whatever you write will never be seen if a real change is needed, and if you
subtly reword an unchanged entity you have created a duplicate the merge just
discards anyway — so there is no upside to rewriting, only risk. Copy it exactly
as given.

Only entities that are genuinely NEW in this chapter — not seen in any earlier
chapter — get a newly authored description here.

Extract, as pure VISUAL descriptions:

- **characters** — every recurring person or creature THAT APPEARS IN THIS
  CHAPTER. For each NEW one, a fixed, story-wide visual identity: apparent age,
  sex, build/height, skin tone, face shape, distinctive features, hair (colour,
  length, style), signature wardrobe WITH its colours, and any defining
  accessory. Whatever a viewer must see to recognise them on sight. For each
  CARRIED-FORWARD one (already in the previous bible), copy its id + description
  verbatim — see above.
- **locations** — recurring places THAT APPEAR IN THIS CHAPTER: architecture or
  landscape, materials, palette, era, defining props and mood. Each NEW
  location's description must ALSO fix its LIGHTING REGISTER — time of day,
  light source, and quality (e.g. "single dusty sunbeam through a cracked east
  window, dim tungsten bulb overhead") — so every shot prompt set in this
  location inherits the same light.
- **objects** — key props THAT APPEAR IN THIS CHAPTER that must stay identical
  across plates (a specific lamp, a red coat, a sword): form, material, colour,
  size, distinctive marks. **A story-critical object — one the plot's actual
  physical action hinges on (dropped, caught, thrown, handed off, broken) — is as
  identity-critical as a character's face and must be pinned with the SAME
  rigor**: exact form/shape, material, colour, size, distinctive marks, PLUS how
  it is held/mounted (a handle, a stick, a cord, a ring at the top, a base it
  rests on) and how it is lit (its own light source if any, and how — e.g. "warm
  candlelight glows through its paper sides"). Fix every one of these details
  HERE, once, concretely — never leave one to be re-invented later. The edit
  model re-synthesizes pixels every shot, so any object detail left unspecified
  WILL drift. **Every story-critical object also gets its OWN rendered
  identity-anchor image, exactly like a character** — write each such object's
  `description` as a `visualAnchor`-suitable text-to-image prompt basis, fully
  specifying what the reference plate should show with nothing left ambiguous.

CRITICAL rules:
- VISUAL ONLY. No emotions, no plot, no actions, no "sometimes / later" — a fixed look.
- Mid-story appearance changes (a jacket comes off, an injury, wardrobe
  changes) are NOT bible entries — the character-state ledger downstream handles
  those. This bible records each character's canonical BASELINE look, the one
  they start the story in (or the one they were introduced with, for a
  later-appearing character) — never the changed state.
- Be CONCRETE and SPECIFIC for any genuinely NEW entity. If the story is vague
  ("a boy"), INVENT a definite, memorable appearance and commit to it.
- Give each NEW entity a short lowercase snake_case `id` (e.g. `jack`,
  `red_coat`, `lighthouse`). These ids are referenced by every later section.
- Include only what genuinely RECURS or matters visually; skip one-off
  background extras.
- If THIS chapter introduces no new entity of a given kind, output an empty
  array for it — do not invent one to fill the field.

Output ONLY the JSON object. `characters` AND `locations` are both REQUIRED
(may be empty arrays if this chapter introduces none) — the merged bible needs
at least one location, since each location gets a generated SETTING PLATE that
the video model uses as that shot's background reference. `objects` as
applicable.
