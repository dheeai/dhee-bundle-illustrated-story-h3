You are the SECOND pass, filling in FULL detail for ONE section (scene) of a
narrated, animated film. A first pass already produced the film's outline
skeleton (a title plus one short brief per section); a deterministic merge
step then injected a duration BUDGET onto each section. Your job is to expand
YOUR assigned section into full prose, a scene brief, and its shots — each
shot being one self-contained 4-10 second clip that the video model animates
on its own.

Story bible (recurring visual identities, with ids):
{{story_bible}}

## You are NOT given the screenplay. Your dialogue is in your own section.

There is deliberately no screenplay in this prompt. The outline pass held each
chapter's screenplay while it decided where that chapter's section boundaries
fell, and it recorded the lines belonging to each beat on that section's
**`spokenLines`** field. So:

- **Your section's `spokenLines` IS your dialogue** — the complete and only set
  of words spoken in your section. Copy each entry VERBATIM into the `dialogue`
  of the shot where it is spoken: same words, same punctuation, same language.
  Never translate, tidy, shorten, or invent a line.
- **Each entry appears in EXACTLY ONE shot. Never put the same line on two
  shots.** A line spoken twice is a line the audience hears twice in a row, and
  it reads instantly as a bug. If you have ONE line and TWO shots, the line goes
  on ONE of them and **the other shot carries no `dialogue` and no `speaker` at
  all** — it is a reaction, an action, a held look, whatever the beat needs
  visually. Silence in a shot is normal and correct.
- **Never repeat a line to fill a shot.** The number of shots and the number of
  lines are independent: shots come from `targetShotCount`, lines come from
  `spokenLines`. Extra shots are wordless; they are not slots that must be filled.
- **Lines go in spoken order**, one per shot, across the shots that do speak. A
  speaker change is a new shot, so two entries by different speakers need two
  shots. Do not merge two entries into one shot's `dialogue`.
- **An empty `spokenLines` means nobody speaks in your section.** Emit no
  `dialogue`/`speaker` on any shot. Do not invent speech to fill a silence.
- **Another section's `spokenLines` is not available to you and not yours.** You
  can see the other sections' briefs below for continuity, but their lines belong
  to them.

Everything else — blocking, wardrobe and prop state, what physically happens —
comes from your own section's `brief` and `entities`, expanded with your own
craft. If your beat clearly continues a physical state the previous section
established (a door already open, a bag already carried), honour it from that
section's `brief`; do not restage the moment that created it.

**Why the screenplay was removed.** This pass used to receive the whole
whole-film screenplay — 73KB, no section markers, and beat headings that appear
nowhere in the outline. Finding "which lines are mine" in it was genuinely
ambiguous at a section boundary, so two adjacent sections would each stage the
same beat and quote the same line, and the finished film played it twice.
Measured on a 134-section film: 13 lines duplicated across sections, including a
whole three-shot block staged in both `scene_13` and `scene_14`. Reading your
lines from your own section instead makes that impossible rather than merely
discouraged — and it is why inventing or borrowing a line here is a serious
error, not a small liberty.

The film's full outline (skeleton for every section, for continuity — you are
expanding ONLY the ONE section identified at the end of this prompt; do not
write another section's content):
{{scene_outline}}

## YOUR SECTION'S BEATS ARE FENCED — never stage another section's material

The outline above lists EVERY section of the film, and you can see all of them.
That is deliberate: you need them for continuity. But it creates the worst
failure this pass has, so read this carefully.

**Every beat named in another section's `brief` belongs to THAT section and must
not appear in your shots.** Your shots cover ONLY what YOUR OWN section's
`brief` names — nothing before it, nothing after it, nothing from elsewhere in
the film.

Before writing any shot:

1. Locate your own section in `sections` by the `id` given at the end of this
   prompt and re-read its `brief`. That one sentence is the complete and only
   licence for what you may stage.
2. Read the `brief` of the section immediately BEFORE yours and the one
   immediately AFTER yours. Those are the beats you are most likely to steal.
   Treat them as OFF LIMITS.
3. Write shots for your own brief's action only — not a lead-in to it from the
   previous section, not a preview of what comes next.

**Do not add lead-in or anticipatory shots.** A shot that establishes what the
previous section already showed duplicates that section. A shot that dramatises
what the NEXT section's brief describes steals that section's material — and
that section will then stage it properly anyway, so the finished film plays the
same action twice in a row, with the same staging and the same dialogue.

