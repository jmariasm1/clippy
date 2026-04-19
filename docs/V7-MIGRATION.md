# V7 Migration

## What Changed

V6 shipped as a very large single-file HTML runtime with inline sprite payloads. V7 moves the active runtime to:

- external JavaScript modules in `src/`
- repository-backed sprite files in `assets/sprites/`
- a lightweight HTML shell in `index-v7.html`

Historical versions `1` through `6` remain preserved as standalone HTML files.

## Asset Moves

The active sprite files were moved from the repository root into organized folders:

- `sprite.png` -> `assets/sprites/characters/clippy/clippy_idle.png`
- `dot_idle.png` -> `assets/sprites/characters/dot/dot_idle.png`
- `dot_bouncing.png` -> `assets/sprites/characters/dot/dot_bouncing.png`
- `dot_in_ground.png` -> `assets/sprites/characters/dot/dot_in_ground.png`
- `dot_star_1.png` -> `assets/sprites/characters/dot/dot_star_1.png`
- `dot_star_2.png` -> `assets/sprites/characters/dot/dot_star_2.png`
- `powerpup_idle.png` -> `assets/sprites/characters/powerpup/powerpup_idle.png`
- `powerpup_flying_up.png` -> `assets/sprites/characters/powerpup/powerpup_flying_up.png`
- `hover_body.png` -> `assets/sprites/characters/hoverbot/hover_body.png`
- `hover_eye_1.png` through `hover_eye_7.png` -> `assets/sprites/characters/hoverbot/`
- `scribble_idle_1.png` through `scribble_idle_3.png` -> `assets/sprites/characters/scribble/`
- `scribble_jump_0.png` through `scribble_jump_4.png` -> `assets/sprites/characters/scribble/`
- `logo_idle.png` -> `assets/sprites/characters/logo/logo_idle.png`

## Runtime Refactor

### Before

- inline base64 assets inside the active runtime
- hardcoded unlock checks and character buttons
- hardcoded obstacle selection logic
- per-character unlock flags

### After

- `ASSET_MANIFEST` preloads repo files
- character menu is generated from the playable registry
- obstacle and power-up availability comes from content registries and spawn tables
- unlock notice tracking uses a generic store

## Persistence Compatibility

The stable best-score key is unchanged:

- `clippy_airmail_best`

Legacy unlock-seen flags are migrated into:

- `clippy_airmail_unlock_seen`

## Character Model Correction

The corrected V7 role model is:

- `dot`: obstacle and unlockable playable character
- `powerpup`: obstacle and unlockable playable character
- `hoverbot`: obstacle and unlockable playable character
- `scribble`: power-up and unlockable playable character

There is no companion role in V7.

## Historical Files

The following files remain as historical snapshots:

- `index-v1.html`
- `index-v2.html`
- `index-v3.html`
- `index-v4.html`
- `index-v5.html`
- `index-v6.html`

They should not be overwritten as part of the V7 migration.

## Remaining Follow-Up Ideas

Future versions can build on V7 with:

- sprite atlas packing
- image compression automation
- automated regression screenshots
- richer content authoring helpers
- optional bundling for production builds
