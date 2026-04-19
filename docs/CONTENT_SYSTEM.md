# Content System

## Purpose

V7 replaces hardcoded character and obstacle branches with a hybrid content model:

- `CHARACTER_FAMILIES` for anything that can be a playable character.
- `OBSTACLE_TYPES` for non-character office hazards.
- `SPAWN_TABLES` for runtime spawn weights and availability.

## Character Families

Each family entry includes:

- `id`
- `sortOrder`
- `nameKey`
- `unlockScore`
- `menuCard`
- `assetKeys`
- `roles`

### Current Families

- `clippy`
- `dot`
- `powerpup`
- `hoverbot`
- `scribble`
- `logo`
- `motherNature`
- `will`

## Supported Roles

V7 supports these roles only:

- `playable`
- `obstacle`
- `powerup`

There is no `companion` role.

## Current Role Matrix

- `clippy`: `playable`
- `dot`: `playable`, `obstacle`
- `powerpup`: `playable`, `obstacle`
- `hoverbot`: `playable`, `obstacle`
- `scribble`: `playable`, `powerup`
- `logo`: `playable`, `powerup`
- `motherNature`: `playable`, `powerup`
- `will`: `playable`, `powerup`

## Role Profiles

A role profile stores only the fields needed for that role. Common examples:

- `behavior`
- `hitRadius`
- `spriteWidth`
- `spriteHeight`
- `mountedWidth`
- `mountedHeight`
- `availabilityScore`

### Example

`scribble.roles.powerup` stores power-up availability and spawn tuning, while `scribble.roles.playable` stores playable sizing and bounce timing.

## Non-Character Obstacles

`OBSTACLE_TYPES` is reserved for hazards that are not playable character families:

- `pencil`
- `scissors`
- `binder`
- `coffee`
- `folders`
- `sticky`
- `ruler`
- `pushpin`
- `eraser`

Use `OBSTACLE_TYPES` when the content is a pure hazard and should not appear in the playable character menu.

## Spawn Tables

`SPAWN_TABLES` describes what can spawn in the world.

### Obstacles

Obstacle entries can point to:

- `type: "obstacleType"` for office hazards
- `type: "characterRole"` for character obstacles

### Power-Ups

Power-up entries currently use:

- `type: "characterRole"`
- `familyId: "scribble"`
- `role: "powerup"`
- `familyId: "logo"`
- `role: "powerup"`
- `familyId: "motherNature"`
- `role: "powerup"`
- `familyId: "will"`
- `role: "powerup"`

## Unlock Model

- Playable unlocks are score-based only.
- The runtime compares `best score` against `family.unlockScore`.
- Role availability can differ from playable unlock score.

### Current Availability Rules

- `scribble` power-up: available immediately
- `hoverbot` obstacle: available immediately
- `will` power-up: available at best `5`
- `powerpup` obstacle: available at best `10`
- `logo` power-up: available at best `15`
- `dot` obstacle: available at best `20`
- `motherNature` power-up: available at best `25`

## Menu Generation

The start menu is generated from `getPlayableFamilies()`, then filtered down to the families that are currently unlocked.

For each visible family, the menu uses:

- `menuCard.assetKey`
- localized family name
- selection state from the active saved character

Locked families do not render in the selector. They appear automatically after the saved best score reaches the family unlock threshold.

When five or more playable families are unlocked, the selector automatically wraps into two rows on both the start screen and the game-over screen.

## Behavior Routing

The content registry does not contain implementation code. It stores behavior ids.

The runtime resolves those ids through:

- `PLAYABLE_BEHAVIORS`
- `OBSTACLE_BEHAVIORS`
- `POWERUP_BEHAVIORS`

That keeps content data declarative while still allowing custom movement, collision, and drawing logic.

## Extension Rule Of Thumb

Use a `character family` when:

- the content can be selected as a playable character
- the content may also appear as an obstacle or power-up

Use an `obstacle type` when:

- the content is only a world hazard
- it should never appear as a playable unlockable character
