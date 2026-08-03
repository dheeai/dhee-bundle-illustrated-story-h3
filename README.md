# illustrated_story_h3

Story in, film out. The **MiniMax H3 (Hailuo 03)** sibling of
`illustrated_story_msr` — same planning pipeline, but each SECTION is rendered
as **one multi-cut clip of up to 15 seconds** with native synced stereo audio,
instead of a run of one-shot clips stitched together.

## What actually changed

Everything up to and including the character-state plates is the same pipeline
as `illustrated_story_msr`: any-length chapter split, per-chapter
bible/screenplay/outline with `previousN` carry-forward, deterministic merge,
anchor plates for every recurring character / story-critical object /
location, a character state ledger and per-state edited plates.

The last stretch of the graph is what's different.

| | `illustrated_story_msr` | `illustrated_story_h3` (this bundle) |
|---|---|---|
| render granularity | one clip per **shot** | one clip per **section** |
| cuts | a clip is one continuous take; every cut in the film is a seam between two independent generations | **several cuts inside one generation** — the whole scene is internally consistent by construction |
| clip length | 4–10s, LTX's 8n+1 grid | **5–15s**, H3's 17k+5 grid (124–362 frames @24fps) |
| reference budget | 5 plates, background last | **9 plates**, background last |
| reference binding | none — MSR matches prose to plates by appearance | **explicit** — the runner prepends a `<Picture N> — <appearsAs>. Use it for <job>.` clause |
| negative prompt | a real negative path (NAG) | **none** — H3 ref2va is guidance-distilled, so negatives are written as prose |
| nodes | `shot_brief` → `shot_video_prompt` → `shot_clip` | `scene_video_prompt` → `scene_clip` |

The section→clip mapping is not a stretch: `plan.chapter_merge` already splits
each chapter's `durationSec` across its sections at roughly **15 seconds per
section**, so one section already *was* about one H3 call's worth of film. The
shots the planner budgets for a section now become the **cuts inside** that one
render rather than separate clips.

## The prompt stage is the interesting part

`prompts/scene_video_prompt.md` encodes MiniMax's own documented H3 guidance,
because this model rewards a very specific way of writing:

1. **Every reference gets an explicit job.** "Use Image 1 for the mood and film
   texture; Image 2 for the talent; Image 3 for the bag" measurably beats
   handing it four images and a description. The authoring model supplies
   `appearsAs` + `job` per reference; the **runner** turns those into the
   numbered `<Picture N>` clause, because only the runner knows the final slot
   order (state substitution, background-last routing and the 9-ref cap all run
   after the prompt is written).
2. **A timecoded shot list**, written literally as `[0-4 seconds] … [4-9
   seconds] … [9-15 seconds] …`, tiling the whole duration with no gaps. This is
   what stops a 15-second render drifting into a slideshow.
3. **Transitions as physical events, not named effects.** "A hard cut on the
   scrape of the basket", "a whip pan that smears the lanterns into streaks" —
   H3 renders described transitions and ignores labelled ones.
4. **Directed audio.** The model generates synced stereo sound, so the prompt
   names the ambient bed, foley pinned to specific beats, score with its
   instrumentation and timing, and dialogue as a short quoted line with a
   delivery cue.
5. **A specific do-not sentence.** Negative direction works unusually well here
   and there is nowhere else to put it — the graph has no negative conditioning
   input at all.

### The one hard rule for the prose

`videoPrompt` must contain **no slot numbers** — no "Image 1", no "Picture 2",
no "reference 3". The runner supplies the numbering; a second, contradictory
one is the fastest way to break identity. The prose re-describes every subject
by appearance so prose and plates agree.

## Render recipe

`workflows/minimax_h3_r2v.json` is ComfyUI's stock `video_minimax_h3_r2v`
template with the node ids made readable and three helper nodes removed
(`ResolutionSelector`, `ComfyMathExpression`, `PrimitiveFloat`) — the runner
computes width/height/length itself and writes them straight onto the H3 node.
It also rebuilds the node's `ref_images` autogrow group: every
`ref_images.ref_image_<N>` dotted key is discarded and re-created, one per
resolved plate, each fed by a `LoadImage` the runner appends.

Defaults, all matching the node's own reported schema:

- **1344×768** — H3's native geometry (768 short edge, capped 768×1344, /32)
- **`length` on the 17k+5 grid**, 124 (≈5s) to 362 (≈15.08s); the node itself
  declares `step: 17` and a tooltip reading *"trained range is ~124-362"*
- **`res_multistep` + `beta`**, 20 steps — `beta` over the stock template's
  `simple` is Comfy's own recommendation for reference-heavy prompts
- **`ref_image_size: "match"`** — scales references to the generation
  resolution. `"max"` preserves a 2048px short edge for stronger identity but
  is several times slower, since reference tokens ride through every step.

Models required on the box:

```
minimax_h3_ref2va_pruned_int8_convrot.safetensors   (diffusion, ref2va — NOT the fl2va t2v/i2v model)
qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors        (CLIP, type "minimax")
minimax_h3_video_vae_fp16.safetensors
minimax_h3_audio_vae_fp32.safetensors
```

