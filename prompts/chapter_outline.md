You are laying out the SKELETON of THIS CHAPTER: an ordered series of SECTIONS
(scenes), each destined to become one living clip from 1–6 stills. This is the
FIRST of two planning passes for this chapter — you write ONLY the skeleton (one
short outline per section); a later pass expands each section into full prose, a
scene brief, and its shots. Section ids you author here are LOCAL to this
chapter and will be globally renumbered downstream — number them 1, 2, 3… from
the start of THIS chapter; do not attempt to guess a global number.

THIS chapter's screenplay only — the plain-English, scene-by-scene source of
creative truth for THIS chapter (already written; BINDING — it fixes the actual
events, blocking, dialogue and state changes in play order). Split your sections
along its scene breaks and mood beats rather than re-deriving them from the raw
prose:
{{chapter_screenplay}}

This chapter's own metadata (find `{{item_id}}` in this array — title/summary/
`durationSec`, this chapter's own seconds budget):
{{chapters}}

Story bible (recurring visual identities, with ids — the full merged bible):
{{story_bible}}

Narrator voiceover enabled for this project: {{narration}}
(Informational only — it does NOT change how you split this chapter into
sections or classify each section's `mode` below; that classification is about
whether a CHARACTER speaks in a beat, not about whether a narrator exists.)

## Your hard constraint: THIS chapter's own seconds budget

Find `{{item_id}}` in the `{{chapters}}` array above and read its `durationSec`
— that is THIS chapter's target finished-film length in seconds. Use it exactly
the way the whole-film pass would use `target_duration`, just scoped to this
chapter alone.

## Emotional journey first

Before you split anything into sections, decide THIS CHAPTER's own emotional
beat-to-beat arc — how the feeling established at the end of the previous
chapter (if any) carries in, moves, and hands off to the next chapter. Think in
beats, not locations: every scene should start from ONE question, "what should
the audience feel here?" — never from "where does this happen?"

Split THIS chapter into ordered SECTIONS that each cover ONE beat/moment.

**A SECTION IS EXACTLY ONE H3 CLIP.** Pace at `sections ≈ durationSec ÷ 8`. Compute
this chapter's own number from its own `durationSec` — round to the nearest whole
number, with a floor of 1 (a very short chapter is legitimately a single section).

The shots inside a section are CUTS WITHIN that one clip, not separate clips — so a
section is typically ONE or TWO shots of about 4 seconds, both inside the same clip.

