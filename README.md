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

## Requirements — what you need on your ComfyUI box

Everything here is local: this bundle calls no hosted API. The runners are
public, but they are thin — the weights and the two custom node packs are yours
to install, and there is a real gap in the H3 diffusion model (below) that you
have to make a decision about before your first run.

Two things are deliberately kept apart in this section. **"Installed"** is what
the box this bundle was developed on actually reports, which is ground truth for
*filenames* — the workflows hardcode them, and a mismatch is an instant node
error. **"Source"** is where a stranger can download that file, which is a
different question and, for three files, has a different answer.

Every source below was checked by fetching the repository's own file listing and
confirming the exact filename appears in it. Anything not confirmable that way is
marked and told what to do instead, rather than given a plausible-looking URL.

**ComfyUI ≥ 0.30.0.** That is Comfy's own stated floor for MiniMax H3
([tutorial](https://docs.comfy.org/tutorials/video/minimax/minimax-h3)), and it
is the version this bundle was built against.

### Custom node packs — there are only two

| pack | provides | install |
|---|---|---|
| **ComfyUI_NVIDIA_RTX_Nodes** (`comfyui_nvidia_rtx_nodes`) | `RTXVideoSuperResolution` | [Comfy-Org/Nvidia_RTX_Nodes_ComfyUI](https://github.com/Comfy-Org/Nvidia_RTX_Nodes_ComfyUI) — or search "RTX" in ComfyUI Manager |
| **Krea 2 Identity Edit** (`comfyui-krea2edit`) | `Krea2EditGroundedEncode`, `Krea2EditModelPatch` | [lbouaraba/comfyui-krea2edit](https://github.com/lbouaraba/comfyui-krea2edit) |

Both were confirmed against the live box, which reports each node's owning
python module — `custom_nodes.comfyui_nvidia_rtx_nodes` and
`custom_nodes.comfyui-krea2edit` respectively, matching each repo's own
`pyproject.toml` `name`. The Krea2 pack and the `krea2_identity_edit_*` LoRAs
share an author, so the pack and its weights version together.

`RTXVideoSuperResolution` **requires an NVIDIA RTX GPU** — the pack's README says
so outright, and the node is a driver/TensorRT feature (its dependency is
`nvidia-vfx`), not a diffusion model. There is no checkpoint, no sampler and no
seed, which is why the upscale pass is seconds rather than minutes and is
deterministic. On anything that is not an RTX card, `scene_upscaled` has no
fallback; drop the node.

**Everything else is native ComfyUI, including the two that look like they should
not be.** `MiniMaxH3ReferenceToVideo` is core
(`comfy_extras/nodes_minimax_h3.py`) and so is `EasyCache`
(`comfy_extras/nodes_easycache.py`) — neither needs a pack, and both are present
in 0.30.0. The rest are long-standing core nodes and come with any current
ComfyUI: `PrimitiveStringMultiline`, `LoadVideo`, `GetVideoComponents`,
`CreateVideo`, `SaveVideo`, `VAEDecodeAudio`, `ModelSamplingAuraFlow`,
`EmptySD3LatentImage`, `LoraLoaderModelOnly`, `RandomNoise`, `BasicGuider`,
`BasicScheduler`, `KSamplerSelect`, `SamplerCustomAdvanced`. The three
`CLIPLoader` types the workflows select — `minimax`, `krea2`, `lumina2` — are all
in 0.30.0's type enum.

### Model files

Four workflows, four model sets. `rtx_vsr_video.json` needs none.

| file | goes in | source | verified? |
|---|---|---|---|
| **`minimax_h3_r2v.json`** — `scene_clip` | | | |
| `minimax_h3_ref2va_pruned_nvfp4.safetensors` | `models/diffusion_models/` | [lilcheaty/MiniMax-H3-NVFP4](https://huggingface.co/lilcheaty/MiniMax-H3-NVFP4) (repo root) | **VERIFIED** — exact filename, 12.5 GB. Community requant, not Comfy-Org. Read the caveat below. |
| `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | `models/text_encoders/` | [Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/text_encoders) | **VERIFIED** — 15.7 GB |
| `minimax_h3_video_vae_fp16.safetensors` | `models/vae/` | [Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/vae) | **VERIFIED** — 5.21 GB |
| `minimax_h3_audio_vae_fp32.safetensors` | `models/vae/` | [Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/vae) | **VERIFIED** — 605 MB |
| **`krea2_edit.json`** — `character_state_view` | | | |
| `krea2_turbo_fp8.safetensors` | `models/diffusion_models/` | [AlperKTS/Krea2_FP8](https://huggingface.co/AlperKTS/Krea2_FP8) (repo root) | **VERIFIED** — exact filename, 12.9 GB. Not the same file as Comfy-Org's; see below. |
| `qwen3vl_4b_fp8_scaled.safetensors` | `models/text_encoders/` | [Comfy-Org/Krea-2](https://huggingface.co/Comfy-Org/Krea-2/tree/main/text_encoders) | **VERIFIED** — 5.24 GB (byte-identical copy also in AlperKTS/Krea2_FP8) |
| `wan_2.1_vae.safetensors` | `models/vae/` | [Comfy-Org/Wan_2.1_ComfyUI_repackaged](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/tree/main/split_files/vae) | **VERIFIED** — 254 MB. Comfy's Krea 2 tutorial uses `qwen_image_vae.safetensors` instead; see below. |
| `krea2_identity_edit_v1_2.safetensors` | `models/loras/` | [conradlocke/krea2-identity-edit](https://huggingface.co/conradlocke/krea2-identity-edit) | **VERIFIED** — 1.83 GB. Same author as the node pack. |
| `kroma-v0.1_krea2.safetensors` | `models/loras/` | [lodestones/Kroma](https://huggingface.co/lodestones/Kroma) — as **`kroma-v0.1.safetensors`** | **RENAME** — upstream file verified (1.88 GB); our filename is a local rename, not an upstream name |
| **`zimage_tti.json`** — the three anchor stages | | | |
| `zit_turbo_stableyogi_bf16.safetensors` | `models/diffusion_models/` | [Civitai 2221503](https://civitai.com/models/2221503/zimage-turbo-by-stable-yogi), BF16 version — ships as **`zimageTurboByStable_2602BF16.safetensors`** | **RENAME / SUBSTITUTE** — see below |
| `qwen_3_4b.safetensors` | `models/text_encoders/` | [Comfy-Org/z_image_turbo](https://huggingface.co/Comfy-Org/z_image_turbo/tree/main/split_files/text_encoders) | **VERIFIED** — 8.05 GB |
| `ae.safetensors` | `models/vae/` | [Comfy-Org/z_image_turbo](https://huggingface.co/Comfy-Org/z_image_turbo/tree/main/split_files/vae) | **VERIFIED** — 335 MB |

### The four things that are not clean

**1. The H3 diffusion model is a community requant, and the numbers in this
README were not measured on it.** `minimax_h3_ref2va_pruned_nvfp4.safetensors`
exists at exactly that name in `lilcheaty/MiniMax-H3-NVFP4`, but **Comfy-Org's
own MiniMax-H3 repo has no nvfp4 diffusion model at all** — its
`diffusion_models/` holds only `bf16`, `int8_convrot`, `pruned_fp8_scaled` and
`pruned_int8_convrot`, for each of `fl2va` and `ref2va`. The nvfp4 build is
doubly quantized (bf16 → int8_convrot → nvfp4) by a third party, its own README
says it was spot-checked on three matched seeds rather than evaluated properly,
and **native nvfp4 dispatch needs a Blackwell GPU** (50-series, RTX PRO 6000,
B200); on older cards the format is emulated, so the file is not a speedup there.

If you would rather not take that on, use
**`minimax_h3_ref2va_pruned_int8_convrot.safetensors`** from
[Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/diffusion_models)
(21 GB) and change `UNET.inputs.unet_name` in your copy of
`workflows/minimax_h3_r2v.json`. That is Comfy's own prescribed R2V file, it is
what Comfy's tutorial documents, and **this bundle previously ran on exactly
that file** — every measurement in the probe and in the comparison table further
down was taken on it. So it is a proven substitution rather than a guess, and it
is arguably the better default: the int8 weights already dispatch to native
kernels, so there is no dequantise-to-bf16 tax to escape. Keep
`weight_dtype: default` either way — the fp8 options would re-cast an
already-quantised model.

The reproducibility gap this leaves is real and worth stating plainly: the
workflow as committed names weights that the model's own publisher does not
distribute, and nothing in this repo has been benchmarked on them.

**2. `krea2_turbo_fp8` and `krea2_turbo_fp8_scaled` are genuinely different
files.** Comfy-Org/Krea-2 ships `krea2_turbo_fp8_scaled.safetensors`
(13,141,730,784 bytes, sha256 `eb4dd8c6…`); AlperKTS/Krea2_FP8 ships
`krea2_turbo_fp8.safetensors` (12,900,096,996 bytes, sha256 `2d352350…`). Not a
rename — different quantisations. Our workflow names the AlperKTS one, so the
zero-friction path is to take it from there. If you prefer Comfy-Org's official
scaled build, download it and edit `unet_name`; do not rename one to the other
and expect the two to be interchangeable.

**3. The Krea2 VAE.** Comfy's Krea 2 tutorial pairs the model with
`qwen_image_vae.safetensors`; our workflow names `wan_2.1_vae.safetensors`. These
are also two different files (sha256 `a70580f0…` vs `2fc39d31…`, differing in
size by ~9 KB) even though Krea 2's VAE is architecturally the Wan-2.1 one. Both
are installed on the development box and the workflow as committed loads
`wan_2.1_vae.safetensors`, so that is what the table points at. Following the
official tutorial instead — `qwen_image_vae.safetensors` from
[Comfy-Org/Krea-2](https://huggingface.co/Comfy-Org/Krea-2/tree/main/vae), and an
edit to `vae_name` — is the more conservative choice and untested here.

**4. Two filenames are local renames, one of them of a Civitai finetune.**
`kroma-v0.1_krea2.safetensors` is `lodestones/Kroma`'s `kroma-v0.1.safetensors`
with a suffix added; rename on download. `zit_turbo_stableyogi_bf16.safetensors`
is a Civitai Z-Image Turbo finetune, and Civitai's own filenames are
version-stamped (`zimageTurboByStable_2602BF16.safetensors`, 12.02 GB), so
**there is no public URL that serves our exact filename** — download the BF16
version and rename it. If you would rather not depend on a Civitai account or a
finetune that may be re-versioned under you, substitute base Z-Image Turbo:
`z_image_turbo_bf16.safetensors` (12.3 GB) from
[Comfy-Org/z_image_turbo](https://huggingface.co/Comfy-Org/z_image_turbo/tree/main/split_files/diffusion_models),
which is VERIFIED and pairs with the same `qwen_3_4b` encoder and `ae` VAE. The
anchor plates will look different — that finetune was chosen for skin and
lighting — but the pipeline is unaffected.

### Hardware reality

This is a 32 GB-class NVIDIA box, and a film is an afternoon.

- **H3 does not fit in VRAM and that is fine.** The model set stages **39.5 GB
  against 32 GB** with ComfyUI's async weight offloading. Measured across four
  runs there is **no VRAM cliff** — offloading is a roughly constant tax, not a
  threshold you fall off. It also means attention is not the bottleneck:
  SageAttention explicitly on vs explicitly off measured 2.01 vs 2.02 s/it, i.e.
  nothing. Less than 32 GB is untested.
- **Resolution is the only real cost dial, and it is superlinear.** A 5s,
  124-frame clip took **55s at 832×480** and **205s at 1344×768** — cost scales
  as roughly **pixels^1.3**, partly because `ref_image_size: match` scales
  reference tokens to the output's pixel area and those ride through all 20
  sampling steps.
- **So budget hours, not minutes.** Sections run up to 15s — three times the
  clip that measured 205s — and a film is around ten sections. Render at 480p
  while you are iterating on prompts and pay for native geometry only on a final
  cut.
- **The upscale pass is nearly free by comparison.** RTX VSR took a real 832×480,
  12.25s H3 scene to **1920×1080 in 12 seconds**, audio preserved. That is what
  makes "render cheap, upscale after" a live option rather than a slogan.

All of the above was measured on the **int8 + `beta`** graph
(`dhee-cofounder/artifacts/h3-r2v-probe/README.md`,
`artifacts/rtx-vsr-probe/out/results.json`). The committed workflow now uses
nvfp4 + `EasyCache` + `bong_tangent`, none of which those runs cover, so treat
the timings as the right order of magnitude and the fidelity as unmeasured.

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