## Stateful characters

Unchanged from `illustrated_story_msr` — the ledger, the deduplicated distinct
states, the per-state edit prompts and the edited plates all work identically,
and `comfy.minimax_h3_r2v` performs the same `byShot` substitution.

One difference falls out of rendering a whole scene at once: **a character can
only be held from ONE plate per render.** When a section's shots span two
different states, the runner merges them in shot order and the **last** wins —
the plate shows the state the scene ends in, and the change itself is carried
by the prose. If a mid-scene wardrobe change has to be *seen* happening on a
plate, split it into two sections.

## Runner notes

`plan.character_states`, the anchor/state image stages and the per-shot
reference routing still come from `dhee-runner-ltx-reference`; the video stage
comes from `dhee-runner-minimax-h3`. Register both before running:

```
ln -sfn ~/.kshana/runners/dhee-runner-ltx-reference \
        ~/Projects/dhee-core/node_modules/dhee-runner-ltx-reference
ln -sfn ~/.kshana/runners/dhee-runner-minimax-h3 \
        ~/Projects/dhee-core/node_modules/dhee-runner-minimax-h3
```

`comfy.minimax_h3_r2v` reference precedence: per-item `referenceInputs` routing
(this bundle) → static `refImages`.

## Why this bundle exists rather than illustrated_story_msr

Head-to-head on the same shot, same box, matched geometry and duration
(`dhee-cofounder/artifacts/h3-r2v-probe/ltx_compare.mjs`):

| | LTX-2.3 MSR | MiniMax H3 |
|---|---|---|
| geometry / frames | 1280×736, 121 (5.04s) | 1280×720, 124 (5.17s) |
| steps | **8** (DMD distilled) | **20** |
| per step | 2.31 s/it | ~6.6 s/it |
| **total** | **74s** | **154s** |

H3 costs ~2.1× per call — and the founder's verdict on the two clips was that
H3 is **much better on every axis that was compared: identity/face, motion and
physics, detail and texture, and audio.** That is the whole justification for
this bundle: LTX MSR is not a quality fallback, it is a cheaper and visibly
worse render.

Two things follow, and they matter when tuning:

1. **Do not trade resolution away to save time.** Detail and texture is one of
   the axes H3 wins on; dropping to 480p spends exactly what is being paid for.
   Hence the 1344×768 default.
2. **The per-CALL comparison flatters LTX.** LTX renders one continuous take, so
   a three-cut scene is three calls (~222s) plus three hard seams between
   independent generations. H3 renders all three cuts in ONE call, internally
   consistent. Per finished scene the gap narrows sharply and may invert — the
   15s/362-frame measurement that would settle it has not been taken yet (cell
   B was interrupted).

Most of H3's per-call disadvantage is step COUNT, not the model: LTX's chain
carries a DMD distillation LoRA and runs an 8-step `ManualSigmas` schedule
while H3 ref2va is undistilled at 20 steps. If an H3 step-distillation LoRA
appears, that gap largely closes. SageAttention is already globally enabled on
the box, so it is not an untapped lever; `EasyCache`/`LazyCache` and step count
are. Both carry risk on identity, which is one of the axes H3 is winning —
measure against a known-good clip rather than assuming.

## Known limitations / open items

1. **Over-long sections are clamped.** A section whose planned shots sum past
   15s is clamped (the runner logs it) and the tail of its shot list will not
   render. The prompt stage is told to fold or drop the least essential beat
   instead; the proper fix is splitting an over-long section into two H3 calls.
2. **`ref_videos` / `ref_audios` are not wired.** The node accepts up to 3
   reference videos (motion, camera and performance transfer) and 3 reference
   audios (voice cloning), cited in the prompt as `<Video N>` / `<Audio N>`.
   Same dotted-key autogrow mechanism as `ref_images`; the runner only wires
   images today. Voice cloning in particular would replace the ID-LoRA path
   `comfy.ltx_msr` uses.
3. **Location states are not implemented** — carried over from
   `illustrated_story_msr`. Locations change across a story exactly as
   characters do (time of day, weather, damage, dressing) and hit the same
   plate-vs-prompt contradiction. Today the bible pins ONE light per location as
   a workaround. If built, states should be **edited from** the base location
   plate, not regenerated per state, and the edit prompt must be explicit about
   preserving architecture, materials and layout, because a time-of-day change
   is a global relight rather than a local delta.
4. **Not yet run end to end.** The runner is unit-tested, the graph and the
   dotted-key assumption are validated against a live box by the probe below,
   and the bundle loads and resolves — but no full project has been driven
   through it.

## Validation

`dhee-cofounder/artifacts/h3-r2v-probe` drives this bundle's own workflow and
the runner's own exported helpers against a live box: node + model preflight,
the `ref_images.ref_image_<N>` autogrow assumption, a 5s smoke cell, and a 15s
three-cut production cell checked for a video *and* an audio stream.

## Inputs

`story_input` (the story), `style` (visual style hint), `narration`,
`target_duration`. No brand/logo/caption wiring — this bundle is story in, video
out, and is a deliberate exception to the repo's brand-injection rule.
