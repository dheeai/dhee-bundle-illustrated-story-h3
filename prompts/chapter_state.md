You are building THIS CHAPTER's contribution to the CHARACTER APPEARANCE STATE
LEDGER for an animated film — a single pass over ONLY this chapter's own shots
that folds wardrobe/prop/condition changes forward from wherever the previous
chapter left off, so every later shot (in this chapter, and every chapter
after it) knows exactly what each character currently looks like.

This chapter is `{{item_id}}`. Find it in the chapter list below for its own
title/summary/word range:
{{chapters}}

Story bible — the BASELINE canonical look of every character, before any story
event changes it. Chapter 1's characters start here; every later chapter's
characters start from where the PREVIOUS chapter's own ledger left them
instead (see the fold-forward section below):
{{story_bible}}

THIS chapter's own screenplay — the source of truth for WHEN each state change
happens in THIS chapter (read its "Continuity Notes" and "Scene By Scene"
sections for the exact moment a character sheds a jacket, picks something up,
gets soaked, etc.):
{{chapter_screenplay}}

THIS chapter's own shots — find every shot in the flat `shots` array below;
process ALL of them, and ONLY them, IN ORDER (by `scene`, then `shotNumber`).
Use each shot's `characterPresence`/`description`/`dialogue`/`speaker` to know
which characters are actually in frame:
{{chapter_shots}}

## Fold-forward — carrying the previous chapter's ledger across the boundary

`{{chapter_state}}` is an array, newest-first, holding the IMMEDIATELY
PRECEDING chapter's own ledger output (its `content` field is that chapter's
full ledger JSON — the SAME shape you are producing now). It is EMPTY for
chapter 1 — there is nothing to fold forward yet, so chapter 1's characters
start from their `story_bible` baseline instead.

**Appearance folds FORWARD across the chapter boundary, never resets.** Every
character enters THIS chapter in whatever state they ended the previous
chapter in — the previous chapter's ledger's LAST entry for that character (by
shot order) IS their starting point here, not the story-bible baseline (that
baseline applies to chapter 1 only, or to a character's very first appearance
anywhere in the film). Carry that state in unchanged and only change what THIS
chapter's own screenplay/shots actually change — do not invent drift, and do
not revert a change from an earlier chapter unless THIS chapter's material
explicitly reverses it.

A time-skip between chapters is exactly the kind of transition this fold must
survive. For calibration: a character who slept twenty years between chapters
wakes with a foot-long gray beard, ragged clothes, and a rust-encrusted prop
that were fine at the end of the previous chapter's ledger — that new state
must persist, unchanged, into every subsequent chapter's ledger until the
story changes it again. A signature like `rip__bearded_rusty_gun` must be
reused VERBATIM by every later chapter once it appears — never reinvented,
never quietly dropped back to the pre-sleep look.

## The fold — walk THIS CHAPTER's shots in order, once

For each shot, in THIS chapter's own order:

1. **Starting point**: this character's state as of the immediately PRECEDING
   shot they appeared in — either earlier in THIS chapter, or (if this is
   their first appearance in this chapter) the state they ended the PREVIOUS
   chapter in per `{{chapter_state}}`, or (chapter 1 only, or a character's
   very first appearance anywhere in the film) their `story_bible` baseline.
2. **Carry forward unchanged**: every wardrobe/prop/condition fact from the
   starting point stays exactly as it was UNLESS THIS chapter's screenplay
   names a change that lands at or before this shot and has not since been
   reversed/replaced. Default to "nothing changed" — do not invent drift the
   screenplay didn't author.
