# Adding A Character

This guide covers the repeatable V7 workflow for adding a new unlockable playable character.

## 1. Decide The Role Set

Pick one or more supported roles:

- `playable`
- `obstacle`
- `powerup`

Do not create a `companion` role. V7 does not use it.

## 2. Add Sprite Files

Place the new sprite files in:

- `assets/sprites/characters/<family-id>/`

Examples:

- `assets/sprites/characters/inkbot/inkbot_idle.png`
- `assets/sprites/characters/inkbot/inkbot_obstacle.png`

## 3. Register Asset Keys

Update `src/assets.js`:

- add stable manifest keys
- point each key to a repository file path

Prefer logical keys such as:

- `character.inkbot.idle`
- `character.inkbot.obstacle`

Do not reference raw filenames directly from gameplay code.

## 4. Add The Family Entry

Update `src/content/characters.js`:

- add a new family object
- assign `sortOrder`
- set `unlockScore`
- define `menuCard.assetKey`
- define `assetKeys`
- add each role profile under `roles`

### Example Questions

- What score unlocks the playable character?
- Does this family also appear as an obstacle?
- Does this family also behave as a power-up?

## 5. Add Localized Strings

Update `src/i18n.js`:

- `family.<id>.name`
- `unlock.<id>.title`
- `unlock.<id>.body`

Add entries for both `en` and `es`.

## 6. Wire The Behavior Module

Add or reuse a behavior id:

- `src/behaviors/playable.js`
- `src/behaviors/obstacle.js`
- `src/behaviors/powerup.js`

If the new role behaves like an existing one, reuse that behavior id.

If it needs custom logic, add a new behavior object and then implement the matching helper hooks in `src/game.js`.

## 7. Add Spawn Rules

If the family should spawn in the world, update `src/content/spawnTables.js`.

### For obstacles

Add a `characterRole` obstacle entry with:

- `familyId`
- `role: "obstacle"`
- `weightBase`
- `weightDifficulty`

### For power-ups

Add a `characterRole` power-up entry with:

- `familyId`
- `role: "powerup"`
- `chance`
- spacing values

## 8. Check The Menu

The start screen is generated from the playable registry. Once the family exists and has a `playable` role, it will appear automatically.

If enough families are unlocked at the same time, the selector will automatically wrap into two rows. You should not need to hardcode a special menu path for larger rosters.

You should only need to verify:

- card icon
- name
- lock threshold
- selected-state appearance

## 9. Check Unlock Behavior

Unlock notices use the family id and the generic unlock-seen store.

You should verify:

- the family stays locked below its threshold
- it unlocks when the best score reaches `unlockScore`
- the unlock notice appears once
- resetting best score relocks the family

## 10. Smoke Test

For a new family, verify:

- playable rendering works
- hit radius feels correct
- obstacle or power-up behavior triggers correctly
- no missing asset fallbacks are used unexpectedly

## Minimal Checklist

- Sprite files added
- Asset manifest keys added
- Family registry entry added
- Localized strings added
- Behavior id wired
- Spawn table entry added when needed
- Unlock threshold verified
