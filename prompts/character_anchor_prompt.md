You are writing the text-to-image prompt for the IDENTITY SHEET of ONE character
in an illustrated story film. Every recurring character in the story bible gets
their OWN identity sheet, generated ONCE and then handed to the video model (LTX
MSR) as that character's identity reference whenever they appear in a shot — so
their face, build and wardrobe stay consistent across the whole film,
independently of which other characters share the frame.

## What an identity sheet is, and why it is not a single portrait

A single pose only pins the character from ONE angle. The moment a shot turns
them, the model has to invent the side of the head, the back of the outfit, the
silhouette — and invents them differently every shot. So the sheet is a
**contact sheet of multiple views of the same subject**, laid out in ONE
HORIZONTAL ROW of two views on one 2048x1152 image (each view a 1024x1152
panel), left to right:

1. full body, facing the camera directly
2. medium close-up, head to waist, facing the camera

**Why two views, and why these two:** the renderer has only ever used these two.
It picks the first and last panel of the sheet, so a profile and a back view
were being generated, state-edited, joined and then thrown away — three
quarters of the pixel budget spent on panels nothing consumed.

**Why the panels are this large:** the sheet is split back into separate images
and handed to the renderer as individual references. At the old 1536x864 with
four panels each view arrived 384px wide, which puts a full-body face at roughly
60-80px — below the size at which fine identity (an unusual eye, a hairpin, the
texture of a scar or a seam) exists in the plate at all. At 1024x1152 the
full-body face carries roughly 220px and the close-up roughly 700px. Faces are
what this film can least afford to let drift; wardrobe and props tolerate far
more slack than identity does.

Two views of ONE person, on ONE plain neutral backdrop, evenly lit.

Story bible — the canonical visual identity of everything in the story:
{{story_bible}}

Shared art style (obey it; end your prompt with its "Style suffix" line):
{{art_style}}

## LIRA authoring pass

Before writing, deconstruct the canonical character and art-style inputs, then
diagnose ambiguity and known identity-drift failure modes. Develop one concise,
natural-flowing description from source-derived palette, observable materials,
surface finish, body construction and the existing sheet geometry. Keep aspect
ratio and resolution as platform fields in the JSON, never as prompt prose.
Use positive descriptions for the desired clean reference rather than stacking
negative keywords. Forbid accidental text, labels, and watermarks, extra subjects,
invented identity details and any change to the canonical face, build or
signature items.

For character id: {{item_id}} — find them in the `characters` array above and
write ONE text-to-image prompt for the identity sheet of THIS character, and only
this character:

0. **Decide first: is this a HUMAN, or a DESIGNED BEING?** Read the bible entry
   and answer that before you write a word, because it changes everything below.

   A human character — an actor you could cast — is described the way a casting
   photograph is: age, build, skin tone, face, hair, wardrobe.

   A DESIGNED BEING is not. If the bible gives it a non-human material, anatomy,
   proportion or face, then **do not start from a human and modify one.**
   Describing "a woman whose forearms are stone" produces a woman: the renderer
   draws the human accurately and the stone becomes an accessory. Measured
   repeatedly on this bundle — every such plate came back as an ordinary person
   with a condition, and the character was unrecognisable as itself.

   Start instead from the MATERIAL and the SHAPE, and let a person be implied if
   at all: "a tall narrow humanoid of polished black volcanic glass, no hair, no
   nose bridge, blank luminous white eyes with no pupil, long fingers with one
   joint too many". A designed being does not need human features and should not
   be given them by default — no hair, no visible eyes, no mouth, no skin, wrong
   joint counts and wrong proportions are all available and all stronger than a
   human baseline with something added.

   Do NOT write age, sex or ethnicity for a designed being. Do not soften it
   toward a person to make it sympathetic.

1. **Open by naming the medium AND the sheet form.** Take the medium from the art
   style — do not default to photoreal unless that IS the art style. If the art
   style is photoreal, ask for photographic REALISM OF MATERIAL — real skin,
   real cloth, real metal, real weight and real light — and say there is no CGI
   gloss or plastic sheen. Do NOT ask for "a real human photographed in the real
   world" or "a documentary/ID shoot" when the character is not an ordinary
   human: a real person who has lava for forearms is a person in prosthetics,
   and that is exactly what the model will give you. Photoreal describes how the
   materials are RENDERED, never who the subject is. If the art
   style is illustrated/anime/painterly/hand-drawn, name that rendering medium
   explicitly in the FIRST clause instead — the image model defaults to
   photorealism and ignores mood cues alone. Either way, state that this is a
   multi-view character identity contact sheet.
2. **State the layout explicitly**, as the single row of two views above,
   naming both in order and stating that the second is a medium close-up
   framed head to waist (not head-and-shoulders). Say "one horizontal row of
   two views, each occupying one half of the image width" — this layout is
   not optional and not yours to redesign.
3. **State that it is the SAME subject in every view** — same face, same age, same
   build, same proportions, same wardrobe, photographed moments apart. This is
   the single most important sentence in the prompt: without it the model draws
   two different people.
4. **Weave in their FULL canonical description from the bible.** For a HUMAN:
   apparent age, sex, build, skin tone, face, hair (colour/length/style),
   signature wardrobe WITH colours, and any defining accessory. For a DESIGNED
   BEING: what it is MADE OF and how that material behaves in light, its
   proportions and where they depart from human, what it has instead of a face,
   and anything worn — which for such a being is often the only manufactured
   thing about it and is worth naming as such. Copy the description, not the id.
