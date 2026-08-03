You are writing an IMAGE-EDIT instruction that re-issues ONE character's IDENTITY
in a NEW APPEARANCE STATE — identity-only, no scene, no staging.

WHY THIS STEP EXISTS. Every character has one canonical identity sheet, generated
once, which every shot uses as their identity reference. But characters CHANGE
during a story: they put on a jacket, they lose a hand, their basket fills with
fish, they change wardrobe completely for a new scene. Feeding the *old* sheet to
a shot where the character has changed forces a contradiction — the reference
image shows one thing and the shot prompt describes another — and the video model
resolves it arbitrarily, so the change either fails to appear or flickers.

## Contract change — this is IDENTITY-ONLY, and the runner owns the sheet layout

Earlier versions of this prompt asked you to redescribe the whole multi-view sheet
(restate the layout, apply the change "across all views"). **That contract is
gone.** The per-view framing, camera angle and cropping are now handled entirely
by code, downstream: each view of the sheet is cropped and edited as its own tile,
and a runner appends the correct framing clause to your text automatically. **Do
not mention views, rows, panels, layout, framing or camera angle at all** — if you
write any of that here, it will be redundant with (or contradict) the clause the
runner appends, and none of it belongs in an identity description anyway. Your
entire job is to describe WHO this person is and WHAT they look like right now:
body, face, hair, wardrobe, and carried props. Nothing else.

## The rule that matters most, stated up front

When a garment comes off, describe **the most natural next layer inward for this
character** — the garment their period, sex and station would actually put there,
or the bare body where there genuinely is nothing beneath. Go exactly one layer
inward, and describe whatever you find there completely. The full version of this
rule, with the per-garment reasoning, is below; it is the thing this whole step
lives or dies by.

Story bible — the canonical visual identity of everything in the story:
{{story_bible}}

Shared art style (obey it; end your prompt with its "Style suffix" line):
{{art_style}}

The appearance state you are re-issuing:
{{character_states_plan}}

For state id: {{item_id}} — find it in the `states` array above. It gives you:
- `characterId` — whose base identity you are re-describing; find THIS character's
  entry in the story bible's `characters` array for their canonical baseline
  description (age, build, skin tone, face, hair, signature wardrobe).
- `appearance` — the character's COMPLETE current appearance as of this state.
  **This is your ONLY source for the delta, and it is authoritative in full.**
- `changedThisShot` — **ignore this field entirely; do not read it, do not let it
  narrow what you describe.** It exists for the shot-writing prompts, not this
  one, and it has already been observed to say `"none"` on a shot where
  `appearance` in fact carried a major visible change (a grown beard) — a prompt
  that trusted `changedThisShot` produced an identity sheet with no beard, because
  it never looked past a field that claimed nothing had changed. `appearance` is
  the complete, standalone truth for this state; derive everything from it.
- `signature` — the stable key for this state (not used in your output, only for
  your own orientation).

## The diff you must perform

1. **Find this character's baseline** in `{{story_bible}}`'s `characters` array
   (matched by `characterId`) — their canonical, unchanging description.
2. **Read `appearance` in full** — the character's complete current look.
3. **Identify what in `appearance` differs from the baseline** — the delta this
   state exists to carry (a garment added/removed/replaced, a body change like a
   beard grown or a limb lost, a carried object appearing or disappearing, a
   condition like being soaked or coated in something). Everything in
   `appearance` that MATCHES the baseline is not the point of this state; the
   difference is.
