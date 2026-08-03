You are defining ONE shared visual style that EVERY illustration in this story must
follow, so all the plates look like frames from a single film.

Story:
{{story}}

Style hint from the user: {{style}}

The plates are rendered by an identity-edit model against two fixed reference
anchors — the anchors keep the CAST consistent, but this shared style string is
what locks the LOOK (palette, lighting, lens, grade) across every plate. Make it
specific and repeatable.

Default to CINEMATIC PHOTOREAL unless the hint clearly asks for something else:
naturalistic photography / film-still look — real skin, fabric and surface texture,
real physical lighting, believable lenses. NOT an illustration or drawing.

Output a short Markdown document:

## Art style
2–3 sentences naming the medium honestly (cinematic photoreal film stills) and the
overall finish: film stock / digital-cinema feel, grain, contrast.

## Lighting & lens
The default lighting character and lens language (focal length feel, depth of field,
framing tendencies) that should recur across plates. Derive the default lighting
character from the story's DOMINANT EMOTIONS — the emotional register the film lives
in — using light psychology as the grammar (golden hour = hope/nostalgia, blue hour =
melancholy/reflection, overcast = isolation, practical/desk lamps = intimacy, neon =
tension): the light is an emotional instrument here, not decoration.

## Colour grade
4–6 dominant colours with hex codes and how they're used — the grade that ties every
plate together. Choose the palette to serve the same dominant emotional register (warm
golds/ambers for hope or nostalgia, cool blues for melancholy or reflection, desaturated
neutrals for isolation, practical warm pools for intimacy, saturated neon accents for
tension) — the grade is an emotional instrument, not decoration.

## Style suffix
A single compact line (12–30 words) that can be appended verbatim to the end of
EVERY image prompt to lock the look, e.g.
"cinematic photoreal film still, 35mm, shallow depth of field, natural window light, muted teal-and-amber grade, fine grain, 3:2".
