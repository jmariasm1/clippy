# Asset Pipeline

## Goal

V7 treats repository files as the source of truth for runtime sprites. The game no longer depends on inline `data:image/png;base64` payloads embedded in the active runtime.

## Folder Layout

- `assets/sprites/characters/clippy/`
- `assets/sprites/characters/dot/`
- `assets/sprites/characters/powerpup/`
- `assets/sprites/characters/hoverbot/`
- `assets/sprites/characters/scribble/`
- `assets/sprites/characters/logo/`
- `assets/sprites/ui/`

## Naming Rules

- Use descriptive lowercase filenames.
- Keep family folders grouped by character id.
- Use stable manifest keys in code.

Examples:

- File: `assets/sprites/characters/clippy/clippy_idle.png`
- Manifest key: `character.clippy.idle`

## Runtime Rule

Gameplay code must reference manifest keys, not raw filenames.

Correct:

- `character.hoverbot.body`
- `character.scribble.jump3`

Incorrect:

- `hover_body.png`
- `scribble_jump_3.png`

## Where Asset Paths Live

`src/assets.js` is the only place that should map:

- logical asset key
- relative repository file path

## Adding A New Sprite

1. Put the file under the correct folder in `assets/sprites/`.
2. Add a manifest entry in `src/assets.js`.
3. Reference that manifest key from:
   - `src/content/characters.js`
   - or menu code
   - or helper logic in `src/game.js`

## Fallback Behavior

If an image fails to load:

- the runtime keeps the game running
- role-specific fallback drawing is used

This makes asset iteration safer while you add or swap sprites.

## Current Character Asset Mapping

- `character.clippy.idle` -> `assets/sprites/characters/clippy/clippy_idle.png`
- `character.dot.*` -> `assets/sprites/characters/dot/`
- `character.powerpup.*` -> `assets/sprites/characters/powerpup/`
- `character.hoverbot.*` -> `assets/sprites/characters/hoverbot/`
- `character.scribble.*` -> `assets/sprites/characters/scribble/`
- `character.logo.idle` -> `assets/sprites/characters/logo/logo_idle.png`

## Future Upgrades

V7 intentionally avoids:

- bundlers
- sprite atlas tooling
- automated compression steps

Those can be added in a future version after the content system is stable. For now the priority is maintainability, low repository weight, and straightforward GitHub deployment.
