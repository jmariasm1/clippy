# Architecture

## Runtime Shape

V7 is still a plain static-site game:

- `index-v7.html` provides the canvas shell.
- `src/main.js` bootstraps the canvas, preloads sprites, handles input, and runs the animation loop.
- `src/game.js` contains the game runtime, managers, rendering helpers, and state machine.

There is no bundler requirement in v7. Relative paths are used so the game can be hosted from a repository or subpath.

## Boot Flow

1. `src/main.js` creates the canvas context.
2. `preloadAssets()` loads every sprite listed in `ASSET_MANIFEST`.
3. `main.js` creates `new Game(ctx, assets)`.
4. `Game` binds the preloaded assets into the runtime and initializes managers.
5. The RAF loop calls `game.update(dt, time)` and then `game.draw(ctx)`.

## Core Modules

### `src/assets.js`

- Defines `ASSET_MANIFEST`.
- Preloads image assets into `{ img, ready, error }` objects.

### `src/content/characters.js`

- Defines `CHARACTER_FAMILIES`.
- Stores:
  - playable unlock score
  - menu card asset
  - role profiles
  - role-specific behavior ids

### `src/content/obstacles.js`

- Defines non-character office hazards.
- Stores the obstacle behavior id and collision gap inset.

### `src/content/spawnTables.js`

- Stores weighted obstacle spawn entries.
- Stores power-up spawn entries.
- Filters character-role entries by best-score availability.

### `src/behaviors/`

- `playable.js`: playable character draw and flap hooks.
- `obstacle.js`: obstacle role hooks.
- `powerup.js`: power-up role hooks.

The runtime delegates role-specific logic through these behavior modules while keeping the simulation loop centralized.

## Game State Machine

`Game.state` uses:

- `start`
- `running`
- `paused`
- `gameover`
- `victory`

### `start`

- Background animates slowly.
- The selected playable character idles.
- Language buttons, character cards, reset button, and start button are active.

### `running`

- The player updates with gravity and flap input.
- `ObstacleManager` advances and spawns obstacle content.
- `PowerupManager` advances and spawns the `scribble`, `logo`, `motherNature`, and `will` power-ups.
- Score increments when obstacles are passed.
- Score `40` ends the run in the victory state instead of continuing indefinitely.
- Unlock notices are queued after a crash if a new best score crosses thresholds.

### `paused`

- Simulation freezes.
- Resume button and keyboard resume are available.

### `gameover`

- The player falls and settles.
- Background scroll slows down.
- Replay button restarts a new run.

### `victory`

- The background keeps drifting slowly.
- The player returns to an idle pose.
- The overlay shows the full playable cast with animated previews.

## Managers

### Player

- Resolved from `CHARACTER_FAMILIES`.
- Uses a `playable` role profile plus a behavior module.
- Shared physics remains in `Player`.
- Character-specific sprite drawing is delegated through `PLAYABLE_BEHAVIORS`.

### ObstacleManager

- Uses `resolveObstacleSpawnEntries()` and `pickWeightedSpawnEntry()`.
- Creates `SpawnedObstacle` entities with:
  - `roleType`
  - `contentId`
  - role profile
  - behavior module
- Supports both:
  - non-character office hazards
  - character obstacles such as `dot`, `powerpup`, and `hoverbot`

### PowerupManager

- Uses `getAvailablePowerupEntries()`.
- Spawns power-up family entries that are currently available.
- Supports:
  - `scribble` carry state
  - `logo` timed orbiting shield state
  - `motherNature` timed aura state with flower particles and slower world speed
  - `will` timed feather ride with auto-pilot obstacle avoidance

## Update Order

When running:

1. Update timers and overlay state.
2. Update particles and score pops.
3. Update background scroll.
4. Update player or active power-up ride.
5. Update active timed power-up states.
6. Update power-ups.
7. Update obstacles.
8. Process audio triggers from entity events.
9. Award score for passed obstacles.
10. Resolve collisions and crash if needed.

## Draw Order

1. Background
2. Obstacles
3. Power-ups
4. Particles
5. Player
6. Active power-up visuals
7. HUD
8. Overlays
9. Credits

## Persistence

### Stable Key

- `clippy_airmail_best`

### Unlock Notice State

V7 stores unlock notice state in a generic map:

- `clippy_airmail_unlock_seen`

Legacy per-character flags are migrated automatically:

- `clippy_airmail_dot_unlock_seen`
- `clippy_airmail_powerpup_unlock_seen`
- `clippy_airmail_hoverbot_unlock_seen`
- `clippy_airmail_scribble_unlock_seen`

## Design Rules

- Keep historical versions `1` through `6` untouched.
- Reference runtime images only through manifest keys.
- Add new playable or role content through registries and behavior modules.
- Do not reintroduce inline sprite payloads into the runtime.
