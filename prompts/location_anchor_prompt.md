You are writing the text-to-image prompt for the SETTING PLATE of ONE recurring
location in an illustrated story film.

WHY THIS PLATE EXISTS, AND WHY IT IS DIFFERENT FROM A CHARACTER/OBJECT ANCHOR.
LTX MSR (Multiple-Subject-Reference) takes a short ordered list of reference
images per shot: the shot's SUBJECTS first, and the BACKGROUND/SETTING image
LAST. The background reference is what stops the same place from being rebuilt
differently in every shot — a market lane that is cobbled and awninged in one
shot and an open paved street in the next. So this plate is not an identity
plate for a *thing*; it is the canonical PLACE, and it must read as an
inhabitable space with real depth, not as a flat backdrop.

Story bible — the canonical visual identity of everything in the story:
{{story_bible}}

Shared art style (obey it; end your prompt with its "Style suffix" line):
{{art_style}}

## LIRA authoring pass

Before writing, deconstruct the canonical location and art-style inputs, then
diagnose ambiguity in depth, materials, habitual light, palette and accidental
foreground subjects. Develop concise natural prose from the source-derived
palette, observable architecture, physical materials, surface finish and
direction and quality of light. Keep aspect ratio and resolution as platform
fields in the JSON, never as prompt prose. Use positive descriptions for the
desired empty setting rather than a keyword stack. Forbid accidental text, labels,
and watermarks, extra people or animals, invented architecture and redesigned
identity details.

For location id: {{item_id}} — find it in the `locations` array above and write
ONE text-to-image prompt for a clean setting plate of THIS place, and only this
place:

1. Opens by naming the medium (the art style's rendering medium — copy it, do
   not default to photoreal unless that IS the art style; e.g. "luminous
   storybook illustration, soft hand-drawn linework, establishing view" or
   "cinematic photoreal film still, establishing wide" if the style is
   photoreal).
2. Shows the place EMPTY — **no people, no animals, no character present**. A
   figure in the background plate fights the subject references and produces a
   duplicated or half-melted extra person in the render. If the bible describes
   the place as busy or crowded, render the ARCHITECTURE and STALLS of that
   crowded place with the crowd absent.
3. Is composed as a WIDE ESTABLISHING VIEW at roughly eye level with clear
   foreground / middle-ground / background separation, so MSR has real depth to
   place subjects into. Do not compose it as a tight detail, a texture swatch,
   or a flat head-on wall.
4. Weaves in its FULL canonical description from the bible — architecture,
   materials, surfaces underfoot, colour palette, era, characteristic clutter
   or furnishing, PLUS its habitual light (time of day, direction and quality
   of light, weather). Copy the description, not the id.
5. Ends with the art style's "Style suffix" line, verbatim.

NO LEGIBLE TEXT. Signage, lettering and numerals must be described as
indistinct, faded or out-of-focus shapes — never as readable words. Generative
image models render requested text as garbage, and a background plate is reused
by every shot in this location, so one garbled sign propagates through the whole
film.

CRITICAL: if the art style is illustrated/anime/painterly/hand-drawn, name that
rendering medium explicitly in the FIRST clause — the image model defaults to
photorealism and ignores mood/lighting cues alone otherwise.

Keep it a single flowing prompt (roughly 3–5 sentences). No split panels, no
captions, no watermarks. Output a JSON object:
{
  "imagePrompt": "...",
  "aspectRatio": "16:9",
  "generationMode": "text_to_image"
}
Output ONLY the JSON.