**This is a MEASURED failure, not a hypothetical.** In a shipped 97-section
film, a section whose brief covered nothing but a character arriving at a
building emitted shots staging two unrelated beats that belonged to later
sections — an object being arranged, and a liquid being poured. Those later
sections then staged the same beats, correctly, as was their job. One of the two
turned up a third time later still. The viewer reads that instantly as a bug.
Duplication of this kind scales with section count, so long films are where it
does real damage.

If your brief's action appears to CONTINUE something the previous section was
doing, do NOT restage the shared moment in order to establish it. Open at the
next distinct moment of your own brief and let the cut carry the continuity.

**Self-check before emitting:** for every shot you have written, can you point
at the words in YOUR OWN brief that licence it? If a shot's justification lives
in a neighbouring section's brief instead, delete it and spend that duration on
your own material.

Chapter metadata (informational only — this section's own duration budget is
already computed for you; see below):
{{chapters}}

## This section's duration budget — already computed, read it, don't recompute it

Find THIS section's own entry in `{{scene_outline}}`'s `sections` array above
(match by `id`, the one identified at the end of this prompt). It carries two
fields a deterministic merge step already computed from this section's own
chapter's real seconds budget — `budgetSec` (this section's total seconds) and
`targetShotCount` (exactly how many shots to emit). These are NOT a suggestion
you re-derive by dividing the whole film's length by the section count — they
are already the correct, chapter-scoped numbers, computed once outside this
prompt so this pass never has to do that arithmetic (a real regression: an
earlier version of this prompt asked the model to compute this arithmetic
itself, and it was not reliably followed — films ran 2-4x over their target
length). See "Shots" below for exactly how to use `budgetSec`/`targetShotCount`.

If, unusually, this section's outline entry has NEITHER field (this only
happens if its chapter's own duration metadata was itself missing — an
anomaly), fall back to pacing this section at roughly 10-16 seconds in 1-2
shots, same as any other section.

Narrator voiceover enabled for this project: {{narration}}
(Informational only, for continuity/tone — it does NOT change which shots
carry `dialogue`/`speaker`/`emotion`: that is driven purely by this section's
`mode`, exactly as classified in the outline above. See "Mode" below.)

## Your job for THIS section only
Produce ONE fragment: `{ "section": {...}, "shots": [...] }` for the ONE
scene identified at the end of this prompt (find it in the outline's
`sections` array by id). Do NOT reclassify its `mode` — carry the outline's
`mode` value forward unchanged, and do NOT include any other section.

## STAY STRICTLY INSIDE THIS SCENE'S BOUNDARY (hard rule — read twice)
The other sections' briefs in the outline above are context for CONTINUITY only
— they are NOT a menu of beats to borrow from. Two limits, both hard:

1. **Only this scene's cast.** Every person, hand, finger, or figure depicted
   in ANY of this section's shots MUST belong to a character in THIS scene's
   own `entities` list (the outline entry for this scene id). NEVER introduce a
   character the outline did not place in this scene — no customer, bystander,
   passer-by, buyer, or other named character whose id is absent from this
   scene's `entities`. If this scene's entities name only `sakhubai` (plus
   objects/locations), then ONLY sakhubai may appear — a "youthful manicured
   finger", a stranger's hand, or anyone else is FORBIDDEN here.
2. **Only this scene's own action.** Each action beat belongs to exactly ONE
   scene. Depict ONLY the events YOUR OWN section's `brief` names. Do NOT
   preview, pull forward, or DUPLICATE a beat another section's `brief`
   describes. If a customer pokes and tastes the fish, or
   money changes hands, in a LATER scene, those shots belong to that later
   scene ALONE and must not appear here. Two scenes must never share the same
   action — if you have already (or will) render a beat in its own scene, it
   cannot also live here.

3. **Do NOT pad the shot count with borrowed beats.** Emit only as many shots
   as THIS scene's OWN `brief` and `spokenLines` support. If this scene's own
   beats are few, emit FEW shots (as few as 1–2) — that is correct and strongly
   preferred over reaching a higher count by importing an action another
   section's `brief` names. A quiet solo setup scene (unloading, arranging,
   sprinkling water, calling out) is COMPLETE at its own last beat; do not
   append a fish-inspection, a customer poke, a sale, or a "showing/quality
   check" that actually belongs to a later scene just to add shots.
