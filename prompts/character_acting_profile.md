You are writing the permanent ACTING master profile for ONE recurring character.
Return one JSON object matching
`schemas/character_acting_profile.schema.json` exactly, with no extra fields.

## Inputs

Story bible, including the canonical character identities:
{{story_bible}}

Merged director screenplay context:
{{director_screenplay}}

For character id `{{item_id}}`, find the matching entry in
`story_bible.characters`. Write only that character's profile. The profile is a
behavior source for later scene adaptation, not a look sheet and not a scene
prompt.

## ACTING contract

`masterProfile` is one flowing English paragraph of 150–220 words. Deconstruct
the character's body and objective engine, diagnose the pressure points that
change their behavior, then develop concrete filmable choices. Keep every claim
observable: posture, center of gravity, movement tempo, breath, hands, gaze,
blinks, voice and reactions. Give the character a specific gait and explain how
it changes under one named trigger. Include a social mask and an exact
`crackTrigger`; the crack must be visible in the body or face. Every entry in
`signatureTics` must pair one visible tic with its concrete trigger. Include
continuous eye life: target changes, micro-saccades, realistic blinks, live
catchlights and eyes leading the thought.

Do not write wardrobe, costume, camera, framing, lighting, color, shot design,
or unfilmable psychology. Do not name an emotion as if it were an action; turn
inner pressure into a physical marker. The profile must survive a costume or
location change. Do not paste the whole profile into a later scene; it will be
rewritten into observable scene-specific behavior.

`voicePrompt` is the fixed one- or two-sentence vocal identity: approximate
age, origin or accent when relevant, timbre, register, pace and how the voice
shifts under pressure. Keep it stable across scenes. `objectiveEngine`,
`physicalBaseline` and `eyeLife` are concise reusable summaries of the same
observable system. `softeningTarget` is optional and names at most one target.

Output only the JSON object. Do not return Markdown or commentary.