4. **Write ONE identity description of the character's CURRENT, COMPLETE look** —
   not a diff, not "now wearing X instead of Y", but a full standalone
   description a reader could picture with no other context, exactly as the
   character now is. State the parts that did NOT change too (still needed so the
   edit model doesn't invent them), just without dwelling on them as "the
   change".

## What belongs in this description, and what must never appear in it

INCLUDE, and only this:
- Body: apparent age, build, skin tone, any body-level change (a beard grown, a
  limb lost, hair cut).
- Face: only if it changed from baseline (e.g. new facial hair); otherwise
  inherited silently from the baseline sheet, no need to restate every detail.
- Hair: colour, length, style — as it currently is.
- Wardrobe: every garment currently worn, with colour, fit and how it sits,
  including anything freshly revealed (see the REVEAL RULE below).
- Carried props: anything currently held or carried, described with its FULL
  bible description if it's a story-critical object (form, material, colour,
  size, how it's held) — never redescribed from memory.
- Condition: dirt, wetness, soot, oil, wounds — anything visibly on the body or
  clothing right now.

FORBIDDEN, absolutely — strip these even if `appearance` mentions them:
- **Scene or location** — where the character is, what's around them, any
  ground, backdrop, weather, or environment. This is an identity plate on a
  plain neutral studio backdrop, never a place.
- **Action or narrative** — what the character is doing, how they are moving,
  their posture as an activity ("walking stiffly", "disoriented"). Static
  identity only.
- **Lighting** — any lighting description belongs to the shot, never the
  identity plate; the plate uses the art style's own neutral studio lighting.
- Any other character, any dialogue, any plot context.

If a sentence in `appearance` reads like staging rather than identity — it names
a place, an action, or lighting — leave it out entirely. The ledger's `appearance`
field is written for shot-writing prompts too and is not filtered for you; doing
that filtering IS this step's job.

## THE REVEAL RULE — the single most important rule in this prompt

**Whenever a garment comes OFF, describing the removal is a FAILURE. You must
describe WHAT IS NOW VISIBLE IN ITS PLACE, positively and in full.**

This is where this step breaks in practice. When a character casts off a shirt,
steps out of his trousers, sheds a coat, unwinds a shawl, the ledger typically
says only that the garment is gone — "he has cast off his shirt", "the trousers
are gone", "her dupatta has been removed". That tells the edit model what to
DELETE and nothing about what to DRAW. So it invents, and it invents badly and
differently every time: it leaves the old sleeves grafted onto whatever it puts
underneath, it produces a corrupt hybrid garment that is half-shirt, it quietly
paints the removed garment straight back in, or it invents a different
undergarment in every view so the finished sheet contradicts itself.

**The edit model can only draw what you name. A removal is not a thing that can
be drawn. A bare chest is. A named, fully described garment is.**

So for every garment that has come off, you MUST write out the following, as
plain positive description of what is there now:

1. **If another garment is underneath, describe it completely** — what it is,
   its colour, its fabric, its neckline shape and where that neckline sits, its
   sleeve length and exactly where the sleeve ends, its fit (loose, close, taut),
   and where its hem falls. Describe it as if introducing it for the very first
   time, because for the edit model you are.
2. **If bare skin is now visible, say exactly which parts of the body are bare**
   — chest, shoulders, upper arms, midriff, back, legs down to which point — with
   the skin tone, and any body detail now on show that the baseline mentions or
   implies (build, chest hair, scars, calluses, tan lines, a heavy or lean torso).
   Do not be coy about it: name the uncovered parts and their skin, in the same
   concrete register you would use for a garment. What is NOT acceptable is
   naming the absence instead of the body — a clause whose subject is the missing
   shirt rather than the chest that is now visible.
3. **Add a short negative clause, and ATTACH IT TO THE NEWLY VISIBLE LAYER —
   never to the body.** After you have named the layer that is now visible, add a
   brief clause saying that the removed garment is not over it. The clause must
   qualify the *revealed layer*, so its grammatical subject is that layer and the
   removed garment is the only thing it denies. The positive description tells the
   edit model what to draw; this clause stops it hedging with a half-present ghost
   of the removed garment.
   **The clause must name the ONE garment that came off, and deny nothing else.**
   A clause that denies whole categories of clothing, or that denies covering of
   any kind, contradicts the next-layer rule and strips the character further than
   the delta did. Never let this clause become an assertion that a part of the body
   is uncovered — it qualifies a garment, not a body.
4. **Never write the state as a diff.** The words and phrases "removed", "no
   longer", "instead of", "used to", "has cast off", "gone", "minus", "without
   his previous" must NOT appear in your `imagePrompt`. A reader of your text
   must not be able to tell that anything was ever taken off — they should only
   be able to see what the character looks like now.
5. **THE REMOVED GARMENT MUST NOT APPEAR AS WORN, ANYWHERE IN YOUR OUTPUT.**
   This is a SEPARATE failure from the diff-phrasing one above and it is the
   most common way this step fails in practice. Banning the word "removed" does
   nothing to stop you quietly dressing the character in the garment again — and
   that is exactly what happens: asked for a state where the trousers are gone,
   the writer produces "he wears rugged heavy-weight canvas trousers in a dark
   earthy tan", because that phrase is sitting right there in the baseline
   description and gets copied forward on autopilot.
   **So: identify the removed garment by name, then verify that garment appears
   NOWHERE in your `imagePrompt` as something he is wearing.** Not worn, not
   partly worn, not open, not unbuttoned, not pushed down, not rolled, not
   tucked, not tied around the waist, not draped over a shoulder, not folded
   over an arm, not held, not lying nearby. The ONLY exception is if `appearance`
   itself explicitly says he is now CARRYING or HOLDING it — then describe it as
   carried, and never as worn.

**Lower-body removals are exactly as important as upper-body ones, and they are
where this step fails hardest.** Do not treat "casts off his trousers" as a
lesser case than "casts off his shirt", and do not let a lower-body delta drift
into describing the chest — if the trousers came off, the shirt situation is
UNCHANGED and the reveal you owe is at the waist and legs, not the torso. Both
kinds get the full treatment above:

- Shirt/coat/upper garment off → name what is on the torso now.
- Trousers/breeches/skirt/lower garment off → name what is on the lower body now.

### THE RULE: show the MOST NATURAL NEXT LAYER

When a garment comes off, what is now visible is **the next layer inward for THIS
character** — nothing more, nothing less. That is the whole rule. Do not add a
layer to be modest and do not skip to bare skin for effect: go exactly ONE step
inward from the garment that was removed, and describe what you find there.

Work out what that next layer actually is from the garment type, the character's
sex, and the period, region, station and climate the bible gives them:

- **Outer layers** — coat, jacket, cloak, shawl, waistcoat, overdress, oilskins,
  armour: the next layer is the garment beneath, which the bible usually already
  names. Use the bible's own description of it.
- **A man's shirt** — usually nothing lies beneath it, so the next layer is his
  **bare chest**. Say so, and describe the torso: build, skin tone, body hair,
  scarring, tan lines. Unless the period or station specifically implies an
  undershirt or vest, do not invent one.
- **A woman's top, blouse, choli or bodice** — the next layer is normally her
  **breast covering**, and which one depends entirely on the setting: a bra in a
  modern setting, a chemise, shift, corset or stays in a Victorian one, a choli or
  breast-cloth in period Indian dress. Name whatever her world would actually put
  there and describe it as the garment she is now wearing.
- **Trousers, breeches, skirt, sari, dhoti** — the next layer is the lower
  undergarment their period would use: modern briefs, boxers or shorts; Victorian
  drawers, pantalettes or long johns; a loincloth or langot in an older setting.
  **A lower garment coming off reveals the undergarment beneath it — this is the
  single most common place this step goes wrong, so treat a lower removal EXACTLY
  as you would treat a woman's top coming off.** Name that undergarment and
  describe it as the garment she or he is now wearing: its cut, colour, fabric,
  how it sits at the waist, and where it ends on the leg. Describing the legs or
  hips as uncovered is correct ONLY where `appearance` itself states the character
  is naked below the waist.
  A ledger phrase such as "the trousers are gone" is a statement about the
  TROUSERS alone. It says nothing about the rest of the lower body, and it must
  never be read as "there is nothing there".
- **Gloves, boots, socks, hat, veil, jewellery** — there is no intermediate layer.
  The next layer is the body: bare hands, bare feet, bare head, an uncovered face.
  Describe the skin and anything now visible on it.

**Heavily layered costume goes one step at a time.** Victorian dress, winter
clothing, ceremonial or military dress can run three or four layers deep — coat
over waistcoat over shirt over undershirt. Removing the outermost of those reveals
the NEXT one, not the skin. Never collapse a multi-layer costume straight to a bare
body; count the layers the bible implies and step inward once.

**Whatever the next layer turns out to be, specify it completely** — this is the
defect the whole rule exists to kill, because a half-described reveal gets invented
four separate times, once per view, and the four views then contradict each other:

- **Cloth** → what the garment is, its cut, colour, fabric and weight, how it sits
  at the waist or neck, its sleeve or leg length, its fit, where its hem falls.
- **Bare skin** → exactly which parts of the body are uncovered, the skin tone, and
  the body detail the baseline implies (build, chest hair, scarring, tan lines),
  stated plainly as fact.

And where `appearance` explicitly says the character is stripped, undressed or
naked, that overrides the layer logic — describe exactly what the ledger says,
plainly and completely, without softening it and without putting back a garment
the story took off.

One hard limit, and only one: **never describe a character the bible presents as a
child or adolescent as undressed or sexualised.** Where a state would require it,
describe the next layer of clothing instead. This bundle's casts do include
children, so this is a live case rather than a hypothetical.

**DERIVE the garment — do not reach for a default.** Work it out from THIS
character's own bible entry, in this order:

1. **Period and region** — what did people there and then actually wear under
   this specific outer garment?
2. **Station and trade** — a labourer, a soldier, a clerk, a bride and a child
   are underdressed differently, in different fabrics, at different costs.
3. **Climate** — heat and cold change both the layer and how much of it there is.
4. **The rest of their wardrobe as the bible describes it** — the undergarment
   must read as belonging to the same person and the same wardrobe.

Then name it and specify ALL of: what the garment is, its cut, its colour, its
fabric and weight, how it sits at the waist or neck, its sleeve or leg length,
its fit, and where its hem falls. **That attribute list is the STANDARD OF DETAIL
you must meet — it is not a costume you may copy.**

**DO NOT COPY A GARMENT FROM THIS INSTRUCTION.** This instruction names no
specific undergarment anywhere, on purpose. An earlier version offered two worked
examples and the writer pasted them back word for word, so every character who
undressed came out in the same two garments no matter who they were or what
century they lived in. A garment lifted from these instructions is a FAILURE even
when it is plausible, because it is not THIS character's.

Test yourself: if the clause you are about to write would suit any character in
any story equally well, you have defaulted instead of derived. Go back to steps
1-4 and choose from this character's own world.

**A specific derived garment, stated once and stated fully, is always better
than an unstated one**, because every view of this sheet is edited independently
with no shared context between them — anything you leave unstated is invented
separately four times over and the four views disagree.

## Read ONLY your own state — the other entries are different moments

`{{character_states_plan}}` contains EVERY state for EVERY character in the film.
Exactly one of them — the entry whose `id` equals `{{item_id}}` — is yours.

**Every other entry in that array describes a DIFFERENT moment of the story and
must contribute NOTHING to your output.** Do not blend them, do not average them,
do not carry a garment or a body detail across from a neighbouring state because
it looked relevant. This has been observed to fail: on a state where only the
TROUSERS came off, the writer described a bare chest — which belonged to a
DIFFERENT state in the same array where the shirt came off — and produced a
character who was simultaneously bare-chested and wearing his shirt. Locate your
one entry by `id`, and derive everything from that entry plus the character's
baseline in the story bible. Nothing else.

## Final self-check — run this before you emit, every time

Read your own `imagePrompt` back and confirm all five:

1. Does any garment that this state removed appear in it as WORN? If yes, delete
   that clause and replace it with what is actually visible there now.
2. Is every part of the body that the removal exposed positively described —
   either a named garment in full detail, or bare skin with which parts and what
   tone?
3. Does it contain any of the banned diff words ("removed", "no longer",
   "instead of", "used to", "cast off", "gone", "minus")?
4. Did anything leak in from a state other than `{{item_id}}`?
5. Does it end with the art style's "Style suffix" line, verbatim? (This gets
   dropped surprisingly often — check, do not assume.)
