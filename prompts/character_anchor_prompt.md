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
**contact sheet of multiple views of the same person**, laid out in ONE
HORIZONTAL ROW of four views on one 1536x864 image (each view a 384x864 panel),
left to right:

1. full body, facing the camera directly
2. full body, in left-facing profile
3. full body, from directly behind (facing away from the camera)
4. medium close-up, head to waist, facing the camera

**Why four views, not seven, and why this particular four:** a right-facing
profile is near-redundant with the left-facing profile already in the sheet —
dropping it costs almost nothing. The close-up earns its slot instead: this
sheet is consumed downstream at 1280x736, where a full-body view resolves the
face to only about 70-90px, but this close-up panel — framed head to waist so it
fills a tall 384x864 panel naturally, rather than head-and-shoulders, which
would leave the lower two-thirds of the panel empty — carries roughly 250px of
face. Faces are what this film can least afford to let drift; wardrobe and props
tolerate far more slack than identity does.

Four views of ONE person, on ONE plain neutral backdrop, evenly lit.

Story bible — the canonical visual identity of everything in the story:
{{story_bible}}

Shared art style (obey it; end your prompt with its "Style suffix" line):
{{art_style}}

For character id: {{item_id}} — find them in the `characters` array above and
write ONE text-to-image prompt for the identity sheet of THIS character, and only
this character:

1. **Open by naming the medium AND the sheet form.** Take the medium from the art
   style — do not default to photoreal unless that IS the art style. If the art
   style is photoreal, say so in the strongest terms: a **real human photographed
   in the real world**, a documentary/ID reference shoot, with no stylised,
   animated, illustrated or synthetic appearance and no CGI look. If the art
   style is illustrated/anime/painterly/hand-drawn, name that rendering medium
   explicitly in the FIRST clause instead — the image model defaults to
   photorealism and ignores mood cues alone. Either way, state that this is a
   multi-view character identity contact sheet.
2. **State the layout explicitly**, as the single row of four views above,
   naming all four in order and stating that the fourth is a medium close-up
   framed head to waist (not head-and-shoulders). Say "one horizontal row of
   four views, each occupying one quarter of the image width" — this layout is
   not optional and not yours to redesign.
3. **State that it is the SAME person in every view** — same face, same age, same
   build, same proportions, same wardrobe, photographed moments apart. This is
   the single most important sentence in the prompt: without it the model draws
   four different people.
4. **Weave in their FULL canonical description from the bible** — apparent age,
   sex, build, skin tone, face, hair (colour/length/style), signature wardrobe
   WITH colours, and any defining accessory. Copy the description, not the id.
5. **Pose and presence:** natural stance, relaxed posture, not posing for
   presentation. Subtle variation in head angle and body balance between views,
   like several frames taken moments apart — not four identical cut-outs.
6. **Lighting and finish:** soft, neutral, even lighting on a plain neutral
   backdrop, no dramatic contrast, no stylisation beyond the art style's own
   medium. It should read as real reference photography (or, for an illustrated
   style, as a real character-design reference sheet), not as a finished
   illustration or a hero shot.
7. **End with the art style's "Style suffix" line, verbatim.**

RULES

- ONE character only. No other characters, no scene, no environment, no props
  beyond their signature carried items.
- **No text, letters, numerals, labels, captions, watermarks or view names.**
  Generative models render requested text as garbage, and this sheet is reused by
  every shot in the film, so one garbled label propagates everywhere. The four
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