> **Why 8 is the pacing target when the renderer allows 15.08s.** The two numbers do
> different jobs. 8s is the *default* section length, because a scene's downstream
> `duration` is set from its DIALOGUE and most beats do not have 15 seconds of speech
> in them — asking for length the words cannot fill produces dead air, not headroom
> (measured: a five-word line stretched to 5.17s came back with 2.94s of silence
> before she spoke). 15.08s is the *ceiling*, available to a section whose speech or
> deliberately held silence genuinely fills it. Budget at 8, and the ones that need
> more will take it.
>
> Efficiency agrees: 5.17s costs 27.3s of render per second of finished video against
> 42.8s at 15.08s, so short clips are cheaper per second. But the premium for a long
> take is only ~1.7×, which is affordable — do not distort a scene to dodge it.
>
> **CORRECTED:** this note used to say the renderer capped clips at 8s because
> "marginal cost jumps ~3.5x between 8.00s and 9.42s." That cliff is RETRACTED — it
> was measurement noise on a box with 10-21% run-to-run variance (re-measured with
> fixed steps, 192f→226f came out 306→491s where the original sweep read 288→573s).
> Real cost is a smooth ~frames^1.4. The ceiling is now 15.08s (362 frames, the top
> of H3's trained range), so **never** budget a section above that — but nothing
> downstream loses beats at 8s either, since the divisor sits comfortably under the
> ceiling. An even earlier version split at `durationSec ÷ 15` while the renderer
> could only produce 8s, so every section silently lost ~47% of its beats and a
> 35-section film came out 4m34s against a 6m34s plan. That failure mode is what the
> divisor-under-ceiling rule prevents.

**There is NO maximum section count.** This chapter's own `durationSec` is
already the film's actual, un-capped length for this chapter (derived from the
whole story's own length, not chosen from a menu) — a chapter granted 400
seconds gets roughly 50 sections, and that is correct, not excessive. Do not
compress a chapter's material down to some smaller "reasonable-sounding" count;
compute the number from `durationSec` and use it. The only place compression
applies is WITHIN that computed section count: if this chapter's own material
has more distinct beats than sections, combine adjacent beats into one section's
shots (a 4-second shot holds two beats comfortably) — never invent
extra sections beyond what `durationSec ÷ 10` gives you, and never silently drop
a beat instead of folding it in.

**This is PACING GUIDANCE for how you split — it is not what makes the film's
final length correct, and it is NOT something to delete if the film's actual
runtime later drifts.** Whatever number of sections you actually produce here,
a deterministic downstream step (`plan.chapter_merge`, mode `sections`) divides
THIS chapter's own `durationSec` evenly across however many sections you
create and hands each one an exact `budgetSec`/`targetShotCount` — so the
film's total duration comes out correct BY CONSTRUCTION regardless of whether
you hit `durationSec ÷ 10` exactly. Do not read a later duration overshoot as
evidence this guidance should be tightened into a hard cap — the fix for that
lives downstream, deterministically, not here. (This note exists because an
earlier version of this guidance was once deleted entirely, in the mistaken
belief it was a forbidden ceiling rather than proportional pacing advice —
don't repeat that.)

## Never split a continuous physical interaction across a cut

**Why this matters more than an ordinary cut: EVERY SHOT is a SEPARATE,
INDEPENDENTLY GENERATED clip, and the clips are only concatenated afterward —
they share NO state with each other.** Nothing carries across a shot boundary:
not location, not blocking, not an object's physical identity. Only the
CHARACTER ANCHORS carry over, and they fix appearance only — never position,
pose, or what a character is doing.

A single continuous physical INTERACTION — a catch, a grab, an interception, a
collision, a hand-off, someone breaking a fall, one object striking another —
must be contained in ONE SHOT, together with the moment of CONTACT. Never place
the setup (the fall, the throw, the swing) in one shot and the resolution (the
catch, the reception, the impact) in the next. The 4–10s shot length is generous
enough for this: a fall AND its catch is comfortably one 8-second shot.

**If honouring this makes one section longer than its even share of this
chapter's `durationSec`, that is acceptable — physical continuity outranks even
pacing.** Never split a genuine physical interaction merely to keep sections
evenly sized.

**Corollary — where a section boundary SHOULD fall:** at a genuine narrative
pause — a beat completing, a change of place, a change of time — never
mid-action.

Every section must give:

- `id`: sequential `scene_1`, `scene_2`, `scene_3` … LOCAL to this chapter
  (downstream renumbers these globally across the whole film — always start
  from 1 here regardless of how many sections earlier chapters had).
- `heading`: a short title (a few words).
- `mode`: `"dialogue"` iff a character SPEAKS in this beat — the chapter's own
  screenplay gives them a line, either as direct quoted speech or as clearly
  reported speech that faithfully converts to a direct line. Otherwise
  `"narration"`. Classify HONESTLY from THIS chapter's own screenplay.
- `emotion`: the ONE audience feeling for this beat, drawn from the emotional
  arc you decided above — one to three words (e.g. "curiosity", "quiet dread",
  "comic relief", "acceptance").
- `brief`: one or two sentences on the strongest visual EVENT in this beat —
  name the ACTION as the subject of the frame (a fist knocking on a door, oil
  pouring into a lamp, a wave rising with a distant answering light), not a
  character standing or looking at something. This is a SKELETON brief for the
  next pass to expand — not the final shot description.
- `entities`: the bible ids (characters/locations/objects) VISIBLE across this
  section, so the next pass knows whose canonical look to re-inject — list
  EVERY character physically present in the beat, including anyone the speaker
  talks to.
- `spokenLines`: every line spoken in THIS beat — **the spoken WORDS ONLY**, one
  array entry per utterance, in spoken order. `[]` for a `narration` section.

  The screenplay writes dialogue as `Aditya: "Sorry. Traffic."`. The correct
  entry is **`Sorry. Traffic.`** — no speaker name, no colon, no quotation marks.
  This string is spoken aloud verbatim by the video model, so a name left in
  front means it SAYS the name. A measured run emitted all 25 lines as
  `Aditya: "..."` and every one would have been voiced that way.

  **Keep the line's original language AND its native script.** A Hindi line
  stays in Hindi, in Devanagari — `कोई बात नहीं।`, never `Koi baat nahi.`. Same
  for Kannada (ಕನ್ನಡ), Tamil (தமிழ்), Bengali (বাংলা), Telugu (తెలుగు), Urdu (اردو).
  The screenplay should already have written it that way; if it slipped and
  handed you romanized Latin, TRANSLITERATE it into the native script — that is
  the only edit you may make to the words. Romanized Latin measurably
  mispronounces (a seed-matched A/B voiced `padh` with an English *d* rather
  than the retroflex ढ़, and anglicised `Delhi`; the Devanagari original was
  correct throughout). Never translate a line into English, and never invent an
  English line where the screenplay has Hindi.

## `spokenLines` — you are the only pass that can do this, so do it carefully

You are already reading the screenplay to set `mode`. Record the line itself
while you have it.

**You hold THIS chapter's screenplay AND you are deciding where this chapter's
section boundaries fall — so you alone know which lines land in which beat.** No
later pass can recover that. The next pass (`scene_detail`) is deliberately NOT
given the screenplay at all: it authors each section's shots from that section's
own outline entry, and takes its dialogue from your `spokenLines`.

Three rules, and they are the whole job:

1. **Every line goes to EXACTLY ONE section.** Never put the same line in two
   sections to smooth a transition. That is the single failure this field exists
   to eliminate.
2. **A `mode:"dialogue"` section must have a non-empty `spokenLines`.** If you
   cannot find a line for it in this chapter's screenplay, the section is
   `mode:"narration"` — classify honestly rather than leaving a spoken beat with
   no words.
3. **Verbatim.** Same words, same punctuation, same language as the screenplay
   wrote them. Do not translate, tidy, shorten, or merge two utterances into one
   entry. A line you paraphrase here is a line the finished film gets wrong,
   because there is no other copy downstream.

If a section boundary falls mid-conversation, split the conversation: each line
goes with the beat it is actually spoken in. Do not repeat the previous
section's closing line as a lead-in to yours.

**Why this is strict.** When the next pass received the whole 73KB whole-film
screenplay instead, it had to re-find its own lines in a document with no
section markers, whose beat headings appear nowhere in your outline. At a
boundary that search is genuinely ambiguous, so two adjacent sections would each
stage the same beat and quote the same line, and the finished film played it
twice. Measured on a 134-section film: 13 lines duplicated across sections,
including a whole three-shot block staged in both `scene_13` and `scene_14`.
Your `spokenLines` is what makes that impossible rather than merely discouraged.

**Do NOT show a character before THIS CHAPTER's own screenplay actually
introduces them.** If a character is only revealed later within this chapter,
earlier sections' `entities`/`brief` must NOT depict or name them yet.

Also produce a `title` — this chapter's OWN title (copy it from `{{chapters}}`;
it will be used as the whole film's title only if no other chapter supplies one,
so do not worry about picking THE film title, just give this chapter's own).

Use sequential, chapter-LOCAL section ids: `scene_1`, `scene_2`, `scene_3` …
Output ONLY the JSON object.