6. Is every garment you named DERIVED from this character's period, region,
   station, climate and existing wardrobe — rather than a generic default that
   would suit any character anywhere? If you cannot say why THIS character wears
   THIS undergarment, replace it with one you can justify.

The same discipline applies to a FULL WARDROBE REPLACEMENT: describe the ENTIRE
new outfit from scratch, every piece, as if the old one never existed — never as
a delta from it.

## Other rules

- The person must read as the exact same individual, just changed — never a
  redesign, never a different person. NEVER change the character's face, body
  proportions or identity beyond what the delta explicitly requires.
- **No text, letters, numerals, labels, captions or watermarks.**
- `appearsAs` must be a SHORT (3-8 word) visual descriptor of the character in
  THIS state, reading as an identifying description rather than a name — it is
  what shot prompts use to refer to this sheet. For a subtractive state it must
  name what IS worn or visible — the garment now on show, or the bare part of the
  body — and never what is absent. Name the revealed layer, not the thing that
  came off.
- End your `imagePrompt` with the art style's "Style suffix" line, verbatim.
- Keep `imagePrompt` a single flowing description (roughly 3-6 sentences —
  shorter than the old sheet-layout version, since layout/framing text no
  longer belongs here). A subtractive state legitimately runs to the longer end
  of that range, because the reveal has to be fully specified.

Output a JSON object:
{
  "imagePrompt": "...",
  "appearsAs": "...",
  "references": [
    { "id": "<characterId>", "type": "character", "appearsAs": "<base sheet descriptor>" }
  ]
}
`references` MUST contain exactly one entry, whose `id` is the `characterId` of
this state — that is what routes the character's base identity sheet in as the
edit model's reference image. Output ONLY the JSON.
