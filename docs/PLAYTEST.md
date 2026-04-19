# V7 Playtest Notes

Use this checklist when validating a new V7 build.

## Core Startup

- Open `index-v7.html` directly from the repository or from a static server.
- Confirm the loading screen appears.
- Confirm sprite files are requested from `assets/sprites/`.
- Confirm the game reaches the start menu without console errors.

## Menu

- Language buttons switch between English and Spanish.
- Character cards render from the registry.
- The same playable character selection appears on the game-over screen.
- Locked playable characters stay hidden until they are unlocked.
- When five or more playable characters are unlocked, the selector wraps into two rows on both the start screen and the game-over screen.
- Reset score relocks gated characters.
- Password Mode opens an in-canvas input panel and updates the saved best score immediately after a correct password.

### Password Mode Quick Check

- Open `Password Mode` from the start or game-over screen.
- Enter `v7dev`, then confirm.
- Enter a target best score such as `25`, then confirm.
- Verify the selector refreshes immediately and newly unlocked characters appear.
- Use `Reset score to 0` and confirm the extra characters disappear again.
- Enter `staticlogo` and confirm that `Static Logo` appears in the selector as a secret invincible character.

## Gameplay

- `clippy` plays correctly.
- `hoverbot` appears as obstacle content from the start of the game.
- `scribble` appears as a power-up from the start of the game and starts the carry sequence on pickup.
- `will` appears as a power-up at best `5`.
- `powerpup` appears as an obstacle at best `10`.
- `logo` appears as a power-up at best `15`.
- `dot` appears as an obstacle at best `20`.
- `motherNature` appears as a power-up at best `25`.
- `logo` appears as a power-up, orbits the player on pickup, grants 20 seconds of invincibility with glow and shield audio pulses, and blinks during the last 5 seconds.
- `motherNature` appears as a power-up, orbits the player on pickup, drops flower particles from herself and the player, slows the run by 20% for 15 seconds, and blinks during the last 5 seconds.
- `will` appears as a grayscale bust on a marble stand, occasionally changes expression frames, and starts the 15-second feather ride with auto-pilot and last-5-second blinking.
- `staticLogo` stays fixed upside down, glows, and ignores obstacle and ground crashes.
- Passing obstacles increments score.
- Crash sends the game to the game-over overlay.
- Reaching score `40` switches to the victory overlay and shows the animated full cast.

## Unlocks

- Reaching best `5` unlocks `scribble`.
- Reaching best `10` unlocks `hoverbot`.
- Reaching best `15` unlocks `will`.
- Reaching best `20` unlocks `powerpup`.
- Reaching best `25` unlocks `logo`.
- Reaching best `30` unlocks `dot`.
- Reaching best `35` unlocks `motherNature`.
- Unlock notice appears only once per family unless storage is reset.

## Persistence

- Existing `clippy_airmail_best` is still respected.
- Legacy unlock flags migrate into the V7 unlock-seen map.

## Regression Guard

- Historical files `index-v1.html` through `index-v6.html` remain unchanged.