4. **A shot must never contradict its own cast.** Every hand/finger/figure you
   describe must match the physical identity of the character it belongs to
   from the story bible. Do NOT describe, e.g., a "slender, manicured, youthful"
   finger and then attribute it to a weathered elderly character — that betrays
   a beat you borrowed from another character. If the hand isn't this scene's
   character's own hand, the beat isn't this scene's.

Self-check before you emit: for every shot, ask "is this shot's subject a
character in THIS scene's `entities`, doing an action MY OWN `brief` licences,
speaking only a line from MY OWN `spokenLines`, described consistently with that
character's own body?" If not,
DELETE that shot (do not replace it just to keep the count) — for a solo setup
scene, the seller alone laying out, arranging, sprinkling, calling out IS the
whole scene; a customer interaction or fish-quality inspection that happens
later must not appear here.

**Then one last check, on dialogue specifically.** List the `dialogue` values you
just wrote across all your shots. Is any line there TWICE? If so, delete it from
all but one shot and leave those shots wordless — do NOT swap in a different line
to keep them speaking. This is the single most common way this pass has broken:
a section with one `spokenLines` entry and two shots put the same line on both,
and the finished film said it twice in a row. Shots outnumbering lines is normal;
wordless shots are correct.

### `section`
- `id`: copy verbatim from the outline skeleton (`scene_<N>`).
- `heading`: copy or lightly polish the outline's heading.
- `text`: the actual story PROSE for this beat — kept intact and readable
  (2–4 short paragraphs, separated by a blank line). This is displayed
  verbatim to the reader, so preserve the author's words and voice; do NOT
  summarise the story away.
- `caption` (optional): a terse place/moment label (e.g. "Dawn, the gallery
  rail").
- `sceneBrief`: expand the outline's short `brief` into a fuller prose
  description of the strongest visual EVENT this section's shot(s) depict —
  name the ACTION as the subject of the frame (a fist knocking on a door, oil
  pouring into a lamp, a wave rising with a distant answering light), not a
  character standing or looking at something. See "Shots are ACTIONS, not
  portraits" below — the same rule applies here.
- `mode`: copy verbatim from the outline (`"narration"` or `"dialogue"`).
- `emotion`: copy VERBATIM from the outline — like `mode`, do not reclassify
  it. This is the ONE feeling this section serves; every shot's framing,
  lighting and motion in this fragment must be built to support it.
- `entities` (optional): the bible ids (characters/locations/objects) VISIBLE
  across this section's shots — start from the outline's list, refine if
  needed. List EVERY character physically present in the beat, including
  anyone the speaker talks to.

## Framing serves the emotion
Choose each shot's framing by what this section's `emotion` needs the audience
to read: a CLOSE-UP reveals a subtle facial expression or inner feeling; a
MEDIUM shot balances character and environment; a WIDE shot emphasizes
isolation or scale. Pick the size the emotion calls for, not the size that's
merely convenient.

VARY shot sizes across this section's shots — and expect consecutive sections
to differ too. A run of identical framings reads flat no matter how good each
individual frame is. In a dialogue exchange, alternate framings (over-the-
shoulder / reverse / reaction insert) rather than repeating the same medium
shot for every line.

Wardrobe and appearance stay EXACTLY as the story bible fixes them. Any change
of costume or state (dust, an injury, rain-soaked clothes) must be a
deliberate, story-motivated beat, named explicitly in the shot's
`description` — never incidental drift between shots.

## Shots are ACTIONS, not portraits
Every shot's `description` (and the section's `sceneBrief`) must be framed
around the ACTION/EVENT of the moment — the verb — not a posed character.
Compare:
- WRONG: "Mira stands on the rocks, looking out at the storm."
- RIGHT: "A weathered fist pounds on the heavy iron door, three hard knocks
  over the roar of the storm."
The environment, the object, the hands doing the thing — THAT is the subject,
not a character standing in front of the camera.

For a multi-shot beat (2–3 shots), the shots are successive STATES of that ONE
action — a before/after/during progression (e.g. shot 1: the fist mid-knock
against the door; shot 2: the door already heaving open) — never a still
portrait followed by an unrelated one.

## Never split a continuous physical INTERACTION across a shot cut

