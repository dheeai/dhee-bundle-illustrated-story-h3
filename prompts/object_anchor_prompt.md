You are writing the text-to-image prompt for the IDENTITY ANCHOR reference plate
of ONE story-critical OBJECT in an animated illustrated story. Just like every
recurring CHARACTER, a story-critical object (one the plot's actual physical
action hinges on — dropped, caught, thrown, handed off, broken) gets its OWN
anchor image, generated ONCE and then handed to the shot-image edit model
(Krea2 identity-edit) as a reference whenever that object appears in a shot —
so its form, material, colour, size and mounting/handle stay IDENTICAL across
every shot it appears in, instead of drifting shot-to-shot the way pure text
description alone allows (the edit model's own visual prior overrides
unanchored prose — a real observed failure had the SAME lantern render as a
brass hurricane lamp in one shot and a white paper lantern 0.4 seconds later,
even though every prompt said "paper lantern").

Story bible — the canonical visual identity of everything in the story:
{{story_bible}}

Shared art style (obey it; end your prompt with its "Style suffix" line):
{{art_style}}

For object id: {{item_id}} — find it in the `objects` array above and write
ONE text-to-image prompt for a clean identity reference plate of THIS object,
and only this object:

1. Opens by naming the medium (the art style's rendering medium — copy it, do
   not default to photoreal unless that IS the art style; e.g. "luminous
   storybook illustration, soft hand-drawn linework, object reference plate"
   or "cinematic photoreal film still, object reference" if the style is
   photoreal).
2. Shows the object ALONE, centred, on a plain neutral backdrop (no scene, no
   characters, no other props), lit evenly and clearly enough that its
   material, construction and any distinguishing marks read unambiguously —
   this plate exists purely to PIN what the object looks like, not to set a
   mood.
3. Weaves in its FULL canonical description from the bible — exact form/
   shape, material, colour, size, distinctive marks, PLUS how it is held/
   mounted (a handle, a stick, a cord, a ring at the top, a base it rests on)
   even though nothing is holding it in this plate (render it resting
   naturally the way its own mounting allows — standing on its base, or
   hanging from its own ring against the neutral backdrop — never invent a
   NEW support that isn't already fixed in the bible). Copy the description,
   not the id.
4. Ends with the art style's "Style suffix" line, verbatim.

CRITICAL: if the art style is illustrated/anime/painterly/hand-drawn, name that
rendering medium explicitly in the FIRST clause — the image model defaults to
photorealism and ignores mood/lighting cues alone otherwise.

Keep it a single flowing prompt (roughly 3–5 sentences). No text/letters/
watermarks, no split panels, no captions. Output a JSON object:
{
  "imagePrompt": "...",
  "aspectRatio": "2:3",
  "generationMode": "text_to_image"
}
Output ONLY the JSON.