5. **Design, not inventory.** A list of what a character HAS produces a
   forgettable figure. Before listing anything, decide and state each of these.
   They apply to EVERY story — a kitchen drama and a battlefield equally — only
   the register changes, so the paired examples below show both.

   - **Silhouette.** What shape do they cut against a lit background, read at
     fifty metres with no detail visible?
     *drama:* heavy-set and upright, shoulders squared, pallu pinned tight and
     never loose; or small, round-shouldered, always slightly turned away.
     *fantastical:* narrow and vertical; hulking and asymmetrical; top-heavy.

   - **One signature.** The single feature someone would describe first, and
     that no other character in this story has. Name it, then make it the thing
     the close-up view is about.
     *drama:* the gold bangles worn to the wrist that she has never once taken
     off; a pair of heavy black-framed glasses mended at one hinge with thread;
     a moustache kept exactly as his father wore it.
     *fantastical:* often a VIOLATED EXPECTATION — not a skull but a skull with
     the jaw wired shut so it cannot scream; not eyes but blank white with no
     pupil at all.

   - **Build and bearing** — and, for a DESIGNED BEING only, **proportion that
     departs from human.** A person in a drama has ordinary proportions and
     should keep them; what distinguishes them is build, posture and how age and
     work have settled into the body. A designed being may have limbs too long,
     a skull too narrow, a joint too many — say so plainly.

   - **A history on the body.** One or two specific, unrepeatable marks of what
     has happened to THIS individual. Generic wear ("aged", "battered") reads as
     texture; a specific mark reads as a life.
     *drama:* a wedding bangle worn visibly thin on one side; a burn on the
     inside of the right forearm from a pressure cooker; ink permanently in the
     creases of the fingers.
     *fantastical:* a snapped blade still lodged between two ribs and grown
     around; a helmet crest burned away down one side.

   - **How they carry themselves.** Standing still is a choice: where the weight
     sits, what hangs wrong, what is held ready, what they do with their hands
     when they are not being used.

   For a COLLECTIVE — a horde, a rank, a crowd, a family that shares one plate —
   this matters more, not less. The plate is the archetype every one of them is
   rendered from, so a bland archetype produces a bland crowd. Design ONE
   specific individual and let the shots multiply them.

6. **Non-human features are ANATOMY, not wardrobe.** SKIP THIS ENTIRELY for an
   ordinary human character — a doctor, a matriarch, a schoolteacher have no
   such features and inventing some would wreck the plate. It applies only when
   the bible gives a character a body that is not a human body, and then it is
   the single thing most likely to go wrong: the difference between a character
   and an actor in a costume. Go through the bible description and separate what
   this character WEARS from what this character IS. Anything in the second
   group — lava skin, a fused mask, wings, scales, an inhuman eye, bark, metal
   grown into the body — must be written as living material continuous with the
   body:

   - **Say it is grown, not worn or applied.** "Her forearms ARE cooled lava,
     the flesh itself gone to black crazed stone" — never "wearing lava-textured
     gauntlets", never "with lava-effect makeup".
   - **Describe the TRANSITION explicitly.** The boundary is where a costume
     gives itself away, so say what happens there: whether the stone rises out
     of the skin through a gradient of hardening flesh, whether the seams glow
     hotter near the join, whether there is any edge at all. State that there is
     NO cuff, hem, strap, buckle, glove line, mask rim, zip, seam or visible
     join where a garment or prosthetic would end.
   - **Give the material real physics.** Say how it takes light — emits,
     absorbs, is translucent at thin edges — how it moves or fails to move with
     the body, whether it is warm, and what it does to the air around it. A
     costume is inert; living material is not.
   - **Let it change the body it belongs to.** Weight, posture, how the limb is
     carried, what the character can no longer do easily. A person adapts to
     their own anatomy; an actor adapts to a costume, and the two look
     different.

   For features that genuinely ARE worn — a coat, a mask that is an object, a
   carried lantern — describe them as worn, but describe the CONSTRUCTION in the
   same concrete detail: what the material is, how it is joined, how it hangs,
   how it has aged and where it has worn through.

7. **Pose and presence:** natural stance, relaxed posture, not posing for
   presentation. Subtle variation in head angle and body balance between views,
   like two frames taken moments apart — not two identical cut-outs.
8. **Lighting and finish:** soft, neutral, even lighting on a plain neutral
   backdrop, no dramatic contrast, no stylisation beyond the art style's own
   medium. It should read as reference photography (or, for an illustrated
   style, as a character-design reference sheet), not as a finished illustration
   or a hero shot.

   **But neutral light must not switch the character off.** Anything that emits,
   glows, smoulders, refracts or shifts is a defining property, not set dressing
   — say that it is ACTIVE in the plate and describe what it does to its
   surroundings: seams throwing warm light onto the surrounding skin, an eye
   catching and returning the light, heat haze above the forearms. A plate that
   renders a molten-seamed woman under flat grey light has documented a costume,
   not a character, and every shot in the film inherits that.
9. **End with the art style's "Style suffix" line, verbatim.**

RULES

- ONE character only. No other characters, no scene, no environment, no props
  beyond their signature carried items.
- **No text, letters, numerals, labels, captions, watermarks or view names.**
  Generative models render requested text as garbage, and this sheet is reused by
  every shot in the film, so one garbled label propagates everywhere. The two
  views are separated by the layout itself, never by written labels.
- No panel borders, gutters, frames or grid lines drawn between the views — the
  views sit on one continuous backdrop.
- Keep it a single flowing prompt (roughly 5–8 sentences — longer than a single
  portrait prompt, because the layout and the same-person constraint both have to
  be stated).

Output a JSON object:
{
  "imagePrompt": "...",
  "aspectRatio": "16:9",
  "generationMode": "text_to_image"
}
Output ONLY the JSON.
