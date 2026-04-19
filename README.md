# Clippy Air Mail V7

`Clippy Air Mail` is a static browser game that now runs from a lightweight HTML shell plus repository-backed JavaScript modules and sprite files.

Version 7 removes the inline sprite payloads from the runtime, adds a structured content system for unlockable playable characters, obstacle characters, and power-up characters, and keeps the game deployable as a plain static site.

## Current Roles

- `clippy`: default playable character.
- `dot`: obstacle character and unlockable playable character.
- `powerpup`: obstacle character and unlockable playable character.
- `hoverbot`: obstacle character and unlockable playable character.
- `scribble`: power-up character and unlockable playable character.
- `logo`: power-up character and unlockable playable character with a 20-second invincibility shield on pickup.
- `motherNature`: power-up character and unlockable playable character with a 15-second nature aura that slows the game by 20%.
- `will`: power-up character and unlockable playable character with a 15-second feather ride that auto-pilots around obstacles.
- `staticLogo`: secret playable variant unlocked by password only. It glows, stays flipped 180 degrees, does not spin, and is always invincible.

There is no companion role in v7.

## Controls

- `Tap`, `click`, or `Space`: flap.
- `P` or `Esc`: pause and resume.
- Use the start screen to switch language, choose from currently unlocked characters, reset the saved best score, or open the on-canvas `Password Mode` panel for development testing in the browser.
- When five or more playable characters are unlocked, the selector automatically wraps into two rows on both the start screen and the `Out of Office` screen.

## Password Mode

`Password Mode` is a developer shortcut for setting the saved best score manually so you can test unlockable characters without replaying long runs.

How to use it:

- Open `Password Mode` from the start screen or the game-over screen.
- Enter the current development password: `v7dev`
- Press `Enter` or click `Continue`.
- Enter the best score you want to simulate, for example `5`, `10`, `15`, `20`, `25`, `30`, `35`, or `40`.
- Press `Enter` or click `Apply`.

Special password:

- Enter `staticlogo` in Password Mode to unlock `Static Logo`.

Notes:

- The selector updates immediately after the new best score is saved.
- `Esc` or `Cancel` closes the panel without changing anything.
- Use `Reset score to 0` if you want to relock the unlockable roster during testing.
- If you ever change the password, update `DEV_BEST_SCORE_PASSWORD` in `src/game.js`.

## Unlock Thresholds

- `scribble`: best score `5`
- `hoverbot`: best score `10`
- `will`: best score `15`
- `powerpup`: best score `20`
- `logo`: best score `25`
- `dot`: best score `30`
- `motherNature`: best score `35`
- reaching `40` during a run shows the victory screen

Runtime spawn availability is now staggered separately from playable unlocks:

- `scribble` power-up: available immediately.
- `hoverbot` obstacle: available immediately.
- `will` power-up: available at best `5`.
- `powerpup` obstacle: available at best `10`.
- `logo` power-up: available at best `15`.
- `dot` obstacle: available at best `20`.
- `motherNature` power-up: available at best `25`.

## Run Locally

Open `index-v7.html` directly from the repository or serve the folder as a static site.

Example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/index-v7.html`.

Direct `file://` opening is also supported in v7, so you can double-click `index-v7.html` while iterating locally.

`index.html` can also be pointed at the v7 shell when you are ready to promote v7 as the default root entry.

## Project Layout

- `index-v7.html`: lightweight v7 shell.
- `src/main.js`: canvas bootstrap, resize, input, loading state, RAF loop.
- `src/game.js`: game runtime, rendering helpers, managers, and core gameplay state.
- `src/assets.js`: asset manifest and image preload flow.
- `src/content/characters.js`: character family registry and unlock thresholds.
- `src/content/obstacles.js`: non-character obstacle registry.
- `src/content/spawnTables.js`: weighted spawn definitions for obstacle and power-up content.
- `src/behaviors/`: role behavior modules for playable, obstacle, and power-up content.
- `src/i18n.js`: English and Spanish UI strings.
- `src/storage.js`: best score and unlock-seen persistence.
- `assets/sprites/`: repository-backed sprite files used by the runtime.
- `docs/`: architecture and workflow documentation for extending v7.

## V7 Goals

- Keep the game static and GitHub-friendly.
- Remove inline `data:image/png;base64` sprite payloads from the runtime.
- Make character addition systematic through registries and role behaviors.
- Preserve the existing save key `clippy_airmail_best`.
- Migrate legacy unlock notification flags into a generic unlock-seen store.

## Next Docs

- [Architecture](./docs/ARCHITECTURE.md)
- [Content System](./docs/CONTENT_SYSTEM.md)
- [Adding A Character](./docs/ADDING_CHARACTER.md)
- [Asset Pipeline](./docs/ASSET_PIPELINE.md)
- [V7 Migration](./docs/V7-MIGRATION.md)