3. **Apply a change** the first shot where it becomes visually true (per the
   screenplay's scene placement), and then keep it applied to every later shot
   of that character — in this chapter, and carried into every later chapter's
   fold — until the screenplay authors a further change. A change that
   happened earlier, whether in this chapter or a previous one, is now simply
   part of their current look — restate it in full, don't treat it as news.
4. **Only include characters actually present** in this shot (per its
   `characterPresence`/`description` — a `"none"` shot or one this character
   doesn't appear in gets an empty or shorter `characters` array; never
   fabricate a presence to give them an entry). **A `"none"`-presence shot is
   NOT an excuse to omit the shot's ENTRY from `shots` — the shot still needs
   an entry in the output array, it is just `{ "shotId": "...", "characters":
   [] }`.** "Nothing to report for this character" means an empty array, not
   a missing entry — the two are not the same thing, and a missing entry
   breaks the schema and every downstream consumer of this ledger.
5. Do **NOT** track position, blocking, camera, or where someone is standing —
   appearance only (wardrobe, held/carried props, physical condition: dirt,
   wet, wounds, hair). Position is a different concern, not this ledger's job.

## Output, per shot

For each shot, for each present character, give:
- `appearance`: the FULL current description, standalone — wardrobe with
  colours, every prop currently held/carried, and condition (dirt/wet/wounds/
  hair-state) — written as if this were the only sentence describing them, not
  a diff against a prior shot OR a prior chapter. Someone reading only this
  field must be able to picture them exactly, with no need to consult any
  earlier shot or chapter.

  **A wearable prop must have exactly ONE unambiguous state per shot.** Name
  the specific place it currently is, explicitly — e.g. "reading glasses
  pushed up on her forehead" OR "reading glasses hanging from a cord around
  her neck" — never both, and never a vague phrase ("her glasses") that could
  be read either way. A prop the ledger leaves ambiguous about WHERE it
  currently is is the failure mode: a real observed failure had a character's
  glasses rendered both on her face AND hanging around her neck in the same
  frame, because the ledger's wording didn't pin down which. Pick the ONE
  state the screenplay actually supports at this shot and state it plainly;
  carry that exact state forward (per the fold rules above) until the
  screenplay authors a change to it.

  **A held/carried story-critical object must restate its story-bible
  description VERBATIM, not reinvent it.** Copy the object's fixed
  form/material/colour/size/mounting/lighting straight from the story
  bible's `objects` entry into this shot's `appearance` (e.g. "carrying the
  cream-cylinder paper lantern with its metal ring top and X-cross frame,
  glowing warm from within") rather than re-describing it from memory each
  shot. Treat a story-critical object's identity with the same rigor as a
  character's face: the edit model re-synthesizes pixels every shot, so any
  detail this ledger leaves for a shot to reinvent WILL drift.
- `signature`: a short, stable lowercase key for this exact state. **The SAME
  visual state MUST produce the SAME signature across every chapter** — a
  deterministic dedupe pass downstream keys on this field to decide whether a
  new identity-edit plate is needed; a drifted signature (the same look
  written under two different keys) silently generates a redundant,
  unnecessary plate. Reuse it VERBATIM across shots AND across chapters while
  the state is unchanged; only change it when the appearance changes in a way
  that clears the MATERIALITY BAR below — **`appearance` itself never gates on
  this bar and stays full-fidelity regardless; only `signature` does.**

## Materiality bar — when `signature` may change, and when it must not

Every new `signature` costs a full identity plate downstream: four separate
image edits plus a recomposite, per state, every time. Minting one for a
change nobody would notice on the actual rendered frame is pure waste — and it
has actually happened: a real run of this bundle minted 12 distinct states for
one character where only about 4 were materially different identity changes;
the rest were the SAME gun held in a different spot, a nap, and a facial
expression, each burning a full plate for nothing.

**This gate applies ONLY to `signature`. It never applies to `appearance`.**
`appearance` keeps describing everything — the oily hand, the gun clutched to
the chest, the exhausted posture — in full, because `shot_brief` and
`shot_video_prompt` read `appearance` to write per-shot text, and that detail
is genuinely wanted there. `signature` is narrower: it names which IDENTITY
PLATE this shot needs, and a plate only needs to change when what the plate
ITSELF depicts changes.

**Only TWO categories of change ever earn a new signature. If a change is not
one of these two, it is NOT material, no matter how it might feel otherwise:**

1. **CLOTHING** — the garments themselves change: put on, taken off, or
   replaced. A coat going on, a coat coming off, jeans-and-top replaced by a
   saree, donning an exoskeleton or armour. This also covers the WHOLE
   garment becoming soaked/coated across the entire figure (not a localized
   patch) — but see the degree-of-degree exclusion below: once that has
   happened, further fading (soaked → damp → drying) is NOT a further
   clothing change.
2. **BODY PHYSIQUE** — the body itself changes: an amputated hand or leg, the
   character morphing into another being entirely, hair/a beard growing out
   to a degree that changes the head/face's form, or any other drastic
   change of build.

MINT A NEW SIGNATURE only for one of those two. Everything else below is
explicitly OUT, even where an earlier, looser version of this rubric admitted
it:

DO NOT mint a new signature for:
- **carried or held items, at all, regardless of size** — a keg, a rifle, a
  lantern, a cloth bundle, a letter, a key: NONE of these earn a signature,
  whether acquiring them, losing them, or however they are held. (This
  REVERSES an earlier version of this rubric that treated a large carried
  item's presence/absence as material — it does not, under the current,
  tighter rule. Only clothing and physique count.)
- WHERE an already-present prop is held — shouldered, clutched to the chest,
  resting on the ground, propped beside them, handed over, received — all the
  SAME signature (this was already excluded, and now the carried item itself
  is excluded too, so this line rarely even comes up)
- pose, posture or action — standing, walking, asleep, collapsed, exhausted
- expression or emotion — fearful, cowering, smiling, weeping
- minor accessories — a bangle, a ring, different shoes, a hat
- localized soiling or wetness — an oily hand, muddy boots, a stained sleeve
- **degree-of-degree on an already-changed condition** — soaked → damp →
  drying is ONE signature throughout; once a clothing/physique change has
  earned its signature, further intensifying or fading that SAME condition
  never earns another one. Keep the wettest/strongest description in
  `appearance` and reuse the one signature.

**Supporting intuition, not the primary test:** this identity plate is
consumed by the video model at 1280x736, where each of the four views is
roughly a 320px-wide figure. Most of the excluded categories above (a letter
in a pocket, a key in a hand, a bangle) also happen to fail a plain "would
this be visible on a 320px figure" gut check — that correlation is WHY they
feel obviously excluded, but the actual test is always the two categories
above, not pixel size. A full coat or a saree also happens to pass that gut
check, which is a useful sanity cross-check, never the rule itself.

There is no cap of any kind on how many distinct signatures a character may
accumulate over a story — mint as many as the story's actual clothing/physique
changes genuinely require. This bar is about PRECISION (only mint for the two
categories above), never about limiting the count.

### Worked examples — real cases from this bundle's own runs

KEEP (these earn a signature):
- `arun_oilskins` ← changedThisShot: "puts on oilskins" — **CLOTHING**, garment
  put on.
- `arun_soaked` ← changedThisShot: "removes oilskins, clothes become soaked" —
  **CLOTHING**, garment removed AND the remaining clothing soaked through
  across the whole figure.
- `arun_grey_coat` ← changedThisShot: "puts on stiff grey coat" — **CLOTHING**,
  garment put on.
- `arun_coat_removed` (renamed from an earlier, misleading `arun_holding_coat`
  — name it for the REMOVAL, not for the holding that follows) ←
  changedThisShot: "removes grey coat, now holding it" — **CLOTHING**, garment
  removed. (The fact that he is now HOLDING it is not what earns the
  signature — removing it is. If he later shifted it to under his arm, that
  would NOT earn another signature — see the carried-item exclusion above.)

DROP (these do NOT earn a signature — real ledger entries that WRONGLY minted
one under an earlier, looser version of this rubric):
- `meera_satchel_clutched` ← changedThisShot: "clutches satchel to chest" —
  a carried item's POSITION. Not clothing, not physique. DROP; fold back into
  whatever signature she already had, with `appearance` updated to mention
  she is now clutching the satchel.
- `arun_soaked_lantern` ← changedThisShot: "holds hand-held lantern" — a
  carried item. Carried items NEVER earn a signature now, regardless of size.
  DROP.
- `meera_cloth_bundle` ← changedThisShot: "carries cloth bundle" — a carried
  item. DROP.
- `arun_damp` ← changedThisShot: "clothes become damp" — a degree-of-degree
  fade on the SAME clothing that was already soaked (`arun_soaked`); the
  garments themselves did not change again. DROP; keep signature `arun_soaked`
  and, if wanted, note the drying in `appearance` only.
- `arun_letter_pocket` ← changedThisShot: "tucks official letter into shirt
  pocket" — not visible at all (inside a pocket), and not a clothing or
  physique change either way. DROP.
- `meera_damp_dress` ← changedThisShot: "dress is damp and clinging" — this
  LOOKS similar to `arun_soaked` but is NOT the same case: her dress never
  came off, went on, or was replaced — it only got wetter. That is a
  degree-of-wetness change on UNCHANGED clothing, which is excluded, unlike
  `arun_soaked` where the oilskins actually came off. DROP.
- `meera_holding_key` ← changedThisShot: "receives brass oil store key" — a
  carried/held item. DROP.
- **Superseded call:** an earlier version of this rubric's own worked example
  said "picks up a keg" (a carried item's presence) DOES earn a signature. It
  does NOT, under the current rule — carried items are excluded categorically
  now, however large. If a keg is ever picked up again, that is now a DROP
  case exactly like the ones above, not a KEEP case.

Kept from the original worked examples, still correct under the tightened
rule: `rip__asleep` — no (pose, not clothing/physique).
`rip__bearded_rusty_gun`'s BEARD half is still a correct mint — a foot-long
gray beard grown from clean-shaven is a BODY PHYSIQUE change (it permanently
changes the head/face's form). Its GUN half is not itself what earns the
signature (a carried item never is); the beard alone is sufficient.
- `changedThisShot`: a short phrase naming what changed AT this shot (e.g.
  "grows long gray beard", "picks up torch") — or the literal string `"none"`
  if this shot carries the state forward unchanged (whether from earlier in
  this chapter, or folded forward from the previous chapter).

Output ONLY the JSON object matching the required schema. `chapterId` MUST be
exactly `{{item_id}}`. `shots` must have EXACTLY ONE entry per shot in
`{{chapter_shots}}`'s `shots` array, in the SAME order — cover EVERY shot in
THIS chapter and ONLY this chapter's shots; never invent a shot, never skip
one, never include another chapter's. **This includes every shot whose
`characterPresence` is `"none"` — that shot gets its own `{ "shotId": ...,
"characters": [] }` entry exactly like any other, it does not get left out of
`shots` just because it has no characters to report.** A real run of this
prompt has omitted `"none"`-presence shots from `shots` entirely — that is a
bug in the OUTPUT, not a reasonable reading of this instruction: this ledger
is a per-shot array, not a per-character-appearance array, and every shot
belongs in it.