A single continuous physical INTERACTION — a catch, a grab, an interception, a
collision, a hand-off, someone breaking a fall, one object striking another —
must be contained in ONE shot. The moment of CONTACT is the payoff and must be
INSIDE a shot, never sitting on the cut between two shots. If the beat
genuinely needs more than one shot, the shot that follows must OPEN at the
instant of contact (hands already closing on the object mid-air), not after it
has resolved — a shot that opens on the aftermath silently deletes the event
the audience came for.

This is a real observed failure, not a hypothetical: a shot showing a lantern
mid-fall was once followed by a separate shot that opened with the lantern
already caught and cradled on the ground — the catch itself (hands meeting the
lantern mid-air) was never in either shot's `description`, so the finished
clip read as the object teleporting. When this section's action includes a
catch/grab/collision/hand-off, put the moment of contact explicitly in one
shot's `description` (e.g. "a lunging hand closes around the falling lantern
inches from the stones") rather than letting it fall between two shots.

**A shot containing a contact moment must be given enough `duration` to play
the whole interaction — approach, contact, and follow-through — inside that
one shot.** 8-10 seconds. The contact is the payoff of the beat; if it lands
on a cut it does not happen at all, because the next clip knows nothing about
this one.

**Do NOT show a character before the story actually introduces them.** If a
character is only revealed later, this section's shots must NOT depict them at
all if this beat comes before that reveal — describe the event from the OTHER
side (the door, the knock, the storm, the person who doesn't yet see them)
rather than jumping ahead. Check the story for exactly when a character first
becomes visible, and keep this section's shots free of them if it's too early.

## Mode — carried forward, not reclassified
This section's `mode` (`"dialogue"` or `"narration"`) is already fixed by the
outline above — copy it verbatim into `section.mode`. **The sole source of
truth for spoken lines is the per-SHOT `dialogue`/`speaker`/`emotion` fields
below — there is no section-level dialogue field.** The video model never
reads anything at the section level; every line that must actually reach the
video has to live on the shot that delivers it. A `narration`-mode section's
shots must NOT carry `dialogue`/`speaker`/`emotion` at all.

**If you set `mode: "dialogue"` on this section, AT LEAST ONE of its shots
MUST carry the actual spoken line in `dialogue` plus who says it in
`speaker`.** A shot's `description` merely implying speech ("she speaks to
deliver the line") is NOT a substitute for the line itself — the line has to
be written out, verbatim, on a shot's `dialogue` field, or it never reaches
the render at all.

## One speaker per shot
A change of speaker is a VISUAL change, so it MUST be its own shot (its own
frame) — never let two different speakers' lines share one shot. A two-person
exchange (e.g. "How could you leave?" / "I had no choice.") becomes two
consecutive shots: one framing speaker A delivering their line, then a new
shot framing speaker B delivering theirs. This composes with the "never show a
character before the story introduces them" rule and the multi-shot
before/after/during progression rule above — a speaker change earns its own
still.

## Shots — exactly `targetShotCount` ordered shots for THIS section
Bring THIS section to life in exactly `targetShotCount` shots (see "This
section's duration budget" above — read it from this section's own outline
entry, do not guess), each a self-contained 4-10 second clip summing to about
`budgetSec`. `targetShotCount` is usually 1 or 2 — a section is roughly
10-16 seconds of film, so 3 is already a busy section. Never pad with a shot
that doesn't show something new; if `targetShotCount` gives you more room
than this beat's own action needs, prefer fewer/longer shots over padding.

A dialogue EXCHANGE is NOT one-shot-per-utterance in this film. The film
renders SILENT — no audio, no lip-sync — so cutting on every speaker change
buys nothing and costs a lot: each cut is a hard discontinuity with no
carried state. Cover an exchange in ONE or TWO shots that hold both parties
in frame (a two-shot, or one over-the-shoulder plus one reaction), and let the
BODIES carry the exchange — the gesture, the posture shift, the moment a line
lands on the listener's face. A 4-line back-and-forth is one 8-10 second
two-shot, not 4 shots.

Emit every shot for THIS section — and ONLY this section — in the fragment's
`shots` array:
- `id`: **exactly** `scene_<N>_shot_<shotNumber>`, where `<N>` is this
  section's own number, e.g. the 2nd shot of section `scene_3` is
  `scene_3_shot_2`. This id is load-bearing — get the format exactly right.
- `scene`: this section's number (int) — must match `<N>` above exactly.
- `shotNumber`: 1-based position of this shot within this section.
- `duration`: seconds this shot runs. **Valid range is 2 to 10, working range
  4 to 10.** Each shot is rendered as its own independent clip with a hard
  10-second ceiling, so `duration` is a real technical parameter, not just
  pacing notation. Never go below ~4s — LTX renders very short clips poorly
  and it wrecks pacing.

  **Prefer FEWER, LONGER shots.** Every shot boundary is a hard cut across
  which nothing carries — not blocking, not position, not the state of any
  object. So each extra shot is an extra discontinuity the audience has to
  absorb. A beat that would once have been three 3-second shots should now be
  ONE 9-second shot that plays the whole beat continuously. That is better
  film AND fewer renders.

  **You do NOT choose the shot COUNT freely — it is already given to you.**
  This section's outline entry (found in `{{scene_outline}}`, see "This
  section's duration budget" above) carries `targetShotCount` — emit EXACTLY
  that many shots — and `budgetSec` — their `duration`s must sum to
  APPROXIMATELY that number (within about a second is ideal; never wildly
  off). Do not pick a shot count because a beat "feels bigger" or "has three
  beats" — `targetShotCount` is the answer; compress or combine beats to fit
  it (a 4-10 second shot comfortably holds two or three beats). The ONE
  exception is physical continuity, below.

  **NEVER emit a shot shorter than 2 seconds. The schema rejects it and the
  whole section fails.** This bites when `budgetSec` does not divide evenly into
  the 2-10 range. If honouring `budgetSec` exactly would leave a remainder under
  2 seconds, DO NOT emit that remainder as its own tiny shot — absorb it, or
  drop it.

  Worked example, because this is the exact case that has failed a run:
  `budgetSec` 11.3 with `targetShotCount` 1. One shot cannot be 11.3s (the
  maximum is 10). The WRONG answer is two shots of 10 + 1.3 — that 1.3 is below
  the minimum and the section is rejected outright, three attempts in a row,
  killing the run. The RIGHT answer is **a single 10-second shot**: come in
  1.3s under budget and let it go. Being slightly under `budgetSec` is always
  acceptable; a sub-2-second shot never is.

  The rule in general: `budgetSec` is a target, the 2-10 range is a HARD limit,
  and when they conflict the range wins. Round down to whole shots that fit and
  accept the shortfall.

  In practice: if `targetShotCount` is 1, that one shot's `duration` is
  `budgetSec` itself (clamped into 4-10 if `budgetSec` falls outside that
  range). If `targetShotCount` is 2 or 3, split `budgetSec` roughly evenly
  across them (e.g. `budgetSec` 15 over 2 shots → two shots of about 7-8s
  each), still clamped into 4-10 each. Example: `budgetSec: 9,
  targetShotCount: 1` → one 9s shot. Example: `budgetSec: 17,
  targetShotCount: 2` → two shots of about 8-9s each, summing to ~17.

  **Physical continuity outranks the budget.** If a continuous interaction
  (a fall and its catch, a hand-off, an impact) needs 10 seconds to play
  whole, give it 10 seconds even if that overshoots `budgetSec` for this one
  section — a small overshoot on ONE section is fine and expected; splitting
  the interaction across two shots to stay on-budget does not cost you a
  slightly awkward cut, it deletes the interaction outright, because the
  second clip knows nothing about the first.
- `description`: the ONE distinct ACTION/EVENT this shot shows, verb-first and
  concrete — e.g. "a fist pounds three times on the heavy iron door" or "oil
  streams from the flask into the lamp's reservoir." NOT a character standing
  or looking (see "Shots are ACTIONS, not portraits" above). If a character
  isn't yet introduced by the story at this point, they must not appear here.
- `cameraWork` (optional): a short framing note, e.g. "low angle, slow
  push-in." Every move needs a purpose — use this vocabulary: push-in=builds
  emotional intensity, pull-back=distance or closure, lateral drift=quiet
  observation, dolly=momentum, static=emphasizes stillness. Default to
  static/locked-off; add at most ONE purposeful move when the section's
  `emotion` actually calls for it. Excessive camera movement is a common
  mistake — do not stack moves.
- `dialogue` (optional, ONLY in a `dialogue`-mode section, on the ONE shot
  that delivers this line): the EXACT clean spoken words for this shot — one
  speaker's utterance only (may be more than one sentence by that SAME
  speaker). No inline tags, no stage directions, no ellipses ("..."); if the
  character trails off, end the sentence a different way (a dash, or just
  stop it cleanly) instead of "...". The film renders SILENT, so this text is
  never spoken — it is here to tell the video-prompt stage what the beat is
  about (so it can direct the gesture, the delivery posture, and the moment
  the line lands on the listener) and to feed a later audio pass. Write it as
  the real line regardless.
- `speaker` (required whenever `dialogue` is set): the bible character id who
  speaks this shot's `dialogue`.
- `emotion` (required whenever `dialogue` is set): a short natural-language
  descriptor of HOW the line is delivered (e.g. "warm, tender", "breathless,
  relieved") — feeds the video model's "in a `<emotion>` voice" delivery.
  Never the spoken words themselves.
- A speaker change does NOT require a new shot. The film is silent, so an
  exchange is better covered by one longer two-shot than by cutting on every
  line — see the exchange rule above.
- **Give a physical beat the seconds it needs.** There are no keyframe guides
  in this pipeline — the video model invents all the motion between the start
  and end of a shot from your `description` alone. A multi-stage physical
  action (a lunge, a catch, a fall, a scramble, an object arriving in a hand
  mid-motion) needs 8-10 seconds AND a `description` that names its stages in
  order. Crushing such a beat into 4 seconds is what makes motion melt: the
  model must compress several distinct body poses into too little time.
  A held look or a quiet reaction is fine at 6s, but describe what physically
  changes within it — a breath, a shift of weight, the eyes moving — or it
  renders as a frozen frame.
- A `narration`-mode section's shots must NOT carry `dialogue`/`speaker`/
  `emotion` at all (omit them) — those beats are narrator VO or
  ambient-only, regardless of the `{{narration}}` flag above (that flag only
  affects whether the ASSEMBLED plan later gets a narrator voiceover, not
  whether a character speaks in this beat).
- **Framing a speaking beat:** the `description` may show the visual moment
  of speaking (mid-gesture, leaning in, the listener reacting) but must NOT
  restate or quote the actual words — those live only in the shot's
  `dialogue` field. There is no lip-sync in this film, so a speaking shot is
  NOT required to frame the speaker's mouth: frame whatever the beat is
  actually about, including the listener's face if that is where it lands.
- `characterPresence`: **`"none"` or `"character"`** — what the still-prompt
  step promises about who's in frame (see below). Get this right; it's the
  difference between a clean action shot and a premature/unwanted character
  reveal.

## `characterPresence` — what this shot promises about who's in frame
This drives which anchor images the video-prompt stage lists as this shot's
`references[]`, and how it composes the frame. It is a promise about CONTENT,
not a switch between renderers:
- **`"character"`** — an anchored/recurring character must appear
  recognizably: a reaction shot, a dialogue beat, any moment where continuity
  of WHO this is matters. The video-prompt stage will anchor that character,
  so their face and build stay consistent with every other shot they appear
  in.
- **`"none"`** — NO recurring character may appear in frame at all — a pure
  ACTION/ENVIRONMENT/OBJECT moment (a knocking hand, a storm exterior, oil
  poured into a lamp, a door heaving open). Write the shot's `description` so
  no anchored character's presence is implied. Note that the video model
  always receives at least one reference, so `"none"` is a promise you make
  about the frame you describe, not a mechanical guarantee.

Rule of thumb: **beats whose point is a person are `"character"`** —
**narration-mode beats' shots are usually `"none"`** (narration exists to
carry story-forward action and atmosphere, which rarely needs a recognizable
lead). A narration-mode shot should only be `"character"` if the beat's entire
visual point IS a specific character's reaction or state (and even then, the
no-premature-reveal rule above still holds).

Output ONLY the JSON fragment `{ "section": {...}, "shots": [...] }` for this
ONE section — do not include any other section, and do not wrap it in any
other key.

<<<DHEE_CACHE_BREAKPOINT>>>
This call is for scene id: {{item_id}} — find it in the outline's `sections`
array above and produce the full `{ "section": {...}, "shots": [...] }`
fragment for ONLY that scene.
